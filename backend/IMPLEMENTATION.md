# Scout9 Backend Implementation

## 🎯 Overview

Complete implementation of the Scout9 backend with:
- ✅ SQLAlchemy database models (reports, players, strategies, compositions)
- ✅ GRID GraphQL client with real query structure
- ✅ Analysis algorithms for player tendencies and patterns
- ✅ Full CRUD API endpoints with database operations
- ✅ Report export (HTML/JSON/PDF)
- ✅ Testing framework (unit + integration tests)
- ✅ JWT authentication middleware stubs

## 📦 Setup

### 1. Install Dependencies

```bash
cd backend
pip install -r requirements.txt
```

For testing:
```bash
pip install -r requirements-test.txt
```

### 2. Configure Environment

Create `.env.local` at repo root:

```env
# Database (Required)
SUPABASE_DB_URL=postgresql://user:password@host:port/database?sslmode=require

# GRID API (Required for real data)
GRID_API_KEY=your_grid_api_key_here

# Security (Change in production)
SECRET_KEY=your-secret-key-change-in-production
```

### 3. Initialize Database

```bash
python init_db.py
```

This creates all tables:
- `reports` - Core scouting reports
- `report_players` - Player analysis per report
- `report_strategies` - Strategic patterns per report
- `report_compositions` - Team compositions per report

### 4. Run Server

```bash
uvicorn app.main:app --reload
```

API available at: http://localhost:8000
Docs available at: http://localhost:8000/docs

## 🏗️ Architecture

### Data Flow

```
GRID API (Official Data Source)
    ↓
FastAPI Backend (Analysis Engine)
    ├─ Grid Service: Fetch match data
    ├─ Analysis Service: Statistical analysis
    └─ Insights Service: Generate coach-ready insights
    ↓
Supabase Postgres (Storage Only)
    ↓
React Frontend (Visualization)
```

### Database Models

**Report** (UUID primary key)
- team_id, team_name, game
- match_range (JSONB)
- status (pending/processing/completed/failed)
- summary_json (JSONB) - AI-generated insights
- Relationships: players, strategies, compositions

**ReportPlayer**
- player_id, player_name, role, team
- metrics_json (JSONB) - K/D, consistency, scores
- tendencies_json (JSONB) - Labels, strengths, weaknesses

**ReportStrategy**
- category, label, confidence
- frequency, success_rate
- details_json (JSONB)

**ReportComposition**
- comp_key (sorted agent/champion names)
- picks_json (JSONB)
- win_rate, pick_rate, sample_size
- map_performance (JSONB)

## 🔌 API Endpoints

### Scout
- `POST /api/scout/run` - Start scouting analysis (returns report_id)

### Reports
- `GET /api/report/` - List all reports
- `GET /api/report/{id}` - Get full report with all data
- `GET /api/report/{id}/players` - Get report players
- `GET /api/report/{id}/strategies` - Get report strategies
- `GET /api/report/{id}/compositions` - Get report compositions
- `DELETE /api/report/{id}` - Delete report

### Export
- `GET /api/report/{id}/export/html` - Export as HTML
- `GET /api/report/{id}/export/json` - Export as JSON
- `GET /api/report/{id}/export/pdf` - Export as PDF (requires weasyprint)

### Players
- `GET /api/players/?report_id={uuid}` - List players in report
- `GET /api/players/{id}` - Get player with insights

### Strategies
- `GET /api/strategies/?report_id={uuid}` - List strategies
- `GET /api/strategies/{id}` - Get strategy details

### Compositions
- `GET /api/compositions/?report_id={uuid}` - List compositions
- `GET /api/compositions/{id}` - Get composition details

### Auth (Stubs)
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login (get JWT)
- `GET /api/auth/me` - Get current user
- `POST /api/auth/refresh` - Refresh token

## 🧪 Testing

Run all tests:
```bash
pytest
```

Run with coverage:
```bash
pytest --cov=app --cov-report=html
```

Run specific test file:
```bash
pytest tests/test_analysis.py -v
```

### Test Coverage

- **Unit Tests** (`test_analysis.py`)
  - Player performance analysis
  - Strategy identification
  - Composition analysis
  - Tendency generation
  - Edge cases (empty data, etc.)

