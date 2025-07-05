#!/usr/bin/env python3
"""
Correction d'urgence pour les problèmes RLS et d'authentification
"""
import requests
import json
import time

def fix_rls_and_auth():
    supabase_url = "https://khgbnikgsptoflokvtzu.supabase.co"
    anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"
    
    headers = {
        'Content-Type': 'application/json',
        'apikey': anon_key,
        'Prefer': 'return=minimal'
    }
    
    print("🚨 CORRECTION D'URGENCE - PROBLÈMES RLS ET AUTHENTIFICATION")
    print("=" * 60)
    
    # 1. Vérifier si les rôles sont accessibles
    print("\n🔍 1. Test d'accès à la table roles...")
    try:
        response = requests.get(f"{supabase_url}/rest/v1/roles?select=id,name&limit=1", headers=headers)
        if response.status_code == 200:
            print("✅ Table roles accessible")
            roles = response.json()
            print(f"   Rôles trouvés: {len(roles)}")
        else:
            print(f"❌ Erreur d'accès à la table roles: {response.status_code}")
            print(f"   Message: {response.text}")
            
            # Tenter d'insérer les rôles de base directement
            print("\n🔧 2. Tentative d'insertion des rôles de base...")
            base_roles = [
                {"id": 1, "name": "agent", "label": "Agent Commercial"},
                {"id": 2, "name": "chef_agence", "label": "Chef d'Agence"},
                {"id": 3, "name": "admin_general", "label": "Administrateur Général"},
                {"id": 4, "name": "sous_admin", "label": "Sous-Administrateur"},
                {"id": 5, "name": "developer", "label": "Développeur"}
            ]
            
            for role in base_roles:
                try:
                    role_response = requests.post(
                        f"{supabase_url}/rest/v1/roles",
                        headers=headers,
                        json=role
                    )
                    if role_response.status_code in [200, 201, 409]:  # 409 = conflit (déjà existe)
                        print(f"   ✅ Rôle {role['name']}: OK")
                    else:
                        print(f"   ❌ Rôle {role['name']}: Erreur {role_response.status_code}")
                except:
                    print(f"   ⚠️ Rôle {role['name']}: Exception")
            
    except Exception as e:
        print(f"❌ Exception lors du test: {str(e)}")
    
    # 3. Tenter de créer les comptes avec une approche simplifiée
    print("\n🔧 3. Création simplifiée des comptes de démonstration...")
    
    demo_accounts = [
        {"email": "admin@transflow.com", "password": "admin123", "name": "Admin Général"},
        {"email": "chef@transflow.com", "password": "chef123", "name": "Chef Agence"},
        {"email": "agent@transflow.com", "password": "agent123", "name": "Agent Commercial"},
        {"email": "dev@transflow.com", "password": "dev123", "name": "Développeur"}
    ]
    
    for account in demo_accounts:
        print(f"\n   📝 Traitement: {account['email']}")
        
        # Créer le compte
        signup_data = {
            "email": account['email'],
            "password": account['password'],
            "options": {
                "data": {
                    "name": account['name']
                }
            }
        }
        
        try:
            response = requests.post(
                f"{supabase_url}/auth/v1/signup",
                headers=headers,
                json=signup_data
            )
            
            if response.status_code == 200:
                print(f"      ✅ Compte créé avec succès")
            elif response.status_code == 422:
                error_data = response.json()
                if 'already registered' in error_data.get('msg', '').lower():
                    print(f"      ℹ️ Compte existe déjà")
                else:
                    print(f"      ❌ Erreur 422: {error_data}")
            else:
                print(f"      ❌ Erreur {response.status_code}: {response.text}")
                
        except Exception as e:
            print(f"      ❌ Exception: {str(e)}")
    
    # 4. Test final
    print("\n🧪 4. Test final d'authentification...")
    test_account = {"email": "admin@transflow.com", "password": "admin123"}
    
    auth_data = {
        "email": test_account['email'],
        "password": test_account['password']
    }
    
    try:
        response = requests.post(
            f"{supabase_url}/auth/v1/token?grant_type=password",
            headers=headers,
            json=auth_data
        )
        
        if response.status_code == 200:
            print("✅ SUCCÈS: Authentification fonctionne!")
            token_data = response.json()
            print(f"   User ID: {token_data.get('user', {}).get('id', 'N/A')}")
        else:
            error_data = response.json()
            error_code = error_data.get('error_code', 'unknown')
            print(f"❌ Échec authentification: {error_code}")
            if error_code == 'email_not_confirmed':
                print("   💡 Solution: Confirmer l'email via Supabase Dashboard")
            
    except Exception as e:
        print(f"❌ Exception lors du test: {str(e)}")
    
    print("\n" + "=" * 60)
    print("📋 RÉSUMÉ DE LA CORRECTION:")
    print("- Le problème principal est la récursion RLS sur la table 'roles'")
    print("- Solution immédiate nécessaire: Désactiver RLS sur 'roles' via Supabase Dashboard")
    print("- Ou appliquer le script SQL fix_rls_recursion.sql")
    print("- Une fois corrigé, les comptes pourront être créés et confirmés")

if __name__ == "__main__":
    fix_rls_and_auth()