from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Database: Supabase PostgreSQL only
database_url = settings.SUPABASE_DB_URL

engine = create_engine(
    database_url,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20
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
