
-- Script de déploiement optimisé pour les fonctions Dashboard KPIs
-- À exécuter dans l'éditeur SQL Supabase

-- Vérification préalable
DO $$
BEGIN
    RAISE NOTICE 'Déploiement des fonctions Dashboard KPIs...';
END $$;

-- ===============================================
-- MIGRATION: Chef d'Agence et Agent Dashboard KPI Functions
-- ===============================================
-- Cette migration ajoute les fonctions RPC pour les données dynamiques
-- des dashboards Chef d'Agence et Agent

-- Function 1: get_chef_agence_dashboard_kpis
-- ========================================
-- Retourne les KPIs spécifiques au Chef d'Agence (filtrés par son agence)

CREATE OR REPLACE FUNCTION public.get_chef_agence_dashboard_kpis()
RETURNS JSON AS $$
DECLARE
  v_current_user_id UUID := auth.uid();
  v_user_agency_id INTEGER;
  v_today DATE := CURRENT_DATE;
  v_this_week_start DATE := DATE_TRUNC('week', CURRENT_DATE);
  v_this_month_start DATE := DATE_TRUNC('month', CURRENT_DATE);
  
  v_chef_balance NUMERIC(15,2) := 0;
  v_agency_volume_month NUMERIC(15,2) := 0;
  v_agency_volume_today NUMERIC(15,2) := 0;
  v_agency_commissions NUMERIC(15,2) := 0;
  v_agents_count INTEGER := 0;
  v_agents_active_week INTEGER := 0;
  v_agents_performants INTEGER := 0;
  v_pending_recharges INTEGER := 0;
  v_growth_percentage NUMERIC(5,2) := 0;
  
  v_result JSON;
