
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

    const { p_ticket_id, p_agent_id, p_amount, p_recharge_method, p_metadata } = await req.json()

    // Generate reference number
    const reference = `RCH-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

    // Get current balance
    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('balance')
      .eq('id', p_agent_id)
      .single()

    const currentBalance = profile?.balance || 0
    const newBalance = Number(currentBalance) + Number(p_amount)

    // Create recharge operation
    const { data: operation, error: operationError } = await supabaseClient
      .from('recharge_operations')
      .insert({
        ticket_id: p_ticket_id,
        agent_id: p_agent_id,
        amount: p_amount,
        recharge_method: p_recharge_method,
        reference_number: reference,
        balance_before: currentBalance,
        balance_after: newBalance,
        metadata: p_metadata,
        status: 'completed',
        processed_at: new Date().toISOString()
      })
      .select()
      .single()

    if (operationError) throw operationError

    // Update agent balance
    const { error: balanceError } = await supabaseClient
      .from('profiles')
      .update({ balance: newBalance })
      .eq('id', p_agent_id)

    if (balanceError) throw balanceError

    // Update ticket status
    const { error: ticketError } = await supabaseClient
      .from('request_tickets')
      .update({ 
        status: 'resolved',
        resolved_at: new Date().toISOString(),
        resolved_by_id: p_agent_id
      })
      .eq('id', p_ticket_id)

    if (ticketError) throw ticketError

    // Create transaction ledger entry
    await supabaseClient
      .from('transaction_ledger')
      .insert({
        user_id: p_agent_id,
        transaction_type: 'recharge',
        amount: p_amount,
        balance_before: currentBalance,
        balance_after: newBalance,
        description: `Recharge via ${p_recharge_method}`,
        metadata: { reference_number: reference, ticket_id: p_ticket_id }
      })

    return new Response(
      JSON.stringify({ success: true, operation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
