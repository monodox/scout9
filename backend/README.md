# Scout9 Backend

FastAPI backend for Scout9 esports scouting tool.

## Tech Stack

- FastAPI
- Python 3.10+
- SQLAlchemy (SQLite/PostgreSQL)
- GRID API integration
- Pydantic for data validation

## Project Structure

```
backend/
├── app/
│   ├── main.py              # App entry point
│   │
│   ├── core/
│   │   ├── config.py        # Environment variables
│   │   └── database.py      # DB connection
│   │
│   ├── api/
│   │   ├── scout.py         # Scouting endpoints
│   │   ├── report.py        # Report endpoints
│   │   ├── players.py       # Player endpoints
│   │   ├── strategies.py    # Strategy endpoints
│   │   ├── compositions.py  # Composition endpoints
│   │   ├── system.py        # System endpoints
│   │   └── settings.py      # Settings endpoints
│   │
│   ├── services/
│   │   ├── grid_service.py  # GRID API integration
│   │   ├── analysis.py      # Data analysis logic
│   │   └── insights.py      # Insight generation
│   │
│   ├── models/
│   │   └── report.py        # Database models
│   │
│   ├── schemas/
│   │   ├── scout.py         # Pydantic schemas
│   │   └── report.py
│   │
│   └── utils/
│       └── cache.py         # Simple caching
│
├── requirements.txt
├── .env.example
└── README.md
```

## Getting Started

### 1. Install Dependencies

```bash
pip install -r requirements.txt
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:
- Add your GRID API key
- Configure database URL
- Set secret key

### 3. Run Development Server

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`

API documentation: `http://localhost:8000/docs`

## API Endpoints

### Frontend to Backend Route Mapping

| Frontend Page | Backend Route |
|--------------|---------------|
| Dashboard | `GET /api/system/overview` |
| Scout | `POST /api/scout/run` |
| Report | `GET /api/report/{id}` |
| Players | `GET /api/players/{id}` |
| Strategies | `GET /api/strategies/{id}` |
| Compositions | `GET /api/compositions/{id}` |
| Settings | `GET/PUT /api/settings` |
| System | `GET /api/system/status` |
| Support | `POST /api/support` |

### Scout
- `POST /api/scout/run` - Run scout analysis
- `GET /api/scout/` - List scouts
- `GET /api/scout/{id}` - Get scout details

### Report
- `GET /api/report/` - List reports
- `GET /api/report/{id}` - Get report
- `POST /api/report/generate` - Generate report

### Players
- `GET /api/players/` - List players
- `GET /api/players/{id}` - Get player stats
- `POST /api/players/` - Add player

### Strategies
- `GET /api/strategies/` - List strategies
- `GET /api/strategies/{id}` - Get strategy
- `POST /api/strategies/analyze` - Analyze strategy

### Compositions
- `GET /api/compositions/` - List compositions
- `GET /api/compositions/{id}` - Get composition
- `POST /api/compositions/analyze` - Analyze composition

### System
- `GET /api/system/overview` - Dashboard overview
- `GET /api/system/status` - System status
- `GET /api/system/health` - System health
- `GET /api/system/grid-status` - GRID API status
- `POST /api/system/cache/clear` - Clear cache

### Settings
- `GET /api/settings/` - Get settings
- `PUT /api/settings/` - Update settings

### Support
- `POST /api/support/` - Submit support request
- `GET /api/support/` - Get support tickets

## Development

### Database Migrations

Initialize database:

```python
from app.core.database import init_db
init_db()
```

### Testing GRID API

Set your GRID API key in `.env`:

```
GRID_API_KEY=your_api_key_here
```

## Contributing

See the main [CONTRIBUTING.md](../CONTRIBUTING.md) in the root directory.
