-- Correction urgente pour la récursion RLS sur la table roles
-- Cette solution temporaire permet de débloquer immédiatement l'authentification

-- 1. Désactiver temporairement RLS sur la table roles
ALTER TABLE public.roles DISABLE ROW LEVEL SECURITY;

-- 2. Permettre l'accès en lecture à tous les utilisateurs authentifiés
GRANT SELECT ON public.roles TO authenticated;
GRANT SELECT ON public.roles TO anon;

-- 3. Insérer les rôles de base s'ils n'existent pas
INSERT INTO public.roles (id, name, label) VALUES 
  (1, 'agent', 'Agent Commercial'),
  (2, 'chef_agence', 'Chef d''Agence'),
  (3, 'admin_general', 'Administrateur Général'),
  (4, 'sous_admin', 'Sous-Administrateur'),
  (5, 'developer', 'Développeur')
ON CONFLICT (id) DO NOTHING;

-- 4. Commentaire pour documenter la correction
COMMENT ON TABLE public.roles IS 'RLS temporairement désactivé pour corriger la récursion infinie - À revoir avec des politiques RLS simples';