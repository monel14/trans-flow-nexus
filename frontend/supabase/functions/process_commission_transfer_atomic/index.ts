
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // Enhanced authentication
    const authHeader = req.headers.get("authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Unauthorized: Missing or invalid authorization header" 
      }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Unauthorized: Invalid token" 
      }), { 
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Verify user has commission transfer permissions
    const { data: userProfile, error: profileError } = await supabaseClient
      .from("profiles")
      .select(`
        role_id,
        agency_id,
        is_active,
        roles:role_id(name)
      `)
      .eq("id", user.id)
      .single();

    if (profileError || !userProfile?.is_active) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "User profile not found or inactive" 
      }), { 
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userRole = userProfile.roles?.name;

    // Get request body
    const { 
      commission_record_id, 
      transfer_type, 
      recipient_id 
    } = await req.json()

    // Validate required parameters
    if (!commission_record_id || !transfer_type || !recipient_id) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Missing required parameters: commission_record_id, transfer_type, recipient_id" 
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!['agent_payment', 'chef_payment', 'bulk_transfer'].includes(transfer_type)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid transfer_type. Must be 'agent_payment', 'chef_payment', or 'bulk_transfer'" 
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Check permissions based on transfer type and user role
    if (transfer_type === 'agent_payment' && userRole === 'agent') {
      // Agents can only transfer their own commissions
      if (recipient_id !== user.id) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: "Agents can only transfer commissions to themselves" 
        }), { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } else if (transfer_type === 'chef_payment' && userRole === 'chef_agence') {
      // Chefs can only transfer their own commissions
      if (recipient_id !== user.id) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: "Chef can only transfer commissions to themselves" 
        }), { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    } else if (!['admin_general', 'sous_admin'].includes(userRole)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Insufficient permissions for commission transfers" 
      }), { 
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Additional validation for chef_agence - they can only transfer commissions from their agency
    if (userRole === 'chef_agence') {
      const { data: commission, error: commissionError } = await supabaseClient
        .from('commission_records')
        .select(`
          id,
          agent_id,
          chef_agence_id,
          profiles:agent_id(agency_id)
        `)
        .eq('id', commission_record_id)
        .single();

      if (commissionError || !commission) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: "Commission record not found" 
        }), { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      if (commission.profiles?.agency_id !== userProfile.agency_id) {
        return new Response(JSON.stringify({ 
          success: false, 
          error: "Cannot transfer commissions from other agencies" 
        }), { 
          status: 403,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
    }

    // Call the PostgreSQL atomic function
    const { data: result, error: functionError } = await supabaseClient
      .rpc('process_commission_transfer_atomic', {
        p_commission_record_id: commission_record_id,
        p_transfer_type: transfer_type,
        p_recipient_id: recipient_id,
        p_processor_id: user.id
      });

    if (functionError) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: `Database function error: ${functionError.message}` 
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Return the result from the PostgreSQL function
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    return new Response(JSON.stringify({ 
      success: false, 
      error: `Unexpected error: ${error.message}` 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }, 
      status: 500 
    });
  }
})
