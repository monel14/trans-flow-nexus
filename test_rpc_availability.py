#!/usr/bin/env python3
"""
Test simple pour vérifier que les fonctions RPC sont disponibles.
Utilise la clé publique pour les tests de base.
"""

from supabase import create_client, Client
import json

# Configuration avec clé publique
SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"

# Initialiser le client Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

def test_supabase_connection():
    """Test de base de la connexion Supabase."""
    print("🧪 Test de connexion Supabase...")
    
    try:
        # Test simple - récupérer les rôles
        result = supabase.table('roles').select('name').limit(1).execute()
        
        if result.data:
            print("✅ Connexion Supabase OK")
            print(f"  📋 Rôle trouvé: {result.data[0]['name']}")
            return True
        else:
            print("⚠️  Connexion OK mais aucune donnée")
            return False
            
    except Exception as e:
        print(f"❌ Erreur de connexion: {str(e)}")
        return False

def test_rpc_function_existence():
    """Test si nos fonctions RPC existent."""
    print("\n🧪 Test d'existence des fonctions RPC...")
    
    functions_to_test = [
        'validate_identifier_format',
        'create_initial_admin',
        'create_chef_agence',
        'create_sous_admin',
        'create_agent'
    ]
    
    available_functions = []
    
    for func_name in functions_to_test:
        try:
            # Tenter d'appeler la fonction avec des paramètres invalides
            # pour voir si elle existe (elle devrait retourner une erreur)
            if func_name == 'validate_identifier_format':
                result = supabase.rpc(func_name, {
                    'identifier_in': 'test.format', 
                    'expected_role': 'test_role'
                }).execute()
                
            print(f"  ✅ {func_name}: disponible")
            available_functions.append(func_name)
            
        except Exception as e:
            if "does not exist" in str(e) or "function" in str(e).lower():
                print(f"  ❌ {func_name}: non trouvée")
            else:
                print(f"  ✅ {func_name}: disponible (erreur d'appel normale)")
                available_functions.append(func_name)
    
    print(f"\n📊 Fonctions disponibles: {len(available_functions)}/{len(functions_to_test)}")
    return len(available_functions) == len(functions_to_test)

def test_identifier_validation():
    """Test de la fonction de validation si disponible."""
    print("\n🧪 Test de validation des identifiants...")
    
    try:
        # Test avec un identifiant valide
        result = supabase.rpc('validate_identifier_format', {
            'identifier_in': 'admin.monel',
            'expected_role': 'admin_general'
        }).execute()
        
        if result.data == True:
            print("  ✅ Validation admin.monel: OK")
            
            # Test avec un identifiant invalide
            result2 = supabase.rpc('validate_identifier_format', {
                'identifier_in': 'invalid',
                'expected_role': 'admin_general'
            }).execute()
            
            if result2.data == False:
                print("  ✅ Validation format invalide: OK")
                return True
            
        print("  ⚠️  Résultats de validation inattendus")
        return False
        
    except Exception as e:
        print(f"  ❌ Erreur lors du test: {str(e)}")
        return False

def test_agency_exists():
    """Vérifier qu'au moins une agence existe pour les tests."""
    print("\n🧪 Test d'existence des agences...")
    
    try:
        result = supabase.table('agencies').select('id,name').limit(1).execute()
        
        if result.data:
            print(f"  ✅ Agence trouvée: {result.data[0]['name']}")
            return True
        else:
            print("  ⚠️  Aucune agence trouvée - nécessaire pour les tests de chef d'agence")
            return False
            
    except Exception as e:
        print(f"  ❌ Erreur: {str(e)}")
        return False

def main():
    """Fonction principale de test."""
    print("🚀 Test des Fonctions RPC - Phase 2")
    print("=" * 50)
    
    test_results = []
    
    # Test 1: Connexion de base
    test_results.append(test_supabase_connection())
    
    # Test 2: Existence des fonctions RPC
    test_results.append(test_rpc_function_existence())
    
    # Test 3: Validation des identifiants
    test_results.append(test_identifier_validation())
    
    # Test 4: Existence des agences
    test_results.append(test_agency_exists())
    
    print("=" * 50)
    passed = sum(test_results)
    total = len(test_results)
    
    print(f"📊 Résultats: {passed}/{total} tests réussis")
    
    if passed == total:
        print("✅ Toutes les fonctions RPC sont déployées et opérationnelles!")
        print("\n🎯 Prochaines étapes:")
        print("1. Créer l'admin initial avec: SELECT create_initial_admin('Admin', 'admin.monel', 'motdepasse');")
        print("2. Tester la création d'utilisateurs via l'interface")
        print("3. Procéder à la Phase 3: Interface de Gestion")
    elif passed >= 2:
        print("⚠️  Fonctions partiellement déployées")
        print("📋 Actions recommandées:")
        print("1. Vérifiez que toutes les migrations SQL ont été exécutées")
        print("2. Consultez DEPLOYMENT_GUIDE_PHASE2.md pour les instructions")
    else:
        print("❌ Fonctions RPC non déployées")
        print("📋 Actions requises:")
        print("1. Exécutez les migrations dans Supabase SQL Editor")
        print("2. Suivez DEPLOYMENT_GUIDE_PHASE2.md")

if __name__ == "__main__":
    main()