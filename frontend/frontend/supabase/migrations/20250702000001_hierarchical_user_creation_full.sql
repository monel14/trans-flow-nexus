-- Migration: Fonctions RPC complètes pour création hiérarchique (Partie 2)
-- Date: $(date)
-- Phase 2: Fonctions de création par rôle

-- =====================================================
-- FONCTION 1: create_chef_agence
-- =====================================================

-- Drop existing function if exists
DROP FUNCTION IF EXISTS create_chef_agence(TEXT, TEXT, TEXT, INTEGER);

CREATE OR REPLACE FUNCTION create_chef_agence(
    full_name_in TEXT,
    identifier_in TEXT,
    password_in TEXT,
    agency_id_in INTEGER
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    calling_user_id UUID := auth.uid();
    calling_user_role TEXT;
    new_user_id UUID;
    chef_role_id INTEGER;
    encrypted_password TEXT;
BEGIN
    -- ÉTAPE 1: VÉRIFICATION DES PERMISSIONS
    IF calling_user_id IS NULL THEN
        RAISE EXCEPTION 'Non authentifié: Vous devez être connecté pour créer un utilisateur.';
    END IF;

    -- Récupérer le rôle de l'utilisateur appelant
    SELECT r.name INTO calling_user_role
    FROM public.profiles p
    JOIN public.user_roles ur ON p.id = ur.user_id
    JOIN public.roles r ON ur.role_id = r.id
    WHERE p.id = calling_user_id AND ur.is_active = true;

    IF calling_user_role != 'admin_general' THEN
        RAISE EXCEPTION 'Permission refusée: Seul un Administrateur Général peut créer un Chef d''Agence.';
    END IF;

    -- ÉTAPE 2: VALIDATION DES DONNÉES
    IF NOT validate_identifier_format(identifier_in, 'chef_agence') THEN
        RAISE EXCEPTION 'Format d''identifiant invalide: Utilisez le format chef.ville.nom (ex: chef.dakar.diallo)';
    END IF;

    -- Vérifier l'unicité de l'identifiant
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = identifier_in) THEN
        RAISE EXCEPTION 'Identifiant déjà utilisé: %', identifier_in;
    END IF;

    -- Vérifier que l'agence existe
    IF NOT EXISTS (SELECT 1 FROM public.agencies WHERE id = agency_id_in) THEN
        RAISE EXCEPTION 'Agence inexistante: ID %', agency_id_in;
    END IF;

    -- Récupérer l'ID du rôle chef_agence
    SELECT id INTO chef_role_id FROM public.roles WHERE name = 'chef_agence';
    IF chef_role_id IS NULL THEN
        RAISE EXCEPTION 'Rôle chef_agence non trouvé dans le système';
    END IF;

    -- ÉTAPE 3: CRÉATION DE L'UTILISATEUR AUTH
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
        json_build_object('full_name', full_name_in, 'role', 'chef_agence', 'identifier', identifier_in),
        NOW(),
        NOW(),
        '',
        true
    );

    -- ÉTAPE 4: CRÉATION DU PROFIL
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
        agency_id_in,
        true,
        0,
        NOW(),
        NOW()
    );

    -- ÉTAPE 5: ASSIGNATION DU RÔLE
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
        chef_role_id,
        agency_id_in,
        true,
        NOW(),
        NOW()
    );

    -- ÉTAPE 6: MISE À JOUR DE L'AGENCE
    UPDATE public.agencies 
    SET chef_agence_id = new_user_id::text
    WHERE id = agency_id_in;

    RETURN json_build_object(
        'status', 'success',
        'user_id', new_user_id,
        'identifier', identifier_in,
        'message', 'Chef d''agence créé avec succès'
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
-- FONCTION 2: create_sous_admin
-- =====================================================

-- Drop existing function if exists
DROP FUNCTION IF EXISTS create_sous_admin(TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION create_sous_admin(
    full_name_in TEXT,
    identifier_in TEXT,
    password_in TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    calling_user_id UUID := auth.uid();
    calling_user_role TEXT;
    new_user_id UUID;
    sous_admin_role_id INTEGER;
    encrypted_password TEXT;
BEGIN
    -- ÉTAPE 1: VÉRIFICATION DES PERMISSIONS
    IF calling_user_id IS NULL THEN
        RAISE EXCEPTION 'Non authentifié: Vous devez être connecté pour créer un utilisateur.';
    END IF;

    -- Récupérer le rôle de l'utilisateur appelant
    SELECT r.name INTO calling_user_role
    FROM public.profiles p
    JOIN public.user_roles ur ON p.id = ur.user_id
    JOIN public.roles r ON ur.role_id = r.id
    WHERE p.id = calling_user_id AND ur.is_active = true;

    IF calling_user_role != 'admin_general' THEN
        RAISE EXCEPTION 'Permission refusée: Seul un Administrateur Général peut créer un Sous-Administrateur.';
    END IF;

    -- ÉTAPE 2: VALIDATION DES DONNÉES
    IF NOT validate_identifier_format(identifier_in, 'sous_admin') THEN
        RAISE EXCEPTION 'Format d''identifiant invalide: Utilisez le format sadmin.prénom (ex: sadmin.pierre)';
    END IF;

    -- Vérifier l'unicité de l'identifiant
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = identifier_in) THEN
        RAISE EXCEPTION 'Identifiant déjà utilisé: %', identifier_in;
    END IF;

    -- Récupérer l'ID du rôle sous_admin
    SELECT id INTO sous_admin_role_id FROM public.roles WHERE name = 'sous_admin';
    IF sous_admin_role_id IS NULL THEN
        RAISE EXCEPTION 'Rôle sous_admin non trouvé dans le système';
    END IF;

    -- ÉTAPE 3: CRÉATION DE L'UTILISATEUR AUTH
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
        json_build_object('full_name', full_name_in, 'role', 'sous_admin', 'identifier', identifier_in),
        NOW(),
        NOW(),
        '',
        true
    );

    -- ÉTAPE 4: CRÉATION DU PROFIL
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

    -- ÉTAPE 5: ASSIGNATION DU RÔLE
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
        sous_admin_role_id,
        NULL,
        true,
        NOW(),
        NOW()
    );

    RETURN json_build_object(
        'status', 'success',
        'user_id', new_user_id,
        'identifier', identifier_in,
        'message', 'Sous-administrateur créé avec succès'
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
-- FONCTION 3: create_agent
-- =====================================================

-- Drop existing function if exists
DROP FUNCTION IF EXISTS create_agent(TEXT, TEXT, TEXT);

CREATE OR REPLACE FUNCTION create_agent(
    full_name_in TEXT,
    identifier_in TEXT,
    password_in TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    calling_user_id UUID := auth.uid();
    calling_user_role TEXT;
    calling_user_agency_id INTEGER;
    new_user_id UUID;
    agent_role_id INTEGER;
    encrypted_password TEXT;
BEGIN
    -- ÉTAPE 1: VÉRIFICATION DES PERMISSIONS
    IF calling_user_id IS NULL THEN
        RAISE EXCEPTION 'Non authentifié: Vous devez être connecté pour créer un utilisateur.';
    END IF;

    -- Récupérer le rôle et l'agence de l'utilisateur appelant
    SELECT r.name, ur.agency_id INTO calling_user_role, calling_user_agency_id
    FROM public.profiles p
    JOIN public.user_roles ur ON p.id = ur.user_id
    JOIN public.roles r ON ur.role_id = r.id
    WHERE p.id = calling_user_id AND ur.is_active = true;

    IF calling_user_role != 'chef_agence' THEN
        RAISE EXCEPTION 'Permission refusée: Seul un Chef d''Agence peut créer un Agent.';
    END IF;

    IF calling_user_agency_id IS NULL THEN
        RAISE EXCEPTION 'Erreur système: Chef d''agence sans agence assignée.';
    END IF;

    -- ÉTAPE 2: VALIDATION DES DONNÉES
    IF NOT validate_identifier_format(identifier_in, 'agent') THEN
        RAISE EXCEPTION 'Format d''identifiant invalide: Utilisez le format codeagence.prénom (ex: dkr01.fatou)';
    END IF;

    -- Vérifier l'unicité de l'identifiant
    IF EXISTS (SELECT 1 FROM auth.users WHERE email = identifier_in) THEN
        RAISE EXCEPTION 'Identifiant déjà utilisé: %', identifier_in;
    END IF;

    -- Récupérer l'ID du rôle agent
    SELECT id INTO agent_role_id FROM public.roles WHERE name = 'agent';
    IF agent_role_id IS NULL THEN
        RAISE EXCEPTION 'Rôle agent non trouvé dans le système';
    END IF;

    -- ÉTAPE 3: CRÉATION DE L'UTILISATEUR AUTH
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
        json_build_object('full_name', full_name_in, 'role', 'agent', 'identifier', identifier_in),
        NOW(),
        NOW(),
        '',
        true
    );

    -- ÉTAPE 4: CRÉATION DU PROFIL
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
        calling_user_agency_id,
        true,
        0,
        NOW(),
        NOW()
    );

    -- ÉTAPE 5: ASSIGNATION DU RÔLE
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
        agent_role_id,
        calling_user_agency_id,
        true,
        NOW(),
        NOW()
    );

    RETURN json_build_object(
        'status', 'success',
        'user_id', new_user_id,
        'identifier', identifier_in,
        'agency_id', calling_user_agency_id,
        'message', 'Agent créé avec succès dans votre agence'
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