- **Integration Tests** (`test_api.py`)
  - Scout run creates report
  - Report CRUD operations
  - Export endpoints (HTML/JSON)
  - Player/Strategy/Composition endpoints
  - Cascade deletion

## 📊 Analysis Algorithms

### Player Tendencies

Computes:
- **Consistency**: 1 - (stdev/mean) of scores
- **K/D Ratio**: avg_kills / avg_deaths
- **Agent Pool**: Frequency of each agent played
- **Role Distribution**: Primary role identification

Generates Labels:
- "Highly consistent performer" (consistency >= 0.8)
- "High fragging potential" (K/D >= 1.5)
- "Prefers {agent}" (agent played 3+ times)
- "Team player (high assists)" (avg_assists >= 8)

### Strategy Identification

- Map performance patterns
- Win rate by map
- Frequency analysis

### Composition Analysis

- Unique compositions (sorted agent keys)
- Win rates per composition
- Pick rates (frequency)
- Map-specific performance

## 🔐 Authentication

JWT-based auth stubs included for demonstration:

1. **Signup/Login** - Generate JWT tokens
2. **Protected Routes** - Use `Depends(get_current_user)`
3. **Optional Auth** - Use `Depends(get_current_user_optional)`

For production:
- Add User model and database table
- Implement password reset flow
- Add email verification
- Add refresh token rotation
- Consider OAuth2 providers

## 🌐 GRID Integration

The `GRIDGraphQLClient` provides real GraphQL query structure:

**Queries Implemented:**
- `search_team` - Find team by name
- `get_team_matches` - Fetch recent matches
- `get_match_details` - Get detailed match/player stats
- `get_live_series_state` - Real-time match data

**Mock Mode:**
If `GRID_API_KEY` not set, falls back to mock data for development.

**Caching:**
Match data cached for 1 hour (configurable via `CACHE_TTL`)

## 📤 Export Formats

### HTML Export
- Styled template with Tailwind-inspired CSS
- Player cards with stats
- Strategy and composition sections
- Print-friendly layout

### JSON Export
- Complete report data
- All players, strategies, compositions
- UUIDs preserved for referencing

### PDF Export
- Requires `weasyprint` library
- Falls back to HTML if not installed
- Production: Consider cloud PDF service

## 🚀 Deployment Checklist

1. ✅ Database schema created
2. ✅ Environment variables configured
3. ⏳ GRID API key obtained
4. ⏳ Change SECRET_KEY in production
5. ⏳ Set up database migrations (Alembic)
6. ⏳ Configure CORS for production domain
7. ⏳ Set up logging and monitoring
8. ⏳ Add rate limiting middleware
9. ⏳ Implement full user auth (if needed)
10. ⏳ Add input validation and sanitization

## 🔄 Background Tasks

Scout analysis runs in background:
1. User calls `POST /api/scout/run`
2. Report created with status="pending"
3. Background task starts
4. Status updates to "processing"
5. Analysis completes, status="completed"
6. Frontend polls `GET /api/report/{id}` for status

## 📝 Next Steps

1. **Database Migrations** - Add Alembic for schema versioning
2. **Real GRID Queries** - Test with actual GRID API key
3. **User Authentication** - Implement full user system
4. **Frontend Integration** - Update frontend to use UUIDs
5. **Advanced Analytics** - Add ML predictions
6. **Real-time Updates** - WebSocket for live scouting

## 🐛 Troubleshooting

**Database connection fails:**
- Check `SUPABASE_DB_URL` format
- Ensure `sslmode=require` is included
- Verify database exists and is accessible

**Import errors:**
- Run `pip install -r requirements.txt`
- Check Python version (3.9+)

**Tests fail:**
- Run `pip install -r requirements-test.txt`
- Ensure test database can be created

**PDF export fails:**
- Install weasyprint: `pip install weasyprint`
- Or use HTML export as fallback

## 📚 Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy ORM](https://docs.sqlalchemy.org/)
- [GRID API Documentation](https://grid.gg/developers)
- [Supabase Postgres](https://supabase.com/docs/guides/database)
