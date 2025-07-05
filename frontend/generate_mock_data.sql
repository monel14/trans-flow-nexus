-- ===============================================
-- SCRIPT DE GÉNÉRATION DE DONNÉES MOCK
-- TransFlow Nexus - Tous les cas d'utilisation
-- ===============================================

-- Note: Ce script doit être exécuté APRÈS avoir appliqué le fix RLS v3

-- ===============================================
-- 1. CRÉATION DES RÔLES DE BASE
-- ===============================================

-- Insérer les rôles si ils n'existent pas déjà
INSERT INTO public.roles (id, name, label, description, is_active, created_at, updated_at) 
VALUES 
  (1, 'admin_general', 'Administrateur Général', 'Accès complet au système', true, now(), now()),
  (2, 'sous_admin', 'Sous-Administrateur', 'Accès limité administration', true, now(), now()),
  (3, 'chef_agence', 'Chef d''Agence', 'Gestion d''une agence', true, now(), now()),
  (4, 'agent', 'Agent', 'Opérations de base', true, now(), now()),
  (5, 'developer', 'Développeur', 'Accès développement', true, now(), now())
ON CONFLICT (id) DO UPDATE SET
  updated_at = now();

-- ===============================================
-- 2. CRÉATION DES AGENCES
-- ===============================================

INSERT INTO public.agencies (id, name, address, phone, email, is_active, balance, commission_balance, created_at, updated_at)
VALUES 
  (1, 'Agence Dakar Centre', '123 Rue de la République, Dakar', '+221 33 123 4567', 'dakar.centre@transflow.sn', true, 1500000.00, 25000.00, now(), now()),
  (2, 'Agence Pikine', '456 Avenue Blaise Diagne, Pikine', '+221 33 234 5678', 'pikine@transflow.sn', true, 800000.00, 18000.00, now(), now()),
  (3, 'Agence Thiès', '789 Boulevard Général de Gaulle, Thiès', '+221 33 345 6789', 'thies@transflow.sn', true, 650000.00, 12000.00, now(), now()),
  (4, 'Agence Saint-Louis', '321 Place Faidherbe, Saint-Louis', '+221 33 456 7890', 'saint.louis@transflow.sn', true, 420000.00, 8500.00, now(), now())
ON CONFLICT (id) DO UPDATE SET
  updated_at = now(),
  balance = EXCLUDED.balance,
  commission_balance = EXCLUDED.commission_balance;

-- ===============================================
-- 3. CRÉATION DES TYPES D'OPÉRATIONS
-- ===============================================

INSERT INTO public.operation_types (id, name, description, impacts_balance, is_active, status, created_at, updated_at)
VALUES 
  ('op_transfert_national', 'Transfert National', 'Transfert d''argent dans le pays', true, true, 'active', now(), now()),
  ('op_transfert_international', 'Transfert International', 'Transfert d''argent vers l''étranger', true, true, 'active', now(), now()),
  ('op_depot_especes', 'Dépôt Espèces', 'Dépôt d''argent en espèces', true, true, 'active', now(), now()),
  ('op_retrait_especes', 'Retrait Espèces', 'Retrait d''argent en espèces', true, true, 'active', now(), now()),
  ('op_paiement_facture', 'Paiement Facture', 'Paiement de factures diverses', true, true, 'active', now(), now()),
  ('op_recharge_mobile', 'Recharge Mobile', 'Recharge de crédit téléphonique', true, true, 'active', now(), now()),
  ('op_change_devise', 'Change de Devise', 'Échange de devises', true, true, 'active', now(), now())
ON CONFLICT (id) DO UPDATE SET
  updated_at = now(),
  is_active = EXCLUDED.is_active,
  status = EXCLUDED.status;

-- ===============================================
-- 4. CRÉATION DES CHAMPS POUR TYPES D'OPÉRATIONS
-- ===============================================

