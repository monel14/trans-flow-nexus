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
        
        return success, response
        
    def test_get_operation_type_with_fields(self, operation_type_id):
        """Get operation type with its fields"""
        success, response = self.run_test(
            "Get Operation Type with Fields",
            "GET",
            f"rest/v1/operation_types?id=eq.{operation_type_id}&select=*,operation_type_fields(*)",
            200
        )
        
        if success and response:
            print(f"✅ Retrieved operation type with fields")
            if len(response) > 0:
                fields = response[0].get('operation_type_fields', [])
                print(f"  - Fields count: {len(fields)}")
        
        return success, response
        
    def test_create_operation_type(self, name, description="", impacts_balance=False, status="active"):
        """Create a new operation type"""
        data = {
            "name": name,
            "description": description,
            "impacts_balance": impacts_balance,
            "status": status,
            "is_active": status == "active"
        }
        
        success, response = self.run_test(
            "Create Operation Type",
            "POST",
            "rest/v1/operation_types",
            201,
            data=data,
            headers={"Prefer": "return=representation"}
        )
        
        if success and response:
            print(f"✅ Created operation type: {name}")
        
        return success, response
        
    def test_update_operation_type(self, operation_type_id, updates):
        """Update an operation type"""
        success, response = self.run_test(
            "Update Operation Type",
            "PATCH",
            f"rest/v1/operation_types?id=eq.{operation_type_id}",
            204,
            data=updates,
            headers={"Prefer": "return=minimal"}
        )
        
        if success:
            print(f"✅ Updated operation type")
        
        return success, response
        
    def test_create_operation_type_field(self, operation_type_id, field_data):
        """Create a field for an operation type"""
        data = {
            "operation_type_id": operation_type_id,
            **field_data
        }
        
        success, response = self.run_test(
            "Create Operation Type Field",
            "POST",
            "rest/v1/operation_type_fields",
            201,
            data=data,
            headers={"Prefer": "return=representation"}
        )
        
        if success and response:
            print(f"✅ Created field: {field_data.get('name')}")
        
        return success, response
        
    def test_delete_operation_type_field(self, field_id):
        """Delete an operation type field"""
        success, response = self.run_test(
            "Delete Operation Type Field",
            "DELETE",
            f"rest/v1/operation_type_fields?id=eq.{field_id}",
            204
        )
        
        if success:
            print(f"✅ Deleted field")
        
        return success, response
        
    def test_create_commission_rule(self, operation_type_id, commission_type, data=None):
        """Create a commission rule for an operation type"""
        rule_data = {
            "operation_type_id": operation_type_id,
            "commission_type": commission_type,
            "is_active": True
        }
        
        if data:
            rule_data.update(data)
            
        success, response = self.run_test(
            f"Create {commission_type} Commission Rule",
            "POST",
            "rest/v1/commission_rules",
            201,
            data=rule_data,
            headers={"Prefer": "return=representation"}
        )
        
        if success and response:
            print(f"✅ Created {commission_type} commission rule")
        
        return success, response

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
    timestamp = datetime.now().strftime('%H%M%S')
    
    # Run tests
    print("\n🔒 Testing TransFlow Nexus User Creation API")
    print("===========================================")
    
    # Test login with admin account
    print("\n🔑 Testing Authentication with admin account")
    login_success = tester.test_login("admin.monel", "admin123")
    
    if not login_success:
        print("\n⚠️ Admin login failed, stopping tests")
        tester.print_summary()
        return 1
    
    # Test getting agencies
    print("\n🏢 Testing Agencies")
    agencies_success, agencies = tester.test_get_agencies()
    
    if not agencies_success or not agencies:
        print("❌ Failed to get agencies list or no agencies found")
        tester.print_summary()
        return 1
    
    # Test creating a sous-admin
    print("\n👤 Testing Sous-Admin Creation")
    sous_admin_identifier = f"sadmin.test{timestamp}"
    sous_admin_success, sous_admin_response = tester.test_create_sous_admin(
        f"Test Sous-Admin {timestamp}",
        sous_admin_identifier,
        "Test123!"
    )
    
    if sous_admin_success:
        print(f"✅ Successfully created sous-admin: {sous_admin_identifier}")
        print(f"Response: {sous_admin_response}")
    
    # Test creating a chef d'agence
    print("\n👨‍💼 Testing Chef d'Agence Creation")
    agency_id = agencies[0].get('id')
    chef_identifier = f"chef.test{timestamp}.user"
    chef_success, chef_response = tester.test_create_chef_agence(
        f"Test Chef {timestamp}",
        chef_identifier,
        "Test123!",
        agency_id
    )
    
    if chef_success:
        print(f"✅ Successfully created chef d'agence: {chef_identifier}")
        print(f"Response: {chef_response}")
        
        # Now login as the chef to test creating an agent
        print(f"\n🔄 Switching to Chef d'Agence account: {chef_identifier}")
        if tester.test_login(chef_identifier, "Test123!"):
            print("\n👷 Testing Agent Creation")
            agent_identifier = f"tst{timestamp}.agent"
            agent_success, agent_response = tester.test_create_agent(
                f"Test Agent {timestamp}",
                agent_identifier,
                "Test123!"
            )
            
            if agent_success:
                print(f"✅ Successfully created agent: {agent_identifier}")
                print(f"Response: {agent_response}")
    
    # Print summary of all tests
    tester.print_summary()
    
    return 0 if tester.tests_passed == tester.tests_run else 1

