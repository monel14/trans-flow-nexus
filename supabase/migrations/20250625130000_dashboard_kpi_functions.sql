-- ===============================================
-- MIGRATION: Dashboard KPI Functions for Dynamic Data
-- ===============================================
-- This migration creates RPC functions for dynamic KPI calculations
-- Used by Admin and Sous-Admin dashboards

-- Function 1: get_admin_dashboard_kpis
-- ===================================
-- Returns comprehensive KPIs for Admin General Dashboard

CREATE OR REPLACE FUNCTION public.get_admin_dashboard_kpis()
RETURNS JSON AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
  v_this_month_start DATE := DATE_TRUNC('month', CURRENT_DATE);
  v_last_month_start DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month');
  v_last_month_end DATE := DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day';
  
  v_total_volume_today NUMERIC(15,2) := 0;
  v_total_volume_yesterday NUMERIC(15,2) := 0;
  v_total_operations_today INTEGER := 0;
  v_pending_operations INTEGER := 0;
  v_urgent_operations INTEGER := 0;
  v_completed_today INTEGER := 0;
  v_total_agencies INTEGER := 0;
  v_active_agencies INTEGER := 0;
  v_total_agents INTEGER := 0;
  v_total_chefs INTEGER := 0;
  v_monthly_revenue NUMERIC(15,2) := 0;
  v_growth_percentage NUMERIC(5,2) := 0;
  
  v_result JSON;
