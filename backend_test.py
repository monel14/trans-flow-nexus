#!/usr/bin/env python3
import requests
import json
import sys
import time
from datetime import datetime
import os
import jwt
import base64
import urllib.parse

# Test accounts
TEST_ACCOUNTS = [
    {"email": "admin_monel@transflownexus.demo", "password": "admin123", "role": "admin_general"},
    {"email": "chef_dakar_diallo@transflownexus.demo", "password": "chef123", "role": "chef_agence"},
    {"email": "dkr01_fatou@transflownexus.demo", "password": "agent123", "role": "agent"}
]

# Supabase URL and API key (these would be in the frontend environment)
SUPABASE_URL = "https://ixnzjlbmvbsyhwcnbxnr.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml4bnpqbGJtdmJzeWh3Y25ieG5yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MDk1NTI0NzcsImV4cCI6MjAyNTEyODQ3N30.Nt0NwpaiEuPRQNuXs29Z-HQ_a8XKQoDYg9oGGJKNYuE"
SUPABASE_API_URL = f"{SUPABASE_URL}/rest/v1"

class SupabaseClient:
    def __init__(self, url, anon_key=None):
        self.url = url
        self.anon_key = anon_key or ""
        self.access_token = None
        self.refresh_token = None
        self.user_id = None
        
    def auth_headers(self):
        headers = {
            "Content-Type": "application/json",
            "apikey": self.anon_key
        }
        if self.access_token:
            headers["Authorization"] = f"Bearer {self.access_token}"
        return headers
    
    def sign_in(self, email, password):
        endpoint = f"{self.url}/auth/v1/token?grant_type=password"
        payload = {
            "email": email,
            "password": password
        }
        headers = self.auth_headers()
        
        response = requests.post(endpoint, json=payload, headers=headers)
        if response.status_code == 200:
            data = response.json()
            self.access_token = data.get("access_token")
            self.refresh_token = data.get("refresh_token")
            
            # Extract user ID from JWT token
            if self.access_token:
                try:
                    # Split the JWT token and decode the payload
                    payload = self.access_token.split('.')[1]
                    # Add padding if needed
                    payload += '=' * (4 - len(payload) % 4)
                    decoded = base64.b64decode(payload)
                    user_data = json.loads(decoded)
                    self.user_id = user_data.get("sub")
                except Exception as e:
                    print(f"Error decoding JWT: {e}")
            
            return True, data
        return False, response.json()
    
    def get_user(self):
        endpoint = f"{self.url}/auth/v1/user"
        headers = self.auth_headers()
        
        response = requests.get(endpoint, headers=headers)
        return response.status_code == 200, response.json()
    
    def get_profile(self, user_id):
        endpoint = f"{self.url}/rest/v1/profiles?id=eq.{user_id}"
        headers = self.auth_headers()
        
        response = requests.get(endpoint, headers=headers)
        if response.status_code == 200:
            data = response.json()
            return True, data[0] if data else None
        return False, response.json()
    
    def get_agencies(self):
        endpoint = f"{self.url}/rest/v1/agencies?select=*,chef_agence:profiles!agencies_chef_agence_id_fkey(id,name,email),agency_operation_types(id,operation_type_id,is_enabled)"
        headers = self.auth_headers()
        
        response = requests.get(endpoint, headers=headers)
        return response.status_code == 200, response.json()
    
    def get_request_tickets(self, status=None):
        endpoint = f"{self.url}/rest/v1/request_tickets?select=*"
        if status:
            endpoint += f"&status=eq.{status}"
        headers = self.auth_headers()
        
        response = requests.get(endpoint, headers=headers)
        return response.status_code == 200, response.json()
    
    def get_operations(self, limit=10):
        endpoint = f"{self.url}/rest/v1/operations?select=*&limit={limit}"
        headers = self.auth_headers()
        
        response = requests.get(endpoint, headers=headers)
        return response.status_code == 200, response.json()

