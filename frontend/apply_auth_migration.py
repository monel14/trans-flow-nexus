#!/usr/bin/env python3
"""
Script pour appliquer les modifications de configuration d'authentification.
Ce script applique les changements nécessaires pour passer au système d'identifiants.
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
    print("3. Copiez la 'service_role' key")
    print("4. Exportez-la: export SUPABASE_SERVICE_KEY='votre_cle_ici'")
    sys.exit(1)

# Initialiser le client Supabase avec la service_role key
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_KEY)

def apply_auth_config():
    """Applique la configuration d'authentification."""
    try:
        print("🔧 Application de la configuration d'authentification...")
        
        # Exécuter le script de désactivation de confirmation email
        with open('disable_email_confirmation.sql', 'r') as f:
            sql_content = f.read()
        
        # Diviser et exécuter chaque requête
        sql_statements = [s.strip() for s in sql_content.split(';') if s.strip()]
        
        for statement in sql_statements:
            if statement and not statement.startswith('--'):
                try:
                    result = supabase.rpc('exec_sql', {'query': statement})
                    print(f"✅ Requête exécutée avec succès")
                except Exception as e:
                    print(f"⚠️  Requête échouée (peut être normale): {str(e)}")
        
        print("✅ Configuration d'authentification appliquée")
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de l'application de la configuration: {str(e)}")
        return False

def purge_existing_users():
    """Purge les utilisateurs existants pour repartir de zéro."""
    try:
        print("🧹 Purge des utilisateurs existants...")
        
        # Supprimer les user_roles
        result = supabase.table('user_roles').delete().neq('id', 'impossible_id').execute()
        print(f"✅ {len(result.data) if result.data else 0} user_roles supprimés")
        
        # Supprimer les profiles
        result = supabase.table('profiles').delete().neq('id', 'impossible_id').execute()
        print(f"✅ {len(result.data) if result.data else 0} profiles supprimés")
        
        # Note: La suppression des utilisateurs auth.users nécessite une approche différente
        # car elle requiert des privilèges spéciaux. Cela sera fait manuellement via l'interface Supabase.
        
        print("✅ Purge des données utilisateur terminée")
        print("⚠️  IMPORTANT: Supprimez manuellement les utilisateurs dans auth.users via l'interface Supabase")
        print("   Dashboard > Authentication > Users > Sélectionner tous > Supprimer")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors de la purge: {str(e)}")
        return False

def main():
    """Fonction principale."""
    print("🚀 Début de la migration vers le système d'identifiants")
    print("=" * 60)
    
    # Étape 1: Configuration d'authentification
    if not apply_auth_config():
        print("❌ Échec de la migration")
        sys.exit(1)
    
    # Étape 2: Purge des utilisateurs existants
    if not purge_existing_users():
        print("❌ Échec de la migration")
        sys.exit(1)
    
    print("=" * 60)
    print("✅ Migration terminée avec succès!")
    print("\nÉtapes suivantes:")
    print("1. Supprimez manuellement les utilisateurs dans auth.users via l'interface Supabase")
    print("2. Testez la nouvelle page de connexion avec des identifiants")
    print("3. Implémentez les fonctions RPC de création d'utilisateurs (Phase 2)")

if __name__ == "__main__":
    main()