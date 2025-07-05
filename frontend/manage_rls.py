#!/usr/bin/env python3
"""
Script pour gérer les politiques RLS de Supabase pendant la génération de données
"""

from supabase import create_client, Client
import sys
import json

# Configuration Supabase
SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"

def disable_rls():
    """Désactive les politiques RLS sur les tables principales"""
    print("🔓 Désactivation des politiques RLS...")
    
    tables = [
        'profiles', 'agencies', 'operation_types', 'operations', 
        'commission_rules', 'commission_records', 'transaction_ledger',
        'request_tickets', 'notifications', 'system_settings',
        'operation_type_fields'
    ]
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    for table in tables:
        try:
            # Essayer de désactiver RLS via SQL
            sql = f"ALTER TABLE {table} DISABLE ROW LEVEL SECURITY;"
            result = supabase.rpc('execute_sql', {'query': sql}).execute()
            print(f"✅ RLS désactivé pour {table}")
        except Exception as e:
            print(f"❌ Erreur RLS {table}: {e}")
            # Continuer même en cas d'erreur
            pass

def enable_rls():
    """Réactive les politiques RLS sur les tables principales"""
    print("🔒 Réactivation des politiques RLS...")
    
    tables = [
        'profiles', 'agencies', 'operation_types', 'operations', 
        'commission_rules', 'commission_records', 'transaction_ledger',
        'request_tickets', 'notifications', 'system_settings',
        'operation_type_fields'
    ]
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    for table in tables:
        try:
            # Essayer de réactiver RLS via SQL
            sql = f"ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;"
            result = supabase.rpc('execute_sql', {'query': sql}).execute()
            print(f"✅ RLS réactivé pour {table}")
        except Exception as e:
            print(f"❌ Erreur RLS {table}: {e}")
            # Continuer même en cas d'erreur
            pass

def test_insertion():
    """Test d'insertion pour vérifier que RLS est désactivé"""
    print("🧪 Test d'insertion...")
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    try:
        # Essayer d'insérer une agence de test
        test_data = {
            "name": "Test Agency",
            "city": "Test City", 
            "is_active": True
        }
        
        result = supabase.table('agencies').insert(test_data).execute()
        
        if result.data:
            print("✅ Test d'insertion réussi - RLS désactivé")
            # Supprimer l'agence de test
            supabase.table('agencies').delete().eq('name', 'Test Agency').execute()
            return True
        else:
            print("❌ Test d'insertion échoué")
            return False
            
    except Exception as e:
        print(f"❌ Test d'insertion échoué: {e}")
        return False

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python manage_rls.py [disable|enable|test]")
        sys.exit(1)
    
    action = sys.argv[1]
    
    if action == "disable":
        disable_rls()
    elif action == "enable":
        enable_rls()
    elif action == "test":
        test_insertion()
    else:
        print("Action invalide. Utiliser: disable, enable, ou test")
        sys.exit(1)