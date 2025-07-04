#!/usr/bin/env python3
"""
Script pour créer automatiquement les utilisateurs de test dans Supabase Auth
Ce script utilise l'API Admin de Supabase pour créer les utilisateurs avec des IDs spécifiques
"""

import requests
import json
import sys

# Configuration Supabase
SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_SERVICE_ROLE_KEY = "VOTRE_SERVICE_ROLE_KEY_ICI"  # À remplacer par votre clé service role

# Liste des utilisateurs à créer
USERS_TO_CREATE = [
    {
        "id": "11111111-1111-1111-1111-111111111111",
        "email": "admin@transflownexus.com",
        "password": "TransFlow2024!",
        "user_metadata": {
            "name": "Moussa DIOP",
            "role": "admin_general"
        },
        "email_confirm": True
    },
    {
        "id": "22222222-2222-2222-2222-222222222222",
        "email": "sousadmin@transflownexus.com",
        "password": "TransFlow2024!",
        "user_metadata": {
            "name": "Aminata FALL",
            "role": "sous_admin"
        },
        "email_confirm": True
    },
    {
        "id": "55555555-5555-5555-5555-555555555555",
        "email": "dev@transflownexus.com",
        "password": "TransFlow2024!",
        "user_metadata": {
            "name": "Ibrahima SARR",
            "role": "developer"
        },
        "email_confirm": True
    },
    {
        "id": "33333333-3333-3333-3333-333333333333",
        "email": "chef.dakar@transflownexus.com",
        "password": "TransFlow2024!",
        "user_metadata": {
            "name": "Ousmane KANE",
            "role": "chef_agence",
            "agency": "Dakar Centre"
        },
        "email_confirm": True
    },
    {
        "id": "33333333-3333-3333-3333-333333333334",
        "email": "chef.pikine@transflownexus.com",
        "password": "TransFlow2024!",
        "user_metadata": {
            "name": "Adama THIAW",
            "role": "chef_agence",
            "agency": "Pikine"
        },
        "email_confirm": True
    },
    {
        "id": "33333333-3333-3333-3333-333333333335",
        "email": "chef.thies@transflownexus.com",
        "password": "TransFlow2024!",
        "user_metadata": {
            "name": "Babacar NDOUR",
            "role": "chef_agence",
            "agency": "Thiès"
        },
        "email_confirm": True
    },
    {
        "id": "44444444-4444-4444-4444-444444444444",
        "email": "agent1.dakar@transflownexus.com",
        "password": "TransFlow2024!",
        "user_metadata": {
            "name": "Fatou NDIAYE",
            "role": "agent",
            "agency": "Dakar Centre"
        },
        "email_confirm": True
    },
    {
        "id": "44444444-4444-4444-4444-444444444445",
        "email": "agent2.dakar@transflownexus.com",
        "password": "TransFlow2024!",
        "user_metadata": {
            "name": "Mamadou DIOUF",
            "role": "agent",
            "agency": "Dakar Centre"
        },
        "email_confirm": True
    },
    {
        "id": "44444444-4444-4444-4444-444444444446",
        "email": "agent3.dakar@transflownexus.com",
        "password": "TransFlow2024!",
        "user_metadata": {
            "name": "Awa SECK",
            "role": "agent",
            "agency": "Dakar Centre"
        },
        "email_confirm": True
    },
    {
        "id": "44444444-4444-4444-4444-444444444447",
        "email": "agent1.pikine@transflownexus.com",
        "password": "TransFlow2024!",
        "user_metadata": {
            "name": "Seynabou GUEYE",
            "role": "agent",
            "agency": "Pikine"
        },
        "email_confirm": True
    },
    {
        "id": "44444444-4444-4444-4444-444444444448",
        "email": "agent2.pikine@transflownexus.com",
        "password": "TransFlow2024!",
        "user_metadata": {
            "name": "Modou SALL",
            "role": "agent",
            "agency": "Pikine"
        },
        "email_confirm": True
    },
    {
        "id": "44444444-4444-4444-4444-444444444449",
        "email": "agent1.thies@transflownexus.com",
        "password": "TransFlow2024!",
        "user_metadata": {
            "name": "Mariama WADE",
            "role": "agent",
            "agency": "Thiès"
        },
        "email_confirm": True
    }
]

def create_user(user_data):
    """Créer un utilisateur via l'API Admin Supabase"""
    url = f"{SUPABASE_URL}/auth/v1/admin/users"
    
    headers = {
        "apikey": SUPABASE_SERVICE_ROLE_KEY,
        "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        "Content-Type": "application/json"
    }
    
    try:
        response = requests.post(url, headers=headers, json=user_data)
        
        if response.status_code == 200 or response.status_code == 201:
            user = response.json()
            print(f"✅ Utilisateur créé avec succès: {user_data['email']} (ID: {user_data['id']})")
            return True
        else:
            print(f"❌ Erreur lors de la création de {user_data['email']}: {response.status_code}")
            print(f"   Réponse: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Exception lors de la création de {user_data['email']}: {str(e)}")
        return False

def main():
    """Fonction principale"""
    print("🚀 Création des utilisateurs de test TransFlow Nexus")
    print("=" * 60)
    
    # Vérifier que la clé service role est configurée
    if SUPABASE_SERVICE_ROLE_KEY == "VOTRE_SERVICE_ROLE_KEY_ICI":
        print("❌ ERREUR: Vous devez configurer SUPABASE_SERVICE_ROLE_KEY")
        print("   1. Allez dans votre projet Supabase")
        print("   2. Settings > API")
        print("   3. Copiez la 'service_role' key")
        print("   4. Remplacez VOTRE_SERVICE_ROLE_KEY_ICI dans ce script")
        sys.exit(1)
    
    success_count = 0
    total_count = len(USERS_TO_CREATE)
    
    for user_data in USERS_TO_CREATE:
        if create_user(user_data):
            success_count += 1
    
    print("=" * 60)
    print(f"📊 Résumé: {success_count}/{total_count} utilisateurs créés avec succès")
    
    if success_count == total_count:
        print("🎉 Tous les utilisateurs ont été créés avec succès !")
        print("\n📋 Comptes disponibles pour tests:")
        print("   Admin: admin@transflownexus.com")
        print("   Sous-Admin: sousadmin@transflownexus.com")
        print("   Développeur: dev@transflownexus.com")
        print("   Chefs d'agence: chef.dakar@, chef.pikine@, chef.thies@transflownexus.com")
        print("   Agents: agent1.dakar@, agent2.dakar@, agent3.dakar@, agent1.pikine@, agent2.pikine@, agent1.thies@transflownexus.com")
        print("   Mot de passe: TransFlow2024!")
    else:
        print("⚠️ Certains utilisateurs n'ont pas pu être créés.")
        print("   Vérifiez les erreurs ci-dessus et réessayez.")

if __name__ == "__main__":
    main()