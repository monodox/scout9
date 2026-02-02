# Supabase Usage

## Overview

Scout9 uses **Supabase** as its PostgreSQL database provider. Supabase provides managed Postgres hosting with REST API capabilities, though Scout9 accesses it exclusively through SQLAlchemy ORM.

**⚠️ CRITICAL**: Supabase is accessed **ONLY by the backend** using the **service role key**. The frontend never directly connects to Supabase.

---

## Why Supabase?

### Advantages
1. **Managed PostgreSQL**: No server management
2. **Free Tier**: Generous limits for development
3. **JSONB Support**: Native support for flexible schemas
4. **UUID Functions**: Built-in `gen_random_uuid()`
5. **Real-time (Future)**: WebSocket support for live updates
6. **Authentication (Future)**: Built-in auth can replace JWT stubs

### Why Not Direct Supabase Client?
Scout9 uses **SQLAlchemy** instead of Supabase's JavaScript client because:
- ✅ Backend is Python (not JavaScript)
- ✅ SQLAlchemy provides better ORM features
- ✅ No vendor lock-in
- ✅ Standard PostgreSQL connection
- ✅ Easy to migrate to other Postgres providers

---

## Connection Configuration

### Environment Variables
```bash
# .env.local
SUPABASE_DB_URL=postgresql://postgres.[project-ref]:[password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
```

### Connection String Format
```
postgresql://<user>:<password>@<host>:<port>/<database>?sslmode=require
```

**Components**:
- `user`: `postgres.[project-ref]` (service role)
- `password`: Service role key or database password
- `host`: Pooler endpoint (e.g., `aws-0-us-east-1.pooler.supabase.com`)
- `port`: `6543` (transaction mode) or `5432` (session mode)
- `database`: Usually `postgres`
- `sslmode=require`: Force SSL connection

---

## SQLAlchemy Setup

### Database Engine
```python
# backend/app/core/database.py
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

# Create engine with connection pool
engine = create_engine(
    settings.SUPABASE_DB_URL,
    pool_size=10,           # Max connections
    max_overflow=20,        # Extra connections if pool full
    pool_pre_ping=True,     # Test connections before use
    echo=False              # Set True for SQL logging
)

# Session factory
SessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine
)

# Dependency for FastAPI
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
```

### Base Model
```python
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()

# All models inherit from Base
class Report(Base):
    __tablename__ = "reports"
    # ...
```

---

## Connection Pooling

### Pooler vs Direct Connection

#### Transaction Mode (Recommended)
```
postgresql://...pooler.supabase.com:6543/postgres
```
- ✅ Handles high connection volume
- ✅ Better for serverless/API applications
- ✅ Lower resource usage
- ⚠️ Each transaction gets new connection

#### Session Mode
```
postgresql://...supabase.com:5432/postgres
```
- ✅ Persistent connection per session
- ⚠️ Limited concurrent connections
- ⚠️ Higher resource usage

### Our Configuration
```python
engine = create_engine(
    settings.SUPABASE_DB_URL,  # Pooler endpoint
    pool_size=10,               # 10 persistent connections
    max_overflow=20,            # +20 overflow connections
    pool_recycle=3600,          # Recycle after 1 hour
    pool_pre_ping=True          # Health check before use
)
```

---

## Authentication

### Service Role Key
Scout9 uses **service role** for database access (not anon key).

**Finding Keys**:
1. Open Supabase Dashboard
2. Go to Project Settings → API
3. Copy `service_role` key

### Why Service Role?
- ✅ Full database access (bypasses RLS)
- ✅ Backend-only usage (never exposed)
- ✅ No row-level security conflicts
- ⚠️ Must be kept secret

### Security Considerations
```bash
# ❌ NEVER expose service role to frontend
VITE_SUPABASE_KEY=service_role_key  # WRONG!

# ✅ Backend only
SUPABASE_DB_URL=postgresql://...     # CORRECT
```

---

## Database Tables

### Tables Managed by Scout9

Scout9 creates and manages these tables:
- `reports` - Scouting reports
- `report_players` - Player analysis
- `report_strategies` - Strategy patterns
- `report_compositions` - Team compositions

### Schema Creation
```python
# backend/app/core/database.py
def init_db():
    """Create all tables"""
    Base.metadata.create_all(bind=engine)

# Run once on deployment
if __name__ == "__main__":
    init_db()
```

Or via Python:
```bash
python -c "from app.core.database import init_db; init_db()"
```

---

## Row Level Security (RLS)

### Current: RLS Disabled
Scout9 uses service role, which **bypasses RLS**.

### Future: User-Based RLS
When adding user authentication:

```sql
-- Enable RLS
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own reports
CREATE POLICY "Users view own reports"
ON reports
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can create reports
CREATE POLICY "Users create reports"
ON reports
FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

Then switch from service role to anon key with JWT:
```python
# Future implementation
user_token = get_jwt_token_from_request()
# Use Supabase client with user JWT
# Respects RLS policies automatically
```

---

## Migrations

### Current: No Migrations
Tables created via `Base.metadata.create_all()`.

### Future: Alembic
For production, use **Alembic** for versioned migrations:

```bash
# Install Alembic
pip install alembic

# Initialize
alembic init alembic

# Create migration
alembic revision --autogenerate -m "Add user_id to reports"

# Apply migrations
alembic upgrade head
```

**alembic/env.py**:
```python
from app.core.database import Base
from app.models import Report, ReportPlayer  # Import all models