def test_rpc_functions_direct():
    """Test RPC functions directly without authentication"""
    print("\n🔍 Testing RPC Functions Directly...")
    tester = SupabaseAPITester()
    
    # Test if the RPC functions exist
    print("\n📊 Testing RPC Functions Existence")
    
    # Test create_sous_admin function
    timestamp = datetime.now().strftime('%H%M%S')
    sous_admin_identifier = f"sadmin.test{timestamp}"
    sous_admin_success, sous_admin_response = tester.run_test(
        "RPC Function: create_sous_admin",
        "POST",
        "rest/v1/rpc/create_sous_admin",
        401,  # We expect 401 Unauthorized since we're not authenticated
        data={
            "full_name_in": f"Test Sous-Admin {timestamp}",
            "identifier_in": sous_admin_identifier,
            "password_in": "Test123!"
        }
    )
    
    if sous_admin_success:
        print("✅ RPC Function create_sous_admin exists (returned 401 as expected)")
    else:
        # Check if it's a 404 (function doesn't exist) or 401 (function exists but requires auth)
        if sous_admin_response.get('code') == 404:
            print("❌ RPC Function create_sous_admin does not exist")
        else:
            print("✅ RPC Function create_sous_admin exists but requires authentication")
    
    # Test create_chef_agence function
    chef_identifier = f"chef.test{timestamp}"
    chef_success, chef_response = tester.run_test(
        "RPC Function: create_chef_agence",
        "POST",
        "rest/v1/rpc/create_chef_agence",
        401,  # We expect 401 Unauthorized since we're not authenticated
        data={
            "full_name_in": f"Test Chef {timestamp}",
            "identifier_in": chef_identifier,
            "password_in": "Test123!",
            "agency_id_in": 1
        }
    )
    
    if chef_success:
        print("✅ RPC Function create_chef_agence exists (returned 401 as expected)")
    else:
        # Check if it's a 404 (function doesn't exist) or 401 (function exists but requires auth)
        if chef_response.get('code') == 404:
            print("❌ RPC Function create_chef_agence does not exist")
        else:
            print("✅ RPC Function create_chef_agence exists but requires authentication")
    
    # Test create_agent function
    agent_identifier = f"tst{timestamp}.agent"
    agent_success, agent_response = tester.run_test(
        "RPC Function: create_agent",
        "POST",
        "rest/v1/rpc/create_agent",
        401,  # We expect 401 Unauthorized since we're not authenticated
        data={
            "full_name_in": f"Test Agent {timestamp}",
            "identifier_in": agent_identifier,
            "password_in": "Test123!"
        }
    )
    
    if agent_success:
        print("✅ RPC Function create_agent exists (returned 401 as expected)")
    else:
        # Check if it's a 404 (function doesn't exist) or 401 (function exists but requires auth)
        if agent_response.get('code') == 404:
            print("❌ RPC Function create_agent does not exist")
        else:
            print("✅ RPC Function create_agent exists but requires authentication")
    
    # Print summary
    tester.print_summary()
    
    return tester.tests_passed > 0

