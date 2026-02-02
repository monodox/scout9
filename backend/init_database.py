"""
Initialize Supabase database tables for Scout9.
Run this script to set up the database schema in Supabase PostgreSQL.

Make sure SUPABASE_DB_URL is configured in .env.local before running.
"""
from app.core.database import init_db

if __name__ == "__main__":
    print("Initializing Supabase database...")
    try:
        init_db()
        print("✓ Supabase database initialized successfully!")
        print("  All tables have been created in PostgreSQL.")
    except Exception as e:
        print(f"✗ Error: {e}")
        print("\nEnsure SUPABASE_DB_URL is set in .env.local")
