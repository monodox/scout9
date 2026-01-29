from sqlalchemy import Column, Integer, String, DateTime, JSON, Float
from datetime import datetime
from app.core.database import Base


class Report(Base):
    __tablename__ = "reports"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    team_name = Column(String, nullable=False)
    template_type = Column(String, default="quick")
    status = Column(String, default="pending")
    data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class PlayerStats(Base):
    __tablename__ = "player_stats"

    id = Column(Integer, primary_key=True, index=True)
    player_id = Column(String, unique=True, index=True)
    player_name = Column(String, nullable=False)
    team = Column(String, nullable=False)
    stats = Column(JSON, nullable=True)
    performance_score = Column(Float, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


class Strategy(Base):
    __tablename__ = "strategies"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    strategy_type = Column(String, nullable=False)
    description = Column(String, nullable=True)
    success_rate = Column(Float, default=0.0)
    usage_count = Column(Integer, default=0)
    data = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class Composition(Base):
    __tablename__ = "compositions"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    composition_data = Column(JSON, nullable=False)
    win_rate = Column(Float, default=0.0)
    pick_rate = Column(Float, default=0.0)
    games_played = Column(Integer, default=0)
    created_at = Column(DateTime, default=datetime.utcnow)


class Scout(Base):
    __tablename__ = "scouts"

    id = Column(Integer, primary_key=True, index=True)
    team_name = Column(String, nullable=False)
    match_id = Column(String, nullable=True)
    date_from = Column(String, nullable=True)
    date_to = Column(String, nullable=True)
    status = Column(String, default="pending")
    results = Column(JSON, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