INSERT INTO public.operation_type_fields (id, operation_type_id, name, label, field_type, is_required, is_obsolete, display_order, placeholder, help_text, options, created_at, updated_at)
VALUES 
  -- Champs pour Transfert National
  (gen_random_uuid(), 'op_transfert_national', 'beneficiaire_nom', 'Nom du bénéficiaire', 'text', true, false, 1, 'Entrez le nom complet', 'Nom complet du bénéficiaire', '[]', now(), now()),
  (gen_random_uuid(), 'op_transfert_national', 'beneficiaire_telephone', 'Téléphone bénéficiaire', 'tel', true, false, 2, '+221 XX XXX XXXX', 'Numéro de téléphone', '[]', now(), now()),
  (gen_random_uuid(), 'op_transfert_national', 'ville_destination', 'Ville de destination', 'select', true, false, 3, '', 'Sélectionnez la ville', '["Dakar", "Thiès", "Saint-Louis", "Kaolack", "Ziguinchor", "Tambacounda"]', now(), now()),
  
  -- Champs pour Transfert International
  (gen_random_uuid(), 'op_transfert_international', 'beneficiaire_nom', 'Nom du bénéficiaire', 'text', true, false, 1, 'Nom complet', 'Nom complet du bénéficiaire', '[]', now(), now()),
  (gen_random_uuid(), 'op_transfert_international', 'pays_destination', 'Pays de destination', 'select', true, false, 2, '', 'Pays de destination', '["France", "Espagne", "Italie", "Mali", "Guinée", "Mauritanie", "Gambie"]', now(), now()),
  (gen_random_uuid(), 'op_transfert_international', 'devise', 'Devise', 'select', true, false, 3, '', 'Devise de réception', '["EUR", "USD", "CFA"]', now(), now()),
  
  -- Champs pour Recharge Mobile
  (gen_random_uuid(), 'op_recharge_mobile', 'numero_telephone', 'Numéro de téléphone', 'tel', true, false, 1, '+221 XX XXX XXXX', 'Numéro à recharger', '[]', now(), now()),
  (gen_random_uuid(), 'op_recharge_mobile', 'operateur', 'Opérateur', 'select', true, false, 2, '', 'Opérateur télécom', '["Orange", "Free", "Expresso"]', now(), now()),
  (gen_random_uuid(), 'op_recharge_mobile', 'montant', 'Montant', 'select', true, false, 3, '', 'Montant de recharge', '["500", "1000", "2000", "5000", "10000"]', now(), now()),
  
  -- Champs pour Paiement Facture
  (gen_random_uuid(), 'op_paiement_facture', 'numero_facture', 'Numéro de facture', 'text', true, false, 1, 'XXX-XXXXXXX', 'Numéro de la facture', '[]', now(), now()),
  (gen_random_uuid(), 'op_paiement_facture', 'type_facture', 'Type de facture', 'select', true, false, 2, '', 'Type de facture', '["Électricité (SENELEC)", "Eau (SDE)", "Téléphone fixe", "Internet", "Télévision"]', now(), now())
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- 5. CRÉATION DES RÈGLES DE COMMISSION
-- ===============================================

INSERT INTO public.commission_rules (id, operation_type_id, commission_type, fixed_amount, percentage_rate, min_amount, max_amount, is_active, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'op_transfert_national', 'percentage', null, 2.5, 500, 5000, true, now(), now()),
  (gen_random_uuid(), 'op_transfert_international', 'percentage', null, 4.0, 1000, 15000, true, now(), now()),
  (gen_random_uuid(), 'op_depot_especes', 'fixed', 300, null, null, null, true, now(), now()),
  (gen_random_uuid(), 'op_retrait_especes', 'fixed', 200, null, null, null, true, now(), now()),
  (gen_random_uuid(), 'op_paiement_facture', 'percentage', null, 1.5, 100, 1000, true, now(), now()),
  (gen_random_uuid(), 'op_recharge_mobile', 'fixed', 50, null, null, null, true, now(), now()),
  (gen_random_uuid(), 'op_change_devise', 'percentage', null, 1.0, 200, 2000, true, now(), now())
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- 6. CRÉATION DES UTILISATEURS ET PROFILS
-- ===============================================

-- Pour créer des utilisateurs dans Supabase Auth, nous devons d'abord créer les profils
-- avec des IDs que nous utiliserons pour les utilisateurs Auth

-- Admin Général
INSERT INTO public.profiles (id, email, name, role_id, agency_id, is_active, balance, created_at, updated_at)
VALUES 
  ('11111111-1111-1111-1111-111111111111', 'admin@transflownexus.com', 'Moussa DIOP', 1, null, true, 0, now(), now())
