from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from uuid import UUID

from app.core.database import get_db
from app.models.report import ReportComposition
from app.schemas.report import ReportCompositionResponse

router = APIRouter(prefix="/api/compositions", tags=["compositions"])


@router.get("/", response_model=dict)
async def list_compositions(report_id: UUID, skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """
    List team compositions analyzed in a scouting report.
    This is a derived view from GRID match data with calculated statistics.
    """
    total = db.query(ReportComposition).filter(ReportComposition.report_id == report_id).count()
    compositions = (
        db.query(ReportComposition)
        .filter(ReportComposition.report_id == report_id)
        .order_by(ReportComposition.sample_size.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )
    
    return {
        "report_id": str(report_id),
        "compositions": [ReportCompositionResponse.from_orm(c) for c in compositions],
        "total": total
    }


@router.get("/{id}", response_model=ReportCompositionResponse)
async def get_composition(id: UUID, db: Session = Depends(get_db)):
    """
    Get detailed composition analysis with derived statistics.
    
    Data Flow: GRID (match rosters) → Analysis (frequency/win rates) → Supabase (storage)
    """
    composition = db.query(ReportComposition).filter(ReportComposition.id == id).first()
    
    if not composition:
        raise HTTPException(status_code=404, detail="Composition not found")
    
    return ReportCompositionResponse.from_orm(composition)
