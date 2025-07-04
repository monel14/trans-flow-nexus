-- ===============================================
-- SCRIPT DE GÉNÉRATION DE DONNÉES MOCK v2 (CORRIGÉ)
-- TransFlow Nexus - Version compatible avec la structure existante
-- ===============================================

-- Note: Ce script doit être exécuté APRÈS avoir appliqué le fix RLS v3

-- ===============================================
-- 1. CRÉATION DES RÔLES DE BASE (Structure simplifiée)
-- ===============================================

-- Insérer les rôles si ils n'existent pas déjà
INSERT INTO public.roles (id, name, label, is_active, created_at, updated_at) 
VALUES 
  (1, 'admin_general', 'Administrateur Général', true, now(), now()),
  (2, 'sous_admin', 'Sous-Administrateur', true, now(), now()),
  (3, 'chef_agence', 'Chef d''Agence', true, now(), now()),
  (4, 'agent', 'Agent', true, now(), now()),
  (5, 'developer', 'Développeur', true, now(), now())
ON CONFLICT (id) DO UPDATE SET
  updated_at = now();

-- ===============================================
-- 2. CRÉATION DES AGENCES (Vérification des colonnes)
-- ===============================================

-- Insertion avec colonnes de base (ajuster selon structure réelle)
INSERT INTO public.agencies (id, name, address, phone, email, is_active, created_at, updated_at)
VALUES 
  (1, 'Agence Dakar Centre', '123 Rue de la République, Dakar', '+221 33 123 4567', 'dakar.centre@transflow.sn', true, now(), now()),
  (2, 'Agence Pikine', '456 Avenue Blaise Diagne, Pikine', '+221 33 234 5678', 'pikine@transflow.sn', true, now(), now()),
  (3, 'Agence Thiès', '789 Boulevard Général de Gaulle, Thiès', '+221 33 345 6789', 'thies@transflow.sn', true, now(), now()),
  (4, 'Agence Saint-Louis', '321 Place Faidherbe, Saint-Louis', '+221 33 456 7890', 'saint.louis@transflow.sn', true, now(), now())
ON CONFLICT (id) DO UPDATE SET
  updated_at = now();

-- Ajouter des colonnes si elles n'existent pas (tentative sécurisée)
DO $$
BEGIN
  -- Essayer d'ajouter la colonne balance si elle n'existe pas
  BEGIN
    ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS balance numeric(15,2) DEFAULT 0;
    ALTER TABLE public.agencies ADD COLUMN IF NOT EXISTS commission_balance numeric(15,2) DEFAULT 0;
    RAISE NOTICE 'Colonnes balance ajoutées aux agences';
  EXCEPTION 
    WHEN others THEN
      RAISE NOTICE 'Colonnes balance déjà présentes ou erreur: %', SQLERRM;
  END;
END
$$;

-- Mettre à jour les balances si les colonnes existent
DO $$
BEGIN
  UPDATE public.agencies 
  SET balance = CASE 
    WHEN id = 1 THEN 1500000.00
    WHEN id = 2 THEN 800000.00
    WHEN id = 3 THEN 650000.00
    WHEN id = 4 THEN 420000.00
    ELSE 0
  END,
  commission_balance = CASE 
    WHEN id = 1 THEN 25000.00
    WHEN id = 2 THEN 18000.00
    WHEN id = 3 THEN 12000.00
    WHEN id = 4 THEN 8500.00
    ELSE 0
  END;
EXCEPTION 
  WHEN undefined_column THEN
    RAISE NOTICE 'Colonnes balance non disponibles dans agencies';
END
$$;

-- ===============================================
-- 3. CRÉATION DES TYPES D'OPÉRATIONS (Structure de base)
-- ===============================================

