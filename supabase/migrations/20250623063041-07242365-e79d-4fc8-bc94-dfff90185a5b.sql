
-- Créer d'abord les fonctions de sécurité nécessaires pour éviter la récursion RLS

-- 1. Créer la fonction pour récupérer le rôle de l'utilisateur connecté
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS TEXT AS $$
DECLARE
  user_role TEXT;
BEGIN
  SELECT r.name INTO user_role
  FROM public.user_roles ur
  JOIN public.roles r ON ur.role_id = r.id
  WHERE ur.user_id = auth.uid() 
  AND ur.is_active = true
  LIMIT 1;
  
  RETURN COALESCE(user_role, 'guest');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 2. Créer la fonction pour récupérer l'agence de l'utilisateur connecté
CREATE OR REPLACE FUNCTION public.get_user_agency_id()
RETURNS INTEGER AS $$
DECLARE
  user_agency_id INTEGER;
BEGIN
  SELECT ur.agency_id INTO user_agency_id
  FROM public.user_roles ur
  WHERE ur.user_id = auth.uid() 
  AND ur.is_active = true
  LIMIT 1;
  
  RETURN user_agency_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 3. Maintenant créer les politiques RLS pour profiles en supprimant les anciennes d'abord
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins and chefs can view profiles in their scope" ON public.profiles;
DROP POLICY IF EXISTS "Admins and chefs can manage profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Admins and chefs can view profiles in their scope" ON public.profiles
  FOR SELECT USING (
    public.get_user_role() IN ('admin_general', 'sous_admin') OR
    (public.get_user_role() = 'chef_agence' AND agency_id = public.get_user_agency_id())
  );

CREATE POLICY "Admins and chefs can manage profiles" ON public.profiles
  FOR ALL USING (
    public.get_user_role() IN ('admin_general') OR
    (public.get_user_role() = 'chef_agence' AND agency_id = public.get_user_agency_id())
  );

-- 4. Créer le trigger pour auto-créer le profil utilisateur lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name)
  VALUES (
    new.id,
    new.email,
    COALESCE(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Supprimer le trigger s'il existe déjà, puis le recréer
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