target_metadata = Base.metadata
```

---

## Backups

### Automatic Backups
Supabase provides automatic daily backups (retained 7 days on free tier).

**Manual Backup**:
1. Supabase Dashboard → Database → Backups
2. Click "Create Backup"
3. Download SQL dump

### Restore Process
```bash
# Download backup SQL file
# Run against database
psql $SUPABASE_DB_URL < backup.sql
```

---

## Performance Optimization

### Indexes
```sql
-- Created automatically by SQLAlchemy
CREATE INDEX idx_reports_team_name ON reports(team_name);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
```

### JSONB Indexing
```sql
-- Index specific JSONB field
CREATE INDEX idx_reports_win_rate 
ON reports ((summary_json->>'team_win_rate'));

-- GIN index for JSONB queries
CREATE INDEX idx_players_metrics ON report_players USING GIN (metrics_json);
```

### Query Optimization
```python
# ❌ N+1 query problem
reports = db.query(Report).all()
for report in reports:
    print(report.players)  # Separate query per report

# ✅ Eager loading
from sqlalchemy.orm import joinedload

reports = db.query(Report).options(
    joinedload(Report.players),
    joinedload(Report.strategies)
).all()
# Single query with joins
```

---

## Monitoring

### Supabase Dashboard
View real-time metrics:
- Active connections
- Query performance
- Database size
- Error logs

**Access**:
1. Supabase Dashboard
2. Project → Database → Statistics

### Connection Monitoring
```python
# Log pool status
from sqlalchemy import event

@event.listens_for(engine, "connect")
def receive_connect(dbapi_conn, connection_record):
    logger.info(f"New database connection: {dbapi_conn}")

@event.listens_for(engine, "close")
def receive_close(dbapi_conn, connection_record):
    logger.info(f"Connection closed: {dbapi_conn}")
```

---

## Limits & Quotas

### Free Tier Limits
- **Storage**: 500 MB
- **Bandwidth**: 2 GB/month
- **Database Size**: 500 MB
- **Max Connections**: 60
- **API Requests**: 500K/month

### Pro Tier ($25/month)
- **Storage**: 8 GB
- **Bandwidth**: 50 GB/month
- **Database Size**: 8 GB
- **Max Connections**: 120
- **API Requests**: Unlimited

### Monitoring Usage
```sql
-- Check database size
SELECT pg_size_pretty(pg_database_size('postgres'));

-- Check table sizes
SELECT 
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename))
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- Check connection count
SELECT count(*) FROM pg_stat_activity;
```

---

## Local Development

### Option 1: Supabase Project
Use same database for dev/prod (not recommended).

### Option 2: Local Supabase
Run Supabase locally with Docker:

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize project
supabase init

# Start local Supabase
supabase start

# Get local connection string
supabase status
# Connection string: postgresql://postgres:postgres@localhost:54322/postgres
```

### Option 3: SQLite (Testing)
```python
# backend/tests/conftest.py
engine = create_engine(
    "sqlite:///:memory:",
    connect_args={"check_same_thread": False}
)
```

---

## Security Best Practices

### 1. Never Expose Service Role
```bash
# ❌ Frontend environment
VITE_SUPABASE_SERVICE_ROLE=xxx  # WRONG!

# ✅ Backend environment only
SUPABASE_DB_URL=postgresql://...  # CORRECT
```

### 2. Use Environment Variables
```python
# ❌ Hardcoded credentials
db_url = "postgresql://user:pass@host/db"

# ✅ Environment variables
from app.core.config import settings
db_url = settings.SUPABASE_DB_URL
```

### 3. Enable SSL
```bash
# Always use sslmode=require
SUPABASE_DB_URL=postgresql://...?sslmode=require
```

### 4. Rotate Keys Regularly
Change database password and service role key quarterly.

---

## Troubleshooting

### Connection Refused
```
sqlalchemy.exc.OperationalError: could not connect to server
```

**Solutions**:
1. Check connection string format
2. Verify Supabase project is active
3. Confirm IP not blocked (Supabase allows all by default)
4. Test with `psql $SUPABASE_DB_URL`

### SSL Error
```
ssl.SSLError: [SSL: CERTIFICATE_VERIFY_FAILED]
```

**Solution**: Add `sslmode=require` to connection string

### Pool Exhaustion
```
sqlalchemy.exc.TimeoutError: QueuePool limit exceeded
```

**Solutions**:
1. Increase `pool_size` and `max_overflow`
2. Check for unclosed connections
3. Use `pool_pre_ping=True`

### Too Many Connections
```
FATAL: remaining connection slots are reserved
```

**Solutions**:
1. Use pooler endpoint (port 6543)
2. Reduce `pool_size`
3. Upgrade Supabase plan

---

## Migration from Supabase

If switching to another Postgres provider:

1. **Export data**:
   ```bash
   pg_dump $SUPABASE_DB_URL > backup.sql
   ```

2. **Update connection string**:
   ```bash
   DATABASE_URL=postgresql://new-host/db
   ```

3. **Import data**:
   ```bash
   psql $DATABASE_URL < backup.sql
   ```

4. **No code changes needed** (SQLAlchemy abstraction)

---

## Related Documentation

- [Database Schema](database-schema.md) - Table structure
- [Architecture](architecture.md) - System design
- [Deployment](deployment.md) - Production setup
- [Troubleshooting](troubleshooting.md) - Common issues
