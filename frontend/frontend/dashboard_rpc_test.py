import requests
import json
import sys
from datetime import datetime
from supabase import create_client, Client

# Configuration Supabase
SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"

class DashboardRPCTester:
    def __init__(self):
        self.supabase = create_client(SUPABASE_URL, SUPABASE_KEY)
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, test_func):
        """Run a single test function and track results"""
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            result = test_func()
            if result:
                self.tests_passed += 1
                print(f"✅ Passed - {name}")
                self.test_results.append({
                    "name": name,
                    "success": True
                })
                return True
            else:
                print(f"❌ Failed - {name}")
                self.test_results.append({
                    "name": name,
                    "success": False,
                    "error": "Test returned False"
                })
                return False
        except Exception as e:
            print(f"❌ Failed - {name} - Error: {str(e)}")
            self.test_results.append({
                "name": name,
                "success": False,
                "error": str(e)
            })
            return False

    def test_chef_agence_dashboard_kpis(self):
        """Test the get_chef_agence_dashboard_kpis RPC function"""
        try:
            result = self.supabase.rpc('get_chef_agence_dashboard_kpis').execute()
            
            if result.data:
                print("✅ get_chef_agence_dashboard_kpis returned data:")
                print(f"   Chef balance: {result.data.get('chef_balance', {}).get('formatted', 'N/A')}")
                print(f"   Agency volume: {result.data.get('agency_volume_month', {}).get('formatted', 'N/A')}")
                print(f"   Agents performance: {result.data.get('agents_performance', {}).get('total_agents', 'N/A')} agents")
                
                # Verify data structure
                required_fields = [
                    'chef_balance', 'agency_volume_month', 'agency_commissions', 
                    'agents_performance', 'pending_actions', 'agency_id'
                ]
                
                missing_fields = [field for field in required_fields if field not in result.data]
                
                if missing_fields:
                    print(f"⚠️ Missing fields in response: {', '.join(missing_fields)}")
                    return False
                
                return True
            else:
                print("⚠️ get_chef_agence_dashboard_kpis returned empty data")
                return False
        except Exception as e:
            print(f"❌ Error testing get_chef_agence_dashboard_kpis: {str(e)}")
            return False

    def test_agent_dashboard_kpis(self):
        """Test the get_agent_dashboard_kpis RPC function"""
        try:
            result = self.supabase.rpc('get_agent_dashboard_kpis').execute()
            
            if result.data:
                print("✅ get_agent_dashboard_kpis returned data:")
                print(f"   Agent balance: {result.data.get('agent_balance', {}).get('formatted', 'N/A')}")
                print(f"   Operations today: {result.data.get('operations_today', {}).get('total', 'N/A')}")
                print(f"   Monthly objective: {result.data.get('monthly_objective', {}).get('progress_formatted', 'N/A')}")
                
                # Verify data structure
                required_fields = [
                    'agent_balance', 'operations_today', 'commissions_week', 
                    'monthly_objective', 'performance_summary'
                ]
                
                missing_fields = [field for field in required_fields if field not in result.data]
                
                if missing_fields:
                    print(f"⚠️ Missing fields in response: {', '.join(missing_fields)}")
                    return False
                
                return True
            else:
                print("⚠️ get_agent_dashboard_kpis returned empty data")
                return False
        except Exception as e:
            print(f"❌ Error testing get_agent_dashboard_kpis: {str(e)}")
            return False

    def test_chef_agents_performance(self):
        """Test the get_chef_agents_performance RPC function"""
        try:
            result = self.supabase.rpc('get_chef_agents_performance', {'p_limit': 5}).execute()
            
            if result.data:
                print("✅ get_chef_agents_performance returned data:")
                print(f"   Number of agents: {len(result.data)}")
                
                if len(result.data) > 0:
                    agent = result.data[0]
                    print(f"   First agent: {agent.get('name', 'N/A')}")
                    print(f"   Balance: {agent.get('balance_formatted', 'N/A')}")
                    print(f"   Performance level: {agent.get('performance_level', 'N/A')}")
                    
                    # Verify data structure for first agent
                    required_fields = [
                        'id', 'name', 'email', 'balance', 'balance_formatted',
                        'operations_week', 'volume_week', 'volume_week_formatted',
                        'commissions_week', 'commissions_week_formatted',
                        'success_rate', 'performance_level', 'last_activity', 'is_active_week'
                    ]
                    
                    missing_fields = [field for field in required_fields if field not in agent]
                    
                    if missing_fields:
                        print(f"⚠️ Missing fields in agent data: {', '.join(missing_fields)}")
                        return False
                
                return True
            else:
                print("⚠️ get_chef_agents_performance returned empty data")
                return False
        except Exception as e:
            print(f"❌ Error testing get_chef_agents_performance: {str(e)}")
            return False

    def test_login_and_rpc_access(self, email, password, expected_role):
        """Test login and access to RPC functions with specific role"""
        try:
            # Login
            auth_response = self.supabase.auth.sign_in_with_password({
                "email": email,
                "password": password
            })
            
            if not auth_response.user:
                print(f"❌ Failed to login with {email}")
                return False
            
            print(f"✅ Successfully logged in as {auth_response.user.email} (Role: {expected_role})")
            
            # Test appropriate RPC function based on role
            if expected_role == 'chef_agence':
                return self.test_chef_agence_dashboard_kpis()
            elif expected_role == 'agent':
                return self.test_agent_dashboard_kpis()
            else:
                print(f"⚠️ No specific RPC test for role: {expected_role}")
                return True
                
        except Exception as e:
            print(f"❌ Error during login and RPC access test: {str(e)}")
            return False
        finally:
            # Sign out
            self.supabase.auth.sign_out()

    def print_summary(self):
        """Print a summary of all test results"""
        print("\n📋 TEST SUMMARY")
        print("===============")
        
        for result in self.test_results:
            status = "✅" if result["success"] else "❌"
            print(f"{status} {result['name']}")
            if not result["success"] and "error" in result:
                print(f"   Error: {result['error']}")
        
        print(f"\n📊 Tests run: {self.tests_run}")
        print(f"📊 Tests passed: {self.tests_passed}")
        print(f"📊 Success rate: {(self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0:.1f}%")

