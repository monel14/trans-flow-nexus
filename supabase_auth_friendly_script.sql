-- =====================================================================
-- SCRIPT SQL COMPATIBLE SUPABASE AUTH - GÉNÉRATION DE DONNÉES MOCK
-- Version qui respecte les contraintes d'authentification Supabase
-- =====================================================================

-- Désactiver temporairement RLS pour permettre l'insertion
ALTER TABLE agencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE operation_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE operations DISABLE ROW LEVEL SECURITY;
ALTER TABLE commission_rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE commission_records DISABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_ledger DISABLE ROW LEVEL SECURITY;
ALTER TABLE request_tickets DISABLE ROW LEVEL SECURITY;
ALTER TABLE notifications DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings DISABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 1. CRÉATION DES AGENCES
-- =====================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM agencies WHERE name = 'Agence de Douala') THEN
        INSERT INTO agencies (name, city, is_active, created_at, updated_at) 
        VALUES ('Agence de Douala', 'Douala', true, now(), now());
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM agencies WHERE name = 'Agence de Yaoundé') THEN
        INSERT INTO agencies (name, city, is_active, created_at, updated_at) 
        VALUES ('Agence de Yaoundé', 'Yaoundé', true, now(), now());
    END IF;
    
    RAISE NOTICE 'Agences créées ou vérifiées';
END $$;

-- =====================================================================
-- 2. CRÉATION DES TYPES D'OPÉRATIONS RÉALISTES OUEST-AFRICAINS
-- =====================================================================

DO $$
BEGIN
    -- Dépôt Orange Money
    IF NOT EXISTS (SELECT 1 FROM operation_types WHERE name = 'Dépôt Orange Money') THEN
        INSERT INTO operation_types (id, name, description, impacts_balance, is_active, status, created_at, updated_at)
        VALUES (gen_random_uuid(), 'Dépôt Orange Money', 'Dépôt d''argent sur compte Orange Money', true, true, 'active', now(), now());
    END IF;
    
    -- Retrait MTN MoMo
    IF NOT EXISTS (SELECT 1 FROM operation_types WHERE name = 'Retrait MTN MoMo') THEN
        INSERT INTO operation_types (id, name, description, impacts_balance, is_active, status, created_at, updated_at)
        VALUES (gen_random_uuid(), 'Retrait MTN MoMo', 'Retrait d''argent depuis compte MTN Mobile Money', true, true, 'active', now(), now());
    END IF;
    
    -- Paiement Facture ENEO
    IF NOT EXISTS (SELECT 1 FROM operation_types WHERE name = 'Paiement Facture ENEO') THEN
        INSERT INTO operation_types (id, name, description, impacts_balance, is_active, status, created_at, updated_at)
        VALUES (gen_random_uuid(), 'Paiement Facture ENEO', 'Paiement facture électricité ENEO', true, true, 'active', now(), now());
    END IF;
    
    -- Paiement Abonnement Canal+
    IF NOT EXISTS (SELECT 1 FROM operation_types WHERE name = 'Paiement Abonnement Canal+') THEN
        INSERT INTO operation_types (id, name, description, impacts_balance, is_active, status, created_at, updated_at)
        VALUES (gen_random_uuid(), 'Paiement Abonnement Canal+', 'Paiement abonnement télévision Canal+', true, true, 'active', now(), now());
    END IF;
    
    -- Enregistrement KYC Client
    IF NOT EXISTS (SELECT 1 FROM operation_types WHERE name = 'Enregistrement KYC Client') THEN
        INSERT INTO operation_types (id, name, description, impacts_balance, is_active, status, created_at, updated_at)
        VALUES (gen_random_uuid(), 'Enregistrement KYC Client', 'Enregistrement et vérification identité client', false, true, 'active', now(), now());
    END IF;
    
    -- Transfert Western Union
    IF NOT EXISTS (SELECT 1 FROM operation_types WHERE name = 'Transfert Western Union') THEN
        INSERT INTO operation_types (id, name, description, impacts_balance, is_active, status, created_at, updated_at)
        VALUES (gen_random_uuid(), 'Transfert Western Union', 'Envoi d''argent via Western Union', true, true, 'active', now(), now());
    END IF;
    
    RAISE NOTICE 'Types d''opérations créés ou vérifiés';
END $$;

-- =====================================================================
-- 3. CRÉATION DES RÈGLES DE COMMISSION (2.5% par défaut)
-- =====================================================================

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
AND NOT EXISTS (
    SELECT 1 FROM commission_rules cr 
    WHERE cr.operation_type_id = ot.id
);

-- =====================================================================
-- 4. TEMPORAIREMENT DÉSACTIVER LA CONTRAINTE FOREIGN KEY
-- =====================================================================

-- Désactiver temporairement la contrainte foreign key pour profiles_id_fkey
ALTER TABLE profiles DISABLE TRIGGER ALL;