BEGIN
  -- Calculate total volume today
  SELECT COALESCE(SUM(amount), 0) INTO v_total_volume_today
  FROM public.operations
  WHERE DATE(created_at) = v_today
  AND status IN ('completed', 'pending', 'pending_validation');

  -- Calculate total volume yesterday
  SELECT COALESCE(SUM(amount), 0) INTO v_total_volume_yesterday
  FROM public.operations
  WHERE DATE(created_at) = v_yesterday
  AND status IN ('completed', 'pending', 'pending_validation');

  -- Calculate growth percentage
  IF v_total_volume_yesterday > 0 THEN
    v_growth_percentage := ((v_total_volume_today - v_total_volume_yesterday) / v_total_volume_yesterday) * 100;
  ELSE
    v_growth_percentage := CASE WHEN v_total_volume_today > 0 THEN 100 ELSE 0 END;
  END IF;

  -- Count total operations today
  SELECT COUNT(*) INTO v_total_operations_today
  FROM public.operations
  WHERE DATE(created_at) = v_today;

  -- Count pending operations (requiring validation)
  SELECT COUNT(*) INTO v_pending_operations
  FROM public.operations
  WHERE status IN ('pending', 'pending_validation');

  -- Count urgent operations (high amounts or old pending)
  SELECT COUNT(*) INTO v_urgent_operations
  FROM public.operations
  WHERE status IN ('pending', 'pending_validation')
  AND (
    amount > 500000 OR 
    created_at < NOW() - INTERVAL '24 hours'
  );

  -- Count completed operations today
  SELECT COUNT(*) INTO v_completed_today
  FROM public.operations
  WHERE DATE(created_at) = v_today
  AND status = 'completed';

  -- Count agencies
  SELECT COUNT(*) INTO v_total_agencies FROM public.agencies;
  SELECT COUNT(*) INTO v_active_agencies FROM public.agencies WHERE is_active = true;

  -- Count users by role
  SELECT COUNT(*) INTO v_total_agents
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE r.name = 'agent' AND p.is_active = true;

  SELECT COUNT(*) INTO v_total_chefs
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE r.name = 'chef_agence' AND p.is_active = true;

  -- Calculate monthly revenue (commissions)
  SELECT COALESCE(SUM(total_commission), 0) INTO v_monthly_revenue
  FROM public.commission_records
  WHERE DATE(created_at) >= v_this_month_start
  AND status IN ('earned', 'paid', 'partially_paid');

  -- Build result JSON
  v_result := json_build_object(
    'volume_today', json_build_object(
      'amount', v_total_volume_today,
      'formatted', v_total_volume_today::TEXT || ' XOF',
      'growth_percentage', v_growth_percentage,
      'growth_formatted', CASE 
        WHEN v_growth_percentage >= 0 THEN '+' || v_growth_percentage::TEXT || '%'
        ELSE v_growth_percentage::TEXT || '%'
      END
    ),
    'operations_system', json_build_object(
      'total_today', v_total_operations_today,
      'completed_today', v_completed_today,
      'pending', v_pending_operations,
      'urgent', v_urgent_operations,
      'subtitle', v_completed_today::TEXT || ' validées, ' || v_urgent_operations::TEXT || ' urgentes'
    ),
    'network_stats', json_build_object(
      'total_agencies', v_total_agencies,
      'active_agencies', v_active_agencies,
      'total_agents', v_total_agents,
      'total_chefs', v_total_chefs,
      'subtitle', v_total_agents::TEXT || ' agents, ' || v_total_chefs::TEXT || ' chefs'
    ),
    'monthly_revenue', json_build_object(
      'amount', v_monthly_revenue,
      'formatted', v_monthly_revenue::TEXT || ' XOF',
      'subtitle', 'Commissions ce mois'
    ),
    'critical_alerts', json_build_object(
      'blocked_transactions', v_urgent_operations,
      'support_requests', 0, -- TODO: Add when support system is ready
      'underperforming_agencies', 0 -- TODO: Add when analytics are ready
    )
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'error', SQLERRM,
      'code', 'KPI_CALCULATION_ERROR'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: get_sous_admin_dashboard_kpis
-- ========================================
-- Returns KPIs specific to Sous-Admin role

CREATE OR REPLACE FUNCTION public.get_sous_admin_dashboard_kpis()
RETURNS JSON AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_current_user_id UUID := auth.uid();
  
  v_pending_validation INTEGER := 0;
  v_completed_today INTEGER := 0;
  v_my_assigned INTEGER := 0;
  v_avg_processing_time NUMERIC(8,2) := 0;
  v_support_tickets_open INTEGER := 0;
  v_support_tickets_resolved_week INTEGER := 0;
  
  v_result JSON;
BEGIN
  -- Count operations pending validation (that sous-admin can see)
  SELECT COUNT(*) INTO v_pending_validation
  FROM public.operations
  WHERE status IN ('pending', 'pending_validation');

  -- Count operations completed today
  SELECT COUNT(*) INTO v_completed_today
  FROM public.operations
  WHERE DATE(validated_at) = v_today
  AND status = 'completed';

  -- Count operations assigned to current user
  SELECT COUNT(*) INTO v_my_assigned
  FROM public.operations
  WHERE validator_id = v_current_user_id
  AND status = 'pending_validation';

  -- Calculate average processing time (in minutes)
  SELECT COALESCE(AVG(EXTRACT(EPOCH FROM (validated_at - created_at))/60), 0) INTO v_avg_processing_time
  FROM public.operations
  WHERE validator_id = v_current_user_id
  AND validated_at IS NOT NULL
  AND DATE(validated_at) >= v_today - INTERVAL '7 days';

  -- Count support tickets (placeholder - will be implemented later)
  v_support_tickets_open := 8; -- Mock data for now
  v_support_tickets_resolved_week := 24; -- Mock data for now

  -- Build result JSON
  v_result := json_build_object(
    'pending_urgent', json_build_object(
      'count', v_pending_validation,
      'subtitle', 'Attente de validation'
    ),
    'completed_today', json_build_object(
      'count', v_completed_today,
      'subtitle', 'Traitées avec succès'
    ),
    'support_tickets', json_build_object(
      'open', v_support_tickets_open,
      'resolved_week', v_support_tickets_resolved_week,
      'subtitle', '5 nouveaux, 7 en cours'
    ),
    'avg_processing_time', json_build_object(
      'minutes', v_avg_processing_time,
      'formatted', v_avg_processing_time::TEXT || ' min',
      'subtitle', 'Traitement par transaction'
    ),
    'my_assignments', json_build_object(
      'count', v_my_assigned,
      'subtitle', 'Transactions assignées à moi'
    )
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'error', SQLERRM,
      'code', 'SOUS_ADMIN_KPI_ERROR'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 3: get_top_agencies_performance
-- =======================================
-- Returns top performing agencies for admin dashboard

CREATE OR REPLACE FUNCTION public.get_top_agencies_performance(p_limit INTEGER DEFAULT 5)
RETURNS JSON AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_this_month_start DATE := DATE_TRUNC('month', CURRENT_DATE);
  v_agencies_performance JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', a.id,
      'name', a.name,
      'city', a.city,
      'volume_today', COALESCE(daily_stats.volume_today, 0),
      'volume_month', COALESCE(monthly_stats.volume_month, 0),
      'operations_count', COALESCE(monthly_stats.operations_count, 0),
      'rank', ROW_NUMBER() OVER (ORDER BY COALESCE(monthly_stats.volume_month, 0) DESC)
    )
  ) INTO v_agencies_performance
  FROM public.agencies a
  LEFT JOIN (
    SELECT 
      o.agency_id,
      SUM(o.amount) as volume_today
    FROM public.operations o
    WHERE DATE(o.created_at) = v_today
    AND o.status IN ('completed', 'pending', 'pending_validation')
    GROUP BY o.agency_id
  ) daily_stats ON a.id = daily_stats.agency_id
  LEFT JOIN (
    SELECT 
      o.agency_id,
      SUM(o.amount) as volume_month,
      COUNT(*) as operations_count
    FROM public.operations o
    WHERE DATE(o.created_at) >= v_this_month_start
    AND o.status IN ('completed', 'pending', 'pending_validation')
    GROUP BY o.agency_id
  ) monthly_stats ON a.id = monthly_stats.agency_id
  WHERE a.is_active = true
  ORDER BY COALESCE(monthly_stats.volume_month, 0) DESC
  LIMIT p_limit;

  RETURN COALESCE(v_agencies_performance, '[]'::JSON);

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'error', SQLERRM,
      'code', 'AGENCIES_PERFORMANCE_ERROR'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 4: get_validation_queue_stats