def test_authentication():
    """Test authentication with Supabase"""
    print("\n=== Testing Authentication ===")
    
    client = SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    all_passed = True
    
    for account in TEST_ACCOUNTS:
        try:
            print(f"\nTesting login with {account['email']} (role: {account['role']})")
            success, data = client.sign_in(account['email'], account['password'])
            
            if success:
                print(f"✅ Authentication successful for {account['email']}")
                print(f"User ID: {client.user_id}")
                
                # Test getting user data
                user_success, user_data = client.get_user()
                if user_success:
                    print(f"✅ Retrieved user data: {user_data.get('email')}")
                else:
                    print(f"❌ Failed to retrieve user data: {user_data}")
                    all_passed = False
                
                # Test getting profile data
                if client.user_id:
                    profile_success, profile_data = client.get_profile(client.user_id)
                    if profile_success and profile_data:
                        print(f"✅ Retrieved profile data: {profile_data.get('name')}")
                        print(f"   Role: {profile_data.get('role')}")
                        print(f"   Balance: {profile_data.get('balance')}")
                    else:
                        print(f"❌ Failed to retrieve profile data: {profile_data}")
                        all_passed = False
            else:
                print(f"❌ Authentication failed for {account['email']}: {data}")
                all_passed = False
        
        except Exception as e:
            print(f"❌ Error during authentication test for {account['email']}: {str(e)}")
            all_passed = False
    
    return all_passed

def test_agencies_access():
    """Test access to agencies data"""
    print("\n=== Testing Agencies Access ===")
    
    client = SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    success, data = client.sign_in("admin_monel@transflownexus.demo", "admin123")
    
    if not success:
        print(f"❌ Authentication failed: {data}")
        return False
    
    try:
        agencies_success, agencies_data = client.get_agencies()
        
        if agencies_success:
            print(f"✅ Retrieved agencies data: {len(agencies_data)} agencies found")
            
            # Check if agencies have the expected structure
            if agencies_data:
                agency = agencies_data[0]
                print(f"   Sample agency: {agency.get('name')}")
                
                # Check for chef_agence relationship
                if agency.get('chef_agence'):
                    print(f"   Chef d'agence: {agency['chef_agence'].get('name')}")
                else:
                    print("   No chef d'agence found for this agency")
                
                # Check for operation types
                if agency.get('agency_operation_types'):
                    print(f"   Operation types: {len(agency['agency_operation_types'])}")
                else:
                    print("   No operation types found for this agency")
            
            return True
        else:
            print(f"❌ Failed to retrieve agencies data: {agencies_data}")
            return False
    
    except Exception as e:
        print(f"❌ Error during agencies access test: {str(e)}")
        return False

def test_request_tickets_access():
    """Test access to request tickets data"""
    print("\n=== Testing Request Tickets Access ===")
    
    client = SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    success, data = client.sign_in("chef_dakar_diallo@transflownexus.demo", "chef123")
    
    if not success:
        print(f"❌ Authentication failed: {data}")
        return False
    
    try:
        tickets_success, tickets_data = client.get_request_tickets()
        
        if tickets_success:
            print(f"✅ Retrieved request tickets data: {len(tickets_data)} tickets found")
            
            # Check pending tickets specifically
            pending_success, pending_tickets = client.get_request_tickets("pending")
            if pending_success:
                print(f"   Pending tickets: {len(pending_tickets)}")
            else:
                print(f"❌ Failed to retrieve pending tickets: {pending_tickets}")
                return False
            
            return True
        else:
            print(f"❌ Failed to retrieve request tickets data: {tickets_data}")
            return False
    
    except Exception as e:
        print(f"❌ Error during request tickets access test: {str(e)}")
        return False

