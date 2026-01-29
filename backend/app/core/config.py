from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # App
    APP_NAME: str = "Scout9"
    APP_VERSION: str = "0.1.0"
    DEBUG: bool = True

    # Database
    SUPABASE_DB_URL: Optional[str] = None
    DATABASE_URL: str = "sqlite:///./scout9.db"

    # GRID API
    GRID_API_KEY: Optional[str] = None
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
        env_file = "../../.env.local"
        case_sensitive = True


settings = Settings()
