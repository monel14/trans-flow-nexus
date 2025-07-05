-- ===============================================
-- SCRIPT DE VÉRIFICATION DES DONNÉES MOCK
-- TransFlow Nexus - Validation complète
-- ===============================================

-- Ce script vérifie que toutes les données mock ont été créées correctement

-- ===============================================
-- 1. VÉRIFICATION DES RÔLES
-- ===============================================
DO $$
DECLARE
    role_count integer;
BEGIN
    SELECT COUNT(*) INTO role_count FROM public.roles WHERE is_active = true;
    RAISE NOTICE '📋 Rôles créés: % (attendu: 5)', role_count;
    
    IF role_count >= 5 THEN
        RAISE NOTICE '✅ Rôles: OK';
    ELSE
        RAISE NOTICE '❌ Rôles: MANQUANTS';
    END IF;
END
$$;

-- ===============================================
-- 2. VÉRIFICATION DES AGENCES
-- ===============================================
DO $$
DECLARE
    agency_count integer;
    total_balance numeric;
BEGIN
    SELECT COUNT(*), COALESCE(SUM(balance), 0) 
    INTO agency_count, total_balance 
    FROM public.agencies WHERE is_active = true;
    
    RAISE NOTICE '🏢 Agences créées: % (attendu: 4)', agency_count;
    RAISE NOTICE '💰 Balance totale agences: % XOF', total_balance;
    
    IF agency_count >= 4 THEN
        RAISE NOTICE '✅ Agences: OK';
    ELSE
        RAISE NOTICE '❌ Agences: MANQUANTES';
    END IF;
END
$$;

-- ===============================================
-- 3. VÉRIFICATION DES TYPES D'OPÉRATIONS
-- ===============================================
DO $$
DECLARE
    operation_type_count integer;
    field_count integer;
BEGIN
    SELECT COUNT(*) INTO operation_type_count 
    FROM public.operation_types WHERE is_active = true;
    
    SELECT COUNT(*) INTO field_count 
    FROM public.operation_type_fields WHERE is_obsolete = false;
    
    RAISE NOTICE '🔧 Types d''opérations: % (attendu: 7)', operation_type_count;
    RAISE NOTICE '📝 Champs configurés: % (attendu: 12+)', field_count;
    
    IF operation_type_count >= 7 AND field_count >= 12 THEN
        RAISE NOTICE '✅ Types d''opérations: OK';
    ELSE
        RAISE NOTICE '❌ Types d''opérations: INCOMPLETS';
    END IF;
END
$$;

-- ===============================================
-- 4. VÉRIFICATION DES RÈGLES DE COMMISSION
-- ===============================================
DO $$
DECLARE
    commission_rule_count integer;
BEGIN
    SELECT COUNT(*) INTO commission_rule_count 
    FROM public.commission_rules WHERE is_active = true;
    
    RAISE NOTICE '💼 Règles de commission: % (attendu: 7)', commission_rule_count;
    
    IF commission_rule_count >= 7 THEN
        RAISE NOTICE '✅ Règles de commission: OK';
    ELSE
        RAISE NOTICE '❌ Règles de commission: MANQUANTES';
    END IF;
END
$$;

-- ===============================================
-- 5. VÉRIFICATION DES PROFILS
-- ===============================================
DO $$
DECLARE
    admin_count integer;
    chef_count integer;
    agent_count integer;
    dev_count integer;
BEGIN
    SELECT COUNT(*) INTO admin_count 
    FROM public.profiles p JOIN public.roles r ON p.role_id = r.id 
    WHERE r.name IN ('admin_general', 'sous_admin') AND p.is_active = true;
    
    SELECT COUNT(*) INTO chef_count 
    FROM public.profiles p JOIN public.roles r ON p.role_id = r.id 
    WHERE r.name = 'chef_agence' AND p.is_active = true;
    
    SELECT COUNT(*) INTO agent_count 
    FROM public.profiles p JOIN public.roles r ON p.role_id = r.id 
    WHERE r.name = 'agent' AND p.is_active = true;
    
    SELECT COUNT(*) INTO dev_count 
    FROM public.profiles p JOIN public.roles r ON p.role_id = r.id 
    WHERE r.name = 'developer' AND p.is_active = true;
    
    RAISE NOTICE '👥 Profils créés:';
    RAISE NOTICE '   - Admins: % (attendu: 2)', admin_count;
    RAISE NOTICE '   - Chefs d''agence: % (attendu: 3)', chef_count;
    RAISE NOTICE '   - Agents: % (attendu: 6)', agent_count;
    RAISE NOTICE '   - Développeurs: % (attendu: 1)', dev_count;
    
    IF admin_count >= 2 AND chef_count >= 3 AND agent_count >= 6 AND dev_count >= 1 THEN
        RAISE NOTICE '✅ Profils: OK';
    ELSE
        RAISE NOTICE '❌ Profils: INCOMPLETS';
    END IF;