def test_operations_access():
    """Test access to operations data"""
    print("\n=== Testing Operations Access ===")
    
    client = SupabaseClient(SUPABASE_URL, SUPABASE_ANON_KEY)
    success, data = client.sign_in("dkr01_fatou@transflownexus.demo", "agent123")
    
    if not success:
        print(f"❌ Authentication failed: {data}")
        return False
    
    try:
        operations_success, operations_data = client.get_operations()
        
        if operations_success:
            print(f"✅ Retrieved operations data: {len(operations_data)} operations found")
            return True
        else:
            print(f"❌ Failed to retrieve operations data: {operations_data}")
            return False
    
    except Exception as e:
        print(f"❌ Error during operations access test: {str(e)}")
        return False

def test_dashboard_hooks_data():
    """Test access to data needed by dashboard hooks"""
    print("\n=== Testing Dashboard Hooks Data Access ===")
    
    # Test for Agent Dashboard
    print("\n--- Testing Agent Dashboard Data ---")
    agent_client = SupabaseClient(SUPABASE_URL)
    agent_success, agent_data = agent_client.sign_in("dkr01_fatou@transflownexus.demo", "agent123")
    
    if not agent_success:
        print(f"❌ Agent authentication failed: {agent_data}")
        return False
    
    try:
        # Get profile data (needed by useAgentDashboardKPIs)
        profile_success, profile_data = agent_client.get_profile(agent_client.user_id)
        if profile_success and profile_data:
            print(f"✅ Agent profile data accessible: {profile_data.get('name')}")
            print(f"   Balance: {profile_data.get('balance')} (needed for dashboard)")
        else:
            print(f"❌ Failed to retrieve agent profile data: {profile_data}")
            return False
        
        # Test for Chef d'Agence Dashboard
        print("\n--- Testing Chef d'Agence Dashboard Data ---")
        chef_client = SupabaseClient(SUPABASE_URL)
        chef_success, chef_data = chef_client.sign_in("chef_dakar_diallo@transflownexus.demo", "chef123")
        
        if not chef_success:
            print(f"❌ Chef authentication failed: {chef_data}")
            return False
        
        # Get profile data (needed by useChefAgenceDashboardKPIs)
        chef_profile_success, chef_profile_data = chef_client.get_profile(chef_client.user_id)
        if chef_profile_success and chef_profile_data:
            print(f"✅ Chef profile data accessible: {chef_profile_data.get('name')}")
            print(f"   Agency ID: {chef_profile_data.get('agency_id')} (needed for dashboard)")
        else:
            print(f"❌ Failed to retrieve chef profile data: {chef_profile_data}")
            return False
        
        # Get agents for this agency (needed by useChefAgenceDashboardKPIs)
        agency_id = chef_profile_data.get('agency_id')
        if agency_id:
            endpoint = f"{SUPABASE_URL}/rest/v1/profiles?select=id&agency_id=eq.{agency_id}&role=eq.agent"
            headers = chef_client.auth_headers()
            
            response = requests.get(endpoint, headers=headers)
            if response.status_code == 200:
                agents_data = response.json()
                print(f"✅ Agency agents data accessible: {len(agents_data)} agents found")
            else:
                print(f"❌ Failed to retrieve agency agents: {response.json()}")
                return False
        
        return True
    
    except Exception as e:
        print(f"❌ Error during dashboard hooks data test: {str(e)}")
        return False

def run_all_tests():
    """Run all tests and return overall result"""
    print("\n=== TransFlow Nexus Supabase Backend Tests ===")
    print(f"Testing Supabase backend at: {SUPABASE_URL}")
    
    test_results = {
        "Authentication": test_authentication(),
        "Agencies Access": test_agencies_access(),
        "Request Tickets Access": test_request_tickets_access(),
        "Operations Access": test_operations_access(),
        "Dashboard Hooks Data": test_dashboard_hooks_data()
    }
    
    print("\n=== Test Summary ===")
    all_passed = True
    for test_name, result in test_results.items():
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"{test_name}: {status}")
        if not result:
            all_passed = False
    
    if all_passed:
        print("\n🎉 All tests passed! The Supabase backend is working correctly.")
        return 0
    else:
        print("\n❌ Some tests failed. Please check the logs above for details.")
        return 1

if __name__ == "__main__":
    sys.exit(run_all_tests())