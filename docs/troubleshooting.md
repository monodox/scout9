# Troubleshooting

## Overview

Common issues and solutions for Scout9 development and deployment. If you encounter an issue not listed here, check the GitHub Issues or reach out for support.

---

## Database Issues

### Connection Refused
**Error**:
```
sqlalchemy.exc.OperationalError: (psycopg2.OperationalError) 
could not connect to server: Connection refused
```

**Possible Causes**:
1. Database URL incorrect
2. Supabase project paused
3. Firewall blocking connection
4. SSL configuration missing

**Solutions**:

#### Check Connection String
```bash
# Verify format
echo $SUPABASE_DB_URL
# Should be: postgresql://postgres.[ref]:[password]@...pooler.supabase.com:6543/postgres?sslmode=require
```

#### Test Connection with psql
```bash
psql "$SUPABASE_DB_URL"
# If this fails, issue is with database, not application
```

#### Verify SSL Mode
```bash
# Connection string MUST include sslmode=require
SUPABASE_DB_URL="postgresql://...?sslmode=require"
```

#### Check Supabase Project Status
1. Open Supabase Dashboard
2. Verify project is "Active" (not paused)
3. Free tier projects pause after 1 week of inactivity

---

### Tables Don't Exist
**Error**:
```
sqlalchemy.exc.ProgrammingError: (psycopg2.errors.UndefinedTable) 
relation "reports" does not exist
```

**Solution**: Initialize database tables

```bash
# Method 1: Python command
python -c "from app.core.database import init_db; init_db()"

# Method 2: Python script
cd backend
python
>>> from app.core.database import Base, engine
>>> Base.metadata.create_all(bind=engine)
>>> exit()
```

---

### Pool Timeout / Too Many Connections
**Error**:
```
sqlalchemy.exc.TimeoutError: QueuePool limit of size 5 overflow 10 reached
```

**Solutions**:

#### Increase Pool Size
```python
# backend/app/core/database.py
engine = create_engine(
    settings.SUPABASE_DB_URL,
    pool_size=20,       # Increase from 10
    max_overflow=40,    # Increase from 20
    pool_pre_ping=True
)
```

#### Use Connection Pooler
```bash
# Ensure using pooler endpoint (port 6543)
SUPABASE_DB_URL="postgresql://...pooler.supabase.com:6543/..."
# Not direct connection (port 5432)
```

#### Close Unused Connections
```python
# Ensure sessions are properly closed
db = SessionLocal()
try:
    # ... operations
finally:
    db.close()  # Always close
```

---

## GRID API Issues

### API Key Not Working
**Error**:
```
httpx.HTTPStatusError: 401 Client Error: Unauthorized
```

**Solutions**:

#### Verify API Key
```bash
# Check environment variable is set
echo $GRID_API_KEY

# Test with curl
curl -H "x-api-key: $GRID_API_KEY" \
     https://api-op.grid.gg/central-data/graphql \
     -d '{"query": "{ __typename }"}'
```

