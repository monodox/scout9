# Database Schema

## Overview

Scout9 uses **PostgreSQL** (via Supabase) with **SQLAlchemy ORM**. The schema is designed to store analyzed scouting data with flexibility for evolving GRID API responses.

## Core Design Principles

1. **UUID Primary Keys**: Better security and distribution than integers
2. **JSONB Columns**: Store complex nested data without rigid schema
3. **Relationships**: SQLAlchemy relationships with cascade deletes
4. **Timestamps**: Track creation and updates automatically
5. **No Direct GRID Data**: Store analyzed/processed data, not raw API responses

---

## Tables

### 1. `reports`
**Purpose**: Core scouting report - one per scout run

```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_name VARCHAR(255) NOT NULL,
    game VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'pending',
    match_range JSONB,
    summary_json JSONB,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_reports_team_name ON reports(team_name);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);
```

#### Columns

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `team_name` | VARCHAR(255) | Team being scouted (e.g., "Team Liquid") |
| `game` | VARCHAR(100) | Game slug (e.g., "valorant", "lol") |
| `status` | VARCHAR(50) | `pending`, `processing`, `completed`, `error` |
| `match_range` | JSONB | Date filters and match criteria |
| `summary_json` | JSONB | High-level insights and metadata |
| `error_message` | TEXT | Error details if status is `error` |
| `created_at` | TIMESTAMPTZ | When report was created |
| `updated_at` | TIMESTAMPTZ | Last modification time |

#### `match_range` JSONB Structure
```json
{
  "date_from": "2024-01-01",
  "date_to": "2024-01-31",
  "min_matches": 10,
  "map_filter": null
}
```

#### `summary_json` JSONB Structure
```json
{
  "total_matches": 45,
  "date_range": {
    "start": "2024-01-01",
    "end": "2024-01-31"
  },
  "key_insights": [
    "Strong performance on Bind (75% win rate)",
    "Aggressive playstyle with high first blood rate",
    "Consistent Jett usage by primary duelist"
  ],
  "team_win_rate": 0.622,
  "most_played_maps": [
    {"map": "Bind", "count": 12},
    {"map": "Haven", "count": 10}
  ]
}
```

#### SQLAlchemy Model
```python
class Report(Base):
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_name = Column(String(255), nullable=False, index=True)
    game = Column(String(100), nullable=False)
    status = Column(String(50), nullable=False, default="pending", index=True)
    match_range = Column(JSONB, nullable=True)
    summary_json = Column(JSONB, nullable=True)
    error_message = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationships
    players = relationship("ReportPlayer", back_populates="report", cascade="all, delete-orphan")
    strategies = relationship("ReportStrategy", back_populates="report", cascade="all, delete-orphan")
    compositions = relationship("ReportComposition", back_populates="report", cascade="all, delete-orphan")
```

---

### 2. `report_players`
**Purpose**: Player performance analysis per report

```sql
CREATE TABLE report_players (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    player_name VARCHAR(255) NOT NULL,
    role VARCHAR(100),
    team VARCHAR(255),
    metrics_json JSONB NOT NULL,
    tendencies_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_report_players_report_id ON report_players(report_id);
CREATE INDEX idx_report_players_player_name ON report_players(player_name);
```

#### Columns

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `report_id` | UUID | Foreign key to `reports` |
| `player_name` | VARCHAR(255) | Player IGN (e.g., "TenZ") |
| `role` | VARCHAR(100) | Position (e.g., "Duelist", "Controller") |
| `team` | VARCHAR(255) | Team name |
| `metrics_json` | JSONB | Calculated statistics |
| `tendencies_json` | JSONB | AI-generated insights |
| `created_at` | TIMESTAMPTZ | When record was created |

#### `metrics_json` JSONB Structure
```json
{
  "total_matches": 45,
  "total_kills": 987,
  "total_deaths": 734,
  "total_assists": 456,
  "kd_ratio": 1.34,
  "avg_kills_per_match": 21.9,
  "avg_deaths_per_match": 16.3,
  "consistency_score": 0.82,
  "agent_pool": {
    "Jett": 30,
    "Raze": 10,
    "Phoenix": 5
  },
  "top_agents": ["Jett", "Raze"],
  "map_performance": {
    "Bind": {"kd": 1.5, "matches": 12},
    "Haven": {"kd": 1.2, "matches": 10}
  }
}
```

#### `tendencies_json` JSONB Structure
```json
{
  "labels": ["High fragging", "Aggressive playstyle", "Jett specialist"],
  "strengths": [
    "Exceptional aim with high K/D ratio",
    "Consistent performance across maps",
    "Versatile agent pool"
  ],
  "weaknesses": [
    "Lower performance on Haven",
    "Occasional over-aggression leading to early deaths"
  ],
  "playstyle_summary": "Aggressive entry fragger with consistent high-impact plays"
}
```

---

### 3. `report_strategies`
**Purpose**: Identified strategic patterns per report

```sql
CREATE TABLE report_strategies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    label VARCHAR(255) NOT NULL,
    confidence FLOAT DEFAULT 0.0,
    frequency INTEGER DEFAULT 0,
    success_rate FLOAT DEFAULT 0.0,
    details_json JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_report_strategies_report_id ON report_strategies(report_id);
CREATE INDEX idx_report_strategies_category ON report_strategies(category);
```

