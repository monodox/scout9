from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import logging
from datetime import datetime, timedelta

from app.services.grid_service import grid_service

router = APIRouter(prefix="/api/live", tags=["live"])
logger = logging.getLogger(__name__)


@router.get("/matches")
async def get_live_matches() -> Dict[str, Any]:
    """
    Get recent series (matches) from GRID API using exact playground schema.
    """
    try:
        # Query for recent series using exact playground schema with orderDirection
        query = """
        query GetAllSeries {
            allSeries(
                first: 20,
                orderBy: StartTimeScheduled,
                orderDirection: DESC
            ) {
                totalCount,
                pageInfo {
                    hasPreviousPage
                    hasNextPage
                    startCursor
                    endCursor
                }
                edges {
                    cursor
                    node {
                        id
                        startTimeScheduled
                    }
                }
            }
        }
        """
        
        result = await grid_service.query(query)
        series_edges = result.get("data", {}).get("allSeries", {}).get("edges", [])
        matches = [edge["node"] for edge in series_edges]
        
        return {
            "total": len(matches),
            "matches": matches
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch matches: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch matches from GRID API: {str(e)}")


@router.get("/series-state")
async def get_series_state() -> Dict[str, Any]:
    """
    Get live series state data from GRID API.
    Note: This requires a specific series ID for live data.
    """
    try:
        # For demonstration, we'll return a placeholder since series state requires specific live series IDs
        return {
            "total": 0,
            "message": "Series state requires specific live series IDs",
            "live_series": []
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch series state: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch series state from GRID API: {str(e)}")


@router.get("/stats")
async def get_stats() -> Dict[str, Any]:
    """
    Get statistics data from GRID API.
    Note: This requires specific team/player IDs for statistics.
    """
    try:
        # For demonstration, we'll return a placeholder since stats require specific team/player IDs
        return {
            "total": 0,
            "message": "Statistics require specific team or player IDs",
            "stats": []
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch stats: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch stats from GRID API: {str(e)}")


@router.get("/tournaments")
async def get_active_tournaments() -> Dict[str, Any]:
    """
    Get tournaments from GRID API using exact playground schema.
    """
    try:
        # Query for tournaments using exact playground schema
        query = """
        query GetTournaments {
            tournaments {
                pageInfo {
                    hasPreviousPage
                    hasNextPage
                    startCursor
                    endCursor
                }
                totalCount
                edges {
                    cursor
                    node {
                        id
                        name
                        nameShortened
                    }
                }
            }
        }
        """
        
        result = await grid_service.query(query)
        tournament_edges = result.get("data", {}).get("tournaments", {}).get("edges", [])
        tournaments = [edge["node"] for edge in tournament_edges]
        
        return {
            "total": len(tournaments),
            "tournaments": tournaments
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch tournaments: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch tournaments from GRID API: {str(e)}")


@router.get("/organizations")
async def get_organizations() -> Dict[str, Any]:
    """
    Get esports organizations from GRID API.
    """
    try:
        query = """
        query GetOrganizations {
            organizations(first: 10) {
                edges {
                    node {
                        id
                        name
                        teams {
                            name
                        }
                    }
                }
            }
        }
        """
        
        result = await grid_service.query(query)
        org_edges = result.get("data", {}).get("organizations", {}).get("edges", [])
        organizations = [edge["node"] for edge in org_edges]
        
        return {
            "total": len(organizations),
            "organizations": organizations
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch organizations: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch organizations from GRID API: {str(e)}")


@router.get("/teams")
async def get_teams() -> Dict[str, Any]:
    """
    Get teams from GRID API.
    """
    try:
        query = """
        query GetTeams {
            teams(first: 15, after: null) {
                totalCount
                pageInfo {
                    hasPreviousPage
                    hasNextPage
                    startCursor
                    endCursor
                }
                edges {
                    cursor
                    node {
                        id
                        name
                        colorPrimary
                        colorSecondary
                    }
                }
            }
        }
        """
        
        result = await grid_service.query(query)
        team_edges = result.get("data", {}).get("teams", {}).get("edges", [])
        teams = [edge["node"] for edge in team_edges]
        
        return {
            "total": len(teams),
            "teams": teams
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch teams: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch teams from GRID API: {str(e)}")


@router.get("/players")
async def get_players() -> Dict[str, Any]:
    """
    Get players from GRID API.
    """
    try:
        query = """
        query GetPlayers {
            players(first: 20) {
                edges {
                    node {
                        id
                    }
                }
            }
        }
        """
        
        result = await grid_service.query(query)
        player_edges = result.get("data", {}).get("players", {}).get("edges", [])
        players = [edge["node"] for edge in player_edges]
        
        return {
            "total": len(players),
            "players": players
        }
        
    except Exception as e:
        logger.error(f"Failed to fetch players: {e}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch players from GRID API: {str(e)}")
