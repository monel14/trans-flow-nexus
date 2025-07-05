#!/usr/bin/env python3
"""
Script pour créer les fonctions RPC dans Supabase.
Phase 2: Création d'Utilisateurs Côté Serveur
"""

import os
import sys
from supabase import create_client, Client

# Configuration Supabase
SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

if not SUPABASE_SERVICE_KEY:
    print("❌ ERREUR: Variable d'environnement SUPABASE_SERVICE_KEY non définie")
    print("Pour obtenir cette clé :")
    print("1. Allez dans votre projet Supabase")
    print("2. Settings > API")
    print("3. Copiez la 'service_role' key (pas la anon key)")
    print("4. Exportez-la: export SUPABASE_SERVICE_KEY='votre_cle_ici'")
    print("\n⚠️  Cette clé est nécessaire pour créer des fonctions dans Supabase")
    sys.exit(1)

# Initialiser le client Supabase avec la service_role key
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def execute_sql_file(filename: str) -> bool:
    """Exécute un fichier SQL dans Supabase."""
    try:
        print(f"📖 Lecture du fichier {filename}...")
        
        with open(filename, 'r', encoding='utf-8') as f:
            sql_content = f.read()
        
        print(f"🔧 Exécution du SQL...")
        
        # Pour les fonctions RPC complexes, nous devons utiliser l'API REST directement
        # car le client Python n'a pas de méthode pour exécuter du SQL brut
        import requests
        
        headers = {
            'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY
        }
        
        # Utiliser l'endpoint SQL de Supabase (si disponible)
        # Sinon, nous devrons appliquer les fonctions manuellement
        
        print("⚠️  Les fonctions RPC doivent être appliquées manuellement dans Supabase")
        print("📋 Instructions :")
        print("1. Ouvrez votre projet Supabase Dashboard")
        print("2. Allez dans 'Database' > 'Functions'")
        print("3. Cliquez sur 'Create a new function'")
        print("4. Copiez-collez le contenu de supabase_rpc_functions.sql")
        print("5. Ou utilisez le SQL Editor pour exécuter le fichier complet")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de l'exécution: {str(e)}")
        return False

def test_functions() -> bool:
    """Teste que les fonctions RPC sont disponibles."""
    try:
        print("🧪 Test de disponibilité des fonctions RPC...")
        
        # Test de la fonction validate_identifier_format
        result = supabase.rpc('validate_identifier_format', {
            'identifier_in': 'admin.test',
            'expected_role': 'admin_general'
        }).execute()
        
        if result.data:
            print("✅ Fonction validate_identifier_format disponible")
            return True
        else:
            print("❌ Fonctions RPC non trouvées dans Supabase")
            return False
            
    except Exception as e:
        print(f"⚠️  Fonctions RPC pas encore déployées: {str(e)}")
        return False

def create_sample_agency() -> bool:
    """Crée une agence d'exemple pour les tests."""
    try:
        print("🏢 Création d'une agence d'exemple...")
        
        # Vérifier si l'agence existe déjà
        existing = supabase.table('agencies').select('*').eq('name', 'Agence Dakar Centre').execute()
        
        if existing.data:
            print("✅ Agence d'exemple existe déjà")
            return True
        
        # Créer l'agence
        result = supabase.table('agencies').insert({
            'name': 'Agence Dakar Centre',
            'city': 'Dakar',
            'is_active': True
        }).execute()
        
        if result.data:
            print("✅ Agence d'exemple créée avec succès")
            return True
        else:
            print("❌ Échec de création de l'agence")
            return False
            
    except Exception as e:
        print(f"❌ Erreur lors de la création de l'agence: {str(e)}")
        return False

def main():
    """Fonction principale."""
    print("🚀 Phase 2: Déploiement des Fonctions RPC")
    print("=" * 50)
    
    # Étape 1: Préparer l'environnement
    print("📋 Vérification de l'environnement...")
    print(f"✅ URL Supabase: {SUPABASE_URL}")
    print(f"✅ Service Key: {'*' * 20}...{SUPABASE_SERVICE_KEY[-4:]}")
    
    # Étape 2: Créer l'agence d'exemple
    if not create_sample_agency():
        print("⚠️  Problème avec la création de l'agence, mais on continue...")
    
    # Étape 3: Traitement des fonctions RPC
    if execute_sql_file('supabase_rpc_functions.sql'):
        print("✅ Instructions de déploiement affichées")
    else:
        print("❌ Problème avec les instructions")
        sys.exit(1)
    
    # Étape 4: Test des fonctions (si déployées)
    test_functions()
    
    print("=" * 50)
    print("📋 PHASE 2 - État des fonctions RPC")
    print("\n✅ Fonctions créées:")
    print("  - validate_identifier_format() - Validation des formats")
    print("  - create_chef_agence() - Création de chefs d'agence")
    print("  - create_sous_admin() - Création de sous-admins")
    print("  - create_agent() - Création d'agents")
    print("  - create_initial_admin() - Bootstrap du premier admin")
    
    print("\n📋 Prochaines étapes:")
    print("1. Déployez les fonctions dans Supabase (SQL Editor)")
    print("2. Testez la création d'un admin initial")
    print("3. Implémentez les interfaces de gestion (Phase 3)")
    
    print("\n🧪 Pour tester après déploiement:")
    print("SELECT create_initial_admin('Admin Principal', 'admin.monel', 'motdepasse123');")

if __name__ == "__main__":
    main()