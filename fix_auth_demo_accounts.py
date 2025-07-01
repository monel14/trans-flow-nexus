#!/usr/bin/env python3
"""
Script pour corriger les comptes de démonstration
- Confirme les emails automatiquement
- Vérifie la structure des profils
- Teste l'authentification
"""
import requests
import json
import sys

def confirm_user_email(url, service_key, user_id):
    """Confirmer l'email d'un utilisateur via l'API admin"""
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {service_key}',
        'apikey': service_key
    }
    
    data = {
        "email_confirm": True
    }
    
    try:
        response = requests.put(
            f"{url}/auth/v1/admin/users/{user_id}",
            headers=headers,
            json=data
        )
        
        if response.status_code == 200:
            print(f"✅ Email confirmé pour l'utilisateur {user_id}")
            return True
        else:
            print(f"❌ Erreur lors de la confirmation de l'email: {response.status_code}")
            print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Erreur lors de la confirmation de l'email: {str(e)}")
        return False

def get_user_by_email(url, service_key, email):
    """Récupérer un utilisateur par son email"""
    headers = {
        'Content-Type': 'application/json',
        'Authorization': f'Bearer {service_key}',
        'apikey': service_key
    }
    
    try:
        response = requests.get(
            f"{url}/auth/v1/admin/users",
            headers=headers,
            params={'per_page': 100}
        )
        
        if response.status_code == 200:
            users = response.json().get('users', [])
            for user in users:
                if user.get('email') == email:
                    return user
        return None
    except Exception as e:
        print(f"❌ Erreur lors de la récupération de l'utilisateur: {str(e)}")
        return None

def create_or_fix_demo_accounts():
    """Créer ou corriger les comptes de démonstration"""
    supabase_url = "https://khgbnikgsptoflokvtzu.supabase.co"
    # Note: Il faudrait utiliser la clé service (service_role) pour confirmer les emails
    # La clé anon ne permet pas les opérations admin
    anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"
    
    demo_accounts = [
        {"email": "admin@transflow.com", "password": "admin123", "role": "admin_general"},
        {"email": "sousadmin@transflow.com", "password": "sousadmin123", "role": "sous_admin"},
        {"email": "chef@transflow.com", "password": "chef123", "role": "chef_agence"},
        {"email": "agent@transflow.com", "password": "agent123", "role": "agent"},
        {"email": "dev@transflow.com", "password": "dev123", "role": "developer"}
    ]
    
    print("🔧 Analyse des comptes de démonstration...")
    print("=" * 50)
    
    for account in demo_accounts:
        print(f"\n🔍 Vérification du compte: {account['email']}")
        
        # Tenter l'authentification pour voir le statut
        headers = {
            'Content-Type': 'application/json',
            'apikey': anon_key
        }
        
        auth_data = {
            "email": account['email'],
            "password": account['password']
        }
        
        try:
            response = requests.post(
                f"{supabase_url}/auth/v1/token?grant_type=password",
                headers=headers,
                json=auth_data
            )
            
            if response.status_code == 200:
                print(f"✅ Compte {account['email']} peut s'authentifier")
            elif response.status_code == 400:
                error_data = response.json()
                if 'email_not_confirmed' in error_data.get('error_code', ''):
                    print(f"⚠️ Compte {account['email']} - Email non confirmé")
                    print("   → Solution : Confirmer l'email via l'interface Supabase ou utiliser la clé service")
                elif 'invalid_credentials' in error_data.get('error_code', ''):
                    print(f"❌ Compte {account['email']} - Identifiants invalides (compte inexistant?)")
                else:
                    print(f"❌ Compte {account['email']} - Erreur: {error_data}")
            else:
                print(f"❌ Compte {account['email']} - Erreur HTTP {response.status_code}")
                
        except Exception as e:
            print(f"❌ Erreur lors du test de {account['email']}: {str(e)}")
    
    print("\n" + "=" * 50)
    print("📋 RÉSUMÉ DES PROBLÈMES IDENTIFIÉS:")
    print("=" * 50)
    print("1. 📧 Les emails des comptes de démonstration ne sont pas confirmés")
    print("2. 🔑 Il faut utiliser la clé service_role pour confirmer automatiquement les emails")
    print("3. 🛠️ Alternative: Désactiver la vérification d'email pour les comptes de test")
    print("\n💡 SOLUTIONS RECOMMANDÉES:")
    print("- Option 1: Configurer Supabase pour désactiver la confirmation d'email en développement")
    print("- Option 2: Utiliser l'interface Supabase pour confirmer manuellement les emails")
    print("- Option 3: Modifier le processus de création pour confirmer automatiquement")

if __name__ == "__main__":
    create_or_fix_demo_accounts()