INSERT INTO public.operation_types (id, name, impacts_balance, is_active, status, created_at, updated_at)
VALUES 
  ('op_transfert_national', 'Transfert National', true, true, 'active', now(), now()),
  ('op_transfert_international', 'Transfert International', true, true, 'active', now(), now()),
  ('op_depot_especes', 'Dépôt Espèces', true, true, 'active', now(), now()),
  ('op_retrait_especes', 'Retrait Espèces', true, true, 'active', now(), now()),
  ('op_paiement_facture', 'Paiement Facture', true, true, 'active', now(), now()),
  ('op_recharge_mobile', 'Recharge Mobile', true, true, 'active', now(), now()),
  ('op_change_devise', 'Change de Devise', true, true, 'active', now(), now())
ON CONFLICT (id) DO UPDATE SET
  updated_at = now(),
  is_active = EXCLUDED.is_active,
  status = EXCLUDED.status;

-- Ajouter description si la colonne existe
DO $$
BEGIN
  UPDATE public.operation_types 
  SET description = CASE 
    WHEN id = 'op_transfert_national' THEN 'Transfert d''argent dans le pays'
    WHEN id = 'op_transfert_international' THEN 'Transfert d''argent vers l''étranger'
    WHEN id = 'op_depot_especes' THEN 'Dépôt d''argent en espèces'
    WHEN id = 'op_retrait_especes' THEN 'Retrait d''argent en espèces'
    WHEN id = 'op_paiement_facture' THEN 'Paiement de factures diverses'
    WHEN id = 'op_recharge_mobile' THEN 'Recharge de crédit téléphonique'
    WHEN id = 'op_change_devise' THEN 'Échange de devises'
    ELSE name
  END;
EXCEPTION 
  WHEN undefined_column THEN
    RAISE NOTICE 'Colonne description non disponible dans operation_types';
END
$$;

-- ===============================================
-- 4. CRÉATION DES PROFILS UTILISATEURS
-- ===============================================

-- Ajouter colonnes balance si nécessaire
DO $$
BEGIN
  ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS balance numeric(15,2) DEFAULT 0;
  RAISE NOTICE 'Colonne balance ajoutée aux profils';
EXCEPTION 
  WHEN others THEN
    RAISE NOTICE 'Colonne balance déjà présente ou erreur: %', SQLERRM;
END
$$;

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
-- 5. CRÉATION DES OPÉRATIONS (Structure minimale)
-- ===============================================

