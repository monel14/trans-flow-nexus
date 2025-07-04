-- =============================================================================
-- SCRIPT DE GÉNÉRATION DE DONNÉES MOCK POUR TRANSFLOW NEXUS
-- À exécuter directement dans l'éditeur SQL de Supabase
-- =============================================================================

-- 1. CRÉATION DES AGENCES
-- =============================================================================
INSERT INTO agencies (name, city, is_active, created_at, updated_at) 
VALUES 
    ('Agence de Douala', 'Douala', true, now(), now()),
    ('Agence de Yaoundé', 'Yaoundé', true, now(), now())
ON CONFLICT (name) DO NOTHING;

-- 2. CRÉATION DES TYPES D'OPÉRATIONS
-- =============================================================================
INSERT INTO operation_types (id, name, description, impacts_balance, is_active, status, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'Dépôt Orange Money', 'Dépôt d''argent sur compte Orange Money', true, true, 'active', now(), now()),
    (gen_random_uuid(), 'Retrait MTN MoMo', 'Retrait d''argent depuis compte MTN Mobile Money', true, true, 'active', now(), now()),
    (gen_random_uuid(), 'Paiement Facture ENEO', 'Paiement facture électricité ENEO', true, true, 'active', now(), now()),
    (gen_random_uuid(), 'Paiement Abonnement Canal+', 'Paiement abonnement télévision Canal+', true, true, 'active', now(), now()),
    (gen_random_uuid(), 'Enregistrement KYC Client', 'Enregistrement et vérification identité client', false, true, 'active', now(), now()),
    (gen_random_uuid(), 'Transfert Western Union', 'Envoi d''argent via Western Union', true, true, 'active', now(), now())
ON CONFLICT (name) DO NOTHING;

-- 3. CRÉATION DES RÈGLES DE COMMISSION
-- =============================================================================
INSERT INTO commission_rules (id, operation_type_id, commission_type, percentage_rate, min_amount, max_amount, is_active, created_at, updated_at)
SELECT 
    gen_random_uuid(),
    ot.id,
    'percentage',
    0.025, -- 2.5%
    100.0,
    5000.0,
    true,
    now(),
    now()
FROM operation_types ot 
WHERE ot.impacts_balance = true
ON CONFLICT DO NOTHING;

-- 4. CRÉATION DES COMPTES UTILISATEURS (Admin Général)
-- =============================================================================
-- Utilisation de la fonction RPC pour créer l'admin général
DO $$
DECLARE
    admin_id TEXT;
BEGIN
    -- Créer l'admin général
    SELECT create_admin_user(
        'Admin Général',
        'admin.general@transflow.com',
        'Demo123!'
    ) INTO admin_id;
    
    RAISE NOTICE 'Admin général créé avec ID: %', admin_id;
END $$;

-- 5. CRÉATION DU SOUS-ADMIN
-- =============================================================================
DO $$
DECLARE
    sous_admin_id TEXT;
BEGIN
    -- Créer le sous-admin
    SELECT create_sous_admin(
        'Sous Administrateur',
        'sous.admin@transflow.com',
        'Demo123!'
    ) INTO sous_admin_id;
    
    RAISE NOTICE 'Sous-admin créé avec ID: %', sous_admin_id;
END $$;

-- 6. CRÉATION DES CHEFS D'AGENCE
-- =============================================================================
DO $$
DECLARE
    chef1_id TEXT;
    chef2_id TEXT;
    agency1_id INT;
    agency2_id INT;
BEGIN
    -- Récupérer les IDs des agences
    SELECT id INTO agency1_id FROM agencies WHERE name = 'Agence de Douala' LIMIT 1;
    SELECT id INTO agency2_id FROM agencies WHERE name = 'Agence de Yaoundé' LIMIT 1;
    
    -- Créer chef agence Douala
    SELECT create_chef_agence(
        'Mamadou Diallo',
        'chef.douala@transflow.com',
        'Demo123!',
        agency1_id
    ) INTO chef1_id;
    
    -- Créer chef agence Yaoundé
    SELECT create_chef_agence(
        'Aminata Touré',
        'chef.yaoundé@transflow.com',
        'Demo123!',
        agency2_id
    ) INTO chef2_id;
    
    -- Mettre à jour les agences avec leurs chefs
    UPDATE agencies SET chef_agence_id = chef1_id WHERE id = agency1_id;
    UPDATE agencies SET chef_agence_id = chef2_id WHERE id = agency2_id;
    
    RAISE NOTICE 'Chefs d''agence créés: % et %', chef1_id, chef2_id;
END $$;

