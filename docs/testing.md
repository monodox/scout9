# Testing

## Overview

Scout9 uses **pytest** for comprehensive backend testing. The test suite includes unit tests for algorithms and integration tests for API endpoints.

**Test Coverage Goal**: 80%+ for core business logic

---

## Test Structure

```
backend/
├── tests/
│   ├── conftest.py           # Fixtures and configuration
│   ├── test_analysis.py      # Unit tests for analysis algorithms
│   ├── test_api.py           # Integration tests for API endpoints
│   ├── test_grid_service.py  # GRID API client tests
│   └── test_export.py        # Export functionality tests
├── pytest.ini                # Pytest configuration
└── requirements-test.txt     # Test dependencies
```

---

## Setup

### Install Test Dependencies
```bash
cd backend
pip install -r requirements-test.txt
```

**requirements-test.txt**:
```txt
pytest==7.4.4
pytest-asyncio==0.21.1
pytest-mock==3.12.0
pytest-cov==4.1.0
httpx==0.26.0
```

---

## Running Tests

### All Tests
```bash
pytest
```

### Specific Test File
```bash
pytest tests/test_analysis.py
```

### Specific Test Function
```bash
pytest tests/test_analysis.py::test_calculate_kd_ratio
```

### With Coverage
```bash
pytest --cov=app --cov-report=html
# Open htmlcov/index.html in browser
```

### Verbose Output
```bash
pytest -v
```

### Stop on First Failure
```bash
pytest -x
```

---

## Test Fixtures

**File**: `tests/conftest.py`

### Database Fixture
```python
import pytest
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool
from app.core.database import Base

@pytest.fixture
def test_db():
    """In-memory SQLite database for tests"""
    engine = create_engine(
        "sqlite:///:memory:",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool
    )
    Base.metadata.create_all(bind=engine)
    
    TestingSessionLocal = sessionmaker(bind=engine)
    db = TestingSessionLocal()
    
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)
```

### Test Client Fixture
```python
from fastapi.testclient import TestClient
from app.main import app
from app.core.database import get_db

@pytest.fixture
def client(test_db):
    """FastAPI test client with database override"""
    def override_get_db():
        yield test_db
    
    app.dependency_overrides[get_db] = override_get_db
    
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()
```

### Sample Match Data Fixture
```python
@pytest.fixture
def sample_match_data():
    """Realistic match data for testing analysis"""
    return [
        {
            "id": "match-1",
            "map": "Bind",
            "winner": "Test Team",
            "players": [
                {
                    "name": "Player1",
                    "agent": "Jett",
                    "kills": 24,
                    "deaths": 18,
                    "assists": 7
                },
                {
                    "name": "Player2",
                    "agent": "Omen",
                    "kills": 15,
                    "deaths": 20,
                    "assists": 12
                }
            ]
        },
        {
            "id": "match-2",
            "map": "Haven",
            "winner": "Opponent",
            "players": [
                {
                    "name": "Player1",
                    "agent": "Jett",
                    "kills": 22,
                    "deaths": 16,
                    "assists": 5
                },
                {
                    "name": "Player2",
                    "agent": "Sage",
                    "kills": 12,
                    "deaths": 19,
                    "assists": 14
                }
            ]
        }
    ]
```

---

## Unit Tests

### Analysis Algorithm Tests
**File**: `tests/test_analysis.py`

#### Test K/D Ratio Calculation
```python
def test_calculate_kd_ratio(sample_match_data):
    from app.services.analysis import AnalysisService
    
    service = AnalysisService()
    result = service.analyze_player_performance(sample_match_data, "Player1")
    
    # Player1: (24+22) kills / (18+16) deaths = 46/34 = 1.35
    assert result['kd_ratio'] == pytest.approx(1.35, rel=0.01)
    assert result['total_kills'] == 46
    assert result['total_deaths'] == 34
```

#### Test Consistency Score
```python
def test_consistency_score():
    from app.services.analysis import AnalysisService
    
    service = AnalysisService()
    
    # Highly consistent performance
    consistent_kills = [20, 21, 19, 20, 20]
    score = service._calculate_consistency(consistent_kills)
    assert score > 0.9
    
    # Inconsistent performance
    inconsistent_kills = [5, 30, 10, 35, 15]
    score = service._calculate_consistency(inconsistent_kills)
    assert score < 0.6
```

