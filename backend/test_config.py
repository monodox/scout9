from app.core.config import settings

print("=" * 50)
print("Scout9 Backend Configuration")
print("=" * 50)
print(f"✅ SUPABASE_DB_URL: {'SET' if settings.SUPABASE_DB_URL else 'NOT SET'}")
print(f"✅ GRID_API_KEY: {'SET' if settings.GRID_API_KEY else 'NOT SET'}")
print(f"✅ SECRET_KEY: {'SET' if settings.SECRET_KEY else 'NOT SET'}")
print(f"✅ CACHE_ENABLED: {settings.CACHE_ENABLED}")
print(f"✅ DEBUG: {settings.DEBUG}")
print("=" * 50)
print("🎉 Configuration loaded successfully!")
