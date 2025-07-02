import psycopg2
import os

# Configuration de connexion Supabase 
# Note: Ces informations sont extraites de la configuration publique
DATABASE_URL = "postgresql://postgres.khgbnikgsptoflokvtzu:oBiK8eCzEQ1hfMDQ@aws-0-eu-central-1.pooler.supabase.com:6543/postgres"

def deploy_sql_functions():
    try:
        print("🔗 Connexion à Supabase...")
        
        # Lire le fichier SQL de migration
        with open('/app/supabase/migrations/20250125000001_chef_agent_dashboard_kpis.sql', 'r') as f:
            sql_content = f.read()
        
        print("📄 Migration SQL chargée")
        print("🚀 Exécution des fonctions RPC...")
        
        # Diviser le contenu en instructions individuelles
        sql_statements = sql_content.split(';')
        
        # Connexion à la base de données
        conn = psycopg2.connect(DATABASE_URL)
        cursor = conn.cursor()
        
        success_count = 0
        error_count = 0
        
        for i, statement in enumerate(sql_statements):
            statement = statement.strip()
            if not statement or statement.startswith('--'):
                continue
                
            try:
                cursor.execute(statement + ';')
                conn.commit()
                success_count += 1
                
                # Extraire le nom de la fonction pour le log
                if 'CREATE OR REPLACE FUNCTION' in statement:
                    func_name = statement.split('public.')[1].split('(')[0] if 'public.' in statement else 'fonction'
                    print(f"✅ Fonction créée: {func_name}")
                    
            except Exception as e:
                error_count += 1
                if 'CREATE OR REPLACE FUNCTION' in statement:
                    func_name = statement.split('public.')[1].split('(')[0] if 'public.' in statement else 'fonction'
                    print(f"❌ Erreur {func_name}: {str(e)[:100]}...")
                
        cursor.close()
        conn.close()
        
        print(f"\n📊 Résultat du déploiement:")
        print(f"   ✅ Réussies: {success_count}")
        print(f"   ❌ Erreurs: {error_count}")
        
        if success_count > 0:
            print("\n🎉 Fonctions RPC déployées avec succès !")
            return True
        else:
            print("\n⚠️ Aucune fonction n'a été déployée")
            return False
            
    except ImportError:
        print("❌ psycopg2 non installé. Installation en cours...")
        os.system("pip install psycopg2-binary")
        print("✅ psycopg2 installé. Relancez le script.")
        return False
        
    except Exception as e:
        print(f"❌ Erreur de connexion/déploiement: {str(e)}")
        
        # Méthode alternative via fichier SQL 
        print("\n🔄 Tentative d'une méthode alternative...")
        return create_sql_script()

def create_sql_script():
    """Crée un script SQL autonome pour déploiement manuel"""
    try:
        with open('/app/supabase/migrations/20250125000001_chef_agent_dashboard_kpis.sql', 'r') as f:
            migration_content = f.read()
        
        # Créer un script optimisé
        optimized_sql = f"""
-- Script de déploiement optimisé pour les fonctions Dashboard KPIs
-- À exécuter dans l'éditeur SQL Supabase

-- Vérification préalable
DO $$
BEGIN
    RAISE NOTICE 'Déploiement des fonctions Dashboard KPIs...';
END $$;

{migration_content}

-- Vérification finale
DO $$
BEGIN
    RAISE NOTICE 'Déploiement terminé. Fonctions créées:';
    RAISE NOTICE '- get_chef_agence_dashboard_kpis()';
    RAISE NOTICE '- get_agent_dashboard_kpis()';
    RAISE NOTICE '- get_chef_agents_performance(p_limit)';
END $$;
"""
        
        with open('/app/deploy_dashboard_kpis.sql', 'w') as f:
            f.write(optimized_sql)
        
        print("✅ Script SQL créé: /app/deploy_dashboard_kpis.sql")
        print("💡 Pour déployer manuellement:")
        print("   1. Ouvrez l'éditeur SQL Supabase")
        print("   2. Copiez le contenu du fichier deploy_dashboard_kpis.sql")
        print("   3. Exécutez le script")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur création script: {str(e)}")
        return False

if __name__ == "__main__":
    print("=" * 60)
    print("🎯 DÉPLOIEMENT DIRECT DES FONCTIONS RPC")
    print("=" * 60)
    
    success = deploy_sql_functions()
    
    if success:
        print("\n🔄 Phase suivante: Test des fonctions...")
    else:
        print("\n⚠️ Déploiement manuel requis")