#### Test Agent Pool Analysis
```python
def test_agent_pool_analysis(sample_match_data):
    from app.services.analysis import AnalysisService
    
    service = AnalysisService()
    result = service.analyze_player_performance(sample_match_data, "Player1")
    
    agent_pool = result['agent_pool']
    assert 'Jett' in agent_pool
    assert agent_pool['Jett']['count'] == 2
    assert agent_pool['Jett']['pick_rate'] == 1.0  # 100% Jett
```

#### Test Tendency Generation
```python
def test_tendency_generation():
    from app.services.analysis import AnalysisService
    
    service = AnalysisService()
    
    # High fragging player
    metrics = {
        'kd_ratio': 1.8,
        'avg_kills': 25,
        'consistency_score': 0.85
    }
    
    tendencies = service._generate_tendencies(metrics)
    
    assert "High fragging" in tendencies['labels']
    assert "Highly consistent" in tendencies['labels']
    assert len(tendencies['strengths']) > 0
```

#### Test Strategy Identification
```python
def test_identify_strategies(sample_match_data):
    from app.services.analysis import AnalysisService
    
    service = AnalysisService()
    strategies = service.identify_strategies(sample_match_data, "Test Team")
    
    assert len(strategies) > 0
    assert all(s['category'] in ['Map Control', 'Aggression', 'Utility'] 
               for s in strategies)
```

#### Test Composition Analysis
```python
def test_composition_analysis(sample_match_data):
    from app.services.analysis import AnalysisService
    
    service = AnalysisService()
    compositions = service.analyze_compositions(sample_match_data, "Test Team")
    
    assert len(compositions) > 0
    
    for comp in compositions:
        assert 'comp_key' in comp
        assert 'win_rate' in comp
        assert 'sample_size' in comp
        assert 0 <= comp['win_rate'] <= 1
```

---

## Integration Tests

### API Endpoint Tests
**File**: `tests/test_api.py`

#### Test Scout Run Creation
```python
def test_scout_run_creates_report(client, test_db):
    response = client.post("/api/scout/run", json={
        "team_name": "Test Team",
        "game": "valorant",
        "date_from": "2024-01-01",
        "date_to": "2024-01-31"
    })
    
    assert response.status_code == 201
    data = response.json()
    
    assert 'report_id' in data
    assert data['status'] == 'pending'
    
    # Verify report in database
    from app.models.report import Report
    report = test_db.query(Report).filter(
        Report.id == data['report_id']
    ).first()
    
    assert report is not None
    assert report.team_name == "Test Team"
```

#### Test List Reports
```python
def test_list_reports(client, test_db):
    # Create test reports
    from app.models.report import Report
    report1 = Report(team_name="Team A", game="valorant", status="completed")
    report2 = Report(team_name="Team B", game="valorant", status="pending")
    test_db.add_all([report1, report2])
    test_db.commit()
    
    # Test endpoint
    response = client.get("/api/report/")
    assert response.status_code == 200
    
    data = response.json()
    assert data['total'] == 2
    assert len(data['reports']) == 2
```

#### Test Get Report Details
```python
def test_get_report_detail(client, test_db):
    from app.models.report import Report
    
    report = Report(
        team_name="Test Team",
        game="valorant",
        status="completed",
        summary_json={"total_matches": 45}
    )
    test_db.add(report)
    test_db.commit()
    
    response = client.get(f"/api/report/{report.id}")
    assert response.status_code == 200
    
    data = response.json()
    assert data['team_name'] == "Test Team"
    assert data['summary_json']['total_matches'] == 45
```

#### Test Report Export HTML
```python
def test_export_report_html(client, test_db):
    from app.models.report import Report
    
    report = Report(
        team_name="Test Team",
        game="valorant",
        status="completed"
    )
    test_db.add(report)
    test_db.commit()
    
    response = client.get(f"/api/report/{report.id}/export/html")
    assert response.status_code == 200
    assert response.headers['content-type'] == 'text/html; charset=utf-8'
    assert b'Test Team' in response.content
```