END
$$;

-- ===============================================
-- 6. VÉRIFICATION DES OPÉRATIONS
-- ===============================================
DO $$
DECLARE
    operation_count integer;
    completed_count integer;
    pending_count integer;
    failed_count integer;
    total_amount numeric;
BEGIN
    SELECT COUNT(*) INTO operation_count FROM public.operations;
    
    SELECT COUNT(*) INTO completed_count 
    FROM public.operations WHERE status = 'completed';
    
    SELECT COUNT(*) INTO pending_count 
    FROM public.operations WHERE status IN ('pending', 'validation_required');
    
    SELECT COUNT(*) INTO failed_count 
    FROM public.operations WHERE status = 'failed';
    
    SELECT COALESCE(SUM(amount), 0) INTO total_amount 
    FROM public.operations WHERE status = 'completed';
    
    RAISE NOTICE '📊 Opérations créées: % (attendu: 15+)', operation_count;
    RAISE NOTICE '   - Complétées: %', completed_count;
    RAISE NOTICE '   - En attente: %', pending_count;
    RAISE NOTICE '   - Échouées: %', failed_count;
    RAISE NOTICE '   - Montant total traité: % XOF', total_amount;
    
    IF operation_count >= 15 THEN
        RAISE NOTICE '✅ Opérations: OK';
    ELSE
        RAISE NOTICE '❌ Opérations: INSUFFISANTES';
    END IF;
END
$$;

-- ===============================================
-- 7. VÉRIFICATION DES COMMISSIONS
-- ===============================================
DO $$
DECLARE
    commission_count integer;
    total_commissions numeric;
    agent_share_total numeric;
    chef_share_total numeric;
    agency_share_total numeric;
BEGIN
    SELECT COUNT(*), COALESCE(SUM(commission_amount), 0),
           COALESCE(SUM(agent_share), 0), COALESCE(SUM(chef_share), 0), COALESCE(SUM(agency_share), 0)
    INTO commission_count, total_commissions, agent_share_total, chef_share_total, agency_share_total
    FROM public.commission_records;
    
    RAISE NOTICE '💰 Commissions générées: % enregistrements', commission_count;
    RAISE NOTICE '   - Total commissions: % XOF', total_commissions;
    RAISE NOTICE '   - Part agents: % XOF', agent_share_total;
    RAISE NOTICE '   - Part chefs: % XOF', chef_share_total;
    RAISE NOTICE '   - Part agences: % XOF', agency_share_total;
    
    IF commission_count > 0 THEN
        RAISE NOTICE '✅ Commissions: OK';
    ELSE
        RAISE NOTICE '❌ Commissions: MANQUANTES';
    END IF;
END
$$;

-- ===============================================
-- 8. VÉRIFICATION DU LEDGER DE TRANSACTIONS
-- ===============================================
DO $$
DECLARE
    ledger_count integer;
    credit_total numeric;
    debit_total numeric;
BEGIN
    SELECT COUNT(*) INTO ledger_count FROM public.transaction_ledger;
    
    SELECT COALESCE(SUM(amount), 0) INTO credit_total 
    FROM public.transaction_ledger WHERE transaction_type = 'credit';
    
    SELECT COALESCE(SUM(ABS(amount)), 0) INTO debit_total 
    FROM public.transaction_ledger WHERE transaction_type = 'debit';
    
    RAISE NOTICE '📔 Entrées ledger: % (attendu: 10+)', ledger_count;
    RAISE NOTICE '   - Total crédits: % XOF', credit_total;
    RAISE NOTICE '   - Total débits: % XOF', debit_total;
    
    IF ledger_count >= 5 THEN
        RAISE NOTICE '✅ Ledger: OK';
    ELSE
        RAISE NOTICE '❌ Ledger: INSUFFISANT';
    END IF;
END
$$;

-- ===============================================
-- 9. VÉRIFICATION DES DEMANDES
-- ===============================================
DO $$
DECLARE
    support_count integer;
    recharge_count integer;
