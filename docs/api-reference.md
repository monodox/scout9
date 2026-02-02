# API Reference

Complete backend API documentation for Scout9.

**Base URL**: `http://localhost:8000` (development)

**Documentation**: http://localhost:8000/docs (Swagger UI)

---

## Authentication

Currently using **stub implementation** (JWT-based). Most endpoints are **unauthenticated** in current version.

### Future Protected Endpoints
Protected routes will use JWT Bearer tokens:
```
Authorization: Bearer <token>
```

---

## Endpoints

## Scout Operations

### Run Scout
Create a new scouting analysis for a team.

**Endpoint**: `POST /api/scout/run`

**Request Body**:
```json
{
  "team_name": "Team Liquid",
  "game": "valorant",
  "date_from": "2024-01-01",
  "date_to": "2024-01-31",
  "min_matches": 10
}
```

**Response** (201 Created):
```json
{
  "report_id": "550e8400-e29b-41d4-a716-446655440000",
  "status": "pending",
  "message": "Scout run initiated. Check back for results."
}
```

**Status Codes**:
- `201`: Successfully created
- `400`: Invalid request data
- `500`: Server error

**Notes**:
- Returns immediately with `report_id`
- Processing happens in background
- Poll `/api/report/{report_id}` to check status

---

## Report Operations

### List Reports
Get all scouting reports with pagination.

**Endpoint**: `GET /api/report/`

**Query Parameters**:
- `skip` (int, default=0): Offset for pagination
- `limit` (int, default=50): Number of results

**Response** (200 OK):
```json
{
  "total": 150,
  "skip": 0,
  "limit": 50,
  "reports": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "team_name": "Team Liquid",
      "game": "valorant",
      "status": "completed",
      "created_at": "2024-01-15T10:30:00Z",
      "match_range": {
        "date_from": "2024-01-01",
        "date_to": "2024-01-31"
      },
      "summary_json": {
        "total_matches": 45,
        "key_insights": ["..."]
      }
    }
  ]
}
```

---

### Get Report
Retrieve a specific report with full details.

**Endpoint**: `GET /api/report/{report_id}`

**Path Parameters**:
- `report_id` (UUID): Report identifier