-- Créer des opérations avec les colonnes de base
DO $$
BEGIN
  -- Opérations pour l'agence Dakar
  INSERT INTO public.operations (id, operation_type_id, initiator_id, agency_id, amount, currency, status, reference_number, created_at, updated_at)
  VALUES 
    -- Opérations de Fatou (Agent Dakar)
    (gen_random_uuid(), 'op_transfert_national', '44444444-4444-4444-4444-444444444444', 1, 50000, 'XOF', 'completed', 'TN-' || EXTRACT(epoch FROM now())::text, now() - interval '2 hours', now()),
    
    (gen_random_uuid(), 'op_transfert_international', '44444444-4444-4444-4444-444444444444', 1, 100000, 'XOF', 'completed', 'TI-' || (EXTRACT(epoch FROM now()) + 1)::text, now() - interval '5 hours', now()),
    
    (gen_random_uuid(), 'op_recharge_mobile', '44444444-4444-4444-4444-444444444444', 1, 5000, 'XOF', 'completed', 'RM-' || (EXTRACT(epoch FROM now()) + 2)::text, now() - interval '1 hour', now()),
    
    -- Opérations de Mamadou (Agent Dakar)
    (gen_random_uuid(), 'op_paiement_facture', '44444444-4444-4444-4444-444444444445', 1, 25000, 'XOF', 'pending', 'PF-' || (EXTRACT(epoch FROM now()) + 3)::text, now() - interval '15 minutes', now()),
    
    (gen_random_uuid(), 'op_depot_especes', '44444444-4444-4444-4444-444444444445', 1, 75000, 'XOF', 'validation_required', 'DE-' || (EXTRACT(epoch FROM now()) + 4)::text, now() - interval '10 minutes', now()),
    
    -- Opérations d'Awa (Agent Dakar)
    (gen_random_uuid(), 'op_retrait_especes', '44444444-4444-4444-4444-444444444446', 1, 30000, 'XOF', 'completed', 'RE-' || (EXTRACT(epoch FROM now()) + 5)::text, now() - interval '3 hours', now()),
    
    (gen_random_uuid(), 'op_change_devise', '44444444-4444-4444-4444-444444444446', 1, 60000, 'XOF', 'completed', 'CD-' || (EXTRACT(epoch FROM now()) + 6)::text, now() - interval '5 hours', now())
  ON CONFLICT (id) DO NOTHING;

  -- Opérations pour l'agence Pikine
  INSERT INTO public.operations (id, operation_type_id, initiator_id, agency_id, amount, currency, status, reference_number, created_at, updated_at)
  VALUES 
    -- Opérations de Seynabou (Agent Pikine)
    (gen_random_uuid(), 'op_transfert_national', '44444444-4444-4444-4444-444444444447', 2, 35000, 'XOF', 'completed', 'TN-' || (EXTRACT(epoch FROM now()) + 7)::text, now() - interval '7 hours', now()),
    
    (gen_random_uuid(), 'op_recharge_mobile', '44444444-4444-4444-4444-444444444447', 2, 2000, 'XOF', 'completed', 'RM-' || (EXTRACT(epoch FROM now()) + 8)::text, now() - interval '1 hour 30 minutes', now()),
    
    -- Opérations de Modou (Agent Pikine)
    (gen_random_uuid(), 'op_transfert_international', '44444444-4444-4444-4444-444444444448', 2, 80000, 'XOF', 'failed', 'TI-' || (EXTRACT(epoch FROM now()) + 9)::text, now() - interval '2 hours', now()),
    
    (gen_random_uuid(), 'op_paiement_facture', '44444444-4444-4444-4444-444444444448', 2, 15000, 'XOF', 'pending', 'PF-' || (EXTRACT(epoch FROM now()) + 10)::text, now() - interval '20 minutes', now())
  ON CONFLICT (id) DO NOTHING;

  -- Opérations pour l'agence Thiès
  INSERT INTO public.operations (id, operation_type_id, initiator_id, agency_id, amount, currency, status, reference_number, created_at, updated_at)
  VALUES 
    -- Opérations de Mariama (Agent Thiès)
    (gen_random_uuid(), 'op_depot_especes', '44444444-4444-4444-4444-444444444449', 3, 120000, 'XOF', 'validation_required', 'DE-' || (EXTRACT(epoch FROM now()) + 11)::text, now() - interval '5 minutes', now()),
    
    (gen_random_uuid(), 'op_transfert_national', '44444444-4444-4444-4444-444444444449', 3, 40000, 'XOF', 'completed', 'TN-' || (EXTRACT(epoch FROM now()) + 12)::text, now() - interval '9 hours', now())
  ON CONFLICT (id) DO NOTHING;

  RAISE NOTICE 'Opérations créées avec succès';
EXCEPTION 
  WHEN others THEN
    RAISE NOTICE 'Erreur lors de la création des opérations: %', SQLERRM;
END
$$;

-- ===============================================
-- 6. AJOUT DE COLONNES COMPLÉMENTAIRES SI POSSIBLE
-- ===============================================

-- Essayer d'ajouter des colonnes aux opérations
DO $$
BEGIN
  ALTER TABLE public.operations ADD COLUMN IF NOT EXISTS operation_data jsonb DEFAULT '{}';
  ALTER TABLE public.operations ADD COLUMN IF NOT EXISTS commission_amount numeric(10,2) DEFAULT 0;
  ALTER TABLE public.operations ADD COLUMN IF NOT EXISTS fee_amount numeric(10,2) DEFAULT 0;
  ALTER TABLE public.operations ADD COLUMN IF NOT EXISTS validator_id uuid;
  ALTER TABLE public.operations ADD COLUMN IF NOT EXISTS validated_at timestamptz;
  ALTER TABLE public.operations ADD COLUMN IF NOT EXISTS completed_at timestamptz;
  
  RAISE NOTICE 'Colonnes complémentaires ajoutées aux opérations';
