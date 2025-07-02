#!/usr/bin/env python3
"""
Script d'aide pour préparer les fichiers SQL à copier-coller dans Supabase.
Affiche le contenu formaté prêt à être copié.
"""

def read_and_display_sql(filename: str, title: str):
    """Lire et afficher un fichier SQL."""
    try:
        print(f"\n{'='*80}")
        print(f"📁 {title}")
        print(f"{'='*80}")
        
        with open(filename, 'r', encoding='utf-8') as f:
            content = f.read()
        
        print("📋 CONTENU À COPIER-COLLER DANS SUPABASE SQL EDITOR:")
        print("-" * 60)
        print(content)
        print("-" * 60)
        print(f"✅ Fin du fichier {filename}")
        
        return True
        
    except FileNotFoundError:
        print(f"❌ Fichier non trouvé: {filename}")
        return False
    except Exception as e:
        print(f"❌ Erreur lors de la lecture de {filename}: {str(e)}")
        return False

def main():
    """Fonction principale."""
    print("📋 PRÉPARATION DES FICHIERS SQL POUR SUPABASE")
    print("="*60)
    
    print("\n🎯 Ce script vous montre le contenu des fichiers SQL à appliquer dans Supabase.")
    print("   Copiez-collez chaque section dans le SQL Editor de Supabase.")
    
    # 1. Correction RLS (PRIORITÉ 1)
    print("\n1️⃣ ÉTAPE 1 - CORRECTION RLS (PRIORITÉ ABSOLUE)")
    print("   ⚠️  SANS CECI, L'AUTHENTIFICATION NE FONCTIONNE PAS")
    
    read_and_display_sql('fix_rls_recursion_v2.sql', 'CORRECTION RLS - À APPLIQUER EN PREMIER')
    
    # 2. Fonctions RPC (OPTIONNEL)
    print("\n2️⃣ ÉTAPE 2 - FONCTIONS RPC (OPTIONNEL)")
    print("   📦 Ces fonctions permettent de créer des utilisateurs via l'interface")
    
    read_and_display_sql('supabase_rpc_functions.sql', 'FONCTIONS RPC - CRÉATION D\'UTILISATEURS')
    print("\n✅ Toutes les sections ont été affichées!")
    
    print("\n" + "="*60)
    print("🎉 DÉPLOIEMENT TERMINÉ")
    print("="*60)
    
    print("\n📋 PROCHAINES ÉTAPES:")
    print("1. ✅ Vérifier que les corrections RLS ont été appliquées")
    print("2. 🧪 Tester l'authentification dans l'application React")
    print("3. 📦 (Optionnel) Tester les fonctions RPC si déployées")
    
    print("\n🔗 ACCÈS À SUPABASE:")
    print(f"   Dashboard: https://supabase.com/dashboard/project/khgbnikgsptoflokvtzu")
    print(f"   SQL Editor: https://supabase.com/dashboard/project/khgbnikgsptoflokvtzu/sql")
    
    print("\n💡 CONSEIL:")
    print("   Si l'authentification fonctionne après l'étape 1, vous pouvez")
    print("   ignorer l'étape 2 pour l'instant et utiliser l'application normalement.")

if __name__ == "__main__":
    main()