**Response** (200 OK):
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "team_name": "Team Liquid",
  "game": "valorant",
  "status": "completed",
  "match_range": {
    "date_from": "2024-01-01",
    "date_to": "2024-01-31"
  },
  "summary_json": {
    "total_matches": 45,
    "team_win_rate": 0.622,
    "key_insights": [
      "Strong performance on Bind (75% win rate)",
      "Aggressive playstyle with high first blood rate"
    ]
  },
  "created_at": "2024-01-15T10:30:00Z",
  "updated_at": "2024-01-15T10:35:12Z"
}
```

**Status Codes**:
- `200`: Success
- `404`: Report not found

---

### Get Report Players
List all players analyzed in a report.

**Endpoint**: `GET /api/report/{report_id}/players`

**Response** (200 OK):
```json
{
  "report_id": "550e8400-e29b-41d4-a716-446655440000",
  "players": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "player_name": "TenZ",
      "role": "Duelist",
      "team": "Team Liquid",
      "metrics_json": {
        "kd_ratio": 1.34,
        "avg_kills_per_match": 21.9,
        "consistency_score": 0.82,
        "agent_pool": {"Jett": 30, "Raze": 10}
      },
      "tendencies_json": {
        "labels": ["High fragging", "Aggressive playstyle"],
        "strengths": ["Exceptional aim", "Consistent performance"]
      }
    }
  ]
}
```

---

### Get Report Strategies
List all strategies identified in a report.

**Endpoint**: `GET /api/report/{report_id}/strategies`

**Response** (200 OK):
```json
{
  "report_id": "550e8400-e29b-41d4-a716-446655440000",
  "strategies": [
    {
      "id": "770e8400-e29b-41d4-a716-446655440002",
      "category": "Map Control",
      "label": "Aggressive Site Takes",
      "confidence": 0.87,
      "frequency": 34,
      "success_rate": 0.71,
      "details_json": {
        "description": "Early map control with fast site executions",
        "win_rate_by_map": {"Bind": 0.75, "Haven": 0.60}
      }
    }
  ]
}
```

---

### Get Report Compositions
List all team compositions in a report.

**Endpoint**: `GET /api/report/{report_id}/compositions`

**Response** (200 OK):
```json
{
  "report_id": "550e8400-e29b-41d4-a716-446655440000",
  "compositions": [
    {
      "id": "880e8400-e29b-41d4-a716-446655440003",
      "comp_key": "Jett,Omen,Sage,Sova,Viper",
      "win_rate": 0.75,
      "pick_rate": 0.27,
      "sample_size": 12,
      "picks_json": {
        "agents": [
          {"name": "Jett", "role": "Duelist"},
          {"name": "Omen", "role": "Controller"}
        ]
      },
      "map_performance": {
        "Bind": {"wins": 9, "total": 12, "win_rate": 0.75}
      }
    }
  ]
}
```

---

### Delete Report
Delete a report and all associated data.

**Endpoint**: `DELETE /api/report/{report_id}`

**Response** (204 No Content)

**Status Codes**:
- `204`: Successfully deleted
- `404`: Report not found

**Notes**: Cascade deletes all players, strategies, and compositions.

---

## Export Operations

### Export HTML
Export report as formatted HTML.

**Endpoint**: `GET /api/report/{report_id}/export/html`

**Response** (200 OK):
```html
<!DOCTYPE html>
<html>
<head>
  <title>Scout Report: Team Liquid</title>
  <style>...</style>
</head>
<body>
  <div class="report">
    <!-- Formatted report content -->
  </div>
