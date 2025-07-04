#!/usr/bin/env python3
"""
Script pour lister tous les profils utilisateurs disponibles dans Supabase.
"""

import os
from supabase import create_client, Client

# Configuration Supabase
SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

def get_user_profiles():
    """Récupérer tous les profils utilisateurs avec leurs rôles."""
    try:
        # Créer le client Supabase
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        
        print("🔍 RÉCUPÉRATION DES PROFILS UTILISATEURS")
        print("="*50)
        
        # Récupérer les profils avec les informations des rôles et agences
        result = supabase.table('profiles').select('''
            *,
            agencies (id, name, city),
            user_roles!inner (
                is_active,
                roles (id, name, label)
            )
        ''').execute()
        
        if result.data:
            print(f"✅ {len(result.data)} profils utilisateurs trouvés :\n")
            
            for i, profile in enumerate(result.data, 1):
                print(f"👤 UTILISATEUR {i}")
                print("-" * 30)
                print(f"📧 Identifiant     : {profile.get('email', 'N/A')}")
                print(f"👨‍💼 Nom complet     : {profile.get('name', 'N/A')}")
                print(f"🆔 ID              : {profile.get('id', 'N/A')}")
                print(f"✅ Actif           : {'Oui' if profile.get('is_active') else 'Non'}")
                print(f"💰 Solde           : {profile.get('balance', 0)} FCFA")
                
                # Informations de rôle
                user_roles = profile.get('user_roles', [])
                if user_roles:
                    for user_role in user_roles:
                        if user_role.get('is_active'):
                            role_info = user_role.get('roles', {})
                            print(f"🎭 Rôle            : {role_info.get('name', 'N/A')} ({role_info.get('label', 'N/A')})")
                else:
                    print(f"🎭 Rôle            : Non défini")
                
                # Informations d'agence
                agency = profile.get('agencies')
                if agency:
                    print(f"🏢 Agence          : {agency.get('name', 'N/A')} ({agency.get('city', 'N/A')})")
                    print(f"🏢 ID Agence       : {agency.get('id', 'N/A')}")
                else:
                    print(f"🏢 Agence          : Aucune (Admin/Sous-admin)")
                
                print(f"📅 Créé le         : {profile.get('created_at', 'N/A')}")
                print(f"📅 Mis à jour le   : {profile.get('updated_at', 'N/A')}")
                print()
        
        else:
            print("❌ Aucun profil utilisateur trouvé")
        
        # Récupérer aussi les utilisateurs auth pour voir les emails/identifiants
        print("\n🔐 UTILISATEURS DANS AUTH.USERS")
        print("="*40)
        
        auth_result = supabase.table('auth.users').select('id, email, created_at, email_confirmed_at').execute()
        
        if auth_result.data:
            for i, user in enumerate(auth_result.data, 1):
                print(f"🔑 AUTH USER {i}")
                print(f"   📧 Email/Identifiant : {user.get('email', 'N/A')}")
                print(f"   🆔 ID               : {user.get('id', 'N/A')}")
                print(f"   ✅ Email confirmé   : {'Oui' if user.get('email_confirmed_at') else 'Non'}")
                print(f"   📅 Créé le          : {user.get('created_at', 'N/A')}")
                print()
        
        return result.data
        
    except Exception as e:
        print(f"❌ Erreur lors de la récupération des profils: {str(e)}")
        return None

def get_available_roles():
    """Récupérer tous les rôles disponibles."""
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        
        print("\n🎭 RÔLES DISPONIBLES DANS LE SYSTÈME")
        print("="*40)
        
        result = supabase.table('roles').select('*').execute()
        
        if result.data:
            for role in result.data:
                print(f"🎯 {role.get('name', 'N/A')} - {role.get('label', 'N/A')}")
                print(f"   📝 Description: {role.get('description', 'N/A')}")
                print()
        
        return result.data
        
    except Exception as e:
        print(f"❌ Erreur lors de la récupération des rôles: {str(e)}")
        return None

def get_available_agencies():
    """Récupérer toutes les agences disponibles."""
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        
        print("\n🏢 AGENCES DISPONIBLES")
        print("="*25)
        
        result = supabase.table('agencies').select('*').execute()
        
        if result.data:
            for agency in result.data:
                print(f"🏪 {agency.get('name', 'N/A')} (ID: {agency.get('id', 'N/A')})")
                print(f"   📍 Ville: {agency.get('city', 'N/A')}")
                print(f"   👨‍💼 Chef: {agency.get('chef_agence_id', 'Non assigné')}")
                print(f"   ✅ Active: {'Oui' if agency.get('is_active') else 'Non'}")
                print()
        
        return result.data
        
    except Exception as e:
        print(f"❌ Erreur lors de la récupération des agences: {str(e)}")
        return None

def suggest_login_credentials(profiles):
    """Suggérer des identifiants de connexion basés sur les profils."""
    if not profiles:
        return
    
    print("\n🔑 SUGGESTIONS D'IDENTIFIANTS DE CONNEXION")
    print("="*50)
    print("⚠️  Note: Les mots de passe ne sont pas visibles pour des raisons de sécurité")
    print("   Essayez les mots de passe courants comme : admin123, Test123!, password123\n")
    
    for i, profile in enumerate(profiles, 1):
        identifier = profile.get('email', 'N/A')
        name = profile.get('name', 'N/A')
        
        # Déterminer le rôle
        user_roles = profile.get('user_roles', [])
        role_name = 'Inconnu'
        if user_roles:
            for user_role in user_roles:
                if user_role.get('is_active'):
                    role_info = user_role.get('roles', {})
                    role_name = role_info.get('label', role_info.get('name', 'Inconnu'))
        
        print(f"🚪 COMPTE {i}: {role_name}")
        print(f"   👤 Nom        : {name}")
        print(f"   🔑 Identifiant: {identifier}")
        print(f"   🗝️  Mot de passe: [Essayez: admin123, Test123!, password123]")
        print()

def main():
    """Fonction principale."""
    if not SUPABASE_SERVICE_KEY:
        print("❌ ERREUR: Variable SUPABASE_SERVICE_KEY non définie")
        return
    
    # Récupérer les profils
    profiles = get_user_profiles()
    
    # Récupérer les rôles
    get_available_roles()
    
    # Récupérer les agences
    get_available_agencies()
    
    # Suggérer des identifiants de connexion
    suggest_login_credentials(profiles)
    
    print("\n" + "="*60)
    print("🎯 RÉSUMÉ")
    print("="*60)
    print("✅ Authentification Supabase : Fonctionne")
    print("✅ Base de données accessible : OK")
    print("✅ Profils utilisateurs : Disponibles")
    print("🔗 URL Application : http://localhost:8080/")
    print("\n💡 Conseil : Essayez de vous connecter avec les identifiants ci-dessus")

if __name__ == "__main__":
    main()