BEGIN
  -- Récupérer l'agence du chef connecté
  SELECT p.agency_id INTO v_user_agency_id
  FROM public.profiles p
  WHERE p.id = v_current_user_id;

  IF v_user_agency_id IS NULL THEN
    RETURN json_build_object(
      'error', 'Chef d''agence sans agence assignée',
      'code', 'NO_AGENCY_ASSIGNED'
    );
  END IF;

  -- Récupérer le solde du chef
  SELECT COALESCE(balance, 0) INTO v_chef_balance
  FROM public.profiles
  WHERE id = v_current_user_id;

  -- Calculer le volume de l'agence ce mois
  SELECT COALESCE(SUM(amount), 0) INTO v_agency_volume_month
  FROM public.operations o
  JOIN public.profiles p ON o.initiator_id = p.id
  WHERE p.agency_id = v_user_agency_id
  AND DATE(o.created_at) >= v_this_month_start
  AND o.status IN ('completed', 'pending', 'pending_validation');

  -- Calculer le volume de l'agence aujourd'hui
  SELECT COALESCE(SUM(amount), 0) INTO v_agency_volume_today
  FROM public.operations o
  JOIN public.profiles p ON o.initiator_id = p.id
  WHERE p.agency_id = v_user_agency_id
  AND DATE(o.created_at) = v_today
  AND o.status IN ('completed', 'pending', 'pending_validation');

  -- Calculer les commissions de l'agence ce mois
  SELECT COALESCE(SUM(cr.total_commission), 0) INTO v_agency_commissions
  FROM public.commission_records cr
  JOIN public.profiles p ON cr.user_id = p.id
  WHERE p.agency_id = v_user_agency_id
  AND DATE(cr.created_at) >= v_this_month_start
  AND cr.status IN ('earned', 'paid', 'partially_paid');

  -- Compter les agents de l'agence
  SELECT COUNT(*) INTO v_agents_count
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.agency_id = v_user_agency_id
  AND r.name = 'agent'
  AND p.is_active = true;

  -- Compter les agents actifs cette semaine
  SELECT COUNT(DISTINCT o.initiator_id) INTO v_agents_active_week
  FROM public.operations o
  JOIN public.profiles p ON o.initiator_id = p.id
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.agency_id = v_user_agency_id
  AND r.name = 'agent'
  AND DATE(o.created_at) >= v_this_week_start;

  -- Calculer le pourcentage d'agents performants (qui ont fait au moins 5 opérations cette semaine)
  SELECT COUNT(*) INTO v_agents_performants
  FROM (
    SELECT o.initiator_id, COUNT(*) as operations_count
    FROM public.operations o
    JOIN public.profiles p ON o.initiator_id = p.id
    WHERE p.agency_id = v_user_agency_id
    AND DATE(o.created_at) >= v_this_week_start
    GROUP BY o.initiator_id
    HAVING COUNT(*) >= 5
  ) performant_agents;

  -- Compter les demandes de recharge en attente
  SELECT COUNT(*) INTO v_pending_recharges
  FROM public.recharge_requests rr
  JOIN public.profiles p ON rr.user_id = p.id
  WHERE p.agency_id = v_user_agency_id
  AND rr.status = 'pending';

  -- Calculer la croissance (comparaison avec le mois dernier)
  DECLARE
    v_last_month_volume NUMERIC(15,2) := 0;
    v_last_month_start DATE := DATE_TRUNC('month', CURRENT_DATE - INTERVAL '1 month');
    v_last_month_end DATE := DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 day';
  BEGIN
    SELECT COALESCE(SUM(amount), 0) INTO v_last_month_volume
    FROM public.operations o
    JOIN public.profiles p ON o.initiator_id = p.id
    WHERE p.agency_id = v_user_agency_id
    AND DATE(o.created_at) >= v_last_month_start
    AND DATE(o.created_at) <= v_last_month_end
    AND o.status IN ('completed', 'pending', 'pending_validation');

    IF v_last_month_volume > 0 THEN
      v_growth_percentage := ((v_agency_volume_month - v_last_month_volume) / v_last_month_volume) * 100;
    ELSE
      v_growth_percentage := CASE WHEN v_agency_volume_month > 0 THEN 100 ELSE 0 END;
    END IF;
  END;

  -- Construire le JSON de résultat
  v_result := json_build_object(
    'chef_balance', json_build_object(
      'amount', v_chef_balance,
      'formatted', v_chef_balance::TEXT || ' XOF',
      'status', CASE 
        WHEN v_chef_balance < 100000 THEN 'low' 
        WHEN v_chef_balance < 500000 THEN 'medium'
        ELSE 'good' 
      END,
      'subtitle', CASE 
        WHEN v_chef_balance < 100000 THEN 'Solde faible - Recharge recommandée'
        ELSE 'Fonds disponibles pour recharges agents'
      END
    ),
    'agency_volume_month', json_build_object(
      'amount', v_agency_volume_month,
      'formatted', v_agency_volume_month::TEXT || ' XOF',
      'growth_percentage', v_growth_percentage,
      'growth_formatted', CASE 
        WHEN v_growth_percentage >= 0 THEN '+' || v_growth_percentage::TEXT || '%'
        ELSE v_growth_percentage::TEXT || '%'
      END,
      'subtitle', CASE 
        WHEN v_growth_percentage > 0 THEN 'En croissance vs mois dernier'
        WHEN v_growth_percentage < 0 THEN 'En baisse vs mois dernier'
        ELSE 'Stable vs mois dernier'
      END
    ),
    'agency_commissions', json_build_object(
      'amount', v_agency_commissions,
      'formatted', v_agency_commissions::TEXT || ' XOF',
      'subtitle', 'Revenus équipe ce mois'
    ),
    'agents_performance', json_build_object(
      'total_agents', v_agents_count,
      'active_week', v_agents_active_week,
      'performants', v_agents_performants,
      'performance_rate', CASE 
        WHEN v_agents_count > 0 THEN ROUND((v_agents_performants::NUMERIC / v_agents_count) * 100, 1)
        ELSE 0 
      END,
      'subtitle', v_agents_performants::TEXT || '/' || v_agents_count::TEXT || ' agents atteignent leurs objectifs'
    ),
    'pending_actions', json_build_object(
      'recharge_requests', v_pending_recharges,
      'inactive_agents', v_agents_count - v_agents_active_week,
      'subtitle', v_pending_recharges::TEXT || ' demandes de recharge en attente'
    ),
    'agency_id', v_user_agency_id
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'error', SQLERRM,
      'code', 'CHEF_AGENCE_KPI_ERROR'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 2: get_agent_dashboard_kpis
-- ===================================
-- Retourne les KPIs spécifiques à l'Agent connecté

CREATE OR REPLACE FUNCTION public.get_agent_dashboard_kpis()
RETURNS JSON AS $$
DECLARE
  v_current_user_id UUID := auth.uid();
  v_today DATE := CURRENT_DATE;
  v_this_week_start DATE := DATE_TRUNC('week', CURRENT_DATE);
  v_this_month_start DATE := DATE_TRUNC('month', CURRENT_DATE);
  
  v_agent_balance NUMERIC(15,2) := 0;
  v_operations_today INTEGER := 0;
  v_operations_completed_today INTEGER := 0;
  v_operations_pending INTEGER := 0;
  v_commissions_week NUMERIC(15,2) := 0;
  v_commissions_month NUMERIC(15,2) := 0;
  v_monthly_target NUMERIC(15,2) := 500000; -- Objectif par défaut
  v_monthly_progress NUMERIC(5,2) := 0;
  v_volume_month NUMERIC(15,2) := 0;
  
  v_result JSON;
BEGIN
  -- Récupérer le solde de l'agent
  SELECT COALESCE(balance, 0) INTO v_agent_balance
  FROM public.profiles
  WHERE id = v_current_user_id;

  -- Compter les opérations aujourd'hui
  SELECT COUNT(*) INTO v_operations_today
  FROM public.operations
  WHERE initiator_id = v_current_user_id
  AND DATE(created_at) = v_today;

  -- Compter les opérations complétées aujourd'hui
  SELECT COUNT(*) INTO v_operations_completed_today
  FROM public.operations
  WHERE initiator_id = v_current_user_id
  AND DATE(created_at) = v_today
  AND status = 'completed';

  -- Compter les opérations en attente
  SELECT COUNT(*) INTO v_operations_pending
  FROM public.operations
  WHERE initiator_id = v_current_user_id
  AND status IN ('pending', 'pending_validation');

  -- Calculer les commissions de la semaine
  SELECT COALESCE(SUM(total_commission), 0) INTO v_commissions_week
  FROM public.commission_records
  WHERE user_id = v_current_user_id
  AND DATE(created_at) >= v_this_week_start
  AND status IN ('earned', 'paid', 'partially_paid');

  -- Calculer les commissions du mois
  SELECT COALESCE(SUM(total_commission), 0) INTO v_commissions_month
  FROM public.commission_records
  WHERE user_id = v_current_user_id
  AND DATE(created_at) >= v_this_month_start
  AND status IN ('earned', 'paid', 'partially_paid');

  -- Calculer le volume du mois
  SELECT COALESCE(SUM(amount), 0) INTO v_volume_month
  FROM public.operations
  WHERE initiator_id = v_current_user_id
  AND DATE(created_at) >= v_this_month_start
  AND status IN ('completed', 'pending', 'pending_validation');

  -- Calculer la progression vers l'objectif mensuel
  IF v_monthly_target > 0 THEN
    v_monthly_progress := (v_volume_month / v_monthly_target) * 100;
  END IF;

  -- Construire le JSON de résultat
  v_result := json_build_object(
    'agent_balance', json_build_object(
      'amount', v_agent_balance,
      'formatted', v_agent_balance::TEXT || ' XOF',
      'status', CASE 
        WHEN v_agent_balance < 50000 THEN 'critical' 
        WHEN v_agent_balance < 100000 THEN 'low'
        WHEN v_agent_balance < 200000 THEN 'medium'
        ELSE 'good' 
      END,
      'subtitle', CASE 
        WHEN v_agent_balance < 100000 THEN '⚠️ Solde faible - Demande de recharge recommandée'
        ELSE '✅ Solde suffisant pour vos opérations'
      END
    ),
    'operations_today', json_build_object(
      'total', v_operations_today,
      'completed', v_operations_completed_today,
      'pending', v_operations_pending,
      'success_rate', CASE 
        WHEN v_operations_today > 0 THEN ROUND((v_operations_completed_today::NUMERIC / v_operations_today) * 100, 1)
        ELSE 0 
      END,
      'subtitle', '+' || v_operations_completed_today::TEXT || ' complétées sur ' || v_operations_today::TEXT || ' aujourd''hui'
    ),
    'commissions_week', json_build_object(
      'amount', v_commissions_week,
      'formatted', v_commissions_week::TEXT || ' XOF',
      'subtitle', 'Gains cette semaine'
    ),
    'monthly_objective', json_build_object(
      'target', v_monthly_target,
      'target_formatted', v_monthly_target::TEXT || ' XOF',
      'current_volume', v_volume_month,
      'current_formatted', v_volume_month::TEXT || ' XOF',
      'progress_percentage', LEAST(v_monthly_progress, 100),
      'progress_formatted', ROUND(v_monthly_progress, 1)::TEXT || '%',
      'remaining', GREATEST(v_monthly_target - v_volume_month, 0),
      'remaining_formatted', GREATEST(v_monthly_target - v_volume_month, 0)::TEXT || ' XOF',
      'subtitle', CASE 
        WHEN v_monthly_progress >= 100 THEN '🎉 Objectif atteint ! Félicitations'
        WHEN v_monthly_progress >= 80 THEN '💪 Presque au but ! Plus que ' || GREATEST(v_monthly_target - v_volume_month, 0)::TEXT || ' XOF'
        ELSE 'Objectif mensuel en cours - ' || ROUND(v_monthly_progress, 1)::TEXT || '% réalisé'
      END
    ),
    'performance_summary', json_build_object(
      'volume_month', v_volume_month,
      'commissions_month', v_commissions_month,
      'operations_avg_day', CASE 
        WHEN EXTRACT(DAY FROM CURRENT_DATE) > 0 THEN 
          ROUND(v_operations_today::NUMERIC / EXTRACT(DAY FROM CURRENT_DATE), 1)
        ELSE 0 
      END
    )
  );

  RETURN v_result;

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'error', SQLERRM,
      'code', 'AGENT_KPI_ERROR'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function 3: get_chef_agents_performance
-- =====================================
-- Retourne les performances des agents de l'agence du chef

CREATE OR REPLACE FUNCTION public.get_chef_agents_performance(p_limit INTEGER DEFAULT 10)
RETURNS JSON AS $$
DECLARE
  v_current_user_id UUID := auth.uid();
  v_user_agency_id INTEGER;
  v_this_week_start DATE := DATE_TRUNC('week', CURRENT_DATE);
  v_agents_performance JSON;
BEGIN
  -- Récupérer l'agence du chef connecté
  SELECT p.agency_id INTO v_user_agency_id
  FROM public.profiles p
  WHERE p.id = v_current_user_id;

  IF v_user_agency_id IS NULL THEN
    RETURN json_build_object(
      'error', 'Chef d''agence sans agence assignée',
      'code', 'NO_AGENCY_ASSIGNED'
    );
  END IF;

  -- Récupérer les performances des agents
  SELECT json_agg(
    json_build_object(
      'id', agent_stats.agent_id,
      'name', agent_stats.agent_name,
      'email', agent_stats.agent_email,
      'balance', agent_stats.balance,
      'balance_formatted', agent_stats.balance::TEXT || ' XOF',
      'operations_week', agent_stats.operations_week,
      'volume_week', agent_stats.volume_week,
      'volume_week_formatted', agent_stats.volume_week::TEXT || ' XOF',
      'commissions_week', agent_stats.commissions_week,
      'commissions_week_formatted', agent_stats.commissions_week::TEXT || ' XOF',
      'success_rate', agent_stats.success_rate,
      'performance_level', CASE 
        WHEN agent_stats.operations_week >= 10 AND agent_stats.success_rate >= 90 THEN 'excellent'
        WHEN agent_stats.operations_week >= 5 AND agent_stats.success_rate >= 80 THEN 'good'
        WHEN agent_stats.operations_week >= 3 THEN 'average'
        ELSE 'needs_attention'
      END,
      'last_activity', agent_stats.last_activity,
      'is_active_week', agent_stats.operations_week > 0
    )
    ORDER BY agent_stats.volume_week DESC
  ) INTO v_agents_performance
  FROM (
    SELECT 
      p.id as agent_id,
      p.name as agent_name,
      p.email as agent_email,
      p.balance,
      COALESCE(weekly_ops.operations_count, 0) as operations_week,
      COALESCE(weekly_ops.total_volume, 0) as volume_week,
      COALESCE(weekly_commissions.total_commission, 0) as commissions_week,
      COALESCE(weekly_ops.success_rate, 0) as success_rate,
      COALESCE(last_op.last_activity, p.updated_at) as last_activity
    FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    LEFT JOIN (
      SELECT 
        o.initiator_id,
        COUNT(*) as operations_count,
        SUM(o.amount) as total_volume,
        ROUND((COUNT(CASE WHEN o.status = 'completed' THEN 1 END)::NUMERIC / COUNT(*)) * 100, 1) as success_rate
      FROM public.operations o
      WHERE DATE(o.created_at) >= v_this_week_start
      GROUP BY o.initiator_id
    ) weekly_ops ON p.id = weekly_ops.initiator_id
    LEFT JOIN (
      SELECT 
        cr.user_id,
        SUM(cr.total_commission) as total_commission
      FROM public.commission_records cr
      WHERE DATE(cr.created_at) >= v_this_week_start
      AND cr.status IN ('earned', 'paid', 'partially_paid')
      GROUP BY cr.user_id
    ) weekly_commissions ON p.id = weekly_commissions.user_id
    LEFT JOIN (
      SELECT 
        o.initiator_id,
        MAX(o.created_at) as last_activity
      FROM public.operations o
      GROUP BY o.initiator_id
    ) last_op ON p.id = last_op.initiator_id
    WHERE p.agency_id = v_user_agency_id
    AND r.name = 'agent'
    AND p.is_active = true
  ) agent_stats
  LIMIT p_limit;

  RETURN COALESCE(v_agents_performance, '[]'::JSON);

EXCEPTION
  WHEN OTHERS THEN
    RETURN json_build_object(
      'error', SQLERRM,
      'code', 'AGENTS_PERFORMANCE_ERROR'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution permissions
GRANT EXECUTE ON FUNCTION public.get_chef_agence_dashboard_kpis TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_agent_dashboard_kpis TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_chef_agents_performance TO authenticated;

-- Add helpful comments
COMMENT ON FUNCTION public.get_chef_agence_dashboard_kpis IS 'Retourne les KPIs spécifiques au Chef d''Agence (filtrés par son agence)';
COMMENT ON FUNCTION public.get_agent_dashboard_kpis IS 'Retourne les KPIs spécifiques à l''Agent connecté (solde, commissions, objectifs)';
COMMENT ON FUNCTION public.get_chef_agents_performance IS 'Retourne les performances des agents de l''agence du chef connecté';

-- Vérification finale
DO $$
BEGIN
    RAISE NOTICE 'Déploiement terminé. Fonctions créées:';
    RAISE NOTICE '- get_chef_agence_dashboard_kpis()';
    RAISE NOTICE '- get_agent_dashboard_kpis()';
    RAISE NOTICE '- get_chef_agents_performance(p_limit)';
END $$;
