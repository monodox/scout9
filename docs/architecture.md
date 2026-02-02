# Architecture

## Overview

Scout9 is a **monorepo** with a clear separation between frontend and backend. The system automates esports scouting by fetching official match data, analyzing performance patterns, and delivering actionable insights.

## High-Level Design

```
┌──────────────┐
│   Browser    │
│  (React UI)  │
└──────┬───────┘
       │ HTTP/REST
       ↓
┌──────────────────┐
│  FastAPI Backend │
│  (Python 3.10+)  │
└────┬────────┬────┘
     │        │
     │        └──────────→  ┌────────────┐
     │                      │  GRID API  │
     │                      │ (GraphQL)  │
     ↓                      └────────────┘
┌─────────────┐
│  Supabase   │
│ (Postgres)  │
└─────────────┘
```

## Component Responsibilities

### Frontend (React + Vite)
- **Purpose**: User interface for scouting and analysis
- **Language**: TypeScript
- **Key Features**:
  - Scout creation forms
  - Report visualization
  - Player/strategy/composition detail views
  - Export controls (HTML/JSON/PDF)
- **Communication**: REST API to backend only
- **No Direct Access**: Does NOT connect to Supabase or GRID

### Backend (FastAPI)
- **Purpose**: Orchestration, analysis, persistence
- **Language**: Python 3.10+
- **Key Features**:
  - Scout run orchestration (background tasks)
  - GRID API integration (GraphQL client)
  - Analysis algorithms (player tendencies, strategies, compositions)
  - Report export (HTML templates → PDF)
  - JWT authentication (stub implementation)
- **Data Sources**: GRID API (read), Supabase (read/write)

### GRID API
- **Purpose**: Official esports match data provider
- **Access**: Backend only, via GraphQL queries
- **Usage Pattern**: On-demand during scout runs (not continuous polling)
- **Data Types**: Teams, matches, series, player stats

### Supabase (PostgreSQL)
- **Purpose**: Persistent storage for analyzed data
- **Access**: Backend only, via SQLAlchemy ORM
- **Authentication**: Service role key (secure)
- **Schema**: 4 tables (reports, players, strategies, compositions)

## Separation of Concerns

| Layer | Responsibility | Dependencies |
|-------|---------------|--------------|
| **Frontend** | Presentation, user interaction | Backend API |
| **Backend** | Business logic, orchestration | GRID API, Supabase |
| **GRID** | Raw match data | None (external service) |
| **Supabase** | Persistent storage | None (database) |

## Key Design Principles

### 1. Backend-Centric Architecture
- Frontend is a **thin client** - minimal logic
- All data fetching, processing, and storage happens in backend
- Frontend never accesses Supabase or GRID directly

### 2. Asynchronous Processing
- Scout runs use **background tasks** (FastAPI `BackgroundTasks`)
- API returns immediately with `report_id`
- Frontend polls or checks status later
- Prevents timeout issues on long-running analysis

### 3. Service Layer Pattern
```python
api/scout.py
  └─→ services/grid_service.py (fetch data)
       └─→ services/analysis.py (compute metrics)
            └─→ services/insights.py (generate labels)
                 └─→ database.py (persist results)
```

### 4. JSONB for Flexibility
- PostgreSQL JSONB columns store complex nested data
- Allows schema flexibility without migrations
- Examples: `metrics_json`, `tendencies_json`, `details_json`

### 5. UUID Primary Keys
- All models use UUID instead of integer IDs
- Better for distributed systems and security
- Prevents enumeration attacks

## Technology Stack

### Frontend
- **React 18.3** - UI library
- **TypeScript 5.3** - Type safety
- **Vite 5.1** - Build tool & dev server
- **React Router 6.22** - Client-side routing
- **TailwindCSS 3.4** - Utility-first styling

### Backend
- **FastAPI 0.109.0** - Web framework
- **SQLAlchemy 2.0.25** - ORM
- **Pydantic 2.5** - Data validation
- **httpx 0.26.0** - Async HTTP client (for GRID)
- **Jinja2 3.1.3** - HTML templating
- **python-jose 3.3.0** - JWT handling
- **weasyprint 60.2** - PDF generation

### Infrastructure
- **Supabase** - PostgreSQL database (hosted)
- **GRID** - Esports data API (GraphQL)

## Directory Structure

```
scout9/
├── frontend/              # React application
│   ├── src/
│   │   ├── app/          # Pages (Next.js-style routing)
│   │   ├── components/   # Reusable UI components
│   │   ├── services/     # API client services
│   │   └── lib/          # Utilities, API client
│   └── package.json
│
├── backend/              # FastAPI application
│   ├── app/
│   │   ├── api/         # Route handlers
│   │   ├── core/        # Config, database, auth
│   │   ├── models/      # SQLAlchemy models
│   │   ├── schemas/     # Pydantic schemas
│   │   ├── services/    # Business logic
│   │   ├── templates/   # HTML report templates
│   │   └── utils/       # Cache, helpers
│   ├── tests/           # Pytest test suite
│   └── requirements.txt
│
├── docs/                # Documentation (this folder)
└── README.md            # Main documentation
```

## Security Considerations

1. **API Keys**: GRID API key stored in backend env only
2. **Database**: Supabase service role key never exposed to frontend
3. **Authentication**: JWT tokens (currently stubs)
4. **CORS**: Backend configured to accept frontend origin
5. **Rate Limiting**: GRID API caching prevents excessive calls

## Scalability Patterns

### Current Scale (MVP)
- Single backend instance
- Synchronous background tasks
- In-memory caching

### Future Scale
- **Queue System**: Redis + Celery for distributed tasks
- **Caching Layer**: Redis for GRID API responses
- **Database**: Read replicas for analytics queries
- **CDN**: Static frontend assets
- **Load Balancer**: Multiple backend instances

## Deployment Model

- **Frontend**: Static hosting (Vercel, Netlify, Cloudflare Pages)
- **Backend**: Container deployment (Render, Railway, Fly.io)
- **Database**: Supabase managed PostgreSQL
- **Environment**: 12-factor app principles (env vars)

## Related Documentation

- [Data Flow](data-flow.md) - Request/response journey
- [Database Schema](database-schema.md) - Persistence layer
- [API Reference](api-reference.md) - Endpoint documentation
- [GRID Integration](grid-integration.md) - External API usage
