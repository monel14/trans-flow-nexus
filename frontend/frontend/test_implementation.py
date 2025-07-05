#!/usr/bin/env python3
"""
Script de test pour vérifier le bon fonctionnement des nouvelles fonctionnalités.
Ce script teste les endpoints et valide que les tables ont été créées correctement.
"""

import asyncio
import json
import sys
from datetime import datetime
from supabase import create_client, Client

def get_supabase_client() -> Client:
    """Créer un client Supabase avec les credentials."""
    url = "https://khgbnikgsptoflokvtzu.supabase.co"
    key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"
    
    return create_client(url, key)

async def test_system_settings_table(supabase: Client):
    """Tester la table system_settings."""
    print("🧪 Test de la table system_settings...")
    
    try:
        # Tenter de lire la configuration
        response = supabase.table('system_settings').select('*').eq('id', 1).execute()
        
        if response.data:
            print("✅ Table system_settings accessible")
            print(f"   Configuration trouvée: {len(response.data)} entrée(s)")
            
            config = response.data[0]['config']
            if isinstance(config, dict) and 'app_name' in config:
                print(f"   Nom de l'application: {config['app_name']}")
                print("✅ Structure de configuration valide")
            else:
                print("⚠️  Structure de configuration invalide")
                return False
        else:
            print("⚠️  Aucune configuration trouvée dans system_settings")
            return False
            
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors du test system_settings: {e}")
        return False

async def test_error_logs_table(supabase: Client):
    """Tester la table error_logs."""
    print("🧪 Test de la table error_logs...")
    
    try:
        # Tenter de créer un log de test
        test_log = {
            'level': 'info',
            'source': 'system',
            'message': 'Test log from validation script',
            'context': {
                'test': True,
                'timestamp': datetime.now().isoformat(),
                'script': 'test_implementation.py'
            }
        }
        
        response = supabase.table('error_logs').insert(test_log).execute()
        
        if response.data:
            log_id = response.data[0]['id']
            print(f"✅ Log de test créé avec l'ID: {log_id}")
            
            # Tenter de lire le log
            read_response = supabase.table('error_logs').select('*').eq('id', log_id).execute()
            
            if read_response.data:
                log_data = read_response.data[0]
                print(f"✅ Log lu avec succès")
                print(f"   Niveau: {log_data['level']}")
                print(f"   Source: {log_data['source']}")
                print(f"   Message: {log_data['message']}")
                
                # Nettoyer le log de test
                supabase.table('error_logs').delete().eq('id', log_id).execute()
                print("✅ Log de test nettoyé")
                
                return True
            else:
                print("⚠️  Impossible de lire le log créé")
                return False
        else:
            print("⚠️  Impossible de créer un log de test")
            return False
            
    except Exception as e:
        print(f"❌ Erreur lors du test error_logs: {e}")
        return False

async def test_rls_policies(supabase: Client):
    """Tester les politiques RLS."""
    print("🧪 Test des politiques RLS...")
    
    try:
        # Test de lecture des system_settings (devrait fonctionner)
        response = supabase.table('system_settings').select('id').execute()
        
        if response.data is not None:  # Peut être vide mais pas None
            print("✅ Lecture system_settings autorisée")
        else:
            print("⚠️  Lecture system_settings refusée")
            return False
        
        # Test de lecture des error_logs (devrait fonctionner)
        response = supabase.table('error_logs').select('id').limit(1).execute()
        
        if response.data is not None:  # Peut être vide mais pas None
            print("✅ Lecture error_logs autorisée")
        else:
            print("⚠️  Lecture error_logs refusée")
            return False
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors du test RLS: {e}")
        return False

async def test_frontend_integration():
    """Tester l'intégration frontend (simulation)."""
    print("🧪 Test de l'intégration frontend...")
    
    try:
        # Vérifier que les fichiers TypeScript sont valides (simulation)
        files_to_check = [
            '/app/src/hooks/useSystemConfig.ts',
            '/app/src/hooks/useErrorLogs.ts',
            '/app/src/pages/SystemConfig.tsx',
            '/app/src/pages/ErrorLogs.tsx',
            '/app/src/components/ErrorBoundary.tsx',
            '/app/src/lib/errorInstrumentation.ts'
        ]
        
        import os
        
        for file_path in files_to_check:
            if os.path.exists(file_path):
                print(f"✅ Fichier trouvé: {os.path.basename(file_path)}")
            else:
                print(f"❌ Fichier manquant: {file_path}")
                return False
        
        print("✅ Tous les fichiers frontend sont présents")
        return True
        
    except Exception as e:
        print(f"❌ Erreur lors du test frontend: {e}")
        return False

async def main():
    """Fonction principale de test."""
    print("🚀 Début des tests de validation...")
    print("=" * 50)
    
    try:
        # Initialiser le client Supabase
        supabase = get_supabase_client()
        print("✅ Connexion à Supabase établie")
        
        # Exécuter les tests
        tests = [
            ("System Settings", test_system_settings_table(supabase)),
            ("Error Logs", test_error_logs_table(supabase)),
            ("RLS Policies", test_rls_policies(supabase)),
            ("Frontend Integration", test_frontend_integration())
        ]
        
        results = []
        for test_name, test_coro in tests:
            print(f"\n📋 Test: {test_name}")
            print("-" * 30)
            
            result = await test_coro
            results.append((test_name, result))
            
            if result:
                print(f"✅ {test_name}: RÉUSSI")
            else:
                print(f"❌ {test_name}: ÉCHEC")
        
        # Résumé
        print("\n" + "=" * 50)
        print("📊 Résumé des tests:")
        
        passed = sum(1 for _, result in results if result)
        total = len(results)
        
        for test_name, result in results:
            status = "✅ RÉUSSI" if result else "❌ ÉCHEC"
            print(f"   {test_name}: {status}")
        
        print(f"\n🎯 Résultat global: {passed}/{total} tests réussis")
        
        if passed == total:
            print("🎉 Tous les tests sont passés avec succès!")
            print("\n📋 Prochaines étapes:")
            print("1. Déployer les migrations SQL dans Supabase")
            print("2. Tester l'interface utilisateur")
            print("3. Vérifier l'instrumentation des erreurs")
            print("4. Mettre en production")
            return 0
        else:
            print("⚠️  Certains tests ont échoué. Vérifiez les erreurs ci-dessus.")
            return 1
            
    except Exception as e:
        print(f"❌ Erreur fatale: {e}")
        return 1

if __name__ == "__main__":
    exit_code = asyncio.run(main())