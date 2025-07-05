#!/usr/bin/env python3
"""
Script pour convertir le compte sous-admin en développeur
ou créer un nouveau compte avec un format d'email spécial
"""

import os
from supabase import create_client, Client

# Configuration Supabase
SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"

def convert_sadmin_to_developer():
    """Convertit le compte sous-admin en développeur"""
    print("🔄 Conversion du sous-admin en développeur...")
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    try:
        # Se connecter avec le sous-admin
        auth_response = supabase.auth.sign_in_with_password({
            "email": "sadmin_pierre@transflownexus.demo",
            "password": "sadmin123"
        })
        
        if auth_response.user:
            user_id = auth_response.user.id
            print(f"   ✅ Connexion sous-admin réussie. User ID: {user_id}")
            
            # Mettre à jour le profil pour en faire un développeur
            profile_update = supabase.table('profiles').update({
                'role_id': 5,  # developer
                'name': 'Pierre Développeur'
            }).eq('id', user_id).execute()
            
            print("   ✅ Profil mis à jour vers developer")
            
            # Mettre à jour user_roles
            user_role_update = supabase.table('user_roles').update({
                'role_id': 5  # developer
            }).eq('user_id', user_id).execute()
            
            print("   ✅ User role mis à jour vers developer")
            
            supabase.auth.sign_out()
            
            # Tester la connexion
            return test_developer_connection()
        else:
            print("   ❌ Échec connexion sous-admin")
            return False
            
    except Exception as e:
        print(f"   ❌ Erreur conversion: {str(e)}")
        return False

def create_new_developer_account():
    """Crée un nouveau compte développeur avec format email spécial"""
    print("\n🆕 Création d'un nouveau compte développeur...")
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Essayons avec un format d'email qui ressemble aux autres comptes
    developer_email = "dev_user@transflownexus.demo"
    developer_password = "dev123"
    developer_name = "Utilisateur Développeur"
    
    try:
        print(f"📝 Tentative avec {developer_email}...")
        
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
            
            # Se connecter avec le nouveau compte
            dev_auth = supabase.auth.sign_in_with_password({
                "email": developer_email,
                "password": developer_password
            })
            
            if dev_auth.user:
                print("   ✅ Connexion développeur réussie")
                
                # Créer le profil
                profile_response = supabase.table('profiles').insert({
                    'id': user_id,
                    'email': developer_email,
                    'name': developer_name,
                    'role_id': 5,  # developer
                    'agency_id': None,
                    'is_active': True
                }).execute()
                
                print("   ✅ Profil développeur créé")
                
                supabase.auth.sign_out()
                return (developer_email, developer_password)
            else:
                print("   ❌ Échec connexion nouveau développeur")
                return None
        else:
            print("   ❌ Échec création nouveau compte")
            return None
            
    except Exception as e:
        print(f"   ❌ Erreur nouveau compte: {str(e)}")
        return None

def test_developer_connection():
    """Test le compte développeur (Pierre converti)"""
    print("\n🧪 Test du compte développeur...")
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    try:
        # Test avec Pierre (ex-sous-admin maintenant développeur)
        auth_response = supabase.auth.sign_in_with_password({
            "email": "sadmin_pierre@transflownexus.demo",
            "password": "sadmin123"
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
                    print(f"   ✅ Conversion réussie!")
                    print(f"\n🔑 INFORMATIONS DE CONNEXION DÉVELOPPEUR:")
                    print(f"   Email: sadmin_pierre@transflownexus.demo")
                    print(f"   Mot de passe: sadmin123")
                    print(f"   Nom: {profile_response.data.get('name')}")
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
            print(f"   ❌ Échec connexion")
            
    except Exception as e:
        print(f"   ❌ Erreur test: {str(e)}")
    
    return False

def main():
    print("🚀 Création/Conversion compte développeur")
    print("="*50)
    
    # Option 1: Convertir le sous-admin existant
    print("Option 1: Conversion du sous-admin en développeur")
    success1 = convert_sadmin_to_developer()
    
    if success1:
        print("\n✅ CONVERSION RÉUSSIE!")
        print("Le compte sadmin_pierre@transflownexus.demo est maintenant un développeur.")
    else:
        print("\n⚠️  Conversion échouée, tentative de création d'un nouveau compte...")
        
        # Option 2: Créer un nouveau compte
        print("\nOption 2: Création d'un nouveau compte développeur")
        new_account = create_new_developer_account()
        
        if new_account:
            email, password = new_account
            print(f"\n✅ NOUVEAU COMPTE CRÉÉ!")
            print(f"   Email: {email}")
            print(f"   Mot de passe: {password}")
        else:
            print("\n❌ Échec création nouveau compte")
            print("\nSolution alternative: Utiliser le compte admin pour accéder aux fonctions développeur")
            print("   Email: admin_monel@transflownexus.demo")
            print("   Mot de passe: admin123")

if __name__ == "__main__":
    main()