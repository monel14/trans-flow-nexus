#!/usr/bin/env python3
"""
Script pour créer et corriger les comptes démo avec leurs rôles appropriés
"""

import os
from supabase import create_client, Client

# Configuration Supabase
SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"

def fix_existing_admin_role():
    """Corrige le rôle de l'admin existant"""
    print("🔧 Correction du rôle de l'admin existant...")
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    try:
        # Se connecter avec l'admin
        auth_response = supabase.auth.sign_in_with_password({
            "email": "admin_monel@transflownexus.demo",
            "password": "admin123"
        })
        
        user_id = auth_response.user.id
        print(f"✅ Connexion admin réussie. User ID: {user_id}")
        
        # Mettre à jour le role_id dans profiles (admin_general = 3)
        update_response = supabase.table('profiles').update({
            'role_id': 3  # admin_general
        }).eq('id', user_id).execute()
        
        print("✅ Role ID mis à jour dans profiles")
        
        # Créer l'entrée dans user_roles
        user_role_response = supabase.table('user_roles').insert({
            'user_id': user_id,
            'role_id': 3,  # admin_general
            'is_active': True,
            'agency_id': None
        }).execute()
        
        print("✅ Entrée créée dans user_roles")
        
        supabase.auth.sign_out()
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la correction admin : {str(e)}")
        return False

def create_demo_accounts():
    """Crée les comptes démo manquants"""
    print("\n🔧 Création des comptes démo manquants...")
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Comptes à créer
    demo_accounts = [
        {
            'email': 'chef_dakar_diallo@transflownexus.demo',
            'password': 'chef123',
            'name': 'Diallo Chef Dakar',
            'role_id': 2,  # chef_agence
            'agency_id': 1  # On supposera que l'agence 1 existe
        },
        {
            'email': 'dkr01_fatou@transflownexus.demo', 
            'password': 'agent123',
            'name': 'Fatou Agent Dakar',
            'role_id': 1,  # agent
            'agency_id': 1
        },
        {
            'email': 'sadmin_pierre@transflownexus.demo',
            'password': 'sadmin123', 
            'name': 'Pierre Sous-Admin',
            'role_id': 4,  # sous_admin
            'agency_id': None
        }
    ]
    
    created_count = 0
    
    for account in demo_accounts:
        try:
            print(f"\n📝 Création de {account['email']}...")
            
            # 1. Créer le compte auth
            signup_response = supabase.auth.sign_up({
                'email': account['email'],
                'password': account['password'],
                'options': {
                    'data': {
                        'name': account['name']
                    }
                }
            })
            
            if signup_response.user:
                user_id = signup_response.user.id
                print(f"   ✅ Compte auth créé. User ID: {user_id}")
                
                # 2. Créer le profil 
                profile_response = supabase.table('profiles').insert({
                    'id': user_id,
                    'email': account['email'],
                    'name': account['name'],
                    'role_id': account['role_id'],
                    'agency_id': account['agency_id'],
                    'is_active': True
                }).execute()
                
                print(f"   ✅ Profil créé")
                
                # 3. Créer l'entrée user_roles
                user_role_response = supabase.table('user_roles').insert({
                    'user_id': user_id,
                    'role_id': account['role_id'],
                    'agency_id': account['agency_id'],
                    'is_active': True
                }).execute()
                
                print(f"   ✅ Role assigné")
                created_count += 1
                
            else:
                print(f"   ❌ Échec création auth")
                
        except Exception as e:
            print(f"   ❌ Erreur lors de la création de {account['email']}: {str(e)}")
    
    print(f"\n📊 Comptes créés: {created_count}/{len(demo_accounts)}")
    return created_count

def create_agencies_if_needed():
    """Crée les agences de base si elles n'existent pas"""
    print("\n🏢 Vérification/création des agences...")
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    try:
        # Vérifier si des agences existent
        agencies_response = supabase.table('agencies').select('*').execute()
        
        if len(agencies_response.data) == 0:
            # Créer quelques agences de base
            agencies_to_create = [
                {
                    'id': 1,
                    'name': 'Agence Dakar Centre',
                    'city': 'Dakar',
                    'is_active': True
                },
                {
                    'id': 2, 
                    'name': 'Agence Thiès',
                    'city': 'Thiès',
                    'is_active': True
                }
            ]
            
            for agency in agencies_to_create:
                try:
                    agency_response = supabase.table('agencies').insert(agency).execute()
                    print(f"   ✅ Agence créée: {agency['name']}")
                except Exception as e:
                    print(f"   ❌ Erreur création agence {agency['name']}: {str(e)}")
        
        else:
            print(f"   ✅ {len(agencies_response.data)} agences trouvées")
            
    except Exception as e:
        print(f"❌ Erreur lors de la gestion des agences : {str(e)}")

def test_final_authentication():
    """Test final pour vérifier que tout fonctionne"""
    print("\n🧪 Test final d'authentification et récupération des rôles...")
    
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
                
                # Test méthode 1: via profiles.role_id
                profile_response = supabase.table('profiles').select('*, roles(name, label)').eq('id', user_id).single().execute()
                
                if profile_response.data and profile_response.data.get('roles'):
                    role_name = profile_response.data['roles']['name']
                    print(f"   ✅ Rôle via profiles: {role_name}")
                    
                    if role_name == expected_role:
                        print(f"   ✅ Rôle correct!")
                        successful_tests += 1
                    else:
                        print(f"   ⚠️  Rôle attendu: {expected_role}, trouvé: {role_name}")
                else:
                    print(f"   ❌ Pas de rôle trouvé via profiles")
                
                # Test méthode 2: via user_roles
                try:
                    user_roles_response = supabase.table('user_roles').select('*, roles(name, label)').eq('user_id', user_id).eq('is_active', True).single().execute()
                    
                    if user_roles_response.data and user_roles_response.data.get('roles'):
                        role_name_ur = user_roles_response.data['roles']['name']
                        print(f"   ✅ Rôle via user_roles: {role_name_ur}")
                    else:
                        print(f"   ❌ Pas de rôle trouvé via user_roles")
                        
                except Exception as ur_error:
                    print(f"   ❌ Erreur user_roles: {str(ur_error)}")
                
                supabase.auth.sign_out()
            else:
                print(f"   ❌ Échec de connexion")
                
        except Exception as e:
            print(f"   ❌ Erreur test {email}: {str(e)}")
    
    print(f"\n📊 Tests réussis: {successful_tests}/{len(demo_accounts)}")
    return successful_tests == len(demo_accounts)

def main():
    print("🚀 Correction des comptes démo et assignation des rôles")
    print("="*60)
    
    # 1. Créer les agences si nécessaire
    create_agencies_if_needed()
    
    # 2. Corriger l'admin existant
    fix_existing_admin_role()
    
    # 3. Créer les comptes démo manquants
    create_demo_accounts()
    
    # 4. Test final
    success = test_final_authentication()
    
    print("\n" + "="*60)
    if success:
        print("✅ CORRECTION RÉUSSIE! Tous les comptes démo fonctionnent")
        print("   Les utilisateurs devront maintenant être assignés à leurs rôles corrects")
    else:
        print("⚠️  CORRECTION PARTIELLE. Vérifiez les erreurs ci-dessus")
    
    print("\n💡 Prochaine étape: Tester l'application web pour vérifier les rôles")

if __name__ == "__main__":
    main()