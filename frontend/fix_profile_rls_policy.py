#!/usr/bin/env python3
"""
Script pour corriger les politiques RLS manquantes sur la table profiles
Permet aux utilisateurs de lire leur propre profil pour résoudre l'erreur 406.
"""

import os
from supabase import create_client, Client

# Configuration Supabase
SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"

# Clé service_role pour les opérations admin (nécessaire pour créer des politiques RLS)
SUPABASE_SERVICE_ROLE_KEY = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')

def check_current_policies():
    """Vérifie les politiques RLS actuelles sur la table profiles"""
    print("🔍 Vérification des politiques RLS actuelles...")
    
    # On utilise la clé publique pour les requêtes de base
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    try:
        # Test : essayer de faire une requête à la table profiles
        result = supabase.table('profiles').select('*').limit(1).execute()
        print(f"✅ Requête profiles réussie : {len(result.data)} lignes")
        return True
    except Exception as e:
        print(f"❌ Erreur lors de la requête profiles : {str(e)}")
        return False

def test_user_role_query():
    """Test spécifique de la requête qui pose problème dans AuthContext"""
    print("\n🔍 Test de la requête user_roles qui pose problème...")
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    try:
        # Simuler la requête problématique dans AuthContext
        result = supabase.table('user_roles').select('*, roles(name, label)').eq('is_active', True).limit(1).execute()
        print(f"✅ Requête user_roles réussie : {len(result.data)} lignes")
        
        if result.data:
            print(f"📋 Exemple de données : {result.data[0]}")
            
        return True
    except Exception as e:
        print(f"❌ Erreur lors de la requête user_roles : {str(e)}")
        return False

def create_missing_rls_policies():
    """Crée les politiques RLS manquantes si nécessaire"""
    print("\n🛠️  Création des politiques RLS manquantes...")
    
    if not SUPABASE_SERVICE_ROLE_KEY:
        print("❌ SUPABASE_SERVICE_ROLE_KEY non définie. Politique RLS à créer manuellement.")
        print("\nPolitique SQL à exécuter dans le dashboard Supabase :")
        print("=" * 60)
        print("""
-- Politique pour permettre aux utilisateurs de voir leur propre profil
CREATE POLICY "Users can view their own profile" ON public.profiles
FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de voir leurs propres rôles
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT TO authenticated
USING (auth.uid() = user_id);
        """)
        print("=" * 60)
        return False
    
    # Si on a la clé service_role, on peut créer les politiques
    supabase_admin: Client = create_client(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)
    
    policies_sql = """
    -- Politique pour permettre aux utilisateurs de voir leur propre profil
    CREATE POLICY IF NOT EXISTS "Users can view their own profile" ON public.profiles
    FOR SELECT TO authenticated
    USING (auth.uid() = id);

    -- Politique pour permettre aux utilisateurs de voir leurs propres rôles
    CREATE POLICY IF NOT EXISTS "Users can view their own roles" ON public.user_roles
    FOR SELECT TO authenticated
    USING (auth.uid() = user_id);
    """
    
    try:
        result = supabase_admin.rpc('exec', {'sql': policies_sql}).execute()
        print("✅ Politiques RLS créées avec succès")
        return True
    except Exception as e:
        print(f"❌ Erreur lors de la création des politiques : {str(e)}")
        return False

def test_demo_authentication():
    """Test d'authentification avec les comptes démo"""
    print("\n🔐 Test d'authentification avec les comptes démo...")
    
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    
    demo_accounts = [
        ("admin_monel@transflownexus.demo", "admin123"),
        ("chef_dakar_diallo@transflownexus.demo", "chef123"),
        ("dkr01_fatou@transflownexus.demo", "agent123"),
        ("sadmin_pierre@transflownexus.demo", "sadmin123")
    ]
    
    successful_logins = 0
    
    for email, password in demo_accounts:
        try:
            print(f"\n🔑 Test de connexion : {email}")
            
            # Tentative de connexion
            auth_response = supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if auth_response.user:
                print(f"✅ Connexion réussie pour {email}")
                user_id = auth_response.user.id
                
                # Test de récupération du profil
                try:
                    profile_response = supabase.table('profiles').select('*, agencies(name)').eq('id', user_id).single().execute()
                    print(f"✅ Profil récupéré : {profile_response.data.get('name', 'N/A')}")
                    
                    # Test spécifique de récupération des rôles
                    try:
                        roles_response = supabase.table('user_roles').select('*, roles(name, label)').eq('user_id', user_id).eq('is_active', True).single().execute()
                        role_name = roles_response.data.get('roles', {}).get('name', 'N/A')
                        print(f"✅ Rôle récupéré : {role_name}")
                        successful_logins += 1
                    except Exception as role_error:
                        print(f"❌ Erreur récupération rôle : {str(role_error)}")
                        
                except Exception as profile_error:
                    print(f"❌ Erreur récupération profil : {str(profile_error)}")
                
                # Déconnexion
                supabase.auth.sign_out()
                
            else:
                print(f"❌ Échec de connexion pour {email}")
                
        except Exception as e:
            print(f"❌ Erreur lors du test {email} : {str(e)}")
    
    print(f"\n📊 Résumé : {successful_logins}/{len(demo_accounts)} connexions réussies avec récupération de rôle")
    return successful_logins == len(demo_accounts)

def main():
    """Fonction principale"""
    print("🚀 Diagnostic et correction des politiques RLS pour TransFlow Nexus")
    print("=" * 70)
    
    # 1. Vérifier l'état actuel
    profiles_ok = check_current_policies()
    user_roles_ok = test_user_role_query()
    
    # 2. Si problème, proposer la correction
    if not profiles_ok or not user_roles_ok:
        print("\n⚠️  Problème détecté avec les politiques RLS")
        create_missing_rls_policies()
    
    # 3. Test d'authentification des comptes démo
    test_demo_authentication()
    
    print("\n" + "=" * 70)
    print("✅ Diagnostic terminé. Vérifiez les résultats ci-dessus.")
    
    if not profiles_ok or not user_roles_ok:
        print("\n📝 Action requise :")
        print("   1. Copiez le SQL affiché ci-dessus")
        print("   2. Allez dans le dashboard Supabase > SQL Editor")
        print("   3. Exécutez le SQL pour créer les politiques manquantes")
        print("   4. Relancez ce script pour vérifier")

if __name__ == "__main__":
    main()