#!/usr/bin/env python3
"""
Script pour déployer les fonctions RPC via l'API REST Supabase.
Utilise l'endpoint SQL direct pour exécuter du DDL.
"""

import os
import requests
import json

SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_SERVICE_KEY = os.getenv('SUPABASE_SERVICE_KEY')

def execute_sql_via_rest(sql_content: str, description: str):
    """Exécuter du SQL via l'API REST Supabase."""
    try:
        print(f"🔧 {description}...")
        
        # Endpoint pour exécuter du SQL brut
        url = f"{SUPABASE_URL}/rest/v1/rpc/exec_sql"
        
        headers = {
            'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY
        }
        
        # Préparer le payload
        payload = {
            'sql': sql_content
        }
        
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code == 200:
            print(f"✅ {description} - Succès")
            return True
        else:
            print(f"⚠️ {description} - Code: {response.status_code}")
            print(f"Réponse: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Erreur lors de {description}: {str(e)}")
        return False

def execute_sql_statements(sql_content: str, description: str):
    """Exécuter les instructions SQL une par une."""
    try:
        print(f"🔧 {description}...")
        
        # Diviser le SQL en instructions
        statements = []
        current_statement = ""
        in_function = False
        
        lines = sql_content.split('\n')
        
        for line in lines:
            line = line.strip()
            
            # Ignorer les commentaires et lignes vides
            if not line or line.startswith('--'):
                continue
            
            current_statement += line + '\n'
            
            # Détecter le début d'une fonction
            if 'CREATE OR REPLACE FUNCTION' in line.upper():
                in_function = True
            
            # Détecter la fin d'une fonction
            if in_function and line.endswith('$$;'):
                in_function = False
                statements.append(current_statement.strip())
                current_statement = ""
            elif not in_function and line.endswith(';'):
                statements.append(current_statement.strip())
                current_statement = ""
        
        if current_statement.strip():
            statements.append(current_statement.strip())
        
        print(f"📋 {len(statements)} instructions SQL à exécuter")
        
        success_count = 0
        for i, statement in enumerate(statements):
            if not statement:
                continue
            
            try:
                # Essayer d'exécuter chaque instruction via l'API
                url = f"{SUPABASE_URL}/rest/v1/rpc/sql"
                
                headers = {
                    'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
                    'Content-Type': 'text/plain',
                    'apikey': SUPABASE_SERVICE_KEY
                }
                
                response = requests.post(url, headers=headers, data=statement)
                
                if response.status_code in [200, 201]:
                    print(f"  ✅ Instruction {i+1}: Succès")
                    success_count += 1
                else:
                    print(f"  ⚠️ Instruction {i+1}: {response.status_code} - {response.text[:100]}")
                
            except Exception as e:
                print(f"  ❌ Instruction {i+1}: {str(e)}")
        
        print(f"✅ {description} terminé ({success_count}/{len(statements)} succès)")
        return success_count > 0
        
    except Exception as e:
        print(f"❌ Erreur lors de {description}: {str(e)}")
        return False

def main():
    """Déployer les fonctions RPC."""
    print("🚀 DÉPLOIEMENT DES FONCTIONS RPC")
    print("="*40)
    
    if not SUPABASE_SERVICE_KEY:
        print("❌ SUPABASE_SERVICE_KEY non définie")
        return
    
    # Lire le fichier des fonctions RPC
    try:
        with open('supabase_rpc_functions.sql', 'r', encoding='utf-8') as f:
            sql_content = f.read()
    except Exception as e:
        print(f"❌ Erreur lecture fichier: {e}")
        return
    
    # Essayer différentes méthodes de déploiement
    success = execute_sql_statements(sql_content, "Déploiement des fonctions RPC")
    
    if success:
        print("\n🎉 DÉPLOIEMENT RÉUSSI!")
        print("✅ Les fonctions RPC ont été déployées")
    else:
        print("\n⚠️ DÉPLOIEMENT PARTIEL")
        print("Certaines fonctions peuvent avoir été créées")
    
    # Test des fonctions
    print("\n🧪 Test des fonctions déployées...")
    test_functions()

def test_functions():
    """Tester les fonctions RPC déployées."""
    try:
        import requests
        
        url = f"{SUPABASE_URL}/rest/v1/rpc/validate_identifier_format"
        
        headers = {
            'Authorization': f'Bearer {SUPABASE_SERVICE_KEY}',
            'Content-Type': 'application/json',
            'apikey': SUPABASE_SERVICE_KEY
        }
        
        payload = {
            'identifier_in': 'admin.test',
            'expected_role': 'admin_general'
        }
        
        response = requests.post(url, headers=headers, json=payload)
        
        if response.status_code == 200:
            print("✅ Fonction validate_identifier_format disponible")
            print(f"   Résultat: {response.json()}")
        else:
            print(f"⚠️ Test fonction: {response.status_code} - {response.text}")
            
    except Exception as e:
        print(f"⚠️ Erreur test: {e}")

if __name__ == "__main__":
    main()