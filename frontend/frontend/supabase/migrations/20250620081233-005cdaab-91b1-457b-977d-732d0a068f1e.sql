
-- First, drop the existing problematic policies
DROP POLICY IF EXISTS "admin_can_manage_all" ON public.user_roles;
DROP POLICY IF EXISTS "user_can_manage_own_roles" ON public.user_roles;

-- Create a security definer function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin_general()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles ur 
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() 
    AND r.name = 'admin_general'
    AND ur.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create new policies using the security definer function
CREATE POLICY "user_can_view_own_roles" ON public.user_roles
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "admin_general_can_manage_all_user_roles" ON public.user_roles
  FOR ALL
  USING (public.is_admin_general());

-- Also fix the agencies table policy
DROP POLICY IF EXISTS "admin_general_can_manage_agencies" ON public.agencies;

CREATE POLICY "admin_general_can_manage_agencies" ON public.agencies
  FOR ALL
  USING (public.is_admin_general());
