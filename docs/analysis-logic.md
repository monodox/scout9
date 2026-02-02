# Analysis Logic

## Overview

Scout9's analysis engine is the **brain** of the platform. It transforms raw match data from GRID into actionable insights using statistical algorithms and pattern recognition.

**Core Principle**: All analysis is **interpretable** - no black-box machine learning. Every metric has a clear calculation that can be explained to users.

---

## Analysis Pipeline

```
GRID Match Data
      ↓
[Player Performance Analysis]
      ↓
[Strategy Identification]
      ↓
[Composition Analysis]
      ↓
[Insight Generation]
      ↓
Database Storage
```

---

## 1. Player Performance Analysis

**File**: `backend/app/services/analysis.py` → `analyze_player_performance()`

### Input Data
```python
matches = [
    {
        "players": [
            {
                "name": "TenZ",
                "agent": "Jett",
                "kills": 24,
                "deaths": 18,
                "assists": 7
            }
        ]
    }
]
```

### Metrics Calculated

#### A. K/D Ratio
**Formula**: `total_kills / total_deaths`

```python
def calculate_kd_ratio(player_data):
    total_kills = sum(player_data['kills'])
    total_deaths = max(sum(player_data['deaths']), 1)  # Avoid division by zero
    return round(total_kills / total_deaths, 2)

# Example: 987 kills / 734 deaths = 1.34 K/D
```

**Interpretation**:
- `>= 1.5`: Elite tier
- `1.0-1.5`: Strong player
- `0.8-1.0`: Average
- `< 0.8`: Below average

#### B. Consistency Score
**Formula**: `1 - (standard_deviation / mean)`

```python
from statistics import mean, stdev

def calculate_consistency(kills_per_match):
    avg = mean(kills_per_match)
    std = stdev(kills_per_match)
    consistency = 1 - (std / avg)
    return max(0, min(consistency, 1))  # Clamp to 0-1

# Example: [20, 22, 19, 21] → mean=20.5, stdev=1.29
# Consistency = 1 - (1.29/20.5) = 0.937 (very consistent)
```

**Interpretation**:
- `>= 0.8`: Highly consistent
- `0.6-0.8`: Moderately consistent
- `< 0.6`: Inconsistent (volatile performance)

#### C. Agent Pool
**Formula**: Frequency count of character picks

```python
from collections import Counter

def analyze_agent_pool(player_data):
    agent_picks = Counter(player_data['agents'])
    total_matches = sum(agent_picks.values())
    
    agent_pool = {
        agent: {
            'count': count,
            'pick_rate': round(count / total_matches, 3)
        }
        for agent, count in agent_picks.items()
    }
    
    return agent_pool

# Example: {"Jett": 30, "Raze": 10, "Phoenix": 5}
# Jett pick rate: 30/45 = 0.667 (66.7%)
```

**Interpretation**:
- **Specialist**: 1-2 agents, high pick rates
- **Flexible**: 3-4 agents
- **Versatile**: 5+ agents

#### D. Average Stats Per Match
```python
def calculate_averages(player_data, total_matches):
    return {
        'avg_kills': round(sum(player_data['kills']) / total_matches, 1),
        'avg_deaths': round(sum(player_data['deaths']) / total_matches, 1),
        'avg_assists': round(sum(player_data['assists']) / total_matches, 1)
    }

# Example: 987 kills / 45 matches = 21.9 avg kills
```

### Output Structure
```python
{
    "player_name": "TenZ",
    "total_matches": 45,
    "total_kills": 987,
    "total_deaths": 734,
    "total_assists": 456,
    "kd_ratio": 1.34,
    "avg_kills_per_match": 21.9,
    "avg_deaths_per_match": 16.3,
    "avg_assists_per_match": 10.1,
    "consistency_score": 0.82,
    "agent_pool": {
        "Jett": {"count": 30, "pick_rate": 0.667},
        "Raze": {"count": 10, "pick_rate": 0.222}
    }
}
```

---

## 2. Player Tendency Generation

**File**: `backend/app/services/analysis.py` → `_generate_player_tendencies()`

### Label Assignment Rules

#### Fragging Labels
```python
if kd_ratio >= 1.5:
    labels.append("High fragging")
elif kd_ratio >= 1.0:
    labels.append("Positive K/D")
elif kd_ratio < 0.8:
    labels.append("Low fragging")
```

#### Playstyle Labels
```python
if avg_assists > avg_kills * 0.6:
    labels.append("Team player")
    
if avg_kills > 20:
    labels.append("Aggressive playstyle")
elif avg_deaths < 15:
    labels.append("Conservative playstyle")
```

#### Consistency Labels
```python
if consistency_score >= 0.8:
    labels.append("Highly consistent")
elif consistency_score < 0.6:
    labels.append("Inconsistent performance")
```