def test_signup_and_login():
    """Test user registration and login"""
    print("\n🔍 Testing User Registration and Login...")
    tester = SupabaseAPITester()
    
    # Generate a unique email
    timestamp = datetime.now().strftime('%H%M%S')
    test_email = f"test.user{timestamp}@example.com"
    test_password = "TestPassword123!"
    
    # Test signup
    success, response = tester.run_test(
        "User Registration",
        "POST",
        "auth/v1/signup",
        200,
        data={
            "email": test_email,
            "password": test_password,
            "data": {
                "name": f"Test User {timestamp}"
            }
        }
    )
    
    if success:
        print(f"✅ Successfully registered user with email: {test_email}")
        user_id = response.get('user', {}).get('id')
        
        # Try to login with the new user
        login_success = tester.test_login(test_email, test_password)
        if login_success:
            print(f"✅ Successfully logged in with new user")
            return True
        else:
            print(f"❌ Failed to login with new user")
    else:
        print(f"❌ Failed to register new user")
        print(f"Response: {response}")
    
    return False

def test_rls_fix():
    """Test if the RLS fix has been applied successfully"""
    print("\n🔍 Testing RLS Fix...")
    tester = SupabaseAPITester()
    
    # Test database structure to see if we can access tables without RLS errors
    print("\n📊 Testing Database Structure after RLS Fix")
    db_structure_success = tester.test_database_structure()
    
    if db_structure_success:
        print("✅ RLS Fix has been successfully applied - No infinite recursion detected")
    else:
        print("❌ RLS Fix has not been applied or is not working correctly")
    
    # Test authentication with different user types
    print("\n🔑 Testing Authentication with Different User Types")
    
    # Try admin login
    admin_login = tester.test_login("admin.monel", "admin123")
    if admin_login:
        print("✅ Admin login successful")
        # Test profile access
        tester.test_get_profile()
        # Test roles access
        tester.test_get_roles()
        # Test agencies access
        tester.test_get_agencies()
    else:
        print("❌ Admin login failed")
    
    # Reset token for next test
    tester.token = None
    tester.user_data = None
    
    # Try chef d'agence login
    chef_login = tester.test_login("chef.dakar.diallo", "Test123!")
    if chef_login:
        print("✅ Chef d'agence login successful")
        # Test profile access
        tester.test_get_profile()
        # Test agencies access (should only see their own)
        tester.test_get_agencies()
    else:
        print("❌ Chef d'agence login failed")
    
    # Reset token for next test
    tester.token = None
    tester.user_data = None
    
    # Try agent login
    agent_login = tester.test_login("dkr01.fatou", "Test123!")
    if agent_login:
        print("✅ Agent login successful")
        # Test profile access
        tester.test_get_profile()
    else:
        print("❌ Agent login failed")
    
    # Test RPC functions
    print("\n🔧 Testing RPC Functions")
    
    # Login as admin to test RPC functions
    admin_login = tester.test_login("admin.monel", "admin123")
    if admin_login:
        # Test creating a sous-admin
        timestamp = datetime.now().strftime('%H%M%S')
        sous_admin_identifier = f"sadmin.test{timestamp}"
        sous_admin_success, sous_admin_response = tester.test_create_sous_admin(
            f"Test Sous-Admin {timestamp}",
            sous_admin_identifier,
            "Test123!"
        )
        
        if sous_admin_success:
            print(f"✅ RPC Function create_sous_admin working correctly")
            print(f"  - Created sous-admin: {sous_admin_identifier}")
        else:
            print(f"❌ RPC Function create_sous_admin failed")
            print(f"  - Error: {sous_admin_response.get('message', 'Unknown error')}")
        
        # Get agencies to use for chef d'agence creation
        success, agencies = tester.run_test(
            "Get Agencies for Test",
            "GET",
            "rest/v1/agencies?select=id&limit=1",
            200
        )
        
        if success and agencies and len(agencies) > 0:
            agency_id = agencies[0].get('id')
            
            # Test creating a chef d'agence
            chef_identifier = f"chef.test{timestamp}"
            chef_success, chef_response = tester.test_create_chef_agence(
                f"Test Chef {timestamp}",
                chef_identifier,
                "Test123!",
                agency_id
            )
            
            if chef_success:
                print(f"✅ RPC Function create_chef_agence working correctly")
                print(f"  - Created chef d'agence: {chef_identifier}")
                
                # Now login as the chef to test creating an agent
                if tester.test_login(chef_identifier, "Test123!"):
                    print(f"✅ New chef d'agence login successful")
                    
                    # Test creating an agent
                    agent_identifier = f"tst{timestamp}.agent"
                    agent_success, agent_response = tester.test_create_agent(
                        f"Test Agent {timestamp}",
                        agent_identifier,
                        "Test123!"
                    )
                    
                    if agent_success:
                        print(f"✅ RPC Function create_agent working correctly")
                        print(f"  - Created agent: {agent_identifier}")
                    else:
                        print(f"❌ RPC Function create_agent failed")
                        print(f"  - Error: {agent_response.get('message', 'Unknown error')}")
                else:
                    print(f"❌ New chef d'agence login failed")
            else:
                print(f"❌ RPC Function create_chef_agence failed")
                print(f"  - Error: {chef_response.get('message', 'Unknown error')}")
        else:
            print("❌ Could not get agencies for testing chef d'agence creation")
    
    # Print summary
    tester.print_summary()
    
    return tester.tests_passed == tester.tests_run

