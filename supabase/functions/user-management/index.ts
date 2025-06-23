
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
    const body = await req.json();
    // { email, name, password, role_name, agency_id }
    const { email, name, password, role_name, agency_id } = body;
    // Vérification de la présence des données
    if (!email || !name || !password || !role_name) {
      return new Response(JSON.stringify({ error: "Champs obligatoires manquants" }), { status: 400 });
    }
    // Création de l'utilisateur dans Supabase Auth
    const { data: newUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name },
    });
    if (authError || !newUser || !newUser.user) {
      return new Response(JSON.stringify({ error: authError?.message || "Erreur création utilisateur" }), { status: 400 });
    }

    // Créer le profil utilisateur
    const { error: profileError } = await supabase.from("profiles").insert([{
      id: newUser.user.id,
      name,
      email,
    }]);
    if (profileError) {
      console.error("Erreur création profil:", profileError);
      // Continue même si le profil n'est pas créé
    }

    // Trouver role_id
    const { data: role, error: errRole } = await supabase
      .from("roles")
      .select("id")
      .eq("name", role_name)
      .maybeSingle();
    if (errRole || !role) return new Response(JSON.stringify({ error: "Rôle introuvable" }), { status: 400 });
    // Insertion user_roles
    const { error: userRoleError } = await supabase.from("user_roles").insert([{
      user_id: newUser.user.id,
      role_id: role.id,
      is_active: true,
      agency_id: agency_id ?? null,
    }]);
    if (userRoleError) {
      // On supprime l'utilisateur créé dans Auth (rollback)
      await supabase.auth.admin.deleteUser(newUser.user.id);
      return new Response(JSON.stringify({ error: userRoleError.message }), { status: 400 });
    }

    return new Response(JSON.stringify({ user_id: newUser.user.id }), { status: 201 });
  }

  if (method === "PATCH" && resource === "users") {
    // Suspendre/Activer user
    const body = await req.json();
    // { user_id, is_active }
    const { user_id, is_active } = body;
    if (!user_id || typeof is_active !== "boolean") {
      return new Response(JSON.stringify({ error: "Paramètres invalides" }), { status: 400 });
    }
    const { error: suspendError } = await supabase
      .from("user_roles")
      .update({ is_active })
      .eq("user_id", user_id);
    if (suspendError) return new Response(JSON.stringify({ error: suspendError.message }), { status: 500 });
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  }

  return new Response(JSON.stringify({ error: "Not found" }), { status: 404 });
}

serve(handler);
