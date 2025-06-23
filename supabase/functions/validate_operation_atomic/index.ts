
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

    const { p_operation_id, p_validator_id, p_validation_status, p_validation_notes, p_balance_impact, p_commission_calculated } = await req.json()

    // Create validation record
    const { data: validation, error: validationError } = await supabaseClient
      .from('operation_validations')
      .insert({
        operation_id: p_operation_id,
        validator_id: p_validator_id,
        validation_status: p_validation_status,
        validation_notes: p_validation_notes,
        balance_impact: p_balance_impact,
        commission_calculated: p_commission_calculated,
        validated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (validationError) throw validationError

    // Update operation status
    const newStatus = p_validation_status === 'approved' ? 'completed' : 'rejected'
    const { error: operationError } = await supabaseClient
      .from('operations')
      .update({ 
        status: newStatus,
        validated_at: new Date().toISOString(),
        validator_id: p_validator_id,
        commission_amount: p_commission_calculated
      })
      .eq('id', p_operation_id)

    if (operationError) throw operationError

    if (p_validation_status === 'approved' && p_balance_impact !== 0) {
      // Get operation details for balance update
      const { data: operation } = await supabaseClient
        .from('operations')
        .select('initiator_id')
        .eq('id', p_operation_id)
        .single()

      if (operation) {
        // Get current balance
        const { data: profile } = await supabaseClient
          .from('profiles')
          .select('balance')
          .eq('id', operation.initiator_id)
          .single()

        const currentBalance = profile?.balance || 0
        const newBalance = Number(currentBalance) + Number(p_balance_impact)

        // Update balance
        await supabaseClient
          .from('profiles')
          .update({ balance: newBalance })
          .eq('id', operation.initiator_id)

        // Create transaction ledger entry
        await supabaseClient
          .from('transaction_ledger')
          .insert({
            user_id: operation.initiator_id,
            operation_id: p_operation_id,
            transaction_type: 'operation_validation',
            amount: p_balance_impact,
            balance_before: currentBalance,
            balance_after: newBalance,
            description: `Operation validated: ${p_validation_status}`
          })
      }
    }

    return new Response(
      JSON.stringify({ success: true, validation }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
