#!/usr/bin/env python3
"""
Script pour tester le compte développeur converti
"""

import requests
import json
import sys
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
                print(f"  - Role: {profile.get('roles', {}).get('name', 'N/A')}")
                
                # Check if role is developer
                if profile.get('roles', {}).get('name') == 'developer':
                    print("✅ User has developer role")
                else:
                    print(f"❌ User does not have developer role, found: {profile.get('roles', {}).get('name', 'N/A')}")
                    success = False
        
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

def test_developer_account():
    """Test the developer account"""
    print("\n🧪 Testing Developer Account...")
    
    tester = SupabaseAPITester()
    
    # Test login with developer account
    print("\n🔑 Testing Authentication with developer account")
    login_success = tester.test_login("sadmin_pierre@transflownexus.demo", "sadmin123")
    
    if not login_success:
        print("\n⚠️ Developer login failed, stopping tests")
        tester.print_summary()
        return 1
    
    # Test getting profile to verify role
    print("\n👤 Testing Developer Profile")
    profile_success = tester.test_get_profile()
    
    if not profile_success:
        print("\n⚠️ Failed to verify developer role")
        tester.print_summary()
        return 1
    
    # Print summary
    tester.print_summary()
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    print("🚀 Testing Developer Account for TransFlow Nexus")
    print("="*60)
    
    result = test_developer_account()
    
    print("\n" + "="*60)
    if result == 0:
        print("✅ DEVELOPER ACCOUNT VERIFIED SUCCESSFULLY!")
        print("\n🔑 LOGIN INFORMATION:")
        print("   Email: sadmin_pierre@transflownexus.demo")
        print("   Password: sadmin123")
        print("   URL: http://localhost:8080/")
        print("   Dashboard: /dashboard/developer")
    else:
        print("❌ DEVELOPER ACCOUNT VERIFICATION FAILED")
    
    sys.exit(result)