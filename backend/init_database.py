"""
Initialize the database by creating all tables.
Run this script to set up the database schema.
"""
from app.core.database import init_db

if __name__ == "__main__":
    print("Initializing database...")
    init_db()
    print("✓ Database initialized successfully!")
    print("  All tables have been created.")
