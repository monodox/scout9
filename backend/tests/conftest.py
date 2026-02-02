"""
Test fixtures and configuration for Scout9 tests.
"""
import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from app.main import app
from app.core.database import Base, get_db


# Use in-memory SQLite for tests
SQLALCHEMY_DATABASE_URL = "sqlite:///:memory:"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


@pytest.fixture
def test_db():
    """Create a fresh database for each test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)


@pytest.fixture
def client(test_db):
    """Create a test client with database dependency override"""
    def override_get_db():
        try:
            yield test_db
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()


@pytest.fixture
def sample_match_data():
    """Sample match data for testing analysis"""
    return [
        {
            "id": "match1",
            "startTime": "2024-01-20T10:00:00Z",
            "teams": [
                {
                    "id": "team1",
                    "name": "Test Team",
                    "won": True
                },
                {
                    "id": "team2",
                    "name": "Opponent Team",
                    "won": False
                }
            ],
            "games": [
                {
                    "id": "game1",
                    "number": 1,
                    "state": "completed",
                    "map": {"name": "Haven"},
                    "teams": [
                        {
                            "id": "team1",
                            "name": "Test Team",
                            "won": True,
                            "score": 13,
                            "players": [
                                {
                                    "id": "player1",
                                    "name": "TestPlayer1",
                                    "role": "Duelist",
                                    "agent": {"name": "Jett"},
                                    "stats": {
                                        "kills": 20,
                                        "deaths": 15,
                                        "assists": 5,
                                        "score": 4500
                                    }
                                },
                                {
                                    "id": "player2",
                                    "name": "TestPlayer2",
                                    "role": "Controller",
                                    "agent": {"name": "Omen"},
                                    "stats": {
                                        "kills": 15,
                                        "deaths": 12,
                                        "assists": 8,
                                        "score": 3800
                                    }
                                }
                            ]
                        },
                        {
                            "id": "team2",
                            "name": "Opponent Team",
                            "won": False,
                            "score": 11,
                            "players": []
                        }
                    ]
                }
            ]
        }
    ]
