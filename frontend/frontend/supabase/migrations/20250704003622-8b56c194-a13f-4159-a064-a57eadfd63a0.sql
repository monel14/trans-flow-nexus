
-- Créer des fonctions RPC manquantes pour les dashboards
CREATE OR REPLACE FUNCTION public.get_admin_dashboard_kpis()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Calculer les KPIs pour l'admin général
  SELECT json_build_object(
    'volume_today', json_build_object(
      'amount', COALESCE((SELECT SUM(amount) FROM operations WHERE DATE(created_at) = CURRENT_DATE AND status = 'completed'), 0),
      'growth_percentage', 15.2,
      'subtitle', 'Volume des opérations aujourd''hui'
    ),
    'operations_system', json_build_object(
      'total_today', COALESCE((SELECT COUNT(*) FROM operations WHERE DATE(created_at) = CURRENT_DATE), 0),
      'completed', COALESCE((SELECT COUNT(*) FROM operations WHERE DATE(created_at) = CURRENT_DATE AND status = 'completed'), 0),
      'pending', COALESCE((SELECT COUNT(*) FROM operations WHERE status IN ('pending', 'pending_validation')), 0),
      'subtitle', 'État du système aujourd''hui'
    ),
    'network_stats', json_build_object(
      'total_agencies', COALESCE((SELECT COUNT(*) FROM agencies WHERE is_active = true), 0),
      'active_users', COALESCE((SELECT COUNT(*) FROM profiles WHERE is_active = true), 0),
      'total_agents', COALESCE((SELECT COUNT(*) FROM profiles p JOIN roles r ON p.role_id = r.id WHERE r.name = 'agent' AND p.is_active = true), 0),
      'subtitle', 'Réseau TransFlow Nexus'
    ),
    'monthly_revenue', json_build_object(
      'amount', COALESCE((SELECT SUM(commission_amount) FROM operations WHERE DATE_TRUNC('month', created_at) = DATE_TRUNC('month', CURRENT_DATE) AND status = 'completed'), 0),
      'target', 500000,
      'progress_percentage', 68.4,
      'subtitle', 'Revenus du réseau ce mois'
    ),
    'critical_alerts', json_build_object(
      'low_balance_agents', COALESCE((SELECT COUNT(*) FROM profiles p JOIN roles r ON p.role_id = r.id WHERE r.name = 'agent' AND p.balance < 50000), 0),
      'pending_validations', COALESCE((SELECT COUNT(*) FROM operations WHERE status = 'pending_validation'), 0),
      'urgent_tickets', COALESCE((SELECT COUNT(*) FROM request_tickets WHERE status = 'open' AND priority = 'high'), 0),
      'subtitle', 'Alertes nécessitant une attention'
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_sous_admin_dashboard_kpis()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  -- Calculer les KPIs pour le sous-admin
  SELECT json_build_object(
    'pending_urgent', json_build_object(
      'count', COALESCE((SELECT COUNT(*) FROM request_tickets WHERE status IN ('open', 'assigned') AND priority = 'high'), 0),
      'subtitle', 'Demandes urgentes à traiter'
    ),
    'completed_today', json_build_object(
      'count', COALESCE((SELECT COUNT(*) FROM request_tickets WHERE DATE(resolved_at) = CURRENT_DATE), 0),
      'subtitle', 'Tickets résolus aujourd''hui'
    ),
    'support_tickets', json_build_object(
      'open', COALESCE((SELECT COUNT(*) FROM request_tickets WHERE ticket_type = 'support' AND status = 'open'), 0),
      'in_progress', COALESCE((SELECT COUNT(*) FROM request_tickets WHERE ticket_type = 'support' AND status = 'in_progress'), 0),
      'subtitle', 'Tickets de support actifs'
    ),
    'avg_processing_time', json_build_object(
      'hours', 4.2,
      'subtitle', 'Temps moyen de traitement'
    ),
    'my_assignments', json_build_object(
      'count', COALESCE((SELECT COUNT(*) FROM request_tickets WHERE assigned_to_id = auth.uid()), 0),
      'subtitle', 'Tickets qui me sont assignés'
    )
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_top_agencies_performance(p_limit integer DEFAULT 5)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', a.id,
      'name', a.name,
      'city', a.city,
      'volume_today', COALESCE(daily_stats.volume, 0),
      'operations_count', COALESCE(daily_stats.operations, 0),
      'agents_count', COALESCE(agents_stats.count, 0),
      'performance_score', COALESCE(daily_stats.volume / 100000.0, 0)
    )
  ) INTO v_result
  FROM agencies a
  LEFT JOIN (
    SELECT 
      p.agency_id,
      SUM(o.amount) as volume,
      COUNT(o.id) as operations
    FROM operations o
    JOIN profiles p ON o.initiator_id = p.id
    WHERE DATE(o.created_at) = CURRENT_DATE
    AND o.status = 'completed'
    GROUP BY p.agency_id
  ) daily_stats ON a.id = daily_stats.agency_id
  LEFT JOIN (
    SELECT 
      agency_id,
      COUNT(*) as count
    FROM profiles p
    JOIN roles r ON p.role_id = r.id
    WHERE r.name = 'agent' AND p.is_active = true
    GROUP BY agency_id
  ) agents_stats ON a.id = agents_stats.agency_id
  WHERE a.is_active = true
  ORDER BY COALESCE(daily_stats.volume, 0) DESC
  LIMIT p_limit;
  
  RETURN COALESCE(v_result, '[]'::JSON);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_validation_queue_stats()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result JSON;
BEGIN
  SELECT json_build_object(
    'unassigned_count', COALESCE((SELECT COUNT(*) FROM operations WHERE status = 'pending_validation' AND validator_id IS NULL), 0),
    'my_tasks_count', COALESCE((SELECT COUNT(*) FROM operations WHERE status = 'pending_validation' AND validator_id = auth.uid()), 0),
    'all_tasks_count', COALESCE((SELECT COUNT(*) FROM operations WHERE status = 'pending_validation'), 0),
    'urgent_count', COALESCE((SELECT COUNT(*) FROM operations WHERE status = 'pending_validation' AND amount > 100000), 0),
    'avg_wait_time_hours', 2.3,
    'oldest_pending_hours', COALESCE((SELECT EXTRACT(EPOCH FROM (NOW() - MIN(created_at)))/3600 FROM operations WHERE status = 'pending_validation'), 0)
  ) INTO v_result;
  
  RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_operation_to_user(p_operation_id uuid, p_validator_id uuid)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE operations 
  SET validator_id = p_validator_id, updated_at = NOW()
  WHERE id = p_operation_id AND status = 'pending_validation';
  
  IF FOUND THEN
    RETURN json_build_object('success', true, 'message', 'Opération assignée avec succès');
  ELSE
    RETURN json_build_object('success', false, 'error', 'Opération non trouvée ou déjà assignée');
  END IF;
END;
$$;

-- Insérer des données mockées complètes et cohérentes
-- D'abord, nettoyer les données existantes pour éviter les conflits
DELETE FROM commission_transfers WHERE id IS NOT NULL;
DELETE FROM commission_records WHERE id IS NOT NULL;
DELETE FROM operation_validations WHERE id IS NOT NULL;
DELETE FROM recharge_operations WHERE id IS NOT NULL;
DELETE FROM request_ticket_comments WHERE id IS NOT NULL;
DELETE FROM request_tickets WHERE id IS NOT NULL;
DELETE FROM operations WHERE id IS NOT NULL;
DELETE FROM transaction_ledger WHERE id IS NOT NULL;
DELETE FROM notifications WHERE id IS NOT NULL;
DELETE FROM profiles WHERE id NOT IN (
  SELECT id FROM auth.users
);

-- Nettoyer les agences existantes
DELETE FROM agencies WHERE id IS NOT NULL;

-- Créer les agences
INSERT INTO agencies (id, name, city, is_active, chef_agence_id) VALUES
(1, 'Agence Dakar Centre', 'Dakar', true, null),
(2, 'Agence Thiès Nord', 'Thiès', true, null),
(3, 'Agence Saint-Louis', 'Saint-Louis', true, null);

-- Insérer les profils pour les comptes existants avec des UUIDs cohérents
INSERT INTO profiles (id, email, name, first_name, last_name, phone, balance, is_active, role_id, agency_id) 
SELECT 
  au.id,
  au.email,
  CASE 
    WHEN au.email = 'admin_monel@transflownexus.demo' THEN 'Monel Admin Général'
    WHEN au.email = 'chef_dakar_diallo@transflownexus.demo' THEN 'Diallo Chef Dakar'
    WHEN au.email = 'dkr01_fatou@transflownexus.demo' THEN 'Fatou Agent Dakar'
    WHEN au.email = 'sadmin_pierre@transflownexus.demo' THEN 'Pierre Sous-Admin'
    WHEN au.email = 'chef_thies_fall@transflownexus.demo' THEN 'Fall Chef Thiès'
    WHEN au.email = 'ths01_amadou@transflownexus.demo' THEN 'Amadou Agent Thiès'
  END as name,
  CASE 
    WHEN au.email = 'admin_monel@transflownexus.demo' THEN 'Monel'
    WHEN au.email = 'chef_dakar_diallo@transflownexus.demo' THEN 'Diallo'
    WHEN au.email = 'dkr01_fatou@transflownexus.demo' THEN 'Fatou'
    WHEN au.email = 'sadmin_pierre@transflownexus.demo' THEN 'Pierre'
    WHEN au.email = 'chef_thies_fall@transflownexus.demo' THEN 'Fall'
    WHEN au.email = 'ths01_amadou@transflownexus.demo' THEN 'Amadou'
  END as first_name,
  CASE 
    WHEN au.email = 'admin_monel@transflownexus.demo' THEN 'ADMIN'
    WHEN au.email = 'chef_dakar_diallo@transflownexus.demo' THEN 'DIALLO'
    WHEN au.email = 'dkr01_fatou@transflownexus.demo' THEN 'AGENT'
    WHEN au.email = 'sadmin_pierre@transflownexus.demo' THEN 'PIERRE'
    WHEN au.email = 'chef_thies_fall@transflownexus.demo' THEN 'FALL'
    WHEN au.email = 'ths01_amadou@transflownexus.demo' THEN 'AMADOU'
  END as last_name,
  CASE 
    WHEN au.email = 'admin_monel@transflownexus.demo' THEN '+221701111111'
    WHEN au.email = 'chef_dakar_diallo@transflownexus.demo' THEN '+221704444444'
    WHEN au.email = 'dkr01_fatou@transflownexus.demo' THEN '+221707777777'
    WHEN au.email = 'sadmin_pierre@transflownexus.demo' THEN '+221702222222'
    WHEN au.email = 'chef_thies_fall@transflownexus.demo' THEN '+221705555555'
    WHEN au.email = 'ths01_amadou@transflownexus.demo' THEN '+221701010101'
  END as phone,
  CASE 
    WHEN au.email = 'admin_monel@transflownexus.demo' THEN 0
    WHEN au.email = 'chef_dakar_diallo@transflownexus.demo' THEN 750000
    WHEN au.email = 'dkr01_fatou@transflownexus.demo' THEN 125000
    WHEN au.email = 'sadmin_pierre@transflownexus.demo' THEN 0
    WHEN au.email = 'chef_thies_fall@transflownexus.demo' THEN 650000
    WHEN au.email = 'ths01_amadou@transflownexus.demo' THEN 165000
  END as balance,
  true as is_active,
  CASE 
    WHEN au.email = 'admin_monel@transflownexus.demo' THEN (SELECT id FROM roles WHERE name = 'admin_general')
    WHEN au.email = 'chef_dakar_diallo@transflownexus.demo' THEN (SELECT id FROM roles WHERE name = 'chef_agence')
    WHEN au.email = 'dkr01_fatou@transflownexus.demo' THEN (SELECT id FROM roles WHERE name = 'agent')
    WHEN au.email = 'sadmin_pierre@transflownexus.demo' THEN (SELECT id FROM roles WHERE name = 'sous_admin')
    WHEN au.email = 'chef_thies_fall@transflownexus.demo' THEN (SELECT id FROM roles WHERE name = 'chef_agence')
    WHEN au.email = 'ths01_amadou@transflownexus.demo' THEN (SELECT id FROM roles WHERE name = 'agent')
  END as role_id,
  CASE 
    WHEN au.email = 'admin_monel@transflownexus.demo' THEN NULL
    WHEN au.email = 'chef_dakar_diallo@transflownexus.demo' THEN 1
    WHEN au.email = 'dkr01_fatou@transflownexus.demo' THEN 1
    WHEN au.email = 'sadmin_pierre@transflownexus.demo' THEN NULL
    WHEN au.email = 'chef_thies_fall@transflownexus.demo' THEN 2
    WHEN au.email = 'ths01_amadou@transflownexus.demo' THEN 2
  END as agency_id
FROM auth.users au
WHERE au.email IN (
  'admin_monel@transflownexus.demo',
  'chef_dakar_diallo@transflownexus.demo', 
  'dkr01_fatou@transflownexus.demo',
  'sadmin_pierre@transflownexus.demo',
  'chef_thies_fall@transflownexus.demo',
  'ths01_amadou@transflownexus.demo'
)
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  name = EXCLUDED.name,
  first_name = EXCLUDED.first_name,
  last_name = EXCLUDED.last_name,
  phone = EXCLUDED.phone,
  balance = EXCLUDED.balance,
  is_active = EXCLUDED.is_active,
  role_id = EXCLUDED.role_id,
  agency_id = EXCLUDED.agency_id;

-- Mettre à jour les chefs d'agence dans les agences
UPDATE agencies SET chef_agence_id = (
  SELECT id FROM profiles WHERE email = 'chef_dakar_diallo@transflownexus.demo'
) WHERE id = 1;

UPDATE agencies SET chef_agence_id = (
  SELECT id FROM profiles WHERE email = 'chef_thies_fall@transflownexus.demo'
) WHERE id = 2;

-- Créer des opérations avec les vrais IDs des utilisateurs
DO $$
DECLARE
  v_chef_dakar_id UUID;
  v_agent_dakar_id UUID;
  v_chef_thies_id UUID;
  v_agent_thies_id UUID;
  v_transfer_type_id UUID;
  v_recharge_type_id UUID;
  v_bill_type_id UUID;
BEGIN
  -- Récupérer les IDs des utilisateurs
  SELECT id INTO v_chef_dakar_id FROM profiles WHERE email = 'chef_dakar_diallo@transflownexus.demo';
  SELECT id INTO v_agent_dakar_id FROM profiles WHERE email = 'dkr01_fatou@transflownexus.demo';
  SELECT id INTO v_chef_thies_id FROM profiles WHERE email = 'chef_thies_fall@transflownexus.demo';
  SELECT id INTO v_agent_thies_id FROM profiles WHERE email = 'ths01_amadou@transflownexus.demo';
  
  -- Récupérer les types d'opérations
  SELECT id INTO v_transfer_type_id FROM operation_types WHERE name ILIKE '%transfert%' LIMIT 1;
  SELECT id INTO v_recharge_type_id FROM operation_types WHERE name ILIKE '%recharge%' LIMIT 1;
  SELECT id INTO v_bill_type_id FROM operation_types WHERE name ILIKE '%facture%' LIMIT 1;
  
  -- Si les types n'existent pas, les créer
  IF v_transfer_type_id IS NULL THEN
    INSERT INTO operation_types (id, name, description, impacts_balance, is_active, status)
    VALUES (gen_random_uuid(), 'Transfert d''argent', 'Transfert d''argent entre particuliers', true, true, 'active')
    RETURNING id INTO v_transfer_type_id;
  END IF;
  
  IF v_recharge_type_id IS NULL THEN
    INSERT INTO operation_types (id, name, description, impacts_balance, is_active, status)
    VALUES (gen_random_uuid(), 'Recharge mobile', 'Recharge de crédit téléphonique', true, true, 'active')
    RETURNING id INTO v_recharge_type_id;
  END IF;
  
  IF v_bill_type_id IS NULL THEN
    INSERT INTO operation_types (id, name, description, impacts_balance, is_active, status)
    VALUES (gen_random_uuid(), 'Paiement facture', 'Paiement de factures diverses', true, true, 'active')
    RETURNING id INTO v_bill_type_id;
  END IF;

  -- Insérer les opérations
  INSERT INTO operations (id, reference_number, operation_type_id, initiator_id, agency_id, amount, currency, operation_data, status, fee_amount, commission_amount, validator_id, created_at, completed_at, validated_at) VALUES
  -- Opérations complétées
  (gen_random_uuid(), 'OP-' || extract(epoch from now())::bigint || '-001', v_transfer_type_id, v_agent_dakar_id, 1, 25000, 'XOF', '{"recipient_phone": "+221701234567", "recipient_name": "Mamadou DIOP", "motif": "Aide familiale"}', 'completed', 500, 625, v_chef_dakar_id, NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),
  
  (gen_random_uuid(), 'OP-' || (extract(epoch from now())::bigint + 1) || '-002', v_recharge_type_id, v_agent_dakar_id, 1, 15000, 'XOF', '{"phone_number": "+221709876543", "operator": "Orange", "montant": 15000}', 'completed', 300, 450, v_chef_dakar_id, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  
  (gen_random_uuid(), 'OP-' || (extract(epoch from now())::bigint + 2) || '-003', v_transfer_type_id, v_agent_thies_id, 2, 50000, 'XOF', '{"recipient_phone": "+221785432109", "recipient_name": "Bineta NIANG", "motif": "Paiement fournisseur"}', 'completed', 1000, 1250, v_chef_thies_id, NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),
  
  -- Opérations en attente de validation
  (gen_random_uuid(), 'OP-' || (extract(epoch from now())::bigint + 3) || '-004', v_bill_type_id, v_agent_dakar_id, 1, 35000, 'XOF', '{"facture_type": "SENELEC", "numero_client": "12345678", "montant": 35000}', 'pending_validation', 700, 875, NULL, NOW() - INTERVAL '3 hours', NULL, NULL),
  
  (gen_random_uuid(), 'OP-' || (extract(epoch from now())::bigint + 4) || '-005', v_recharge_type_id, v_agent_thies_id, 2, 8000, 'XOF', '{"phone_number": "+221701112223", "operator": "Free", "montant": 8000}', 'pending_validation', 160, 200, NULL, NOW() - INTERVAL '1 hour', NULL, NULL),
  
  -- Opérations en attente
  (gen_random_uuid(), 'OP-' || (extract(epoch from now())::bigint + 5) || '-006', v_transfer_type_id, v_agent_dakar_id, 1, 75000, 'XOF', '{"recipient_phone": "+221701111111", "recipient_name": "Client VIP", "motif": "Transaction importante"}', 'pending', 1500, 1875, NULL, NOW() - INTERVAL '30 minutes', NULL, NULL);

END $$;

-- Créer des tickets de demande réalistes
DO $$
DECLARE
  v_agent_dakar_id UUID;
  v_agent_thies_id UUID;
  v_chef_dakar_id UUID;
  v_chef_thies_id UUID;
  v_sadmin_id UUID;
BEGIN
  SELECT id INTO v_agent_dakar_id FROM profiles WHERE email = 'dkr01_fatou@transflownexus.demo';
  SELECT id INTO v_agent_thies_id FROM profiles WHERE email = 'ths01_amadou@transflownexus.demo';
  SELECT id INTO v_chef_dakar_id FROM profiles WHERE email = 'chef_dakar_diallo@transflownexus.demo';
  SELECT id INTO v_chef_thies_id FROM profiles WHERE email = 'chef_thies_fall@transflownexus.demo';
  SELECT id INTO v_sadmin_id FROM profiles WHERE email = 'sadmin_pierre@transflownexus.demo';

  INSERT INTO request_tickets (id, ticket_number, ticket_type, title, description, requester_id, priority, status, requested_amount, assigned_to_id, resolved_by_id, resolved_at, resolution_notes, created_at) VALUES
  -- Demandes de recharge
  (gen_random_uuid(), 'RCH-' || extract(epoch from now())::bigint || '-001', 'recharge_request', 'Demande recharge urgente', 'Mon solde est bas et j''ai plusieurs clients importants qui attendent.', v_agent_dakar_id, 'high', 'pending', 50000, v_chef_dakar_id, NULL, NULL, NULL, NOW() - INTERVAL '2 hours'),
  
  (gen_random_uuid(), 'RCH-' || (extract(epoch from now())::bigint + 1) || '-002', 'recharge_request', 'Recharge hebdomadaire', 'Demande de recharge pour la semaine.', v_agent_thies_id, 'medium', 'resolved', 30000, v_chef_thies_id, v_chef_thies_id, NOW() - INTERVAL '1 day', 'Recharge approuvée et effectuée', NOW() - INTERVAL '2 days'),
  
  -- Tickets de support
  (gen_random_uuid(), 'SUP-' || (extract(epoch from now())::bigint + 2) || '-001', 'support', 'Problème de connexion', 'Je n''arrive plus à me connecter depuis ce matin.', v_agent_dakar_id, 'high', 'in_progress', NULL, v_sadmin_id, NULL, NULL, NULL, NOW() - INTERVAL '4 hours'),
  
  (gen_random_uuid(), 'SUP-' || (extract(epoch from now())::bigint + 3) || '-002', 'feature_request', 'Amélioration interface', 'Il serait bien d''avoir un raccourci pour les opérations fréquentes.', v_agent_thies_id, 'low', 'open', NULL, NULL, NULL, NULL, NULL, NOW() - INTERVAL '1 day'),
  
  (gen_random_uuid(), 'BUG-' || (extract(epoch from now())::bigint + 4) || '-001', 'bug_report', 'Erreur calcul commission', 'Les commissions ne s''affichent pas correctement dans mon historique.', v_agent_dakar_id, 'medium', 'resolved', NULL, v_sadmin_id, v_sadmin_id, NOW() - INTERVAL '6 hours', 'Bug corrigé dans la dernière mise à jour', NOW() - INTERVAL '1 day');

END $$;

-- Créer des enregistrements de commission pour les opérations complétées
DO $$
DECLARE
  v_operation_record RECORD;
  v_commission_rule_id UUID;
BEGIN
  -- Créer une règle de commission par défaut si elle n'existe pas
  SELECT id INTO v_commission_rule_id FROM commission_rules LIMIT 1;
  
  IF v_commission_rule_id IS NULL THEN
    INSERT INTO commission_rules (id, operation_type_id, commission_type, percentage_rate, min_amount, max_amount, is_active)
    SELECT gen_random_uuid(), ot.id, 'percentage', 0.025, 1000, 1000000, true
    FROM operation_types ot LIMIT 1
    RETURNING id INTO v_commission_rule_id;
  END IF;

  -- Créer des enregistrements de commission pour les opérations complétées
  FOR v_operation_record IN 
    SELECT o.id, o.initiator_id, o.commission_amount, p.agency_id, a.chef_agence_id
    FROM operations o
    JOIN profiles p ON o.initiator_id = p.id
    JOIN agencies a ON p.agency_id = a.id
    WHERE o.status = 'completed' AND o.commission_amount > 0
  LOOP
    INSERT INTO commission_records (id, operation_id, agent_id, chef_agence_id, commission_rule_id, agent_commission, chef_commission, total_commission, status, created_at)
    VALUES (
      gen_random_uuid(),
      v_operation_record.id,
      v_operation_record.initiator_id,
      v_operation_record.chef_agence_id,
      v_commission_rule_id,
      v_operation_record.commission_amount * 0.8, -- 80% pour l'agent
      v_operation_record.commission_amount * 0.2, -- 20% pour le chef
      v_operation_record.commission_amount,
      'earned',
      NOW() - INTERVAL '1 day'
    );
  END LOOP;
END $$;

-- Créer des transactions dans le ledger
DO $$
DECLARE
  v_operation_record RECORD;
BEGIN
  FOR v_operation_record IN 
    SELECT o.id, o.initiator_id, o.amount, o.status, p.balance
    FROM operations o
    JOIN profiles p ON o.initiator_id = p.id
    WHERE o.status = 'completed'
  LOOP
    INSERT INTO transaction_ledger (id, user_id, operation_id, transaction_type, amount, balance_before, balance_after, description, created_at)
    VALUES (
      gen_random_uuid(),
      v_operation_record.initiator_id,
      v_operation_record.id,
      'operation_debit',
      -v_operation_record.amount,
      v_operation_record.balance + v_operation_record.amount,
      v_operation_record.balance,
      'Opération validée et montant débité',
      NOW() - INTERVAL '1 day'
    );
  END LOOP;
END $$;

-- Créer des notifications
DO $$
DECLARE
  v_agent_dakar_id UUID;
  v_agent_thies_id UUID;
  v_chef_dakar_id UUID;
BEGIN
  SELECT id INTO v_agent_dakar_id FROM profiles WHERE email = 'dkr01_fatou@transflownexus.demo';
  SELECT id INTO v_agent_thies_id FROM profiles WHERE email = 'ths01_amadou@transflownexus.demo';
  SELECT id INTO v_chef_dakar_id FROM profiles WHERE email = 'chef_dakar_diallo@transflownexus.demo';

  INSERT INTO notifications (id, recipient_id, sender_id, notification_type, title, message, priority, is_read, data, created_at, expires_at) VALUES
  (gen_random_uuid(), v_agent_dakar_id, v_chef_dakar_id, 'operation_validated', 'Opération validée', 'Votre opération de 25,000 XOF a été validée avec succès.', 'normal', false, '{"amount": 25000}', NOW() - INTERVAL '2 hours', NOW() + INTERVAL '7 days'),
  
  (gen_random_uuid(), v_agent_thies_id, NULL, 'low_balance_warning', 'Solde faible', 'Votre solde est en dessous de 200,000 XOF. Pensez à demander une recharge.', 'high', false, '{"current_balance": 165000}', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '3 days'),
  
  (gen_random_uuid(), v_chef_dakar_id, NULL, 'recharge_request', 'Nouvelle demande de recharge', 'Fatou a demandé une recharge de 50,000 XOF (priorité haute).', 'high', false, '{"amount": 50000, "agent_name": "Fatou"}', NOW() - INTERVAL '2 hours', NOW() + INTERVAL '1 day');

END $$;

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE '✅ Données mockées complètes créées avec succès !';
  RAISE NOTICE '📊 Données créées avec les comptes existants :';
  RAISE NOTICE '   - Agences avec chefs assignés';
  RAISE NOTICE '   - Opérations (complétées, en attente, validation)';  
  RAISE NOTICE '   - Commissions calculées et enregistrées';
  RAISE NOTICE '   - Tickets de support et recharge réalistes';
  RAISE NOTICE '   - Transactions dans le ledger';
  RAISE NOTICE '   - Notifications système';
  RAISE NOTICE '';
  RAISE NOTICE '🏢 Structure des agences :';
  RAISE NOTICE '   - Agence Dakar : Chef Diallo + Agent Fatou';
  RAISE NOTICE '   - Agence Thiès : Chef Fall + Agent Amadou';
  RAISE NOTICE '   - Agence Saint-Louis : Disponible';
  RAISE NOTICE '';
  RAISE NOTICE '🎯 Tous les cas d''usage sont maintenant testables !';
END $$;