-- =====================================================================
-- 5. CRÉATION DES COMPTES UTILISATEURS AVEC IDs FICTIFS
-- =====================================================================

-- 5.1 Admin Général
DO $$
DECLARE
    user_id uuid := gen_random_uuid();
BEGIN
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'admin.general@transflow.com') THEN
        INSERT INTO profiles (
            id, email, name, first_name, last_name, role_id, agency_id,
            balance, is_active, created_at, updated_at
        ) VALUES (
            user_id,
            'admin.general@transflow.com',
            'Admin Général',
            'Admin',
            'Général',
            3, -- admin_general role_id
            null,
            0.0,
            true,
            now(),
            now()
        );
        RAISE NOTICE 'Admin général créé: %', user_id;
    ELSE
        RAISE NOTICE 'Admin général existe déjà';
    END IF;
END $$;

-- 5.2 Sous-Admin
DO $$
DECLARE
    user_id uuid := gen_random_uuid();
BEGIN
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'sous.admin@transflow.com') THEN
        INSERT INTO profiles (
            id, email, name, first_name, last_name, role_id, agency_id,
            balance, is_active, created_at, updated_at
        ) VALUES (
            user_id,
            'sous.admin@transflow.com',
            'Sous Administrateur',
            'Sous',
            'Administrateur',
            4, -- sous_admin role_id
            null,
            0.0,
            true,
            now(),
            now()
        );
        RAISE NOTICE 'Sous-admin créé: %', user_id;
    ELSE
        RAISE NOTICE 'Sous-admin existe déjà';
    END IF;
END $$;

-- 5.3 Développeur
DO $$
DECLARE
    user_id uuid := gen_random_uuid();
BEGIN
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'developer@transflow.com') THEN
        INSERT INTO profiles (
            id, email, name, first_name, last_name, role_id, agency_id,
            balance, is_active, created_at, updated_at
        ) VALUES (
            user_id,
            'developer@transflow.com',
            'Développeur System',
            'Développeur',
            'System',
            5, -- developer role_id
            null,
            0.0,
            true,
            now(),
            now()
        );
        RAISE NOTICE 'Développeur créé: %', user_id;
    ELSE
        RAISE NOTICE 'Développeur existe déjà';
    END IF;
END $$;

-- 5.4 Chefs d'agence
DO $$
DECLARE
    chef1_id uuid := gen_random_uuid();
    chef2_id uuid := gen_random_uuid();
    agency1_id int;
    agency2_id int;
BEGIN
    -- Récupérer les IDs des agences
    SELECT id INTO agency1_id FROM agencies WHERE name = 'Agence de Douala' LIMIT 1;
    SELECT id INTO agency2_id FROM agencies WHERE name = 'Agence de Yaoundé' LIMIT 1;
    
    -- Chef Douala
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'chef.douala@transflow.com') THEN
        INSERT INTO profiles (
            id, email, name, first_name, last_name, role_id, agency_id,
            balance, is_active, created_at, updated_at
        ) VALUES (
            chef1_id,
            'chef.douala@transflow.com',
            'Mamadou Diallo',
            'Mamadou',
            'Diallo',
            2, -- chef_agence role_id
            agency1_id,
            50000.0,
            true,
            now(),
            now()
        );
        RAISE NOTICE 'Chef Douala créé: %', chef1_id;
    ELSE
        SELECT id INTO chef1_id FROM profiles WHERE email = 'chef.douala@transflow.com';
        RAISE NOTICE 'Chef Douala existe déjà: %', chef1_id;
    END IF;
    
    -- Chef Yaoundé
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = 'chef.yaoundé@transflow.com') THEN
        INSERT INTO profiles (
            id, email, name, first_name, last_name, role_id, agency_id,
            balance, is_active, created_at, updated_at
        ) VALUES (
            chef2_id,
            'chef.yaoundé@transflow.com',
            'Aminata Touré',
            'Aminata',
            'Touré',
            2, -- chef_agence role_id
            agency2_id,
            50000.0,
            true,
            now(),
            now()
        );
        RAISE NOTICE 'Chef Yaoundé créé: %', chef2_id;
    ELSE
        SELECT id INTO chef2_id FROM profiles WHERE email = 'chef.yaoundé@transflow.com';
        RAISE NOTICE 'Chef Yaoundé existe déjà: %', chef2_id;
    END IF;
    
    -- Mettre à jour les agences avec leurs chefs
    UPDATE agencies SET chef_agence_id = chef1_id WHERE id = agency1_id;
    UPDATE agencies SET chef_agence_id = chef2_id WHERE id = agency2_id;
    
    RAISE NOTICE 'Chefs d''agence assignés aux agences';
END $$;

