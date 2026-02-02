from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime
from uuid import UUID


class ReportCreate(BaseModel):
    team_name: str
    game: str = "valorant"
    match_range: Optional[Dict[str, Any]] = None


class ReportResponse(BaseModel):
    id: UUID
    team_name: str
    game: str
    status: str
    created_at: datetime
    updated_at: datetime
    summary_json: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True


class ReportPlayerResponse(BaseModel):
    id: UUID
    player_name: str
    role: Optional[str]
    team: Optional[str]
    metrics_json: Optional[Dict[str, Any]]
    tendencies_json: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True


class ReportStrategyResponse(BaseModel):
    id: UUID
    category: str
    label: str
    confidence: Optional[float]
    frequency: int
    success_rate: Optional[float]
    details_json: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True


class ReportCompositionResponse(BaseModel):
    id: UUID
    comp_key: str
    picks_json: Dict[str, Any]
    win_rate: Optional[float]
    pick_rate: Optional[float]
    sample_size: int
    map_performance: Optional[Dict[str, Any]]

    class Config:
        from_attributes = True


class ReportDetail(ReportResponse):
    """Full report with all related data"""
    players: List[ReportPlayerResponse] = []
    strategies: List[ReportStrategyResponse] = []
    compositions: List[ReportCompositionResponse] = []
    metadata: Optional[Dict[str, Any]] = None

    class Config:
        from_attributes = True
