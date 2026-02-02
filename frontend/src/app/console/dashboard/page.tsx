'use client'

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ConsoleLayout } from '../layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Activity, TrendingUp, AlertCircle, BarChart3, RefreshCw, Radio, Trophy, Clock } from 'lucide-react'
import { systemService } from '@/services/system.service'
import { gridService, GridMatch, GridTournament, GridOrganization, GridTeam, GridPlayer } from '@/services/grid.service'

export default function Dashboard() {
  const [overview, setOverview] = useState<any>(null)
  const [matches, setMatches] = useState<GridMatch[]>([])
  const [tournaments, setTournaments] = useState<GridTournament[]>([])
  const [organizations, setOrganizations] = useState<GridOrganization[]>([])
  const [teams, setTeams] = useState<GridTeam[]>([])
  const [players, setPlayers] = useState<GridPlayer[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    // Refresh live data every 60 seconds
    const interval = setInterval(fetchLiveData, 60000)
    return () => clearInterval(interval)
  }, [])

  const fetchDashboardData = async () => {
    try {
      const overviewData = await systemService.getOverview()
      setOverview(overviewData)
      await fetchLiveData()
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchLiveData = async () => {
    try {
      const [matchesData, tournamentsData, organizationsData, teamsData, playersData] = await Promise.all([
        gridService.getMatches(),
        gridService.getTournaments(),
        gridService.getOrganizations(),
        gridService.getTeams(),
        gridService.getPlayers()
      ])
      setMatches(matchesData.matches || [])
      setTournaments(tournamentsData.tournaments || [])
      setOrganizations(organizationsData.organizations || [])
      setTeams(teamsData.teams || [])
      setPlayers(playersData.players || [])
    } catch (err) {
      console.error('Failed to fetch GRID data:', err)
    }
  }

  const formatTime = (isoString: string) => {
    const date = new Date(isoString)
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (diff < 0) return 'Live Now'
    if (hours === 0) return `Starts in ${minutes}m`
    return `Starts in ${hours}h ${minutes}m`
  }

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
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Live esports data and scouting statistics.
            </p>
          </div>
          <Link to="/console/scout">
            <Button>
              <Activity className="w-4 h-4 mr-2" />
              New Scout
            </Button>
          </Link>
        </div>

        <div className="space-y-6">
          {/* Grid Statistics Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">{matches.length}</p>
                  <p className="text-xs text-muted-foreground">Series</p>
                </div>
                <Activity className="w-8 h-8 text-muted-foreground" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">{tournaments.length}</p>
                  <p className="text-xs text-muted-foreground">Tournaments</p>
                </div>
                <Trophy className="w-8 h-8 text-muted-foreground" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">{teams.length}</p>
                  <p className="text-xs text-muted-foreground">Teams</p>
                </div>
                <BarChart3 className="w-8 h-8 text-muted-foreground" />
              </div>
            </Card>
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold text-primary">{players.length}</p>
                  <p className="text-xs text-muted-foreground">Players</p>
                </div>
                <Activity className="w-8 h-8 text-muted-foreground" />
              </div>
            </Card>
          </div>

          {/* Series (Matches) */}
          {matches.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Radio className="w-5 h-5 text-primary" />
                  Recent Series
                </h2>
                <Button variant="ghost" size="sm" onClick={fetchLiveData}>
                  <RefreshCw className="w-4 h-4" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {matches.slice(0, 6).map((match) => (
                  <Card key={match.id} className="p-4 hover:bg-accent transition-colors">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-xs px-2 py-1 rounded-full font-medium bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                          Series
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ID: {match.id}
                        </span>
                      </div>
                      <div>
                        <div className="font-medium text-sm mb-2">
                          {match.name}
                        </div>
                        {match.startTimeScheduled && (
                          <div className="text-xs text-muted-foreground">
                            Start: {new Date(match.startTimeScheduled).toLocaleDateString()}
                          </div>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Tournaments */}
          {tournaments.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Trophy className="w-5 h-5 text-primary" />
                Tournaments
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {tournaments.slice(0, 6).map((tournament) => (
                  <Card key={tournament.id} className="p-4 hover:bg-accent transition-colors">
                    <div className="space-y-2">
                      <div className="font-medium">{tournament.name}</div>
                      {tournament.nameShortened && (
                        <div className="text-sm text-muted-foreground">{tournament.nameShortened}</div>
                      )}
                      <div className="text-xs text-muted-foreground">ID: {tournament.id}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Organizations */}
          {organizations.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-primary" />
                Esports Organizations
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {organizations.slice(0, 6).map((org) => (
                  <Card key={org.id} className="p-4 hover:bg-accent transition-colors">
                    <div className="space-y-2">
                      <div className="font-medium">{org.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {org.teams.length} teams
                      </div>
                      {org.teams.length > 0 && (
                        <div className="text-xs text-muted-foreground">
                          Teams: {org.teams.slice(0, 3).map(team => team.name).join(', ')}
                          {org.teams.length > 3 ? '...' : ''}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Teams */}
          {teams.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Teams
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {teams.slice(0, 8).map((team) => (
                  <Card key={team.id} className="p-4 hover:bg-accent transition-colors">
                    <div className="space-y-2">
                      <div className="font-medium text-sm">{team.name}</div>
                      <div className="flex items-center gap-2">
                        {team.colorPrimary && (
                          <div 
                            className="w-4 h-4 rounded-full border" 
                            style={{ backgroundColor: team.colorPrimary }}
                          ></div>
                        )}
                        {team.colorSecondary && (
                          <div 
                            className="w-4 h-4 rounded-full border" 
                            style={{ backgroundColor: team.colorSecondary }}
                          ></div>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">ID: {team.id}</div>
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Players */}
          {players.length > 0 && (
            <section>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                Players
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {players.slice(0, 12).map((player) => (
                  <Card key={player.id} className="p-4 hover:bg-accent transition-colors">
                    <div className="space-y-2">
                      <div className="font-medium text-sm">{player.name}</div>
                      {(player.firstName || player.lastName) && (
                        <div className="text-xs text-muted-foreground">
                          {player.firstName} {player.lastName}
                        </div>
                      )}
                      {player.nationality && (
                        <div className="text-xs text-muted-foreground">
                          {player.nationality}
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Statistics Overview */}
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Total Scouts</div>
                  <div className="text-3xl font-bold">{overview?.total_scouts || 0}</div>
                </div>
                <Activity className="w-8 h-8 text-primary opacity-20" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Reports Generated</div>
                  <div className="text-3xl font-bold">{overview?.reports_generated || 0}</div>
                </div>
                <BarChart3 className="w-8 h-8 text-primary opacity-20" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Players Tracked</div>
                  <div className="text-3xl font-bold">{overview?.players_tracked || 0}</div>
                </div>
                <TrendingUp className="w-8 h-8 text-primary opacity-20" />
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-muted-foreground mb-2">Strategies Analyzed</div>
                  <div className="text-3xl font-bold">{overview?.strategies_analyzed || 0}</div>
                </div>
                <AlertCircle className="w-8 h-8 text-primary opacity-20" />
              </div>
            </Card>
          </section>
        </div>
      </div>
    </ConsoleLayout>
  )
}