#### Test Delete Report Cascade
```python
def test_delete_report_cascade(client, test_db):
    from app.models.report import Report, ReportPlayer
    
    # Create report with player
    report = Report(team_name="Test Team", game="valorant", status="completed")
    test_db.add(report)
    test_db.commit()
    
    player = ReportPlayer(
        report_id=report.id,
        player_name="TestPlayer",
        metrics_json={}
    )
    test_db.add(player)
    test_db.commit()
    
    # Delete report
    response = client.delete(f"/api/report/{report.id}")
    assert response.status_code == 204
    
    # Verify cascade delete
    assert test_db.query(Report).filter(Report.id == report.id).first() is None
    assert test_db.query(ReportPlayer).filter(
        ReportPlayer.report_id == report.id
    ).first() is None
```

---

## Mocking External APIs

### Mock GRID API Responses
```python
@pytest.fixture
def mock_grid_client(monkeypatch):
    from app.services.grid_service import GRIDGraphQLClient
    
    async def mock_search_team(self, team_name, game):
        return {"id": "test-team-id", "name": team_name}
    
    async def mock_get_matches(self, team_id, limit):
        return [
            {
                "id": "match-1",
                "map": "Bind",
                "players": [...]
            }
        ]
    
    monkeypatch.setattr(
        GRIDGraphQLClient,
        'search_team',
        mock_search_team
    )
    monkeypatch.setattr(
        GRIDGraphQLClient,
        'get_team_matches',
        mock_get_matches
    )
```

### Use Mock in Tests
```python
def test_scout_with_mock_grid(client, test_db, mock_grid_client):
    response = client.post("/api/scout/run", json={
        "team_name": "Test Team",
        "game": "valorant",
        "date_from": "2024-01-01",
        "date_to": "2024-01-31"
    })
    
    assert response.status_code == 201
    # Test continues without real GRID API calls
```

---

## Test Configuration

**File**: `pytest.ini`

```ini
[pytest]
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*

# Async support
asyncio_mode = auto

# Coverage settings
addopts = 
    --strict-markers
    --disable-warnings
    -v

markers =
    unit: Unit tests (fast)
    integration: Integration tests (slower)
    slow: Slow tests (skip with -m "not slow")
```

---

## Running Specific Test Categories

### Unit Tests Only
```bash
pytest -m unit
```

### Integration Tests Only
```bash
pytest -m integration
```

### Skip Slow Tests
```bash
pytest -m "not slow"
```

---

## Continuous Integration

### GitHub Actions
```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.10'
      
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
          pip install -r requirements-test.txt
      
      - name: Run tests
        run: |
          cd backend
          pytest --cov=app --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./backend/coverage.xml
```

---

## Coverage Goals

### Current Coverage
```bash
pytest --cov=app --cov-report=term-missing
```

### Target Coverage by Module
- **services/analysis.py**: 90%+
- **api/*.py**: 80%+
- **models/*.py**: 70%+
- **Overall**: 80%+

---

## Testing Best Practices

### 1. Arrange-Act-Assert Pattern
```python
def test_example():
    # Arrange: Set up test data
    data = {"key": "value"}
    
    # Act: Execute function
    result = function_under_test(data)
    
    # Assert: Verify outcome
    assert result == expected_value
```

### 2. Test One Thing Per Test
```python
# ❌ Bad: Testing multiple things
def test_everything():
    assert function1() == "result1"
    assert function2() == "result2"
    assert function3() == "result3"

# ✅ Good: Separate tests
def test_function1():
    assert function1() == "result1"

def test_function2():
    assert function2() == "result2"
```

### 3. Use Descriptive Names
```python
# ❌ Bad
def test_calc():
    ...

# ✅ Good
def test_kd_ratio_calculated_correctly_with_positive_values():
    ...
```

---

## Frontend Testing (Future)

### Recommended Stack
- **Vitest**: Unit tests
- **Testing Library**: Component tests
- **Playwright**: E2E tests

### Example Component Test
```typescript
import { render, screen } from '@testing-library/react'
import { ReportDetail } from './ReportDetail'

test('renders report title', () => {
  const report = { team_name: 'Test Team', game: 'valorant' }
  render(<ReportDetail report={report} />)
  
  expect(screen.getByText('Test Team')).toBeInTheDocument()
})
```

---

## Related Documentation

- [Analysis Logic](analysis-logic.md) - Algorithms being tested
- [API Reference](api-reference.md) - Endpoints being tested
- [Troubleshooting](troubleshooting.md) - Test failures
