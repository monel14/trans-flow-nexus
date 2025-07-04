#!/usr/bin/env python3
"""
Script pour créer un compte développeur
"""

import os
from supabase import create_client, Client

# Configuration Supabase
SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"

def create_developer_account():
    """Crée un compte développeur"""
    print("🧑‍💻 Création du compte développeur...")
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Informations du compte développeur
    developer_email = "developer@example.com"
    developer_password = "dev123456"
    developer_name = "Développeur Admin"
    
    try:
        print(f"📝 Création du compte {developer_email}...")
        
        # 1. Créer le compte auth
        signup_response = supabase.auth.sign_up({
            'email': developer_email,
            'password': developer_password,
            'options': {
                'data': {
                    'name': developer_name
                }
            }
        })
        
        if signup_response.user:
            user_id = signup_response.user.id
            print(f"   ✅ Compte auth créé. User ID: {user_id}")
            
            # 2. Se connecter avec le compte pour créer le profil
            auth_response = supabase.auth.sign_in_with_password({
                "email": developer_email,
                "password": developer_password
            })
            
            if auth_response.user:
                print("   ✅ Connexion réussie")
                
                # 3. Créer le profil (role_id 5 = developer)
                profile_response = supabase.table('profiles').insert({
                    'id': user_id,
                    'email': developer_email,
                    'name': developer_name,
                    'role_id': 5,  # developer
                    'agency_id': None,
                    'is_active': True
                }).execute()
                
                print("   ✅ Profil créé avec rôle developer")
                
                # 4. Créer l'entrée user_roles
                user_role_response = supabase.table('user_roles').insert({
                    'user_id': user_id,
                    'role_id': 5,  # developer
                    'agency_id': None,
                    'is_active': True
                }).execute()
                
                print("   ✅ User role assigné")
                
                supabase.auth.sign_out()
                return True
            else:
                print("   ❌ Échec de connexion après création")
                return False
        else:
            print("   ❌ Échec création auth")
            return False
            
    except Exception as e:
        print(f"   ❌ Erreur: {str(e)}")
        # Si le compte existe déjà, essayer de le mettre à jour
        if "User already registered" in str(e):
            print("   ℹ️  Compte existe déjà, tentative de mise à jour...")
            return update_existing_developer_account(developer_email, developer_password, developer_name)
        return False

def update_existing_developer_account(email, password, name):
    """Met à jour un compte développeur existant"""
    print("🔄 Mise à jour du compte développeur existant...")
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    try:
        # Se connecter avec le compte
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        if auth_response.user:
            user_id = auth_response.user.id
            print(f"   ✅ Connexion réussie. User ID: {user_id}")
            
            # Vérifier si le profil existe
            existing_profile = supabase.table('profiles').select('*').eq('id', user_id).execute()
            
            if len(existing_profile.data) > 0:
                # Mettre à jour le rôle
                update_response = supabase.table('profiles').update({
                    'role_id': 5,  # developer
                    'name': name
                }).eq('id', user_id).execute()
                print("   ✅ Profil mis à jour avec rôle developer")
            else:
                # Créer le profil
                profile_response = supabase.table('profiles').insert({
                    'id': user_id,
                    'email': email,
                    'name': name,
                    'role_id': 5,  # developer
                    'agency_id': None,
                    'is_active': True
                }).execute()
                print("   ✅ Profil créé")
            
            # Vérifier user_roles
            existing_user_role = supabase.table('user_roles').select('*').eq('user_id', user_id).execute()
            
            if len(existing_user_role.data) > 0:
                # Mettre à jour
                update_ur_response = supabase.table('user_roles').update({
                    'role_id': 5,  # developer
                    'is_active': True
                }).eq('user_id', user_id).execute()
                print("   ✅ User role mis à jour")
            else:
                # Créer
                user_role_response = supabase.table('user_roles').insert({
                    'user_id': user_id,
                    'role_id': 5,  # developer
                    'agency_id': None,
                    'is_active': True
                }).execute()
                print("   ✅ User role créé")
            
            supabase.auth.sign_out()
            return True
        else:
            print("   ❌ Échec de connexion")
            return False
            
    except Exception as e:
        print(f"   ❌ Erreur mise à jour: {str(e)}")
        return False

def test_developer_account():
    """Test du compte développeur"""
    print("\n🧪 Test du compte développeur...")
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    developer_email = "developer@example.com"
    developer_password = "dev123456"
    
    try:
        # Connexion
        auth_response = supabase.auth.sign_in_with_password({
            "email": developer_email,
            "password": developer_password
        })
        
        if auth_response.user:
            user_id = auth_response.user.id
            print(f"   ✅ Connexion développeur réussie")
            
            # Vérifier le rôle
            profile_response = supabase.table('profiles').select('*, roles(name, label)').eq('id', user_id).single().execute()
            
            if profile_response.data and profile_response.data.get('roles'):
                role_name = profile_response.data['roles']['name']
                print(f"   ✅ Rôle trouvé: {role_name}")
                
                if role_name == "developer":
                    print(f"   ✅ Rôle developer confirmé!")
                    print(f"   📋 Informations du compte:")
                    print(f"       - Email: {developer_email}")
                    print(f"       - Mot de passe: {developer_password}")
                    print(f"       - Nom: {profile_response.data.get('name')}")
                    print(f"       - Dashboard: /dashboard/developer")
                    
                    supabase.auth.sign_out()
                    return True
                else:
                    print(f"   ⚠️  Rôle incorrect: {role_name}")
            else:
                print(f"   ❌ Pas de rôle trouvé")
            
            supabase.auth.sign_out()
            
        else:
            print(f"   ❌ Échec de connexion développeur")
            
    except Exception as e:
        print(f"   ❌ Erreur test développeur: {str(e)}")
    
    return False

def main():
    print("🚀 Création du compte développeur pour TransFlow Nexus")
    print("="*60)
    
    # 1. Créer le compte développeur
    success = create_developer_account()
    
    # 2. Tester le compte
    if success:
        test_success = test_developer_account()
        
        print("\n" + "="*60)
        if test_success:
            print("✅ COMPTE DÉVELOPPEUR CRÉÉ AVEC SUCCÈS!")
            print("\n🔑 INFORMATIONS DE CONNEXION:")
            print("   Email: dev_admin@transflownexus.demo")
            print("   Mot de passe: dev123")
            print("   URL: http://localhost:8080/")
            print("   Dashboard: /dashboard/developer")
        else:
            print("⚠️  Compte créé mais problème lors du test")
    else:
        print("\n❌ Échec de la création du compte développeur")

if __name__ == "__main__":
    main()