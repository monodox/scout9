from fastapi import APIRouter, HTTPException, Depends
from fastapi.responses import HTMLResponse, JSONResponse, Response
from sqlalchemy.orm import Session
from typing import List
from uuid import UUID

from app.core.database import get_db
from app.models.report import Report, ReportPlayer, ReportStrategy, ReportComposition
from app.schemas.report import ReportResponse, ReportDetail, ReportPlayerResponse, ReportStrategyResponse, ReportCompositionResponse
from app.services.export_service import export_service

router = APIRouter(prefix="/api/report", tags=["report"])


@router.get("/", response_model=dict)
async def list_reports(skip: int = 0, limit: int = 10, db: Session = Depends(get_db)):
    """
    List all generated scouting reports.
    Each report represents a complete analysis run for a team.
    """
    total = db.query(Report).count()
    reports = db.query(Report).order_by(Report.created_at.desc()).offset(skip).limit(limit).all()
    
    return {
        "reports": [ReportResponse.from_orm(r) for r in reports],
        "total": total
    }


@router.get("/{id}", response_model=ReportDetail)
async def get_report(id: UUID, db: Session = Depends(get_db)):
    """
    Get full coach-ready scouting report.
    
    Contains:
    - Team analysis and summary
    - Player performance metrics and tendencies
    - Strategic patterns
    - Composition preferences
    - AI-generated insights
    
    Data Pipeline: GRID (source) → FastAPI (analysis) → Supabase (storage)
    """
    report = db.query(Report).filter(Report.id == id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # The relationships will be automatically loaded due to the ORM setup
    return ReportDetail.from_orm(report)


@router.get("/{id}/players", response_model=List[ReportPlayerResponse])
async def get_report_players(id: UUID, db: Session = Depends(get_db)):
    """Get all player analyses for a specific report"""
    report = db.query(Report).filter(Report.id == id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    players = db.query(ReportPlayer).filter(ReportPlayer.report_id == id).all()
    return [ReportPlayerResponse.from_orm(p) for p in players]


@router.get("/{id}/strategies", response_model=List[ReportStrategyResponse])
async def get_report_strategies(id: UUID, db: Session = Depends(get_db)):
    """Get all identified strategies for a specific report"""
    report = db.query(Report).filter(Report.id == id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    strategies = db.query(ReportStrategy).filter(ReportStrategy.report_id == id).all()
    return [ReportStrategyResponse.from_orm(s) for s in strategies]


@router.get("/{id}/compositions", response_model=List[ReportCompositionResponse])
async def get_report_compositions(id: UUID, db: Session = Depends(get_db)):
    """Get all team compositions for a specific report"""
    report = db.query(Report).filter(Report.id == id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    compositions = db.query(ReportComposition).filter(ReportComposition.report_id == id).all()
    return [ReportCompositionResponse.from_orm(c) for c in compositions]


@router.delete("/{id}")
async def delete_report(id: UUID, db: Session = Depends(get_db)):
    """Delete a report and all related data (cascade delete)"""
    report = db.query(Report).filter(Report.id == id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    db.delete(report)
    db.commit()
    
    return {"message": "Report deleted successfully"}


@router.get("/{id}/export/html", response_class=HTMLResponse)
async def export_report_html(id: UUID, db: Session = Depends(get_db)):
    """Export report as HTML"""
    report = db.query(Report).filter(Report.id == id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Prepare data for export
    report_data = {
        "team_name": report.team_name,
        "game": report.game,
        "created_at": report.created_at.strftime("%Y-%m-%d %H:%M"),
        "match_range": report.match_range,
        "summary_json": report.summary_json,
        "players": [
            {
                "player_name": p.player_name,
                "role": p.role,
                "metrics_json": p.metrics_json,
                "tendencies_json": p.tendencies_json
            }
            for p in report.players
        ],
        "strategies": [
            {
                "label": s.label,
                "category": s.category,
                "success_rate": s.success_rate,
                "frequency": s.frequency
            }
            for s in report.strategies
        ],
        "compositions": [
            {
                "picks_json": c.picks_json,
                "win_rate": c.win_rate,
                "sample_size": c.sample_size
            }
            for c in report.compositions
        ]
    }
    
    html_content = export_service.generate_html_report(report_data)
    return HTMLResponse(content=html_content)


@router.get("/{id}/export/json")
async def export_report_json(id: UUID, db: Session = Depends(get_db)):
    """Export report as JSON"""
    report = db.query(Report).filter(Report.id == id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    report_data = {
        "id": str(report.id),
        "team_name": report.team_name,
        "game": report.game,
        "created_at": report.created_at.isoformat(),
        "status": report.status,
        "match_range": report.match_range,
        "summary_json": report.summary_json,
        "players": [
            {
                "id": str(p.id),
                "player_name": p.player_name,
                "role": p.role,
                "team": p.team,
                "metrics_json": p.metrics_json,
                "tendencies_json": p.tendencies_json
            }
            for p in report.players
        ],
        "strategies": [
            {
                "id": str(s.id),
                "label": s.label,
                "category": s.category,
                "confidence": s.confidence,
                "frequency": s.frequency,
                "success_rate": s.success_rate,
                "details_json": s.details_json
            }
            for s in report.strategies
        ],
        "compositions": [
            {
                "id": str(c.id),
                "comp_key": c.comp_key,
                "picks_json": c.picks_json,
                "win_rate": c.win_rate,
                "pick_rate": c.pick_rate,
                "sample_size": c.sample_size,
                "map_performance": c.map_performance
            }
            for c in report.compositions
        ]
    }
    
    json_content = export_service.generate_json_export(report_data)
    return Response(
        content=json_content,
        media_type="application/json",
        headers={"Content-Disposition": f"attachment; filename=scout9_report_{id}.json"}
    )


@router.get("/{id}/export/pdf")
async def export_report_pdf(id: UUID, db: Session = Depends(get_db)):
    """
    Export report as PDF.
    
    Note: Requires weasyprint to be installed.
    Falls back to HTML if weasyprint is not available.
    """
    report = db.query(Report).filter(Report.id == id).first()
    
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")
    
    # Prepare data
    report_data = {
        "team_name": report.team_name,
        "game": report.game,
        "created_at": report.created_at.strftime("%Y-%m-%d %H:%M"),
        "match_range": report.match_range,
        "summary_json": report.summary_json,
        "players": [
            {
                "player_name": p.player_name,
                "role": p.role,
                "metrics_json": p.metrics_json,
                "tendencies_json": p.tendencies_json
            }
            for p in report.players
        ],
        "strategies": [
            {
                "label": s.label,
                "category": s.category,
                "success_rate": s.success_rate,
                "frequency": s.frequency
            }
            for s in report.strategies
        ],
        "compositions": [
            {
                "picks_json": c.picks_json,
                "win_rate": c.win_rate,
                "sample_size": c.sample_size
            }
            for c in report.compositions
        ]
    }
    
    html_content = export_service.generate_html_report(report_data)
    pdf_bytes = export_service.generate_pdf_report(html_content)
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename=scout9_report_{report.team_name}.pdf"}
    )
