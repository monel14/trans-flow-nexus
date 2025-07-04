#!/usr/bin/env python3
"""
Script pour supprimer tous les anciens comptes utilisateurs et repartir de zéro.
"""

import os
from supabase import create_client, Client

SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

def purge_all_users():
    """Supprimer tous les utilisateurs existants."""
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        
        print("🧹 SUPPRESSION DES ANCIENS COMPTES UTILISATEURS")
        print("="*50)
        print("⚠️  ATTENTION: Cette opération supprime TOUS les utilisateurs existants")
        
        # 1. Supprimer les user_roles
        print("1️⃣ Suppression des rôles utilisateurs...")
        user_roles_result = supabase.table('user_roles').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        print(f"   ✅ Rôles utilisateurs supprimés")
        
        # 2. Supprimer les profiles
        print("2️⃣ Suppression des profils...")
        profiles_result = supabase.table('profiles').delete().neq('id', '00000000-0000-0000-0000-000000000000').execute()
        print(f"   ✅ Profils supprimés")
        
        # 3. Vérifier l'état après suppression
        print("3️⃣ Vérification de la suppression...")
        
        remaining_profiles = supabase.table('profiles').select('*').execute()
        remaining_user_roles = supabase.table('user_roles').select('*').execute()
        
        print(f"   📊 Profils restants: {len(remaining_profiles.data) if remaining_profiles.data else 0}")
        print(f"   📊 Rôles utilisateurs restants: {len(remaining_user_roles.data) if remaining_user_roles.data else 0}")
        
        if len(remaining_profiles.data) == 0 and len(remaining_user_roles.data) == 0:
            print("   ✅ Suppression complète réussie!")
            return True
        else:
            print("   ⚠️  Suppression partielle")
            return False
        
    except Exception as e:
        print(f"❌ Erreur lors de la suppression: {e}")
        return False

def create_demo_accounts():
    """Créer de nouveaux comptes de démonstration avec le bon format."""
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        
        print("\n👥 CRÉATION DES COMPTES DE DÉMONSTRATION")
        print("="*45)
        
        # Comptes à créer avec le nouveau format
        demo_accounts = [
            {
                'identifier': 'admin.monel',
                'name': 'Monel Admin Général', 
                'role': 'admin_general',
                'password': 'admin123'
            },
            {
                'identifier': 'sadmin.pierre',
                'name': 'Pierre Sous-Admin',
                'role': 'sous_admin', 
                'password': 'sadmin123'
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
                'password': 'agent123'
            },
            {
                'identifier': 'ths01.amadou',
                'name': 'Amadou Agent Thiès', 
                'role': 'agent',
                'password': 'agent123'
            }
        ]
        
        successful_accounts = []
        
        for account in demo_accounts:
            try:
                print(f"📝 Création de {account['identifier']} ({account['role']})...")
                
                if account['role'] == 'admin_general':
                    # Utiliser create_initial_admin
                    result = supabase.rpc('create_initial_admin', {
                        'full_name_in': account['name'],
                        'identifier_in': account['identifier'],
                        'password_in': account['password']
                    }).execute()
                    
                elif account['role'] == 'sous_admin':
                    # Utiliser create_sous_admin 
                    result = supabase.rpc('create_sous_admin', {
                        'full_name_in': account['name'],
                        'identifier_in': account['identifier'],
                        'password_in': account['password']
                    }).execute()
                    
                elif account['role'] == 'chef_agence':
                    # Utiliser create_chef_agence
                    result = supabase.rpc('create_chef_agence', {
                        'full_name_in': account['name'],
                        'identifier_in': account['identifier'],
                        'password_in': account['password'],
                        'agency_id_in': account['agency_id']
                    }).execute()
                    
                else:
                    print(f"   ⚠️  Rôle {account['role']} non supporté par les fonctions RPC actuelles")
                    continue
                
                if result.data:
                    if isinstance(result.data, dict) and result.data.get('status') == 'success':
                        print(f"   ✅ {account['identifier']} créé avec succès")
                        successful_accounts.append(account)
                    else:
                        print(f"   ❌ Erreur: {result.data.get('message', 'Erreur inconnue')}")
                else:
                    print(f"   ❌ Aucune réponse de la fonction RPC")
                    
            except Exception as e:
                print(f"   ❌ Erreur lors de la création de {account['identifier']}: {e}")
        
        return successful_accounts
        
    except Exception as e:
        print(f"❌ Erreur lors de la création des comptes: {e}")
        return []

def main():
    """Fonction principale."""
    if not SUPABASE_SERVICE_KEY:
        print("❌ ERREUR: SUPABASE_SERVICE_KEY non définie")
        return
    
    print("🔄 RÉINITIALISATION COMPLÈTE DU SYSTÈME D'AUTHENTIFICATION")
    print("="*65)
    
    # Étape 1: Purger les anciens comptes
    if purge_all_users():
        print("✅ Anciens comptes supprimés avec succès")
        
        # Étape 2: Créer les nouveaux comptes de démonstration
        successful_accounts = create_demo_accounts()
        
        if successful_accounts:
            print(f"\n🎉 {len(successful_accounts)} comptes de démonstration créés avec succès!")
            
            print("\n📋 COMPTES CRÉÉS:")
            print("-" * 40)
            for account in successful_accounts:
                print(f"🔑 {account['identifier']} ({account['role']})")
                print(f"   👤 Nom: {account['name']}")
                print(f"   🗝️  Mot de passe: {account['password']}")
                print()
            
            print("🔗 URL de connexion: http://localhost:8080/")
            
        else:
            print("❌ Aucun compte de démonstration n'a pu être créé")
    else:
        print("❌ Échec de la suppression des anciens comptes")

if __name__ == "__main__":
    main()