from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Scout9"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True

    # Database - Supabase only
    SUPABASE_DB_URL: str  # Required, no fallback
    DATABASE_URL: Optional[str] = None  # Deprecated, use SUPABASE_DB_URL

    # GRID API
    GRID_API_KEY: str  # Required, no fallback
    GRID_API_URL: str = "https://api-op.grid.gg/central-data/graphql"
    GRID_CENTRAL_DATA_URL: str = "https://api-op.grid.gg/central-data/graphql"
    GRID_SERIES_STATE_URL: str = "https://api-op.grid.gg/series-state/v1"
    GRID_FILE_DOWNLOAD_URL: str = "https://api-op.grid.gg/file-download/v1"
    GRID_WS_EVENTS_URL: str = "wss://api-op.grid.gg/series-events/v1"

    # Cache
    CACHE_ENABLED: bool = True
    CACHE_TTL: int = 3600  # 1 hour

    # Security
    SECRET_KEY: str = "your-secret-key-change-in-production"
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 30

    class Config:
        env_file = "../.env.local"  # Look in parent directory (project root)
        env_file_encoding = "utf-8"
        case_sensitive = True
        extra = "ignore"  # Ignore extra env vars like VITE_*


settings = Settings()