ON CONFLICT (id) DO UPDATE SET
  updated_at = now();

-- Sous-Admin
INSERT INTO public.profiles (id, email, name, role_id, agency_id, is_active, balance, created_at, updated_at)
VALUES 
  ('22222222-2222-2222-2222-222222222222', 'sousadmin@transflownexus.com', 'Aminata FALL', 2, null, true, 0, now(), now())
ON CONFLICT (id) DO UPDATE SET
  updated_at = now();

-- Développeur
INSERT INTO public.profiles (id, email, name, role_id, agency_id, is_active, balance, created_at, updated_at)
VALUES 
  ('55555555-5555-5555-5555-555555555555', 'dev@transflownexus.com', 'Ibrahima SARR', 5, null, true, 0, now(), now())
ON CONFLICT (id) DO UPDATE SET
  updated_at = now();

-- AGENCE DAKAR CENTRE (Agence 1)
-- Chef d'agence Dakar
INSERT INTO public.profiles (id, email, name, role_id, agency_id, is_active, balance, created_at, updated_at)
VALUES 
  ('33333333-3333-3333-3333-333333333333', 'chef.dakar@transflownexus.com', 'Ousmane KANE', 3, 1, true, 25000, now(), now())
ON CONFLICT (id) DO UPDATE SET
  updated_at = now();

-- Agents Dakar
INSERT INTO public.profiles (id, email, name, role_id, agency_id, is_active, balance, created_at, updated_at)
VALUES 
  ('44444444-4444-4444-4444-444444444444', 'agent1.dakar@transflownexus.com', 'Fatou NDIAYE', 4, 1, true, 45000, now(), now()),
  ('44444444-4444-4444-4444-444444444445', 'agent2.dakar@transflownexus.com', 'Mamadou DIOUF', 4, 1, true, 38000, now(), now()),
  ('44444444-4444-4444-4444-444444444446', 'agent3.dakar@transflownexus.com', 'Awa SECK', 4, 1, true, 42000, now(), now())
ON CONFLICT (id) DO UPDATE SET
  updated_at = now();

-- AGENCE PIKINE (Agence 2)
-- Chef d'agence Pikine
INSERT INTO public.profiles (id, email, name, role_id, agency_id, is_active, balance, created_at, updated_at)
VALUES 
  ('33333333-3333-3333-3333-333333333334', 'chef.pikine@transflownexus.com', 'Adama THIAW', 3, 2, true, 18000, now(), now())
ON CONFLICT (id) DO UPDATE SET
  updated_at = now();

-- Agents Pikine
INSERT INTO public.profiles (id, email, name, role_id, agency_id, is_active, balance, created_at, updated_at)
VALUES 
  ('44444444-4444-4444-4444-444444444447', 'agent1.pikine@transflownexus.com', 'Seynabou GUEYE', 4, 2, true, 32000, now(), now()),
  ('44444444-4444-4444-4444-444444444448', 'agent2.pikine@transflownexus.com', 'Modou SALL', 4, 2, true, 28000, now(), now())
ON CONFLICT (id) DO UPDATE SET
  updated_at = now();

-- AGENCE THIÈS (Agence 3)
-- Chef d'agence Thiès
INSERT INTO public.profiles (id, email, name, role_id, agency_id, is_active, balance, created_at, updated_at)
VALUES 
  ('33333333-3333-3333-3333-333333333335', 'chef.thies@transflownexus.com', 'Babacar NDOUR', 3, 3, true, 12000, now(), now())
ON CONFLICT (id) DO UPDATE SET
  updated_at = now();

-- Agent Thiès
INSERT INTO public.profiles (id, email, name, role_id, agency_id, is_active, balance, created_at, updated_at)
VALUES 
  ('44444444-4444-4444-4444-444444444449', 'agent1.thies@transflownexus.com', 'Mariama WADE', 4, 3, true, 22000, now(), now())
ON CONFLICT (id) DO UPDATE SET
  updated_at = now();

-- ===============================================
-- 7. CRÉATION DES OPÉRATIONS
-- ===============================================

