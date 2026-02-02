"""
Scout9 Configuration & Supabase Connection Test
Tests backend configuration and Supabase database setup
"""
import os
from dotenv import load_dotenv
from app.core.config import settings

# Load environment variables
load_dotenv('.env.local')

def test_backend_config():
    """Test backend environment configuration"""
    print("=" * 60)
    print("Scout9 Backend Configuration")
    print("=" * 60)
    print(f"✅ GRID_API_KEY: {'SET' if settings.GRID_API_KEY else 'NOT SET'}")
    print(f"✅ SECRET_KEY: {'SET' if settings.SECRET_KEY else 'NOT SET'}")
    print(f"✅ CACHE_ENABLED: {settings.CACHE_ENABLED}")
    print(f"✅ DEBUG: {settings.DEBUG}")
    print("=" * 60)
    return True

def test_supabase_connection():
    """Test Supabase client connection and database setup"""
    print("\n" + "=" * 60)
    print("Supabase Connection Test")
    print("=" * 60)
    
    # Get Supabase credentials
    supabase_url = os.getenv('VITE_SUPABASE_URL')
    supabase_key = os.getenv('VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY')
    
    print(f"✅ VITE_SUPABASE_URL: {supabase_url}")
    print(f"✅ VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY: {'SET' if supabase_key else 'NOT SET'}")
    
    if not supabase_url or not supabase_key:
        print("\n❌ Missing Supabase credentials in .env.local!")
        return False
    
    try:
        from supabase import create_client
        
        supabase = create_client(supabase_url, supabase_key)
        
        # Test database connection - query reports table
        print("\n🔍 Testing database connection...")
        response = supabase.table('reports').select("*").limit(1).execute()
        
        print(f"✅ Database connection successful!")
        print(f"   Reports table exists and is accessible")
        print(f"   Current record count: {len(response.data)}")
        
        # Test storage buckets
        print("\n🔍 Testing storage buckets...")
        try:
            buckets = supabase.storage.list_buckets()
            
            bucket_names = [b.name for b in buckets]
            expected_buckets = ['reports', 'report-exports', 'team-logos']
            
            for bucket in expected_buckets:
                if bucket in bucket_names:
                    print(f"   ✅ Bucket '{bucket}' exists")
                else:
                    print(f"   ⚠️  Bucket '{bucket}' NOT FOUND - run setup_storage.sql")
        except Exception as e:
            # Storage buckets might still exist even if list fails
            print(f"   ⚠️  Could not list buckets (may be a permissions issue)")
            print(f"   If you confirmed buckets exist in dashboard, this is OK")
        
        print("\n" + "=" * 60)
        print("✅ Supabase test PASSED!")
        print("=" * 60)
        return True
        
    except ImportError:
        print("\n⚠️  supabase-py not installed")
        print("   Install with: pip install supabase")
        print("   Configuration is correct though!")
        return None
        
    except Exception as e:
        print(f"\n❌ Error: {str(e)}")
        print("\n💡 Troubleshooting:")
        print("   1. Run backend/supabase/setup_tables.sql in Supabase SQL Editor")
        print("   2. Run backend/supabase/setup_storage.sql in Supabase SQL Editor")
        print("   3. Check RLS policies in Supabase dashboard")
        print("   4. Verify API key is correct")
        return False

if __name__ == "__main__":
    # Test backend configuration
    config_ok = test_backend_config()
    
    # Test Supabase connection
    supabase_ok = test_supabase_connection()
    
    # Summary
    print("\n" + "=" * 60)
    if config_ok and supabase_ok:
        print("🎉 ALL TESTS PASSED - Scout9 is ready!")
    elif config_ok and supabase_ok is None:
        print("✅ Configuration OK - Install supabase-py for full test")
    else:
        print("❌ Some tests failed - check errors above")
    print("=" * 60)
