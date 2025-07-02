-- Migration: Création des fonctions RPC pour création hiérarchique d'utilisateurs
-- Date: $(date)
-- Phase 2: Server-side User Creation

-- =====================================================
-- ÉTAPE 1: Fonction utilitaire de validation
-- =====================================================

-- Drop existing function if exists
DROP FUNCTION IF EXISTS validate_identifier_format(TEXT, TEXT);

-- Create validation function
CREATE OR REPLACE FUNCTION validate_identifier_format(
    identifier_in TEXT,
    expected_role TEXT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
AS $$
BEGIN
    -- Validation pour admin et sous-admin : role.prénom
    IF expected_role IN ('admin_general', 'sous_admin') THEN
        RETURN identifier_in ~ '^(admin|sadmin)\.[a-z]+$';
    END IF;
    
    -- Validation pour chef d'agence : chef.ville.nom
    IF expected_role = 'chef_agence' THEN
        RETURN identifier_in ~ '^chef\.[a-z]+\.[a-z]+$';
    END IF;
    
    -- Validation pour agent : codeagence.prénom
    IF expected_role = 'agent' THEN
        RETURN identifier_in ~ '^[a-z0-9]+\.[a-z]+$';
    END IF;
    
    RETURN FALSE;
END;
$$;

-- =====================================================
-- ÉTAPE 2: Fonction pour créer l'admin initial
-- =====================================================

-- Drop existing function if exists
DROP FUNCTION IF EXISTS create_initial_admin(TEXT, TEXT, TEXT);

-- Create initial admin function
CREATE OR REPLACE FUNCTION create_initial_admin(
    full_name_in TEXT,
    identifier_in TEXT,
    password_in TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    new_user_id UUID;
    admin_role_id INTEGER;
    encrypted_password TEXT;
BEGIN
    -- Vérifier qu'aucun admin n'existe déjà
    IF EXISTS (
        SELECT 1 FROM public.user_roles ur 
        JOIN public.roles r ON ur.role_id = r.id 
        WHERE r.name = 'admin_general' AND ur.is_active = true
    ) THEN
        RAISE EXCEPTION 'Un administrateur général existe déjà dans le système.';
    END IF;

    -- Validation du format
    IF NOT validate_identifier_format(identifier_in, 'admin_general') THEN
        RAISE EXCEPTION 'Format d''identifiant invalide: Utilisez le format admin.prénom (ex: admin.monel)';
    END IF;

    -- Vérifier l'unicité de l'identifiant
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = identifier_in) THEN
        RAISE EXCEPTION 'Identifiant déjà utilisé: %', identifier_in;
    END IF;

    -- Récupérer l'ID du rôle admin_general
    SELECT id INTO admin_role_id FROM public.roles WHERE name = 'admin_general';
    IF admin_role_id IS NULL THEN
        RAISE EXCEPTION 'Rôle admin_general non trouvé dans le système';
    END IF;

    -- Création de l'utilisateur
    new_user_id := gen_random_uuid();
    encrypted_password := crypt(password_in, gen_salt('bf'));

    INSERT INTO auth.users (
        instance_id,
        id,
        aud,
        role,
        email,
        encrypted_password,
        email_confirmed_at,
        raw_app_meta_data,
        raw_user_meta_data,
        created_at,
        updated_at,
        confirmation_token,
        email_confirm
    ) VALUES (
        '00000000-0000-0000-0000-000000000000',
        new_user_id,
        'authenticated',
        'authenticated',
        identifier_in,
        encrypted_password,
        NOW(),
        '{"provider":"email","providers":["email"]}',
        json_build_object('full_name', full_name_in, 'role', 'admin_general', 'identifier', identifier_in),
        NOW(),
        NOW(),
        '',
        true
    );

    -- Création du profil
    INSERT INTO public.profiles (
        id,
        email,
        name,
        agency_id,
        is_active,
        balance,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        identifier_in,
        full_name_in,
        NULL,
        true,
        0,
        NOW(),
        NOW()
    );

    -- Assignation du rôle
    INSERT INTO public.user_roles (
        id,
        user_id,
        role_id,
        agency_id,
        is_active,
        created_at,
        updated_at
    ) VALUES (
        gen_random_uuid()::text,
        new_user_id,
        admin_role_id,
        NULL,
        true,
        NOW(),
        NOW()
    );

    RETURN json_build_object(
        'status', 'success',
        'user_id', new_user_id,
        'identifier', identifier_in,
        'message', 'Administrateur général initial créé avec succès'
    );

EXCEPTION
    WHEN OTHERS THEN
        RETURN json_build_object(
            'status', 'error',
            'message', SQLERRM,
            'code', SQLSTATE
        );
END;
$$;

-- =====================================================
-- COMMENTAIRES ET INSTRUCTIONS
-- =====================================================

-- Cette migration crée les fonctions de base pour le système hiérarchique.
-- Pour appliquer cette migration:
-- 1. Copiez ce contenu dans le SQL Editor de Supabase
-- 2. Exécutez-le
-- 3. Testez avec: SELECT create_initial_admin('Admin Principal', 'admin.monel', 'motdepasse123');

-- Les fonctions complètes (create_chef_agence, create_sous_admin, create_agent) 
-- seront ajoutées dans la prochaine migration pour éviter les erreurs de timeout.