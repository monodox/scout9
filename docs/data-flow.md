# Data Flow

## Complete Scout Run Flow

This document traces what happens from the moment a user clicks "Run Scout" to when they view the final report.

## 1. Scout Initiation

### User Action
```
User fills form on /console/scout:
- Team name: "Team Liquid"
- Game: "valorant"
- Date range: 2024-01-01 to 2024-01-31
- Additional filters (optional)
```

### Frontend Request
```typescript
// src/services/scout.service.ts
const response = await api.post('/api/scout/run', {
  team_name: "Team Liquid",
  game: "valorant",
  date_from: "2024-01-01",
  date_to: "2024-01-31"
})
// Response: { report_id: "uuid-here", status: "pending" }
```

### Backend Endpoint
```python
# backend/app/api/scout.py
@router.post("/run")
async def run_scout(request: ScoutRequest, bg_tasks: BackgroundTasks):
    # 1. Create report record immediately
    report = Report(
        team_name=request.team_name,
        game=request.game,
        status="pending",
        match_range={
            "date_from": request.date_from,
            "date_to": request.date_to
        }
    )
    db.add(report)
    db.commit()
    
    # 2. Queue background task
    bg_tasks.add_task(process_scout_run, report.id, request)
    
    # 3. Return immediately
    return {"report_id": report.id, "status": "pending"}
```

**Key Point**: API returns **immediately** with report UUID. Processing happens in background.

---

## 2. Background Processing

### Phase A: GRID API - Team Search
```python
# services/grid_service.py
team = await grid_client.search_team("Team Liquid", "valorant")
# Returns: { id: "grid-team-id", name: "Team Liquid" }
```

**GraphQL Query**:
```graphql
query SearchTeam($name: String!, $game: String!) {
  teams(where: {name: {_eq: $name}, game: {_eq: $game}}) {
    id
    name
    slug
  }
}
```

### Phase B: GRID API - Match History
```python
matches = await grid_client.get_team_matches(
    team_id="grid-team-id",
    limit=50
)
# Returns list of series with match data
```

**GraphQL Query**:
```graphql
query TeamMatches($teamId: ID!, $limit: Int!) {
  series(
    where: {teams: {id: {_eq: $teamId}}}
    limit: $limit
    order_by: {start_time: desc}
  ) {
    id
    title
    start_time
    games {
      id
      map
      winner {
        id
        name
      }
      teams {
        id
        name
        players {
          id
          ign
          agent
          stats {
            kills
            deaths
            assists
            acs
            adr
          }
        }
      }
    }
  }
}
```

### Phase C: Analysis - Player Stats
```python
# services/analysis.py
player_analysis = analyze_player_performance(matches)
# Computes:
# - K/D ratio: sum(kills) / sum(deaths)
# - Consistency: 1 - (stdev / mean)
# - Agent pool: Counter of character picks
# - Tendencies: Label generation ("High fragging", "Versatile")
```

**Algorithm Example**:
```python
def analyze_player_performance(matches):
    player_stats = defaultdict(lambda: {
        'kills': [], 'deaths': [], 'assists': [],
        'agents': Counter()
    })
    
    for match in matches:
        for player in match['players']:
            stats = player_stats[player['name']]
            stats['kills'].append(player['kills'])
            stats['deaths'].append(player['deaths'])
            stats['assists'].append(player['assists'])
            stats['agents'][player['agent']] += 1
    
    # Calculate metrics
    for player, data in player_stats.items():
        avg_kd = sum(data['kills']) / max(sum(data['deaths']), 1)
        consistency = 1 - (stdev(data['kills']) / mean(data['kills']))
        top_agents = data['agents'].most_common(3)
        
        # Generate tendencies
        tendencies = generate_tendencies(avg_kd, consistency, top_agents)
```

### Phase D: Analysis - Strategy Patterns
```python
strategies = identify_strategies(matches)
# Detects:
# - Map-specific strategies
# - Win rate by approach
# - Pattern frequency
```

**Example Detection**:
```python
def identify_strategies(matches):
    map_strategies = defaultdict(lambda: {
        'wins': 0, 'total': 0, 'approaches': Counter()
    })
    
    for match in matches:
        map_name = match['map']
        outcome = match['winner'] == target_team
        
        map_strategies[map_name]['total'] += 1
        if outcome:
            map_strategies[map_name]['wins'] += 1
        
        # Detect strategy from playstyle (simplified)
        if match['avg_first_bloods'] > 0.5:
            map_strategies[map_name]['approaches']['Aggressive'] += 1
        else:
            map_strategies[map_name]['approaches']['Controlled'] += 1
```

### Phase E: Analysis - Compositions
```python
compositions = analyze_compositions(matches)
# Tracks:
# - Unique team comps (sorted agent list)
# - Win/pick rates per comp
# - Map-specific performance
```

**Example**:
```python
def analyze_compositions(matches):
    comp_stats = defaultdict(lambda: {
        'wins': 0, 'picks': 0, 'maps': Counter()
    })
    
    for match in matches:
        agents = sorted([p['agent'] for p in match['players']])
        comp_key = ','.join(agents)  # e.g., "Jett,Omen,Sage,Sova,Viper"
        
        comp_stats[comp_key]['picks'] += 1
        comp_stats[comp_key]['maps'][match['map']] += 1
        
        if match['winner'] == target_team:
            comp_stats[comp_key]['wins'] += 1
    
    # Calculate rates
    for comp, data in comp_stats.items():
        data['win_rate'] = data['wins'] / data['picks']
        data['pick_rate'] = data['picks'] / total_matches
```

