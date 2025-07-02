#!/usr/bin/env python3
"""
Script pour déployer les nouvelles migrations Supabase.
Ce script exécute les migrations SQL pour créer les tables system_settings et error_logs.
"""

import os
import sys
from supabase import create_client, Client

def get_supabase_client() -> Client:
    """Créer un client Supabase avec les credentials d'environnement."""
    url = "https://khgbnikgsptoflokvtzu.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"
    
    if not url or not key:
        raise ValueError("Les variables d'environnement SUPABASE_URL et SUPABASE_KEY sont requises")
    
    return create_client(url, key)

def read_migration_file(filepath: str) -> str:
    """Lire le contenu d'un fichier de migration."""
    try:
        with open(filepath, 'r', encoding='utf-8') as f:
            return f.read()
    except FileNotFoundError:
        raise FileNotFoundError(f"Fichier de migration non trouvé: {filepath}")

def execute_migration(supabase: Client, migration_content: str, migration_name: str) -> bool:
    """Exécuter une migration SQL."""
    try:
        print(f"📦 Exécution de la migration: {migration_name}")
        
        # Note: Supabase client ne permet pas d'exécuter du SQL brut directement
        # Cette méthode est pour illustration - en production, utilisez l'interface Supabase
        # ou un client SQL direct avec les credentials appropriés
        
        print(f"⚠️  Migration {migration_name} doit être exécutée manuellement via l'interface Supabase")
        print("SQL à exécuter:")
        print("-" * 50)
        print(migration_content)
        print("-" * 50)
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de l'exécution de {migration_name}: {e}")
        return False

def main():
    """Fonction principale pour déployer les migrations."""
    print("🚀 Déploiement des migrations Supabase...")
    
    try:
        # Initialiser le client Supabase
        supabase = get_supabase_client()
        print("✅ Connexion à Supabase établie")
        
        # Définir les migrations à exécuter
        migrations_dir = os.path.join(os.path.dirname(__file__), 'supabase', 'migrations')
        migrations = [
            '20250115000001_system_settings_table.sql',
            '20250115000002_error_logs_table.sql'
        ]
        
        success_count = 0
        
        for migration_file in migrations:
            migration_path = os.path.join(migrations_dir, migration_file)
            
            if not os.path.exists(migration_path):
                print(f"⚠️  Fichier de migration non trouvé: {migration_path}")
                continue
                
            migration_content = read_migration_file(migration_path)
            
            if execute_migration(supabase, migration_content, migration_file):
                success_count += 1
            else:
                print(f"❌ Échec de la migration: {migration_file}")
        
        print(f"\n📊 Résumé: {success_count}/{len(migrations)} migrations préparées")
        
        if success_count == len(migrations):
            print("✅ Toutes les migrations sont prêtes à être déployées!")
            print("\n📋 Instructions de déploiement:")
            print("1. Connectez-vous à votre dashboard Supabase")
            print("2. Allez dans l'onglet 'SQL Editor'")
            print("3. Exécutez les migrations SQL affichées ci-dessus dans l'ordre")
            print("4. Vérifiez que les tables ont été créées correctement")
        else:
            print("⚠️  Certaines migrations ont échoué. Vérifiez les erreurs ci-dessus.")
            sys.exit(1)
            
    except Exception as e:
        print(f"❌ Erreur fatale: {e}")
        sys.exit(1)

if __name__ == "__main__":
    main()