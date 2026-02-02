from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from uuid import UUID


class ScoutCreate(BaseModel):
    team_name: str
    game: str = "valorant"
    match_id: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None


class ScoutResponse(BaseModel):
    report_id: UUID
    team_name: str
    status: str
    message: str

    class Config:
        from_attributes = True
