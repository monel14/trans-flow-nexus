
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

    const { p_commission_record_id, p_transfer_type, p_recipient_id, p_amount, p_transfer_method, p_transfer_data } = await req.json()

    // Generate reference number
    const reference = `CT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Create commission transfer
    const { data: transfer, error: transferError } = await supabaseClient
      .from('commission_transfers')
      .insert({
        commission_record_id: p_commission_record_id,
        transfer_type: p_transfer_type,
        recipient_id: p_recipient_id,
        amount: p_amount,
        transfer_method: p_transfer_method,
        reference_number: reference,
        transfer_data: p_transfer_data,
        status: 'completed',
        processed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (transferError) throw transferError

    // Update commission record status
    await supabaseClient
      .from('commission_records')
      .update({ 
        status: 'paid',
        paid_at: new Date().toISOString()
      })
      .eq('id', p_commission_record_id)

    // If balance credit, update recipient balance
    if (p_transfer_method === 'balance_credit') {
      const { data: profile } = await supabaseClient
        .from('profiles')
        .select('balance')
        .eq('id', p_recipient_id)
        .single()

      const currentBalance = profile?.balance || 0
      const newBalance = Number(currentBalance) + Number(p_amount)

      await supabaseClient
        .from('profiles')
        .update({ balance: newBalance })
        .eq('id', p_recipient_id)

      // Create transaction ledger entry
      await supabaseClient
        .from('transaction_ledger')
        .insert({
          user_id: p_recipient_id,
          transaction_type: 'commission_transfer',
          amount: p_amount,
          balance_before: currentBalance,
          balance_after: newBalance,
          description: `Commission transfer: ${p_transfer_type}`,
          metadata: { reference_number: reference }
        })
    }

    return new Response(
      JSON.stringify({ success: true, transfer }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
