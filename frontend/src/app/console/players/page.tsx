'use client'

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ConsoleLayout } from '../layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Users, Search, Filter, Star, TrendingUp, Award, Target, BarChart3, RefreshCw } from 'lucide-react'
import { playersService } from '@/services/players.service'

export default function Players() {
  const [players, setPlayers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchPlayers()
  }, [])

  const fetchPlayers = async () => {
    try {
      const data = await playersService.list(0, 100)
      // Calculate performance score from metrics
      const playersWithScore = (data.players || []).map((player: any) => ({
        ...player,
        performance_score: calculatePerformanceScore(player)
      }))
      setPlayers(playersWithScore)
    } catch (err) {
      console.error('Failed to fetch players:', err)
    } finally {
      setLoading(false)
    }
  }

  const calculatePerformanceScore = (player: any): number => {
    if (!player.metrics_json) return 50
    const metrics = player.metrics_json
    
    // Calculate score based on available metrics
    let score = 50 // base score
    
    if (metrics.kd_ratio) {
      score += Math.min(metrics.kd_ratio * 10, 30)
    }
    if (metrics.consistency_score) {
      score += metrics.consistency_score * 0.2
    }
    if (metrics.win_rate) {
      score += metrics.win_rate * 0.2
    }
    
    return Math.min(Math.round(score), 100)
  }

  const filteredPlayers = players.filter(player =>
    (player.player_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return (
      <ConsoleLayout>
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-center h-64">
            <RefreshCw className="w-8 h-8 animate-spin text-primary" />
          </div>
        </div>
      </ConsoleLayout>
    )
  }

  return (
    <ConsoleLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Players</h1>
          <p className="text-muted-foreground mt-1">
            Track and analyze individual player performance
          </p>
        </div>

        <div className="space-y-6">
          {/* Filters and Actions */}
          <Card className="p-4">
            <div className="flex flex-col md:flex-row gap-4 md:items-center md:justify-between">
              <div className="flex flex-1 gap-2">
                <div className="relative flex-1">
                  <Input
                    type="search"
                    placeholder="Search players..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
                <Select className="w-40">
                  <option value="all">All Players</option>
                  <option value="tracked">Tracked</option>
                  <option value="favorites">Favorites</option>
                </Select>
                <Button variant="outline" size="icon" onClick={fetchPlayers}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              <Button>
                <Users className="w-4 h-4 mr-2" />
                Add Player
              </Button>
            </div>
          </Card>

          {/* Players Table */}
          <Card className="p-6">
            {filteredPlayers.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-semibold text-sm">Player</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Team</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Role</th>
                      <th className="text-center py-3 px-4 font-semibold text-sm">Performance</th>
                      <th className="text-left py-3 px-4 font-semibold text-sm">Metrics</th>
                      <th className="text-right py-3 px-4 font-semibold text-sm">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPlayers.map((player) => (
                      <tr 
                        key={player.id} 
                        className="border-b border-border hover:bg-accent transition-colors"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mr-3">
                              <Users className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                              <div className="font-medium">{player.player_name}</div>
                              <div className="text-xs text-muted-foreground">
                                {player.tendencies_json ? `${Object.keys(player.tendencies_json).length} tendencies` : 'No data'}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400">
                            {player.team || 'N/A'}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-sm text-muted-foreground">
                          {player.role || 'Unknown'}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center">
                            <div className="flex items-center">
                              <div className="w-16 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    player.performance_score >= 80 
                                      ? 'bg-green-500' 
                                      : player.performance_score >= 60 
                                      ? 'bg-yellow-500' 
                                      : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(player.performance_score || 0, 100)}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium">{player.performance_score || 0}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-4">
                          <div className="text-sm">
                            {player.metrics_json && Object.keys(player.metrics_json).length > 0 ? (
                              <div className="space-y-1">
                                {player.metrics_json.kd_ratio && (
                                  <div className="text-xs">K/D: <span className="font-medium">{player.metrics_json.kd_ratio.toFixed(2)}</span></div>
                                )}
                                {player.metrics_json.win_rate && (
                                  <div className="text-xs">WR: <span className="font-medium">{player.metrics_json.win_rate}%</span></div>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground">No metrics</span>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button variant="ghost" size="sm">
                              <Star className="w-4 h-4" />
                            </Button>
                            <Link to={`/console/players/${player.id}`}>
                              <Button variant="ghost" size="sm">
                                View Details
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="mt-4 flex items-center justify-between text-sm text-muted-foreground">
                  <div>
                    Showing {filteredPlayers.length} of {players.length} players
                  </div>
                  <div className="flex items-center gap-2">
                    <span>Last updated: {new Date().toLocaleTimeString()}</span>
                    <Button variant="ghost" size="sm" onClick={fetchPlayers}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">
                  {searchQuery ? 'No players found matching your search' : 'No players tracked yet'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery ? 'Try a different search term' : 'Start tracking players to analyze their performance'}
                </p>
                {!searchQuery && <Button>Add Your First Player</Button>}
              </div>
            )}
          </Card>

          {/* Performance Metrics */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Target className="w-8 h-8 text-primary" />
                  <Star className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold mb-1">{players.filter(p => p.performance_score >= 80).length}</div>
                <div className="text-sm text-muted-foreground">Top Performers</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-primary" />
                  <Star className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold mb-1">{players.filter(p => p.performance_score >= 70 && p.performance_score < 80).length}</div>
                <div className="text-sm text-muted-foreground">Rising Stars</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Award className="w-8 h-8 text-primary" />
                  <Star className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold mb-1">{players.filter(p => p.performance_score >= 90).length}</div>
                <div className="text-sm text-muted-foreground">MVP Candidates</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <BarChart3 className="w-8 h-8 text-primary" />
                  <Star className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold mb-1">{players.length}</div>
                <div className="text-sm text-muted-foreground">Tracked Players</div>
              </Card>
            </div>
          </section>

          {/* Analysis Categories */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Analysis Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 hover:bg-accent transition-colors cursor-pointer">
                <Target className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Mechanical Skills</h3>
                <p className="text-sm text-muted-foreground">
                  Analyze accuracy, reaction time, and technical execution
                </p>
              </Card>

              <Card className="p-6 hover:bg-accent transition-colors cursor-pointer">
                <TrendingUp className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Performance Trends</h3>
                <p className="text-sm text-muted-foreground">
                  Track improvement and consistency over time
                </p>
              </Card>

              <Card className="p-6 hover:bg-accent transition-colors cursor-pointer">
                <Award className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Champion Pool</h3>
                <p className="text-sm text-muted-foreground">
                  Understand hero preferences and win rates
                </p>
              </Card>
            </div>
          </section>

          {/* Quick Stats */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Quick Statistics</h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                  <span className="text-sm">Average KDA</span>
                </div>
                <span className="text-sm font-medium text-muted-foreground">No data</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                  <span className="text-sm">Win Rate</span>
                </div>
                <span className="text-sm font-medium text-muted-foreground">No data</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-border rounded-lg">
                <div className="flex items-center">
                  <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                  <span className="text-sm">Games Analyzed</span>
                </div>
                <span className="text-sm font-medium text-muted-foreground">No data</span>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ConsoleLayout>
  )
}
