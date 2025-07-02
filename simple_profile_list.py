#!/usr/bin/env python3
"""
Script pour lister les profils utilisateurs de manière simple.
"""

import os
from supabase import create_client, Client

SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

def get_profiles_simple():
    """Récupérer les profils de manière simple."""
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        
        print("👥 PROFILS UTILISATEURS DÉTECTÉS")
        print("="*40)
        
        # Récupérer les profils simples
        profiles_result = supabase.table('profiles').select('*').execute()
        
        if profiles_result.data:
            print(f"✅ {len(profiles_result.data)} profils trouvés :\n")
            
            for i, profile in enumerate(profiles_result.data, 1):
                print(f"👤 UTILISATEUR {i}")
                print("-" * 25)
                print(f"🆔 ID          : {profile.get('id', 'N/A')}")
                print(f"📧 Identifiant : {profile.get('email', 'N/A')}")
                print(f"👨‍💼 Nom        : {profile.get('name', 'N/A')}")
                print(f"🏢 Agence ID   : {profile.get('agency_id', 'N/A')}")
                print(f"💰 Solde       : {profile.get('balance', 0)} FCFA")
                print(f"✅ Actif       : {'Oui' if profile.get('is_active') else 'Non'}")
                print(f"📅 Créé le     : {profile.get('created_at', 'N/A')[:10] if profile.get('created_at') else 'N/A'}")
                print()
        
        # Récupérer les utilisateurs de la table auth
        print("🔐 UTILISATEURS AUTH (avec identifiants de connexion)")
        print("="*55)
        
        try:
            # Utiliser une approche SQL directe pour auth.users
            import requests
            
            headers = {
                'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
                'Content-Type': 'application/json',
                'apikey': SUPABASE_SERVICE_KEY
            }
            
            # Faire une requête REST directe pour auth.users
            auth_url = f"{SUPABASE_URL}/rest/v1/auth.users"
            response = requests.get(auth_url, headers=headers)
            
            if response.status_code == 200:
                auth_users = response.json()
                for i, user in enumerate(auth_users, 1):
                    print(f"🔑 COMPTE AUTH {i}")
                    print(f"   📧 Identifiant de connexion : {user.get('email', 'N/A')}")
                    print(f"   🆔 ID                       : {user.get('id', 'N/A')}")
                    print(f"   ✅ Email confirmé           : {'Oui' if user.get('email_confirmed_at') else 'Non'}")
                    print(f"   📅 Créé le                  : {user.get('created_at', 'N/A')[:10] if user.get('created_at') else 'N/A'}")
                    print()
            else:
                print(f"⚠️ Impossible d'accéder à auth.users: {response.status_code}")
                
        except Exception as e:
            print(f"⚠️ Erreur auth.users: {e}")
        
        # Essayer de récupérer les rôles des utilisateurs
        print("🎭 RÔLES DES UTILISATEURS")
        print("="*30)
        
        try:
            user_roles_result = supabase.table('user_roles').select('*').execute()
            if user_roles_result.data:
                for user_role in user_roles_result.data:
                    if user_role.get('is_active'):
                        print(f"👤 User ID : {user_role.get('user_id', 'N/A')}")
                        print(f"🎭 Role ID : {user_role.get('role_id', 'N/A')}")
                        print(f"🏢 Agency  : {user_role.get('agency_id', 'Global')}")
                        print()
        except Exception as e:
            print(f"⚠️ Erreur user_roles: {e}")
        
        return profiles_result.data
        
    except Exception as e:
        print(f"❌ Erreur: {e}")
        return None

def main():
    """Fonction principale."""
    if not SUPABASE_SERVICE_KEY:
        print("❌ ERREUR: SUPABASE_SERVICE_KEY non définie")
        return
    
    profiles = get_profiles_simple()
    
    print("\n" + "="*60)
    print("🎯 INFORMATIONS DE CONNEXION SUGGÉRÉES")
    print("="*60)
    print("⚠️  Note: Essayez ces mots de passe courants :")
    print("   • admin123")
    print("   • Test123!")
    print("   • password123")
    print("   • motdepasse123")
    print()
    print("🔗 URL de l'application : http://localhost:8080/")
    print()
    print("💡 Conseil : Si vous ne connaissez pas les mots de passe,")
    print("   vous pouvez créer un nouvel admin avec les fonctions RPC")

if __name__ == "__main__":
    main()