#### Check Key Format
- Key should be alphanumeric string
- No extra spaces or quotes
- No `Bearer` prefix (that's for JWT tokens)

#### Regenerate Key
1. Visit GRID developer portal
2. Revoke old key
3. Generate new key
4. Update environment variable
5. Restart application

---

### Rate Limit Exceeded
**Error**:
```
httpx.HTTPStatusError: 429 Client Error: Too Many Requests
```

**Solutions**:

#### Enable Caching
```python
# backend/app/core/config.py
CACHE_ENABLED = True
CACHE_TTL = 3600  # 1 hour
```

#### Reduce Request Frequency
```python
# Limit matches fetched per scout run
async def run_scout(request: ScoutRequest):
    # Reduce from 100 to 50
    matches = await grid_service.get_team_matches(team_id, limit=50)
```

#### Wait and Retry
Rate limits typically reset after 1 hour. Use exponential backoff:

```python
import asyncio
from tenacity import retry, wait_exponential, stop_after_attempt

@retry(
    wait=wait_exponential(multiplier=1, min=4, max=60),
    stop=stop_after_attempt(3)
)
async def fetch_with_retry():
    return await grid_service.search_team(...)
```

---

### Empty Match Data
**Issue**: Scout completes but reports show 0 matches

**Possible Causes**:
1. Team name misspelled
2. No matches in date range
3. GRID API using mock mode
4. Team ID not found

**Solutions**:

#### Verify Team Name
```python
# Search for team first
teams = await grid_service.search_team("Team Liquid", "valorant")
print(teams)  # Check exact name spelling
```

#### Check Date Range
```python
# Ensure dates are valid
date_from = "2024-01-01"  # Not in the future
date_to = "2024-01-31"    # After date_from
```

#### Check Mock Mode
```bash
# If GRID_API_KEY not set, mock data is used
echo $GRID_API_KEY

# Set real key to get actual data
export GRID_API_KEY="your_key_here"
```

---

## Frontend Issues

### API Connection Failed
**Error** (in browser console):
```
Failed to fetch
Network request failed
CORS policy: No 'Access-Control-Allow-Origin' header
```

**Solutions**:

#### Check API URL
```bash
# frontend/.env.local
VITE_API_URL=http://localhost:8000  # Development
VITE_API_URL=https://api.scout9.com  # Production
```

#### Verify Backend is Running
```bash
curl http://localhost:8000/api/system/health
# Should return: {"status": "healthy"}
```

#### Fix CORS Configuration
```python
# backend/app/main.py
from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",  # Vite dev server
        "https://scout9.com"      # Production
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)
```

---

### Report Not Loading
**Issue**: Clicking report shows loading spinner forever

**Solutions**:

#### Check Report Status
```bash
# Get report details
curl http://localhost:8000/api/report/{report_id}
# Check "status" field: "pending", "processing", "completed", "error"
```

#### Check Browser Console
Open DevTools (F12) → Console → Look for errors

#### Verify Report Exists
```python
# Backend logs
# Look for background task completion
[INFO] Scout run completed for report {uuid}
```

#### Check for Errors
```bash
# Get report to see error_message
curl http://localhost:8000/api/report/{report_id}
# If status="error", check error_message field
```

---

## Export Issues

### PDF Export Fails
**Error**:
```
ModuleNotFoundError: No module named 'weasyprint'
```

**Solution**: Install weasyprint dependencies

```bash
# macOS
brew install cairo pango gdk-pixbuf libffi

# Ubuntu/Debian
sudo apt-get install -y \
    build-essential \
    libcairo2 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libgdk-pixbuf2.0-0 \
    libffi-dev \
    shared-mime-info

# Install Python package
pip install weasyprint

# Verify installation
python -c "import weasyprint; print(weasyprint.__version__)"
```

**Fallback**: Use HTML export if PDF fails

---

### Export Shows Empty Data
**Issue**: Export file downloads but contains no content

**Solutions**:

#### Verify Report Has Data
```bash
curl http://localhost:8000/api/report/{report_id}/players
# Should return array of players
```

#### Check Template Rendering
```python
# Test template directly
from jinja2 import Environment, FileSystemLoader
env = Environment(loader=FileSystemLoader('app/templates'))
template = env.get_template('report_template.html')
html = template.render(report={}, players=[], strategies=[], compositions=[])
print(html)  # Should show HTML
```

---

## Authentication Issues

### Token Invalid / Expired
**Error**:
```
{"detail": "Invalid authentication credentials"}
```

**Solutions**:

#### Check Token Format
```javascript
// Should be: "Bearer <token>"
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...

// NOT:
Authorization: eyJhbGciOiJIUzI1NiIs...  // Missing "Bearer"
```

#### Token Expiration
```python
# Backend: Check token expiration time
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

# If expired, user must login again
```

#### Clear and Re-login
```javascript
// Frontend: Clear token and redirect
localStorage.removeItem('access_token')
window.location.href = '/auth/login'
```

---

## Background Task Issues

### Scout Run Stuck in "Pending"
**Issue**: Report status never changes from "pending"

**Solutions**:

#### Check Background Task Execution
```python
# Add logging to background task
import logging
logger = logging.getLogger(__name__)

async def process_scout_run(report_id, request):
    logger.info(f"Starting scout run for report {report_id}")
    try:
        # ... processing
        logger.info(f"Scout run completed for report {report_id}")
    except Exception as e:
        logger.error(f"Scout run failed: {str(e)}", exc_info=True)
```

#### Check for Exceptions
```bash
# View backend logs
# Look for exceptions during background processing
```

#### Increase Timeout
```python
# If GRID API is slow
client = httpx.AsyncClient(timeout=60.0)  # Increase from 30s
```

---

## Development Issues

### Module Import Errors
**Error**:
```
ModuleNotFoundError: No module named 'app'
```

**Solutions**:

#### Check Working Directory
```bash
# Should be in backend/ directory
pwd
cd backend
```

#### Install in Editable Mode
```bash
pip install -e .
```

#### Set PYTHONPATH
```bash
export PYTHONPATH="${PYTHONPATH}:$(pwd)"
```

---

### Hot Reload Not Working
**Issue**: Changes to code don't reflect in running application

**Solutions**:

#### Verify Reload Flag
```bash
# Backend
uvicorn app.main:app --reload  # Must include --reload

# Frontend
npm run dev  # Vite has HMR by default
```

#### Check File Watching
```bash
# If on Docker/VM, file watching may not work
# Use polling instead
uvicorn app.main:app --reload --reload-dir app
```

---

## Testing Issues

### Tests Fail with Database Errors
**Error**:
```
sqlalchemy.exc.OperationalError: no such table: reports
```

**Solution**: Ensure test database is created

```python
# tests/conftest.py
@pytest.fixture
def test_db():
    engine = create_engine("sqlite:///:memory:")
    Base.metadata.create_all(bind=engine)  # Create tables
    # ... rest of fixture
```

---

### Async Tests Fail
**Error**:
```
RuntimeError: Event loop is closed
```

**Solution**: Configure pytest-asyncio

```ini
# pytest.ini
[pytest]
asyncio_mode = auto
```

---

## Deployment Issues

### Environment Variables Not Loading
**Issue**: Application can't find SUPABASE_DB_URL in production

**Solutions**:

#### Verify Variables Set
```bash
# Render/Railway dashboard
# Settings → Environment Variables
# Confirm all required vars exist
```

#### Check Variable Names
```bash
# Backend expects:
SUPABASE_DB_URL  # Not DATABASE_URL
GRID_API_KEY     # Not GRID_KEY
SECRET_KEY       # Not JWT_SECRET
```

#### Restart Service
After adding environment variables, restart the service for changes to take effect.

---

### Build Fails in Production
**Error** (Docker build):
```
ERROR: Could not find a version that satisfies the requirement
```

**Solutions**:

#### Pin Dependencies
```txt
# requirements.txt
fastapi==0.109.0  # Not: fastapi>=0.109.0
sqlalchemy==2.0.25
# ... all dependencies pinned
```

#### Clear Build Cache
```bash
# Local Docker
docker build --no-cache .

# Render
# Settings → Manual Deploy → Clear build cache
```

---

## Performance Issues

### Slow Scout Runs
**Issue**: Taking >30 seconds to complete

**Solutions**:

#### Reduce Match Limit
```python
# Fetch fewer matches
matches = await grid_service.get_team_matches(team_id, limit=30)  # Was 100
```

#### Enable Caching
```python
CACHE_ENABLED = True
CACHE_TTL = 3600
```

#### Use Background Tasks
Ensure scout runs use FastAPI background tasks (already implemented).

---

### High Database CPU Usage
**Issue**: Supabase showing high CPU in dashboard

**Solutions**:

#### Add Missing Indexes
```sql
CREATE INDEX idx_reports_team_name ON reports(team_name);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_report_players_report_id ON report_players(report_id);
```

#### Optimize Queries
```python
# ❌ Bad: N+1 query
reports = db.query(Report).all()
for report in reports:
    print(report.players)  # Separate query each time

# ✅ Good: Eager loading
from sqlalchemy.orm import joinedload
reports = db.query(Report).options(
    joinedload(Report.players)
).all()
```

---

## Getting Help

### Check Logs
1. **Backend**: Application logs (stdout/stderr)
2. **Frontend**: Browser console (F12)
3. **Database**: Supabase logs (Dashboard → Logs)

### Debug Mode
```bash
# Enable detailed logging
export DEBUG=True
export LOG_LEVEL=DEBUG
```

### Community Support
- GitHub Issues: [github.com/monodox/scout9/issues](https://github.com/monodox/scout9/issues)
- Discussions: GitHub Discussions
- Email: support@scout9.com (if configured)

### Reporting Bugs
Include:
1. Error message (full stack trace)
2. Steps to reproduce
3. Environment (local/production, OS, Python version)
4. Relevant logs
5. Screenshot (if UI issue)

---

## Quick Diagnostics

### Backend Health Check
```bash
curl http://localhost:8000/api/system/health
# Expected: {"status": "healthy", ...}
```

### Database Connection Test
```bash
psql "$SUPABASE_DB_URL" -c "SELECT version();"
```

### GRID API Test
```bash
curl -H "x-api-key: $GRID_API_KEY" \
     https://api-op.grid.gg/central-data/graphql \
     -d '{"query": "{ __typename }"}'
# Expected: {"data": {"__typename": "query"}}
```

### Frontend Build Test
```bash
cd frontend
npm run build
# Should complete without errors
```

---

## Related Documentation

- [Deployment](deployment.md) - Production setup
- [Database Schema](database-schema.md) - Database structure
- [GRID Integration](grid-integration.md) - API usage
- [Testing](testing.md) - Test suite
