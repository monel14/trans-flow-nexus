
-- Script de données mockées complètes pour TransFlow Nexus
-- Suppression des données existantes (optionnel - décommentez si nécessaire)
-- TRUNCATE TABLE public.commission_transfers CASCADE;
-- TRUNCATE TABLE public.commission_records CASCADE;
-- TRUNCATE TABLE public.recharge_operations CASCADE;
-- TRUNCATE TABLE public.operation_validations CASCADE;
-- TRUNCATE TABLE public.operations CASCADE;
-- TRUNCATE TABLE public.request_ticket_comments CASCADE;
-- TRUNCATE TABLE public.request_tickets CASCADE;
-- TRUNCATE TABLE public.transaction_ledger CASCADE;
-- TRUNCATE TABLE public.profiles CASCADE;
-- TRUNCATE TABLE public.user_roles CASCADE;
-- TRUNCATE TABLE public.agencies CASCADE;

-- 1. Insertion des agences
INSERT INTO public.agencies (id, name, city, is_active, chef_agence_id) VALUES
(1, 'Agence Dakar Centre', 'Dakar', true, null),
(2, 'Agence Thiès Nord', 'Thiès', true, null),
(3, 'Agence Saint-Louis', 'Saint-Louis', true, null),
(4, 'Agence Ziguinchor Sud', 'Ziguinchor', true, null),
(5, 'Agence Kaolack Est', 'Kaolack', false, null)
ON CONFLICT (id) DO UPDATE SET 
name = EXCLUDED.name, 
city = EXCLUDED.city, 
is_active = EXCLUDED.is_active;

-- 2. Création d'utilisateurs fictifs avec des UUIDs fixes
INSERT INTO public.profiles (id, email, name, first_name, last_name, phone, balance, is_active, role_id, agency_id) VALUES
-- Admin général
('11111111-1111-1111-1111-111111111111', 'admin@transflow.com', 'Administrateur Général', 'Admin', 'SYSTEM', '+221701111111', 0, true, 3, null),

-- Sous-admin
('22222222-2222-2222-2222-222222222222', 'sousadmin@transflow.com', 'Pierre Sous-Admin', 'Pierre', 'NDIAYE', '+221702222222', 0, true, 4, null),

-- Développeur
('33333333-3333-3333-3333-333333333333', 'dev@transflow.com', 'Développeur Système', 'Dev', 'TECH', '+221703333333', 0, true, 5, null),

-- Chefs d'agence
('44444444-4444-4444-4444-444444444444', 'chef.dakar@transflow.com', 'Amadou Chef Dakar', 'Amadou', 'DIALLO', '+221704444444', 750000, true, 2, 1),
('55555555-5555-5555-5555-555555555555', 'chef.thies@transflow.com', 'Fatou Chef Thiès', 'Fatou', 'SARR', '+221705555555', 650000, true, 2, 2),
('66666666-6666-6666-6666-666666666666', 'chef.stlouis@transflow.com', 'Moussa Chef Saint-Louis', 'Moussa', 'BA', '+221706666666', 400000, true, 2, 3),

-- Agents Agence Dakar
('77777777-7777-7777-7777-777777777777', 'agent1.dakar@transflow.com', 'Aissatou Agent Dakar', 'Aissatou', 'FALL', '+221707777777', 125000, true, 1, 1),
('88888888-8888-8888-8888-888888888888', 'agent2.dakar@transflow.com', 'Ibrahima Agent Dakar', 'Ibrahima', 'SECK', '+221708888888', 85000, true, 1, 1),
('99999999-9999-9999-9999-999999999999', 'agent3.dakar@transflow.com', 'Mariama Agent Dakar', 'Mariama', 'DIOUF', '+221709999999', 45000, true, 1, 1),

-- Agents Agence Thiès
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'agent1.thies@transflow.com', 'Ousmane Agent Thiès', 'Ousmane', 'KANE', '+221701010101', 165000, true, 1, 2),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'agent2.thies@transflow.com', 'Astou Agent Thiès', 'Astou', 'MBAYE', '+221701020102', 95000, true, 1, 2),