-- Opérations pour l'agence Dakar (avec différents statuts et dates)
INSERT INTO public.operations (id, operation_type_id, initiator_id, agency_id, amount, currency, status, reference_number, operation_data, commission_amount, fee_amount, validator_id, validated_at, completed_at, created_at, updated_at)
VALUES 
  -- Opérations de Fatou (Agent Dakar)
  (gen_random_uuid(), 'op_transfert_national', '44444444-4444-4444-4444-444444444444', 1, 50000, 'XOF', 'completed', 'TN-' || EXTRACT(epoch FROM now())::text, '{"beneficiaire_nom": "Assane DIALLO", "beneficiaire_telephone": "+221 77 123 4567", "ville_destination": "Thiès"}', 1250, 500, '33333333-3333-3333-3333-333333333333', now() - interval '1 hour', now() - interval '30 minutes', now() - interval '2 hours', now()),
  
  (gen_random_uuid(), 'op_transfert_international', '44444444-4444-4444-4444-444444444444', 1, 100000, 'XOF', 'completed', 'TI-' || (EXTRACT(epoch FROM now()) + 1)::text, '{"beneficiaire_nom": "Khadija BARRY", "pays_destination": "France", "devise": "EUR"}', 4000, 1000, '33333333-3333-3333-3333-333333333333', now() - interval '3 hours', now() - interval '2 hours', now() - interval '5 hours', now()),
  
  (gen_random_uuid(), 'op_recharge_mobile', '44444444-4444-4444-4444-444444444444', 1, 5000, 'XOF', 'completed', 'RM-' || (EXTRACT(epoch FROM now()) + 2)::text, '{"numero_telephone": "+221 70 555 1234", "operateur": "Orange", "montant": "5000"}', 50, 0, '33333333-3333-3333-3333-333333333333', now() - interval '30 minutes', now() - interval '15 minutes', now() - interval '1 hour', now()),
  
  -- Opérations de Mamadou (Agent Dakar)
  (gen_random_uuid(), 'op_paiement_facture', '44444444-4444-4444-4444-444444444445', 1, 25000, 'XOF', 'pending', 'PF-' || (EXTRACT(epoch FROM now()) + 3)::text, '{"numero_facture": "SEN-2024-001234", "type_facture": "Électricité (SENELEC)"}', 375, 100, null, null, null, now() - interval '15 minutes', now()),
  
  (gen_random_uuid(), 'op_depot_especes', '44444444-4444-4444-4444-444444444445', 1, 75000, 'XOF', 'validation_required', 'DE-' || (EXTRACT(epoch FROM now()) + 4)::text, '{"client_nom": "Papa NIANG", "client_telephone": "+221 76 888 9999"}', 300, 0, null, null, null, now() - interval '10 minutes', now()),
  
  -- Opérations d'Awa (Agent Dakar)
  (gen_random_uuid(), 'op_retrait_especes', '44444444-4444-4444-4444-444444444446', 1, 30000, 'XOF', 'completed', 'RE-' || (EXTRACT(epoch FROM now()) + 5)::text, '{"client_nom": "Ndeye SENE", "client_telephone": "+221 78 777 6666"}', 200, 0, '33333333-3333-3333-3333-333333333333', now() - interval '2 hours', now() - interval '1 hour 30 minutes', now() - interval '3 hours', now()),
  
  (gen_random_uuid(), 'op_change_devise', '44444444-4444-4444-4444-444444444446', 1, 60000, 'XOF', 'completed', 'CD-' || (EXTRACT(epoch FROM now()) + 6)::text, '{"devise_origine": "XOF", "devise_destination": "EUR", "taux_change": "655.957"}', 600, 200, '33333333-3333-3333-3333-333333333333', now() - interval '4 hours', now() - interval '3 hours 30 minutes', now() - interval '5 hours', now())
ON CONFLICT (id) DO NOTHING;

