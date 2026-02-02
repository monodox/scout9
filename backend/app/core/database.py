from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Supabase Postgres: Storage layer only (no analysis performed here)
# Stores processed results from FastAPI analysis services
database_url = settings.SUPABASE_DB_URL or settings.DATABASE_URL

engine = create_engine(
    database_url,
    connect_args={"check_same_thread": False} if "sqlite" in database_url else {},
    pool_pre_ping=True
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()


def get_db():
    """
    Dependency for database sessions.
    Provides access to Supabase Postgres for storing/retrieving processed analysis results.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


def init_db():
    """
    Initialize database tables in Supabase Postgres.
    Creates schema for storing scouting reports and derived analytics.
    """
    Base.metadata.create_all(bind=engine)
