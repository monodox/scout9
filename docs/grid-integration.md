# GRID Integration

## Overview

Scout9 uses **GRID** (https://grid.gg) as its official esports data provider. GRID supplies verified match statistics, player performance data, and team information across multiple esports titles.

**⚠️ CRITICAL**: GRID API is accessed **ONLY by the backend** and **ONLY during scouting operations**. The frontend never directly accesses GRID.

---

## Access Pattern

### When GRID is Called
✅ **During scout runs** (`POST /api/scout/run`)
- Team search
- Match history retrieval
- Player stats fetching

### When GRID is NOT Called
❌ Report viewing (uses cached database data)
❌ Player/strategy/composition pages (read from database)
❌ Export operations (use stored data)
❌ Frontend operations (never has GRID access)

---

## API Configuration

### Authentication
```python
# backend/app/core/config.py
GRID_API_KEY = os.getenv("GRID_API_KEY")
GRID_API_URL = "https://api-op.grid.gg/central-data/graphql"
```

### Headers
```python
headers = {
    "x-api-key": GRID_API_KEY,
    "Content-Type": "application/json"
}
```

---

## GraphQL Client

Implementation: `backend/app/services/grid_service.py`

### Class Structure
```python
class GRIDGraphQLClient:
    def __init__(self, api_key: str, base_url: str):
        self.api_key = api_key
        self.base_url = base_url
        self.client = httpx.AsyncClient(timeout=30.0)
    
    async def query(self, query: str, variables: dict) -> dict:
        """Execute GraphQL query"""
        
    async def search_team(self, team_name: str, game: str) -> dict:
        """Find team by name"""
        
    async def get_team_matches(self, team_id: str, limit: int) -> list:
        """Get match history"""
        
    async def get_match_details(self, series_id: str) -> dict:
        """Get detailed match stats"""
```

---

## GraphQL Queries

### 1. Team Search
**Purpose**: Find team ID by name

```graphql
query SearchTeam($name: String!, $game: String!) {
  teams(
    where: {
      name: { _ilike: $name }
      game: { id: { _eq: $game } }
    }
    limit: 1
  ) {
    id
    name
    slug
    logoUrl
    region
  }
}
```

**Variables**:
```json
{
  "name": "Team Liquid",
  "game": "valorant"
}
```

**Response**:
```json
{
  "data": {
    "teams": [
      {
        "id": "grid-team-id-123",
        "name": "Team Liquid",
        "slug": "team-liquid",
        "logoUrl": "https://...",
        "region": "NA"
      }
    ]
  }
}
```

---

### 2. Team Matches
**Purpose**: Get recent match history

```graphql
query TeamMatches($teamId: ID!, $limit: Int!, $startDate: DateTime) {
  series(
    where: {
      _and: [
        { teams: { id: { _eq: $teamId } } }
        { startTime: { _gte: $startDate } }
        { state: { _eq: "completed" } }
      ]
    }
    limit: $limit
    order_by: { startTime: desc }
  ) {
    id
    title
    startTime
    bestOf
    state
    teams {
      id
      name
      score
    }
    games {
      id
      number
      state
      map {
        id
        name
        imageUrl
      }
      winner {
        id
        name
      }
      segments {
        id
        teams {
          id
          name
          score
          players {
            id
            ign
            agent {
              id
              name
              role
              imageUrl
            }
            stats {
              kills
              deaths
              assists
              acs
              adr
              firstBloods
              clutchesWon
              headshotPercent
            }
          }
        }
      }
    }
  }
}
```

**Variables**:
```json
{
  "teamId": "grid-team-id-123",
  "limit": 50,
  "startDate": "2024-01-01T00:00:00Z"
}
```

**Response**: Nested structure with full match details

---

### 3. Live Series State (Future)
**Purpose**: Get real-time match status

```graphql
query LiveSeriesState($seriesId: ID!) {
  series(where: { id: { _eq: $seriesId } }) {
    id
    state
    currentGame {
      id
      state
      teams {
        id
        score
        players {
          ign
          agent {
            name
          }
          stats {
            kills
            deaths
          }
        }
      }
    }
  }
}
```

---

## Caching Strategy

### Cache Layer
Implementation: `backend/app/utils/cache.py`

```python
class CacheService:
    def __init__(self, ttl: int = 3600):
        self._cache = {}
        self._timestamps = {}
        self.ttl = ttl
    
    def get(self, key: str):
        if self._is_expired(key):
            return None
        return self._cache.get(key)
    
    def set(self, key: str, value: Any):
        self._cache[key] = value
        self._timestamps[key] = time.time()
```

### What Gets Cached

#### Team Search Results
- **Key**: `team:{team_name}:{game}`
- **TTL**: 1 hour (3600s)
- **Reason**: Team IDs don't change frequently

```python
cache_key = f"team:{team_name}:{game}"
cached_team = cache.get(cache_key)
if cached_team:
    return cached_team

team = await grid_client.search_team(team_name, game)
cache.set(cache_key, team)
```

#### Match History
- **Key**: `matches:{team_id}:{date_from}:{date_to}`
- **TTL**: 30 minutes (1800s)
- **Reason**: Historical data doesn't change

```python
cache_key = f"matches:{team_id}:{date_from}:{date_to}"
cached_matches = cache.get(cache_key)
if cached_matches:
    return cached_matches

matches = await grid_client.get_team_matches(team_id, limit)
cache.set(cache_key, matches)
```

#### Why Cache?
1. **Rate Limit Protection**: GRID has API call limits
2. **Performance**: Avoid redundant network calls
3. **Cost**: Reduce API usage costs
4. **Reliability**: Serve data during GRID outages

---

## Mock Mode

### When Mock Mode Activates
- `GRID_API_KEY` not set in environment
- GRID API returns errors
- Development/testing without API access

### Mock Data Generation
```python
def _generate_mock_matches(self, team_name: str, limit: int) -> list:
    """Generate realistic fake match data"""
    matches = []
    agents = ["Jett", "Omen", "Sage", "Sova", "Viper"]
    maps = ["Bind", "Haven", "Split", "Ascent", "Icebox"]
    
    for i in range(limit):
        match = {
            "id": f"mock-match-{i}",
            "map": random.choice(maps),
            "winner": team_name if random.random() > 0.4 else "Opponent",
            "players": [
                {
                    "name": f"Player{j}",
                    "agent": random.choice(agents),
                    "kills": random.randint(10, 30),
                    "deaths": random.randint(8, 25),
                    "assists": random.randint(2, 15)
                }
                for j in range(5)
            ]
        }
        matches.append(match)
    
    return matches
```

### Mock Mode Indicators
```python
if not self.api_key:
    logger.warning("GRID_API_KEY not set - using mock data")
    return self._generate_mock_matches(team_name, limit)
```

---

## Rate Limiting

### GRID API Limits
- **Standard**: 1000 requests/hour
- **Enterprise**: Custom limits

### Our Mitigation
1. **Caching**: Reduces duplicate calls
2. **Batch Operations**: Single scout run = 2-3 API calls
3. **Background Tasks**: No user-facing timeouts
4. **Error Handling**: Graceful degradation

---

## Error Handling

### Network Errors
```python
try:
    response = await self.client.post(
        self.base_url,
        json={"query": query, "variables": variables},
        headers=headers
    )
    response.raise_for_status()
except httpx.HTTPStatusError as e:
    logger.error(f"GRID API error: {e.response.status_code}")
    if self._has_mock_fallback():
        return self._generate_mock_matches(...)
    raise
```

### GraphQL Errors
```python
data = response.json()
if "errors" in data:
    logger.error(f"GraphQL errors: {data['errors']}")
    raise GRIDAPIError(data["errors"])
```

### Timeout Handling
```python
client = httpx.AsyncClient(
    timeout=30.0,  # 30 second timeout
    retries=2       # Retry failed requests
)
```

---

## Data Ownership

### What We Store
✅ **Processed/analyzed data** (our calculations)
✅ **Aggregated statistics** (our metrics)
✅ **Generated insights** (our AI labels)

### What We DON'T Store
❌ Raw GRID API responses
❌ Unprocessed match data
❌ Player images/assets from GRID
❌ Team logos from GRID (unless licensed separately)

### Example
```python
# ❌ DON'T store this
raw_grid_response = {
    "series": {...},  # Full GRID API response
    "games": [...]
}
db.add(RawGRIDData(response=raw_grid_response))  # WRONG

# ✅ DO store this
analyzed_data = {
    "kd_ratio": 1.34,              # Our calculation
    "consistency_score": 0.82,     # Our metric
    "tendencies": ["High fragging"] # Our insight
}
db.add(ReportPlayer(metrics_json=analyzed_data))  # CORRECT
```

---

## Supported Games

Current: **Valorant**

Future roadmap:
- League of Legends
- CS2
- Dota 2
- Rocket League

### Game-Specific Fields
```python
# Valorant
agent, acs, adr, first_bloods

# League of Legends (future)
champion, cs, gold, vision_score

# CS2 (future)
weapon, headshot_pct, adr, utility_damage
```

---

## Testing Without GRID Access

### Option 1: Mock Mode
```bash
# Don't set GRID_API_KEY
# Backend automatically uses mock data
```

### Option 2: Cached Data
```bash
# Run once with real API key
# Cache persists for testing
export GRID_API_KEY=real-key-here
# Run scout
# Stop backend
unset GRID_API_KEY
# Restart backend - uses cached data
```

### Option 3: Fixtures
```python
# tests/conftest.py
@pytest.fixture
def mock_grid_response():
    return {
        "teams": [{"id": "test-team", "name": "Test Team"}]
    }

def test_scout_run(mock_grid_response, monkeypatch):
    monkeypatch.setattr(
        "app.services.grid_service.GRIDGraphQLClient.search_team",
        lambda self, name, game: mock_grid_response
    )
```

---

## Compliance

### GRID Terms of Service
1. **Attribution**: Display "Data powered by GRID" where applicable
2. **No Redistribution**: Don't expose raw GRID data via public API
3. **Rate Limits**: Respect API call quotas
4. **Caching**: Follow recommended caching practices

### Our Implementation
- ✅ Backend-only access
- ✅ Caching with appropriate TTL
- ✅ Store only processed data
- ✅ No public raw data endpoints
- ✅ Attribution in UI (TODO)

---

## Related Documentation

- [Architecture](architecture.md) - System design
- [Data Flow](data-flow.md) - Request journey
- [Analysis Logic](analysis-logic.md) - What we do with GRID data
- [Troubleshooting](troubleshooting.md) - GRID API issues