-- Opérations pour l'agence Pikine
INSERT INTO public.operations (id, operation_type_id, initiator_id, agency_id, amount, currency, status, reference_number, operation_data, commission_amount, fee_amount, validator_id, validated_at, completed_at, created_at, updated_at)
VALUES 
  -- Opérations de Seynabou (Agent Pikine)
  (gen_random_uuid(), 'op_transfert_national', '44444444-4444-4444-4444-444444444447', 2, 35000, 'XOF', 'completed', 'TN-' || (EXTRACT(epoch FROM now()) + 7)::text, '{"beneficiaire_nom": "Ismaila GUEYE", "beneficiaire_telephone": "+221 77 456 7890", "ville_destination": "Kaolack"}', 875, 350, '33333333-3333-3333-3333-333333333334', now() - interval '6 hours', now() - interval '5 hours', now() - interval '7 hours', now()),
  
  (gen_random_uuid(), 'op_recharge_mobile', '44444444-4444-4444-4444-444444444447', 2, 2000, 'XOF', 'completed', 'RM-' || (EXTRACT(epoch FROM now()) + 8)::text, '{"numero_telephone": "+221 70 123 4567", "operateur": "Free", "montant": "2000"}', 50, 0, '33333333-3333-3333-3333-333333333334', now() - interval '1 hour', now() - interval '45 minutes', now() - interval '1 hour 30 minutes', now()),
  
  -- Opérations de Modou (Agent Pikine)
  (gen_random_uuid(), 'op_transfert_international', '44444444-4444-4444-4444-444444444448', 2, 80000, 'XOF', 'failed', 'TI-' || (EXTRACT(epoch FROM now()) + 9)::text, '{"beneficiaire_nom": "Aminata TRAORE", "pays_destination": "Mali", "devise": "CFA"}', 3200, 800, null, null, null, now() - interval '2 hours', now()),
  
  (gen_random_uuid(), 'op_paiement_facture', '44444444-4444-4444-4444-444444444448', 2, 15000, 'XOF', 'pending', 'PF-' || (EXTRACT(epoch FROM now()) + 10)::text, '{"numero_facture": "SDE-2024-005678", "type_facture": "Eau (SDE)"}', 225, 75, null, null, null, now() - interval '20 minutes', now())
ON CONFLICT (id) DO NOTHING;

-- Opérations pour l'agence Thiès
INSERT INTO public.operations (id, operation_type_id, initiator_id, agency_id, amount, currency, status, reference_number, operation_data, commission_amount, fee_amount, validator_id, validated_at, completed_at, created_at, updated_at)
VALUES 
  -- Opérations de Mariama (Agent Thiès)
  (gen_random_uuid(), 'op_depot_especes', '44444444-4444-4444-4444-444444444449', 3, 120000, 'XOF', 'validation_required', 'DE-' || (EXTRACT(epoch FROM now()) + 11)::text, '{"client_nom": "Saliou MBAYE", "client_telephone": "+221 76 111 2222"}', 300, 0, null, null, null, now() - interval '5 minutes', now()),
  
  (gen_random_uuid(), 'op_transfert_national', '44444444-4444-4444-4444-444444444449', 3, 40000, 'XOF', 'completed', 'TN-' || (EXTRACT(epoch FROM now()) + 12)::text, '{"beneficiaire_nom": "Bineta DIOP", "beneficiaire_telephone": "+221 77 999 8888", "ville_destination": "Dakar"}', 1000, 400, '33333333-3333-3333-3333-333333333335', now() - interval '8 hours', now() - interval '7 hours', now() - interval '9 hours', now())
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- 8. CRÉATION DES ENREGISTREMENTS DE COMMISSION
-- ===============================================

INSERT INTO public.commission_records (id, operation_id, agent_id, chef_agence_id, agency_id, commission_amount, agent_share, chef_share, agency_share, status, created_at, updated_at)
SELECT 
  gen_random_uuid(),
  o.id,
  o.initiator_id,
  p_chef.id,
  o.agency_id,
  o.commission_amount,
  (o.commission_amount * 0.6)::decimal,
  (o.commission_amount * 0.25)::decimal,
  (o.commission_amount * 0.15)::decimal,
  CASE 
    WHEN o.status = 'completed' THEN 'earned'
    WHEN o.status = 'pending' OR o.status = 'validation_required' THEN 'pending'
    ELSE 'cancelled'
  END,
  o.created_at,
  o.updated_at
FROM public.operations o
JOIN public.profiles p_agent ON o.initiator_id = p_agent.id
JOIN public.profiles p_chef ON p_agent.agency_id = p_chef.agency_id AND p_chef.role_id = 3
WHERE o.commission_amount > 0
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- 9. CRÉATION DES ENTRÉES DANS LE LEDGER DE TRANSACTIONS
-- ===============================================

