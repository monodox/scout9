from fastapi import APIRouter, HTTPException, BackgroundTasks, Depends
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID
import logging

from app.services.grid_service import grid_service
from app.services.analysis import analysis_service
from app.services.insights import insights_service
from app.core.database import get_db
from app.models.report import Report, ReportPlayer, ReportStrategy, ReportComposition
from app.schemas.scout import ScoutCreate, ScoutResponse

router = APIRouter(prefix="/api/scout", tags=["scout"])
logger = logging.getLogger(__name__)


async def process_scout_run(
    report_id: UUID,
    team_name: str,
    game: str,
    date_from: Optional[str],
    date_to: Optional[str]
):
    """
    Background task to process scouting analysis.
    
    Data Flow:
    1. Search team in GRID API
    2. Fetch raw match data from GRID API
    3. Perform statistical analysis in FastAPI backend
    4. Generate insights
    5. Persist structured results to Supabase Postgres
    """
    from app.core.database import SessionLocal
    db = SessionLocal()
    
    try:
        # Update status to processing
        report = db.query(Report).filter(Report.id == report_id).first()
        if not report:
            logger.error(f"Report {report_id} not found")
            return
        
        report.status = "processing"
        db.commit()
        
        # 1. Search for team
        logger.info(f"Searching for team: {team_name}")
        team_data = await grid_service.search_team(team_name, game)
        
        if not team_data:
            report.status = "failed"
            report.summary_json = {"error": f"Team '{team_name}' not found"}
            db.commit()
            return
        
        team_id = team_data["id"]
        
        # 2. Fetch team matches from GRID
        logger.info(f"Fetching matches for team {team_id}")
        matches = await grid_service.get_team_matches(
            team_id=team_id,
            game=game,
            limit=10,
            date_from=date_from,
            date_to=date_to
        )
        
        if not matches:
            report.status = "completed"
            report.summary_json = {"message": "No matches found for the specified criteria"}
            db.commit()
            return
        
        # Update match range
        report.match_range = {
            "from": date_from,
            "to": date_to,
            "match_count": len(matches)
        }
        report.team_id = team_id
        
        # 3. Perform analysis
        logger.info(f"Analyzing {len(matches)} matches")
        analysis_results = analysis_service.analyze_matches(matches)
        
        # 4. Generate insights
        summary = insights_service.generate_report_summary(analysis_results)
        report.summary_json = {
            "summary": summary,
            "match_count": len(matches),
            "team_id": team_id
        }
        
        # 5. Store player analysis
        for player_id, player_data in analysis_results.get("players", {}).items():
            report_player = ReportPlayer(
                report_id=report_id,
                player_id=player_id,
                player_name=player_data.get("player_name", "Unknown"),
                role=player_data.get("role"),
                team=team_name,
                metrics_json=player_data.get("metrics_json"),
                tendencies_json=player_data.get("tendencies_json")
            )
            db.add(report_player)
        
        # 6. Store strategies
        for strategy in analysis_results.get("strategies", []):
            report_strategy = ReportStrategy(
                report_id=report_id,
                category=strategy.get("category", "general"),
                label=strategy.get("label", "Unknown"),
                confidence=strategy.get("confidence"),
                frequency=strategy.get("frequency", 0),
                success_rate=strategy.get("success_rate"),
                details_json=strategy.get("details_json")
            )
            db.add(report_strategy)
        
        # 7. Store compositions
        for composition in analysis_results.get("compositions", []):
            report_comp = ReportComposition(
                report_id=report_id,
                comp_key=composition.get("comp_key", "unknown"),
                picks_json=composition.get("picks_json", {}),
                win_rate=composition.get("win_rate"),
                pick_rate=composition.get("pick_rate"),
                sample_size=composition.get("sample_size", 0),
                map_performance=composition.get("map_performance")
            )
            db.add(report_comp)
        
        # Mark as completed
        report.status = "completed"
        db.commit()
        
        logger.info(f"Scouting completed for {team_name} - Report ID: {report_id}")
        
    except Exception as e:
        logger.error(f"Error processing scout run: {e}", exc_info=True)
        report.status = "failed"
        report.summary_json = {"error": str(e)}
        db.commit()
    finally:
        db.close()


@router.post("/run", response_model=ScoutResponse)
async def run_scout(
    scout_data: ScoutCreate,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db)
):
    """
    Generate a new scouting report for a team.
    Creates a report record and starts background analysis.
    
    Returns report_id for tracking and retrieval.
    """
    # Create report record
    report = Report(
        team_name=scout_data.team_name,
        game=scout_data.game,
        status="pending",
        match_range={
            "match_id": scout_data.match_id,
            "from": scout_data.date_from,
            "to": scout_data.date_to
        }
    )
    
    db.add(report)
    db.commit()
    db.refresh(report)
    
    # Start background analysis
    background_tasks.add_task(
        process_scout_run,
        report.id,
        scout_data.team_name,
        scout_data.game,
        scout_data.date_from,
        scout_data.date_to
    )
    
    return ScoutResponse(
        report_id=report.id,
        team_name=scout_data.team_name,
        status="pending",
        message="Scouting analysis started. Use report_id to check status and results."
    )
    state = await grid_service.get_live_series_state(series_id)
    return {
        "series_id": series_id,
        "source": "GRID Series State API (live data)",
        "live_data": state
    }
