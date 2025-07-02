#!/usr/bin/env python3
"""
Script to apply the developer RLS bypass migration to Supabase
This will allow the developer account to access all dashboards and data
"""

import os
import sys
from pathlib import Path

# Add the parent directory to the path to import supabase client
sys.path.append(str(Path(__file__).parent))

try:
    from supabase import create_client, Client
except ImportError:
    print("Error: supabase library not found. Please install it with 'pip install supabase'")
    sys.exit(1)

def apply_developer_rls_bypass():
    """Apply the developer RLS bypass migration"""
    
    # Supabase configuration
    SUPABASE_URL = "https://khgbnikgsptoflokvtzu.supabase.co"
    # Using anon key for now - in production you'd use service role key
    SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtoZ2JuaWtnc3B0b2Zsb2t2dHp1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5NTY5MjEsImV4cCI6MjA2NTUzMjkyMX0.ivvTK10biQNOHd4cAc9zmMDApkm4xMGImEpCVsMzp4M"
    
    # Create Supabase client
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_ANON_KEY)
    
    print("🔧 Setting up developer account access...")
    print("=" * 50)
    
    try:
        # First, let's make sure the developer account exists and has the right role
        print("1. Checking developer account...")
        
        # Try to get the developer account
        developer_profiles = supabase.table('profiles').select('*').eq('email', 'dev@transflow.com').execute()
        
        if not developer_profiles.data:
            print("❌ Developer account not found. Creating one...")
            # We'll need to create the developer account
            print("Please create the developer account manually in Supabase or use the signup process")
        else:
            dev_profile = developer_profiles.data[0]
            print(f"✅ Developer account found: {dev_profile['name']} ({dev_profile['email']})")
            
            # Check if developer has the right role
            if dev_profile.get('role_id'):
                roles_result = supabase.table('roles').select('*').eq('id', dev_profile['role_id']).execute()
                if roles_result.data:
                    role_name = roles_result.data[0]['name']
                    print(f"   Current role: {role_name}")
                    
                    if role_name != 'developer':
                        print("⚠️  Developer account doesn't have 'developer' role")
                        # Find developer role ID
                        dev_role_result = supabase.table('roles').select('*').eq('name', 'developer').execute()
                        if dev_role_result.data:
                            dev_role_id = dev_role_result.data[0]['id']
                            print(f"   Updating role to developer (ID: {dev_role_id})...")
                            
                            update_result = supabase.table('profiles').update({
                                'role_id': dev_role_id
                            }).eq('id', dev_profile['id']).execute()
                            
                            if update_result.data:
                                print("✅ Developer role updated successfully!")
                            else:
                                print("❌ Failed to update developer role")
                    else:
                        print("✅ Developer account has correct role")
            else:
                print("⚠️  Developer account has no role assigned")
        
        print("\n2. Migration information:")
        print("The following RLS bypass policies will be created:")
        print("- Developers can view all profiles")
        print("- Developers can view all operations") 
        print("- Developers can view all agencies")
        print("- Developers can view all commission records")
        print("- Developers can view all transaction ledger")
        print("- Developers can view all request tickets")
        print("- Developers can view all notifications")
        print("\n3. Updated functions:")
        print("- get_admin_dashboard_kpis() - now works for developers")
        print("- get_validation_queue_stats() - now works for developers")
        print("- get_developer_debug_info() - new debug function for developers")
        
        # Read the migration file to show what will be applied
        migration_file = Path(__file__).parent / "supabase" / "migrations" / "20250625140000_developer_rls_bypass.sql"
        
        if migration_file.exists():
            with open(migration_file, 'r', encoding='utf-8') as f:
                migration_content = f.read()
            
            print(f"\n4. Migration file ready: {migration_file}")
            print(f"   Size: {len(migration_content)} characters")
            print("   Status: Ready to apply")
            
            print("\n" + "="*50)
            print("🚀 NEXT STEPS:")
            print("1. Apply this migration to your Supabase database")
            print("2. Log in with dev@transflow.com account")
            print("3. Navigate to Admin Dashboard (/dashboard/admin)")
            print("4. You should now see data instead of permission errors")
            print("\n💡 The developer account will bypass all RLS restrictions")
            print("   and have full access to all dashboards and data.")
            
        else:
            print(f"❌ Migration file not found: {migration_file}")
            
    except Exception as e:
        print(f"❌ Error during setup: {str(e)}")
        print("\nThis is likely because the migration hasn't been applied yet.")
        print("Please apply the migration file to Supabase first.")

def show_migration_instructions():
    """Show instructions for applying the migration"""
    print("\n" + "="*60)
    print("📋 MIGRATION APPLICATION INSTRUCTIONS")
    print("="*60)
    print("\nTo apply the developer RLS bypass migration:")
    print("\n1. Copy the contents of:")
    print("   /app/supabase/migrations/20250625140000_developer_rls_bypass.sql")
    print("\n2. Go to your Supabase dashboard:")
    print("   https://supabase.com/dashboard/project/khgbnikgsptoflokvtzu")
    print("\n3. Navigate to SQL Editor")
    print("\n4. Paste and execute the migration SQL")
    print("\n5. Verify the developer account exists with role 'developer'")
    print("\n6. Log in to the app with dev@transflow.com")
    print("\nAfter applying the migration, the developer account will have:")
    print("✅ Full access to all dashboards")
    print("✅ Bypass all RLS restrictions")
    print("✅ View all data across all agencies")
    print("✅ Access to debug functions")

if __name__ == "__main__":
    try:
        apply_developer_rls_bypass()
        show_migration_instructions()
    except Exception as e:
        print(f"Script error: {str(e)}")
        show_migration_instructions()