#### Columns

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `report_id` | UUID | Foreign key to `reports` |
| `category` | VARCHAR(100) | Strategy type (e.g., "Map Control", "Aggression") |
| `label` | VARCHAR(255) | Human-readable name |
| `confidence` | FLOAT | Detection confidence (0-1) |
| `frequency` | INTEGER | Times pattern observed |
| `success_rate` | FLOAT | Win rate when strategy used (0-1) |
| `details_json` | JSONB | Additional context |
| `created_at` | TIMESTAMPTZ | When record was created |

#### `details_json` JSONB Structure
```json
{
  "description": "Aggressive site takes with early map control",
  "example_matches": ["match-id-1", "match-id-2"],
  "conditions": {
    "map": "Bind",
    "side": "attack",
    "agent_comp": ["Jett", "Omen", "Sage", "Sova", "Killjoy"]
  },
  "win_rate_by_map": {
    "Bind": 0.75,
    "Haven": 0.60
  },
  "counter_strategies": [
    "Heavy utility usage to slow aggression",
    "Information denial through smokes"
  ]
}
```

---

### 4. `report_compositions`
**Purpose**: Team composition analysis per report

```sql
CREATE TABLE report_compositions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES reports(id) ON DELETE CASCADE,
    comp_key VARCHAR(500) NOT NULL,
    picks_json JSONB NOT NULL,
    win_rate FLOAT DEFAULT 0.0,
    pick_rate FLOAT DEFAULT 0.0,
    sample_size INTEGER DEFAULT 0,
    map_performance JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_report_compositions_report_id ON report_compositions(report_id);
CREATE INDEX idx_report_compositions_comp_key ON report_compositions(comp_key);
```

#### Columns

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `report_id` | UUID | Foreign key to `reports` |
| `comp_key` | VARCHAR(500) | Sorted agent list (e.g., "Jett,Omen,Sage,Sova,Viper") |
| `picks_json` | JSONB | Agent details |
| `win_rate` | FLOAT | Win percentage with this comp (0-1) |
| `pick_rate` | FLOAT | Pick frequency (0-1) |
| `sample_size` | INTEGER | Number of matches with this comp |
| `map_performance` | JSONB | Per-map breakdown |
| `created_at` | TIMESTAMPTZ | When record was created |

#### `picks_json` JSONB Structure
```json
{
  "agents": [
    {"name": "Jett", "role": "Duelist", "player": "TenZ"},
    {"name": "Omen", "role": "Controller", "player": "PlayerX"},
    {"name": "Sage", "role": "Sentinel", "player": "PlayerY"},
    {"name": "Sova", "role": "Initiator", "player": "PlayerZ"},
    {"name": "Viper", "role": "Controller", "player": "PlayerW"}
  ],
  "comp_type": "Double Controller"
}
```

#### `map_performance` JSONB Structure
```json
{
  "Bind": {
    "wins": 9,
    "total": 12,
    "win_rate": 0.75
  },
  "Haven": {
    "wins": 6,
    "total": 10,
    "win_rate": 0.60
  }
}
```

---

## Relationships

```
reports (1) ──→ (N) report_players
        │
        ├──→ (N) report_strategies
        │
        └──→ (N) report_compositions
```

### Cascade Delete
When a `report` is deleted, all related `report_players`, `report_strategies`, and `report_compositions` are automatically deleted.

```python
# SQLAlchemy configuration
players = relationship("ReportPlayer", cascade="all, delete-orphan")
```

---

## Indexes

Performance optimization for common queries:

```sql
-- Report lookups
CREATE INDEX idx_reports_team_name ON reports(team_name);
CREATE INDEX idx_reports_status ON reports(status);
CREATE INDEX idx_reports_created_at ON reports(created_at DESC);

-- Player analysis
CREATE INDEX idx_report_players_report_id ON report_players(report_id);
CREATE INDEX idx_report_players_player_name ON report_players(player_name);

-- Strategy filtering
CREATE INDEX idx_report_strategies_report_id ON report_strategies(report_id);
CREATE INDEX idx_report_strategies_category ON report_strategies(category);

-- Composition queries
CREATE INDEX idx_report_compositions_report_id ON report_compositions(report_id);
CREATE INDEX idx_report_compositions_comp_key ON report_compositions(comp_key);
```

---

## Migrations

Currently, tables are created via SQLAlchemy:

```python
from app.core.database import Base, engine

Base.metadata.create_all(bind=engine)
```

**Future**: Use Alembic for versioned migrations.

---

## Why JSONB?

### Advantages
1. **Flexibility**: GRID API fields can change without schema migrations
2. **Performance**: Indexed JSONB queries are fast
3. **Simplicity**: Store complex nested data naturally
4. **Queryable**: PostgreSQL supports JSONB operators (`->`, `->>`, `@>`)

### Example Query
```python
# Find reports with high win rate
db.query(Report).filter(
    Report.summary_json['team_win_rate'].astext.cast(Float) > 0.7
).all()
```

---

## Related Documentation

- [Architecture](architecture.md) - System design
- [Data Flow](data-flow.md) - How data moves
- [API Reference](api-reference.md) - Endpoint details
- [Supabase Usage](supabase-usage.md) - Database service
