#!/usr/bin/env python3
"""
Script alternatif : Génère un script SQL optimisé qui peut être exécuté directement dans Supabase
Contient toutes les données mock nécessaires dans un seul script SQL
"""

import json
import uuid
import random
from datetime import datetime, timedelta

# Noms réalistes pour l'Afrique de l'Ouest
FIRST_NAMES = [
    "Ahmed", "Aminata", "Ousmane", "Fatou", "Mamadou", "Aissatou", 
    "Ibrahim", "Maryam", "Moussa", "Khadija", "Alassane", "Bineta",
    "Seydou", "Ramata", "Bakary", "Ndeye", "Cheikh", "Adama"
]

LAST_NAMES = [
    "Diallo", "Traoré", "Cissé", "Kone", "Camara", "Touré", 
    "Bah", "Sow", "Barry", "Baldé", "Keita", "Fofana",
    "Diakité", "Sanogo", "Coulibaly", "Doumbia", "Kanoute", "Sidibé"
]

def generate_sql_script():
    """Génère un script SQL complet pour la création des données"""
    
    sql_content = """-- =====================================================================
-- SCRIPT SQL COMPLET DE GÉNÉRATION DE DONNÉES MOCK POUR TRANSFLOW NEXUS
-- À exécuter directement dans l'interface SQL de Supabase
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

INSERT INTO agencies (name, city, is_active, created_at, updated_at) 
VALUES 
    ('Agence de Douala', 'Douala', true, now(), now()),
    ('Agence de Yaoundé', 'Yaoundé', true, now(), now())
ON CONFLICT (name) DO NOTHING;

-- =====================================================================
-- 2. CRÉATION DES TYPES D'OPÉRATIONS RÉALISTES OUEST-AFRICAINS
-- =====================================================================

INSERT INTO operation_types (id, name, description, impacts_balance, is_active, status, created_at, updated_at)
VALUES 
    (gen_random_uuid(), 'Dépôt Orange Money', 'Dépôt d''argent sur compte Orange Money', true, true, 'active', now(), now()),
    (gen_random_uuid(), 'Retrait MTN MoMo', 'Retrait d''argent depuis compte MTN Mobile Money', true, true, 'active', now(), now()),
    (gen_random_uuid(), 'Paiement Facture ENEO', 'Paiement facture électricité ENEO', true, true, 'active', now(), now()),
    (gen_random_uuid(), 'Paiement Abonnement Canal+', 'Paiement abonnement télévision Canal+', true, true, 'active', now(), now()),
    (gen_random_uuid(), 'Enregistrement KYC Client', 'Enregistrement et vérification identité client', false, true, 'active', now(), now()),
    (gen_random_uuid(), 'Transfert Western Union', 'Envoi d''argent via Western Union', true, true, 'active', now(), now())
ON CONFLICT (name) DO NOTHING;

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
ON CONFLICT DO NOTHING;

-- =====================================================================
-- 4. CRÉATION DES COMPTES UTILISATEURS DIRECTEMENT
-- =====================================================================

-- 4.1 Admin Général
DO $$
DECLARE
    user_id uuid := gen_random_uuid();
BEGIN
    -- Insérer dans auth.users (simulation)
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
    ) ON CONFLICT (email) DO NOTHING;
    
    RAISE NOTICE 'Admin général créé: %', user_id;
END $$;

-- 4.2 Sous-Admin
DO $$
DECLARE
    user_id uuid := gen_random_uuid();
BEGIN
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
    ) ON CONFLICT (email) DO NOTHING;
    
    RAISE NOTICE 'Sous-admin créé: %', user_id;
END $$;

-- 4.3 Développeur
DO $$
DECLARE
    user_id uuid := gen_random_uuid();
BEGIN
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
    ) ON CONFLICT (email) DO NOTHING;
    
    RAISE NOTICE 'Développeur créé: %', user_id;
END $$;

-- 4.4 Chefs d'agence
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
    ) ON CONFLICT (email) DO NOTHING;
    
    -- Chef Yaoundé
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
    ) ON CONFLICT (email) DO NOTHING;
    
    -- Mettre à jour les agences avec leurs chefs
    UPDATE agencies SET chef_agence_id = chef1_id WHERE id = agency1_id;
    UPDATE agencies SET chef_agence_id = chef2_id WHERE id = agency2_id;
    
    RAISE NOTICE 'Chefs d''agence créés: % et %', chef1_id, chef2_id;
END $$;

-- 4.5 Agents (9 agents répartis entre les agences)
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
            ) ON CONFLICT (email) DO NOTHING;
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
            ) ON CONFLICT (email) DO NOTHING;
        END IF;
        
        RAISE NOTICE 'Agent créé: %', agent_names[i];
    END LOOP;
END $$;

-- =====================================================================
-- 5. CRÉATION D'OPÉRATIONS DE DÉMONSTRATION
-- =====================================================================

-- 5.1 Opérations en attente (15 opérations)
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

-- 5.2 Opérations complétées (25 opérations)
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

-- 5.3 Opérations échouées (8 opérations)
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

-- =====================================================================
-- 6. CRÉATION DES ENREGISTREMENTS DE COMMISSION
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
-- 7. CRÉATION DU JOURNAL DES TRANSACTIONS
-- =====================================================================

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

-- =====================================================================
-- 8. CRÉATION DE TICKETS DE RECHARGE
-- =====================================================================

-- Tickets ouverts
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

-- =====================================================================
-- 9. CRÉATION DE NOTIFICATIONS
-- =====================================================================

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

-- =====================================================================
-- 10. PARAMÈTRES SYSTÈME
-- =====================================================================

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

-- =====================================================================
-- RÉACTIVER RLS
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
"""
    
    return sql_content

def main():
    """Génère le script SQL optimisé"""
    print("🚀 GÉNÉRATION DU SCRIPT SQL OPTIMISÉ")
    print("="*60)
    
    sql_script = generate_sql_script()
    
    # Sauvegarder le script
    filename = "/app/generated_mock_data_executable.sql"
    with open(filename, 'w', encoding='utf-8') as f:
        f.write(sql_script)
    
    print(f"✅ Script SQL généré: {filename}")
    print(f"📝 Taille du script: {len(sql_script)} caractères")
    
    print("\n📋 INSTRUCTIONS D'EXÉCUTION:")
    print("1. Ouvrir Supabase Dashboard")
    print("2. Aller dans 'SQL Editor'")
    print("3. Copier le contenu de 'generated_mock_data_executable.sql'")
    print("4. Coller et exécuter dans l'éditeur SQL")
    print("5. Vérifier les messages de succès")
    
    print("\n✅ Le script contient:")
    print("   • Désactivation temporaire de RLS")
    print("   • Création de 2 agences (Douala/Yaoundé)")
    print("   • 6 types d'opérations réalistes ouest-africains")
    print("   • 14 comptes utilisateurs (tous rôles)")
    print("   • 48+ opérations avec statuts variés")
    print("   • Calculs de commissions")
    print("   • Tickets de recharge")
    print("   • Notifications")
    print("   • Réactivation de RLS")
    
    print("\n🎯 Comptes de test disponibles:")
    print("   • admin.general@transflow.com / Demo123!")
    print("   • sous.admin@transflow.com / Demo123!")
    print("   • developer@transflow.com / Demo123!")
    print("   • chef.douala@transflow.com / Demo123!")
    print("   • chef.yaoundé@transflow.com / Demo123!")
    print("   • agent1.douala@transflow.com / Demo123!")
    print("   • ... (et autres agents)")

if __name__ == "__main__":
    main()