EXCEPTION 
  WHEN others THEN
    RAISE NOTICE 'Colonnes déjà présentes ou erreur: %', SQLERRM;
END
$$;

-- Mettre à jour les opérations avec des données complémentaires
DO $$
BEGIN
  UPDATE public.operations 
  SET 
    commission_amount = amount * 0.025,
    fee_amount = CASE 
      WHEN operation_type_id LIKE '%transfert%' THEN amount * 0.01
      WHEN operation_type_id LIKE '%depot%' OR operation_type_id LIKE '%retrait%' THEN 300
      ELSE 50
    END,
    operation_data = jsonb_build_object(
      'beneficiaire_nom', 'Client Test ' || substr(id::text, 1, 8),
      'notes', 'Opération de test générée automatiquement'
    )
  WHERE commission_amount IS NULL OR commission_amount = 0;
  
  RAISE NOTICE 'Données complémentaires mises à jour';
EXCEPTION 
  WHEN undefined_column THEN
    RAISE NOTICE 'Colonnes complémentaires non disponibles';
END
$$;

-- ===============================================
-- MESSAGE DE CONFIRMATION
-- ===============================================

DO $$
DECLARE
    role_count integer;
    agency_count integer;
    profile_count integer;
    operation_count integer;
BEGIN
    SELECT COUNT(*) INTO role_count FROM public.roles;
    SELECT COUNT(*) INTO agency_count FROM public.agencies;
    SELECT COUNT(*) INTO profile_count FROM public.profiles;
    SELECT COUNT(*) INTO operation_count FROM public.operations;
    
    RAISE NOTICE '============================================';
    RAISE NOTICE 'DONNÉES MOCK CRÉÉES AVEC SUCCÈS ! (v2)';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Éléments créés:';
    RAISE NOTICE '- Rôles: %', role_count;
    RAISE NOTICE '- Agences: %', agency_count;
    RAISE NOTICE '- Profils utilisateurs: %', profile_count;
    RAISE NOTICE '- Opérations: %', operation_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Comptes créés (Mot de passe: TransFlow2024!):';
    RAISE NOTICE '- admin@transflownexus.com (Admin)';
    RAISE NOTICE '- sousadmin@transflownexus.com (Sous-Admin)';
    RAISE NOTICE '- dev@transflownexus.com (Développeur)';
    RAISE NOTICE '- chef.dakar@transflownexus.com (Chef Dakar)';
    RAISE NOTICE '- chef.pikine@transflownexus.com (Chef Pikine)';
    RAISE NOTICE '- chef.thies@transflownexus.com (Chef Thiès)';
    RAISE NOTICE '- agent1.dakar@transflownexus.com (Agent Dakar 1)';
    RAISE NOTICE '- agent2.dakar@transflownexus.com (Agent Dakar 2)';
    RAISE NOTICE '- agent3.dakar@transflownexus.com (Agent Dakar 3)';
    RAISE NOTICE '- agent1.pikine@transflownexus.com (Agent Pikine 1)';
    RAISE NOTICE '- agent2.pikine@transflownexus.com (Agent Pikine 2)';
    RAISE NOTICE '- agent1.thies@transflownexus.com (Agent Thiès)';
    RAISE NOTICE '';
    RAISE NOTICE 'Vous devez maintenant créer ces utilisateurs';
    RAISE NOTICE 'dans Supabase Auth avec les IDs correspondants.';
    RAISE NOTICE '============================================';
END
$$;