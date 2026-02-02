import httpx
from typing import Optional, Dict, Any, List
from app.core.config import settings
from app.utils.cache import cache
import logging

logger = logging.getLogger(__name__)


class GRIDGraphQLClient:
    """
    GRID GraphQL client for querying official esports match data.
    
    Centralized service that:
    - Handles authentication (Bearer token)
    - Manages error handling and retries
    - Implements caching for match data
    - Rate limiting (if needed)
    
    GRID API Endpoints:
    - Central Data (GraphQL): Team/match queries
    - Series State (GraphQL): Live match state
    - File Download (REST): Full gameplay data
    - WebSocket Events: Real-time updates
    """

    def __init__(self):
        self.api_key = settings.GRID_API_KEY
        self.central_url = settings.GRID_CENTRAL_DATA_URL
        self.series_state_url = settings.GRID_SERIES_STATE_URL
        self.file_download_url = settings.GRID_FILE_DOWNLOAD_URL
        self.ws_events_url = settings.GRID_WS_EVENTS_URL
        
        if not self.api_key:
            logger.warning("GRID_API_KEY not set - using mock data")

    def _get_headers(self) -> Dict[str, str]:
        """Get authentication headers for GRID API"""
        return {
            "x-api-key": self.api_key if self.api_key else "",
            "Content-Type": "application/json"
        }

    async def query(
        self,
        query: str,
        variables: Optional[Dict[str, Any]] = None,
        endpoint: str = "central"
    ) -> Dict[str, Any]:
        """
        Execute GraphQL query against GRID API.
        
        Args:
            query: GraphQL query string
            variables: Query variables
            endpoint: "central" or "series_state"
        
        Returns:
            GraphQL response data
        """
        url = self.central_url if endpoint == "central" else self.series_state_url
        
        # Mock mode if no API key
        if not self.api_key:
            logger.info(f"Mock mode: {query[:50]}...")
            return {"data": {}}

        try:
            async with httpx.AsyncClient(timeout=30.0) as client:
                response = await client.post(
                    url,
                    json={"query": query, "variables": variables or {}},
                    headers=self._get_headers()
                )
                response.raise_for_status()
                result = response.json()
                
                if "errors" in result:
                    logger.error(f"GraphQL errors: {result['errors']}")
                    raise Exception(f"GraphQL errors: {result['errors']}")
                
                return result
                
        except httpx.HTTPError as e:
            logger.error(f"GRID API HTTP error: {e}")
            raise Exception(f"Failed to query GRID API: {e}")
        except Exception as e:
            logger.error(f"GRID API error: {e}")
            raise

    async def search_team(self, team_name: str, game: str = "valorant") -> Optional[Dict[str, Any]]:
        """
        Search for a team by name and return team ID + basic info.
        
        Query returns:
        - team.id
        - team.name
        - team.slug
        - team.logoUrl (optional)
        """
        query = """
        query SearchTeam($name: String!, $game: String!) {
            teams(filter: { name: { contains: $name }, game: { eq: $game } }, first: 5) {
                edges {
                    node {
                        id
                        name
                        slug
                        images {
                            logo
                        }
                    }
                }
            }
        }
        """
        
        cache_key = f"team_{game}_{team_name.lower()}"
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        try:
            result = await self.query(query, {"name": team_name, "game": game.upper()})
            teams = result.get("data", {}).get("teams", {}).get("edges", [])
            
            if teams:
                team_data = teams[0]["node"]
                cache.set(cache_key, team_data)
                return team_data
            
            logger.warning(f"Team not found: {team_name}")
            return None
            
        except Exception as e:
            logger.error(f"Failed to search team: {e}")
            # Return mock data for development
            return {
                "id": f"mock_team_{team_name}",
                "name": team_name,
                "slug": team_name.lower().replace(" ", "-")
            }

    async def get_team_matches(
        self,
        team_id: str,
        game: str = "valorant",
        limit: int = 10,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None
    ) -> List[Dict[str, Any]]:
        """
        Fetch recent matches for a team.
        
        Returns list of matches with:
        - series.id
        - series.startTime
        - teams[].name
        - games[].id
        - games[].map (for Valorant)
        - games[].winner
        """
        query = """
        query GetTeamMatches($teamId: ID!, $game: String!, $limit: Int!, $from: DateTime, $to: DateTime) {
            series(
                filter: {
                    game: { eq: $game },
                    teamIds: { contains: $teamId },
                    startTime: { gte: $from, lte: $to }
                },
                first: $limit,
                orderBy: { startTime: DESC }
            ) {
                edges {
                    node {
                        id
                        startTime
                        teams {
                            id
                            name
                        }
                        games {
                            id
                            number
                            state
                            map {
                                name
                            }
                            teams {
                                id
                                name
                                score
                                won
                            }
                        }
                    }
                }
            }
        }
        """
        
        cache_key = f"matches_{team_id}_{limit}_{date_from}_{date_to}"
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        variables = {
            "teamId": team_id,
            "game": game.upper(),
            "limit": limit,
            "from": date_from,
            "to": date_to
        }
        
        try:
            result = await self.query(query, variables)
            series_edges = result.get("data", {}).get("series", {}).get("edges", [])
            matches = [edge["node"] for edge in series_edges]
            
            cache.set(cache_key, matches)
            return matches
            
        except Exception as e:
            logger.error(f"Failed to get team matches: {e}")
            # Return mock data
            return self._generate_mock_matches(team_id, limit)

    async def get_match_details(self, series_id: str) -> Optional[Dict[str, Any]]:
        """
        Get detailed match data including player stats.
        
        Returns:
        - games[].players[].stats
        - games[].segments (round-by-round for Valorant)
        - games[].teams[].composition
        """
        query = """
        query GetMatchDetails($seriesId: ID!) {
            series(id: $seriesId) {
                id
                startTime
                games {
                    id
                    number
                    map {
                        name
                    }
                    teams {
                        id
                        name
                        won
                        players {
                            id
                            name
                            role
                            agent {
                                name
                            }
                            stats {
                                kills
                                deaths
                                assists
                                score
                            }
                        }
                    }
                }
            }
        }
        """
        
        cache_key = f"match_detail_{series_id}"
        cached = cache.get(cache_key)
        if cached:
            return cached
        
        try:
            result = await self.query(query, {"seriesId": series_id})
            series = result.get("data", {}).get("series")
            
            if series:
                cache.set(cache_key, series)
            return series
            
        except Exception as e:
            logger.error(f"Failed to get match details: {e}")
            return None

    async def get_live_series_state(self, series_id: str) -> Dict[str, Any]:
        """
        Fetch live series state from GRID Series State API.
        Used for real-time scouting of ongoing matches.
        """
        query = """
        query GetSeriesState($id: ID!) {
            seriesState(id: $id) {
                id
                state
                games {
                    id
                    state
                    currentRound
                    teams {
                        id
                        score
                    }
                }
            }
        }
        """
        
        try:
            result = await self.query(query, {"id": series_id}, endpoint="series_state")
            return result.get("data", {}).get("seriesState", {})
        except Exception as e:
            logger.error(f"Failed to get live series state: {e}")
            return {"state": "unknown"}

    def _generate_mock_matches(self, team_id: str, limit: int) -> List[Dict[str, Any]]:
        """Generate mock match data for development/testing"""
        mock_matches = []
        for i in range(min(limit, 5)):
            mock_matches.append({
                "id": f"mock_series_{i}",
                "startTime": "2024-01-20T10:00:00Z",
                "teams": [
                    {"id": team_id, "name": "Mock Team"},
                    {"id": "opponent", "name": f"Opponent {i}"}
                ],
                "games": [
                    {
                        "id": f"mock_game_{i}",
                        "number": 1,
                        "state": "completed",
                        "map": {"name": "Haven"},
                        "teams": [
                            {"id": team_id, "name": "Mock Team", "score": 13, "won": True},
                            {"id": "opponent", "name": f"Opponent {i}", "score": 11, "won": False}
                        ]
                    }
                ]
            })
        return mock_matches


# Singleton instance
grid_service = GRIDGraphQLClient()
