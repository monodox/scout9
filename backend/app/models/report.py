from sqlalchemy import Column, String, Integer, DateTime, Float, JSON, Text, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.core.database import Base


class Report(Base):
    """
    Core report table - one record per scout run.
    Stores processed analysis results from GRID match data.
    """
    __tablename__ = "reports"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    team_id = Column(String(255), nullable=True, index=True)
    team_name = Column(String(255), nullable=False, index=True)
    game = Column(String(50), nullable=False)  # "valorant", "lol", etc.
    match_range = Column(JSON, nullable=True)  # {"from": "date", "to": "date", "match_ids": [...]}
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    status = Column(String(50), default="pending")  # pending, processing, completed, failed
    summary_json = Column(JSON, nullable=True)  # AI-generated insights and summary
    metadata = Column(JSON, nullable=True)  # Additional flexible fields

    # Relationships
    players = relationship("ReportPlayer", back_populates="report", cascade="all, delete-orphan")
    strategies = relationship("ReportStrategy", back_populates="report", cascade="all, delete-orphan")
    compositions = relationship("ReportComposition", back_populates="report", cascade="all, delete-orphan")


class ReportPlayer(Base):
    """
    Player statistics and tendencies extracted from a specific report.
    One record per player per report.
    """
    __tablename__ = "report_players"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_id = Column(UUID(as_uuid=True), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    player_id = Column(String(255), nullable=True, index=True)  # GRID player ID
    player_name = Column(String(255), nullable=False)
    role = Column(String(100), nullable=True)  # "Duelist", "Controller", "ADC", etc.
    team = Column(String(255), nullable=True)
    
    # Aggregated metrics (flexible JSONB storage)
    metrics_json = Column(JSON, nullable=True)  # {"kd": 1.5, "acs": 250, "consistency": 0.85}
    tendencies_json = Column(JSON, nullable=True)  # {"labels": [...], "strengths": [...], "weaknesses": [...]}
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    report = relationship("Report", back_populates="players")


class ReportStrategy(Base):
    """
    Strategic patterns identified through analysis of match data.
    One record per identified strategy per report.
    """
    __tablename__ = "report_strategies"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_id = Column(UUID(as_uuid=True), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    category = Column(String(100), nullable=False)  # "offensive", "defensive", "setup", "rotation"
    label = Column(String(255), nullable=False)  # "Fast A-site execute", "Late-round lurk"
    confidence = Column(Float, nullable=True)  # 0.0 - 1.0 confidence score
    frequency = Column(Integer, default=0)  # Times observed
    success_rate = Column(Float, nullable=True)  # Win rate when used
    
    # Detailed analysis
    details_json = Column(JSON, nullable=True)  # {"maps": [...], "rounds": [...], "conditions": {...}}
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    report = relationship("Report", back_populates="strategies")


class ReportComposition(Base):
    """
    Team composition analysis - agent/champion picks and performance.
    One record per unique composition per report.
    """
    __tablename__ = "report_compositions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    report_id = Column(UUID(as_uuid=True), ForeignKey("reports.id", ondelete="CASCADE"), nullable=False, index=True)
    comp_key = Column(String(500), nullable=False)  # Sorted identifier: "agent1,agent2,agent3"
    
    # Composition details
    picks_json = Column(JSON, nullable=False)  # {"picks": ["Jett", "Omen", ...], "roles": {...}}
    win_rate = Column(Float, nullable=True)  # Calculated win rate
    pick_rate = Column(Float, nullable=True)  # How often picked
    sample_size = Column(Integer, default=0)  # Number of matches with this comp
    
    # Map-specific data
    map_performance = Column(JSON, nullable=True)  # {"Haven": {"wr": 0.6, "games": 5}, ...}
    
    created_at = Column(DateTime, default=datetime.utcnow)

    # Relationship
    report = relationship("Report", back_populates="compositions")
