
-- Enum des rôles
CREATE TYPE public.app_role AS ENUM ('agent', 'chef_agence', 'admin_general', 'sous_admin', 'developer');

-- Table principale des rôles
CREATE TABLE public.roles (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  label TEXT
);

-- Table des permissions
CREATE TABLE public.permissions (
  id SERIAL PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  label TEXT
);

-- Table de liaison rôle → permissions
CREATE TABLE public.role_permissions (
  role_id INTEGER REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id INTEGER REFERENCES public.permissions(id) ON DELETE CASCADE,
  PRIMARY KEY (role_id, permission_id)
);

-- Table user_roles (utilise l'ID de supabase "auth.users")
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,  -- référence à auth.users mais NON FK (pas accessible)
  role_id INTEGER REFERENCES public.roles(id) ON DELETE CASCADE,
  agency_id INTEGER NULL, -- Pour les agents/chefs d'agence
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role_id)
);

-- Table des agences pour la hiérarchie
CREATE TABLE public.agencies (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  city TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS : Seul un admin_general peut modifier tous les utilisateurs/agents/chefs
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Ex: un utilisateur peut voir/modifier son propre "user_roles"
CREATE POLICY "user_can_manage_own_roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "admin_can_manage_all" ON public.user_roles
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ar 
      JOIN public.roles r ON ar.role_id = r.id
      WHERE ar.user_id = auth.uid() AND r.name = 'admin_general'
    )
  );

-- Politique CRUD sur agences : seuls les admins généraux peuvent créer/modifier
ALTER TABLE public.agencies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_general_can_manage_agencies" ON public.agencies
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ar 
      JOIN public.roles r ON ar.role_id = r.id
      WHERE ar.user_id = auth.uid() AND r.name = 'admin_general'
    )
  );
