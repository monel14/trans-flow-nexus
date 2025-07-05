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

    def test_get_validation_queue_stats(self):
        """Test getting validation queue stats"""
        success, response = self.run_test(
            "Get Validation Queue Stats",
            "POST",
            "rest/v1/rpc/get_validation_queue_stats",
            200,
            data={}
        )
        
        if success and response:
            print(f"✅ Validation Queue Stats retrieved successfully")
            print(f"  - Unassigned: {response.get('unassigned_count', 'N/A')}")
            print(f"  - My Tasks: {response.get('my_tasks_count', 'N/A')}")
            print(f"  - All Tasks: {response.get('all_tasks_count', 'N/A')}")
            print(f"  - Urgent: {response.get('urgent_count', 'N/A')}")
            print(f"  - Completed Today: {response.get('completed_today', 'N/A')}")
        
        return success

    def test_get_operations_by_queue(self, queue_type):
        """Test getting operations by queue"""
        query_params = ""
        
        if queue_type == "unassigned":
            query_params = "status=eq.pending&validator_id=is.null"
        elif queue_type == "my_tasks" and self.user_data:
            query_params = f"status=eq.pending_validation&validator_id=eq.{self.user_data['id']}"
        elif queue_type == "all_tasks":
            query_params = "status=in.(pending,pending_validation)"
        
        success, response = self.run_test(
            f"Get Operations by Queue ({queue_type})",
            "GET",
            f"rest/v1/operations?{query_params}&select=*,operation_types(id,name,description),profiles!operations_initiator_id_fkey(id,name,email),agencies(id,name,city)&order=created_at.asc",
            200
        )
        
        if success and response:
            print(f"✅ Retrieved {len(response)} operations for queue: {queue_type}")
            
            # Check for operations with proof_url
            operations_with_proof = [op for op in response if op.get('operation_data', {}).get('proof_url')]
            print(f"  - Operations with proof: {len(operations_with_proof)}/{len(response)}")
            
            # Return the first operation with proof if available
            if operations_with_proof:
                return success, operations_with_proof[0]
        
        return success, None

    def test_proof_viewer_functionality(self):
        """Test the proof viewer functionality by checking operations with proofs"""
        print("\n🖼️ Testing Proof Viewer Functionality")
        
        # First get operations from different queues
        _, unassigned_op = self.test_get_operations_by_queue("unassigned")
        _, my_tasks_op = self.test_get_operations_by_queue("my_tasks")
        _, all_tasks_op = self.test_get_operations_by_queue("all_tasks")
        
        # Collect all operations with proof URLs
        operations_with_proof = []
        for op in [unassigned_op, my_tasks_op, all_tasks_op]:
            if op and op.get('operation_data', {}).get('proof_url'):
                operations_with_proof.append(op)
        
        if not operations_with_proof:
            print("⚠️ No operations with proof URLs found to test")
            self.test_results.append({
                "name": "Proof Viewer Functionality",
                "success": False,
                "error": "No operations with proof URLs found"
            })
            return False
        
        # Test accessing each proof URL
        all_success = True
        for op in operations_with_proof:
            proof_url = op['operation_data']['proof_url']
            print(f"  - Testing access to proof URL: {proof_url}")
            
            try:
                # Just check if the URL is accessible
                response = requests.head(proof_url)
                if response.status_code < 400:
                    print(f"    ✅ Proof URL is accessible (Status: {response.status_code})")
                else:
                    print(f"    ❌ Proof URL returned error (Status: {response.status_code})")
                    all_success = False
            except Exception as e:
                print(f"    ❌ Error accessing proof URL: {str(e)}")
                all_success = False
        
        self.test_results.append({
            "name": "Proof Viewer Functionality",
            "success": all_success
        })
        
        return all_success

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
    
    # Test credentials - using the demo account mentioned in the review request
    test_email = "admin@transflow.com"
    test_password = "admin123"
    
    # Run tests
    print("\n🔒 Testing Supabase API Integration for TransFlow Nexus")
    print("=======================================================")
    
    # Try to login with provided credentials
    print("\n🔑 Testing Authentication")
    login_success = tester.test_login(test_email, test_password)
    
    if login_success:
        # If login succeeds, run the authenticated tests
        print("\n✅ Login successful! Testing ProofViewer functionality...")
        
        # Test validation queue stats and operations
        tester.test_get_validation_queue_stats()
        tester.test_proof_viewer_functionality()
    else:
        print("\n❌ Login failed. Cannot test ProofViewer functionality without authentication.")

    # Print summary of all tests
    tester.print_summary()
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())