-- 7. CRÉATION DES AGENTS
-- =============================================================================
DO $$
DECLARE
    agent_id TEXT;
    agency1_id INT;
    agency2_id INT;
    i INT;
    agent_names TEXT[] := ARRAY[
        'Ousmane Cissé', 'Fatou Keita', 'Ibrahim Bah', 'Khadija Sow',
        'Seydou Camara', 'Bineta Fofana', 'Cheikh Doumbia', 'Adama Sanogo',
        'Moussa Barry'
    ];
    agent_emails TEXT[] := ARRAY[
        'agent1.douala@transflow.com', 'agent2.douala@transflow.com', 
        'agent3.douala@transflow.com', 'agent4.douala@transflow.com',
        'agent1.yaoundé@transflow.com', 'agent2.yaoundé@transflow.com',
        'agent3.yaoundé@transflow.com', 'agent4.yaoundé@transflow.com',
        'agent5.yaoundé@transflow.com'
    ];
BEGIN
    -- Récupérer les IDs des agences
    SELECT id INTO agency1_id FROM agencies WHERE name = 'Agence de Douala' LIMIT 1;
    SELECT id INTO agency2_id FROM agencies WHERE name = 'Agence de Yaoundé' LIMIT 1;
    
    -- Créer les agents
    FOR i IN 1..9 LOOP
        IF i <= 4 THEN
            -- Agents de Douala
            SELECT create_agent(
                agent_names[i],
                agent_emails[i],
                'Demo123!',
                agency1_id
            ) INTO agent_id;
        ELSE
            -- Agents de Yaoundé
            SELECT create_agent(
                agent_names[i],
                agent_emails[i],
                'Demo123!',
                agency2_id
            ) INTO agent_id;
        END IF;
        
        RAISE NOTICE 'Agent créé: % avec email %', agent_names[i], agent_emails[i];
    END LOOP;
END $$;

-- 8. CRÉATION D'UN COMPTE DÉVELOPPEUR
-- =============================================================================
-- Le compte développeur n'a pas de fonction RPC dédiée, on l'ajoute manuellement
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_user_meta_data
) VALUES (
    gen_random_uuid(),
    'developer@transflow.com',
    crypt('Demo123!', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"name": "Développeur System"}'::jsonb
) ON CONFLICT (email) DO NOTHING;

-- Ajouter le profil développeur
INSERT INTO profiles (
    id,
    email,
    name,
    first_name,
    last_name,
    role_id,
    agency_id,
    balance,
    is_active,
    created_at,
    updated_at
) 
SELECT 
    au.id,
    'developer@transflow.com',
    'Développeur System',
    'Développeur',
    'System',
    5, -- role_id pour developer
    null,
    0.0,
    true,
    now(),
    now()
FROM auth.users au 
WHERE au.email = 'developer@transflow.com'
ON CONFLICT (id) DO NOTHING;

