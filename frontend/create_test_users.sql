-- Script pour créer des comptes de test avec confirmation email désactivée
-- À exécuter dans le SQL Editor de Supabase

-- 1. Désactiver la confirmation email (si pas déjà fait)
UPDATE auth.config 
SET confirm_email_change_enabled = false
WHERE id IS NOT NULL;

-- 2. Créer des utilisateurs de test directement dans auth.users
-- IMPORTANT: Ceci doit être adapté selon votre configuration Supabase

-- Insérer des utilisateurs de test avec des mots de passe hashés
-- (Pour le développement, utilisez des mots de passe simples comme "password123")

-- Développeur
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
) VALUES (
    gen_random_uuid(),
    'dev@transflow.com',
    crypt('password123', gen_salt('bf')), -- Hash bcrypt du mot de passe
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Développeur Test"}'
) ON CONFLICT (email) DO NOTHING;

-- Admin général
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
) VALUES (
    gen_random_uuid(),
    'admin@transflow.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Admin Test"}'
) ON CONFLICT (email) DO NOTHING;

-- Sous-admin
INSERT INTO auth.users (
    id,
    email,
    encrypted_password,
    email_confirmed_at,
    created_at,
    updated_at,
    raw_app_meta_data,
    raw_user_meta_data
) VALUES (
    gen_random_uuid(),
    'sousadmin@transflow.com',
    crypt('password123', gen_salt('bf')),
    now(),
    now(),
    now(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Sous-Admin Test"}'
) ON CONFLICT (email) DO NOTHING;

-- 3. Créer les profils correspondants dans la table profiles
-- Insérer le profil du développeur
INSERT INTO public.profiles (
    id,
    email,
    name,
    is_active
) 
SELECT 
    au.id,
    'dev@transflow.com',
    'Développeur Test',
    true
FROM auth.users au 
WHERE au.email = 'dev@transflow.com'
ON CONFLICT (id) DO NOTHING;

-- Insérer le profil de l'admin
INSERT INTO public.profiles (
    id,
    email,
    name,
    is_active
) 
SELECT 
    au.id,
    'admin@transflow.com',
    'Admin Test',
    true
FROM auth.users au 
WHERE au.email = 'admin@transflow.com'
ON CONFLICT (id) DO NOTHING;

-- Insérer le profil du sous-admin
INSERT INTO public.profiles (
    id,
    email,
    name,
    is_active
) 
SELECT 
    au.id,
    'sousadmin@transflow.com',
    'Sous-Admin Test',
    true
FROM auth.users au 
WHERE au.email = 'sousadmin@transflow.com'
ON CONFLICT (id) DO NOTHING;

-- 4. Attribuer les rôles appropriés
-- Développeur
INSERT INTO public.user_roles (user_id, role_id, is_active)
SELECT 
    p.id,
    r.id,
    true
FROM public.profiles p
CROSS JOIN public.roles r
WHERE p.email = 'dev@transflow.com' 
AND r.name = 'developer'
ON CONFLICT (user_id, role_id) DO UPDATE SET is_active = true;

-- Admin général
INSERT INTO public.user_roles (user_id, role_id, is_active)
SELECT 
    p.id,
    r.id,
    true
FROM public.profiles p
CROSS JOIN public.roles r
WHERE p.email = 'admin@transflow.com' 
AND r.name = 'admin_general'
ON CONFLICT (user_id, role_id) DO UPDATE SET is_active = true;

-- Sous-admin
INSERT INTO public.user_roles (user_id, role_id, is_active)
SELECT 
    p.id,
    r.id,
    true
FROM public.profiles p
CROSS JOIN public.roles r
WHERE p.email = 'sousadmin@transflow.com' 
AND r.name = 'sous_admin'
ON CONFLICT (user_id, role_id) DO UPDATE SET is_active = true;

-- 5. Vérifier que les comptes ont été créés
SELECT 
    u.email,
    u.email_confirmed_at,
    p.name,
    r.name as role
FROM auth.users u
JOIN public.profiles p ON u.id = p.id
JOIN public.user_roles ur ON p.id = ur.user_id
JOIN public.roles r ON ur.role_id = r.id
WHERE u.email IN ('dev@transflow.com', 'admin@transflow.com', 'sousadmin@transflow.com')
AND ur.is_active = true;