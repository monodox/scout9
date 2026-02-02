"""
Integration tests for Scout API endpoints.
"""
import pytest
from uuid import UUID


def test_health_check(client):
    """Test basic health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy"}


def test_root_endpoint(client):
    """Test root API endpoint"""
    response = client.get("/")
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == "Scout9 API"
    assert data["status"] == "operational"


def test_scout_run_creates_report(client, test_db):
    """Test that running a scout creates a report"""
    scout_data = {
        "team_name": "Test Team",
        "game": "valorant",
        "date_from": "2024-01-01",
        "date_to": "2024-01-31"
    }
    
    response = client.post("/api/scout/run", json=scout_data)
    assert response.status_code == 200
    
    data = response.json()
    assert "report_id" in data
    assert data["team_name"] == "Test Team"
    assert data["status"] == "pending"
    
    # Verify report was created in database
    from app.models.report import Report
    report_id = UUID(data["report_id"])
    report = test_db.query(Report).filter(Report.id == report_id).first()
    
    assert report is not None
    assert report.team_name == "Test Team"
    assert report.game == "valorant"
    assert report.status == "pending"


def test_list_reports(client, test_db):
    """Test listing reports"""
    # Create a test report
    from app.models.report import Report
    report = Report(
        team_name="Test Team",
        game="valorant",
        status="completed"
    )
    test_db.add(report)
    test_db.commit()
    
    response = client.get("/api/report/")
    assert response.status_code == 200
    
    data = response.json()
    assert "reports" in data
    assert "total" in data
    assert data["total"] == 1
    assert len(data["reports"]) == 1
    assert data["reports"][0]["team_name"] == "Test Team"


def test_get_report(client, test_db):
    """Test getting a specific report"""
    from app.models.report import Report
    report = Report(
        team_name="Test Team",
        game="valorant",
        status="completed",
        summary_json={"summary": "Test summary"}
    )
    test_db.add(report)
    test_db.commit()
    test_db.refresh(report)
    
    response = client.get(f"/api/report/{report.id}")
    assert response.status_code == 200
    
    data = response.json()
    assert data["team_name"] == "Test Team"
    assert data["game"] == "valorant"
    assert data["status"] == "completed"


def test_get_nonexistent_report(client):
    """Test getting a report that doesn't exist"""
    fake_uuid = "00000000-0000-0000-0000-000000000000"
    response = client.get(f"/api/report/{fake_uuid}")
    assert response.status_code == 404


def test_export_report_html(client, test_db):
    """Test HTML export endpoint"""
    from app.models.report import Report
    report = Report(
        team_name="Test Team",
        game="valorant",
        status="completed",
        match_range={"match_count": 5}
    )
    test_db.add(report)
    test_db.commit()
    test_db.refresh(report)
    
    response = client.get(f"/api/report/{report.id}/export/html")
    assert response.status_code == 200
    assert "text/html" in response.headers["content-type"]
    assert b"Scout9 Scouting Report" in response.content


def test_export_report_json(client, test_db):
    """Test JSON export endpoint"""
    from app.models.report import Report
    report = Report(
        team_name="Test Team",
        game="valorant",
        status="completed"
    )
    test_db.add(report)
    test_db.commit()
    test_db.refresh(report)
    
    response = client.get(f"/api/report/{report.id}/export/json")
    assert response.status_code == 200
    assert "application/json" in response.headers["content-type"]
    
    data = response.json()
    assert data["team_name"] == "Test Team"


def test_delete_report(client, test_db):
    """Test deleting a report"""
    from app.models.report import Report
    report = Report(
        team_name="Test Team",
        game="valorant",
        status="completed"
    )
    test_db.add(report)
    test_db.commit()
    test_db.refresh(report)
    
    report_id = report.id
    
    response = client.delete(f"/api/report/{report_id}")
    assert response.status_code == 200
    
    # Verify deletion
    deleted_report = test_db.query(Report).filter(Report.id == report_id).first()
    assert deleted_report is None


def test_get_report_players(client, test_db):
    """Test getting players for a report"""
    from app.models.report import Report, ReportPlayer
    
    report = Report(team_name="Test Team", game="valorant", status="completed")
    test_db.add(report)
    test_db.commit()
    test_db.refresh(report)
    
    player = ReportPlayer(
        report_id=report.id,
        player_name="TestPlayer",
        role="Duelist",
        team="Test Team",
        metrics_json={"kd_ratio": 1.5}
    )
    test_db.add(player)
    test_db.commit()
    
    response = client.get(f"/api/report/{report.id}/players")
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) == 1
    assert data[0]["player_name"] == "TestPlayer"
    assert data[0]["role"] == "Duelist"
