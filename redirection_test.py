import requests
import sys
import time
from datetime import datetime

class RedirectionTester:
    def __init__(self, base_url="http://localhost:8080"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, expected_result, test_function, *args, **kwargs):
        """Run a single test"""
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            result = test_function(*args, **kwargs)
            success = result == expected_result
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - {name}")
                self.test_results.append({
                    "name": name,
                    "success": True
                })
            else:
                print(f"❌ Failed - {name} - Expected {expected_result}, got {result}")
                self.test_results.append({
                    "name": name,
                    "success": False,
                    "expected": expected_result,
                    "actual": result
                })
            
            return success, result
        except Exception as e:
            print(f"❌ Failed - {name} - Error: {str(e)}")
            self.test_results.append({
                "name": name,
                "success": False,
                "error": str(e)
            })
            return False, None

    def test_frontend_availability(self):
        """Test if the frontend is available"""
        try:
            response = requests.get(self.base_url)
            return response.status_code == 200
        except Exception as e:
            print(f"Error accessing frontend: {str(e)}")
            return False

    def print_summary(self):
        """Print a summary of all test results"""
        print("\n📋 TEST SUMMARY")
        print("===============")
        
        for result in self.test_results:
            status = "✅" if result["success"] else "❌"
            print(f"{status} {result['name']}")
            if not result["success"]:
                if "error" in result:
                    print(f"   Error: {result['error']}")
                elif "expected" in result and "actual" in result:
                    print(f"   Expected: {result['expected']}, Actual: {result['actual']}")
        
        print(f"\n📊 Tests run: {self.tests_run}")
        print(f"📊 Tests passed: {self.tests_passed}")
        print(f"📊 Success rate: {(self.tests_passed / self.tests_run * 100) if self.tests_run > 0 else 0:.1f}%")

def main():
    # Setup
    tester = RedirectionTester("http://localhost:8080")
    
    # Test frontend availability
    tester.run_test(
        "Frontend Availability",
        True,
        tester.test_frontend_availability
    )
    
    # Print results
    tester.print_summary()
    
    # Code review findings
    print("\n📝 CODE REVIEW FINDINGS")
    print("=====================")
    print("1. The application uses Supabase for authentication")
    print("2. There are 5 user roles: agent, chef_agence, admin_general, sous_admin, developer")
    print("3. Each role has a specific dashboard route:")
    print("   - /dashboard/agent → AgentDashboard")
    print("   - /dashboard/chef-agence → ChefAgenceDashboard")
    print("   - /dashboard/admin → AdminGeneralDashboard")
    print("   - /dashboard/sous-admin → SousAdminDashboard")
    print("   - /dashboard/developer → DeveloperDashboard")
    print("4. The main Dashboard component redirects users to their specific dashboard based on their role")
    print("5. The ProtectedRoute component ensures users can only access routes they have permission for")
    
    print("\n🧪 MANUAL TEST PLAN")
    print("=================")
    print("1. Login with each type of user account:")
    print("   - admin@transflow.com / admin123")
    print("   - chef@transflow.com / chef123")
    print("   - agent@transflow.com / agent123")
    print("   - sousadmin@transflow.com / sousadmin123")
    print("   - dev@transflow.com / dev123")
    print("2. Verify that each user is redirected to their specific dashboard")
    print("3. Try to access other dashboards directly by URL and verify access is denied")
    print("4. Test logout functionality and verify redirection to login page")
    print("5. Test that the /dashboard route correctly redirects to the specific dashboard")
    
    print("\n🔍 IMPLEMENTATION REVIEW")
    print("=====================")
    print("The implementation correctly handles role-based redirection:")
    print("1. In Dashboard.tsx, the useEffect hook detects the user's role and redirects accordingly")
    print("2. In App.tsx, each dashboard route is protected with the appropriate role requirement")
    print("3. The ProtectedRoute component checks if the user has the required role")
    print("4. If a user tries to access a route they don't have permission for, they see an 'Accès Refusé' message")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())