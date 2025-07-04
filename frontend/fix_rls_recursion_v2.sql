-- ===============================================
-- FIX v2: Supabase RLS Infinite Recursion 
-- ===============================================
-- Cette migration corrige les politiques RLS qui causent la récursion infinie
-- Version 2 : Supprime d'abord les fonctions existantes

-- Première étape : Désactiver temporairement RLS sur profiles pour éviter les erreurs
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- ===============================================
-- SUPPRIMER TOUTES LES FONCTIONS EXISTANTES
-- ===============================================

-- Supprimer les fonctions existantes avec toutes leurs signatures possibles
DROP FUNCTION IF EXISTS public.get_user_role_name(uuid);
DROP FUNCTION IF EXISTS public.get_user_role();
DROP FUNCTION IF EXISTS public.get_user_agency_id(uuid);
DROP FUNCTION IF EXISTS public.get_user_agency_id();
DROP FUNCTION IF EXISTS public.user_has_role(uuid, text[]);
DROP FUNCTION IF EXISTS public.user_has_role(text[]);

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
-- SUPPRIMER TOUTES LES POLITIQUES EXISTANTES
-- ===============================================

-- Profiles
DROP POLICY IF EXISTS "profiles_own_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_chef_agency_access" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins and chefs can view profiles in their scope" ON public.profiles;
DROP POLICY IF EXISTS "Admins and chefs can manage profiles" ON public.profiles;

-- Agencies
DROP POLICY IF EXISTS "agencies_admin_manage" ON public.agencies;
DROP POLICY IF EXISTS "agencies_chef_view_own" ON public.agencies;
DROP POLICY IF EXISTS "agencies_read_basic_info" ON public.agencies;
DROP POLICY IF EXISTS "admin_general_can_manage_agencies" ON public.agencies;

-- Operations
DROP POLICY IF EXISTS "operations_agent_own" ON public.operations;
DROP POLICY IF EXISTS "operations_chef_agency" ON public.operations;
DROP POLICY IF EXISTS "operations_admin_all" ON public.operations;

-- Transaction Ledger
DROP POLICY IF EXISTS "transaction_ledger_own" ON public.transaction_ledger;
DROP POLICY IF EXISTS "transaction_ledger_admin" ON public.transaction_ledger;
DROP POLICY IF EXISTS "transaction_ledger_chef_agency" ON public.transaction_ledger;

-- Commission Records
DROP POLICY IF EXISTS "commission_records_agent" ON public.commission_records;
DROP POLICY IF EXISTS "commission_records_chef" ON public.commission_records;
DROP POLICY IF EXISTS "commission_records_admin" ON public.commission_records;

-- ===============================================
-- RÉACTIVER RLS SUR PROFILES
-- ===============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

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
  RAISE NOTICE 'Migration terminée avec succès ! Les politiques RLS ont été corrigées.';
  RAISE NOTICE 'Vous pouvez maintenant tester l authentification.';
END
$$;