import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const { email } = await req.json()

    if (!email) {
      throw new Error('Email requis')
    }

    // Confirmer l'email de l'utilisateur
    const { data: user, error: getUserError } = await supabaseAdmin.auth.admin.getUserByEmail(email)
    
    if (getUserError) {
      throw getUserError
    }

    if (user) {
      const { data, error } = await supabaseAdmin.auth.admin.updateUserById(
        user.user.id,
        { email_confirm: true }
      )

      if (error) {
        throw error
      }

      return new Response(
        JSON.stringify({ success: true, message: `Email confirmé pour ${email}` }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      )
    } else {
      throw new Error('Utilisateur non trouvé')
    }

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      }
    )
  }
})