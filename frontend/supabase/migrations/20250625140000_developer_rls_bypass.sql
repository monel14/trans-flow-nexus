-- ===============================================
-- MIGRATION: Developer RLS Bypass and Full Access
-- ===============================================
-- This migration gives developer role special permissions to bypass RLS
-- and access all data for debugging and development purposes

-- 1. Create a function to check if user is developer
-- =============================================

CREATE OR REPLACE FUNCTION public.is_developer()
RETURNS BOOLEAN AS $$
DECLARE
  user_role TEXT;
BEGIN
  -- Get current user role
  SELECT r.name INTO user_role
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid()
  AND p.is_active = true;
  
  RETURN COALESCE(user_role = 'developer', false);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Update RLS policies to allow developer bypass
-- ==============================================

-- Profiles table - allow developers to see all profiles
DROP POLICY IF EXISTS "Developers can view all profiles" ON public.profiles;
CREATE POLICY "Developers can view all profiles" ON public.profiles
  FOR SELECT USING (public.is_developer());

DROP POLICY IF EXISTS "Developers can update all profiles" ON public.profiles;
CREATE POLICY "Developers can update all profiles" ON public.profiles
  FOR UPDATE USING (public.is_developer());

-- Operations table - allow developers to see all operations
DROP POLICY IF EXISTS "Developers can view all operations" ON public.operations;
CREATE POLICY "Developers can view all operations" ON public.operations
  FOR SELECT USING (public.is_developer());

DROP POLICY IF EXISTS "Developers can update all operations" ON public.operations;
CREATE POLICY "Developers can update all operations" ON public.operations
  FOR UPDATE USING (public.is_developer());

-- Agencies table - allow developers to see all agencies
DROP POLICY IF EXISTS "Developers can view all agencies" ON public.agencies;
CREATE POLICY "Developers can view all agencies" ON public.agencies
  FOR SELECT USING (public.is_developer());

-- Commission records - allow developers to see all commissions
DROP POLICY IF EXISTS "Developers can view all commission_records" ON public.commission_records;
CREATE POLICY "Developers can view all commission_records" ON public.commission_records
  FOR SELECT USING (public.is_developer());

-- Transaction ledger - allow developers to see all transactions
DROP POLICY IF EXISTS "Developers can view all transaction_ledger" ON public.transaction_ledger;
CREATE POLICY "Developers can view all transaction_ledger" ON public.transaction_ledger
  FOR SELECT USING (public.is_developer());

-- Request tickets - allow developers to see all tickets
DROP POLICY IF EXISTS "Developers can view all request_tickets" ON public.request_tickets;
CREATE POLICY "Developers can view all request_tickets" ON public.request_tickets
  FOR SELECT USING (public.is_developer());

-- Notifications - allow developers to see all notifications
DROP POLICY IF EXISTS "Developers can view all notifications" ON public.notifications;
CREATE POLICY "Developers can view all notifications" ON public.notifications
  FOR SELECT USING (public.is_developer());

-- 3. Update dashboard KPI functions to work for developers
-- ======================================================

-- Update get_admin_dashboard_kpis to work for developers
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_kpis()
RETURNS JSON AS $$
DECLARE
  v_today DATE := CURRENT_DATE;
  v_yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
  v_this_month_start DATE := DATE_TRUNC('month', CURRENT_DATE);
  v_last_month_start DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month');
  v_last_month_end DATE := DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day';
  
  v_current_user_role TEXT;
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
  -- Check if user has permission (admin_general or developer)
  SELECT r.name INTO v_current_user_role
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid()
  AND p.is_active = true;
  
  IF v_current_user_role NOT IN ('admin_general', 'developer') THEN
    RETURN json_build_object(
      'error', 'Insufficient permissions to access admin dashboard KPIs',
      'code', 'PERMISSION_DENIED'
    );
  END IF;

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
    ),
    'user_role', v_current_user_role
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

