"""
Database initialization script.

Run this to create all tables in your database.
"""
from app.core.database import engine, Base, init_db
from app.models.report import Report, ReportPlayer, ReportStrategy, ReportComposition
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def main():
    """Initialize database tables"""
    logger.info("Creating database tables...")
    
    try:
        # Create all tables
        Base.metadata.create_all(bind=engine)
        logger.info("✅ Database tables created successfully!")
        
        # Log created tables
        logger.info("Created tables:")
        for table in Base.metadata.sorted_tables:
            logger.info(f"  - {table.name}")
        
    except Exception as e:
        logger.error(f"❌ Error creating database tables: {e}")
        raise


if __name__ == "__main__":
    main()
