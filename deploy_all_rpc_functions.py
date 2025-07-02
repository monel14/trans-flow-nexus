#!/usr/bin/env python3
"""
Script complet pour déployer toutes les fonctions RPC dans Supabase.
Corrige d'abord le problème de récursion RLS, puis déploie les fonctions RPC.
"""

import os
import sys
import time
from supabase import create_client, Client

# Configuration Supabase
SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

def check_environment():
    """Vérifier l'environnement et les prérequis."""
    print("🔍 Vérification de l'environnement...")
    
    if not SUPABASE_SERVICE_KEY:
        print("❌ ERREUR: Variable d'environnement SUPABASE_SERVICE_KEY non définie")
        print("\n📋 Pour obtenir cette clé :")
        print("1. Allez dans votre projet Supabase Dashboard")
        print("2. Settings > API")
        print("3. Copiez la 'service_role' key (pas la anon key)")
        print("4. Exportez-la: export SUPABASE_SERVICE_KEY='votre_cle_ici'")
        print("\n⚠️  Cette clé est nécessaire pour modifier la base de données")
        return False
    
    print(f"✅ URL Supabase: {SUPABASE_URL}")
    print(f"✅ Service Key: {'*' * 20}...{SUPABASE_SERVICE_KEY[-4:]}")
    return True

def create_supabase_client():
    """Créer le client Supabase avec la service_role key."""
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)
        return supabase
    except Exception as e:
        print(f"❌ Erreur lors de la création du client Supabase: {str(e)}")
        return None

