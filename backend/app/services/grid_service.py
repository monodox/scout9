import httpx
from typing import Optional, Dict, Any
from app.core.config import settings


class GRIDService:
    """Service for interacting with GRID API"""

    def __init__(self):
        self.api_key = settings.GRID_API_KEY
        self.central_url = settings.GRID_CENTRAL_DATA_URL
        self.series_state_url = settings.GRID_SERIES_STATE_URL
        self.file_download_url = settings.GRID_FILE_DOWNLOAD_URL
        self.ws_events_url = settings.GRID_WS_EVENTS_URL
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }

    async def _query_graphql(self, url: str, query: str, variables: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """Helper to query GRID GraphQL APIs"""
        async with httpx.AsyncClient() as client:
            response = await client.post(
                url,
                json={"query": query, "variables": variables},
                headers=self.headers
            )
            response.raise_for_status()
            return response.json()

    async def get_match_data(self, match_id: str) -> Optional[Dict[str, Any]]:
        """Fetch match data from GRID Central Data API (GraphQL)"""
        query = """
        query GetMatch($id: ID!) {
            series(id: $id) {
                id
                startTime
                format {
                    name
                }
                teams {
                    id
                    name
                }
            }
        }
        """
        # In a real scenario, we'd call self._query_graphql(self.central_url, query, {"id": match_id})
        # For now, returning simulated data
        return {
            "match_id": match_id,
            "status": "completed",
            "data": {
                "series": {
                    "id": match_id,
                    "startTime": "2024-01-28T10:00:00Z",
                    "teams": [{"name": "Team A"}, {"name": "Team B"}]
                }
            }
        }

    async def get_live_series_state(self, series_id: str) -> Dict[str, Any]:
        """Fetch live series state from GRID Series State API (GraphQL)"""
        query = """
        query GetSeriesState($id: ID!) {
            seriesState(id: $id) {
                id
                games {
                    id
                    state
                    score {
                        home
                        away
                    }
                }
            }
        }
        """
        # Simulated live data
        return {
            "series_id": series_id,
            "state": "ongoing",
            "score": {"home": 1, "away": 0}
        }

    async def download_series_data(self, series_id: str) -> bytes:
        """Download complete gameplay data from GRID File Download API (REST)"""
        # url = f"{self.file_download_url}/series/{series_id}/data"
        # Simulated download
        return b"simulated gameplay data"

    async def get_player_stats(self, player_id: str) -> Optional[Dict[str, Any]]:
        """Fetch player statistics from GRID API"""
        return {
            "player_id": player_id,
            "stats": {}
        }

    async def get_team_matches(
        self,
        team_name: str,
        date_from: Optional[str] = None,
        date_to: Optional[str] = None
    ) -> list:
        """Fetch team matches from GRID Central Data API (GraphQL)"""
        query = """
        query GetTeamMatches($teamName: String!, $from: DateTime, $to: DateTime) {
            series(filter: { teamName: $teamName, startTime: { gte: $from, lte: $to } }) {
                nodes {
                    id
                    startTime
                    teams {
                        name
                    }
                }
            }
        }
        """
        # Simulated data based on the issue description
        return [
            {
                "match_id": "m1",
                "team_name": team_name,
                "opponent": "Team Alpha",
                "date": "2024-01-20",
                "map": "Mirage",
                "result": "win",
                "players": ["p1", "p2", "p3", "p4", "p5"],
                "picks": ["agent1", "agent2"]
            },
            {
                "match_id": "m2",
                "team_name": team_name,
                "opponent": "Team Beta",
                "date": "2024-01-22",
                "map": "Inferno",
                "result": "loss",
                "players": ["p1", "p2", "p3", "p4", "p6"],
                "picks": ["agent1", "agent3"]
            }
        ]

    async def test_connection(self) -> bool:
        """Test GRID API connections"""
        try:
            # Test Central Data (GraphQL)
            await self._query_graphql(self.central_url, "{ __typename }")
            
            return True
        except Exception as e:
            print(f"Connection test failed: {e}")
            return False


grid_service = GRIDService()
