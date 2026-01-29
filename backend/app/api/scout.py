from fastapi import APIRouter, HTTPException, BackgroundTasks
from typing import Optional
from app.services.grid_service import grid_service
from app.services.analysis import analysis_service
from app.services.insights import insights_service

router = APIRouter(prefix="/api/scout", tags=["scout"])


async def process_scout_run(team_name: str, date_from: Optional[str], date_to: Optional[str]):
    """Background task to process scouting analysis"""
    # 1. Fetch data from GRID
    matches = await grid_service.get_team_matches(team_name, date_from, date_to)
    
    # 2. Process and aggregate data
    analysis_results = []
    for match in matches:
        analysis = analysis_service.analyze_match(match)
        analysis_results.append(analysis)
        
    trends = analysis_service.generate_trends(matches)
    
    # 3. Generate insights (Junie-assisted)
    summary = insights_service.generate_report_summary({
        "matches": analysis_results,
        "trends": trends
    })
    
    # 4. In a real app, we would save to DB here
    print(f"Scouting completed for {team_name}: {summary}")


@router.post("/run")
async def run_scout(
    team_name: str,
    background_tasks: BackgroundTasks,
    match_id: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None
):
    """Run scouting analysis for a team"""
    background_tasks.add_task(process_scout_run, team_name, date_from, date_to)
    
    return {
        "message": "Scouting analysis started",
        "team": team_name,
        "match_id": match_id,
        "status": "pending"
    }


@router.get("/")
async def list_scouts(skip: int = 0, limit: int = 10):
    """List all scout reports"""
    return {
        "scouts": [],
        "total": 0
    }


@router.get("/{scout_id}")
async def get_scout(scout_id: int):
    """Get specific scout report"""
    return {
        "id": scout_id,
        "status": "completed",
        "data": {}
    }


@router.get("/live/{series_id}")
async def get_live_scout(series_id: str):
    """Get live scouting data for an ongoing series from GRID"""
    state = await grid_service.get_live_series_state(series_id)
    return {
        "series_id": series_id,
        "source": "GRID Series State API",
        "live_data": state
    }
