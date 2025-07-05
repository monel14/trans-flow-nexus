#!/usr/bin/env python3
"""
Test direct des fonctions RPC pour créer des utilisateurs
"""

from supabase import create_client, Client

# Configuration Supabase
SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"

def test_rpc_functions():
    """Test les fonctions RPC individuellement"""
    print("🧪 TEST DES FONCTIONS RPC")
    print("="*40)
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    # 1. Test création admin général
    print("\n👑 Test création admin général...")
    try:
        result = supabase.rpc('create_admin_user', {
            'user_name': 'Admin Test',
            'user_email': 'admin.test@transflow.com',
            'user_password': 'Demo123!'
        }).execute()
        
        print(f"✅ Admin créé avec succès: {result.data}")
        
        # Vérifier que le profil existe
        profile_check = supabase.table('profiles').select('*').eq('email', 'admin.test@transflow.com').execute()
        if profile_check.data:
            print(f"✅ Profil admin trouvé: {profile_check.data[0]['name']}")
        
    except Exception as e:
        print(f"❌ Erreur admin: {e}")
    
    # 2. Test création sous-admin
    print("\n👥 Test création sous-admin...")
    try:
        result = supabase.rpc('create_sous_admin', {
            'user_name': 'Sous Admin Test',
            'user_email': 'sousadmin.test@transflow.com',
            'user_password': 'Demo123!'
        }).execute()
        
        print(f"✅ Sous-admin créé avec succès: {result.data}")
        
    except Exception as e:
        print(f"❌ Erreur sous-admin: {e}")
    
    # 3. Lister les fonctions RPC disponibles
    print("\n🔍 Vérification des fonctions disponibles...")
    try:
        # Essayer d'appeler une fonction qui liste les fonctions
        # Ou tester avec des fonctions connues
        
        # Test avec des agences existantes si elles existent
        agencies_check = supabase.table('agencies').select('*').execute()
        print(f"✅ Agences existantes: {len(agencies_check.data)}")
        
        if len(agencies_check.data) > 0:
            agency_id = agencies_check.data[0]['id']
            print(f"   • Agence trouvée: {agencies_check.data[0]['name']} (ID: {agency_id})")
            
            # Test création chef d'agence avec agence existante
            print("\n🏢 Test création chef d'agence...")
            try:
                result = supabase.rpc('create_chef_agence', {
                    'user_name': 'Chef Test',
                    'user_email': 'chef.test@transflow.com',
                    'user_password': 'Demo123!',
                    'agency_id': agency_id
                }).execute()
                
                print(f"✅ Chef d'agence créé: {result.data}")
                
            except Exception as e:
                print(f"❌ Erreur chef d'agence: {e}")
        
    except Exception as e:
        print(f"❌ Erreur vérification: {e}")
    
    # 4. Vérifier les utilisateurs créés
    print("\n📋 Vérification finale...")
    try:
        profiles = supabase.table('profiles').select('*, roles(name)').execute()
        print(f"✅ Total profils trouvés: {len(profiles.data)}")
        
        for profile in profiles.data:
            role_name = profile.get('roles', {}).get('name', 'unknown') if profile.get('roles') else 'unknown'
            print(f"   • {profile['email']} - {role_name}")
            
    except Exception as e:
        print(f"❌ Erreur vérification finale: {e}")

if __name__ == "__main__":
    test_rpc_functions()