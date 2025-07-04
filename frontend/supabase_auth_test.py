import requests
import json
import sys

def test_supabase_connection(url, api_key):
    """Test basic connection to Supabase"""
    print(f"\n🔍 Testing connection to Supabase at {url}...")
    
    headers = {
        'Content-Type': 'application/json',
        'apikey': api_key
    }
    
    try:
        # Try a simple health check
        response = requests.get(f"{url}/rest/v1/", headers=headers)
        
        if response.status_code == 200:
            print(f"✅ Connection successful - Status: {response.status_code}")
            return True
        else:
            print(f"❌ Connection failed - Status: {response.status_code}")
            try:
                print(f"Response: {response.json()}")
            except:
                print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Connection failed - Error: {str(e)}")
        return False

def test_supabase_auth(url, api_key, email, password):
    """Test authentication with Supabase"""
    print(f"\n🔍 Testing authentication with email: {email}...")
    
    headers = {
        'Content-Type': 'application/json',
        'apikey': api_key
    }
    
    data = {
        "email": email,
        "password": password
    }
    
    try:
        response = requests.post(
            f"{url}/auth/v1/token?grant_type=password",
            headers=headers,
            json=data
        )
        
        if response.status_code == 200 and 'access_token' in response.json():
            print(f"✅ Authentication successful")
            token = response.json()['access_token']
            user_data = response.json()['user']
            print(f"  - User ID: {user_data.get('id', 'N/A')}")
            print(f"  - Email: {user_data.get('email', 'N/A')}")
            return True, token, user_data
        else:
            print(f"❌ Authentication failed - Status: {response.status_code}")
            try:
                print(f"Response: {response.json()}")
            except:
                print(f"Response: {response.text}")
            return False, None, None
    except Exception as e:
        print(f"❌ Authentication failed - Error: {str(e)}")
        return False, None, None

def test_get_profile(url, api_key, token, user_id):
    """Test getting user profile"""
    print(f"\n🔍 Testing profile retrieval for user ID: {user_id}...")
    
    headers = {
        'Content-Type': 'application/json',
        'apikey': api_key,
        'Authorization': f'Bearer {token}'
    }
    
    try:
        response = requests.get(
            f"{url}/rest/v1/profiles?id=eq.{user_id}&select=*",
            headers=headers
        )
        
        if response.status_code == 200:
            print(f"✅ Profile retrieval successful")
            if response.json():
                profile = response.json()[0]
                print(f"  - Name: {profile.get('name', 'N/A')}")
                print(f"  - Email: {profile.get('email', 'N/A')}")
                print(f"  - Role ID: {profile.get('role_id', 'N/A')}")
                print(f"  - Agency ID: {profile.get('agency_id', 'N/A')}")
                return True, profile
            else:
                print("  ⚠️ No profile data returned")
                return False, None
        else:
            print(f"❌ Profile retrieval failed - Status: {response.status_code}")
            try:
                print(f"Response: {response.json()}")
            except:
                print(f"Response: {response.text}")
            return False, None
    except Exception as e:
        print(f"❌ Profile retrieval failed - Error: {str(e)}")
        return False, None

def main():
    # Supabase configuration
    supabase_url = "https://khgbnikgsptoflokvtzu.supabase.co"
    supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"
    
    # Test credentials - try different combinations
    test_credentials = [
        {"email": "admin@transflow.com", "password": "admin123"},
        {"email": "sousadmin@transflow.com", "password": "sousadmin123"},
        {"email": "chef@transflow.com", "password": "chef123"},
        {"email": "agent@transflow.com", "password": "agent123"},
        {"email": "dev@transflow.com", "password": "dev123"}
    ]
    
    print("\n🔒 Testing Supabase Connection and Authentication")
    print("=================================================")
    
    # Test basic connection
    connection_success = test_supabase_connection(supabase_url, supabase_key)
    
    if not connection_success:
        print("\n⚠️ Failed to connect to Supabase. Please check the URL and API key.")
        return 1
    
    # Try authentication with different credentials
    auth_success = False
    token = None
    user_data = None
    
    for creds in test_credentials:
        print(f"\nTrying credentials: {creds['email']}")
        auth_success, token, user_data = test_supabase_auth(
            supabase_url, 
            supabase_key, 
            creds['email'], 
            creds['password']
        )
        
        if auth_success:
            print(f"✅ Successfully authenticated with {creds['email']}")
            break
    
    if not auth_success:
        print("\n⚠️ Failed to authenticate with any of the provided credentials.")
        print("Please check the credentials or try with valid ones.")
        return 1
    
    # Test profile retrieval
    profile_success, profile = test_get_profile(
        supabase_url,
        supabase_key,
        token,
        user_data['id']
    )
    
    if profile_success:
        print("\n✅ Successfully retrieved user profile")
    else:
        print("\n⚠️ Failed to retrieve user profile")
    
    print("\n📋 TEST SUMMARY")
    print("===============")
    print(f"✅ Connection to Supabase: {'Success' if connection_success else 'Failed'}")
    print(f"✅ Authentication: {'Success' if auth_success else 'Failed'}")
    print(f"✅ Profile Retrieval: {'Success' if profile_success else 'Failed'}")
    
    return 0 if (connection_success and auth_success and profile_success) else 1

if __name__ == "__main__":
    sys.exit(main())