-- =====================================
-- Returns detailed stats for validation queues

CREATE OR REPLACE FUNCTION public.get_validation_queue_stats()
RETURNS JSON AS $$
DECLARE
  v_current_user_id UUID := auth.uid();
  v_user_role TEXT;
  v_user_agency_id INTEGER;
  
  v_unassigned_count INTEGER := 0;
  v_my_tasks_count INTEGER := 0;
  v_all_tasks_count INTEGER := 0;
  v_urgent_count INTEGER := 0;
  v_completed_today INTEGER := 0;
  
  v_result JSON;
BEGIN
  -- Get current user role and agency
  SELECT 
    r.name,
    p.agency_id
  INTO v_user_role, v_user_agency_id
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = v_current_user_id;

  -- Count unassigned operations (available for assignment)
  SELECT COUNT(*) INTO v_unassigned_count
  FROM public.operations o
  WHERE o.status = 'pending'
  AND o.validator_id IS NULL
  AND (
    v_user_role = 'admin_general' OR 
    (v_user_role = 'sous_admin' AND o.agency_id = v_user_agency_id)
  );

  -- Count operations assigned to current user
  SELECT COUNT(*) INTO v_my_tasks_count
  FROM public.operations o
  WHERE o.validator_id = v_current_user_id
  AND o.status = 'pending_validation';

  -- Count all operations in validation queues (respecting RLS)
  SELECT COUNT(*) INTO v_all_tasks_count
  FROM public.operations o
  WHERE o.status IN ('pending', 'pending_validation')
  AND (
    v_user_role = 'admin_general' OR 
    (v_user_role = 'sous_admin' AND o.agency_id = v_user_agency_id)
  );

  -- Count urgent operations
  SELECT COUNT(*) INTO v_urgent_count
  FROM public.operations o
  WHERE o.status IN ('pending', 'pending_validation')
  AND (
    o.amount > 500000 OR 
    o.created_at < NOW() - INTERVAL '24 hours'
  )
  AND (
    v_user_role = 'admin_general' OR 
    (v_user_role = 'sous_admin' AND o.agency_id = v_user_agency_id)
  );

  -- Count completed today
  SELECT COUNT(*) INTO v_completed_today
  FROM public.operations o
  WHERE DATE(o.validated_at) = CURRENT_DATE
  AND o.status = 'completed'
  AND (
    v_user_role = 'admin_general' OR 
    (v_user_role = 'sous_admin' AND o.agency_id = v_user_agency_id)
  );

  -- Build result
  v_result := json_build_object(
    'unassigned_count', v_unassigned_count,
    'my_tasks_count', v_my_tasks_count,
    'all_tasks_count', v_all_tasks_count,
    'urgent_count', v_urgent_count,
    'completed_today', v_completed_today,
    'user_role', v_user_role,
    'user_agency_id', v_user_agency_id
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'error', SQLERRM,
      'code', 'VALIDATION_QUEUE_ERROR'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 5: assign_operation_to_user
-- ===================================
-- Assigns an operation to current user for validation

CREATE OR REPLACE FUNCTION public.assign_operation_to_user(p_operation_id UUID)
RETURNS JSON AS $$
DECLARE
  v_current_user_id UUID := auth.uid();
  v_user_role TEXT;
  v_user_agency_id INTEGER;
  v_operation RECORD;
  v_result JSON;
BEGIN
  -- Get current user info
  SELECT 
    r.name,
    p.agency_id
  INTO v_user_role, v_user_agency_id
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = v_current_user_id;

  -- Check if user has permission to validate operations
  IF v_user_role NOT IN ('admin_general', 'sous_admin') THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Insufficient permissions to assign operations',
      'code', 'PERMISSION_DENIED'
    );
  END IF;

  -- Get operation details
  SELECT * INTO v_operation
  FROM public.operations
  WHERE id = p_operation_id;

  IF NOT FOUND THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Operation not found',
      'code', 'OPERATION_NOT_FOUND'
    );
  END IF;

  -- Check if operation is assignable
  IF v_operation.status != 'pending' OR v_operation.validator_id IS NOT NULL THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Operation is not available for assignment',
      'code', 'OPERATION_NOT_ASSIGNABLE',
      'current_status', v_operation.status,
      'current_validator', v_operation.validator_id
    );
  END IF;

  -- Check agency restrictions for sous_admin
  IF v_user_role = 'sous_admin' AND v_operation.agency_id != v_user_agency_id THEN
    RETURN json_build_object(
      'success', false,
      'error', 'Cannot assign operation from different agency',
      'code', 'AGENCY_RESTRICTION'
    );
  END IF;

  -- Assign operation to user
  UPDATE public.operations
  SET 
    validator_id = v_current_user_id,
    status = 'pending_validation',
    updated_at = now()
  WHERE id = p_operation_id;

  -- Return success
  v_result := json_build_object(
    'success', true,
    'operation_id', p_operation_id,
    'validator_id', v_current_user_id,
    'new_status', 'pending_validation',
    'assigned_at', now()
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'success', false,
      'error', SQLERRM,
      'code', 'ASSIGNMENT_ERROR'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.get_admin_dashboard_kpis TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_sous_admin_dashboard_kpis TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_agencies_performance TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_validation_queue_stats TO authenticated;
GRANT EXECUTE ON FUNCTION public.assign_operation_to_user TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION public.get_admin_dashboard_kpis IS 'Returns comprehensive KPIs for Admin General Dashboard including volume, operations, network stats, and revenue';
COMMENT ON FUNCTION public.get_sous_admin_dashboard_kpis IS 'Returns KPIs specific to Sous-Admin dashboard including validation metrics and support stats';
COMMENT ON FUNCTION public.get_top_agencies_performance IS 'Returns top performing agencies by volume and operations count';
COMMENT ON FUNCTION public.get_validation_queue_stats IS 'Returns detailed statistics for validation queues with role-based filtering';
COMMENT ON FUNCTION public.assign_operation_to_user IS 'Assigns an operation to the current user for validation with proper permission checks';