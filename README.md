# Scout9

An automated scouting tool that analyzes official esports match data to generate concise, coach-ready opponent reports highlighting strategies, player tendencies, and composition patterns.

**🔓 Open Source Project** - This is a public repository. Never commit credentials, API keys, or secrets. All sensitive configuration goes in `.env.local` which is git-ignored.

## ✨ Features

- Automated analysis of official esports match data via GRID API
- Coach-ready opponent reports with actionable insights
- Strategy and composition pattern identification
- Player tendency tracking and performance metrics
- Export reports in HTML, JSON, and PDF formats
- Real-time scouting for live matches
- JWT-based authentication (optional)
- Comprehensive testing suite

## 🏗️ Project Structure

```
scout9/
├── frontend/          # React + Vite + TypeScript frontend
│   ├── src/
│   │   ├── app/      # Route pages (Next.js style)
│   │   ├── components/ # Reusable components
│   │   ├── services/ # API client services
│   │   └── lib/      # Utilities
│   └── package.json
├── backend/           # FastAPI backend (Python)
│   ├── app/
│   │   ├── api/      # Route handlers
│   │   ├── core/     # Config, database, auth
│   │   ├── models/   # SQLAlchemy models
│   │   ├── schemas/  # Pydantic schemas
│   │   ├── services/ # Business logic
│   │   └── templates/ # HTML templates
│   ├── tests/        # Pytest test suite
│   └── requirements.txt
├── .env.example      # Environment template
└── README.md
```