-- 5.5 Agents (9 agents répartis entre les agences)
DO $$
DECLARE
    agent_id uuid;
    agency1_id int;
    agency2_id int;
    i int;
    agent_names text[] := ARRAY[
        'Ousmane Cissé', 'Fatou Keita', 'Ibrahim Bah', 'Khadija Sow',
        'Seydou Camara', 'Bineta Fofana', 'Cheikh Doumbia', 'Adama Sanogo',
        'Moussa Barry'
    ];
    agent_emails text[] := ARRAY[
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
        IF NOT EXISTS (SELECT 1 FROM profiles WHERE email = agent_emails[i]) THEN
            agent_id := gen_random_uuid();
            
            IF i <= 4 THEN
                -- Agents de Douala
                INSERT INTO profiles (
                    id, email, name, first_name, last_name, role_id, agency_id,
                    balance, is_active, created_at, updated_at
                ) VALUES (
                    agent_id,
                    agent_emails[i],
                    agent_names[i],
                    split_part(agent_names[i], ' ', 1),
                    split_part(agent_names[i], ' ', 2),
                    1, -- agent role_id
                    agency1_id,
                    25000.0 + (random() * 10000),
                    true,
                    now(),
                    now()
                );
            ELSE
                -- Agents de Yaoundé
                INSERT INTO profiles (
                    id, email, name, first_name, last_name, role_id, agency_id,
                    balance, is_active, created_at, updated_at
                ) VALUES (
                    agent_id,
                    agent_emails[i],
                    agent_names[i],
                    split_part(agent_names[i], ' ', 1),
                    split_part(agent_names[i], ' ', 2),
                    1, -- agent role_id
                    agency2_id,
                    25000.0 + (random() * 10000),
                    true,
                    now(),
                    now()
                );
            END IF;
            
            RAISE NOTICE 'Agent créé: %', agent_names[i];
        ELSE
            RAISE NOTICE 'Agent existe déjà: %', agent_names[i];
        END IF;
    END LOOP;
END $$;

-- =====================================================================
-- 6. RÉACTIVER LES TRIGGERS
-- =====================================================================

ALTER TABLE profiles ENABLE TRIGGER ALL;

-- =====================================================================
-- 7. CRÉATION D'OPÉRATIONS DE DÉMONSTRATION
-- =====================================================================

-- Vérifier qu'on a assez d'utilisateurs pour créer des opérations
DO $$
DECLARE
    agent_count int;
    admin_count int;
BEGIN
    SELECT COUNT(*) INTO agent_count FROM profiles p JOIN roles r ON p.role_id = r.id WHERE r.name = 'agent';
    SELECT COUNT(*) INTO admin_count FROM profiles p JOIN roles r ON p.role_id = r.id WHERE r.name IN ('admin_general', 'sous_admin');
    
    IF agent_count > 0 AND admin_count > 0 THEN
        RAISE NOTICE 'Création des opérations avec % agents et % admins', agent_count, admin_count;
        
        -- 7.1 Opérations en attente (15 opérations)
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
                'phone_number', '+237' || (650000000 + (random() * 99999999)::bigint)::text,
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
        
        -- 7.2 Opérations complétées (25 opérations)
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
                'phone_number', '+237' || (650000000 + (random() * 99999999)::bigint)::text,
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
        
        -- 7.3 Opérations échouées (8 opérations)
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
                'phone_number', '+237' || (650000000 + (random() * 99999999)::bigint)::text,
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
        
    ELSE
        RAISE NOTICE 'Pas assez d''utilisateurs pour créer des opérations';
    END IF;
END $$;

-- =====================================================================
-- 8. CRÉATION DES ENREGISTREMENTS DE COMMISSION
-- =====================================================================

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

-- =====================================================================
-- 9. PARAMÈTRES SYSTÈME
-- =====================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM system_settings WHERE id = 1) THEN
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
        );
    ELSE
        UPDATE system_settings SET
            config = jsonb_build_object(
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
            updated_by = 'system',
            updated_at = now()
        WHERE id = 1;
    END IF;
    
    RAISE NOTICE 'Paramètres système configurés';
END $$;

-- =====================================================================
-- 10. RÉACTIVER RLS
-- =====================================================================

ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE request_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- RAPPORT FINAL
-- =====================================================================

DO $$
DECLARE
    user_count int;
    agency_count int;
    operation_count int;
    operation_type_count int;
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
    RAISE NOTICE 'COMPTES DE DÉMONSTRATION CRÉÉS:';
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
    RAISE NOTICE '⚠️  IMPORTANT: Ces comptes sont pour DÉMONSTRATION uniquement';
    RAISE NOTICE '   Ils ne peuvent pas se connecter via l''authentification Supabase';
    RAISE NOTICE '   Pour tester l''authentification, créez des comptes via l''interface';
    RAISE NOTICE '';
    RAISE NOTICE '✅ GÉNÉRATION TERMINÉE AVEC SUCCÈS!';
    RAISE NOTICE '===============================================';
END $$;