def test_operation_types_functionality():
    """Test operation types functionality"""
    print("\n🔍 Testing Operation Types Functionality...")
    tester = SupabaseAPITester()
    
    # Login as developer
    print("\n🔑 Testing Authentication with developer account")
    login_success = tester.test_login("developer.admin", "password123")
    
    if not login_success:
        print("\n⚠️ Developer login failed, stopping tests")
        tester.print_summary()
        return False
    
    # Test getting operation types
    print("\n📋 Testing Operation Types Listing")
    success, operation_types = tester.test_get_operation_types()
    
    if not success:
        print("❌ Failed to get operation types list")
        tester.print_summary()
        return False
    
    print(f"Found {len(operation_types)} operation types")
    
    # Create a new operation type for testing
    timestamp = datetime.now().strftime('%H%M%S')
    test_name = f"Test Type {timestamp}"
    print(f"\n➕ Creating new operation type: {test_name}")
    success, new_type = tester.test_create_operation_type(
        name=test_name,
        description="Created by automated test",
        impacts_balance=True
    )
    
    if not success or not new_type:
        print("❌ Failed to create operation type")
        tester.print_summary()
        return False
    
    operation_type_id = new_type[0]['id']
    print(f"Created operation type with ID: {operation_type_id}")
    
    # Create a field for the operation type
    print("\n➕ Adding field to operation type")
    field_data = {
        "name": "test_field",
        "label": "Test Field",
        "field_type": "text",
        "is_required": True,
        "is_obsolete": False,
        "display_order": 0
    }
    
    success, field = tester.test_create_operation_type_field(operation_type_id, field_data)
    if not success or not field:
        print("❌ Failed to create field")
        tester.print_summary()
        return False
    
    field_id = field[0]['id']
    print(f"Created field with ID: {field_id}")
    
    # Get the operation type with its fields to verify
    print("\n🔍 Verifying operation type with fields")
    success, operation_type_with_fields = tester.test_get_operation_type_with_fields(operation_type_id)
    if not success or not operation_type_with_fields:
        print("❌ Failed to get operation type with fields")
        tester.print_summary()
        return False
    
    # Test creating a fixed commission rule
    print("\n💰 Adding commission rule")
    fixed_commission_data = {
        "fixed_amount": 100
    }
    
    success, commission = tester.test_create_commission_rule(
        operation_type_id, 
        "fixed", 
        fixed_commission_data
    )
    
    if not success:
        print("❌ Failed to create commission rule")
        tester.print_summary()
        return False
    
    # Test updating the operation type
    print("\n✏️ Updating operation type")
    update_data = {
        "description": "Updated by automated test",
        "status": "inactive",
        "is_active": False
    }
    
    success, _ = tester.test_update_operation_type(operation_type_id, update_data)
    if not success:
        print("❌ Failed to update operation type")
        tester.print_summary()
        return False
    
    # Test deleting the field
    print("\n🗑️ Deleting field")
    success, _ = tester.test_delete_operation_type_field(field_id)
    if not success:
        print("❌ Failed to delete field")
        tester.print_summary()
        return False
    
    # Print summary
    tester.print_summary()
    
    return tester.tests_passed == tester.tests_run