-- 9. CRÉATION D'OPÉRATIONS D'EXEMPLE
-- =============================================================================
-- Opérations en attente (pending)
INSERT INTO operations (
    id, operation_type_id, reference_number, initiator_id, agency_id, 
    amount, currency, status, operation_data, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    ot.id,
    'OP' || to_char(now(), 'YYYYMMDDHH24MISS') || lpad((row_number() OVER())::text, 3, '0'),
    p.id,
    p.agency_id,
    15000 + (random() * 35000)::numeric,
    'XOF',
    'pending',
    jsonb_build_object(
        'phone_number', '+221' || (70000000 + (random() * 9999999)::int)::text,
        'amount', 15000 + (random() * 35000)::numeric
    ),
    now() - (random() * interval '7 days'),
    now()
FROM operation_types ot
CROSS JOIN (
    SELECT p.* FROM profiles p 
    JOIN roles r ON p.role_id = r.id 
    WHERE r.name = 'agent' 
    LIMIT 5
) p
WHERE ot.impacts_balance = true
LIMIT 15;

-- Opérations complétées
INSERT INTO operations (
    id, operation_type_id, reference_number, initiator_id, agency_id, 
    amount, currency, status, operation_data, validator_id, validated_at, completed_at, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    ot.id,
    'OP' || to_char(now(), 'YYYYMMDDHH24MISS') || lpad((1000 + row_number() OVER())::text, 3, '0'),
    p.id,
    p.agency_id,
    5000 + (random() * 45000)::numeric,
    'XOF',
    'completed',
    jsonb_build_object(
        'phone_number', '+221' || (70000000 + (random() * 9999999)::int)::text,
        'amount', 5000 + (random() * 45000)::numeric
    ),
    admin_p.id,
    now() - (random() * interval '2 days'),
    now() - (random() * interval '2 days'),
    now() - (random() * interval '30 days'),
    now()
FROM operation_types ot
CROSS JOIN (
    SELECT p.* FROM profiles p 
    JOIN roles r ON p.role_id = r.id 
    WHERE r.name = 'agent' 
    LIMIT 6
) p
CROSS JOIN (
    SELECT p.* FROM profiles p 
    JOIN roles r ON p.role_id = r.id 
    WHERE r.name IN ('admin_general', 'sous_admin') 
    LIMIT 1
) admin_p
WHERE ot.impacts_balance = true
LIMIT 25;

-- Quelques opérations échouées
INSERT INTO operations (
    id, operation_type_id, reference_number, initiator_id, agency_id, 
    amount, currency, status, operation_data, validator_id, validated_at, error_message, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    ot.id,
    'OP' || to_char(now(), 'YYYYMMDDHH24MISS') || lpad((2000 + row_number() OVER())::text, 3, '0'),
    p.id,
    p.agency_id,
    10000 + (random() * 20000)::numeric,
    'XOF',
    'failed',
    jsonb_build_object(
        'phone_number', '+221' || (70000000 + (random() * 9999999)::int)::text,
        'amount', 10000 + (random() * 20000)::numeric
    ),
    admin_p.id,
    now() - (random() * interval '5 days'),
    CASE 
        WHEN random() < 0.3 THEN 'Preuve de paiement illisible'
        WHEN random() < 0.6 THEN 'Informations du bénéficiaire incorrectes'
        ELSE 'Montant insuffisant sur le compte'
    END,
    now() - (random() * interval '15 days'),
    now()
FROM operation_types ot
CROSS JOIN (
    SELECT p.* FROM profiles p 
    JOIN roles r ON p.role_id = r.id 
    WHERE r.name = 'agent' 
    LIMIT 3
) p
CROSS JOIN (
    SELECT p.* FROM profiles p 
    JOIN roles r ON p.role_id = r.id 
    WHERE r.name IN ('admin_general', 'sous_admin') 
    LIMIT 1
) admin_p
WHERE ot.impacts_balance = true
LIMIT 8;

-- 10. CRÉATION DES ENREGISTREMENTS DE COMMISSION
-- =============================================================================
INSERT INTO commission_records (
    id, operation_id, agent_id, chef_agence_id, commission_rule_id,
    agent_commission, chef_commission, total_commission, status, paid_at, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    o.id,
    o.initiator_id,
    chef.id,
    cr.id,
    (o.amount * 0.025 * 0.7)::numeric(15,2), -- 70% pour l'agent
    (o.amount * 0.025 * 0.3)::numeric(15,2), -- 30% pour le chef
    (o.amount * 0.025)::numeric(15,2),
    'paid',
    o.completed_at,
    o.created_at,
    now()
FROM operations o
JOIN operation_types ot ON o.operation_type_id = ot.id
JOIN commission_rules cr ON cr.operation_type_id = ot.id
JOIN profiles agent ON o.initiator_id = agent.id
JOIN profiles chef ON chef.agency_id = agent.agency_id AND chef.role_id = 2 -- chef_agence
WHERE o.status = 'completed' AND ot.impacts_balance = true;

-- 11. CRÉATION DU JOURNAL DES TRANSACTIONS
-- =============================================================================
INSERT INTO transaction_ledger (
    id, user_id, operation_id, transaction_type, amount, 
    balance_before, balance_after, description, metadata, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    o.initiator_id,
    o.id,
    'debit',
    o.amount,
    25000.0, -- Solde avant fictif
    25000.0 - o.amount,
    'Opération ' || o.reference_number,
    jsonb_build_object(
        'operation_type', ot.name,
        'reference', o.reference_number
    ),
    o.completed_at,
    now()
FROM operations o
JOIN operation_types ot ON o.operation_type_id = ot.id
WHERE o.status = 'completed' AND ot.impacts_balance = true;

-- 12. CRÉATION DE TICKETS DE RECHARGE
-- =============================================================================
INSERT INTO request_tickets (
    id, ticket_number, requester_id, assigned_to_id, ticket_type, priority, status,
    title, description, requested_amount, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    'TCK' || to_char(now(), 'YYYYMMDDHH24MISS') || lpad((row_number() OVER())::text, 3, '0'),
    agent.id,
    chef.id,
    'recharge',
    CASE 
        WHEN random() < 0.5 THEN 'medium'
        ELSE 'high'
    END,
    'open',
    'Demande de recharge - ' || agent.name,
    'Demande de recharge pour poursuivre les opérations',
    20000 + (random() * 30000)::numeric,
    now() - (random() * interval '3 days'),
    now()
FROM (
    SELECT p.* FROM profiles p 
    JOIN roles r ON p.role_id = r.id 
    WHERE r.name = 'agent' 
    LIMIT 3
) agent
JOIN (
    SELECT p.* FROM profiles p 
    JOIN roles r ON p.role_id = r.id 
    WHERE r.name = 'chef_agence'
    LIMIT 1
) chef ON true;

-- Ticket résolu
INSERT INTO request_tickets (
    id, ticket_number, requester_id, assigned_to_id, resolved_by_id, ticket_type, priority, status,
    title, description, requested_amount, resolution_notes, resolved_at, created_at, updated_at
)
SELECT 
    gen_random_uuid(),
    'TCK' || to_char(now(), 'YYYYMMDDHH24MISS') || '999',
    agent.id,
    admin.id,
    admin.id,
    'recharge',
    'medium',
    'resolved',
    'Demande de recharge - ' || agent.name,
    'Demande de recharge de 30000 XOF pour poursuivre les opérations',
    30000,
    'Recharge effectuée avec succès',
    now() - interval '1 day',
    now() - interval '5 days',
    now()
FROM (
    SELECT p.* FROM profiles p 
    JOIN roles r ON p.role_id = r.id 
    WHERE r.name = 'agent' 
    LIMIT 1
) agent
JOIN (
    SELECT p.* FROM profiles p 
    JOIN roles r ON p.role_id = r.id 
    WHERE r.name = 'admin_general'
    LIMIT 1
) admin ON true;

-- 13. CRÉATION DE NOTIFICATIONS
-- =============================================================================
INSERT INTO notifications (
    id, recipient_id, notification_type, title, message, priority, is_read, created_at
)
SELECT 
    gen_random_uuid(),
    p.id,
    'operation',
    'Opération validée',
    'Votre opération a été validée avec succès',
    'normal',
    random() < 0.5,
    now() - (random() * interval '7 days')
FROM profiles p
JOIN roles r ON p.role_id = r.id
WHERE r.name = 'agent'
LIMIT 10;

-- Notifications pour admins
INSERT INTO notifications (
    id, recipient_id, notification_type, title, message, priority, is_read, created_at
)
SELECT 
    gen_random_uuid(),
    p.id,
    'validation',
    'Opérations en attente',
    'Il y a des opérations en attente de validation',
    'high',
    false,
    now()
FROM profiles p
JOIN roles r ON p.role_id = r.id
WHERE r.name IN ('admin_general', 'sous_admin');

-- 14. PARAMÈTRES SYSTÈME
-- =============================================================================
INSERT INTO system_settings (id, config, updated_by, updated_at)
VALUES (
    1,
    jsonb_build_object(
        'app_name', 'TransFlow Nexus',
        'app_version', '1.0.0',
        'currency', 'XOF',
        'default_commission_rate', 0.025,
        'max_daily_operations', 100,
        'max_operation_amount', 500000,
        'notification_settings', jsonb_build_object(
            'email_notifications', true,
            'sms_notifications', false,
            'push_notifications', true
        ),
        'business_rules', jsonb_build_object(
            'auto_approve_under', 10000,
            'require_dual_approval_over', 100000,
            'commission_splits', jsonb_build_object(
                'agent', 0.7,
                'chef_agence', 0.3
            )
        )
    ),
    'system',
    now()
) ON CONFLICT (id) DO UPDATE SET
    config = EXCLUDED.config,
    updated_by = EXCLUDED.updated_by,
    updated_at = EXCLUDED.updated_at;

-- =============================================================================
-- RAPPORT FINAL
-- =============================================================================
DO $$
DECLARE
    user_count INT;
    agency_count INT;
    operation_count INT;
    operation_type_count INT;
BEGIN
    SELECT COUNT(*) INTO user_count FROM profiles;
    SELECT COUNT(*) INTO agency_count FROM agencies;
    SELECT COUNT(*) INTO operation_count FROM operations;
    SELECT COUNT(*) INTO operation_type_count FROM operation_types;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== RAPPORT DE GÉNÉRATION DES DONNÉES MOCK ===';
    RAISE NOTICE 'Utilisateurs créés: %', user_count;
    RAISE NOTICE 'Agences créées: %', agency_count;
    RAISE NOTICE 'Types d''opérations: %', operation_type_count;
    RAISE NOTICE 'Opérations créées: %', operation_count;
    RAISE NOTICE '';
    RAISE NOTICE 'COMPTES DE CONNEXION (mot de passe: Demo123!):';
    RAISE NOTICE '• admin.general@transflow.com';
    RAISE NOTICE '• sous.admin@transflow.com'; 
    RAISE NOTICE '• developer@transflow.com';
    RAISE NOTICE '• chef.douala@transflow.com';
    RAISE NOTICE '• chef.yaoundé@transflow.com';
    RAISE NOTICE '• agent1.douala@transflow.com';
    RAISE NOTICE '• agent2.douala@transflow.com';
    RAISE NOTICE '• agent1.yaoundé@transflow.com';
    RAISE NOTICE '• ... (et d''autres agents)';
    RAISE NOTICE '';
    RAISE NOTICE '✅ GÉNÉRATION TERMINÉE AVEC SUCCÈS!';
    RAISE NOTICE '===============================================';
END $$;