-- Agents Agence Saint-Louis
('cccccccc-cccc-cccc-cccc-cccccccccccc', 'agent1.stlouis@transflow.com', 'Modou Agent Saint-Louis', 'Modou', 'THIAM', '+221701030103', 35000, true, 1, 3),
('dddddddd-dddd-dddd-dddd-dddddddddddd', 'agent2.stlouis@transflow.com', 'Khady Agent Saint-Louis', 'Khady', 'SOW', '+221701040104', 15000, true, 1, 3),

-- Agent inactif pour test
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'agent.inactif@transflow.com', 'Agent Inactif', 'Inactive', 'USER', '+221701050105', 0, false, 1, 1)
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

-- 3. Mise à jour des chefs d'agence dans la table agencies
UPDATE public.agencies SET chef_agence_id = '44444444-4444-4444-4444-444444444444' WHERE id = 1;
UPDATE public.agencies SET chef_agence_id = '55555555-5555-5555-5555-555555555555' WHERE id = 2;
UPDATE public.agencies SET chef_agence_id = '66666666-6666-6666-6666-666666666666' WHERE id = 3;

-- 4. Insertion d'opérations variées
INSERT INTO public.operations (id, reference_number, operation_type_id, initiator_id, agency_id, amount, currency, operation_data, status, fee_amount, commission_amount, validator_id, created_at, completed_at, validated_at) VALUES
-- Opérations complétées
('op111111-1111-1111-1111-111111111111', 'OP-20241201-001', '01J6YV8KW7XM9N2QA1B5C3R4D8', '77777777-7777-7777-7777-777777777777', 1, 25000, 'XOF', '{"recipient_phone": "+221701234567", "recipient_name": "Mamadou DIOP", "motif": "Aide familiale"}', 'completed', 500, 625, '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

('op222222-2222-2222-2222-222222222222', 'OP-20241201-002', '01J6YV8KW7XM9N2QA1B5C3R4D9', '88888888-8888-8888-8888-888888888888', 1, 15000, 'XOF', '{"phone_number": "+221709876543", "operator": "Orange", "montant": 15000}', 'completed', 300, 450, '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

('op333333-3333-3333-3333-333333333333', 'OP-20241201-003', '01J6YV8KW7XM9N2QA1B5C3R4E0', '99999999-9999-9999-9999-999999999999', 1, 35000, 'XOF', '{"facture_type": "SENELEC", "numero_client": "12345678", "montant": 35000}', 'completed', 700, 525, '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days'),

-- Opérations en attente de validation
('op444444-4444-4444-4444-444444444444', 'OP-20241201-004', '01J6YV8KW7XM9N2QA1B5C3R4D8', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 2, 50000, 'XOF', '{"recipient_phone": "+221785432109", "recipient_name": "Bineta NIANG", "motif": "Paiement fournisseur"}', 'pending_validation', 1000, 1250, null, NOW() - INTERVAL '1 day', null, null),

('op555555-5555-5555-5555-555555555555', 'OP-20241201-005', '01J6YV8KW7XM9N2QA1B5C3R4D9', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 2, 8000, 'XOF', '{"phone_number": "+221701112223", "operator": "Free", "montant": 8000}', 'pending_validation', 160, 240, null, NOW() - INTERVAL '6 hours', null, null),

-- Opérations en attente
('op666666-6666-6666-6666-666666666666', 'OP-20241201-006', '01J6YV8KW7XM9N2QA1B5C3R4E0', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 3, 12000, 'XOF', '{"facture_type": "SDE", "numero_client": "87654321", "montant": 12000}', 'pending', 240, 180, null, NOW() - INTERVAL '2 hours', null, null),

-- Opération rejetée
('op777777-7777-7777-7777-777777777777', 'OP-20241201-007', '01J6YV8KW7XM9N2QA1B5C3R4D8', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 3, 100000, 'XOF', '{"recipient_phone": "+221701234567", "recipient_name": "Test Rejet", "motif": "Test"}', 'rejected', 0, 0, '66666666-6666-6666-6666-666666666666', NOW() - INTERVAL '1 day', null, NOW() - INTERVAL '1 day'),

-- Opérations récentes pour statistiques
('op888888-8888-8888-8888-888888888888', 'OP-20241201-008', '01J6YV8KW7XM9N2QA1B5C3R4D8', '77777777-7777-7777-7777-777777777777', 1, 75000, 'XOF', '{"recipient_phone": "+221701111111", "recipient_name": "Client VIP", "motif": "Transaction importante"}', 'completed', 1500, 1875, '44444444-4444-4444-4444-444444444444', NOW(), NOW(), NOW()),

('op999999-9999-9999-9999-999999999999', 'OP-20241201-009', '01J6YV8KW7XM9N2QA1B5C3R4D9', '88888888-8888-8888-8888-888888888888', 1, 20000, 'XOF', '{"phone_number": "+221702222222", "operator": "Expresso", "montant": 20000}', 'completed', 400, 600, '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour')

ON CONFLICT (id) DO NOTHING;

-- 5. Enregistrements de commissions
INSERT INTO public.commission_records (id, operation_id, agent_id, chef_agence_id, commission_rule_id, agent_commission, chef_commission, total_commission, status, created_at, paid_at) VALUES
('com11111-1111-1111-1111-111111111111', 'op111111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', '01J6YV8KW7XM9N2QA1B5C3R4G0', 500, 125, 625, 'paid', NOW() - INTERVAL '5 days', NOW() - INTERVAL '4 days'),

('com22222-2222-2222-2222-222222222222', 'op222222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888888', '44444444-4444-4444-4444-444444444444', '01J6YV8KW7XM9N2QA1B5C3R4G1', 360, 90, 450, 'paid', NOW() - INTERVAL '3 days', NOW() - INTERVAL '2 days'),

('com33333-3333-3333-3333-333333333333', 'op333333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', '44444444-4444-4444-4444-444444444444', '01J6YV8KW7XM9N2QA1B5C3R4G2', 420, 105, 525, 'earned', NOW() - INTERVAL '2 days', null),

('com88888-8888-8888-8888-888888888888', 'op888888-8888-8888-8888-888888888888', '77777777-7777-7777-7777-777777777777', '44444444-4444-4444-4444-444444444444', '01J6YV8KW7XM9N2QA1B5C3R4G0', 1500, 375, 1875, 'earned', NOW(), null),

('com99999-9999-9999-9999-999999999999', 'op999999-9999-9999-9999-999999999999', '88888888-8888-8888-8888-888888888888', '44444444-4444-4444-4444-444444444444', '01J6YV8KW7XM9N2QA1B5C3R4G1', 480, 120, 600, 'earned', NOW() - INTERVAL '1 hour', null)

ON CONFLICT (id) DO NOTHING;

-- 6. Historique des transactions (ledger)
INSERT INTO public.transaction_ledger (id, user_id, operation_id, transaction_type, amount, balance_before, balance_after, description, metadata, created_at) VALUES
-- Débits pour opérations
('txn11111-1111-1111-1111-111111111111', '77777777-7777-7777-7777-777777777777', 'op111111-1111-1111-1111-111111111111', 'operation_debit', -25000, 150000, 125000, 'Opération validée et montant débité', '{"operation_type": "transfer", "validator_id": "44444444-4444-4444-4444-444444444444"}', NOW() - INTERVAL '5 days'),

('txn22222-2222-2222-2222-222222222222', '88888888-8888-8888-8888-888888888888', 'op222222-2222-2222-2222-222222222222', 'operation_debit', -15000, 100000, 85000, 'Recharge mobile validée', '{"operation_type": "mobile_recharge", "operator": "Orange"}', NOW() - INTERVAL '3 days'),

('txn33333-3333-3333-3333-333333333333', '99999999-9999-9999-9999-999999999999', 'op333333-3333-3333-3333-333333333333', 'operation_debit', -35000, 80000, 45000, 'Paiement facture SENELEC', '{"operation_type": "bill_payment", "provider": "SENELEC"}', NOW() - INTERVAL '2 days'),

-- Crédits de recharge
('txn44444-4444-4444-4444-444444444444', '99999999-9999-9999-9999-999999999999', null, 'recharge_credit', 50000, 30000, 80000, 'Recharge approuvée par le chef d\'agence', '{"recharge_method": "chef_approval", "processor_id": "44444444-4444-4444-4444-444444444444"}', NOW() - INTERVAL '3 days'),

('txn55555-5555-5555-5555-555555555555', 'cccccccc-cccc-cccc-cccc-cccccccccccc', null, 'recharge_credit', 25000, 10000, 35000, 'Recharge d\'urgence approuvée', '{"recharge_method": "admin_approval", "urgency": "high"}', NOW() - INTERVAL '1 day'),

-- Paiements de commissions
('txn66666-6666-6666-6666-666666666666', '77777777-7777-7777-7777-777777777777', null, 'commission_transfer_credit', 500, 124500, 125000, 'Paiement commission opération OP-20241201-001', '{"commission_type": "agent_payment", "operation_ref": "OP-20241201-001"}', NOW() - INTERVAL '4 days'),

('txn77777-7777-7777-7777-777777777777', '88888888-8888-8888-8888-888888888888', null, 'commission_transfer_credit', 360, 84640, 85000, 'Paiement commission opération OP-20241201-002', '{"commission_type": "agent_payment", "operation_ref": "OP-20241201-002"}', NOW() - INTERVAL '2 days'),

-- Transactions récentes
('txn88888-8888-8888-8888-888888888888', '77777777-7777-7777-7777-777777777777', 'op888888-8888-8888-8888-888888888888', 'operation_debit', -75000, 200000, 125000, 'Transaction VIP validée', '{"operation_type": "transfer", "vip_client": true}', NOW()),

('txn99999-9999-9999-9999-999999999999', '88888888-8888-8888-8888-888888888888', 'op999999-9999-9999-9999-999999999999', 'operation_debit', -20000, 105000, 85000, 'Recharge Expresso validée', '{"operation_type": "mobile_recharge", "operator": "Expresso"}', NOW() - INTERVAL '1 hour')

ON CONFLICT (id) DO NOTHING;

-- 7. Tickets de demande (recharges et support)
INSERT INTO public.request_tickets (id, ticket_number, ticket_type, title, description, requester_id, priority, status, requested_amount, assigned_to_id, resolved_by_id, resolved_at, resolution_notes, created_at) VALUES
-- Demandes de recharge
('tck11111-1111-1111-1111-111111111111', 'RCH-20241201-001', 'recharge_request', 'Demande recharge urgente', 'Mon solde est très bas et j\'ai plusieurs clients qui attendent. Merci de m\'accorder une recharge d\'urgence.', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'high', 'pending', 50000, '66666666-6666-6666-6666-666666666666', null, null, null, NOW() - INTERVAL '2 hours'),

('tck22222-2222-2222-2222-222222222222', 'RCH-20241201-002', 'recharge_request', 'Recharge mensuelle habituelle', 'Demande de recharge mensuelle pour continuer les activités normalement.', '99999999-9999-9999-9999-999999999999', 'medium', 'resolved', 50000, '44444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', NOW() - INTERVAL '3 days', 'Recharge approuvée et effectuée. Nouveau solde: 80,000 XOF', NOW() - INTERVAL '4 days'),

('tck33333-3333-3333-3333-333333333333', 'RCH-20241201-003', 'recharge_request', 'Recharge week-end', 'Besoin d\'une recharge pour le week-end, beaucoup de clients.', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'medium', 'assigned', 75000, '55555555-5555-5555-5555-555555555555', null, null, null, NOW() - INTERVAL '1 day'),

-- Tickets de support
('tck44444-4444-4444-4444-444444444444', 'SUP-20241201-001', 'support', 'Problème de connexion', 'Je n\'arrive plus à me connecter depuis hier soir. Message d\'erreur: "Identifiants incorrects"', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'high', 'in_progress', null, '22222222-2222-2222-2222-222222222222', null, null, null, NOW() - INTERVAL '12 hours'),

('tck55555-5555-5555-5555-555555555555', 'SUP-20241201-002', 'feature_request', 'Amélioration rapports', 'Il serait bien d\'avoir des graphiques plus détaillés dans les rapports mensuels.', '77777777-7777-7777-7777-777777777777', 'low', 'open', null, null, null, null, null, NOW() - INTERVAL '3 days'),

('tck66666-6666-6666-6666-666666666666', 'BUG-20241201-001', 'bug_report', 'Erreur calcul commission', 'Les commissions ne sont pas calculées correctement pour les opérations > 100k XOF', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'high', 'resolved', null, '33333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', NOW() - INTERVAL '1 day', 'Bug corrigé dans la version 1.2.1. Les commissions sont maintenant calculées correctement.', NOW() - INTERVAL '2 days')

ON CONFLICT (id) DO NOTHING;

-- 8. Commentaires sur les tickets
INSERT INTO public.request_ticket_comments (id, ticket_id, author_id, comment_text, is_internal, created_at) VALUES
('cmt11111-1111-1111-1111-111111111111', 'tck22222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999999', 'Merci beaucoup pour la recharge rapide !', false, NOW() - INTERVAL '3 days'),

('cmt22222-2222-2222-2222-222222222222', 'tck44444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'J\'ai réinitialisé votre mot de passe. Vérifiez vos emails.', false, NOW() - INTERVAL '10 hours'),

('cmt33333-3333-3333-3333-333333333333', 'tck44444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Parfait, je peux me reconnecter maintenant. Merci !', false, NOW() - INTERVAL '8 hours'),

('cmt44444-4444-4444-4444-444444444444', 'tck66666-6666-6666-6666-666666666666', '33333333-3333-3333-3333-333333333333', 'Bug reproduit et identifié. Correction en cours.', true, NOW() - INTERVAL '1 day 12 hours'),

('cmt55555-5555-5555-5555-555555555555', 'tck11111-1111-1111-1111-111111111111', '66666666-6666-6666-6666-666666666666', 'Demande en cours d\'examen. Justificatifs requis.', false, NOW() - INTERVAL '1 hour')

ON CONFLICT (id) DO NOTHING;

-- 9. Opérations de recharge
INSERT INTO public.recharge_operations (id, ticket_id, agent_id, amount, recharge_method, reference_number, status, balance_before, balance_after, processed_at, metadata, created_at) VALUES
('rch11111-1111-1111-1111-111111111111', 'tck22222-2222-2222-2222-222222222222', '99999999-9999-9999-9999-999999999999', 50000, 'chef_approval', 'RCH-1733061234-99999999', 'completed', 30000, 80000, NOW() - INTERVAL '3 days', '{"processor_id": "44444444-4444-4444-4444-444444444444", "approval_method": "manual"}', NOW() - INTERVAL '4 days'),

('rch22222-2222-2222-2222-222222222222', 'tck33333-3333-3333-3333-333333333333', 'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 75000, 'admin_approval', 'RCH-1733061235-aaaaaaaa', 'pending', 90000, 165000, null, '{"processor_id": "55555555-5555-5555-5555-555555555555", "approval_method": "manual"}', NOW() - INTERVAL '1 day')

ON CONFLICT (id) DO NOTHING;

-- 10. Validations d'opérations
INSERT INTO public.operation_validations (id, operation_id, validator_id, validation_status, validation_notes, balance_impact, commission_calculated, validation_data, validated_at, created_at) VALUES
('val11111-1111-1111-1111-111111111111', 'op111111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'approved', 'Opération validée - Client vérifié', -25000, 625, '{"verification_method": "phone_call", "client_confirmed": true}', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days'),

('val22222-2222-2222-2222-222222222222', 'op222222-2222-2222-2222-222222222222', '44444444-4444-4444-4444-444444444444', 'approved', 'Recharge Orange validée', -15000, 450, '{"operator_confirmation": "OR123456789", "recharge_successful": true}', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days'),

('val77777-7777-7777-7777-777777777777', 'op777777-7777-7777-7777-777777777777', '66666666-6666-6666-6666-666666666666', 'rejected', 'Montant trop élevé pour ce type de client - Vérifications supplémentaires requises', 0, 0, '{"rejection_reason": "amount_too_high", "client_verification_failed": true}', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day'),

('val88888-8888-8888-8888-888888888888', 'op888888-8888-8888-8888-888888888888', '44444444-4444-4444-4444-444444444444', 'approved', 'Transaction VIP - Client premium vérifié', -75000, 1875, '{"vip_client": true, "premium_service": true, "fast_track": true}', NOW(), NOW()),

('val99999-9999-9999-9999-999999999999', 'op999999-9999-9999-9999-999999999999', '44444444-4444-4444-4444-444444444444', 'approved', 'Recharge Expresso validée automatiquement', -20000, 600, '{"auto_validation": true, "operator_response": "EX987654321"}', NOW() - INTERVAL '1 hour', NOW() - INTERVAL '1 hour')

ON CONFLICT (id) DO NOTHING;

-- 11. Transferts de commissions
INSERT INTO public.commission_transfers (id, commission_record_id, transfer_type, recipient_id, amount, transfer_method, reference_number, status, transfer_data, processed_at, created_at) VALUES
('trf11111-1111-1111-1111-111111111111', 'com11111-1111-1111-1111-111111111111', 'agent_payment', '77777777-7777-7777-7777-777777777777', 500, 'balance_credit', 'COM-1733061100-77777777', 'completed', '{"original_balance": 124500, "new_balance": 125000}', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),

('trf22222-2222-2222-2222-222222222222', 'com11111-1111-1111-1111-111111111111', 'chef_payment', '44444444-4444-4444-4444-444444444444', 125, 'balance_credit', 'COM-1733061101-44444444', 'completed', '{"original_balance": 749875, "new_balance": 750000}', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days'),

('trf33333-3333-3333-3333-333333333333', 'com22222-2222-2222-2222-222222222222', 'agent_payment', '88888888-8888-8888-8888-888888888888', 360, 'balance_credit', 'COM-1733061200-88888888', 'completed', '{"original_balance": 84640, "new_balance": 85000}', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days')

ON CONFLICT (id) DO NOTHING;

-- 12. Notifications pour les utilisateurs
INSERT INTO public.notifications (id, recipient_id, sender_id, notification_type, title, message, priority, is_read, data, created_at, expires_at) VALUES
('not11111-1111-1111-1111-111111111111', '99999999-9999-9999-9999-999999999999', '44444444-4444-4444-4444-444444444444', 'recharge_approved', 'Recharge approuvée', 'Votre demande de recharge de 50,000 XOF a été approuvée et votre compte a été crédité.', 'normal', true, '{"amount": 50000, "new_balance": 80000}', NOW() - INTERVAL '3 days', NOW() + INTERVAL '7 days'),

('not22222-2222-2222-2222-222222222222', '77777777-7777-7777-7777-777777777777', null, 'commission_paid', 'Commission versée', 'Votre commission de 500 XOF pour l\'opération OP-20241201-001 a été versée sur votre compte.', 'normal', false, '{"commission_amount": 500, "operation_ref": "OP-20241201-001"}', NOW() - INTERVAL '4 days', NOW() + INTERVAL '30 days'),

('not33333-3333-3333-3333-333333333333', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '66666666-6666-6666-6666-666666666666', 'operation_rejected', 'Opération rejetée', 'Votre opération OP-20241201-007 a été rejetée. Raison: Montant trop élevé pour ce type de client.', 'high', true, '{"operation_ref": "OP-20241201-007", "rejection_reason": "amount_too_high"}', NOW() - INTERVAL '1 day', NOW() + INTERVAL '7 days'),

('not44444-4444-4444-4444-444444444444', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '22222222-2222-2222-2222-222222222222', 'support_update', 'Ticket de support mis à jour', 'Votre ticket SUP-20241201-001 a été mis à jour. Votre mot de passe a été réinitialisé.', 'normal', false, '{"ticket_number": "SUP-20241201-001", "status": "in_progress"}', NOW() - INTERVAL '10 hours', NOW() + INTERVAL '7 days'),

('not55555-5555-5555-5555-555555555555', '88888888-8888-8888-8888-888888888888', null, 'low_balance_warning', 'Solde faible', 'Attention: Votre solde est faible (85,000 XOF). Pensez à demander une recharge.', 'high', false, '{"current_balance": 85000, "threshold": 100000}', NOW() - INTERVAL '1 hour', NOW() + INTERVAL '3 days'),

('not66666-6666-6666-6666-666666666666', 'cccccccc-cccc-cccc-cccc-cccccccccccc', null, 'low_balance_warning', 'Solde critique', 'URGENT: Votre solde est très faible (35,000 XOF). Veuillez demander une recharge immédiatement.', 'critical', false, '{"current_balance": 35000, "threshold": 50000}', NOW() - INTERVAL '30 minutes', NOW() + INTERVAL '1 day')

ON CONFLICT (id) DO NOTHING;

-- 13. Logs d'audit pour traçabilité
INSERT INTO public.app_audit_log (id, user_id, action, resource_type, resource_id, old_values, new_values, ip_address, user_agent, session_id, created_at) VALUES
('aud11111-1111-1111-1111-111111111111', '44444444-4444-4444-4444-444444444444', 'UPDATE', 'profiles', '99999999-9999-9999-9999-999999999999', '{"balance": 30000}', '{"balance": 80000}', '192.168.1.100', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'sess_chef_dakar_001', NOW() - INTERVAL '3 days'),

('aud22222-2222-2222-2222-222222222222', '33333333-3333-3333-3333-333333333333', 'INSERT', 'commission_rules', '01J6YV8KW7XM9N2QA1B5C3R4G0', null, '{"commission_type": "percentage", "percentage_rate": 0.025}', '10.0.0.1', 'PostmanRuntime/7.32.0', 'sess_dev_001', NOW() - INTERVAL '7 days'),

('aud33333-3333-3333-3333-333333333333', '66666666-6666-6666-6666-666666666666', 'UPDATE', 'operations', 'op777777-7777-7777-7777-777777777777', '{"status": "pending_validation"}', '{"status": "rejected"}', '41.82.106.15', 'Mozilla/5.0 (Android 12; Mobile)', 'sess_chef_stlouis_001', NOW() - INTERVAL '1 day'),

('aud44444-4444-4444-4444-444444444444', '22222222-2222-2222-2222-222222222222', 'UPDATE', 'request_tickets', 'tck44444-4444-4444-4444-444444444444', '{"status": "open"}', '{"status": "in_progress", "assigned_to_id": "22222222-2222-2222-2222-222222222222"}', '196.207.123.45', 'Mozilla/5.0 (Macintosh; Intel Mac OS X)', 'sess_sousadmin_001', NOW() - INTERVAL '12 hours')

ON CONFLICT (id) DO NOTHING;

-- 14. Logs d'erreurs pour le monitoring
INSERT INTO public.error_logs (id, level, source, message, stack_trace, context, user_id, user_name, request_url, request_method, response_status, resolved, created_at) VALUES
(1, 'warning', 'operation_validation', 'Tentative de validation d''une opération avec solde insuffisant', null, '{"operation_id": "op777777-7777-7777-7777-777777777777", "required_amount": 100000, "available_balance": 15000}', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Khady Agent Saint-Louis', '/api/operations/validate', 'POST', 400, true, NOW() - INTERVAL '1 day'),

(2, 'error', 'commission_calculation', 'Erreur de calcul de commission pour opération importante', 'Error: Division by zero in commission calculation\n    at calculateTieredCommission line 45', '{"operation_id": "op888888-8888-8888-8888-888888888888", "amount": 75000, "commission_rule_id": "01J6YV8KW7XM9N2QA1B5C3R4G0"}', '77777777-7777-7777-7777-777777777777', 'Aissatou Agent Dakar', '/api/commissions/calculate', 'POST', 500, true, NOW() - INTERVAL '2 hours'),

(3, 'info', 'user_authentication', 'Tentative de connexion avec mot de passe incorrect', null, '{"login_attempt": "agent2.thies@transflow.com", "ip_address": "41.82.200.15", "user_agent": "Mozilla/5.0 Mobile"}', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Astou Agent Thiès', '/auth/login', 'POST', 401, false, NOW() - INTERVAL '8 hours'),

(4, 'critical', 'database', 'Connexion à la base de données interrompue temporairement', 'ConnectionError: timeout after 30s\n    at Database.connect line 120', '{"database": "transflow_prod", "connection_pool": "exhausted", "active_connections": 100}', null, null, null, null, null, true, NOW() - INTERVAL '1 day'),

(5, 'warning', 'recharge_processing', 'Délai de traitement de recharge dépassé', null, '{"ticket_id": "tck11111-1111-1111-1111-111111111111", "requested_amount": 50000, "processing_time_hours": 25}', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'Khady Agent Saint-Louis', '/api/recharge/request', 'POST', 200, false, NOW() - INTERVAL '3 hours')

ON CONFLICT (id) DO NOTHING;

-- Message de confirmation
DO $$
BEGIN
    RAISE NOTICE '✅ Données mockées insérées avec succès !';
    RAISE NOTICE '📊 Résumé des données créées :';
    RAISE NOTICE '   - 13 utilisateurs (1 admin, 1 sous-admin, 1 dev, 3 chefs, 7 agents)';
    RAISE NOTICE '   - 5 agences (4 actives, 1 inactive)';
    RAISE NOTICE '   - 9 opérations (6 complétées, 2 en attente, 1 rejetée)';
    RAISE NOTICE '   - 5 enregistrements de commissions';
    RAISE NOTICE '   - 9 transactions dans le ledger';
    RAISE NOTICE '   - 6 tickets (3 recharges, 3 support)';
    RAISE NOTICE '   - 5 commentaires sur tickets';
    RAISE NOTICE '   - 2 opérations de recharge';
    RAISE NOTICE '   - 5 validations d''opérations';
    RAISE NOTICE '   - 3 transferts de commissions';
    RAISE NOTICE '   - 6 notifications';
    RAISE NOTICE '   - 4 logs d''audit';
    RAISE NOTICE '   - 5 logs d''erreurs';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 Comptes de test créés avec des UUIDs fixes :';
    RAISE NOTICE '   - Admin: admin@transflow.com';
    RAISE NOTICE '   - Chef Dakar: chef.dakar@transflow.com (750k XOF)';
    RAISE NOTICE '   - Agent Dakar 1: agent1.dakar@transflow.com (125k XOF)';
    RAISE NOTICE '   - Agent Dakar 2: agent2.dakar@transflow.com (85k XOF - solde faible)';
    RAISE NOTICE '   - Agent Saint-Louis: agent2.stlouis@transflow.com (15k XOF - solde critique)';
    RAISE NOTICE '';
    RAISE NOTICE '📈 Cas d''usage couverts :';
    RAISE NOTICE '   ✓ Opérations complétées avec commissions';
    RAISE NOTICE '   ✓ Opérations en attente de validation';
    RAISE NOTICE '   ✓ Opérations rejetées';
    RAISE NOTICE '   ✓ Demandes de recharge (approuvées/en attente)';
    RAISE NOTICE '   ✓ Tickets de support résolus/en cours';
    RAISE NOTICE '   ✓ Notifications lues/non lues';
    RAISE NOTICE '   ✓ Alertes de solde faible/critique';
    RAISE NOTICE '   ✓ Historique des transactions';
    RAISE NOTICE '   ✓ Paiements de commissions';
    RAISE NOTICE '   ✓ Logs d''audit et d''erreurs';
END $$;
