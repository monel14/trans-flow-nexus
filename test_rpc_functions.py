#!/usr/bin/env python3
"""
Script de test pour les fonctions RPC de création d'utilisateurs.
"""

import os
import sys
from supabase import create_client, Client
import json

# Configuration Supabase
SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not SUPABASE_SERVICE_KEY:
    print("❌ ERREUR: Variable d'environnement SUPABASE_SERVICE_KEY non définie")
    sys.exit(1)

# Initialiser le client Supabase
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def test_identifier_validation():
    """Test de la fonction de validation des identifiants."""
    print("🧪 Test de validation des identifiants...")
    
    test_cases = [
        # Admin/Sous-admin
        ('admin.monel', 'admin_general', True),
        ('sadmin.pierre', 'sous_admin', True),
        ('admin.123', 'admin_general', False),  # Chiffres non autorisés
        
        # Chef d'agence
        ('chef.dakar.diallo', 'chef_agence', True),
        ('chef.lomé.koffi', 'chef_agence', True),
        ('chef.dakar', 'chef_agence', False),  # Format incomplet
        
        # Agent
        ('dkr01.fatou', 'agent', True),
        ('lome02.kofi', 'agent', True),
        ('dkr01.', 'agent', False),  # Prénom manquant
    ]
    
    success_count = 0
    
    for identifier, role, expected in test_cases:
        try:
            result = supabase.rpc('validate_identifier_format', {
                'identifier_in': identifier,
                'expected_role': role
            }).execute()
            
            actual = result.data if result.data is not None else False
            
            if actual == expected:
                print(f"  ✅ {identifier} ({role}): {actual}")
                success_count += 1
            else:
                print(f"  ❌ {identifier} ({role}): attendu {expected}, obtenu {actual}")
                
        except Exception as e:
            print(f"  ❌ {identifier} ({role}): erreur {str(e)}")
    
    print(f"📊 Résultat: {success_count}/{len(test_cases)} tests réussis")
    return success_count == len(test_cases)

def test_create_initial_admin():
    """Test de création de l'admin initial."""
    print("\n🧪 Test de création de l'admin initial...")
    
    try:
        # D'abord, supprimer tout admin existant pour le test
        print("🧹 Nettoyage des admins existants...")
        
        # Récupérer l'ID du rôle admin_general
        admin_role = supabase.table('roles').select('id').eq('name', 'admin_general').execute()
        if admin_role.data:
            admin_role_id = admin_role.data[0]['id']
            
            # Supprimer les user_roles admin
            supabase.table('user_roles').delete().eq('role_id', admin_role_id).execute()
            
        # Créer l'admin initial
        result = supabase.rpc('create_initial_admin', {
            'full_name_in': 'Monel Admin',
            'identifier_in': 'admin.monel',
            'password_in': 'admin123secure'
        }).execute()
        
        if result.data and result.data.get('status') == 'success':
            print("  ✅ Admin initial créé avec succès")
            print(f"  📋 ID utilisateur: {result.data.get('user_id')}")
            print(f"  📋 Identifiant: {result.data.get('identifier')}")
            return True
        else:
            print(f"  ❌ Échec de création: {result.data}")
            return False
            
    except Exception as e:
        print(f"  ❌ Erreur: {str(e)}")
        return False

def test_create_chef_agence():
    """Test de création d'un chef d'agence."""
    print("\n🧪 Test de création d'un chef d'agence...")
    
    try:
        # D'abord s'assurer qu'une agence existe
        agency = supabase.table('agencies').select('id').limit(1).execute()
        if not agency.data:
            print("  ⚠️  Aucune agence trouvée, création en cours...")
            agency_result = supabase.table('agencies').insert({
                'name': 'Agence Test',
                'city': 'Dakar',
                'is_active': True
            }).execute()
            agency_id = agency_result.data[0]['id']
        else:
            agency_id = agency.data[0]['id']
        
        # Créer le chef d'agence (doit être appelé par un admin)
        # Note: Dans un vrai test, on devrait d'abord se connecter en tant qu'admin
        result = supabase.rpc('create_chef_agence', {
            'full_name_in': 'Diallo Chef',
            'identifier_in': 'chef.dakar.diallo',
            'password_in': 'chef123secure',
            'agency_id_in': agency_id
        }).execute()
        
        if result.data and result.data.get('status') == 'success':
            print("  ✅ Chef d'agence créé avec succès")
            print(f"  📋 ID utilisateur: {result.data.get('user_id')}")
            print(f"  📋 Identifiant: {result.data.get('identifier')}")
            return True
        else:
            print(f"  ❌ Échec de création: {result.data}")
            return False
            
    except Exception as e:
        print(f"  ❌ Erreur: {str(e)}")
        return False

def main():
    """Fonction principale de test."""
    print("🚀 Tests des fonctions RPC - Phase 2")
    print("=" * 50)
    
    total_tests = 0
    passed_tests = 0
    
    # Test 1: Validation des identifiants
    if test_identifier_validation():
        passed_tests += 1
    total_tests += 1
    
    # Test 2: Création admin initial
    if test_create_initial_admin():
        passed_tests += 1
    total_tests += 1
    
    # Test 3: Création chef d'agence
    # Note: Ce test pourrait échouer si l'admin n'est pas connecté
    print("\n⚠️  Note: Le test suivant nécessite d'être connecté en tant qu'admin")
    if test_create_chef_agence():
        passed_tests += 1
    total_tests += 1
    
    print("=" * 50)
    print(f"📊 Résultats des tests: {passed_tests}/{total_tests} réussis")
    
    if passed_tests == total_tests:
        print("✅ Tous les tests passent! Les fonctions RPC sont opérationnelles.")
    else:
        print("⚠️  Certains tests ont échoué. Vérifiez le déploiement des fonctions.")
    
    print("\n🎯 Prochaines étapes si les tests passent:")
    print("1. Créer les interfaces de gestion (Phase 3)")
    print("2. Implémenter les formulaires de création d'utilisateurs")
    print("3. Tester le flux complet avec l'interface utilisateur")

if __name__ == "__main__":
    main()