from typing import Dict, Any, List


class InsightsService:
    """
    Insight generation service with AI assistance.
    
    Responsibility: Transform aggregated statistics into coach-ready insights
    - Converts analytical data into readable summaries
    - Generates actionable recommendations
    - Identifies key patterns and warnings
    
    Input: Aggregated analysis results from AnalysisService
    Output: Human-readable insights for reports
    """

    def generate_report_summary(self, full_analysis: Dict[str, Any]) -> str:
        """
        Generate a natural language summary of the complete analysis.
        
        Args:
            full_analysis: Complete analysis output including players, strategies, compositions
        
        Returns:
            Human-readable summary string
        """
        match_count = full_analysis.get("match_count", 0)
        players = full_analysis.get("players", {})
        strategies = full_analysis.get("strategies", [])
        compositions = full_analysis.get("compositions", [])
        
        summary_parts = []
        
        # Overview
        summary_parts.append(f"Analysis based on {match_count} matches.")
        
        # Top performers
        if players:
            top_players = sorted(
                [(pid, data) for pid, data in players.items()],
                key=lambda x: x[1].get("metrics_json", {}).get("kd_ratio", 0),
                reverse=True
            )[:3]
            
            if top_players:
                summary_parts.append("\nTop Performers:")
                for pid, data in top_players:
                    name = data.get("player_name", "Unknown")
                    kd = data.get("metrics_json", {}).get("kd_ratio", 0)
                    role = data.get("role", "Unknown")
                    summary_parts.append(f"- {name} ({role}): {kd} K/D")
        
        # Key strategies
        if strategies:
            top_strategies = sorted(strategies, key=lambda x: x.get("success_rate", 0), reverse=True)[:3]
            if top_strategies:
                summary_parts.append("\nEffective Strategies:")
                for strat in top_strategies:
                    label = strat.get("label", "Unknown")
                    success = strat.get("success_rate", 0) * 100
                    summary_parts.append(f"- {label}: {success:.1f}% success rate")
        
        # Popular compositions
        if compositions:
            top_comps = sorted(compositions, key=lambda x: x.get("sample_size", 0), reverse=True)[:2]
            if top_comps:
                summary_parts.append("\nFrequent Compositions:")
                for comp in top_comps:
                    agents = ", ".join(comp.get("picks_json", {}).get("picks", [])[:3])
                    win_rate = comp.get("win_rate", 0) * 100
                    games = comp.get("sample_size", 0)
                    summary_parts.append(f"- {agents}... ({games} games, {win_rate:.1f}% WR)")
        
        return "\n".join(summary_parts)

    def generate_player_insights(self, player_analysis: Dict[str, Any]) -> Dict[str, Any]:
        """
        Generate player-specific insights from analysis.
        
        Returns structured insights with tendencies, strengths, and recommendations.
        """
        metrics = player_analysis.get("metrics_json", {})
        tendencies = player_analysis.get("tendencies_json", {})
        
        insights = {
            "summary": self._create_player_summary(metrics, tendencies),
            "key_stats": {
                "kd_ratio": metrics.get("kd_ratio", 0),
                "consistency": metrics.get("consistency", 0),
                "games_played": metrics.get("games_played", 0)
            },
            "tendencies": tendencies.get("labels", []),
            "strengths": tendencies.get("strengths", []),
            "weaknesses": tendencies.get("weaknesses", []),
            "recommendations": self._generate_recommendations(metrics, tendencies)
        }
        
        return insights

    def _create_player_summary(self, metrics: Dict[str, Any], tendencies: Dict[str, Any]) -> str:
        """Create a brief player summary"""
        kd = metrics.get("kd_ratio", 0)
        consistency = metrics.get("consistency", 0)
        games = metrics.get("games_played", 0)
        
        performance_desc = "strong" if kd >= 1.2 else "moderate" if kd >= 0.9 else "developing"
        consistency_desc = "consistent" if consistency >= 0.7 else "variable"
        
        return f"A {consistency_desc} performer with {performance_desc} impact across {games} games. K/D ratio of {kd:.2f}."

    def _generate_recommendations(self, metrics: Dict[str, Any], tendencies: Dict[str, Any]) -> List[str]:
        """Generate actionable recommendations"""
        recommendations = []
        
        # Based on K/D
        if metrics.get("kd_ratio", 0) < 1.0:
            recommendations.append("Focus on positioning and trade opportunities to improve survival rate")
        
        # Based on consistency
        if metrics.get("consistency", 0) < 0.6:
            recommendations.append("Work on performance consistency through routine and preparation")
        
        # Based on agent pool
        agent_pool = metrics.get("agent_pool", {})
        if len(agent_pool) <= 2:
            recommendations.append("Consider expanding agent pool for increased flexibility")
        
        # Based on assists
        if metrics.get("avg_assists", 0) < 5:
            recommendations.append("Increase team play and setup utility for better support")
        
        return recommendations

    def generate_strategy_insights(self, strategy_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate strategy insights from identified patterns"""
        if not strategy_data:
            return {"summary": "Insufficient data for strategy analysis"}
        
        effective_strategies = [s for s in strategy_data if s.get("success_rate", 0) >= 0.6]
        ineffective_strategies = [s for s in strategy_data if s.get("success_rate", 0) < 0.4]
        
        return {
            "summary": f"Identified {len(strategy_data)} strategic patterns",
            "effective_strategies": effective_strategies[:5],
            "ineffective_strategies": ineffective_strategies[:5],
            "recommendations": [
                "Exploit high-success strategies more frequently",
                "Avoid or refine low-success patterns",
                "Adapt strategies based on map and opponent"
            ]
        }

    def generate_composition_insights(self, composition_data: List[Dict[str, Any]]) -> Dict[str, Any]:
        """Generate composition insights"""
        if not composition_data:
            return {"summary": "Insufficient composition data"}
        
        # Find meta compositions (high win rate + decent sample size)
        meta_comps = [
            c for c in composition_data
            if c.get("win_rate", 0) >= 0.55 and c.get("sample_size", 0) >= 2
        ]
        
        # Find risky compositions (low win rate)
        weak_comps = [
            c for c in composition_data
            if c.get("win_rate", 0) < 0.45 and c.get("sample_size", 0) >= 2
        ]
        
        return {
            "summary": f"Analyzed {len(composition_data)} unique compositions",
            "meta_compositions": meta_comps[:3],
            "weak_compositions": weak_comps[:3],
            "recommendations": [
                "Prioritize high win-rate compositions",
                "Study opponent counter-strategies for weak comps",
                "Consider map-specific composition adjustments"
            ]
        }


insights_service = InsightsService()