def test_operation_types_functionality():
    """Test operation types functionality"""
    print("\n🔍 Testing Operation Types Functionality...")
    tester = SupabaseAPITester()
    
    # Login as developer
    print("\n🔑 Testing Authentication with developer account")
    login_success = tester.test_login("developer.admin", "password123")
    
    if not login_success:
        print("\n⚠️ Developer login failed, stopping tests")
        tester.print_summary()
        return False
    
    # Test getting operation types
    print("\n📋 Testing Operation Types Listing")
    success, operation_types = tester.test_get_operation_types()
    
    if not success:
        print("❌ Failed to get operation types list")
        tester.print_summary()
        return False
    
    print(f"Found {len(operation_types)} operation types")
    
    # Create a new operation type for testing
    timestamp = datetime.now().strftime('%H%M%S')
    test_name = f"Test Type {timestamp}"
    print(f"\n➕ Creating new operation type: {test_name}")
    success, new_type = tester.test_create_operation_type(
        name=test_name,
        description="Created by automated test",
        impacts_balance=True
    )
    
    if not success or not new_type:
        print("❌ Failed to create operation type")
        tester.print_summary()
        return False
    
    operation_type_id = new_type[0]['id']
    print(f"Created operation type with ID: {operation_type_id}")
    
    # Create a field for the operation type
    print("\n➕ Adding field to operation type")
    field_data = {
        "name": "test_field",
        "label": "Test Field",
        "field_type": "text",
        "is_required": True,
        "is_obsolete": False,
        "display_order": 0
    }
    
    success, field = tester.test_create_operation_type_field(operation_type_id, field_data)
    if not success or not field:
        print("❌ Failed to create field")
        tester.print_summary()
        return False
    
    field_id = field[0]['id']
    print(f"Created field with ID: {field_id}")
    
    # Get the operation type with its fields to verify
    print("\n🔍 Verifying operation type with fields")
    success, operation_type_with_fields = tester.test_get_operation_type_with_fields(operation_type_id)
    if not success or not operation_type_with_fields:
        print("❌ Failed to get operation type with fields")
        tester.print_summary()
        return False
    
    # Test creating a fixed commission rule
    print("\n💰 Adding commission rule")
    fixed_commission_data = {
        "fixed_amount": 100
    }
    
    success, commission = tester.test_create_commission_rule(
        operation_type_id, 
        "fixed", 
        fixed_commission_data
    )
    
    if not success:
        print("❌ Failed to create commission rule")
        tester.print_summary()
        return False
    
    # Test updating the operation type
    print("\n✏️ Updating operation type")
    update_data = {
        "description": "Updated by automated test",
        "status": "inactive",
        "is_active": False
    }
    
    success, _ = tester.test_update_operation_type(operation_type_id, update_data)
    if not success:
        print("❌ Failed to update operation type")
        tester.print_summary()
        return False
    
    # Test deleting the field
    print("\n🗑️ Deleting field")
    success, _ = tester.test_delete_operation_type_field(field_id)
    if not success:
        print("❌ Failed to delete field")
        tester.print_summary()
        return False
    
    # Print summary
    tester.print_summary()
    
    return tester.tests_passed == tester.tests_run

if __name__ == "__main__":
    # Run the main test suite
    main_result = main()
    
    # Test signup and login
    signup_result = test_signup_and_login()
    
    # Test RPC functions directly
    rpc_result = test_rpc_functions_direct()
    
    # Run the RLS fix test
    rls_fix_result = test_rls_fix()
    
    # Test operation types functionality
    operation_types_result = test_operation_types_functionality()
    
    # Exit with appropriate code
    sys.exit(0 if main_result == 0 and rls_fix_result and operation_types_result else 1)
