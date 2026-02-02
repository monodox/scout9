from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import Optional
from uuid import UUID

from app.core.database import get_db
from app.models.report import ReportPlayer
from app.schemas.report import ReportPlayerResponse
from app.services.insights import insights_service

router = APIRouter(prefix="/api/players", tags=["players"])


@router.get("/", response_model=dict)
async def list_players(report_id: Optional[UUID] = None, skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """
    List all players analyzed in scouting reports.
    If report_id is provided, filter by that report. Otherwise, return all players.
    This is a derived view - players are extracted from GRID data during scouting.
    """
    query = db.query(ReportPlayer)
    
    if report_id:
        query = query.filter(ReportPlayer.report_id == report_id)
    
    total = query.count()
    players = query.offset(skip).limit(limit).all()
    
    return {
        "report_id": str(report_id) if report_id else None,
        "players": [ReportPlayerResponse.from_orm(p) for p in players],
        "total": total
    }


@router.get("/{id}", response_model=dict)
async def get_player(id: UUID, db: Session = Depends(get_db)):
    """
    Get derived player analysis from scouting reports.
    Includes tendencies, performance metrics, and patterns identified by analysis engine.
    
    Data Source: GRID (official match data) → FastAPI (analysis) → Supabase (storage)
    """
    player = db.query(ReportPlayer).filter(ReportPlayer.id == id).first()
    
    if not player:
        raise HTTPException(status_code=404, detail="Player not found")
    
    # Generate insights for this player
    player_analysis = {
        "metrics_json": player.metrics_json,
        "tendencies_json": player.tendencies_json
    }
    
    insights = insights_service.generate_player_insights(player_analysis)
    
    return {
        "id": str(player.id),
        "report_id": str(player.report_id),
        "player_name": player.player_name,
        "role": player.role,
        "team": player.team,
        "metrics": player.metrics_json,
        "tendencies": player.tendencies_json,
        "insights": insights
    }
