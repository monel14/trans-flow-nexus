
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

// Utilisation du client Supabase pour functions Deno
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

async function handler(req: Request): Promise<Response> {
  const { method } = req;
  const url = new URL(req.url);
  const resource = url.searchParams.get("resource");
  const role = url.searchParams.get("role");

  // Authentification rudimentaire par header (à renforcer!)
  const auth = req.headers.get("authorization");
  if (!auth || !auth.startsWith("Bearer ")) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401 });
  }

  if (method === "GET" && resource === "users") {
    let query = supabase
      .from("user_roles")
      .select(`
        id, user_id, role_id, is_active, agency_id, 
        roles:role_id(name,label),
        agencies:agency_id(name)
      `);

    if (role) {
      // On cherche l'id du rôle
      const { data: roles, error: errRole } = await supabase
        .from("roles")
        .select("id")
        .eq("name", role)
        .maybeSingle();
      if (errRole || !roles) return new Response(JSON.stringify({ error: "Rôle introuvable" }), { status: 404 });
      query = query.eq("role_id", roles.id);
    }
    const { data, error } = await query;
    if (error) return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    return new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
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