-- Update get_validation_queue_stats to work for developers
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

  -- Check permissions
  IF v_user_role NOT IN ('admin_general', 'sous_admin', 'developer') THEN
    RETURN json_build_object(
      'error', 'Insufficient permissions to access validation queue stats',
      'code', 'PERMISSION_DENIED'
    );
  END IF;

  -- Count unassigned operations (available for assignment)
  SELECT COUNT(*) INTO v_unassigned_count
  FROM public.operations o
  WHERE o.status = 'pending'
  AND o.validator_id IS NULL
  AND (
    v_user_role IN ('admin_general', 'developer') OR 
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
    v_user_role IN ('admin_general', 'developer') OR 
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
    v_user_role IN ('admin_general', 'developer') OR 
    (v_user_role = 'sous_admin' AND o.agency_id = v_user_agency_id)
  );

  -- Count completed today
  SELECT COUNT(*) INTO v_completed_today
  FROM public.operations o
  WHERE DATE(o.validated_at) = CURRENT_DATE
  AND o.status = 'completed'
  AND (
    v_user_role IN ('admin_general', 'developer') OR 
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

-- 4. Give developer role access to all operation types management
-- ==============================================================

DROP POLICY IF EXISTS "Developers can manage operation_types" ON public.operation_types;
CREATE POLICY "Developers can manage operation_types" ON public.operation_types
  FOR ALL USING (public.is_developer());

DROP POLICY IF EXISTS "Developers can manage operation_type_fields" ON public.operation_type_fields;
CREATE POLICY "Developers can manage operation_type_fields" ON public.operation_type_fields
  FOR ALL USING (public.is_developer());

-- 5. Grant execution permissions to developer functions
-- ====================================================

GRANT EXECUTE ON FUNCTION public.is_developer TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION public.is_developer IS 'Checks if the current user has developer role - used for bypassing RLS restrictions';

-- 6. Create a developer-specific dashboard function (optional)
-- ===========================================================

CREATE OR REPLACE FUNCTION public.get_developer_debug_info()
RETURNS JSON AS $$
DECLARE
  v_result JSON;
  v_user_info JSON;
  v_table_stats JSON;
BEGIN
  -- Check if user is developer
  IF NOT public.is_developer() THEN
    RETURN json_build_object(
      'error', 'Developer access required',
      'code', 'DEVELOPER_ONLY'
    );
  END IF;

  -- Get current user info
  SELECT json_build_object(
    'id', p.id,
    'email', p.email,
    'name', p.name,
    'role', r.name,
    'agency_id', p.agency_id,
    'is_active', p.is_active
  ) INTO v_user_info
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = auth.uid();

  -- Get table statistics
  SELECT json_build_object(
    'profiles_count', (SELECT COUNT(*) FROM public.profiles),
    'operations_count', (SELECT COUNT(*) FROM public.operations),
    'agencies_count', (SELECT COUNT(*) FROM public.agencies),
    'roles_count', (SELECT COUNT(*) FROM public.roles),
    'commission_records_count', (SELECT COUNT(*) FROM public.commission_records),
    'transaction_ledger_count', (SELECT COUNT(*) FROM public.transaction_ledger),
    'request_tickets_count', (SELECT COUNT(*) FROM public.request_tickets)
  ) INTO v_table_stats;

  -- Build result
  v_result := json_build_object(
    'user_info', v_user_info,
    'table_stats', v_table_stats,
    'server_time', now(),
    'database_version', version()
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'error', SQLERRM,
      'code', 'DEBUG_INFO_ERROR'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION public.get_developer_debug_info TO authenticated;

-- Summary
-- =======
-- This migration provides:
-- 1. Developer role bypass for all RLS policies
-- 2. Full access to view and manage all data
-- 3. Updated dashboard functions to work for developers
-- 4. Debug function for developers to check system stats
-- 5. Proper permission checks in all functions