#### Agent Specialization
```python
top_agent = max(agent_pool, key=lambda x: agent_pool[x]['count'])
top_pick_rate = agent_pool[top_agent]['pick_rate']

if top_pick_rate >= 0.6:
    labels.append(f"{top_agent} specialist")
elif len(agent_pool) >= 4:
    labels.append("Versatile agent pool")
```

### Strength/Weakness Analysis
```python
strengths = []
weaknesses = []

# Strength: High K/D
if kd_ratio >= 1.3:
    strengths.append(f"Exceptional aim with {kd_ratio} K/D ratio")

# Strength: Consistency
if consistency_score >= 0.8:
    strengths.append("Consistent performance across maps")

# Weakness: Map-specific struggles
worst_map = min(map_performance, key=lambda x: map_performance[x]['kd'])
if map_performance[worst_map]['kd'] < overall_kd * 0.8:
    weaknesses.append(f"Lower performance on {worst_map}")

# Weakness: Over-aggression
if avg_deaths > avg_kills * 0.9:
    weaknesses.append("Occasional over-aggression leading to early deaths")
```

### Output Structure
```json
{
  "labels": [
    "High fragging",
    "Aggressive playstyle",
    "Jett specialist"
  ],
  "strengths": [
    "Exceptional aim with 1.34 K/D ratio",
    "Consistent performance across maps"
  ],
  "weaknesses": [
    "Lower performance on Haven",
    "Occasional over-aggression"
  ],
  "playstyle_summary": "Aggressive entry fragger with consistent high-impact plays"
}
```

---

## 3. Strategy Identification

**File**: `backend/app/services/analysis.py` → `identify_strategies()`

### Pattern Detection

#### Map-Specific Strategies
```python
def identify_strategies(matches):
    map_strategies = defaultdict(lambda: {
        'wins': 0,
        'total': 0,
        'approaches': Counter()
    })
    
    for match in matches:
        map_name = match['map']
        won = match['winner'] == target_team
        
        map_strategies[map_name]['total'] += 1
        if won:
            map_strategies[map_name]['wins'] += 1
        
        # Detect approach from stats
        approach = classify_approach(match)
        map_strategies[map_name]['approaches'][approach] += 1
    
    return map_strategies
```

#### Approach Classification
```python
def classify_approach(match):
    """
    Classify team's strategic approach based on match stats
    """
    first_blood_rate = match.get('first_bloods', 0) / match.get('rounds', 1)
    avg_round_time = match.get('avg_round_time', 45)
    
    if first_blood_rate > 0.5:
        return "Aggressive"
    elif avg_round_time > 50:
        return "Controlled"
    elif match.get('ult_usage_rate', 0) > 0.8:
        return "Utility-heavy"
    else:
        return "Balanced"
```

### Confidence Calculation
```python
def calculate_confidence(frequency, total):
    """
    Confidence based on sample size and frequency
    """
    if total < 5:
        return 0.3  # Low confidence with few samples
    elif frequency / total >= 0.7:
        return 0.9  # High confidence
    elif frequency / total >= 0.5:
        return 0.7  # Medium confidence
    else:
        return 0.5  # Moderate confidence
```

### Output Structure
```json
{
  "category": "Map Control",
  "label": "Aggressive Site Takes on Bind",
  "confidence": 0.87,
  "frequency": 34,
  "success_rate": 0.71,
  "details_json": {
    "description": "Early map control with fast site executions",
    "win_rate_by_map": {
      "Bind": 0.75,
      "Haven": 0.60
    },
    "conditions": {
      "map": "Bind",
      "side": "attack"
    }
  }
}
```

---

## 4. Composition Analysis

**File**: `backend/app/services/analysis.py` → `analyze_compositions()`

### Composition Identification

#### Generate Composition Key
```python
def generate_comp_key(players):
    """
    Create unique identifier for team composition
    """
    agents = sorted([p['agent'] for p in players])
    return ','.join(agents)

# Example: "Jett,Omen,Sage,Sova,Viper"
```

#### Track Composition Stats
```python
def analyze_compositions(matches):
    comp_stats = defaultdict(lambda: {
        'wins': 0,
        'picks': 0,
        'maps': Counter(),
        'players': {}
    })
    
    for match in matches:
        agents = [p['agent'] for p in match['players']]
        comp_key = generate_comp_key(match['players'])
        
        comp_stats[comp_key]['picks'] += 1
        comp_stats[comp_key]['maps'][match['map']] += 1
        
        if match['winner'] == target_team:
            comp_stats[comp_key]['wins'] += 1
        
        # Track player-agent pairings
        for player in match['players']:
            comp_stats[comp_key]['players'][player['name']] = player['agent']
    
    return comp_stats
```

### Rate Calculations
```python
def calculate_comp_rates(comp_stats, total_matches):
    results = []
    
    for comp_key, data in comp_stats.items():
        win_rate = data['wins'] / data['picks']
        pick_rate = data['picks'] / total_matches
        
        # Only include comps with sufficient sample size
        if data['picks'] >= 3:
            results.append({
                'comp_key': comp_key,
                'win_rate': round(win_rate, 3),
                'pick_rate': round(pick_rate, 3),
                'sample_size': data['picks'],
                'map_performance': calculate_map_breakdown(data['maps'])
            })
    
    # Sort by pick rate descending
    return sorted(results, key=lambda x: x['pick_rate'], reverse=True)
```

