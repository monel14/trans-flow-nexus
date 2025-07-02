import requests
import json
import sys
import uuid
from datetime import datetime

class SupabaseAPITester:
    def __init__(self, supabase_url="https://khgbnikgsptoflokvtzu.supabase.co", api_key="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"):
        self.supabase_url = supabase_url
        self.api_key = api_key
        self.token = None
        self.tests_run = 0
        self.tests_passed = 0
        self.user_data = None
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.supabase_url}/{endpoint}"
        
        if not headers:
            headers = {
                'Content-Type': 'application/json',
                'apikey': self.api_key
            }
        else:
            headers['apikey'] = self.api_key
        
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)
            elif method == 'DELETE':
                response = requests.delete(url, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                self.test_results.append({
                    "name": name,
                    "success": True,
                    "status_code": response.status_code
                })
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                self.test_results.append({
                    "name": name,
                    "success": False,
                    "status_code": response.status_code,
                    "error": "Unexpected status code"
                })
                try:
                    print(f"Response: {response.json()}")
                    return False, response.json()
                except:
                    print(f"Response: {response.text}")
                    return False, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results.append({
                "name": name,
                "success": False,
                "error": str(e)
            })
            return False, {}

    def test_login(self, email, password):
        """Test login and get token"""
        success, response = self.run_test(
            "Login",
            "POST",
            "auth/v1/token?grant_type=password",
            200,
            data={"email": email, "password": password}
        )
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_data = response['user']
            return True
        return False

    def test_signup(self, email, password, name="Test User"):
        """Test user registration"""
        # Generate a unique email to avoid conflicts
        unique_email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/v1/signup",
            200,
            data={
                "email": unique_email,
                "password": password,
                "data": {
                    "name": name
                }
            }
        )
        
        if success:
            print(f"✅ Successfully registered user with email: {unique_email}")
            # Try to login with the new user
            return self.test_login(unique_email, password)
        return False

    def test_get_profile(self):
        """Test getting user profile"""
        if not self.user_data:
            print("❌ No user data available, login first")
            self.test_results.append({
                "name": "Get Profile",
                "success": False,
                "error": "No user data available, login first"
            })
            return False
            
        success, response = self.run_test(
            "Get Profile",
            "GET",
            f"rest/v1/profiles?id=eq.{self.user_data['id']}&select=*,roles(name,label),agencies(name,city)",
            200
        )
        
        if success and response:
            print(f"✅ Profile data retrieved successfully")
            if len(response) > 0:
                profile = response[0]
                print(f"  - User: {profile.get('name', 'N/A')}")
                print(f"  - Email: {profile.get('email', 'N/A')}")
                print(f"  - Role ID: {profile.get('role_id', 'N/A')}")
                print(f"  - Agency ID: {profile.get('agency_id', 'N/A')}")
                
                # Check if role_id and agency_id exist in the profile
                if 'role_id' not in profile or profile['role_id'] is None:
                    print("⚠️ Warning: role_id is missing in the profile")
                if 'agency_id' not in profile or profile['agency_id'] is None:
                    print("⚠️ Warning: agency_id is missing in the profile")
        
        return success

    def test_get_roles(self):
        """Test getting roles"""
        success, response = self.run_test(
            "Get Roles",
            "GET",
            "rest/v1/roles?select=*",
            200
        )
        
        if success and response:
            print(f"✅ Retrieved {len(response)} roles:")
            expected_roles = ["agent", "chef_agence", "admin_general", "sous_admin", "developer"]
            found_roles = [role.get('name') for role in response]
            
            for role_name in expected_roles:
                if role_name in found_roles:
                    print(f"  ✓ Found role: {role_name}")
                else:
                    print(f"  ✗ Missing role: {role_name}")
                    success = False
        
        return success

    def test_get_agencies(self):
        """Test getting agencies"""
        success, response = self.run_test(
            "Get Agencies",
            "GET",
            "rest/v1/agencies?select=*,chef_agence:profiles!agencies_chef_agence_id_fkey(name,email)",
            200
        )
        
        if success and response:
            print(f"✅ Retrieved {len(response)} agencies")
            if len(response) > 0:
                for agency in response[:3]:  # Show first 3 agencies
                    print(f"  - {agency.get('name', 'N/A')}")
        
        return success

    def test_get_permissions(self):
        """Test getting permissions"""
        success, response = self.run_test(
            "Get Permissions",
            "GET",
            "rest/v1/permissions?select=*",
            200
        )
        
        if success and response:
            print(f"✅ Retrieved {len(response)} permissions")
        
        return success

    def test_get_role_permissions(self):
        """Test getting role permissions"""
        success, response = self.run_test(
            "Get Role Permissions",
            "GET",
            "rest/v1/role_permissions?select=*,roles(name),permissions(code)",
            200
        )
        
        if success and response:
            print(f"✅ Retrieved {len(response)} role permissions")
        
        return success

    def test_get_operation_types(self):
        """Test getting operation types"""
        success, response = self.run_test(
            "Get Operation Types",
            "GET",
            "rest/v1/operation_types?select=*",
            200
        )
        
        if success and response:
            print(f"✅ Retrieved {len(response)} operation types")
        
        return success

    def test_database_structure(self):
        """Test database structure by checking key tables"""
        tables = [
            "profiles", 
            "roles", 
            "agencies", 
            "operations", 
            "operation_types",
            "commission_records",
            "transaction_ledger",
            "request_tickets"
        ]
        
        all_success = True
        for table in tables:
            success, response = self.run_test(
                f"Check Table: {table}",
                "GET",
                f"rest/v1/{table}?select=id&limit=1",
                200
            )
            if not success:
                all_success = False
        
        return all_success

    def test_get_commissions(self):
        """Test getting commissions"""
        if not self.user_data:
            print("❌ No user data available, login first")
            self.test_results.append({
                "name": "Get Commissions",
                "success": False,
                "error": "No user data available, login first"
            })
            return False
            
        success, response = self.run_test(
            "Get Commissions",
            "GET",
            f"rest/v1/commission_records?agent_id=eq.{self.user_data['id']}&select=*,operations(reference_number,amount,currency,operation_types(name))",
            200
        )
        return success

    def test_get_recharge_requests(self):
        """Test getting recharge requests"""
        if not self.user_data:
            print("❌ No user data available, login first")
            self.test_results.append({
                "name": "Get Recharge Requests",
                "success": False,
                "error": "No user data available, login first"
            })
            return False
            
        success, response = self.run_test(
            "Get Recharge Requests",
            "GET",
            f"rest/v1/request_tickets?requester_id=eq.{self.user_data['id']}&ticket_type=eq.recharge&select=*",
            200
        )
        return success

    def test_create_sous_admin(self, full_name, identifier, password):
        """Test creating a sous-admin"""
        success, response = self.run_test(
            "Create Sous-Admin",
            "POST",
            "rest/v1/rpc/create_sous_admin",
            200,
            data={
                "full_name_in": full_name,
                "identifier_in": identifier,
                "password_in": password
            }
        )
        return success, response

    def test_create_chef_agence(self, full_name, identifier, password, agency_id):
        """Test creating a chef d'agence"""
        success, response = self.run_test(
            "Create Chef d'Agence",
            "POST",
            "rest/v1/rpc/create_chef_agence",
            200,
            data={
                "full_name_in": full_name,
                "identifier_in": identifier,
                "password_in": password,
                "agency_id_in": agency_id
            }
        )
        return success, response

    def test_create_agent(self, full_name, identifier, password):
        """Test creating an agent"""
        success, response = self.run_test(
            "Create Agent",
            "POST",
            "rest/v1/rpc/create_agent",
            200,
            data={
                "full_name_in": full_name,
                "identifier_in": identifier,
                "password_in": password
            }
        )
        return success, response
    def test_get_support_tickets(self):
        """Test getting support tickets"""
        success, response = self.run_test(
            "Get Support Tickets",
            "GET",
            "rest/v1/request_tickets?select=*,profiles!request_tickets_requester_id_fkey(name,email),assigned_to:profiles!request_tickets_assigned_to_id_fkey(name,email)",
            200
        )
        return success

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
    # Setup
    tester = SupabaseAPITester()
    
    # Test credentials - these would need to be replaced with valid credentials
    test_email = "admin@transflownexus.com"
    test_password = "Admin123!"

    # Run tests
    print("\n🔒 Testing Supabase API Integration for TransFlow Nexus")
    print("=======================================================")
    
    # Test database structure first (doesn't require authentication)
    print("\n📊 Testing Database Structure")
    tester.test_database_structure()
    
    # Test roles and permissions (doesn't require authentication)
    print("\n👥 Testing Roles and Permissions")
    tester.test_get_roles()
    tester.test_get_permissions()
    tester.test_get_role_permissions()
    
    # Test agencies (doesn't require authentication)
    print("\n🏢 Testing Agencies")
    tester.test_get_agencies()
    
    # Test operation types (doesn't require authentication)
    print("\n🔄 Testing Operation Types")
    tester.test_get_operation_types()
    
    # Try to login with provided credentials
    print("\n🔑 Testing Authentication")
    login_success = tester.test_login(test_email, test_password)
    
    if not login_success:
        print("\n⚠️ Login failed with provided credentials.")
        print("Attempting to register a new test user...")
        
        # Try to register a new user
        signup_success = tester.test_signup(
            f"test_{uuid.uuid4().hex[:8]}@example.com", 
            "TestPassword123!"
        )
        
        if not signup_success:
            print("\n⚠️ Both login and registration failed.")
            print("To fully test authenticated endpoints, valid credentials are required.")
        else:
            print("\n✅ Registration successful! Testing authenticated endpoints...")
            # If signup succeeds, run the authenticated tests
            tester.test_get_profile()
            tester.test_get_commissions()
            tester.test_get_recharge_requests()
            tester.test_get_support_tickets()
    else:
        # If login succeeds, run the authenticated tests
        print("\n✅ Login successful! Testing authenticated endpoints...")
        tester.test_get_profile()
        tester.test_get_commissions()
        tester.test_get_recharge_requests()
        tester.test_get_support_tickets()

    # Print summary of all tests
    tester.print_summary()
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())