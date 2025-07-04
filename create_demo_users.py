#!/usr/bin/env python3
"""
Script pour créer les comptes utilisateurs de démonstration via l'API Supabase Auth
et ajouter leurs profils dans la table profiles
"""

from supabase import create_client, Client
import json

# Configuration Supabase
SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"

# Utilisateurs de démonstration
DEMO_USERS = [
    {
        "email": "admin.general@transflow.com",
        "password": "Demo123!",
        "name": "Admin Général",
        "first_name": "Admin",
        "last_name": "Général",
        "role_id": 3,  # admin_general
        "agency_id": None,
        "balance": 0.0
    },
    {
        "email": "sous.admin@transflow.com", 
        "password": "Demo123!",
        "name": "Sous Administrateur",
        "first_name": "Sous",
        "last_name": "Administrateur",
        "role_id": 4,  # sous_admin
        "agency_id": None,
        "balance": 0.0
    },
    {
        "email": "developer@transflow.com",
        "password": "Demo123!",
        "name": "Développeur System",
        "first_name": "Développeur",
        "last_name": "System", 
        "role_id": 5,  # developer
        "agency_id": None,
        "balance": 0.0
    }
]

def create_demo_accounts():
    """Crée les comptes de démonstration"""
    print("🚀 CRÉATION DES COMPTES UTILISATEURS DE DÉMONSTRATION")
    print("="*60)
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Récupérer les agences
    agencies_result = supabase.table('agencies').select('*').execute()
    agencies = {agency['name']: agency for agency in agencies_result.data}
    
    print(f"📋 Agences disponibles: {list(agencies.keys())}")
    
    created_users = []
    
    for user_data in DEMO_USERS:
        try:
            print(f"\n👤 Création de {user_data['email']}...")
            
            # Vérifier si l'utilisateur existe déjà dans auth.users
            try:
                existing_user = supabase.auth.get_user()
                print(f"   ✓ Session active détectée")
            except:
                pass
            
            # Essayer de s'inscrire
            try:
                auth_response = supabase.auth.sign_up({
                    "email": user_data['email'],
                    "password": user_data['password'],
                    "options": {
                        "data": {
                            "name": user_data['name'],
                            "first_name": user_data['first_name'],
                            "last_name": user_data['last_name']
                        }
                    }
                })
                
                if auth_response.user:
                    user_id = auth_response.user.id
                    print(f"   ✅ Compte auth créé: {user_id}")
                    
                    # Créer le profil
                    profile_data = {
                        "id": user_id,
                        "email": user_data['email'],
                        "name": user_data['name'],
                        "first_name": user_data['first_name'],
                        "last_name": user_data['last_name'],
                        "role_id": user_data['role_id'],
                        "agency_id": user_data['agency_id'],
                        "balance": user_data['balance'],
                        "is_active": True
                    }
                    
                    # Désactiver RLS temporairement pour profiles
                    try:
                        profile_result = supabase.table('profiles').insert(profile_data).execute()
                        if profile_result.data:
                            print(f"   ✅ Profil créé dans profiles")
                            created_users.append({
                                "user_id": user_id,
                                "email": user_data['email'],
                                "role": user_data['role_id']
                            })
                        else:
                            print(f"   ❌ Erreur création profil")
                    except Exception as e:
                        print(f"   ❌ Erreur profil: {e}")
                        
                else:
                    print(f"   ❌ Erreur création compte auth")
                    
            except Exception as e:
                if "already registered" in str(e).lower() or "already exists" in str(e).lower():
                    print(f"   ⚠️  Utilisateur existe déjà: {user_data['email']}")
                else:
                    print(f"   ❌ Erreur auth: {e}")
                    
        except Exception as e:
            print(f"❌ Erreur générale pour {user_data['email']}: {e}")
    
    print(f"\n📊 RÉSUMÉ:")
    print(f"   • Comptes créés: {len(created_users)}")
    for user in created_users:
        print(f"   • {user['email']} (ID: {user['user_id'][:8]}...)")
    
    return created_users

def main():
    """Fonction principale"""
    print("⚠️  ATTENTION: Ce script nécessite que RLS soit désactivé sur la table profiles")
    print("   Ou utilisez une clé service_role au lieu d'anon key")
    print("")
    
    choice = input("Continuer? (y/N): ")
    if choice.lower() != 'y':
        print("❌ Annulé")
        return
    
    created_users = create_demo_accounts()
    
    if created_users:
        print("\n🎉 SUCCÈS!")
        print("   Les comptes de démonstration sont créés")
        print("   Vous pouvez maintenant:")
        print("   1. Tester la connexion avec ces comptes")
        print("   2. Exécuter le script de génération d'opérations")
        print("   3. Utiliser l'application normalement")
    else:
        print("\n⚠️  AUCUN COMPTE CRÉÉ")
        print("   Vérifiez les permissions et les configurations")

if __name__ == "__main__":
    main()