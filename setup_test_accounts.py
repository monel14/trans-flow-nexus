#!/usr/bin/env python3
"""
Script pour créer des comptes de test avec les bons rôles dans Supabase
"""

import requests
import json
import uuid
from datetime import datetime, timezone

# Configuration Supabase
SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_SERVICE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTk1NjkyMSwiZXhwIjoyMDY1NTMyOTIxfQ.YqJBr7AYVg5uyUXv4Bx6T2sBLGYJLQZgY6GxuU4c-gE"  # Service role key needed for auth admin
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"

def create_user_with_role(email, password, name, role_name):
    """Créer un utilisateur avec un rôle spécifique"""
    
    print(f"\n🔧 Création de l'utilisateur {name} ({email}) avec le rôle {role_name}...")
    
    # 1. Créer l'utilisateur via l'API Auth Admin
    auth_data = {
        "email": email,
        "password": password,
        "email_confirm": True,  # Confirmer automatiquement l'email
        "user_metadata": {
            "name": name
        }
    }
    
    response = requests.post(
        f"{SUPABASE_URL}/auth/v1/admin/users",
        headers={
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "apikey": SUPABASE_SERVICE_KEY,
            "Content-Type": "application/json"
        },
        json=auth_data
    )
    
    if response.status_code != 201:
        print(f"❌ Erreur lors de la création de l'utilisateur: {response.text}")
        return False
    
    user_data = response.json()
    user_id = user_data["id"]
    print(f"✅ Utilisateur créé avec l'ID: {user_id}")
    
    # 2. Obtenir l'ID du rôle
    role_response = requests.get(
        f"{SUPABASE_URL}/rest/v1/roles?name=eq.{role_name}",
        headers={
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "apikey": SUPABASE_ANON_KEY
        }
    )
    
    if role_response.status_code != 200:
        print(f"❌ Erreur lors de la récupération du rôle: {role_response.text}")
        return False
    
    roles = role_response.json()
    if not roles:
        print(f"❌ Rôle {role_name} non trouvé")
        return False
    
    role_id = roles[0]["id"]
    print(f"✅ Rôle trouvé avec l'ID: {role_id}")
    
    # 3. Obtenir l'ID de l'agence (pour les rôles non-admin)
    agency_id = None
    if role_name in ['agent', 'chef_agence']:
        agency_response = requests.get(
            f"{SUPABASE_URL}/rest/v1/agencies?limit=1",
            headers={
                "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
                "apikey": SUPABASE_ANON_KEY
            }
        )
        
        if agency_response.status_code == 200:
            agencies = agency_response.json()
            if agencies:
                agency_id = agencies[0]["id"]
                print(f"✅ Agence trouvée avec l'ID: {agency_id}")
    
    # 4. Créer le profil utilisateur
    profile_data = {
        "id": user_id,
        "email": email,
        "name": name,
        "role_id": role_id,
        "agency_id": agency_id,
        "is_active": True,
        "balance": 50000 if role_name == 'agent' else 0,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    profile_response = requests.post(
        f"{SUPABASE_URL}/rest/v1/profiles",
        headers={
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "apikey": SUPABASE_ANON_KEY,
            "Content-Type": "application/json"
        },
        json=profile_data
    )
    
    if profile_response.status_code not in [201, 200]:
        print(f"❌ Erreur lors de la création du profil: {profile_response.text}")
        return False
    
    print(f"✅ Profil créé pour {name}")
    
    # 5. Créer l'entrée user_roles
    user_role_data = {
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "role_id": role_id,
        "agency_id": agency_id,
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat()
    }
    
    user_role_response = requests.post(
        f"{SUPABASE_URL}/rest/v1/user_roles",
        headers={
            "Authorization": f"Bearer {SUPABASE_SERVICE_KEY}",
            "apikey": SUPABASE_ANON_KEY,
            "Content-Type": "application/json"
        },
        json=user_role_data
    )
    
    if user_role_response.status_code not in [201, 200]:
        print(f"❌ Erreur lors de la création de l'association user_roles: {user_role_response.text}")
        return False
    
    print(f"✅ Association user_roles créée pour {name}")
    
    print(f"🎉 Utilisateur {name} ({email}) créé avec succès avec le rôle {role_name}!")
    return True

def main():
    """Créer tous les comptes de test"""
    
    print("🚀 Création des comptes de test TransFlow Nexus...")
    
    # Liste des comptes à créer
    test_accounts = [
        {
            "email": "admin@transflow.com",
            "password": "admin123",
            "name": "Administrateur Général",
            "role": "admin_general"
        },
        {
            "email": "sousadmin@transflow.com",
            "password": "sousadmin123",
            "name": "Sous-Administrateur",
            "role": "sous_admin"
        },
        {
            "email": "chef@transflow.com",
            "password": "chef123",
            "name": "Chef d'Agence",
            "role": "chef_agence"
        },
        {
            "email": "agent@transflow.com",
            "password": "agent123",
            "name": "Agent Test",
            "role": "agent"
        },
        {
            "email": "dev@transflow.com",
            "password": "dev123",
            "name": "Développeur",
            "role": "developer"
        }
    ]
    
    success_count = 0
    for account in test_accounts:
        if create_user_with_role(
            account["email"],
            account["password"],
            account["name"],
            account["role"]
        ):
            success_count += 1
    
    print(f"\n📊 Résumé: {success_count}/{len(test_accounts)} comptes créés avec succès")
    
    if success_count > 0:
        print("\n🎯 Comptes prêts pour les tests:")
        for account in test_accounts:
            print(f"  - {account['name']}: {account['email']} / {account['password']}")
        
        print("\n💡 Vous pouvez maintenant vous connecter et tester le ProofViewer!")

if __name__ == "__main__":
    main()