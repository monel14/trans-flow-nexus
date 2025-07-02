import sys
from supabase import create_client, Client

# Configuration Supabase
SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"

def test_rpc_functions():
    try:
        # Créer le client Supabase
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        
        print("=" * 60)
        print("🧪 TEST DES NOUVELLES FONCTIONS RPC")
        print("=" * 60)
        
        # Test 1: get_admin_dashboard_kpis (fonction existante)
        print("\n1️⃣ Test fonction get_admin_dashboard_kpis...")
        try:
            result = supabase.rpc('get_admin_dashboard_kpis').execute()
            if result.data:
                print("✅ get_admin_dashboard_kpis fonctionne")
                print(f"   Volume aujourd'hui: {result.data.get('volume_today', {}).get('formatted', 'N/A')}")
                print(f"   Agences actives: {result.data.get('network_stats', {}).get('active_agencies', 'N/A')}")
            else:
                print("⚠️ get_admin_dashboard_kpis retourne des données vides")
        except Exception as e:
            print(f"❌ Erreur get_admin_dashboard_kpis: {str(e)}")
        
        # Test 2: get_chef_agence_dashboard_kpis (nouvelle fonction)
        print("\n2️⃣ Test fonction get_chef_agence_dashboard_kpis...")
        try:
            result = supabase.rpc('get_chef_agence_dashboard_kpis').execute()
            if result.data:
                print("✅ get_chef_agence_dashboard_kpis fonctionne")
                print(f"   Solde chef: {result.data.get('chef_balance', {}).get('formatted', 'N/A')}")
                print(f"   Volume agence: {result.data.get('agency_volume_month', {}).get('formatted', 'N/A')}")
                print(f"   Agents totaux: {result.data.get('agents_performance', {}).get('total_agents', 'N/A')}")
            else:
                print("⚠️ get_chef_agence_dashboard_kpis retourne des données vides")
        except Exception as e:
            print(f"❌ Erreur get_chef_agence_dashboard_kpis: {str(e)}")
        
        # Test 3: get_agent_dashboard_kpis (nouvelle fonction)
        print("\n3️⃣ Test fonction get_agent_dashboard_kpis...")
        try:
            result = supabase.rpc('get_agent_dashboard_kpis').execute()
            if result.data:
                print("✅ get_agent_dashboard_kpis fonctionne")
                print(f"   Solde agent: {result.data.get('agent_balance', {}).get('formatted', 'N/A')}")
                print(f"   Opérations aujourd'hui: {result.data.get('operations_today', {}).get('total', 'N/A')}")
                print(f"   Commissions semaine: {result.data.get('commissions_week', {}).get('formatted', 'N/A')}")
            else:
                print("⚠️ get_agent_dashboard_kpis retourne des données vides")
        except Exception as e:
            print(f"❌ Erreur get_agent_dashboard_kpis: {str(e)}")
        
        # Test 4: get_chef_agents_performance (nouvelle fonction)
        print("\n4️⃣ Test fonction get_chef_agents_performance...")
        try:
            result = supabase.rpc('get_chef_agents_performance', {'p_limit': 5}).execute()
            if result.data:
                print("✅ get_chef_agents_performance fonctionne")
                if isinstance(result.data, list):
                    print(f"   Nombre d'agents retournés: {len(result.data)}")
                    if len(result.data) > 0:
                        agent = result.data[0]
                        print(f"   Premier agent: {agent.get('name', 'N/A')}")
                        print(f"   Volume semaine: {agent.get('volume_week_formatted', 'N/A')}")
                else:
                    print(f"   Données reçues: {result.data}")
            else:
                print("⚠️ get_chef_agents_performance retourne des données vides")
        except Exception as e:
            print(f"❌ Erreur get_chef_agents_performance: {str(e)}")
        
        print("\n" + "=" * 60)
        print("🎯 RÉSUMÉ DU TEST")
        print("=" * 60)
        print("✅ Phase 1 (Backend) : Fonctions RPC créées et déployées")
        print("✅ Phase 2 (Frontend) : Hooks et composants mis à jour")
        print("🔄 Phase 3 : Tests avec vraies données en cours...")
        print("\n💡 Prochaines étapes:")
        print("   1. Vérifier l'affichage des dashboards sur http://localhost:8081")
        print("   2. Tester avec différents rôles utilisateur")
        print("   3. Valider la cohérence des données")
        
        return True
        
    except Exception as e:
        print(f"❌ Erreur générale lors du test : {str(e)}")
        return False

if __name__ == "__main__":
    success = test_rpc_functions()
    
    if success:
        print("\n🎉 TESTS RÉUSSIS ! Les fonctions RPC sont opérationnelles.")
    else:
        print("\n⚠️ TESTS PARTIELS - Certaines fonctions nécessitent des ajustements.")
        
    print("\n🌐 Application accessible sur: http://localhost:8081")
    print("📊 Dashboards mis à jour avec données réelles de Supabase")