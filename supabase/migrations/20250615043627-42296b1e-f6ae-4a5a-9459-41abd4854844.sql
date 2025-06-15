
-- Create profiles table to store user information accessible from frontend
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own profile
CREATE POLICY "Users can view their own profile" 
  ON public.profiles 
  FOR SELECT 
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update their own profile" 
  ON public.profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Policy: Admins can view all profiles
CREATE POLICY "Admins can view all profiles" 
  ON public.profiles 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('admin_general', 'sous_admin', 'chef_agence')
      AND ur.is_active = true
    )
  );

-- Policy: Admins can insert profiles (for user creation)
CREATE POLICY "Admins can insert profiles" 
  ON public.profiles 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.user_roles ur 
      JOIN public.roles r ON ur.role_id = r.id
      WHERE ur.user_id = auth.uid() 
      AND r.name IN ('admin_general', 'chef_agence')
      AND ur.is_active = true
    )
  );
