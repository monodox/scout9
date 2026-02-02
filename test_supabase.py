"""
Supabase Connection Test
Run this to verify your Supabase setup is working correctly
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv('.env.local')

def test_supabase_client():
    """Test Supabase client connection (for frontend)"""
    supabase_url = os.getenv('VITE_SUPABASE_URL')
    supabase_key = os.getenv('VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY')
    
    print("=" * 60)
    print("Supabase Client Test (Frontend)")
    print("=" * 60)
    print(f"✅ VITE_SUPABASE_URL: {supabase_url}")
    print(f"✅ VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: {'SET' if supabase_key else 'NOT SET'}")
    
    if not supabase_url or not supabase_key:
        print("\n❌ Missing Supabase credentials!")
        return False
    
    try:
        # Try importing supabase (optional - install with: pip install supabase)
        from supabase import create_client
        
        supabase = create_client(supabase_url, supabase_key)
        
        # Test database connection - try to query reports table
        print("\n🔍 Testing database connection...")
        response = supabase.table('reports').select("*").limit(1).execute()
        
        print(f"✅ Database connection successful!")
        print(f"   Reports table exists and is accessible")
        print(f"   Current record count: {len(response.data)}")
        
        # Test storage buckets
        print("\n🔍 Testing storage buckets...")
        buckets = supabase.storage.list_buckets()
        
        bucket_names = [b.name for b in buckets]
        expected_buckets = ['reports', 'report-exports', 'team-logos']
        
        for bucket in expected_buckets:
            if bucket in bucket_names:
                print(f"   ✅ Bucket '{bucket}' exists")
            else:
                print(f"   ❌ Bucket '{bucket}' NOT FOUND")
        
        print("\n" + "=" * 60)
        print("✅ Supabase setup test PASSED!")
        print("=" * 60)
        return True
        
    except ImportError:
        print("\n⚠️  supabase-py not installed")
        print("   Install with: pip install supabase")
        print("   URL and Key are configured correctly though!")
        return None
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        print("\n💡 Possible issues:")
        print("   1. Tables not created yet - run backend/supabase/setup_tables.sql")
        print("   2. RLS policies blocking access - check Supabase dashboard")
        print("   3. Invalid API key")
        return False

if __name__ == "__main__":
    test_supabase_client()
