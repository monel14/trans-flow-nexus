#!/usr/bin/env python3
"""
Script pour créer directement les comptes de démonstration sans utiliser les fonctions RPC.
"""

import os
import uuid
from supabase import create_client, Client

SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

def create_user_directly(identifier, name, role_name, password, agency_id=None):
    """Créer un utilisateur directement dans les tables."""
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        
        # 1. Créer l'utilisateur dans auth.users via l'API auth
        auth_data = {
            "email": identifier,
            "password": password,
            "email_confirm": True,
            "user_metadata": {
                "name": name,
                "role": role_name,
                "identifier": identifier
            }
        }
        
        # Utiliser l'API admin pour créer l'utilisateur
        import requests
        
        headers = {
            'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY
        }
        
        # Créer l'utilisateur via l'API admin
        auth_url = f"{SUPABASE_URL}/auth/v1/admin/users"
        response = requests.post(auth_url, headers=headers, json=auth_data)
        
        if response.status_code in [200, 201]:
            user_data = response.json()
            user_id = user_data.get('id')
            print(f"   ✅ Utilisateur auth créé: {user_id}")
            
            # 2. Créer le profil
            profile_data = {
                'id': user_id,
                'email': identifier,
                'name': name,
                'agency_id': agency_id,
                'is_active': True,
                'balance': 0
            }
            
            profile_result = supabase.table('profiles').insert(profile_data).execute()
            
            if profile_result.data:
                print(f"   ✅ Profil créé")
                
                # 3. Récupérer l'ID du rôle
                role_result = supabase.table('roles').select('id').eq('name', role_name).execute()
                
                if role_result.data and len(role_result.data) > 0:
                    role_id = role_result.data[0]['id']
                    
                    # 4. Assigner le rôle
                    user_role_data = {
                        'id': str(uuid.uuid4()),
                        'user_id': user_id,
                        'role_id': role_id,
                        'agency_id': agency_id,
                        'is_active': True
                    }
                    
                    user_role_result = supabase.table('user_roles').insert(user_role_data).execute()
                    
                    if user_role_result.data:
                        print(f"   ✅ Rôle assigné: {role_name}")
                        return True
                    else:
                        print(f"   ❌ Erreur assignation rôle")
                else:
                    print(f"   ❌ Rôle {role_name} non trouvé")
            else:
                print(f"   ❌ Erreur création profil")
        else:
            print(f"   ❌ Erreur création auth user: {response.status_code} - {response.text}")
        
        return False
        
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        return False

def create_demo_accounts_direct():
    """Créer directement les comptes de démonstration."""
    print("👥 CRÉATION DIRECTE DES COMPTES DE DÉMONSTRATION")
    print("="*50)
    
    demo_accounts = [
        {
            'identifier': 'admin.monel',
            'name': 'Monel Admin Général',
            'role': 'admin_general',
            'password': 'admin123',
            'agency_id': None
        },
        {
            'identifier': 'sadmin.pierre',
            'name': 'Pierre Sous-Admin',
            'role': 'sous_admin',
            'password': 'sadmin123',
            'agency_id': None
        },
        {
            'identifier': 'chef.dakar.diallo',
            'name': 'Diallo Chef Dakar',
            'role': 'chef_agence',
            'password': 'chef123',
            'agency_id': 1
        },
        {
            'identifier': 'chef.thies.fall',
            'name': 'Fall Chef Thiès',
            'role': 'chef_agence',
            'password': 'chef123',
            'agency_id': 2
        },
        {
            'identifier': 'dkr01.fatou',
            'name': 'Fatou Agent Dakar',
            'role': 'agent',
            'password': 'agent123',
            'agency_id': 1
        },
        {
            'identifier': 'ths01.amadou',
            'name': 'Amadou Agent Thiès',
            'role': 'agent',
            'password': 'agent123',
            'agency_id': 2
        }
    ]
    
    successful_accounts = []
    
    for account in demo_accounts:
        print(f"📝 Création de {account['identifier']} ({account['role']})...")
        
        if create_user_directly(
            account['identifier'],
            account['name'],
            account['role'],
            account['password'],
            account['agency_id']
        ):
            successful_accounts.append(account)
            print(f"   🎉 {account['identifier']} créé avec succès!")
        else:
            print(f"   💥 Échec de création de {account['identifier']}")
    
    return successful_accounts

def main():
    """Fonction principale."""
    if not SUPABASE_SERVICE_KEY:
        print("❌ ERREUR: SUPABASE_SERVICE_KEY non définie")
        return
    
    successful_accounts = create_demo_accounts_direct()
    
    if successful_accounts:
        print(f"\n🎉 {len(successful_accounts)} comptes créés avec succès!")
        
        print("\n📋 COMPTES DE DÉMONSTRATION DISPONIBLES:")
        print("="*45)
        for account in successful_accounts:
            print(f"🔑 {account['identifier']}")
            print(f"   👤 Nom: {account['name']}")
            print(f"   🎭 Rôle: {account['role']}")
            print(f"   🗝️  Mot de passe: {account['password']}")
            if account['agency_id']:
                print(f"   🏢 Agence ID: {account['agency_id']}")
            print()
        
        print("🔗 URL de connexion: http://localhost:8080/")
        print("\n💡 Maintenant vous pouvez adapter la page de login pour ces identifiants!")
        
    else:
        print("❌ Aucun compte n'a pu être créé")

if __name__ == "__main__":
    main()