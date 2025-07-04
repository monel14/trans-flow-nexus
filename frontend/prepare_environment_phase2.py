#!/usr/bin/env python3
"""
Script de préparation de l'environnement pour Phase 2.
Crée les données de base nécessaires.
"""

from supabase import create_client, Client

# Configuration
SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"

supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)

def create_sample_agencies():
    """Crée des agences d'exemple pour les tests."""
    print("🏢 Création des agences d'exemple...")
    
    agencies = [
        {
            'name': 'Agence Dakar Centre',
            'city': 'Dakar',
            'is_active': True
        },
        {
            'name': 'Agence Lomé Principal', 
            'city': 'Lomé',
            'is_active': True
        },
        {
            'name': 'Agence Abidjan Nord',
            'city': 'Abidjan', 
            'is_active': True
        }
    ]
    
    created_count = 0
    
    for agency in agencies:
        try:
            # Vérifier si l'agence existe déjà
            existing = supabase.table('agencies').select('id').eq('name', agency['name']).execute()
            
            if existing.data:
                print(f"  ✅ {agency['name']}: existe déjà")
            else:
                # Créer l'agence
                result = supabase.table('agencies').insert(agency).execute()
                if result.data:
                    print(f"  ✅ {agency['name']}: créée avec succès")
                    created_count += 1
                else:
                    print(f"  ❌ {agency['name']}: échec de création")
                    
        except Exception as e:
            print(f"  ❌ {agency['name']}: erreur {str(e)}")
    
    print(f"📊 Agences créées: {created_count}")
    return created_count > 0

def verify_roles():
    """Vérifie que tous les rôles nécessaires existent."""
    print("\n🔐 Vérification des rôles...")
    
    required_roles = ['admin_general', 'chef_agence', 'sous_admin', 'agent', 'developer']
    
    try:
        result = supabase.table('roles').select('name').execute()
        existing_roles = [role['name'] for role in result.data] if result.data else []
        
        missing_roles = []
        for role in required_roles:
            if role in existing_roles:
                print(f"  ✅ {role}: existe")
            else:
                print(f"  ❌ {role}: manquant")
                missing_roles.append(role)
        
        if missing_roles:
            print(f"\n⚠️  Rôles manquants: {', '.join(missing_roles)}")
            print("Les rôles doivent être créés via les migrations existantes")
            return False
        else:
            print("✅ Tous les rôles requis sont présents")
            return True
            
    except Exception as e:
        print(f"❌ Erreur lors de la vérification: {str(e)}")
        return False

def cleanup_test_users():
    """Nettoie les utilisateurs de test existants."""
    print("\n🧹 Nettoyage des utilisateurs de test...")
    
    try:
        # Supprimer les user_roles de test
        test_identifiers = ['admin.monel', 'chef.dakar.diallo', 'dkr01.fatou', 'sadmin.pierre']
        
        for identifier in test_identifiers:
            # Trouver l'utilisateur par email (qui contient l'identifiant)
            user_result = supabase.table('profiles').select('id').eq('email', identifier).execute()
            
            if user_result.data:
                user_id = user_result.data[0]['id']
                
                # Supprimer user_roles
                supabase.table('user_roles').delete().eq('user_id', user_id).execute()
                
                # Supprimer profile
                supabase.table('profiles').delete().eq('id', user_id).execute()
                
                print(f"  ✅ Utilisateur {identifier}: nettoyé")
            else:
                print(f"  ✅ Utilisateur {identifier}: n'existe pas")
        
        print("✅ Nettoyage terminé")
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors du nettoyage: {str(e)}")
        return False

def main():
    """Fonction principale."""
    print("🚀 Préparation de l'Environnement - Phase 2")
    print("=" * 50)
    
    success_count = 0
    total_tasks = 3
    
    # Tâche 1: Vérifier les rôles
    if verify_roles():
        success_count += 1
    
    # Tâche 2: Créer les agences
    if create_sample_agencies():
        success_count += 1
    
    # Tâche 3: Nettoyer les utilisateurs de test
    if cleanup_test_users():
        success_count += 1
    
    print("=" * 50)
    print(f"📊 Préparation: {success_count}/{total_tasks} tâches réussies")
    
    if success_count == total_tasks:
        print("✅ Environnement prêt pour les tests Phase 2!")
        print("\n📋 Prochaines étapes:")
        print("1. Déployez les fonctions RPC via DEPLOYMENT_GUIDE_PHASE2.md")
        print("2. Testez avec: python test_rpc_availability.py")
        print("3. Créez l'admin initial")
    else:
        print("⚠️  Problèmes détectés dans la préparation")
        print("Vérifiez les erreurs ci-dessus avant de continuer")

if __name__ == "__main__":
    main()