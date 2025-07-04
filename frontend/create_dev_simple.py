#!/usr/bin/env python3
"""
Script pour créer un compte développeur via l'admin existant
"""

import os
from supabase import create_client, Client

# Configuration Supabase
SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"

def create_developer_via_admin():
    """Crée un compte développeur en utilisant l'admin"""
    print("🧑‍💻 Création du compte développeur via admin...")
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Informations du compte développeur
    developer_email = "developer.admin@transflownexus.app"  # Format différent
    developer_password = "developer2024!"
    developer_name = "Développeur Admin"
    
    try:
        print(f"🔐 Connexion avec admin...")
        
        # Se connecter avec l'admin
        admin_auth = supabase.auth.sign_in_with_password({
            "email": "admin_monel@transflownexus.demo",
            "password": "admin123"
        })
        
        if admin_auth.user:
            print("   ✅ Admin connecté")
            
            # Déconnecter l'admin et essayer de créer le nouveau compte
            supabase.auth.sign_out()
            
            print(f"📝 Création du compte développeur...")
            
            # Tentative de création avec un email plus simple
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
                
                # Se reconnecter avec l'admin pour créer le profil
                admin_auth2 = supabase.auth.sign_in_with_password({
                    "email": "admin_monel@transflownexus.demo",
                    "password": "admin123"
                })
                
                if admin_auth2.user:
                    print("   ✅ Admin reconnecté pour créer le profil")
                    
                    # Créer le profil via admin
                    profile_response = supabase.table('profiles').insert({
                        'id': user_id,
                        'email': developer_email,
                        'name': developer_name,
                        'role_id': 5,  # developer
                        'agency_id': None,
                        'is_active': True
                    }).execute()
                    
                    print("   ✅ Profil créé avec rôle developer")
                    
                    # Créer l'entrée user_roles
                    user_role_response = supabase.table('user_roles').insert({
                        'user_id': user_id,
                        'role_id': 5,  # developer
                        'agency_id': None,
                        'is_active': True
                    }).execute()
                    
                    print("   ✅ User role assigné")
                    
                    supabase.auth.sign_out()
                    
                    # Tester la connexion du développeur
                    return test_developer_login(developer_email, developer_password)
                else:
                    print("   ❌ Échec reconnexion admin")
                    return False
            else:
                print("   ❌ Échec création compte auth")
                return False
        else:
            print("   ❌ Échec connexion admin")
            return False
            
    except Exception as e:
        print(f"   ❌ Erreur: {str(e)}")
        # Si l'email n'est pas accepté, essayons un format encore plus simple
        if "invalid" in str(e).lower():
            return try_simpler_email()
        return False

def try_simpler_email():
    """Essaie avec un email encore plus simple"""
    print("\n🔄 Tentative avec email plus simple...")
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Email très simple
    developer_email = "dev@test.com"
    developer_password = "dev123456"
    developer_name = "Développeur"
    
    try:
        print(f"📝 Création avec {developer_email}...")
        
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
            print(f"   ✅ Compte créé! User ID: {user_id}")
            
            # Se connecter avec le nouveau compte pour créer son profil
            dev_auth = supabase.auth.sign_in_with_password({
                "email": developer_email,
                "password": developer_password
            })
            
            if dev_auth.user:
                print("   ✅ Connexion développeur réussie")
                
                # Créer son propre profil
                profile_response = supabase.table('profiles').insert({
                    'id': user_id,
                    'email': developer_email,
                    'name': developer_name,
                    'role_id': 5,  # developer
                    'agency_id': None,
                    'is_active': True
                }).execute()
                
                print("   ✅ Profil créé")
                
                # Créer user_roles (peut échouer à cause des RLS, c'est normal)
                try:
                    user_role_response = supabase.table('user_roles').insert({
                        'user_id': user_id,
                        'role_id': 5,  # developer
                        'agency_id': None,
                        'is_active': True
                    }).execute()
                    print("   ✅ User role créé")
                except Exception as ur_error:
                    print(f"   ⚠️  User role pas créé (normal): {str(ur_error)}")
                
                supabase.auth.sign_out()
                return test_developer_login(developer_email, developer_password)
            else:
                print("   ❌ Échec connexion développeur")
                return False
        else:
            print("   ❌ Échec création")
            return False
            
    except Exception as e:
        print(f"   ❌ Erreur email simple: {str(e)}")
        return False

def test_developer_login(email, password):
    """Test de connexion du développeur"""
    print(f"\n🧪 Test de connexion développeur {email}...")
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    try:
        # Test de connexion
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        if auth_response.user:
            user_id = auth_response.user.id
            print(f"   ✅ Connexion réussie")
            
            # Vérifier le rôle
            profile_response = supabase.table('profiles').select('*, roles(name, label)').eq('id', user_id).single().execute()
            
            if profile_response.data and profile_response.data.get('roles'):
                role_name = profile_response.data['roles']['name']
                print(f"   ✅ Rôle trouvé: {role_name}")
                
                if role_name == "developer":
                    print(f"   ✅ Compte développeur fonctionnel!")
                    print(f"\n🔑 INFORMATIONS DE CONNEXION:")
                    print(f"   Email: {email}")
                    print(f"   Mot de passe: {password}")
                    print(f"   URL: http://localhost:8080/")
                    print(f"   Dashboard: /dashboard/developer")
                    
                    supabase.auth.sign_out()
                    return True
                else:
                    print(f"   ⚠️  Rôle incorrect: {role_name}")
            else:
                print(f"   ❌ Pas de rôle trouvé")
            
            supabase.auth.sign_out()
        else:
            print(f"   ❌ Échec connexion test")
            
    except Exception as e:
        print(f"   ❌ Erreur test: {str(e)}")
    
    return False

def main():
    print("🚀 Création du compte développeur")
    print("="*50)
    
    success = create_developer_via_admin()
    
    print("\n" + "="*50)
    if success:
        print("✅ COMPTE DÉVELOPPEUR CRÉÉ AVEC SUCCÈS!")
        print("\nVous pouvez maintenant vous connecter et accéder au dashboard développeur.")
    else:
        print("❌ Échec de la création du compte développeur")
        print("Vous pouvez essayer de créer le compte manuellement via le dashboard Supabase.")

if __name__ == "__main__":
    main()