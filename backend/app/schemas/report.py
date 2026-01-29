from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ReportCreate(BaseModel):
    scout_id: int
    template: str = "quick"


class ReportResponse(BaseModel):
    id: int
    title: str
    team_name: str
    template_type: str
    status: str
    created_at: datetime

    class Config:
        from_attributes = True


class ReportDetail(ReportResponse):
    data: Optional[dict]
    updated_at: datetime

    class Config:
        from_attributes = True


class PlayerStatsResponse(BaseModel):
    id: int
    player_id: str
    player_name: str
    team: str
    performance_score: float
    created_at: datetime

    class Config:
        from_attributes = True


class StrategyResponse(BaseModel):
    id: int
    name: str
    strategy_type: str
    success_rate: float
    usage_count: int

    class Config:
        from_attributes = True


class CompositionResponse(BaseModel):
    id: int
    name: str
    win_rate: float
    pick_rate: float
    games_played: int

    class Config:
        from_attributes = True
