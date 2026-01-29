from pydantic import BaseModel
from typing import Optional
from datetime import datetime


class ScoutCreate(BaseModel):
    team_name: str
    match_id: Optional[str] = None
    date_from: Optional[str] = None
    date_to: Optional[str] = None


class ScoutResponse(BaseModel):
    id: int
    team_name: str
    match_id: Optional[str]
    status: str
    created_at: datetime
    completed_at: Optional[datetime]

    class Config:
        from_attributes = True


class ScoutDetail(ScoutResponse):
    results: Optional[dict]

    class Config:
        from_attributes = True
