
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function handler(req: Request): Promise<Response> {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  const { method } = req;
  const url = new URL(req.url);
  const resource = url.searchParams.get("resource");
  const role = url.searchParams.get("role");
  const agency_filter = url.searchParams.get("agency_id");

  // Enhanced JWT authentication using Supabase Auth
  const authHeader = req.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "Unauthorized: Missing or invalid authorization header" }), { 
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const token = authHeader.replace("Bearer ", "");
  
  // Verify JWT token with Supabase
  const { data: { user }, error: authError } = await supabase.auth.getUser(token);
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized: Invalid token" }), { 
      status: 401,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  // Get current user's role to ensure they have permission for user management
  const { data: currentUserProfile, error: profileError } = await supabase
    .from("profiles")
    .select(`
      role_id,
      agency_id,
      is_active,
      roles:role_id(name)
    `)
    .eq("id", user.id)
    .single();

  if (profileError || !currentUserProfile?.is_active) {
    return new Response(JSON.stringify({ error: "User profile not found or inactive" }), { 
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  const currentUserRole = currentUserProfile.roles?.name;
  
  // Check if user has permission for user management
  if (!['admin_general', 'chef_agence'].includes(currentUserRole)) {
    return new Response(JSON.stringify({ error: "Insufficient permissions for user management" }), { 
      status: 403,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }

  if (method === "GET" && resource === "users") {
    // Use new profiles-based structure instead of user_roles
    let query = supabase
      .from("profiles")
      .select(`
        id, 
        name, 
        email, 
        first_name,
        last_name,
        phone,
        balance,
        is_active, 
        role_id, 
        agency_id,
        created_at,
        updated_at,
        roles:role_id(id, name, label),
        agencies:agency_id(id, name, city)
      `);

    // Apply role filter if provided
    if (role) {
      const { data: roleData, error: errRole } = await supabase
        .from("roles")
        .select("id")
        .eq("name", role)
        .single();
      
      if (errRole || !roleData) {
        return new Response(JSON.stringify({ error: "Role not found" }), { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }
      query = query.eq("role_id", roleData.id);
    }

    // Apply agency filter based on current user's permissions
    if (currentUserRole === 'chef_agence') {
      // Chef can only see users in their agency
      query = query.eq("agency_id", currentUserProfile.agency_id);
    } else if (agency_filter && currentUserRole === 'admin_general') {
      // Admin can filter by specific agency
      query = query.eq("agency_id", parseInt(agency_filter));
    }

    // Only include active users by default
    query = query.eq("is_active", true);

    const { data, error } = await query.order('created_at', { ascending: false });
    
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
    
    return new Response(JSON.stringify(data || []), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
    });
  }

  if (method === "POST" && resource === "users") {
    try {
      const body = await req.json();
      const { 
        email, 
        name, 
        first_name, 
        last_name, 
        phone, 
        password, 
        role_name, 
        agency_id,
        initial_balance = 0
      } = body;

      // Validate required fields
      if (!email || !name || !password || !role_name) {
        return new Response(JSON.stringify({ 
          error: "Missing required fields: email, name, password, role_name" 
        }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Validate agency restrictions for chef_agence
      if (currentUserRole === 'chef_agence') {
        if (!agency_id || agency_id !== currentUserProfile.agency_id) {
          return new Response(JSON.stringify({ 
            error: "Chef can only create users in their own agency" 
          }), { 
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
        
        // Chef can only create agents
        if (role_name !== 'agent') {
          return new Response(JSON.stringify({ 
            error: "Chef can only create agents" 
          }), { 
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      // Get role ID
      const { data: role, error: roleError } = await supabase
        .from("roles")
        .select("id")
        .eq("name", role_name)
        .single();

      if (roleError || !role) {
        return new Response(JSON.stringify({ error: "Role not found" }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Create user in Supabase Auth
      const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true, // Auto-confirm email for admin-created users
        user_metadata: { 
          name,
          first_name: first_name || '',
          last_name: last_name || '',
          created_by: user.id,
          created_via: 'admin_panel'
        },
      });

      if (authError || !newUser?.user) {
        return new Response(JSON.stringify({ 
          error: authError?.message || "Failed to create user in auth system" 
        }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Create comprehensive profile with new structure
      const { error: profileError } = await supabase
        .from("profiles")
        .insert({
          id: newUser.user.id,
          name,
          email,
          first_name: first_name || null,
          last_name: last_name || null,
          phone: phone || null,
          role_id: role.id,
          agency_id: agency_id || null,
          balance: Number(initial_balance) || 0,
          is_active: true
        });

      if (profileError) {
        // Rollback: delete the created auth user
        await supabase.auth.admin.deleteUser(newUser.user.id);
        return new Response(JSON.stringify({ 
          error: `Failed to create profile: ${profileError.message}` 
        }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Create initial transaction ledger entry if balance > 0
      if (Number(initial_balance) > 0) {
        await supabase
          .from("transaction_ledger")
          .insert({
            user_id: newUser.user.id,
            transaction_type: 'initial_credit',
            amount: Number(initial_balance),
            balance_before: 0,
            balance_after: Number(initial_balance),
            description: 'Initial balance credit',
            metadata: {
              created_by: user.id,
              creation_method: 'admin_panel'
            }
          });
      }

      return new Response(JSON.stringify({ 
        success: true,
        user_id: newUser.user.id,
        message: "User created successfully"
      }), { 
        status: 201,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({ 
        error: `Unexpected error: ${error.message}` 
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  if (method === "PATCH" && resource === "users") {
    try {
      const body = await req.json();
      const { 
        user_id, 
        is_active, 
        role_id, 
        agency_id, 
        balance_adjustment,
        adjustment_reason 
      } = body;

      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id is required" }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Verify user exists and current user has permission to modify
      const { data: targetUser, error: userError } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user_id)
        .single();

      if (userError || !targetUser) {
        return new Response(JSON.stringify({ error: "User not found" }), { 
          status: 404,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Check permissions
      if (currentUserRole === 'chef_agence') {
        if (targetUser.agency_id !== currentUserProfile.agency_id) {
          return new Response(JSON.stringify({ 
            error: "Cannot modify users outside your agency" 
          }), { 
            status: 403,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
          });
        }
      }

      // Prepare update object
      const updates: any = {};
      
      if (typeof is_active === "boolean") {
        updates.is_active = is_active;
      }
      
      if (role_id && currentUserRole === 'admin_general') {
        updates.role_id = role_id;
      }
      
      if (agency_id && currentUserRole === 'admin_general') {
        updates.agency_id = agency_id;
      }

      // Handle balance adjustment (admin only)
      if (balance_adjustment && currentUserRole === 'admin_general') {
        const newBalance = Number(targetUser.balance) + Number(balance_adjustment);
        updates.balance = newBalance;

        // Create transaction ledger entry for balance adjustment
        await supabase
          .from("transaction_ledger")
          .insert({
            user_id: user_id,
            transaction_type: balance_adjustment > 0 ? 'admin_credit' : 'admin_debit',
            amount: Number(balance_adjustment),
            balance_before: targetUser.balance,
            balance_after: newBalance,
            description: adjustment_reason || 'Admin balance adjustment',
            metadata: {
              adjusted_by: user.id,
              adjustment_reason: adjustment_reason
            }
          });
      }

      if (Object.keys(updates).length === 0) {
        return new Response(JSON.stringify({ error: "No valid updates provided" }), { 
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      // Update user profile
      const { error: updateError } = await supabase
        .from("profiles")
        .update(updates)
        .eq("id", user_id);

      if (updateError) {
        return new Response(JSON.stringify({ 
          error: `Failed to update user: ${updateError.message}` 
        }), { 
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      return new Response(JSON.stringify({ 
        success: true, 
        message: "User updated successfully" 
      }), { 
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });

    } catch (error) {
      return new Response(JSON.stringify({ 
        error: `Unexpected error: ${error.message}` 
      }), { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }

  return new Response(JSON.stringify({ error: "Endpoint not found" }), { 
    status: 404,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}

serve(handler);
