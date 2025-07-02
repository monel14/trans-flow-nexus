#!/usr/bin/env python3
"""
Script pour diagnostiquer la structure des données utilisateur
et identifier pourquoi les rôles ne sont pas trouvés.
"""

import os
from supabase import create_client, Client

# Configuration Supabase
SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"

def analyze_user_data_structure():
    """Analyse la structure des données utilisateur"""
    print("🔍 Analyse de la structure des données utilisateur...")
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # Test avec un compte démo
    test_email = "admin_monel@transflownexus.demo"
    test_password = "admin123"
    
    try:
        # Connexion
        auth_response = supabase.auth.sign_in_with_password({
            "email": test_email,
            "password": test_password
        })
        
        user_id = auth_response.user.id
        print(f"✅ Connexion réussie. User ID: {user_id}")
        
        # 1. Vérifier les données du profil
        print("\n📋 1. Données du profil:")
        profile_response = supabase.table('profiles').select('*').eq('id', user_id).execute()
        if profile_response.data:
            profile = profile_response.data[0]
            print(f"   - ID: {profile.get('id')}")
            print(f"   - Name: {profile.get('name')}")
            print(f"   - Email: {profile.get('email')}")
            print(f"   - Role ID: {profile.get('role_id')}")
            print(f"   - Agency ID: {profile.get('agency_id')}")
            print(f"   - Is Active: {profile.get('is_active')}")
            
            # Si role_id existe directement dans profiles
            if profile.get('role_id'):
                print(f"\n📋 2. Rôle via profile.role_id:")
                role_response = supabase.table('roles').select('*').eq('id', profile.get('role_id')).execute()
                if role_response.data:
                    role = role_response.data[0]
                    print(f"   - Role Name: {role.get('name')}")
                    print(f"   - Role Label: {role.get('label')}")
        
        # 3. Vérifier la table user_roles
        print(f"\n📋 3. Recherche dans user_roles pour user_id {user_id}:")
        user_roles_response = supabase.table('user_roles').select('*').eq('user_id', user_id).execute()
        print(f"   - Lignes trouvées: {len(user_roles_response.data)}")
        
        if user_roles_response.data:
            for role_link in user_roles_response.data:
                print(f"   - Role ID: {role_link.get('role_id')}")
                print(f"   - Is Active: {role_link.get('is_active')}")
                print(f"   - Agency ID: {role_link.get('agency_id')}")
        else:
            print("   ❌ Aucune ligne dans user_roles pour cet utilisateur")
        
        # 4. Vérifier toutes les lignes user_roles
        print(f"\n📋 4. Toutes les lignes user_roles dans la base:")
        all_user_roles = supabase.table('user_roles').select('*').execute()
        print(f"   - Total lignes user_roles: {len(all_user_roles.data)}")
        
        if all_user_roles.data:
            print("   - Exemples d'user_ids dans user_roles:")
            for i, role_link in enumerate(all_user_roles.data[:5]):  # Premiers 5
                print(f"     [{i+1}] User ID: {role_link.get('user_id')[:8]}...")
        
        # 5. Lister tous les profils
        print(f"\n📋 5. Tous les profils dans la base:")
        all_profiles = supabase.table('profiles').select('id, name, email, role_id').execute()
        print(f"   - Total profils: {len(all_profiles.data)}")
        
        for profile in all_profiles.data:
            user_id_short = profile.get('id', '')[:8] if profile.get('id') else 'N/A'
            print(f"   - {profile.get('name')} ({user_id_short}...) - Role ID: {profile.get('role_id')}")
        
        # 6. Lister tous les rôles disponibles
        print(f"\n📋 6. Tous les rôles disponibles:")
        all_roles = supabase.table('roles').select('*').execute()
        for role in all_roles.data:
            print(f"   - ID {role.get('id')}: {role.get('name')} ({role.get('label')})")
        
        supabase.auth.sign_out()
        
    except Exception as e:
        print(f"❌ Erreur lors de l'analyse : {str(e)}")

def suggest_fix_strategy():
    """Suggère une stratégie de correction"""
    print("\n" + "="*60)
    print("💡 STRATÉGIES DE CORRECTION POSSIBLES:")
    print("="*60)
    
    print("\n1. 🎯 Si les rôles sont dans profiles.role_id:")
    print("   - Modifier AuthContext pour utiliser profiles.role_id au lieu de user_roles")
    print("   - Jointure directe: profiles -> roles")
    
    print("\n2. 🔧 Si user_roles doit être utilisée:")
    print("   - Créer les lignes manquantes dans user_roles")
    print("   - Mapper chaque utilisateur vers son rôle via user_roles")
    
    print("\n3. 🔄 Migration de données:")
    print("   - Script pour copier profiles.role_id vers user_roles")
    print("   - Assurer la cohérence entre les deux tables")

def main():
    print("🚀 Diagnostic approfondi des données utilisateur")
    print("="*60)
    
    analyze_user_data_structure()
    suggest_fix_strategy()

if __name__ == "__main__":
    main()