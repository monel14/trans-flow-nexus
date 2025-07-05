
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

    // Verify user has validation permissions
    const { data: userProfile, error: profileError } = await supabaseClient
      .from("profiles")
      .select(`
        role_id,
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
    if (!['admin_general', 'sous_admin'].includes(userRole)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Insufficient permissions for operation validation" 
      }), { 
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get request body
    const { 
      operation_id, 
      action, 
      notes 
    } = await req.json()

    // Validate required parameters
    if (!operation_id || !action) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Missing required parameters: operation_id, action" 
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (!['approve', 'reject'].includes(action)) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: "Invalid action. Must be 'approve' or 'reject'" 
      }), { 
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Call the PostgreSQL atomic function
    const { data: result, error: functionError } = await supabaseClient
      .rpc('validate_operation_atomic', {
        p_operation_id: operation_id,
        p_validator_id: user.id,
        p_action: action,
        p_notes: notes || null
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