BEGIN
    SELECT COUNT(*) INTO support_count FROM public.support_tickets;
    SELECT COUNT(*) INTO recharge_count FROM public.recharge_requests;
    
    RAISE NOTICE '🎫 Tickets de support: % (attendu: 4)', support_count;
    RAISE NOTICE '🔋 Demandes de recharge: % (attendu: 3)', recharge_count;
    
    IF support_count >= 4 AND recharge_count >= 3 THEN
        RAISE NOTICE '✅ Demandes: OK';
    ELSE
        RAISE NOTICE '❌ Demandes: INSUFFISANTES';
    END IF;
END
$$;

-- ===============================================
-- 10. VÉRIFICATION DES LOGS ET CONFIGURATION
-- ===============================================
DO $$
DECLARE
    error_log_count integer;
    config_count integer;
BEGIN
    SELECT COUNT(*) INTO error_log_count FROM public.error_logs;
    SELECT COUNT(*) INTO config_count FROM public.system_config WHERE is_active = true;
    
    RAISE NOTICE '🚨 Logs d''erreur: % (attendu: 3)', error_log_count;
    RAISE NOTICE '⚙️ Configurations: % (attendu: 8)', config_count;
    
    IF error_log_count >= 3 AND config_count >= 8 THEN
        RAISE NOTICE '✅ Logs & Config: OK';
    ELSE
        RAISE NOTICE '❌ Logs & Config: INCOMPLETS';
    END IF;
END
$$;

-- ===============================================
-- 11. RÉPARTITION PAR AGENCE
-- ===============================================
DO $$
DECLARE
    rec RECORD;
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '🏢 RÉPARTITION PAR AGENCE:';
    RAISE NOTICE '========================';
    
    FOR rec IN 
        SELECT a.name as agency_name,
               COUNT(DISTINCT p.id) FILTER (WHERE r.name = 'chef_agence') as chefs,
               COUNT(DISTINCT p.id) FILTER (WHERE r.name = 'agent') as agents,
               COUNT(DISTINCT o.id) as operations,
               COALESCE(SUM(o.amount), 0) as volume_operations,
               COALESCE(SUM(cr.commission_amount), 0) as total_commissions
        FROM public.agencies a
        LEFT JOIN public.profiles p ON a.id = p.agency_id
        LEFT JOIN public.roles r ON p.role_id = r.id
        LEFT JOIN public.operations o ON a.id = o.agency_id
        LEFT JOIN public.commission_records cr ON a.id = cr.agency_id
        WHERE a.is_active = true
        GROUP BY a.id, a.name
        ORDER BY a.name
    LOOP
        RAISE NOTICE '📍 %:', rec.agency_name;
        RAISE NOTICE '   - Chef(s): %, Agents: %', rec.chefs, rec.agents;
        RAISE NOTICE '   - Opérations: %, Volume: % XOF', rec.operations, rec.volume_operations;
        RAISE NOTICE '   - Commissions: % XOF', rec.total_commissions;
        RAISE NOTICE '';
    END LOOP;
END
$$;

-- ===============================================
-- 12. RÉSUMÉ FINAL
-- ===============================================
DO $$
BEGIN
    RAISE NOTICE '============================================';
    RAISE NOTICE '🎯 VÉRIFICATION TERMINÉE';
    RAISE NOTICE '============================================';
    RAISE NOTICE '';
    RAISE NOTICE '📋 PROCHAINES ÉTAPES:';
    RAISE NOTICE '1. Créer les utilisateurs dans Supabase Auth';
    RAISE NOTICE '2. Utiliser le script create_test_users.py ou créer manuellement';
    RAISE NOTICE '3. Tester la connexion avec chaque rôle';
    RAISE NOTICE '4. Vérifier les dashboards et fonctionnalités';
    RAISE NOTICE '';
    RAISE NOTICE '🔑 COMPTES À CRÉER:';
    RAISE NOTICE '- admin@transflownexus.com (Admin)';
    RAISE NOTICE '- chef.dakar@transflownexus.com (Chef Dakar)';
    RAISE NOTICE '- agent1.dakar@transflownexus.com (Agent Dakar)';
    RAISE NOTICE '- ... (voir GUIDE_CREATION_COMPTES_TEST.md)';
    RAISE NOTICE '';
    RAISE NOTICE '🔐 Mot de passe: TransFlow2024!';
    RAISE NOTICE '============================================';
END
$$;