### Phase F: Insight Generation
```python
# services/insights.py
insights = generate_insights(player_analysis, strategies, compositions)
# Creates natural language summaries:
# - Key findings
# - Strengths/weaknesses
# - Recommendations
```

### Phase G: Database Storage
```python
# Store all results
db.add_all([
    ReportPlayer(...) for each player,
    ReportStrategy(...) for each strategy,
    ReportComposition(...) for each composition
])

# Update report status
report.status = "completed"
report.summary_json = {
    "total_matches": len(matches),
    "date_range": {...},
    "key_insights": insights
}
db.commit()
```

---

## 3. Frontend Polling (Optional)

### Status Check
```typescript
// Poll every 3 seconds
const checkStatus = async () => {
  const report = await reportService.get(reportId)
  
  if (report.status === 'completed') {
    // Show results
    navigate(`/console/report/${reportId}`)
  } else if (report.status === 'error') {
    // Show error
  } else {
    // Continue polling
    setTimeout(checkStatus, 3000)
  }
}
```

---

## 4. Report Viewing

### User Navigation
```
User navigates to /console/report/{uuid}
```

### Frontend Request
```typescript
// Fetch full report with relationships
const report = await reportService.get(reportId)
const players = await reportService.getPlayers(reportId)
const strategies = await reportService.getStrategies(reportId)
const compositions = await reportService.getCompositions(reportId)
```

### Backend Query
```python
@router.get("/{report_id}")
async def get_report(report_id: UUID):
    report = db.query(Report).filter(Report.id == report_id).first()
    
    # Load relationships (configured in SQLAlchemy)
    report.players  # List of ReportPlayer
    report.strategies  # List of ReportStrategy
    report.compositions  # List of ReportComposition
    
    return report
```

### Frontend Display
```tsx
<ReportDetail>
  <ReportHeader report={report} />
  <SummarySection insights={report.summary_json.key_insights} />
  <PlayersTable players={players} />
  <StrategiesGrid strategies={strategies} />
  <CompositionsChart compositions={compositions} />
</ReportDetail>
```

---

## 5. Export Flow

### User Action
```
User clicks "Export PDF" button
```

### Frontend Request
```typescript
const response = await fetch(`/api/report/${reportId}/export/pdf`)
const blob = await response.blob()
downloadFile(blob, `report-${reportId}.pdf`)
```

### Backend Processing
```python
@router.get("/{report_id}/export/pdf")
async def export_report_pdf(report_id: UUID):
    # 1. Fetch report data
    report = db.query(Report).filter(...).first()
    
    # 2. Generate HTML from template
    html = export_service.generate_html_report(report)
    
    # 3. Convert to PDF (if weasyprint available)
    pdf_bytes = export_service.generate_pdf_report(report)
    
    # 4. Return binary
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={
            "Content-Disposition": f"attachment; filename=report-{report_id}.pdf"
        }
    )
```

---

## Data Flow Summary

```
┌─────────┐
│ Browser │
└────┬────┘
     │ 1. POST /api/scout/run
     │    {team_name, game, dates}
     ↓
┌─────────────┐
│   FastAPI   │ ← 2. Create Report (status: pending)
│   Backend   │ ← 3. Return report_id immediately
└──────┬──────┘
       │ 4. Background Task:
       ├─→ GRID API (search_team)
       ├─→ GRID API (get_matches)
       ├─→ Analysis (compute metrics)
       ├─→ Insights (generate labels)
       └─→ Supabase (store results)
       
┌─────────────┐
│  Supabase   │ ← 5. Store Report + Players + Strategies + Compositions
└─────────────┘

┌─────────┐
│ Browser │ ← 6. GET /api/report/{id} (after polling/waiting)
└─────────┘    Returns complete analyzed data
```

---

## Timing Breakdown (Example)

| Phase | Duration | Notes |
|-------|----------|-------|
| Create Report | <100ms | Database insert |
| Return to User | <200ms | API response |
| Search Team | 1-2s | GRID API call (cached after first) |
| Fetch Matches | 3-5s | Depends on match count |
| Analysis | 2-3s | CPU-bound calculations |
| Store Results | 1-2s | Multiple database inserts |
| **Total Background** | **7-12s** | User doesn't wait for this |

---

## Error Handling

### GRID API Failure
```python
try:
    team = await grid_client.search_team(team_name, game)
except Exception as e:
    report.status = "error"
    report.error_message = f"GRID API error: {str(e)}"
    db.commit()
    # Frontend shows error on next poll
```

### Analysis Failure
```python
try:
    analysis = analyze_matches(matches)
except Exception as e:
    # Log error but continue with partial data
    logger.error(f"Analysis error: {e}")
    # Store what we have so far
```

---

## Related Documentation

- [Architecture](architecture.md) - System design
- [API Reference](api-reference.md) - Endpoint details
- [GRID Integration](grid-integration.md) - External API
- [Database Schema](database-schema.md) - Storage layer
