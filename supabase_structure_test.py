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

def check_table_exists(url, api_key, table_name):
    """Check if a table exists in the Supabase database"""
    print(f"\n🔍 Checking if table '{table_name}' exists...")
    
    headers = {
        'Content-Type': 'application/json',
        'apikey': api_key
    }
    
    try:
        # Try to get the table structure
        response = requests.get(f"{url}/rest/v1/{table_name}?limit=0", headers=headers)
        
        if response.status_code == 200:
            print(f"✅ Table '{table_name}' exists")
            return True
        elif response.status_code == 404:
            print(f"❌ Table '{table_name}' does not exist")
            return False
        else:
            print(f"❌ Error checking table - Status: {response.status_code}")
            try:
                print(f"Response: {response.json()}")
            except:
                print(f"Response: {response.text}")
            return False
    except Exception as e:
        print(f"❌ Error checking table - Error: {str(e)}")
        return False

def main():
    # Supabase configuration
    supabase_url = "https://khgbnikgsptoflokvtzu.supabase.co"
    supabase_key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"
    
    # Tables to check
    tables = [
        "profiles",
        "roles",
        "agencies",
        "operations",
        "operation_types",
        "commission_records",
        "transaction_ledger",
        "request_tickets",
        "permissions",
        "role_permissions"
    ]
    
    print("\n🔒 Testing Supabase Database Structure")
    print("=====================================")
    
    # Test basic connection
    connection_success = test_supabase_connection(supabase_url, supabase_key)
    
    if not connection_success:
        print("\n⚠️ Failed to connect to Supabase. Please check the URL and API key.")
        return 1
    
    # Check if tables exist
    table_results = {}
    for table in tables:
        table_results[table] = check_table_exists(supabase_url, supabase_key, table)
    
    # Print summary
    print("\n📋 DATABASE STRUCTURE SUMMARY")
    print("============================")
    
    all_tables_exist = True
    for table, exists in table_results.items():
        status = "✅" if exists else "❌"
        print(f"{status} Table '{table}'")
        if not exists:
            all_tables_exist = False
    
    if all_tables_exist:
        print("\n✅ All required tables exist in the database")
    else:
        print("\n⚠️ Some required tables are missing from the database")
    
    return 0 if all_tables_exist else 1

if __name__ == "__main__":
    sys.exit(main())