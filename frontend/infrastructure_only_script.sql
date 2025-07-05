-- =====================================================================
-- SCRIPT SQL INFRASTRUCTURE - TRANSFLOW NEXUS (PHASE 1)
-- Crée toute l'infrastructure sans les comptes utilisateurs
-- =====================================================================

-- Désactiver temporairement RLS pour permettre l'insertion
ALTER TABLE agencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE operation_types DISABLE ROW LEVEL SECURITY;
ALTER TABLE commission_rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings DISABLE ROW LEVEL SECURITY;

-- =====================================================================
-- 1. CRÉATION DES AGENCES
-- =====================================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM agencies WHERE name = 'Agence de Douala') THEN
        INSERT INTO agencies (name, city, is_active, created_at, updated_at) 
        VALUES ('Agence de Douala', 'Douala', true, now(), now());
        RAISE NOTICE 'Agence de Douala créée';
    ELSE
        RAISE NOTICE 'Agence de Douala existe déjà';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM agencies WHERE name = 'Agence de Yaoundé') THEN
        INSERT INTO agencies (name, city, is_active, created_at, updated_at) 
        VALUES ('Agence de Yaoundé', 'Yaoundé', true, now(), now());
        RAISE NOTICE 'Agence de Yaoundé créée';
    ELSE
        RAISE NOTICE 'Agence de Yaoundé existe déjà';
    END IF;
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
        RAISE NOTICE 'Type: Dépôt Orange Money créé';
    END IF;
    
    -- Retrait MTN MoMo
    IF NOT EXISTS (SELECT 1 FROM operation_types WHERE name = 'Retrait MTN MoMo') THEN
        INSERT INTO operation_types (id, name, description, impacts_balance, is_active, status, created_at, updated_at)
        VALUES (gen_random_uuid(), 'Retrait MTN MoMo', 'Retrait d''argent depuis compte MTN Mobile Money', true, true, 'active', now(), now());
        RAISE NOTICE 'Type: Retrait MTN MoMo créé';
    END IF;
    
    -- Paiement Facture ENEO
    IF NOT EXISTS (SELECT 1 FROM operation_types WHERE name = 'Paiement Facture ENEO') THEN
        INSERT INTO operation_types (id, name, description, impacts_balance, is_active, status, created_at, updated_at)
        VALUES (gen_random_uuid(), 'Paiement Facture ENEO', 'Paiement facture électricité ENEO', true, true, 'active', now(), now());
        RAISE NOTICE 'Type: Paiement Facture ENEO créé';
    END IF;
    
    -- Paiement Abonnement Canal+
    IF NOT EXISTS (SELECT 1 FROM operation_types WHERE name = 'Paiement Abonnement Canal+') THEN
        INSERT INTO operation_types (id, name, description, impacts_balance, is_active, status, created_at, updated_at)
        VALUES (gen_random_uuid(), 'Paiement Abonnement Canal+', 'Paiement abonnement télévision Canal+', true, true, 'active', now(), now());
        RAISE NOTICE 'Type: Paiement Abonnement Canal+ créé';
    END IF;
    
    -- Enregistrement KYC Client
    IF NOT EXISTS (SELECT 1 FROM operation_types WHERE name = 'Enregistrement KYC Client') THEN
        INSERT INTO operation_types (id, name, description, impacts_balance, is_active, status, created_at, updated_at)
        VALUES (gen_random_uuid(), 'Enregistrement KYC Client', 'Enregistrement et vérification identité client', false, true, 'active', now(), now());
        RAISE NOTICE 'Type: Enregistrement KYC Client créé';
    END IF;
    
    -- Transfert Western Union
    IF NOT EXISTS (SELECT 1 FROM operation_types WHERE name = 'Transfert Western Union') THEN
        INSERT INTO operation_types (id, name, description, impacts_balance, is_active, status, created_at, updated_at)
        VALUES (gen_random_uuid(), 'Transfert Western Union', 'Envoi d''argent via Western Union', true, true, 'active', now(), now());
        RAISE NOTICE 'Type: Transfert Western Union créé';
    END IF;
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
-- 4. PARAMÈTRES SYSTÈME
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
        RAISE NOTICE 'Paramètres système créés';
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
        RAISE NOTICE 'Paramètres système mis à jour';
    END IF;
END $$;

-- =====================================================================
-- RÉACTIVER RLS
-- =====================================================================

ALTER TABLE agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE operation_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- =====================================================================
-- RAPPORT INFRASTRUCTURE
-- =====================================================================

DO $$
DECLARE
    agency_count int;
    operation_type_count int;
    commission_rule_count int;
BEGIN
    SELECT COUNT(*) INTO agency_count FROM agencies;
    SELECT COUNT(*) INTO operation_type_count FROM operation_types;
    SELECT COUNT(*) INTO commission_rule_count FROM commission_rules;
    
    RAISE NOTICE '';
    RAISE NOTICE '=== RAPPORT INFRASTRUCTURE TRANSFLOW NEXUS ===';
    RAISE NOTICE 'Agences créées: %', agency_count;
    RAISE NOTICE 'Types d''opérations: %', operation_type_count;
    RAISE NOTICE 'Règles de commission: %', commission_rule_count;
    RAISE NOTICE '';
    RAISE NOTICE '✅ INFRASTRUCTURE CRÉÉE AVEC SUCCÈS!';
    RAISE NOTICE '';
    RAISE NOTICE '📋 PROCHAINES ÉTAPES:';
    RAISE NOTICE '1. Créer des comptes utilisateurs via l''interface Supabase Auth';
    RAISE NOTICE '2. Ajouter les profils utilisateurs dans la table profiles';
    RAISE NOTICE '3. Créer des opérations de démonstration';
    RAISE NOTICE '';
    RAISE NOTICE '🔗 Voir les instructions détaillées dans le guide';
    RAISE NOTICE '===============================================';
END $$;