## 🚀 Quick Start

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL (via Supabase or local)
- GRID API key (get from [grid.gg](https://grid.gg))

### Backend Setup

1. **Install Python dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

2. **Configure environment:**
   
   Copy `.env.example` to `.env.local` at repo root and fill in your values:
   ```bash
   cp .env.example .env.local
   ```
   
   Then edit `.env.local` with your actual credentials:
   ```env
   # Required: Get from https://supabase.com
   SUPABASE_DB_URL=postgresql://postgres.[project-ref]:[your-password]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?sslmode=require
   
   # Required: Get from https://grid.gg/developers
   GRID_API_KEY=your_actual_grid_api_key_here
   
   # Required: Generate with: openssl rand -hex 32
   SECRET_KEY=generate-a-strong-random-key-minimum-32-characters
   ```
   
   **⚠️ IMPORTANT:** Never commit `.env.local` to git! It's already in `.gitignore`.

3. **Initialize database:**
   ```bash
   python -c "from app.core.database import init_db; init_db()"
   ```

4. **Run the API server:**
   ```bash
   uvicorn app.main:app --reload
   ```
   
   API: http://localhost:8000  
   Docs: http://localhost:8000/docs

### Frontend Setup

1. **Install Node dependencies:**
   ```bash
   cd frontend
   npm install
   ```

2. **Configure environment (optional):**
   
   Frontend environment variables are in `.env.local` (same file at repo root).
   Update if needed:
   ```env
   VITE_API_URL=http://localhost:8000
   ```
� Environment Variables

All configuration is done via `.env.local` file at the project root. See [`.env.example`](.env.example) for the complete template.

**Required Variables:**
- `SUPABASE_DB_URL` - PostgreSQL connection string from Supabase
- `GRID_API_KEY` - API key from GRID (get at [grid.gg/developers](https://grid.gg/developers))
- `SECRET_KEY` - JWT signing key (generate with `openssl rand -hex 32`)

**Optional Variables:**
- `CACHE_ENABLED=True` - Enable GRID API response caching
- `CACHE_TTL=3600` - Cache duration in seconds
- `DEBUG=True` - Enable debug mode (set to `False` in production)

**Frontend Variables:**
- `VITE_API_URL=http://localhost:8000` - Backend API endpoint

**⚠️ Security Note:** Never commit `.env.local` to version control. Use `.env.example` as a template and fill in your actual values locally.

## �
3. **Run development server:**
   ```bash
   npm run dev
   ```
   
   App: http://localhost:5173

## 📊 Database Schema

The backend uses a lean database schema optimized for storing processed analysis results:

- **reports** - Core scouting reports (one per scout run)
- **report_players** - Player statistics and tendencies per report
- **report_strategies** - Identified strategic patterns per report
- **report_compositions** - Team composition analysis per report

All use UUID primary keys and JSONB columns for flexible data storage.

## 🔌 API Overview

### Core Endpoints

**Scouting:**
- `POST /api/scout/run` - Start new scouting analysis

**Reports:**
- `GET /api/report/` - List all reports
- `GET /api/report/{id}` - Get full report details
- `GET /api/report/{id}/export/html` - Export as HTML
- `GET /api/report/{id}/export/json` - Export as JSON
- `GET /api/report/{id}/export/pdf` - Export as PDF

**Analysis:**
- `GET /api/players/?report_id={uuid}` - List analyzed players
- `GET /api/strategies/?report_id={uuid}` - List strategies
- `GET /api/compositions/?report_id={uuid}` - List compositions

**Auth (Stubs):**
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user

Full API documentation available at `/docs` when server is running.

## 🧪 Testing

Run the test suite:

```bash
cd backend
pip install -r requirements-test.txt
pytest
```

Run with coverage:
```bash
pytest --cov=app --cov-report=html
```

Test coverage includes:
- Unit tests for analysis algorithms
- Integration tests for API endpoints
- Mock data for GRID API calls

## 🔄 How It Works

1. **User Input:** Team name, game, and date range
2. **Data Fetch:** Query GRID API for official match data
3. **Analysis:** FastAPI backend performs statistical analysis
   - Player performance metrics (K/D, consistency, tendencies)
   - Strategic pattern identification
   - Composition win/pick rates
4. **Insights:** Generate coach-ready insights
5. **Storage:** Save processed results to Supabase Postgres
6. **Export:** View in app or export as HTML/JSON/PDF

## 📈 Analysis Algorithms

### Player Tendencies
- **Consistency Score:** Performance stability across matches
- **K/D Ratio:** Kill/death average
- **Agent/Champion Pool:** Character preferences
- **Role Distribution:** Primary position identification
- **Tendency Labels:** "High fragging potential", "Team player", etc.

### Strategic Patterns
- Map performance analysis
- Win rate by strategic approach
- Frequency and success metrics

### Composition Analysis
- Unique team compositions
- Win rates and pick rates
- Map-specific performance
- Meta composition identification

## 🔐 Authentication

JWT-based authentication is implemented as stubs for demonstration. For production deployment:

1. Implement User model and database table
2. Add password reset functionality
3. Add email verification
4. Consider OAuth2 providers (Google, Discord, etc.)

**Security Best Practices:**
- ✅ `.env.local` is git-ignored to prevent secret leaks
- ✅ Use environment variables for all sensitive data
- ✅ Never hardcode API keys or passwords in code
- ✅ Generate strong `SECRET_KEY` with: `openssl rand -hex 32`
- ✅ Use `sslmode=require` for database connections
- ✅ Set `DEBUG=False` in production

## 📦 Dependencies

### Backend
- **FastAPI** - Modern web framework
- **SQLAlchemy** - ORM for database operations
- **httpx** - Async HTTP client for GRID API
- **Jinja2** - HTML template engine
- **python-jose** - JWT token handling
- **pytest** - Testing framework

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **React Router** - Client-side routing
- **TailwindCSS** - Styling
- **TypeScript** - Type safety

## 🌐 GRID API Integration

Scout9 uses GRID's official esports data APIs:

- **Central Data API (GraphQL)** - Team and match queries
- **Series State API (GraphQL)** - Live match data
- **File Download API (REST)** - Complete gameplay data

Mock mode available for development without API key.

## 📝 Development Roadmap

See [ROADMAP.md](ROADMAP.md) for detailed feature planning.

**Current Status:** v0.1.0 - Foundation Phase

**Completed:**
- ✅ Database models and schema
- ✅ GRID GraphQL client
- ✅ Analysis algorithms
- ✅ API endpoints with database operations
- ✅ Report export (HTML/JSON/PDF)
- ✅ Testing framework
- ✅ JWT auth stubs

**Next Steps:**
- Database migrations (Alembic)
- Real GRID API integration testing
- Full user authentication system
- Frontend UUID integration
- Advanced ML-based predictions

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines.

## 📄 License

See [LICENSE](LICENSE) for licensing information.

## 🔒 Security

See [SECURITY.md](SECURITY.md) for security policy and reporting vulnerabilities.

## 📚 Documentation

### Quick Links
- **[Backend README](backend/README.md)** - Backend setup and API documentation
- **[Frontend README](frontend/README.md)** - Frontend setup and development

### Detailed Documentation
- **[Architecture](docs/architecture.md)** - System design and component overview
- **[Data Flow](docs/data-flow.md)** - End-to-end request/response journey
- **[Database Schema](docs/database-schema.md)** - Tables, models, and relationships
- **[API Reference](docs/api-reference.md)** - Complete endpoint documentation
- **[GRID Integration](docs/grid-integration.md)** - Official esports data usage ⭐
- **[Supabase Usage](docs/supabase-usage.md)** - Database service configuration
- **[Authentication](docs/authentication.md)** - JWT auth design and roadmap
- **[Analysis Logic](docs/analysis-logic.md)** - Core intelligence algorithms
- **[Deployment](docs/deployment.md)** - Production hosting guide
- **[Testing](docs/testing.md)** - Test suite and quality assurance
- **[Troubleshooting](docs/troubleshooting.md)** - Common issues and solutions

### Project Information
- [Changelog](CHANGELOG.md) - Release history
- [Code of Conduct](CODE_OF_CONDUCT.md) - Community guidelines
- [Contributing](CONTRIBUTING.md) - Contribution guidelines
- [Security](SECURITY.md) - Security policy
- [Roadmap](ROADMAP.md) - Feature roadmap

## 💡 Credits

Built with:
- [FastAPI](https://fastapi.tiangolo.com/)
- [React](https://react.dev/)
- [GRID](https://grid.gg/) - Official esports data provider
- [Supabase](https://supabase.com/) - PostgreSQL hosting

---

**Scout9** - Automated esports scouting for competitive advantage 🎮📊
