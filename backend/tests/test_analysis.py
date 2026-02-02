"""
Unit tests for analysis service.
"""
import pytest
from app.services.analysis import analysis_service


def test_analyze_player_performance():
    """Test player performance analysis"""
    player_data = {
        "name": "TestPlayer",
        "matches": [
            {
                "stats": {"kills": 20, "deaths": 15, "assists": 5, "score": 4500},
                "agent": "Jett",
                "role": "Duelist",
                "map": "Haven",
                "won": True
            },
            {
                "stats": {"kills": 18, "deaths": 14, "assists": 6, "score": 4200},
                "agent": "Jett",
                "role": "Duelist",
                "map": "Ascent",
                "won": True
            },
            {
                "stats": {"kills": 15, "deaths": 16, "assists": 4, "score": 3800},
                "agent": "Reyna",
                "role": "Duelist",
                "map": "Bind",
                "won": False
            }
        ]
    }
    
    result = analysis_service.analyze_player_performance(player_data)
    
    assert "metrics_json" in result
    assert "tendencies_json" in result
    assert result["player_name"] == "TestPlayer"
    assert result["role"] == "Duelist"
    
    metrics = result["metrics_json"]
    assert metrics["games_played"] == 3
    assert metrics["kd_ratio"] > 1.0  # Should be > 1 with these stats
    assert 0 <= metrics["consistency"] <= 1
    assert "agent_pool" in metrics
    assert "Jett" in metrics["agent_pool"]


def test_identify_strategies(sample_match_data):
    """Test strategy identification"""
    strategies = analysis_service.identify_strategies(sample_match_data)
    
    assert isinstance(strategies, list)
    # Should identify at least map performance
    if strategies:
        strategy = strategies[0]
        assert "category" in strategy
        assert "label" in strategy
        assert "success_rate" in strategy
        assert 0 <= strategy["success_rate"] <= 1


def test_analyze_compositions(sample_match_data):
    """Test composition analysis"""
    compositions = analysis_service.analyze_compositions(sample_match_data)
    
    assert isinstance(compositions, list)
    if compositions:
        comp = compositions[0]
        assert "comp_key" in comp
        assert "picks_json" in comp
        assert "win_rate" in comp
        assert "sample_size" in comp
        assert 0 <= comp["win_rate"] <= 1
        assert comp["sample_size"] > 0


def test_analyze_matches(sample_match_data):
    """Test complete match analysis"""
    result = analysis_service.analyze_matches(sample_match_data)
    
    assert "players" in result
    assert "strategies" in result
    assert "compositions" in result
    assert "match_count" in result
    assert result["match_count"] == 1


def test_player_tendencies_generation():
    """Test tendency label generation"""
    player_data = {
        "name": "HighKDPlayer",
        "matches": [
            {
                "stats": {"kills": 25, "deaths": 10, "assists": 8, "score": 5000},
                "agent": "Jett",
                "role": "Duelist",
                "map": "Haven",
                "won": True
            }
        ]
    }
    
    result = analysis_service.analyze_player_performance(player_data)
    tendencies = result["tendencies_json"]
    
    assert "labels" in tendencies
    assert "strengths" in tendencies
    # High K/D should be identified as strength
    assert any("K/D" in str(s) or "fragging" in str(s).lower() for s in tendencies["labels"] + tendencies["strengths"])


def test_empty_match_analysis():
    """Test analysis with empty match data"""
    result = analysis_service.analyze_matches([])
    
    assert result["match_count"] == 0
    assert result["players"] == {}
    assert result["strategies"] == []
    assert result["compositions"] == []


def test_generate_trends(sample_match_data):
    """Test trend generation"""
    trends = analysis_service.generate_trends(sample_match_data)
    
    assert "trending_agents" in trends
    assert "total_matches_analyzed" in trends
    assert trends["total_matches_analyzed"] == 1
