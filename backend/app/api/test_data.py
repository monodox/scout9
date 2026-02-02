from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from uuid import uuid4
from datetime import datetime

from app.core.database import get_db
from app.models.report import Report, ReportPlayer, ReportStrategy, ReportComposition

router = APIRouter(prefix="/api/test", tags=["test"])


def seed_sample_data(db: Session):
    """
    Internal function to seed database with sample data.
    Called automatically when database is empty.
    """
    # Create a test report
    report = Report(
        id=uuid4(),
        team_name="Team Liquid",
        game="valorant",
        status="completed",
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow(),
        summary_json={
            "total_matches": 10,
            "win_rate": 65.0,
            "analysis_date": "2026-02-02"
        }
    )
    db.add(report)
    db.flush()
    
    # Add test players
    players_data = [
        {"name": "ScreaM", "role": "Duelist", "team": "Team Liquid", "kd": 1.45, "wr": 68},
        {"name": "nAts", "role": "Sentinel", "team": "Team Liquid", "kd": 1.32, "wr": 65},
        {"name": "Jamppi", "role": "Flex", "team": "Team Liquid", "kd": 1.28, "wr": 62},
        {"name": "Sayf", "role": "Duelist", "team": "Team Liquid", "kd": 1.51, "wr": 70},
        {"name": "Redgar", "role": "Controller", "team": "Team Liquid", "kd": 1.15, "wr": 64},
    ]
    
    for p in players_data:
        player = ReportPlayer(
            id=uuid4(),
            report_id=report.id,
            player_name=p["name"],
            role=p["role"],
            team=p["team"],
            metrics_json={
                "kd_ratio": p["kd"],
                "win_rate": p["wr"],
                "consistency_score": 85.5,
                "avg_kills": 18.5,
                "avg_deaths": 12.8,
                "first_bloods": 2.3
            },
            tendencies_json={
                "playstyle": "Aggressive",
                "map_preference": "Ascent",
                "agent_pool": ["Jett", "Raze", "Reyna"],
                "clutch_rate": 0.35
            }
        )
        db.add(player)
    
    # Add test strategies
    strategies_data = [
        {"category": "Attack", "label": "Fast A Rush", "freq": 15, "sr": 73.3},
        {"category": "Defense", "label": "Stack B Site", "freq": 12, "sr": 66.7},
        {"category": "Economic", "label": "Force Buy Round 2", "freq": 8, "sr": 50.0},
    ]
    
    for s in strategies_data:
        strategy = ReportStrategy(
            id=uuid4(),
            report_id=report.id,
            category=s["category"],
            label=s["label"],
            confidence=0.85,
            frequency=s["freq"],
            success_rate=s["sr"],
            details_json={
                "description": f"{s['category']} strategy used {s['freq']} times",
                "counters": ["Stack opposite site", "Play slow"]
            }
        )
        db.add(strategy)
    
    # Add test compositions
    compositions_data = [
        {"key": "Jett-Sage-Omen-Sova-Killjoy", "wr": 68.0, "pr": 25.0, "games": 10},
        {"key": "Raze-Cypher-Brimstone-Sova-Killjoy", "wr": 62.5, "pr": 20.0, "games": 8},
    ]
    
    for c in compositions_data:
        composition = ReportComposition(
            id=uuid4(),
            report_id=report.id,
            comp_key=c["key"],
            picks_json={
                "agents": c["key"].split("-"),
                "frequency": c["games"]
            },
            win_rate=c["wr"],
            pick_rate=c["pr"],
            sample_size=c["games"],
            map_performance={
                "Ascent": {"wins": 5, "losses": 2},
                "Bind": {"wins": 3, "losses": 1}
            }
        )
        db.add(composition)
    
    db.commit()
    return report.id


@router.post("/seed")
async def seed_test_data(db: Session = Depends(get_db)):
    """
    Manually seed database with test data for development.
    WARNING: Only use in development!
    """
    report_id = seed_sample_data(db)
    
    return {
        "message": "Test data seeded successfully",
        "report_id": str(report_id),
        "players_created": 5,
        "strategies_created": 3,
        "compositions_created": 2
    }


@router.delete("/clear")
async def clear_test_data(db: Session = Depends(get_db)):
    """
    Clear all test data from database.
    WARNING: Only use in development!
    """
    db.query(ReportComposition).delete()
    db.query(ReportStrategy).delete()
    db.query(ReportPlayer).delete()
    db.query(Report).delete()
    db.commit()
    
    return {"message": "All test data cleared"}
