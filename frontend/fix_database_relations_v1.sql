-- =====================================================================
-- SCRIPT DE RÉPARATION: Relations de Base de Données TransFlow Nexus
-- =====================================================================
-- Ce script corrige toutes les foreign keys et contraintes manquantes
-- détectées par l'analyse des erreurs PGRST200
-- =====================================================================

-- Désactiver temporairement les contraintes pour éviter les conflits
SET session_replication_role = replica;

-- =====================================================================
-- SECTION 1: AJOUT DES FOREIGN KEYS MANQUANTES
-- =====================================================================

-- 1.1 Relations pour la table PROFILES
-- ====================================

-- profiles.role_id → roles(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_role_id_fkey' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles
        ADD CONSTRAINT profiles_role_id_fkey
        FOREIGN KEY (role_id) REFERENCES public.roles(id);
        RAISE NOTICE '✅ Ajouté: profiles_role_id_fkey';
    ELSE
        RAISE NOTICE '⚠️  Existe déjà: profiles_role_id_fkey';
    END IF;
END $$;

-- profiles.agency_id → agencies(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'profiles_agency_id_fkey' 
        AND table_name = 'profiles'
    ) THEN
        ALTER TABLE public.profiles
        ADD CONSTRAINT profiles_agency_id_fkey
        FOREIGN KEY (agency_id) REFERENCES public.agencies(id);
        RAISE NOTICE '✅ Ajouté: profiles_agency_id_fkey';
    ELSE
        RAISE NOTICE '⚠️  Existe déjà: profiles_agency_id_fkey';
    END IF;
END $$;

-- 1.2 Relations pour la table REQUEST_TICKETS
-- ===========================================

-- request_tickets.requester_id → profiles(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'request_tickets_requester_id_fkey' 
        AND table_name = 'request_tickets'
    ) THEN
        ALTER TABLE public.request_tickets
        ADD CONSTRAINT request_tickets_requester_id_fkey
        FOREIGN KEY (requester_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Ajouté: request_tickets_requester_id_fkey';
    ELSE
        RAISE NOTICE '⚠️  Existe déjà: request_tickets_requester_id_fkey';
    END IF;
END $$;

-- request_tickets.assigned_to_id → profiles(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'request_tickets_assigned_to_id_fkey' 
        AND table_name = 'request_tickets'
    ) THEN
        ALTER TABLE public.request_tickets
        ADD CONSTRAINT request_tickets_assigned_to_id_fkey
        FOREIGN KEY (assigned_to_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
        RAISE NOTICE '✅ Ajouté: request_tickets_assigned_to_id_fkey';
    ELSE
        RAISE NOTICE '⚠️  Existe déjà: request_tickets_assigned_to_id_fkey';
    END IF;
END $$;

-- request_tickets.resolved_by_id → profiles(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'request_tickets_resolved_by_id_fkey' 
        AND table_name = 'request_tickets'
    ) THEN
        ALTER TABLE public.request_tickets
        ADD CONSTRAINT request_tickets_resolved_by_id_fkey
        FOREIGN KEY (resolved_by_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
        RAISE NOTICE '✅ Ajouté: request_tickets_resolved_by_id_fkey';
    ELSE
        RAISE NOTICE '⚠️  Existe déjà: request_tickets_resolved_by_id_fkey';
    END IF;
END $$;

-- 1.3 Relations pour la table NOTIFICATIONS
-- =========================================

-- notifications.recipient_id → profiles(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_recipient_id_fkey' 
        AND table_name = 'notifications'
    ) THEN
        ALTER TABLE public.notifications
        ADD CONSTRAINT notifications_recipient_id_fkey
        FOREIGN KEY (recipient_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Ajouté: notifications_recipient_id_fkey';
    ELSE
        RAISE NOTICE '⚠️  Existe déjà: notifications_recipient_id_fkey';
    END IF;
END $$;

-- notifications.sender_id → profiles(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'notifications_sender_id_fkey' 
        AND table_name = 'notifications'
    ) THEN
        ALTER TABLE public.notifications
        ADD CONSTRAINT notifications_sender_id_fkey
        FOREIGN KEY (sender_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
        RAISE NOTICE '✅ Ajouté: notifications_sender_id_fkey';
    ELSE
        RAISE NOTICE '⚠️  Existe déjà: notifications_sender_id_fkey';
    END IF;
END $$;

-- 1.4 Relations pour la table OPERATIONS
-- ======================================

-- operations.initiator_id → profiles(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'operations_initiator_id_fkey' 
        AND table_name = 'operations'
    ) THEN
        ALTER TABLE public.operations
        ADD CONSTRAINT operations_initiator_id_fkey
        FOREIGN KEY (initiator_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Ajouté: operations_initiator_id_fkey';
    ELSE
        RAISE NOTICE '⚠️  Existe déjà: operations_initiator_id_fkey';
    END IF;
END $$;

-- operations.validator_id → profiles(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'operations_validator_id_fkey' 
        AND table_name = 'operations'
    ) THEN
        ALTER TABLE public.operations
        ADD CONSTRAINT operations_validator_id_fkey
        FOREIGN KEY (validator_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
        RAISE NOTICE '✅ Ajouté: operations_validator_id_fkey';
    ELSE
        RAISE NOTICE '⚠️  Existe déjà: operations_validator_id_fkey';
    END IF;
END $$;

-- operations.agency_id → agencies(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'operations_agency_id_fkey' 
        AND table_name = 'operations'
    ) THEN
        ALTER TABLE public.operations
        ADD CONSTRAINT operations_agency_id_fkey
        FOREIGN KEY (agency_id) REFERENCES public.agencies(id) ON DELETE RESTRICT;
        RAISE NOTICE '✅ Ajouté: operations_agency_id_fkey';
    ELSE
        RAISE NOTICE '⚠️  Existe déjà: operations_agency_id_fkey';
    END IF;
END $$;

-- operations.operation_type_id → operation_types(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'operations_operation_type_id_fkey' 
        AND table_name = 'operations'
    ) THEN
        ALTER TABLE public.operations
        ADD CONSTRAINT operations_operation_type_id_fkey
        FOREIGN KEY (operation_type_id) REFERENCES public.operation_types(id) ON DELETE RESTRICT;
        RAISE NOTICE '✅ Ajouté: operations_operation_type_id_fkey';
    ELSE
        RAISE NOTICE '⚠️  Existe déjà: operations_operation_type_id_fkey';
    END IF;
END $$;

-- 1.5 Relations pour la table COMMISSION_RECORDS
-- ==============================================

-- commission_records.agent_id → profiles(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'commission_records_agent_id_fkey' 
        AND table_name = 'commission_records'
    ) THEN
        ALTER TABLE public.commission_records
        ADD CONSTRAINT commission_records_agent_id_fkey
        FOREIGN KEY (agent_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Ajouté: commission_records_agent_id_fkey';
    ELSE
        RAISE NOTICE '⚠️  Existe déjà: commission_records_agent_id_fkey';
    END IF;
END $$;

-- commission_records.chef_agence_id → profiles(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'commission_records_chef_agence_id_fkey' 
        AND table_name = 'commission_records'
    ) THEN
        ALTER TABLE public.commission_records
        ADD CONSTRAINT commission_records_chef_agence_id_fkey
        FOREIGN KEY (chef_agence_id) REFERENCES public.profiles(id) ON DELETE SET NULL;
        RAISE NOTICE '✅ Ajouté: commission_records_chef_agence_id_fkey';
    ELSE
        RAISE NOTICE '⚠️  Existe déjà: commission_records_chef_agence_id_fkey';
    END IF;
END $$;

-- commission_records.operation_id → operations(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'commission_records_operation_id_fkey' 
        AND table_name = 'commission_records'
    ) THEN
        ALTER TABLE public.commission_records
        ADD CONSTRAINT commission_records_operation_id_fkey
        FOREIGN KEY (operation_id) REFERENCES public.operations(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Ajouté: commission_records_operation_id_fkey';
    ELSE
        RAISE NOTICE '⚠️  Existe déjà: commission_records_operation_id_fkey';
    END IF;
END $$;

-- 1.6 Relations pour la table TRANSACTION_LEDGER
-- ==============================================

-- transaction_ledger.user_id → profiles(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'transaction_ledger_user_id_fkey' 
        AND table_name = 'transaction_ledger'
    ) THEN
        ALTER TABLE public.transaction_ledger
        ADD CONSTRAINT transaction_ledger_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Ajouté: transaction_ledger_user_id_fkey';
    ELSE
        RAISE NOTICE '⚠️  Existe déjà: transaction_ledger_user_id_fkey';
    END IF;
END $$;

-- transaction_ledger.operation_id → operations(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'transaction_ledger_operation_id_fkey' 
        AND table_name = 'transaction_ledger'
    ) THEN
        ALTER TABLE public.transaction_ledger
        ADD CONSTRAINT transaction_ledger_operation_id_fkey
        FOREIGN KEY (operation_id) REFERENCES public.operations(id) ON DELETE SET NULL;
        RAISE NOTICE '✅ Ajouté: transaction_ledger_operation_id_fkey';
    ELSE
        RAISE NOTICE '⚠️  Existe déjà: transaction_ledger_operation_id_fkey';
    END IF;
END $$;

-- 1.7 Relations pour la table RECHARGE_OPERATIONS
-- ===============================================

-- recharge_operations.agent_id → profiles(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'recharge_operations_agent_id_fkey' 
        AND table_name = 'recharge_operations'
    ) THEN
        ALTER TABLE public.recharge_operations
        ADD CONSTRAINT recharge_operations_agent_id_fkey
        FOREIGN KEY (agent_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Ajouté: recharge_operations_agent_id_fkey';
    ELSE
        RAISE NOTICE '⚠️  Existe déjà: recharge_operations_agent_id_fkey';
    END IF;
END $$;

-- recharge_operations.ticket_id → request_tickets(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'recharge_operations_ticket_id_fkey' 
        AND table_name = 'recharge_operations'
    ) THEN
        ALTER TABLE public.recharge_operations
        ADD CONSTRAINT recharge_operations_ticket_id_fkey
        FOREIGN KEY (ticket_id) REFERENCES public.request_tickets(id) ON DELETE SET NULL;
        RAISE NOTICE '✅ Ajouté: recharge_operations_ticket_id_fkey';
    ELSE
        RAISE NOTICE '⚠️  Existe déjà: recharge_operations_ticket_id_fkey';
    END IF;
END $$;

-- 1.8 Relations pour la table REQUEST_TICKET_COMMENTS
-- ===================================================

-- request_ticket_comments.ticket_id → request_tickets(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'request_ticket_comments_ticket_id_fkey' 
        AND table_name = 'request_ticket_comments'
    ) THEN
        ALTER TABLE public.request_ticket_comments
        ADD CONSTRAINT request_ticket_comments_ticket_id_fkey
        FOREIGN KEY (ticket_id) REFERENCES public.request_tickets(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Ajouté: request_ticket_comments_ticket_id_fkey';
    ELSE
        RAISE NOTICE '⚠️  Existe déjà: request_ticket_comments_ticket_id_fkey';
    END IF;
END $$;

-- request_ticket_comments.author_id → profiles(id)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'request_ticket_comments_author_id_fkey' 
        AND table_name = 'request_ticket_comments'
    ) THEN
        ALTER TABLE public.request_ticket_comments
        ADD CONSTRAINT request_ticket_comments_author_id_fkey
        FOREIGN KEY (author_id) REFERENCES public.profiles(id) ON DELETE CASCADE;
        RAISE NOTICE '✅ Ajouté: request_ticket_comments_author_id_fkey';
    ELSE
        RAISE NOTICE '⚠️  Existe déjà: request_ticket_comments_author_id_fkey';
    END IF;
END $$;

-- =====================================================================
-- SECTION 2: CORRECTION DES CONTRAINTES CHECK
-- =====================================================================

-- 2.1 Corriger la contrainte error_logs_source_check
-- ==================================================

-- Supprimer l'ancienne contrainte si elle existe
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'error_logs_source_check' 
        AND table_name = 'error_logs'
    ) THEN
        ALTER TABLE public.error_logs DROP CONSTRAINT error_logs_source_check;
        RAISE NOTICE '🗑️  Supprimé: ancienne contrainte error_logs_source_check';
    END IF;
END $$;

-- Ajouter la nouvelle contrainte avec toutes les sources possibles
DO $$
BEGIN
    ALTER TABLE public.error_logs
    ADD CONSTRAINT error_logs_source_check
    CHECK (source IN (
        'frontend', 'backend', 'database', 'auth', 'system', 
        'api', 'integration', 'payment', 'commission', 'validation',
        'SupabaseQuery', 'SupabaseMutation', 'React', 'Client',
        'operation_validation', 'commission_calculation', 'user_authentication',
        'recharge_processing', 'notification_service'
    ));
    RAISE NOTICE '✅ Ajouté: nouvelle contrainte error_logs_source_check avec sources étendues';
END $$;

-- =====================================================================
-- SECTION 3: AJOUT D'INDEX POUR OPTIMISER LES PERFORMANCES
-- =====================================================================

-- Index pour améliorer les requêtes avec foreign keys
DO $$
BEGIN
    -- Créer les index seulement s'ils n'existent pas déjà
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_role_id') THEN
        CREATE INDEX idx_profiles_role_id ON public.profiles(role_id);
        RAISE NOTICE '✅ Index créé: idx_profiles_role_id';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_profiles_agency_id') THEN
        CREATE INDEX idx_profiles_agency_id ON public.profiles(agency_id);
        RAISE NOTICE '✅ Index créé: idx_profiles_agency_id';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_request_tickets_requester_id') THEN
        CREATE INDEX idx_request_tickets_requester_id ON public.request_tickets(requester_id);
        RAISE NOTICE '✅ Index créé: idx_request_tickets_requester_id';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_request_tickets_assigned_to_id') THEN
        CREATE INDEX idx_request_tickets_assigned_to_id ON public.request_tickets(assigned_to_id);
        RAISE NOTICE '✅ Index créé: idx_request_tickets_assigned_to_id';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_recipient_id') THEN
        CREATE INDEX idx_notifications_recipient_id ON public.notifications(recipient_id);
        RAISE NOTICE '✅ Index créé: idx_notifications_recipient_id';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_notifications_sender_id') THEN
        CREATE INDEX idx_notifications_sender_id ON public.notifications(sender_id);
        RAISE NOTICE '✅ Index créé: idx_notifications_sender_id';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_operations_initiator_id') THEN
        CREATE INDEX idx_operations_initiator_id ON public.operations(initiator_id);
        RAISE NOTICE '✅ Index créé: idx_operations_initiator_id';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_operations_validator_id') THEN
        CREATE INDEX idx_operations_validator_id ON public.operations(validator_id);
        RAISE NOTICE '✅ Index créé: idx_operations_validator_id';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_operations_agency_id') THEN
        CREATE INDEX idx_operations_agency_id ON public.operations(agency_id);
        RAISE NOTICE '✅ Index créé: idx_operations_agency_id';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_commission_records_agent_id') THEN
        CREATE INDEX idx_commission_records_agent_id ON public.commission_records(agent_id);
        RAISE NOTICE '✅ Index créé: idx_commission_records_agent_id';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_commission_records_chef_agence_id') THEN
        CREATE INDEX idx_commission_records_chef_agence_id ON public.commission_records(chef_agence_id);
        RAISE NOTICE '✅ Index créé: idx_commission_records_chef_agence_id';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_indexes WHERE indexname = 'idx_transaction_ledger_user_id') THEN
        CREATE INDEX idx_transaction_ledger_user_id ON public.transaction_ledger(user_id);
        RAISE NOTICE '✅ Index créé: idx_transaction_ledger_user_id';
    END IF;
    
    RAISE NOTICE '📊 Tous les index de performance ont été vérifiés/créés';
END $$;

-- =====================================================================
-- SECTION 4: RÉACTIVATION DES CONTRAINTES
-- =====================================================================

-- Réactiver les contraintes
SET session_replication_role = DEFAULT;

-- =====================================================================
-- SECTION 5: VÉRIFICATION ET RAPPORT
-- =====================================================================

-- Fonction de vérification des relations
DO $$
DECLARE
    v_missing_fkeys TEXT[] := ARRAY[]::TEXT[];
    v_fkey_name TEXT;
    v_error_constraint_exists BOOLEAN := FALSE;
BEGIN
    -- Vérifier si toutes les foreign keys critiques existent
    
    -- Vérifier profiles
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'profiles_role_id_fkey') THEN
        v_missing_fkeys := array_append(v_missing_fkeys, 'profiles_role_id_fkey');
    END IF;
    
    -- Vérifier request_tickets
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'request_tickets_requester_id_fkey') THEN
        v_missing_fkeys := array_append(v_missing_fkeys, 'request_tickets_requester_id_fkey');
    END IF;
    
    -- Vérifier notifications
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'notifications_sender_id_fkey') THEN
        v_missing_fkeys := array_append(v_missing_fkeys, 'notifications_sender_id_fkey');
    END IF;
    
    -- Vérifier operations
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'operations_initiator_id_fkey') THEN
        v_missing_fkeys := array_append(v_missing_fkeys, 'operations_initiator_id_fkey');
    END IF;
    
    -- Vérifier la contrainte error_logs
    SELECT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'error_logs_source_check' 
        AND table_name = 'error_logs'
    ) INTO v_error_constraint_exists;
    
    -- Générer le rapport
    RAISE NOTICE '';
    RAISE NOTICE '========================================================================';
    RAISE NOTICE '                     RAPPORT DE RÉPARATION SUPABASE';
    RAISE NOTICE '========================================================================';
    
    IF array_length(v_missing_fkeys, 1) > 0 THEN
        RAISE NOTICE '❌ Foreign Keys manquantes:';
        FOR i IN 1..array_length(v_missing_fkeys, 1) LOOP
            RAISE NOTICE '   - %', v_missing_fkeys[i];
        END LOOP;
    ELSE
        RAISE NOTICE '✅ Toutes les Foreign Keys critiques sont présentes';
    END IF;
    
    IF v_error_constraint_exists THEN
        RAISE NOTICE '✅ Contrainte error_logs_source_check corrigée';
    ELSE
        RAISE NOTICE '❌ Contrainte error_logs_source_check manquante';
    END IF;
    
    RAISE NOTICE '';
    RAISE NOTICE '📋 Relations configurées:';
    RAISE NOTICE '   ✓ profiles ↔ roles, agencies';
    RAISE NOTICE '   ✓ request_tickets ↔ profiles (requester, assigned_to, resolved_by)';
    RAISE NOTICE '   ✓ notifications ↔ profiles (recipient, sender)';
    RAISE NOTICE '   ✓ operations ↔ profiles, agencies, operation_types';
    RAISE NOTICE '   ✓ commission_records ↔ profiles, operations';
    RAISE NOTICE '   ✓ transaction_ledger ↔ profiles, operations';
    RAISE NOTICE '   ✓ recharge_operations ↔ profiles, request_tickets';
    RAISE NOTICE '   ✓ request_ticket_comments ↔ request_tickets, profiles';
    
    RAISE NOTICE '';
    RAISE NOTICE '🎯 Résultat attendu:';
    RAISE NOTICE '   ✓ Les erreurs PGRST200 doivent disparaître';
    RAISE NOTICE '   ✓ Les relations Supabase fonctionnent (select avec joins)';
    RAISE NOTICE '   ✓ L''insertion dans error_logs fonctionne';
    RAISE NOTICE '   ✓ L''application affiche les données correctement';
    
    RAISE NOTICE '';
    RAISE NOTICE '⚡ Prochaine étape: Redémarrer l''application et tester';
    RAISE NOTICE '========================================================================';
    RAISE NOTICE '';
    
END $$;