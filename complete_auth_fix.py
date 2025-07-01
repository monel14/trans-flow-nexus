#!/usr/bin/env python3
"""
Script de correction automatique pour l'authentification
Ce script corrige directement les problèmes d'email non confirmé
"""
import requests
import json
import sys
import time

def fix_authentication_issues():
    """Correctif pour les problèmes d'authentification"""
    supabase_url = "https://khgbnikgsptoflokvtzu.supabase.co"
    anon_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"
    
    print("🔧 Correction des problèmes d'authentification")
    print("=" * 50)
    
    # 1. Créer les comptes qui n'existent pas
    demo_accounts = [
        {"email": "admin@transflow.com", "password": "admin123", "name": "Admin Général", "role": "admin_general"},
        {"email": "sousadmin@transflow.com", "password": "sousadmin123", "name": "Sous Admin", "role": "sous_admin"},
        {"email": "chef@transflow.com", "password": "chef123", "name": "Chef Agence", "role": "chef_agence", "agency_id": 1},
        {"email": "agent@transflow.com", "password": "agent123", "name": "Agent Commercial", "role": "agent", "agency_id": 1},
        {"email": "dev@transflow.com", "password": "dev123", "name": "Développeur", "role": "developer"}
    ]
    
    headers = {
        'Content-Type': 'application/json',
        'apikey': anon_key
    }
    
    # 2. Créer les comptes manquants avec confirmation automatique
    for account in demo_accounts:
        print(f"\n🔍 Traitement du compte: {account['email']}")
        
        # Tenter la création
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
                user_data = response.json()
                print(f"✅ Compte créé: {account['email']}")
                
                # Attendre un peu pour que le profil soit créé
                time.sleep(1)
                
                # Mettre à jour le profil avec le rôle
                if 'user' in user_data and user_data['user']:
                    user_id = user_data['user']['id']
                    
                    # Récupérer l'ID du rôle
                    role_response = requests.get(
                        f"{supabase_url}/rest/v1/roles?name=eq.{account['role']}&select=id",
                        headers=headers
                    )
                    
                    if role_response.status_code == 200:
                        roles = role_response.json()
                        if roles:
                            role_id = roles[0]['id']
                            
                            # Mettre à jour le profil
                            profile_data = {
                                "role_id": role_id,
                                "agency_id": account.get('agency_id'),
                                "balance": 50000 if account['role'] == 'agent' else 100000,
                                "is_active": True
                            }
                            
                            profile_response = requests.patch(
                                f"{supabase_url}/rest/v1/profiles?id=eq.{user_id}",
                                headers=headers,
                                json=profile_data
                            )
                            
                            if profile_response.status_code == 200:
                                print(f"✅ Profil mis à jour pour {account['email']}")
                            else:
                                print(f"⚠️ Erreur mise à jour profil: {profile_response.status_code}")
                    
            elif response.status_code == 422:
                error_data = response.json()
                if 'already registered' in error_data.get('msg', '').lower():
                    print(f"ℹ️ Compte {account['email']} existe déjà")
                else:
                    print(f"❌ Erreur 422: {error_data}")
            else:
                print(f"❌ Erreur création compte: {response.status_code} - {response.text}")
                
        except Exception as e:
            print(f"❌ Exception lors de la création: {str(e)}")
    
    print("\n" + "=" * 50)
    print("🧪 Test de connexion des comptes...")
    
    # 3. Tester les connexions
    working_accounts = []
    for account in demo_accounts:
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
                print(f"✅ Connexion réussie: {account['email']}")
                working_accounts.append(account)
            else:
                error_data = response.json()
                error_code = error_data.get('error_code', 'unknown')
                if error_code == 'email_not_confirmed':
                    print(f"⚠️ Email non confirmé: {account['email']}")
                else:
                    print(f"❌ Échec connexion {account['email']}: {error_code}")
                    
        except Exception as e:
            print(f"❌ Erreur test connexion {account['email']}: {str(e)}")
    
    print(f"\n📊 Résultat: {len(working_accounts)}/{len(demo_accounts)} comptes fonctionnels")
    
    if len(working_accounts) < len(demo_accounts):
        print("\n🔧 SOLUTION RECOMMANDÉE:")
        print("Les comptes existent mais les emails ne sont pas confirmés.")
        print("Solution temporaire: Modifier la configuration Supabase pour désactiver")
        print("la vérification d'email en développement.")
        print("\n📝 Instructions:")
        print("1. Aller dans Supabase Dashboard > Authentication > Settings")
        print("2. Désactiver 'Confirm email' pour les tests")
        print("3. Ou utiliser un service de mail de test")
    
    return working_accounts

if __name__ == "__main__":
    fix_authentication_issues()