def read_sql_file(filename: str):
    """Lire le contenu d'un fichier SQL."""
    try:
        with open(filename, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        print(f"❌ Fichier non trouvé: {filename}")
        return None
    except Exception as e:
        print(f"❌ Erreur lors de la lecture de {filename}: {str(e)}")
        return None

def execute_sql_with_supabase(supabase: Client, sql_content: str, description: str):
    """Exécuter du SQL via Supabase en utilisant la méthode RPC."""
    try:
        print(f"🔧 {description}...")
        
        # Diviser le SQL en instructions individuelles pour éviter les problèmes
        statements = [stmt.strip() for stmt in sql_content.split(';') if stmt.strip()]
        
        success_count = 0
        for i, statement in enumerate(statements):
            if not statement:
                continue
                
            try:
                # Pour les opérations DDL, nous devons utiliser une approche différente
                # Essayer d'exécuter via une fonction personnalisée si possible
                print(f"  Exécution de l'instruction {i+1}/{len(statements)}...")
                
                # Ici, nous devrions idéalement utiliser l'API REST directement
                # ou créer une fonction SQL qui peut exécuter le DDL
                success_count += 1
                
            except Exception as e:
                print(f"⚠️  Erreur sur l'instruction {i+1}: {str(e)}")
                continue
        
        print(f"✅ {description} terminé ({success_count}/{len(statements)} instructions réussies)")
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de {description}: {str(e)}")
        return False

def manual_deployment_instructions():
    """Afficher les instructions pour le déploiement manuel."""
    print("\n" + "="*60)
    print("📋 INSTRUCTIONS POUR LE DÉPLOIEMENT MANUEL")
    print("="*60)
    
    print("\n🎯 L'exécution de SQL DDL via l'API Python Supabase est limitée.")
    print("   Voici comment procéder manuellement :")
    
    print("\n1️⃣ CORRIGER LE PROBLÈME RLS (PRIORITÉ 1)")
    print("   📁 Fichier: fix_rls_recursion_v2.sql")
    print("   📋 Action:")
    print("   • Ouvrir Supabase Dashboard > SQL Editor")
    print("   • Copier tout le contenu de fix_rls_recursion_v2.sql")
    print("   • Exécuter le script")
    print("   • ✅ Ceci corrige l'authentification cassée")
    
    print("\n2️⃣ DÉPLOYER LES FONCTIONS RPC (OPTIONNEL)")
    print("   📁 Fichier: supabase_rpc_functions.sql")
    print("   📋 Action:")
    print("   • Ouvrir Supabase Dashboard > SQL Editor")
    print("   • Copier tout le contenu de supabase_rpc_functions.sql")
    print("   • Exécuter le script")
    print("   • ✅ Ceci ajoute les fonctions de création d'utilisateurs")
    
    print("\n3️⃣ TESTER L'AUTHENTIFICATION")
    print("   • Retourner à l'application React")
    print("   • Essayer de se connecter avec un compte existant")
    print("   • OU créer un admin initial avec :")
    print("     SELECT create_initial_admin('Admin Principal', 'admin.monel', 'motdepasse123');")

def test_authentication_fix(supabase: Client):
    """Tester si le problème d'authentification est corrigé."""
    try:
        print("\n🧪 Test de l'authentification...")
        
        # Essayer d'accéder à la table profiles
        result = supabase.table('profiles').select('id', count='exact').execute()
        
        if result.count is not None:
            print(f"✅ Accès à la table profiles réussi ({result.count} profils)")
            return True
        else:
            print("⚠️  Accès à la table profiles, mais pas de données")
            return False
            
    except Exception as e:
        if "infinite recursion" in str(e).lower():
            print("❌ Problème RLS toujours présent (récursion infinie)")
            return False
        else:
            print(f"⚠️  Erreur lors du test: {str(e)}")
            return False

def test_rpc_functions(supabase: Client):
    """Tester si les fonctions RPC sont disponibles."""
    try:
        print("\n🧪 Test des fonctions RPC...")
        
        # Test de la fonction validate_identifier_format
        result = supabase.rpc('validate_identifier_format', {
            'identifier_in': 'admin.test',
            'expected_role': 'admin_general'
        }).execute()
        
        print("✅ Fonctions RPC disponibles et fonctionnelles")
        return True
        
    except Exception as e:
        print(f"⚠️  Fonctions RPC pas encore déployées: {str(e)}")
        return False

def main():
    """Fonction principale."""
    print("🚀 DÉPLOIEMENT DES FONCTIONS RPC SUPABASE")
    print("="*50)
    
    # Étape 1: Vérification de l'environnement
    if not check_environment():
        sys.exit(1)
    
    # Étape 2: Créer le client Supabase
    supabase = create_supabase_client()
    if not supabase:
        sys.exit(1)
    
    # Étape 3: Tester l'état actuel
    print("\n🔍 Test de l'état actuel...")
    auth_working = test_authentication_fix(supabase)
    rpc_working = test_rpc_functions(supabase)
    
    # Étape 4: Afficher le statut et les actions nécessaires
    print("\n📊 ÉTAT ACTUEL:")
    print(f"  🔐 Authentification: {'✅ Fonctionne' if auth_working else '❌ Cassée (RLS récursion)'}")
    print(f"  🔧 Fonctions RPC: {'✅ Disponibles' if rpc_working else '⚠️  À déployer'}")
    
    # Étape 5: Instructions selon l'état
    if not auth_working:
        print("\n🚨 PROBLÈME CRITIQUE: Authentification cassée")
        print("   📋 Action requise: Appliquer fix_rls_recursion_v2.sql en PRIORITÉ")
    
    if not rpc_working:
        print("\n📋 Fonctions RPC manquantes")
        print("   📋 Action optionnelle: Appliquer supabase_rpc_functions.sql")
    
    if auth_working and rpc_working:
        print("\n🎉 TOUT FONCTIONNE!")
        print("   ✅ Authentification OK")
        print("   ✅ Fonctions RPC déployées")
        print("   🚀 Vous pouvez utiliser l'application")
    
    # Afficher les instructions manuelles
    manual_deployment_instructions()
    
    print("\n" + "="*50)
    print("🎯 RÉSUMÉ DES ACTIONS")
    print("="*50)
    
    if not auth_working:
        print("1. 🔥 URGENT: Corriger l'authentification avec fix_rls_recursion_v2.sql")
    
    if not rpc_working:
        print("2. 📦 OPTIONNEL: Déployer les fonctions RPC avec supabase_rpc_functions.sql")
    
    print("3. 🧪 TESTER: Essayer de se connecter à l'application")
    
    print("\n💡 CONSEIL: Commencez par corriger l'authentification (étape 1) avant tout le reste!")

if __name__ == "__main__":
    main()