</body>
</html>
```

**Content-Type**: `text/html`

---

### Export JSON
Export report as structured JSON.

**Endpoint**: `GET /api/report/{report_id}/export/json`

**Response** (200 OK):
```json
{
  "report": {...},
  "players": [...],
  "strategies": [...],
  "compositions": [...],
  "export_metadata": {
    "exported_at": "2024-01-15T10:40:00Z",
    "format": "json",
    "version": "1.0"
  }
}
```

**Content-Type**: `application/json`

---

### Export PDF
Export report as PDF document.

**Endpoint**: `GET /api/report/{report_id}/export/pdf`

**Response** (200 OK): Binary PDF data

**Content-Type**: `application/pdf`

**Content-Disposition**: `attachment; filename=report-{report_id}.pdf`

**Notes**:
- Requires `weasyprint` library
- Falls back to HTML if PDF generation fails
- Large reports may take time to generate

---

## Player Operations

### List Players
Get all players across reports with optional filtering.

**Endpoint**: `GET /api/players/`

**Query Parameters**:
- `report_id` (UUID, optional): Filter by report
- `skip` (int, default=0): Pagination offset
- `limit` (int, default=50): Results per page

**Response** (200 OK):
```json
{
  "total": 100,
  "players": [
    {
      "id": "660e8400-e29b-41d4-a716-446655440001",
      "report_id": "550e8400-e29b-41d4-a716-446655440000",
      "player_name": "TenZ",
      "role": "Duelist",
      "metrics_json": {...},
      "tendencies_json": {...}
    }
  ]
}
```

---

### Get Player Details
Retrieve specific player with enhanced insights.

**Endpoint**: `GET /api/players/{player_id}`

**Response** (200 OK):
```json
{
  "id": "660e8400-e29b-41d4-a716-446655440001",
  "player_name": "TenZ",
  "role": "Duelist",
  "metrics_json": {
    "kd_ratio": 1.34,
    "consistency_score": 0.82,
    "agent_pool": {"Jett": 30, "Raze": 10}
  },
  "tendencies_json": {
    "labels": ["High fragging", "Aggressive"],
    "strengths": ["Exceptional aim"],
    "weaknesses": ["Over-aggression on Haven"]
  },
  "enhanced_insights": [
    "Top performer in the report",
    "Strong Jett specialization (67% pick rate)",
    "Consistency above team average"
  ]
}
```

---

## Strategy Operations

### List Strategies
Get all strategies with optional filtering.

**Endpoint**: `GET /api/strategies/`

**Query Parameters**:
- `report_id` (UUID, optional): Filter by report
- `category` (string, optional): Filter by category
- `skip` (int): Pagination offset
- `limit` (int): Results per page

**Response** (200 OK):
```json
{
  "total": 75,
  "strategies": [...]
}
```

---

### Get Strategy Details
Retrieve specific strategy.

**Endpoint**: `GET /api/strategies/{strategy_id}`

**Response** (200 OK):
```json
{
  "id": "770e8400-e29b-41d4-a716-446655440002",
  "category": "Map Control",
  "label": "Aggressive Site Takes",
  "confidence": 0.87,
  "details_json": {...}
}
```

---

## Composition Operations

### List Compositions
Get all compositions with filtering.

**Endpoint**: `GET /api/compositions/`

**Query Parameters**:
- `report_id` (UUID, optional): Filter by report
- `min_sample_size` (int, optional): Minimum matches
- `skip` (int): Pagination offset
- `limit` (int): Results per page

**Response** (200 OK):
```json
{
  "total": 50,
  "compositions": [...]
}
```

---

### Get Composition Details
Retrieve specific composition.

**Endpoint**: `GET /api/compositions/{composition_id}`

**Response** (200 OK):
```json
{
  "id": "880e8400-e29b-41d4-a716-446655440003",
  "comp_key": "Jett,Omen,Sage,Sova,Viper",
  "win_rate": 0.75,
  "sample_size": 12,
  "map_performance": {...}
}
```

---

## Authentication Operations (Stubs)

### Sign Up
Create new user account (stub).

**Endpoint**: `POST /api/auth/signup`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "full_name": "John Doe"
}
```

**Response** (201 Created):
```json
{
  "user_id": "990e8400-e29b-41d4-a716-446655440004",
  "email": "user@example.com",
  "message": "Account created successfully"
}
```

---

### Login
Authenticate and receive JWT token (stub).

**Endpoint**: `POST /api/auth/login`

**Request Body**:
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!"
}
```

**Response** (200 OK):
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIs...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

---

### Get Current User
Retrieve authenticated user details (stub).

**Endpoint**: `GET /api/auth/me`

**Headers**: `Authorization: Bearer <token>`

**Response** (200 OK):
```json
{
  "id": "990e8400-e29b-41d4-a716-446655440004",
  "email": "user@example.com",
  "full_name": "John Doe",
  "created_at": "2024-01-10T08:00:00Z"
}
```

---

## System Operations

### Health Check
Check API status.

**Endpoint**: `GET /api/system/health`

**Response** (200 OK):
```json
{
  "status": "healthy",
  "timestamp": "2024-01-15T10:45:00Z",
  "database": "connected",
  "grid_api": "available"
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "detail": "Error message here",
  "error_code": "VALIDATION_ERROR",
  "timestamp": "2024-01-15T10:45:00Z"
}
```

### Common Status Codes
- `200`: Success
- `201`: Created
- `204`: No Content
- `400`: Bad Request
- `401`: Unauthorized
- `404`: Not Found
- `422`: Validation Error
- `500`: Internal Server Error

---

## Rate Limiting

Currently **not implemented**. Future consideration for GRID API protection.

---

## Related Documentation

- [Data Flow](data-flow.md) - Request/response journey
- [Database Schema](database-schema.md) - Data structure
- [GRID Integration](grid-integration.md) - External API
- [Authentication](authentication.md) - Auth design
