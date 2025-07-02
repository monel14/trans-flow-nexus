#!/usr/bin/env python3
"""
Script pour créer des comptes de démonstration avec des emails valides 
qui correspondent aux identifiants du nouveau système.
"""

import os
from supabase import create_client, Client

SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

def create_demo_user(identifier, name, role_name, password, agency_id=None):
    """Créer un utilisateur avec email valide mais identifiant dans les métadonnées."""
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        
        # Convertir l'identifiant en email valide
        email = f"{identifier.replace('.', '_')}@transflownexus.demo"
        
        # Créer l'utilisateur avec l'API admin
        import requests
        
        headers = {
            'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY
        }
        
        auth_data = {
            "email": email,
            "password": password,
            "email_confirm": True,
            "user_metadata": {
                "name": name,
                "role": role_name,
                "identifier": identifier  # L'identifiant réel pour la connexion
            }
        }
        
        auth_url = f"{SUPABASE_URL}/auth/v1/admin/users"
        response = requests.post(auth_url, headers=headers, json=auth_data)
        
        if response.status_code in [200, 201]:
            user_data = response.json()
            user_id = user_data.get('id')
            print(f"   ✅ Auth user créé: {user_id}")
            
            # Créer le profil (avec l'identifiant dans le champ email)
            profile_data = {
                'id': user_id,
                'email': identifier,  # Stocker l'identifiant ici pour la compatibilité
                'name': name,
                'agency_id': agency_id,
                'is_active': True,
                'balance': 0
            }
            
            profile_result = supabase.table('profiles').insert(profile_data).execute()
            
            if profile_result.data:
                print(f"   ✅ Profil créé avec identifiant: {identifier}")
                
                # Récupérer et assigner le rôle
                role_result = supabase.table('roles').select('id').eq('name', role_name).execute()
                
                if role_result.data:
                    role_id = role_result.data[0]['id']
                    
                    import uuid
                    user_role_data = {
                        'id': str(uuid.uuid4()),
                        'user_id': user_id,
                        'role_id': role_id,
                        'agency_id': agency_id,
                        'is_active': True
                    }
                    
                    user_role_result = supabase.table('user_roles').insert(user_role_data).execute()
                    
                    if user_role_result.data:
                        print(f"   ✅ Rôle {role_name} assigné")
                        return True
                    else:
                        print(f"   ❌ Erreur assignation rôle")
                else:
                    print(f"   ❌ Rôle {role_name} non trouvé")
            else:
                print(f"   ❌ Erreur création profil")
        else:
            print(f"   ❌ Erreur auth: {response.status_code} - {response.text}")
        
        return False
        
    except Exception as e:
        print(f"   ❌ Erreur: {e}")
        return False

def main():
    """Créer tous les comptes de démonstration."""
    if not SUPABASE_SERVICE_KEY:
        print("❌ ERREUR: SUPABASE_SERVICE_KEY non définie")
        return
    
    print("🎯 CRÉATION DES COMPTES DE DÉMONSTRATION")
    print("="*45)
    print("💡 Stratégie: Email valide + identifiant dans metadata/profile")
    print()
    
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
        
        if create_demo_user(
            account['identifier'],
            account['name'],
            account['role'],
            account['password'],
            account['agency_id']
        ):
            successful_accounts.append(account)
            print(f"   🎉 {account['identifier']} créé avec succès!")
        else:
            print(f"   💥 Échec de {account['identifier']}")
        print()
    
    if successful_accounts:
        print(f"\n🎉 {len(successful_accounts)}/{len(demo_accounts)} comptes créés avec succès!")
        
        print("\n📋 COMPTES DE DÉMONSTRATION DISPONIBLES:")
        print("="*50)
        
        for account in successful_accounts:
            emoji_role = {
                'admin_general': '👑',
                'sous_admin': '🛡️',
                'chef_agence': '🏢',
                'agent': '👤'
            }.get(account['role'], '👤')
            
            print(f"{emoji_role} {account['identifier']}")
            print(f"   👤 Nom: {account['name']}")
            print(f"   🎭 Rôle: {account['role']}")
            print(f"   🗝️  Mot de passe: {account['password']}")
            if account['agency_id']:
                print(f"   🏢 Agence ID: {account['agency_id']}")
            print()
        
        print("🔗 URL de connexion: http://localhost:8080/")
        print("💡 Utilisez les identifiants ci-dessus (pas les emails)")
        
        # Adapter le contexte d'authentification si nécessaire
        print("\n⚠️  IMPORTANT:")
        print("Le système d'authentification doit être adapté pour utiliser")
        print("l'identifiant stocké dans user_metadata au lieu de l'email.")
        
    else:
        print("❌ Aucun compte n'a pu être créé")

if __name__ == "__main__":
    main()