### Map Performance Breakdown
```python
def calculate_map_breakdown(map_counts):
    breakdown = {}
    
    for map_name, count in map_counts.items():
        breakdown[map_name] = {
            'picks': count,
            'pick_rate': round(count / sum(map_counts.values()), 3)
        }
    
    return breakdown
```

### Output Structure
```json
{
  "comp_key": "Jett,Omen,Sage,Sova,Viper",
  "win_rate": 0.75,
  "pick_rate": 0.267,
  "sample_size": 12,
  "picks_json": {
    "agents": [
      {"name": "Jett", "role": "Duelist", "player": "TenZ"},
      {"name": "Omen", "role": "Controller", "player": "PlayerX"}
    ],
    "comp_type": "Double Controller"
  },
  "map_performance": {
    "Bind": {
      "picks": 7,
      "wins": 6,
      "win_rate": 0.857
    },
    "Haven": {
      "picks": 5,
      "wins": 3,
      "win_rate": 0.600
    }
  }
}
```

---

## 5. Insight Generation

**File**: `backend/app/services/insights.py` → `generate_insights()`

### High-Level Insights
```python
def generate_insights(analysis_results):
    insights = []
    
    # Best map performance
    best_map = max(map_stats, key=lambda x: map_stats[x]['win_rate'])
    insights.append(
        f"Strong performance on {best_map} "
        f"({map_stats[best_map]['win_rate']:.0%} win rate)"
    )
    
    # Top performer
    top_player = max(players, key=lambda x: x['kd_ratio'])
    insights.append(
        f"{top_player['name']} leads with {top_player['kd_ratio']} K/D"
    )
    
    # Composition preference
    most_picked_comp = max(compositions, key=lambda x: x['pick_rate'])
    insights.append(
        f"Favors {most_picked_comp['comp_key']} composition "
        f"({most_picked_comp['pick_rate']:.0%} pick rate)"
    )
    
    # Strategic tendency
    if most_common_strategy['category'] == "Aggressive":
        insights.append(
            "Aggressive playstyle with high first blood rate"
        )
    
    return insights
```

### Player-Specific Insights
```python
def generate_player_insights(player, team_avg):
    insights = []
    
    # Performance comparison
    if player['kd_ratio'] > team_avg['kd_ratio'] * 1.2:
        insights.append("Top performer in the report")
    
    # Agent specialization
    top_agent = max(player['agent_pool'], key=lambda x: player['agent_pool'][x]['count'])
    pick_rate = player['agent_pool'][top_agent]['pick_rate']
    if pick_rate > 0.6:
        insights.append(f"Strong {top_agent} specialization ({pick_rate:.0%} pick rate)")
    
    # Consistency
    if player['consistency_score'] > team_avg['consistency_score']:
        insights.append("Consistency above team average")
    
    return insights
```

---

## Why Interpretable Algorithms?

### Advantages
1. **Trust**: Users understand how conclusions are reached
2. **Debugging**: Easy to identify errors in calculations
3. **Customization**: Users can tweak thresholds
4. **No Training Data**: Works immediately without ML training
5. **Explainability**: Meet AI transparency requirements

### Trade-offs
- ❌ May miss complex patterns that ML would find
- ✅ But: Esports patterns are mostly deterministic
- ✅ Statistical methods proven effective for sports analysis

---

## Algorithm Validation

### Unit Tests
```python
def test_kd_calculation():
    data = {'kills': [20, 22, 18], 'deaths': [15, 18, 12]}
    kd = calculate_kd_ratio(data)
    assert kd == round((20+22+18) / (15+18+12), 2)

def test_consistency_score():
    # Consistent performance
    kills = [20, 21, 19, 20]
    score = calculate_consistency(kills)
    assert score > 0.9
    
    # Inconsistent performance
    kills = [5, 30, 10, 25]
    score = calculate_consistency(kills)
    assert score < 0.6
```

---

## Future Enhancements

### Machine Learning (Phase 2)
- **Clustering**: Automatically discover playstyle archetypes
- **Prediction**: Forecast match outcomes
- **Anomaly Detection**: Flag unusual performances

### Advanced Metrics
- **Clutch Performance**: Win rate in 1vX situations
- **Economy Impact**: Value per credit spent
- **Tempo Analysis**: Round timing patterns
- **Utility Efficiency**: Ability usage effectiveness

### Real-Time Analysis
- Live match analysis during games
- Adaptive strategy recommendations
- In-match performance tracking

---

## Related Documentation

- [GRID Integration](grid-integration.md) - Data source
- [Database Schema](database-schema.md) - Storage
- [API Reference](api-reference.md) - Access results
- [Data Flow](data-flow.md) - Analysis pipeline
