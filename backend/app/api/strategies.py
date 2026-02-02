from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.models.report import ReportStrategy
from app.schemas.report import ReportStrategyResponse

router = APIRouter(prefix="/api/strategies", tags=["strategies"])


@router.get("/", response_model=dict)
async def list_strategies(report_id: UUID, skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """
    List strategic patterns identified in a scouting report.
    This is a derived view from analyzed GRID match data.
    """
    total = db.query(ReportStrategy).filter(ReportStrategy.report_id == report_id).count()
    strategies = (
        db.query(ReportStrategy)
        .filter(ReportStrategy.report_id == report_id)
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return {
        "report_id": str(report_id),
        "strategies": [ReportStrategyResponse.from_orm(s) for s in strategies],
        "total": total
    }


@router.get("/{id}", response_model=ReportStrategyResponse)
async def get_strategy(id: UUID, db: Session = Depends(get_db)):
    """
    Get detailed analysis of a strategic pattern.
    
    Data Flow: GRID (matches) → Analysis (pattern recognition) → Supabase (storage)
    """
    strategy = db.query(ReportStrategy).filter(ReportStrategy.id == id).first()
    
    if not strategy:
        raise HTTPException(status_code=404, detail="Strategy not found")
    
    return ReportStrategyResponse.from_orm(strategy)