-- Entrées pour les opérations complétées
INSERT INTO public.transaction_ledger (id, user_id, operation_id, transaction_type, amount, balance_before, balance_after, description, created_at)
SELECT 
  gen_random_uuid(),
  o.initiator_id,
  o.id,
  CASE 
    WHEN ot.name LIKE '%Transfert%' OR ot.name LIKE '%Retrait%' OR ot.name LIKE '%Paiement%' THEN 'debit'
    WHEN ot.name LIKE '%Dépôt%' THEN 'credit'
    ELSE 'commission'
  END,
  CASE 
    WHEN ot.name LIKE '%Transfert%' OR ot.name LIKE '%Retrait%' OR ot.name LIKE '%Paiement%' THEN -o.amount
    WHEN ot.name LIKE '%Dépôt%' THEN o.amount
    ELSE o.commission_amount * 0.6
  END,
  p.balance + (CASE 
    WHEN ot.name LIKE '%Transfert%' OR ot.name LIKE '%Retrait%' OR ot.name LIKE '%Paiement%' THEN o.amount
    WHEN ot.name LIKE '%Dépôt%' THEN -o.amount
    ELSE -(o.commission_amount * 0.6)
  END),
  p.balance,
  'Opération: ' || ot.label || ' - ' || o.reference_number,
  o.completed_at
FROM public.operations o
JOIN public.operation_types ot ON o.operation_type_id = ot.id
JOIN public.profiles p ON o.initiator_id = p.id
WHERE o.status = 'completed' AND o.completed_at IS NOT NULL
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- 10. CRÉATION DES DEMANDES DE SUPPORT
-- ===============================================

INSERT INTO public.support_tickets (id, user_id, title, description, category, priority, status, created_at, updated_at)
VALUES 
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444444', 'Problème de transfert international', 'Le transfert vers la France n''est pas arrivé après 2 heures', 'technical', 'high', 'open', now() - interval '30 minutes', now()),
  
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444447', 'Demande d''augmentation de limite', 'Je souhaiterais augmenter ma limite quotidienne de transferts', 'account', 'medium', 'in_progress', now() - interval '2 hours', now() - interval '1 hour'),
  
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444449', 'Problème de connexion', 'Je n''arrive pas à me connecter depuis ce matin', 'technical', 'high', 'resolved', now() - interval '5 hours', now() - interval '3 hours'),
  
  (gen_random_uuid(), '33333333-3333-3333-3333-333333333333', 'Demande de formation', 'Formation sur les nouvelles fonctionnalités pour mon équipe', 'training', 'low', 'open', now() - interval '1 day', now() - interval '1 day')
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- 11. CRÉATION DES DEMANDES DE RECHARGE
-- ===============================================

INSERT INTO public.recharge_requests (id, agent_id, chef_agence_id, agency_id, amount, status, requested_at, approved_at, notes, created_at, updated_at)
VALUES 
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444445', '33333333-3333-3333-3333-333333333333', 1, 100000, 'approved', now() - interval '1 day', now() - interval '20 hours', 'Recharge approuvée pour activité intense', now() - interval '1 day', now() - interval '20 hours'),
  
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444447', '33333333-3333-3333-3333-333333333334', 2, 75000, 'pending', now() - interval '2 hours', null, 'En attente de validation', now() - interval '2 hours', now()),
  
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444449', '33333333-3333-3333-3333-333333333335', 3, 50000, 'rejected', now() - interval '1 day', now() - interval '18 hours', 'Montant trop élevé pour l''activité récente', now() - interval '1 day', now() - interval '18 hours')
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- 12. CRÉATION DES LOGS D'ERREUR
-- ===============================================

INSERT INTO public.error_logs (id, user_id, error_type, error_message, stack_trace, request_data, created_at)
VALUES 
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444448', 'TRANSFER_FAILED', 'Échec du transfert international: Bénéficiaire introuvable', 'TransferService.processInternationalTransfer() line 245', '{"amount": 80000, "destination": "Mali", "beneficiary": "Aminata TRAORE"}', now() - interval '2 hours'),
  
  (gen_random_uuid(), '44444444-4444-4444-4444-444444444447', 'VALIDATION_ERROR', 'Données de validation incorrectes pour paiement facture', 'ValidationService.validateBillPayment() line 89', '{"bill_number": "INVALID-123", "amount": 15000}', now() - interval '1 hour'),
  
  (gen_random_uuid(), null, 'SYSTEM_ERROR', 'Erreur de connexion à la base de données', 'DatabaseService.connect() line 34', '{"connection_timeout": 5000}', now() - interval '30 minutes')
