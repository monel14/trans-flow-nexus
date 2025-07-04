import requests
import json
import sys
import uuid

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

def test_supabase_signup(url, api_key, email, password, name="Test User"):
    """Test user registration with Supabase"""
    print(f"\n🔍 Testing user registration with email: {email}...")
    
    headers = {
        'Content-Type': 'application/json',
        'apikey': api_key
    }
    
    data = {
        "email": email,
        "password": password,
        "data": {
            "name": name
        }
    }
    
    try:
        response = requests.post(
            f"{url}/auth/v1/signup",
            headers=headers,
            json=data
        )
        
        if response.status_code == 200:
            print(f"✅ Registration successful")
            return True, response.json()
        else:
            print(f"❌ Registration failed - Status: {response.status_code}")
            try:
                print(f"Response: {response.json()}")
            except:
                print(f"Response: {response.text}")
            return False, None
    except Exception as e:
        print(f"❌ Registration failed - Error: {str(e)}")
        return False, None

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
    
    print("\n🔒 Testing Supabase Connection and Authentication")
    print("=================================================")
    
    # Test basic connection
    connection_success = test_supabase_connection(supabase_url, supabase_key)
    
    if not connection_success:
        print("\n⚠️ Failed to connect to Supabase. Please check the URL and API key.")
        return 1
    
    # Try to create a new test user
    unique_email = f"test_{uuid.uuid4().hex[:8]}@transflownexus.com"
    test_password = "TestPassword123!"
    
    signup_success, signup_data = test_supabase_signup(
        supabase_url,
        supabase_key,
        unique_email,
        test_password,
        "Test User"
    )
    
    if signup_success:
        print(f"\n✅ Successfully registered new test user: {unique_email}")
        
        # Try to authenticate with the new user
        auth_success, token, user_data = test_supabase_auth(
            supabase_url,
            supabase_key,
            unique_email,
            test_password
        )
        
        if auth_success:
            print(f"\n✅ Successfully authenticated with new user")
            
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
        else:
            print("\n⚠️ Failed to authenticate with new user")
    else:
        print("\n⚠️ Failed to register new test user")
        
        # Try with existing credentials as fallback
        test_credentials = [
            {"email": "admin@transflownexus.com", "password": "Admin123!"},
            {"email": "agent@transflownexus.com", "password": "Agent123!"},
            {"email": "test@example.com", "password": "password123"}
        ]
        
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
                
                break
        
        if not auth_success:
            print("\n⚠️ Failed to authenticate with any of the provided credentials.")
            print("Please check the credentials or try with valid ones.")
    
    print("\n📋 TEST SUMMARY")
    print("===============")
    print(f"✅ Connection to Supabase: {'Success' if connection_success else 'Failed'}")
    print(f"✅ User Registration: {'Success' if signup_success else 'Failed'}")
    print(f"✅ Authentication: {'Success' if auth_success else 'Failed'}")
    
    # Provide recommendations based on test results
    print("\n📋 RECOMMENDATIONS")
    print("=================")
    
    if not connection_success:
        print("❌ Check Supabase URL and API key")
        print("   - Verify the URL is correct: https://khgbnikgsptoflokvtzu.supabase.co")
        print("   - Ensure the API key is valid and has not expired")
    
    if not signup_success:
        print("❌ Issues with user registration")
        print("   - Check if email confirmation is required")
        print("   - Verify that the Supabase project allows new signups")
        print("   - Check for any custom validation rules that might be blocking registration")
    
    if not auth_success:
        print("❌ Authentication issues")
        print("   - Verify that the credentials are correct")
        print("   - Check if the user accounts exist in the Supabase project")
        print("   - Ensure that the authentication service is properly configured")
    
    return 0 if connection_success else 1

if __name__ == "__main__":
    sys.exit(main())