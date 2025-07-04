-- ===============================================
-- FIX: Supabase RLS Infinite Recursion 
-- ===============================================
-- Cette migration corrige les politiques RLS qui causent la récursion infinie

-- Première étape : Désactiver temporairement RLS sur profiles pour créer les fonctions
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Créer des fonctions sécurisées pour éviter la récursion RLS
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

CREATE OR REPLACE FUNCTION public.get_user_agency_id(user_uuid uuid)
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

CREATE OR REPLACE FUNCTION public.user_has_role(user_uuid uuid, role_names text[])
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

-- Réactiver RLS sur profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ===============================================
-- NETTOYER ET RECRÉER LES POLITIQUES PROFILES
-- ===============================================

-- Supprimer toutes les politiques existantes sur profiles
DROP POLICY IF EXISTS "profiles_own_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_access" ON public.profiles;
DROP POLICY IF EXISTS "profiles_chef_agency_access" ON public.profiles;

-- Politique simple pour l'accès à son propre profil
CREATE POLICY "profiles_own_access" ON public.profiles
  FOR ALL 
  USING (auth.uid() = id);

-- Politique pour les administrateurs utilisant la fonction sécurisée
CREATE POLICY "profiles_admin_access" ON public.profiles
  FOR ALL 
  USING (
    user_has_role(auth.uid(), ARRAY['admin_general', 'sous_admin'])
  );

-- Politique pour les chefs d'agence (même agence)
CREATE POLICY "profiles_chef_agency_access" ON public.profiles
  FOR ALL 
  USING (
    user_has_role(auth.uid(), ARRAY['chef_agence']) AND
    get_user_agency_id(auth.uid()) = agency_id AND
    get_user_agency_id(auth.uid()) IS NOT NULL
  );

-- ===============================================
-- CORRIGER LES AUTRES POLITIQUES QUI UTILISENT PROFILES
-- ===============================================

-- Agences
DROP POLICY IF EXISTS "agencies_admin_manage" ON public.agencies;
DROP POLICY IF EXISTS "agencies_chef_view_own" ON public.agencies;

CREATE POLICY "agencies_admin_manage" ON public.agencies
  FOR ALL 
  USING (
    user_has_role(auth.uid(), ARRAY['admin_general'])
  );

CREATE POLICY "agencies_chef_view_own" ON public.agencies
  FOR SELECT 
  USING (
    user_has_role(auth.uid(), ARRAY['chef_agence']) AND
    get_user_agency_id(auth.uid()) = id
  );

-- ===============================================
-- AUTRES POLITIQUES CORRIGÉES
-- ===============================================

-- Opérations
DROP POLICY IF EXISTS "operations_agent_own" ON public.operations;
DROP POLICY IF EXISTS "operations_chef_agency" ON public.operations;
DROP POLICY IF EXISTS "operations_admin_all" ON public.operations;

CREATE POLICY "operations_agent_own" ON public.operations
  FOR ALL 
  USING (
    initiator_id = auth.uid() OR
    user_has_role(auth.uid(), ARRAY['admin_general', 'sous_admin'])
  );

CREATE POLICY "operations_chef_agency" ON public.operations
  FOR ALL 
  USING (
    user_has_role(auth.uid(), ARRAY['chef_agence']) AND
    get_user_agency_id(auth.uid()) = agency_id
  );

-- Transaction Ledger
DROP POLICY IF EXISTS "transaction_ledger_own" ON public.transaction_ledger;
DROP POLICY IF EXISTS "transaction_ledger_admin" ON public.transaction_ledger;
DROP POLICY IF EXISTS "transaction_ledger_chef_agency" ON public.transaction_ledger;

CREATE POLICY "transaction_ledger_own" ON public.transaction_ledger
  FOR SELECT 
  USING (user_id = auth.uid());

CREATE POLICY "transaction_ledger_admin" ON public.transaction_ledger
  FOR ALL 
  USING (
    user_has_role(auth.uid(), ARRAY['admin_general', 'sous_admin'])
  );

-- Commission Records
DROP POLICY IF EXISTS "commission_records_agent" ON public.commission_records;
DROP POLICY IF EXISTS "commission_records_chef" ON public.commission_records;
DROP POLICY IF EXISTS "commission_records_admin" ON public.commission_records;

CREATE POLICY "commission_records_agent" ON public.commission_records
  FOR SELECT 
  USING (
    agent_id = auth.uid() OR
    chef_agence_id = auth.uid()
  );

CREATE POLICY "commission_records_admin" ON public.commission_records
  FOR ALL 
  USING (
    user_has_role(auth.uid(), ARRAY['admin_general', 'sous_admin'])
  );

-- ===============================================
-- PERMISSIONS POUR LES FONCTIONS HELPER
-- ===============================================

-- Donner les permissions appropriées aux fonctions
GRANT EXECUTE ON FUNCTION public.get_user_role_name(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_agency_id(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.user_has_role(uuid, text[]) TO authenticated;

-- ===============================================
-- VÉRIFICATION : CRÉER UN UTILISATEUR DE TEST
-- ===============================================

-- Insérer un utilisateur de test directement si nécessaire
-- (Ce sera fait via l'interface de génération de comptes)

COMMENT ON FUNCTION public.get_user_role_name IS 'Fonction sécurisée pour obtenir le nom du rôle utilisateur sans récursion RLS';
COMMENT ON FUNCTION public.get_user_agency_id IS 'Fonction sécurisée pour obtenir l ID de l agence utilisateur sans récursion RLS';
COMMENT ON FUNCTION public.user_has_role IS 'Fonction sécurisée pour vérifier si un utilisateur a un rôle spécifique sans récursion RLS';