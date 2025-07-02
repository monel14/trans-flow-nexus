#!/usr/bin/env python3
"""
Script pour créer manuellement les profils manquants
en se connectant avec chaque utilisateur puis en créant son propre profil.
"""

import os
from supabase import create_client, Client

# Configuration Supabase
SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"

def create_profile_for_user(email, password, name, role_id, agency_id=None):
    """Crée un profil pour un utilisateur existant en se connectant avec lui"""
    print(f"\n👤 Création du profil pour {email}...")
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    try:
        # Se connecter avec l'utilisateur
        auth_response = supabase.auth.sign_in_with_password({
            "email": email,
            "password": password
        })
        
        if auth_response.user:
            user_id = auth_response.user.id
            print(f"   ✅ Connexion réussie. User ID: {user_id}")
            
            # Vérifier si le profil existe déjà
            existing_profile = supabase.table('profiles').select('*').eq('id', user_id).execute()
            
            if len(existing_profile.data) > 0:
                print(f"   ✅ Profil existe déjà")
                # Mettre à jour le rôle si nécessaire
                if existing_profile.data[0].get('role_id') != role_id:
                    update_response = supabase.table('profiles').update({
                        'role_id': role_id,
                        'agency_id': agency_id
                    }).eq('id', user_id).execute()
                    print(f"   ✅ Rôle mis à jour")
            else:
                # Créer le profil (l'utilisateur peut créer son propre profil)
                profile_response = supabase.table('profiles').insert({
                    'id': user_id,
                    'email': email,
                    'name': name,
                    'role_id': role_id,
                    'agency_id': agency_id,
                    'is_active': True
                }).execute()
                print(f"   ✅ Profil créé")
            
            # Créer/mettre à jour l'entrée user_roles si elle n'existe pas
            existing_user_role = supabase.table('user_roles').select('*').eq('user_id', user_id).execute()
            
            if len(existing_user_role.data) == 0:
                user_role_response = supabase.table('user_roles').insert({
                    'user_id': user_id,
                    'role_id': role_id,
                    'agency_id': agency_id,
                    'is_active': True
                }).execute()
                print(f"   ✅ User role créé")
            else:
                print(f"   ✅ User role existe déjà")
            
            supabase.auth.sign_out()
            return True
        else:
            print(f"   ❌ Échec de connexion")
            return False
            
    except Exception as e:
        print(f"   ❌ Erreur: {str(e)}")
        return False

def create_agency_manually():
    """Créer une agence en se connectant avec l'admin"""
    print("\n🏢 Création d'agence via admin...")
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    try:
        # Se connecter avec l'admin
        auth_response = supabase.auth.sign_in_with_password({
            "email": "admin_monel@transflownexus.demo",
            "password": "admin123"
        })
        
        if auth_response.user:
            print("   ✅ Connexion admin réussie")
            
            # Vérifier si l'agence 1 existe
            existing_agency = supabase.table('agencies').select('*').eq('id', 1).execute()
            
            if len(existing_agency.data) == 0:
                # Créer l'agence 1
                agency_response = supabase.table('agencies').insert({
                    'id': 1,
                    'name': 'Agence Dakar Centre',
                    'city': 'Dakar',
                    'is_active': True
                }).execute()
                print("   ✅ Agence Dakar Centre créée")
            else:
                print("   ✅ Agence existe déjà")
            
            supabase.auth.sign_out()
            return True
        else:
            print("   ❌ Échec connexion admin")
            return False
            
    except Exception as e:
        print(f"   ❌ Erreur création agence: {str(e)}")
        return False

def test_all_accounts():
    """Test final de tous les comptes"""
    print("\n🧪 Test final de tous les comptes...")
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    demo_accounts = [
        ("admin_monel@transflownexus.demo", "admin123", "admin_general"),
        ("chef_dakar_diallo@transflownexus.demo", "chef123", "chef_agence"),
        ("dkr01_fatou@transflownexus.demo", "agent123", "agent"),
        ("sadmin_pierre@transflownexus.demo", "sadmin123", "sous_admin")
    ]
    
    successful_tests = 0
    
    for email, password, expected_role in demo_accounts:
        try:
            print(f"\n🔑 Test: {email}")
            
            # Connexion
            auth_response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if auth_response.user:
                user_id = auth_response.user.id
                print(f"   ✅ Connexion réussie")
                
                # Test via profiles avec jointure
                profile_response = supabase.table('profiles').select('*, roles(name, label)').eq('id', user_id).single().execute()
                
                if profile_response.data and profile_response.data.get('roles'):
                    role_name = profile_response.data['roles']['name']
                    print(f"   ✅ Rôle trouvé: {role_name}")
                    
                    if role_name == expected_role:
                        print(f"   ✅ Rôle correct!")
                        successful_tests += 1
                    else:
                        print(f"   ⚠️  Rôle attendu: {expected_role}, trouvé: {role_name}")
                else:
                    print(f"   ❌ Pas de rôle trouvé")
                
                supabase.auth.sign_out()
            else:
                print(f"   ❌ Échec de connexion")
                
        except Exception as e:
            print(f"   ❌ Erreur test {email}: {str(e)}")
    
    print(f"\n📊 Tests réussis: {successful_tests}/{len(demo_accounts)}")
    return successful_tests == len(demo_accounts)

def main():
    print("🚀 Création manuelle des profils utilisateur")
    print("="*60)
    
    # 1. Créer l'agence via admin
    create_agency_manually()
    
    # 2. Créer les profils pour chaque utilisateur
    accounts_to_fix = [
        ("chef_dakar_diallo@transflownexus.demo", "chef123", "Diallo Chef Dakar", 2, 1),
        ("dkr01_fatou@transflownexus.demo", "agent123", "Fatou Agent Dakar", 1, 1),
        ("sadmin_pierre@transflownexus.demo", "sadmin123", "Pierre Sous-Admin", 4, None)
    ]
    
    success_count = 0
    
    for email, password, name, role_id, agency_id in accounts_to_fix:
        if create_profile_for_user(email, password, name, role_id, agency_id):
            success_count += 1
    
    print(f"\n📊 Profils créés: {success_count}/{len(accounts_to_fix)}")
    
    # 3. Test final
    all_success = test_all_accounts()
    
    print("\n" + "="*60)
    if all_success:
        print("✅ TOUS LES COMPTES FONCTIONNENT!")
        print("   L'application devrait maintenant assigner les rôles corrects")
    else:
        print("⚠️  Quelques comptes ont encore des problèmes")

if __name__ == "__main__":
    main()