ON CONFLICT (id) DO NOTHING;

-- ===============================================
-- 13. CRÉATION DE LA CONFIGURATION SYSTÈME
-- ===============================================

INSERT INTO public.system_config (id, config_key, config_value, description, is_active, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'max_daily_transfer_limit', '500000', 'Limite maximale de transfert quotidien par agent (XOF)', true, now(), now()),
  (gen_random_uuid(), 'commission_rate_national', '2.5', 'Taux de commission pour transferts nationaux (%)', true, now(), now()),
  (gen_random_uuid(), 'commission_rate_international', '4.0', 'Taux de commission pour transferts internationaux (%)', true, now(), now()),
  (gen_random_uuid(), 'validation_required_amount', '100000', 'Montant à partir duquel validation requise (XOF)', true, now(), now()),
  (gen_random_uuid(), 'agent_commission_share', '60', 'Part de commission pour l''agent (%)', true, now(), now()),
  (gen_random_uuid(), 'chef_commission_share', '25', 'Part de commission pour le chef d''agence (%)', true, now(), now()),
  (gen_random_uuid(), 'agency_commission_share', '15', 'Part de commission pour l''agence (%)', true, now(), now()),
  (gen_random_uuid(), 'maintenance_mode', 'false', 'Mode maintenance activé', true, now(), now())
ON CONFLICT (config_key) DO UPDATE SET
  updated_at = now(),
  config_value = EXCLUDED.config_value;

-- ===============================================
-- MISE À JOUR DES BALANCES BASÉE SUR LES TRANSACTIONS
-- ===============================================

-- Calculer et mettre à jour les balances des profils basées sur les transactions
UPDATE public.profiles 
SET balance = (
  SELECT COALESCE(SUM(
    CASE 
      WHEN tl.transaction_type = 'credit' THEN tl.amount
      WHEN tl.transaction_type = 'debit' THEN tl.amount
      WHEN tl.transaction_type = 'commission' THEN tl.amount
      ELSE 0
    END
  ), 0)
  FROM public.transaction_ledger tl 
  WHERE tl.user_id = profiles.id
)
WHERE role_id = 4; -- Seulement pour les agents

-- ===============================================
-- MESSAGE DE CONFIRMATION
-- ===============================================

DO $$
BEGIN
  RAISE NOTICE '============================================';
  RAISE NOTICE 'DONNÉES MOCK CRÉÉES AVEC SUCCÈS !';
  RAISE NOTICE '============================================';
  RAISE NOTICE 'Comptes créés:';
  RAISE NOTICE '- Admin: admin@transflownexus.com';
  RAISE NOTICE '- Sous-Admin: sousadmin@transflownexus.com';
  RAISE NOTICE '- Développeur: dev@transflownexus.com';
  RAISE NOTICE '- Chef Dakar: chef.dakar@transflownexus.com';
  RAISE NOTICE '- Chef Pikine: chef.pikine@transflownexus.com';
  RAISE NOTICE '- Chef Thiès: chef.thies@transflownexus.com';
  RAISE NOTICE '- 6 Agents répartis dans les 3 agences';
  RAISE NOTICE '';
  RAISE NOTICE 'Données créées:';
  RAISE NOTICE '- 4 Agences avec balances';
  RAISE NOTICE '- 7 Types d''opérations avec champs';
  RAISE NOTICE '- 15+ Opérations avec différents statuts';
  RAISE NOTICE '- Enregistrements de commissions';
  RAISE NOTICE '- Ledger de transactions';
  RAISE NOTICE '- Demandes de support';
  RAISE NOTICE '- Demandes de recharge';
  RAISE NOTICE '- Logs d''erreur';
  RAISE NOTICE '- Configuration système';
  RAISE NOTICE '';
  RAISE NOTICE 'Mot de passe par défaut: TransFlow2024!';
  RAISE NOTICE 'Vous devez créer ces utilisateurs dans Supabase Auth';
  RAISE NOTICE '============================================';
END
$$;