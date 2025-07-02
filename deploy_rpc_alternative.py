#!/usr/bin/env python3
"""
Script pour appliquer le SQL directement via l'endpoint SQL de Supabase.
"""

import os
import requests
import json

SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

def create_rpc_functions_via_curl():
    """Créer les fonctions RPC en utilisant curl vers l'API SQL."""
    
    print("🔧 Création des fonctions RPC via l'API SQL...")
    
    # Lire le fichier SQL
    try:
        with open('supabase_rpc_functions.sql', 'r', encoding='utf-8') as f:
            sql_content = f.read()
    except Exception as e:
        print(f"❌ Erreur lecture fichier: {e}")
        return False
    
    # Essayer d'exécuter via l'endpoint SQL brut de Supabase
    try:
        # L'endpoint SQL direct de Supabase
        url = f"{SUPABASE_URL}/sql"
        
        headers = {
            'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
            'Content-Type': 'application/sql',
            'Accept': 'application/json'
        }
        
        # Envoyer le SQL complet
        response = requests.post(url, headers=headers, data=sql_content)
        
        print(f"📡 Réponse API: {response.status_code}")
        
        if response.status_code in [200, 201]:
            print("✅ Fonctions RPC créées avec succès!")
            return True
        else:
            print(f"⚠️ Réponse: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur API SQL: {e}")
        return False

def create_functions_individually():
    """Créer les fonctions une par une."""
    
    print("🔧 Création des fonctions individuellement...")
    
    functions = [
        {
            'name': 'validate_identifier_format',
            'sql': '''
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
        RETURN identifier_in ~ '^(admin|sadmin)\\.[a-z]+$';
    END IF;
    
    -- Validation pour chef d'agence : chef.ville.nom
    IF expected_role = 'chef_agence' THEN
        RETURN identifier_in ~ '^chef\\.[a-z]+\\.[a-z]+$';
    END IF;
    
    -- Validation pour agent : codeagence.prénom
    IF expected_role = 'agent' THEN
        RETURN identifier_in ~ '^[a-z0-9]+\\.[a-z]+$';
    END IF;
    
    RETURN FALSE;
END;
$$;
            '''
        },
        {
            'name': 'create_initial_admin',
            'sql': '''
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
        WHERE r.name = 'admin_general'
    ) THEN
        RAISE EXCEPTION 'Un administrateur général existe déjà dans le système.';
    END IF;

    -- Validation du format
    IF NOT validate_identifier_format(identifier_in, 'admin_general') THEN
        RAISE EXCEPTION 'Format d''identifiant invalide: Utilisez le format admin.prénom (ex: admin.monel)';
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
            '''
        }
    ]
    
    success_count = 0
    
    for func in functions:
        try:
            print(f"  📦 Création de {func['name']}...")
            
            # Essayer via curl
            import subprocess
            
            # Créer un fichier temporaire pour le SQL
            temp_file = f"/tmp/{func['name']}.sql"
            with open(temp_file, 'w') as f:
                f.write(func['sql'])
            
            # Essayer via curl
            curl_command = [
                'curl', '-X', 'POST',
                f"{SUPABASE_URL}/sql",
                '-H', f"Authorization: Bearer {SUPABASE_SERVICE_KEY}",
                '-H', "Content-Type: application/sql",
                '--data-binary', f"@{temp_file}"
            ]
            
            result = subprocess.run(curl_command, capture_output=True, text=True)
            
            if result.returncode == 0:
                print(f"    ✅ {func['name']} créée")
                success_count += 1
            else:
                print(f"    ⚠️ {func['name']}: {result.stderr}")
            
            # Nettoyer le fichier temporaire
            os.remove(temp_file)
            
        except Exception as e:
            print(f"    ❌ {func['name']}: {e}")
    
    return success_count > 0

def main():
    """Fonction principale."""
    print("🚀 DÉPLOIEMENT DES FONCTIONS RPC - MÉTHODE ALTERNATIVE")
    print("="*60)
    
    if not SUPABASE_SERVICE_KEY:
        print("❌ SUPABASE_SERVICE_KEY non définie")
        return
    
    # Essayer différentes méthodes
    success = False
    
    # Méthode 1: API SQL directe
    print("\n1️⃣ Essai via l'API SQL directe...")
    success = create_rpc_functions_via_curl()
    
    if not success:
        # Méthode 2: Fonctions individuelles
        print("\n2️⃣ Essai avec fonctions individuelles...")
        success = create_functions_individually()
    
    # Test final
    print("\n🧪 Test final des fonctions...")
    test_basic_function()

def test_basic_function():
    """Tester une fonction de base."""
    try:
        url = f"{SUPABASE_URL}/rest/v1/rpc/validate_identifier_format"
        
        headers = {
            'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY
        }
        
        payload = {
            'identifier_in': 'admin.test',
            'expected_role': 'admin_general'
        }
        
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code == 200:
            print("✅ Fonction validate_identifier_format fonctionne!")
            print(f"   Résultat: {response.json()}")
            return True
        else:
            print(f"⚠️ Fonction non trouvée: {response.status_code}")
            return False
            
    except Exception as e:
        print(f"⚠️ Erreur test: {e}")
        return False

if __name__ == "__main__":
    main()