def main():
    tester = DashboardRPCTester()
    
    print("=" * 60)
    print("🧪 TESTING DASHBOARD RPC FUNCTIONS")
    print("=" * 60)
    
    # Test RPC functions directly (without authentication)
    tester.run_test("Chef Agence Dashboard KPIs", tester.test_chef_agence_dashboard_kpis)
    tester.run_test("Agent Dashboard KPIs", tester.test_agent_dashboard_kpis)
    tester.run_test("Chef Agents Performance", tester.test_chef_agents_performance)
    
    # Test with authentication for specific roles
    tester.run_test(
        "Chef Agence Login and RPC Access", 
        lambda: tester.test_login_and_rpc_access("chef_dakar_diallo@transflownexus.demo", "chef123", "chef_agence")
    )
    
    tester.run_test(
        "Agent Login and RPC Access", 
        lambda: tester.test_login_and_rpc_access("dkr01_fatou@transflownexus.demo", "agent123", "agent")
    )
    
    # Print summary
    tester.print_summary()
    
    print("\n" + "=" * 60)
    print("🎯 RÉSUMÉ DU TEST")
    print("=" * 60)
    
    if tester.tests_passed == tester.tests_run:
        print("✅ Tous les tests ont réussi!")
        print("✅ Les fonctions RPC pour les dashboards sont correctement implémentées")
    else:
        print(f"⚠️ {tester.tests_run - tester.tests_passed} tests ont échoué")
        print("⚠️ Certaines fonctions RPC peuvent nécessiter des ajustements")
    
    print("\n💡 Prochaines étapes:")
    print("   1. Vérifier l'affichage des dashboards sur http://localhost:8081")
    print("   2. Tester avec différents rôles utilisateur")
    print("   3. Valider la cohérence des données")
    
    return tester.tests_passed == tester.tests_run

if __name__ == "__main__":
    success = main()
    sys.exit(0 if success else 1)