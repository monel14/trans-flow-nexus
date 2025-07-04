-- ===============================================
-- FIX v3: Supabase RLS Infinite Recursion (Version Corrigée)
-- ===============================================
-- Cette version corrige les problèmes de policies déjà existantes

-- Première étape : Désactiver temporairement RLS sur toutes les tables
ALTER TABLE IF EXISTS public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agencies DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.operations DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transaction_ledger DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.commission_records DISABLE ROW LEVEL SECURITY;

-- ===============================================
-- SUPPRIMER TOUTES LES FONCTIONS EXISTANTES
-- ===============================================

-- Supprimer les fonctions existantes avec toutes leurs signatures possibles
DROP FUNCTION IF EXISTS public.get_user_role_name(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_role() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_agency_id(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.get_user_agency_id() CASCADE;
DROP FUNCTION IF EXISTS public.get_user_agency_id_secure(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.user_has_role(uuid, text[]) CASCADE;
DROP FUNCTION IF EXISTS public.user_has_role(text[]) CASCADE;
DROP FUNCTION IF EXISTS public.user_has_role_secure(uuid, text[]) CASCADE;
DROP FUNCTION IF EXISTS public.is_admin() CASCADE;
DROP FUNCTION IF EXISTS public.is_chef_agence() CASCADE;

-- ===============================================
-- SUPPRIMER TOUTES LES POLITIQUES EXISTANTES
-- ===============================================

-- Fonction pour supprimer toutes les policies d'une table
DO $$
DECLARE
    pol_name text;
BEGIN
    -- Supprimer toutes les policies de la table profiles
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'profiles'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.profiles', pol_name);
    END LOOP;
    
    -- Supprimer toutes les policies de la table agencies
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'agencies'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.agencies', pol_name);
    END LOOP;
    
    -- Supprimer toutes les policies de la table operations
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'operations'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.operations', pol_name);
    END LOOP;
    
    -- Supprimer toutes les policies de la table transaction_ledger
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'transaction_ledger'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.transaction_ledger', pol_name);
    END LOOP;
    
    -- Supprimer toutes les policies de la table commission_records
    FOR pol_name IN 
        SELECT policyname FROM pg_policies WHERE tablename = 'commission_records'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.commission_records', pol_name);
    END LOOP;
END
$$;

-- ===============================================
-- CRÉER LES NOUVELLES FONCTIONS SÉCURISÉES
-- ===============================================

-- Fonction pour obtenir le nom du rôle utilisateur
CREATE OR REPLACE FUNCTION public.get_user_role_name(user_uuid uuid)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT r.name 
  FROM public.profiles p
  JOIN public.roles r ON p.role_id = r.id
  WHERE p.id = user_uuid AND p.is_active = true
  LIMIT 1;
$$;

-- Fonction pour obtenir l'ID de l'agence utilisateur
CREATE OR REPLACE FUNCTION public.get_user_agency_id_secure(user_uuid uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT p.agency_id 
  FROM public.profiles p
  WHERE p.id = user_uuid AND p.is_active = true
  LIMIT 1;
$$;

-- Fonction pour vérifier si un utilisateur a un rôle spécifique
CREATE OR REPLACE FUNCTION public.user_has_role_secure(user_uuid uuid, role_names text[])
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles p
    JOIN public.roles r ON p.role_id = r.id
    WHERE p.id = user_uuid 
    AND r.name = ANY(role_names)
    AND p.is_active = true
  );
$$;

-- Fonction pour vérifier si l'utilisateur actuel est admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT user_has_role_secure(auth.uid(), ARRAY['admin_general', 'sous_admin']);
$$;

-- Fonction pour vérifier si l'utilisateur actuel est chef d'agence
CREATE OR REPLACE FUNCTION public.is_chef_agence()
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT user_has_role_secure(auth.uid(), ARRAY['chef_agence']);
$$;

-- ===============================================
-- RÉACTIVER RLS SUR TOUTES LES TABLES
-- ===============================================
ALTER TABLE IF EXISTS public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.agencies ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.operations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.transaction_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.commission_records ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- CRÉER LES NOUVELLES POLITIQUES SANS RÉCURSION
-- ===============================================

-- PROFILES: Accès à son propre profil
CREATE POLICY "profiles_own_access" ON public.profiles
  FOR ALL 
  USING (auth.uid() = id);

-- PROFILES: Accès admin (utilise la fonction sécurisée)
CREATE POLICY "profiles_admin_access" ON public.profiles
  FOR ALL 
  USING (is_admin());

-- PROFILES: Accès chef d'agence (même agence)
CREATE POLICY "profiles_chef_agency_access" ON public.profiles
  FOR ALL 
  USING (
    is_chef_agence() AND
    get_user_agency_id_secure(auth.uid()) = agency_id AND
    get_user_agency_id_secure(auth.uid()) IS NOT NULL
  );

-- AGENCIES: Gestion admin
CREATE POLICY "agencies_admin_manage" ON public.agencies
  FOR ALL 
  USING (is_admin());

-- AGENCIES: Vue chef pour sa propre agence
CREATE POLICY "agencies_chef_view_own" ON public.agencies
  FOR SELECT 
  USING (
    is_chef_agence() AND
    get_user_agency_id_secure(auth.uid()) = id
  );

-- AGENCIES: Lecture basique pour tous les utilisateurs authentifiés
CREATE POLICY "agencies_read_basic_info" ON public.agencies
  FOR SELECT TO authenticated
  USING (is_active = true);

-- OPERATIONS: Accès agents à leurs propres opérations + admin
CREATE POLICY "operations_agent_own" ON public.operations
  FOR ALL 
  USING (
    initiator_id = auth.uid() OR
    is_admin()
  );

-- OPERATIONS: Accès chef d'agence aux opérations de son agence
CREATE POLICY "operations_chef_agency" ON public.operations
  FOR ALL 
  USING (
    is_chef_agence() AND
    get_user_agency_id_secure(auth.uid()) = agency_id
  );

-- TRANSACTION LEDGER: Accès à ses propres transactions
CREATE POLICY "transaction_ledger_own" ON public.transaction_ledger
  FOR SELECT 
  USING (user_id = auth.uid());

-- TRANSACTION LEDGER: Accès admin complet
CREATE POLICY "transaction_ledger_admin" ON public.transaction_ledger
  FOR ALL 
  USING (is_admin());

-- COMMISSION RECORDS: Accès aux commissions (agent ou chef)
CREATE POLICY "commission_records_own" ON public.commission_records
  FOR SELECT 
  USING (
    agent_id = auth.uid() OR
    chef_agence_id = auth.uid()
  );

-- COMMISSION RECORDS: Accès admin complet
CREATE POLICY "commission_records_admin" ON public.commission_records
  FOR ALL 
  USING (is_admin());

-- ===============================================
-- PERMISSIONS POUR LES FONCTIONS
-- ===============================================

-- Donner les permissions appropriées aux fonctions
GRANT EXECUTE ON FUNCTION public.get_user_role_name(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_agency_id_secure(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_role_secure(uuid, text[]) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_chef_agence() TO authenticated;

-- ===============================================
-- VÉRIFICATION ET COMMENTAIRES
-- ===============================================

-- Ajouter des commentaires pour documenter les fonctions
COMMENT ON FUNCTION public.get_user_role_name IS 'Fonction sécurisée pour obtenir le nom du rôle utilisateur sans récursion RLS';
COMMENT ON FUNCTION public.get_user_agency_id_secure IS 'Fonction sécurisée pour obtenir l ID de l agence utilisateur sans récursion RLS';
COMMENT ON FUNCTION public.user_has_role_secure IS 'Fonction sécurisée pour vérifier si un utilisateur a un rôle spécifique sans récursion RLS';
COMMENT ON FUNCTION public.is_admin IS 'Fonction helper pour vérifier si l utilisateur actuel est administrateur';
COMMENT ON FUNCTION public.is_chef_agence IS 'Fonction helper pour vérifier si l utilisateur actuel est chef d agence';

-- Message de confirmation
DO $$
BEGIN
  RAISE NOTICE 'Migration v3 terminée avec succès ! Les politiques RLS ont été corrigées.';
  RAISE NOTICE 'Vous pouvez maintenant tester l authentification.';
END
$$;