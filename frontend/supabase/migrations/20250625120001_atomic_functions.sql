-- ===============================================
-- MIGRATION: Atomic PostgreSQL Functions for Phase 1
-- ===============================================
-- This migration creates the core atomic functions for:
-- 1. validate_operation_atomic
-- 2. process_recharge_atomic  
-- 3. process_commission_transfer_atomic

-- Function 1: validate_operation_atomic
-- ====================================
-- This function atomically processes operation validation:
-- - Updates operation status
-- - Debits user balance
-- - Inserts transaction ledger entry
-- - Calculates and inserts commission records

CREATE OR REPLACE FUNCTION public.validate_operation_atomic(
  p_operation_id UUID,
  p_validator_id UUID,
  p_action TEXT, -- 'approve' or 'reject'
  p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_operation RECORD;
  v_user_profile RECORD;
  v_commission_rule RECORD;
  v_agent_commission NUMERIC(15,2) := 0;
  v_chef_commission NUMERIC(15,2) := 0;
  v_total_commission NUMERIC(15,2) := 0;
  v_new_balance NUMERIC(15,2);
  v_transaction_id UUID;
  v_commission_record_id UUID;
  v_result JSON;
BEGIN
  -- Start transaction
  -- Validate input parameters
  IF p_action NOT IN ('approve', 'reject') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid action. Must be approve or reject.',
      'code', 'INVALID_ACTION'
    );
  END IF;

  -- Get operation details with user and agency info
  SELECT 
    o.*,
    p.balance as user_balance,
    p.agency_id,
    a.chef_agence_id
  INTO v_operation
  FROM public.operations o
  JOIN public.profiles p ON o.initiator_id = p.id
  LEFT JOIN public.agencies a ON p.agency_id = a.id
  WHERE o.id = p_operation_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Operation not found.',
      'code', 'OPERATION_NOT_FOUND'
    );
  END IF;

  -- Check if operation is in a valid state for validation
  IF v_operation.status NOT IN ('pending', 'pending_validation') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Operation is not in a state that can be validated.',
      'code', 'INVALID_OPERATION_STATUS',
      'current_status', v_operation.status
    );
  END IF;

  -- If approving, check if user has sufficient balance
  IF p_action = 'approve' AND v_operation.user_balance < v_operation.amount THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient balance.',
      'code', 'INSUFFICIENT_BALANCE',
      'required_amount', v_operation.amount,
      'current_balance', v_operation.user_balance
    );
  END IF;

  -- If approving, get commission rule and calculate commissions
  IF p_action = 'approve' THEN
    SELECT * INTO v_commission_rule
    FROM public.commission_rules cr
    WHERE cr.operation_type_id = v_operation.operation_type_id
    AND cr.is_active = true
    AND (cr.min_amount IS NULL OR v_operation.amount >= cr.min_amount)
    AND (cr.max_amount IS NULL OR v_operation.amount <= cr.max_amount)
    ORDER BY cr.created_at DESC
    LIMIT 1;

    IF FOUND THEN
      -- Calculate commission based on type
      CASE v_commission_rule.commission_type
        WHEN 'fixed' THEN
          v_total_commission := v_commission_rule.fixed_amount;
        WHEN 'percentage' THEN
          v_total_commission := (v_operation.amount * v_commission_rule.percentage_rate);
        WHEN 'tiered' THEN
          -- Implement tiered commission logic
          -- For now, use a simple tiered approach
          -- TODO: Implement complex tiered rules from JSONB
          v_total_commission := (v_operation.amount * COALESCE(v_commission_rule.percentage_rate, 0.02));
      END CASE;

      -- Split commission between agent and chef (80/20 split for example)
      v_agent_commission := v_total_commission * 0.8;
      v_chef_commission := v_total_commission * 0.2;
    END IF;
  END IF;

  -- Update operation status and validator
  UPDATE public.operations 
  SET 
    status = CASE 
      WHEN p_action = 'approve' THEN 'completed'
      ELSE 'rejected'
    END,
    validator_id = p_validator_id,
    validated_at = now(),
    commission_amount = CASE WHEN p_action = 'approve' THEN v_total_commission ELSE NULL END,
    completed_at = CASE WHEN p_action = 'approve' THEN now() ELSE NULL END,
    error_message = CASE WHEN p_action = 'reject' THEN p_notes ELSE NULL END,
    updated_at = now()
  WHERE id = p_operation_id;

  -- If approved, debit user balance and create transaction record
  IF p_action = 'approve' THEN
    -- Calculate new balance
    v_new_balance := v_operation.user_balance - v_operation.amount;
    
    -- Update user balance
    UPDATE public.profiles 
    SET 
      balance = v_new_balance,
      updated_at = now()
    WHERE id = v_operation.initiator_id;

    -- Insert transaction ledger entry
    INSERT INTO public.transaction_ledger (
      id,
      user_id,
      operation_id,
      transaction_type,
      amount,
      balance_before,
      balance_after,
      description,
      metadata,
      created_at
    ) VALUES (
      gen_random_uuid(),
      v_operation.initiator_id,
      p_operation_id,
      'operation_debit',
      -v_operation.amount, -- Negative for debit
      v_operation.user_balance,
      v_new_balance,
      'Operation validated and amount debited',
      json_build_object(
        'operation_type_id', v_operation.operation_type_id,
        'validator_id', p_validator_id,
        'commission_amount', v_total_commission
      ),
      now()
    ) RETURNING id INTO v_transaction_id;

    -- Insert commission record if there's a commission
    IF v_total_commission > 0 THEN
      INSERT INTO public.commission_records (
        id,
        operation_id,
        agent_id,
        chef_agence_id,
        commission_rule_id,
        agent_commission,
        chef_commission,
        total_commission,
        status,
        created_at,
        updated_at
      ) VALUES (
        gen_random_uuid(),
        p_operation_id,
        v_operation.initiator_id,
        v_operation.chef_agence_id,
        v_commission_rule.id,
        v_agent_commission,
        v_chef_commission,
        v_total_commission,
        'earned', -- Commission is earned but not yet paid
        now(),
        now()
      ) RETURNING id INTO v_commission_record_id;
    END IF;
  END IF;

  -- Create validation record
  INSERT INTO public.operation_validations (
    id,
    operation_id,
    validator_id,
    validation_status,
    validation_notes,
    balance_impact,
    commission_calculated,
    validation_data,
    validated_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    p_operation_id,
    p_validator_id,
    CASE WHEN p_action = 'approve' THEN 'approved' ELSE 'rejected' END,
    p_notes,
    CASE WHEN p_action = 'approve' THEN -v_operation.amount ELSE 0 END,
    CASE WHEN p_action = 'approve' THEN v_total_commission ELSE 0 END,
    json_build_object(
      'action', p_action,
      'original_balance', v_operation.user_balance,
      'new_balance', CASE WHEN p_action = 'approve' THEN v_new_balance ELSE v_operation.user_balance END,
      'commission_breakdown', json_build_object(
        'agent_commission', v_agent_commission,
        'chef_commission', v_chef_commission,
        'total_commission', v_total_commission
      )
    ),
    now(),
    now(),
    now()
  );

  -- Build success response
  v_result := json_build_object(
    'success', true,
    'operation_id', p_operation_id,
    'action', p_action,
    'new_status', CASE WHEN p_action = 'approve' THEN 'completed' ELSE 'rejected' END,
    'balance_impact', CASE WHEN p_action = 'approve' THEN -v_operation.amount ELSE 0 END,
    'commission_earned', CASE WHEN p_action = 'approve' THEN v_total_commission ELSE 0 END,
    'transaction_id', v_transaction_id,
    'commission_record_id', v_commission_record_id
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Return error details
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'code', 'UNEXPECTED_ERROR',
      'sqlstate', SQLSTATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: process_recharge_atomic
-- ==================================
-- This function atomically processes recharge requests:
-- - Updates request ticket status
-- - Credits agent balance  
-- - Debits chef balance (if applicable)
-- - Inserts transaction ledger entries for both parties

CREATE OR REPLACE FUNCTION public.process_recharge_atomic(
  p_ticket_id UUID,
  p_processor_id UUID,
  p_action TEXT, -- 'approve' or 'reject'
  p_notes TEXT DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_ticket RECORD;
  v_agent_profile RECORD;
  v_chef_profile RECORD;
  v_new_agent_balance NUMERIC(15,2);
  v_new_chef_balance NUMERIC(15,2);
  v_agent_transaction_id UUID;
  v_chef_transaction_id UUID;
  v_recharge_operation_id UUID;
  v_result JSON;
BEGIN
  -- Validate input parameters
  IF p_action NOT IN ('approve', 'reject') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Invalid action. Must be approve or reject.',
      'code', 'INVALID_ACTION'
    );
  END IF;

  -- Get ticket details with requester info
  SELECT 
    rt.*,
    p.balance as agent_balance,
    p.agency_id,
    a.chef_agence_id
  INTO v_ticket
  FROM public.request_tickets rt
  JOIN public.profiles p ON rt.requester_id = p.id
  LEFT JOIN public.agencies a ON p.agency_id = a.id
  WHERE rt.id = p_ticket_id
  AND rt.ticket_type = 'recharge_request';

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Recharge ticket not found.',
      'code', 'TICKET_NOT_FOUND'
    );
  END IF;

  -- Check if ticket is in a valid state for processing
  IF v_ticket.status NOT IN ('pending', 'assigned') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Ticket is not in a state that can be processed.',
      'code', 'INVALID_TICKET_STATUS',
      'current_status', v_ticket.status
    );
  END IF;

  -- Get agent profile
  SELECT * INTO v_agent_profile
  FROM public.profiles
  WHERE id = v_ticket.requester_id;

  -- Get chef profile if applicable (for chef requests, the chef agence will debit their own balance)
  IF v_ticket.chef_agence_id IS NOT NULL THEN
    SELECT * INTO v_chef_profile
    FROM public.profiles
    WHERE id = v_ticket.chef_agence_id;
    
    -- Check if chef has sufficient balance for recharge
    IF p_action = 'approve' AND v_chef_profile.balance < v_ticket.requested_amount THEN
      RETURN json_build_object(
        'success', false,
        'error', 'Chef has insufficient balance to process recharge.',
        'code', 'CHEF_INSUFFICIENT_BALANCE',
        'required_amount', v_ticket.requested_amount,
        'chef_balance', v_chef_profile.balance
      );
    END IF;
  END IF;

  -- Update ticket status
  UPDATE public.request_tickets 
  SET 
    status = CASE 
      WHEN p_action = 'approve' THEN 'resolved'
      ELSE 'rejected'
    END,
    assigned_to_id = p_processor_id,
    resolved_by_id = p_processor_id,
    resolved_at = now(),
    resolution_notes = p_notes,
    updated_at = now()
  WHERE id = p_ticket_id;

  -- If approved, process the recharge
  IF p_action = 'approve' THEN
    -- Calculate new agent balance
    v_new_agent_balance := v_agent_profile.balance + v_ticket.requested_amount;
    
    -- Update agent balance
    UPDATE public.profiles 
    SET 
      balance = v_new_agent_balance,
      updated_at = now()
    WHERE id = v_ticket.requester_id;

    -- Insert agent transaction ledger entry (credit)
    INSERT INTO public.transaction_ledger (
      id,
      user_id,
      transaction_type,
      amount,
      balance_before,
      balance_after,
      description,
      metadata,
      created_at
    ) VALUES (
      gen_random_uuid(),
      v_ticket.requester_id,
      'recharge_credit',
      v_ticket.requested_amount, -- Positive for credit
      v_agent_profile.balance,
      v_new_agent_balance,
      'Account recharged',
      json_build_object(
        'ticket_id', p_ticket_id,
        'processor_id', p_processor_id,
        'recharge_method', 'admin_approval'
      ),
      now()
    ) RETURNING id INTO v_agent_transaction_id;

    -- If chef is involved, debit chef balance
    IF v_chef_profile.id IS NOT NULL THEN
      v_new_chef_balance := v_chef_profile.balance - v_ticket.requested_amount;
      
      -- Update chef balance
      UPDATE public.profiles 
      SET 
        balance = v_new_chef_balance,
        updated_at = now()
      WHERE id = v_chef_profile.id;

      -- Insert chef transaction ledger entry (debit)
      INSERT INTO public.transaction_ledger (
        id,
        user_id,
        transaction_type,
        amount,
        balance_before,
        balance_after,
        description,
        metadata,
        created_at
      ) VALUES (
        gen_random_uuid(),
        v_chef_profile.id,
        'recharge_transfer_debit',
        -v_ticket.requested_amount, -- Negative for debit
        v_chef_profile.balance,
        v_new_chef_balance,
        'Agent recharge transfer',
        json_build_object(
          'ticket_id', p_ticket_id,
          'agent_id', v_ticket.requester_id,
          'processor_id', p_processor_id
        ),
        now()
      ) RETURNING id INTO v_chef_transaction_id;
    END IF;

    -- Create recharge operation record
    INSERT INTO public.recharge_operations (
      id,
      ticket_id,
      agent_id,
      amount,
      recharge_method,
      reference_number,
      status,
      balance_before,
      balance_after,
      processed_at,
      metadata,
      created_at,
      updated_at
    ) VALUES (
      gen_random_uuid(),
      p_ticket_id,
      v_ticket.requester_id,
      v_ticket.requested_amount,
      'admin_approval',
      'RCH-' || extract(epoch from now())::bigint || '-' || substr(v_ticket.requester_id::text, 1, 8),
      'completed',
      v_agent_profile.balance,
      v_new_agent_balance,
      now(),
      json_build_object(
        'processor_id', p_processor_id,
        'chef_balance_impacted', v_chef_profile.id IS NOT NULL,
        'chef_new_balance', v_new_chef_balance
      ),
      now(),
      now()
    ) RETURNING id INTO v_recharge_operation_id;
  END IF;

  -- Build success response
  v_result := json_build_object(
    'success', true,
    'ticket_id', p_ticket_id,
    'action', p_action,
    'new_status', CASE WHEN p_action = 'approve' THEN 'resolved' ELSE 'rejected' END,
    'amount_processed', CASE WHEN p_action = 'approve' THEN v_ticket.requested_amount ELSE 0 END,
    'agent_new_balance', CASE WHEN p_action = 'approve' THEN v_new_agent_balance ELSE v_agent_profile.balance END,
    'chef_balance_impacted', v_chef_profile.id IS NOT NULL,
    'chef_new_balance', v_new_chef_balance,
    'agent_transaction_id', v_agent_transaction_id,
    'chef_transaction_id', v_chef_transaction_id,
    'recharge_operation_id', v_recharge_operation_id
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Return error details
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'code', 'UNEXPECTED_ERROR',
      'sqlstate', SQLSTATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 3: process_commission_transfer_atomic
-- =============================================
-- This function atomically processes commission transfers:
-- - Updates commission record status
-- - Credits chef balance
-- - Inserts transaction ledger entry

CREATE OR REPLACE FUNCTION public.process_commission_transfer_atomic(
  p_commission_record_id UUID,
  p_transfer_type TEXT, -- 'agent_payment', 'chef_payment', 'bulk_transfer'
  p_recipient_id UUID,
  p_processor_id UUID DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
  v_commission_record RECORD;
  v_recipient_profile RECORD;
  v_transfer_amount NUMERIC(15,2);
  v_new_balance NUMERIC(15,2);
  v_transaction_id UUID;
  v_transfer_id UUID;
  v_result JSON;
BEGIN
  -- Get commission record details
  SELECT * INTO v_commission_record
  FROM public.commission_records
  WHERE id = p_commission_record_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Commission record not found.',
      'code', 'COMMISSION_NOT_FOUND'
    );
  END IF;

  -- Check if commission is in a valid state for transfer
  IF v_commission_record.status NOT IN ('earned', 'pending_transfer') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Commission is not in a state that can be transferred.',
      'code', 'INVALID_COMMISSION_STATUS',
      'current_status', v_commission_record.status
    );
  END IF;

  -- Get recipient profile
  SELECT * INTO v_recipient_profile
  FROM public.profiles
  WHERE id = p_recipient_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Recipient not found.',
      'code', 'RECIPIENT_NOT_FOUND'
    );
  END IF;

  -- Determine transfer amount based on type and recipient
  CASE p_transfer_type
    WHEN 'agent_payment' THEN
      IF p_recipient_id != v_commission_record.agent_id THEN
        RETURN json_build_object(
          'success', false,
          'error', 'Recipient must be the agent for agent payment.',
          'code', 'INVALID_RECIPIENT_FOR_AGENT_PAYMENT'
        );
      END IF;
      v_transfer_amount := v_commission_record.agent_commission;
    WHEN 'chef_payment' THEN
      IF p_recipient_id != v_commission_record.chef_agence_id THEN
        RETURN json_build_object(
          'success', false,
          'error', 'Recipient must be the chef agence for chef payment.',
          'code', 'INVALID_RECIPIENT_FOR_CHEF_PAYMENT'
        );
      END IF;
      v_transfer_amount := v_commission_record.chef_commission;
    WHEN 'bulk_transfer' THEN
      -- For bulk transfer, transfer the full commission to specified recipient
      v_transfer_amount := v_commission_record.total_commission;
    ELSE
      RETURN json_build_object(
        'success', false,
        'error', 'Invalid transfer type.',
        'code', 'INVALID_TRANSFER_TYPE'
      );
  END CASE;

  -- Calculate new recipient balance
  v_new_balance := v_recipient_profile.balance + v_transfer_amount;

  -- Update recipient balance
  UPDATE public.profiles 
  SET 
    balance = v_new_balance,
    updated_at = now()
  WHERE id = p_recipient_id;

  -- Insert transaction ledger entry
  INSERT INTO public.transaction_ledger (
    id,
    user_id,
    transaction_type,
    amount,
    balance_before,
    balance_after,
    description,
    metadata,
    created_at
  ) VALUES (
    gen_random_uuid(),
    p_recipient_id,
    'commission_transfer_credit',
    v_transfer_amount, -- Positive for credit
    v_recipient_profile.balance,
    v_new_balance,
    'Commission payment received',
    json_build_object(
      'commission_record_id', p_commission_record_id,
      'transfer_type', p_transfer_type,
      'processor_id', p_processor_id,
      'operation_id', v_commission_record.operation_id
    ),
    now()
  ) RETURNING id INTO v_transaction_id;

  -- Create commission transfer record
  INSERT INTO public.commission_transfers (
    id,
    commission_record_id,
    transfer_type,
    recipient_id,
    amount,
    transfer_method,
    reference_number,
    status,
    transfer_data,
    processed_at,
    created_at,
    updated_at
  ) VALUES (
    gen_random_uuid(),
    p_commission_record_id,
    p_transfer_type,
    p_recipient_id,
    v_transfer_amount,
    'balance_credit',
    'COM-' || extract(epoch from now())::bigint || '-' || substr(p_recipient_id::text, 1, 8),
    'completed',
    json_build_object(
      'processor_id', p_processor_id,
      'transaction_id', v_transaction_id,
      'original_balance', v_recipient_profile.balance,
      'new_balance', v_new_balance
    ),
    now(),
    now(),
    now()
  ) RETURNING id INTO v_transfer_id;

  -- Update commission record status
  UPDATE public.commission_records 
  SET 
    status = CASE 
      WHEN p_transfer_type = 'bulk_transfer' THEN 'paid'
      WHEN p_transfer_type = 'agent_payment' AND chef_commission = 0 THEN 'paid'
      WHEN p_transfer_type = 'chef_payment' AND agent_commission = 0 THEN 'paid'
      ELSE 'partially_paid'
    END,
    paid_at = CASE 
      WHEN p_transfer_type = 'bulk_transfer' OR 
           (p_transfer_type = 'agent_payment' AND chef_commission = 0) OR
           (p_transfer_type = 'chef_payment' AND agent_commission = 0) 
      THEN now()
      ELSE paid_at
    END,
    updated_at = now()
  WHERE id = p_commission_record_id;

  -- Build success response
  v_result := json_build_object(
    'success', true,
    'commission_record_id', p_commission_record_id,
    'transfer_type', p_transfer_type,
    'recipient_id', p_recipient_id,
    'amount_transferred', v_transfer_amount,
    'recipient_new_balance', v_new_balance,
    'transaction_id', v_transaction_id,
    'transfer_id', v_transfer_id,
    'commission_status', CASE 
      WHEN p_transfer_type = 'bulk_transfer' THEN 'paid'
      WHEN p_transfer_type = 'agent_payment' AND v_commission_record.chef_commission = 0 THEN 'paid'
      WHEN p_transfer_type = 'chef_payment' AND v_commission_record.agent_commission = 0 THEN 'paid'
      ELSE 'partially_paid'
    END
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    -- Return error details
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'code', 'UNEXPECTED_ERROR',
      'sqlstate', SQLSTATE
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.validate_operation_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_recharge_atomic TO authenticated;
GRANT EXECUTE ON FUNCTION public.process_commission_transfer_atomic TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION public.validate_operation_atomic IS 'Atomically validates an operation, updates balances, creates transaction records, and calculates commissions';
COMMENT ON FUNCTION public.process_recharge_atomic IS 'Atomically processes recharge requests, updating balances and creating transaction records';
COMMENT ON FUNCTION public.process_commission_transfer_atomic IS 'Atomically transfers commissions to recipients and updates all related records';