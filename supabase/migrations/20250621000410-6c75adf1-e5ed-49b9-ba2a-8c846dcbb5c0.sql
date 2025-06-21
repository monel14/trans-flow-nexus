
-- Fix the operation_types RLS policies to avoid infinite recursion

-- First, drop the existing problematic policies
DROP POLICY IF EXISTS "Developers can manage operation types" ON public.operation_types;

-- Create a security definer function to check if current user is developer
CREATE OR REPLACE FUNCTION public.is_developer()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.user_roles ur 
    JOIN public.roles r ON ur.role_id = r.id
    WHERE ur.user_id = auth.uid() 
    AND r.name = 'developer'
    AND ur.is_active = true
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create new policies using the security definer function
CREATE POLICY "developers_can_manage_operation_types" ON public.operation_types
  FOR ALL
  USING (public.is_developer());

-- Also fix the operation_type_fields policies
DROP POLICY IF EXISTS "Developers can manage operation type fields" ON public.operation_type_fields;

CREATE POLICY "developers_can_manage_operation_type_fields" ON public.operation_type_fields
  FOR ALL
  USING (public.is_developer());

-- Also fix the commission_rules policies  
DROP POLICY IF EXISTS "Developers can manage commission rules" ON public.commission_rules;

CREATE POLICY "developers_can_manage_commission_rules" ON public.commission_rules
  FOR ALL
  USING (public.is_developer());
