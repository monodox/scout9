from typing import Dict, Any, List
from collections import Counter, defaultdict
import statistics


class AnalysisService:
    """
    Core data analysis engine for Scout9.
    
    Responsibility: Perform all statistical analysis on raw GRID match data
    - Analyzes player performance and identifies tendencies
    - Recognizes strategic patterns across matches
    - Evaluates team compositions and calculates win rates
    - Generates trend analysis from historical data
    
    Input: Raw match data from GRID API
    Output: Structured analysis results for storage in Supabase
    """

    def analyze_matches(self, matches: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Analyze multiple matches and extract insights.
        
        Returns:
        - player_stats: Per-player aggregated stats
        - strategies: Identified strategic patterns
        - compositions: Team comp analysis
        - trends: Meta trends
        """
        players = self._extract_players(matches)
        player_analysis = {}
        
        for player_id, player_data in players.items():
            player_analysis[player_id] = self.analyze_player_performance(player_data)
        
        strategies = self.identify_strategies(matches)
        compositions = self.analyze_compositions(matches)
        
        return {
            "players": player_analysis,
            "strategies": strategies,
            "compositions": compositions,
            "match_count": len(matches)
        }

    def analyze_player_performance(self, player_data: Dict[str, Any]) -> Dict[str, Any]:
        """
        Analyze player performance across matches.
        
        Computes:
        - Consistency: Pick frequency, role stability
        - Performance trend: Moving average of key stats
        - Aggression proxy: Early involvement metrics
        - Agent/champion preferences
        
        Returns structured metrics_json and tendencies_json
        """
        matches = player_data.get("matches", [])
        if not matches:
            return {"metrics_json": {}, "tendencies_json": {}}
        
        # Extract stats from each match
        kills = []
        deaths = []
        assists = []
        scores = []
        agents = []
        roles = []
        maps_played = []
        
        for match in matches:
            stats = match.get("stats", {})
            kills.append(stats.get("kills", 0))
            deaths.append(stats.get("deaths", 1))  # Avoid div by zero
            assists.append(stats.get("assists", 0))
            scores.append(stats.get("score", 0))
            
            if "agent" in match:
                agents.append(match["agent"])
            if "role" in match:
                roles.append(match["role"])
            if "map" in match:
                maps_played.append(match["map"])
        
        # Calculate metrics
        avg_kills = statistics.mean(kills) if kills else 0
        avg_deaths = statistics.mean(deaths) if deaths else 1
        avg_assists = statistics.mean(assists) if assists else 0
        avg_score = statistics.mean(scores) if scores else 0
        kd_ratio = avg_kills / avg_deaths if avg_deaths > 0 else 0
        
        # Consistency (standard deviation / mean)
        consistency = 1 - (statistics.stdev(scores) / avg_score if avg_score > 0 and len(scores) > 1 else 0)
        consistency = max(0, min(1, consistency))
        
        # Agent/role preferences
        agent_counter = Counter(agents)
        role_counter = Counter(roles)
        map_counter = Counter(maps_played)
        
        most_played_agent = agent_counter.most_common(1)[0] if agent_counter else None
        most_played_role = role_counter.most_common(1)[0] if role_counter else None
        
        # Build metrics JSON
        metrics_json = {
            "avg_kills": round(avg_kills, 2),
            "avg_deaths": round(avg_deaths, 2),
            "avg_assists": round(avg_assists, 2),
            "avg_score": round(avg_score, 2),
            "kd_ratio": round(kd_ratio, 2),
            "consistency": round(consistency, 2),
            "games_played": len(matches),
            "agent_pool": dict(agent_counter),
            "role_distribution": dict(role_counter)
        }
        
        # Generate tendencies
        tendencies = self._generate_player_tendencies(
            metrics_json, most_played_agent, most_played_role, map_counter
        )
        
        return {
            "metrics_json": metrics_json,
            "tendencies_json": tendencies,
            "player_name": player_data.get("name", "Unknown"),
            "role": most_played_role[0] if most_played_role else None
        }

    def _generate_player_tendencies(
        self,
        metrics: Dict[str, Any],
        most_played_agent: tuple,
        most_played_role: tuple,
        map_counter: Counter
    ) -> Dict[str, Any]:
        """Convert numeric metrics into human-readable tendencies"""
        tendencies = {
            "labels": [],
            "strengths": [],
            "weaknesses": []
        }
        
        # Consistency tendency
        if metrics["consistency"] >= 0.8:
            tendencies["labels"].append("Highly consistent performer")
            tendencies["strengths"].append("Reliable performance across matches")
        elif metrics["consistency"] < 0.5:
            tendencies["labels"].append("Inconsistent performance")
            tendencies["weaknesses"].append("Performance varies significantly")
        
        # K/D ratio tendency
        if metrics["kd_ratio"] >= 1.5:
            tendencies["labels"].append("High fragging potential")
            tendencies["strengths"].append(f"Strong K/D ratio ({metrics['kd_ratio']})")
        elif metrics["kd_ratio"] < 0.8:
            tendencies["weaknesses"].append(f"Low K/D ratio ({metrics['kd_ratio']})")
        
        # Agent/Champion preference
        if most_played_agent and most_played_agent[1] >= 3:
            tendencies["labels"].append(f"Prefers {most_played_agent[0]}")
            tendencies["strengths"].append(f"Specialized in {most_played_agent[0]} ({most_played_agent[1]} games)")
        
        # Role tendency
        if most_played_role:
            tendencies["labels"].append(f"{most_played_role[0]} player")
        
        # Map performance
        if map_counter:
            best_map = map_counter.most_common(1)[0]
            tendencies["strengths"].append(f"Frequently plays {best_map[0]}")
        
        # Assist tendency (support player)
        if metrics["avg_assists"] >= 8:
            tendencies["labels"].append("Team player (high assists)")
            tendencies["strengths"].append("Strong support and setup ability")
        
        return tendencies

    def identify_strategies(self, matches: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Identify strategic patterns from match data.
        
        Patterns include:
        - Map preferences
        - Side preferences (attack/defense)
        - Tempo patterns (fast/slow executes)
        """
        strategies = []
        map_wins = defaultdict(lambda: {"wins": 0, "total": 0})
        
        for match in matches:
            for game in match.get("games", []):
                map_name = game.get("map", {}).get("name", "Unknown")
                
                # Determine if team won
                for team in game.get("teams", []):
                    if team.get("won"):
                        map_wins[map_name]["wins"] += 1
                    map_wins[map_name]["total"] += 1
        
        # Generate map-based strategies
        for map_name, stats in map_wins.items():
            if stats["total"] >= 2:  # At least 2 games
                win_rate = stats["wins"] / stats["total"]
                
                strategies.append({
                    "category": "map_preference",
                    "label": f"{map_name} performance",
                    "confidence": win_rate,
                    "frequency": stats["total"],
                    "success_rate": win_rate,
                    "details_json": {
                        "map": map_name,
                        "wins": stats["wins"],
                        "losses": stats["total"] - stats["wins"]
                    }
                })
        
        return strategies

    def analyze_compositions(self, matches: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """
        Analyze team compositions - agent/champion picks.
        
        Returns:
        - Unique compositions
        - Win rates
        - Pick rates
        - Sample sizes
        """
        compositions = defaultdict(lambda: {"wins": 0, "total": 0, "maps": defaultdict(int)})
        
        for match in matches:
            for game in match.get("games", []):
                map_name = game.get("map", {}).get("name", "Unknown")
                
                for team in game.get("teams", []):
                    # Extract agent/champion picks
                    agents = []
                    for player in team.get("players", []):
                        agent = player.get("agent", {}).get("name")
                        if agent:
                            agents.append(agent)
                    
                    if agents:
                        # Create composition key (sorted for consistency)
                        comp_key = ",".join(sorted(agents))
                        
                        compositions[comp_key]["total"] += 1
                        compositions[comp_key]["maps"][map_name] += 1
                        
                        if team.get("won"):
                            compositions[comp_key]["wins"] += 1
        
        # Convert to list format
        comp_list = []
        total_games = sum(comp["total"] for comp in compositions.values())
        
        for comp_key, stats in compositions.items():
            win_rate = stats["wins"] / stats["total"] if stats["total"] > 0 else 0
            pick_rate = stats["total"] / total_games if total_games > 0 else 0
            
            comp_list.append({
                "comp_key": comp_key,
                "picks_json": {
                    "picks": comp_key.split(","),
                    "count": len(comp_key.split(","))
                },
                "win_rate": round(win_rate, 3),
                "pick_rate": round(pick_rate, 3),
                "sample_size": stats["total"],
                "map_performance": dict(stats["maps"])
            })
        
        # Sort by sample size (most played first)
        comp_list.sort(key=lambda x: x["sample_size"], reverse=True)
        
        return comp_list

    def _extract_players(self, matches: List[Dict[str, Any]]) -> Dict[str, Dict]:
        """Extract player data from matches for analysis"""
        players = defaultdict(lambda: {"matches": [], "name": ""})
        
        for match in matches:
            for game in match.get("games", []):
                for team in game.get("teams", []):
                    for player in team.get("players", []):
                        player_id = player.get("id", player.get("name", "unknown"))
                        player_name = player.get("name", "Unknown")
                        
                        players[player_id]["name"] = player_name
                        players[player_id]["matches"].append({
                            "stats": player.get("stats", {}),
                            "agent": player.get("agent", {}).get("name"),
                            "role": player.get("role"),
                            "map": game.get("map", {}).get("name"),
                            "won": team.get("won", False)
                        })
        
        return players

    def generate_trends(self, matches: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Generate meta trends from historical match data.
        
        Returns:
        - Trending agents/champions
        - Meta shifts over time
        - Performance trends
        """
        if not matches:
            return {"trending_agents": [], "meta_shifts": []}
        
        agent_usage = Counter()
        recent_agents = Counter()
        
        # Split matches into early and recent
        mid_point = len(matches) // 2
        
        for i, match in enumerate(matches):
            for game in match.get("games", []):
                for team in game.get("teams", []):
                    for player in team.get("players", []):
                        agent = player.get("agent", {}).get("name")
                        if agent:
                            agent_usage[agent] += 1
                            if i >= mid_point:
                                recent_agents[agent] += 1
        
        trending = []
        for agent, recent_count in recent_agents.most_common(5):
            early_count = agent_usage[agent] - recent_count
            if recent_count > early_count:
                trending.append({
                    "agent": agent,
                    "trend": "rising",
                    "recent_picks": recent_count
                })
        
        return {
            "trending_agents": trending,
            "total_matches_analyzed": len(matches),
            "meta_shifts": []
        }


analysis_service = AnalysisService()
