#!/usr/bin/env python3
"""
Test de connexion à Supabase et création de données de base
"""

import os
from supabase import create_client, Client

# Configuration Supabase
SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"

def test_supabase_connection():
    """Test la connexion à Supabase"""
    print("🔗 Test de connexion à Supabase...")
    
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        # Test de lecture de la table roles
        result = supabase.table('roles').select('*').execute()
        print(f"✅ Connexion réussie - {len(result.data)} rôles trouvés")
        
        for role in result.data:
            print(f"   • {role['name']} (ID: {role['id']})")
        
        return supabase
        
    except Exception as e:
        print(f"❌ Erreur de connexion: {e}")
        return None

def test_agencies():
    """Test la table agencies"""
    print("\n🏢 Test de la table agencies...")
    
    supabase = test_supabase_connection()
    if not supabase:
        return
    
    try:
        # Lire les agences existantes
        result = supabase.table('agencies').select('*').execute()
        print(f"✅ {len(result.data)} agences trouvées")
        
        for agency in result.data:
            print(f"   • {agency['name']} - {agency['city']}")
            
        # Essayer de créer une nouvelle agence de test
        test_agency = {
            "name": "Test Agency",
            "city": "Test City",
            "is_active": True
        }
        
        # Vérifier si elle existe déjà
        existing = supabase.table('agencies').select('*').eq('name', 'Test Agency').execute()
        if not existing.data:
            insert_result = supabase.table('agencies').insert(test_agency).execute()
            print(f"✅ Agence de test créée: {insert_result.data[0]['name']}")
        else:
            print("✅ Agence de test existe déjà")
            
    except Exception as e:
        print(f"❌ Erreur avec les agences: {e}")

def test_profiles():
    """Test la table profiles"""
    print("\n👥 Test de la table profiles...")
    
    supabase = test_supabase_connection()
    if not supabase:
        return
    
    try:
        # Lire les profils existants
        result = supabase.table('profiles').select('*').execute()
        print(f"✅ {len(result.data)} profils trouvés")
        
        for profile in result.data[:5]:  # Afficher seulement les 5 premiers
            print(f"   • {profile['name']} - {profile['email']}")
            
    except Exception as e:
        print(f"❌ Erreur avec les profils: {e}")

def test_operation_types():
    """Test la table operation_types"""
    print("\n💳 Test de la table operation_types...")
    
    supabase = test_supabase_connection()
    if not supabase:
        return
    
    try:
        # Lire les types d'opération existants
        result = supabase.table('operation_types').select('*').execute()
        print(f"✅ {len(result.data)} types d'opération trouvés")
        
        for op_type in result.data:
            print(f"   • {op_type['name']} - Impact balance: {op_type['impacts_balance']}")
            
    except Exception as e:
        print(f"❌ Erreur avec les types d'opération: {e}")

if __name__ == "__main__":
    print("🧪 TESTS DE CONNEXION SUPABASE")
    print("="*50)
    
    test_supabase_connection()
    test_agencies()
    test_profiles()
    test_operation_types()
    
    print("\n✅ Tests terminés")