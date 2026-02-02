'use client'

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ConsoleLayout } from '../layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Activity, TrendingUp, AlertCircle, BarChart3, RefreshCw } from 'lucide-react'
import { systemService } from '@/services/system.service'
import { reportService } from '@/services/report.service'

export default function Dashboard() {
  const [overview, setOverview] = useState<any>(null)
  const [recentReports, setRecentReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [overviewData, reportsData] = await Promise.all([
        systemService.getOverview(),
        reportService.list(0, 5)
      ])
      setOverview(overviewData)
      setRecentReports(reportsData.reports || [])
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err)
    } finally {
      setLoading(false)
    }
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
              Overview of recent scouting analyses, key trends, and system status.
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

          {/* Recent Reports */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Reports</h2>
              <Link to="/console/report">
                <Button variant="ghost" size="sm">View All</Button>
              </Link>
            </div>
            <Card className="p-6">
              {recentReports.length > 0 ? (
                <div className="space-y-3">
                  {recentReports.map((report) => (
                    <Link key={report.id} to={`/console/report/${report.id}`}>
                      <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors">
                        <div>
                          <div className="font-medium">{report.title || report.team_name}</div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(report.created_at).toLocaleDateString()}
                          </div>
                        </div>
                        <div className={`text-sm px-3 py-1 rounded-full ${
                          report.status === 'completed' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {report.status}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <p className="text-muted-foreground mb-4">No reports yet. Run a new scout analysis to get started.</p>
                  <Link to="/console/scout">
                    <Button>Start Your First Scout</Button>
                  </Link>
                </div>
              )}
            </Card>
          </section>

          {/* Key Trends */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Key Trends</h2>
              <div className="space-y-4">
                <div className="text-center py-8">
                  <TrendingUp className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm text-muted-foreground">
                    Trends will appear after analyzing scouting data
                  </p>
                </div>
              </div>
            </Card>

            {/* System Health */}
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">System Health</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm">API Status</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">Operational</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-md">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                    <span className="text-sm">Database</span>
                  </div>
                  <span className="text-sm font-medium text-green-600">Connected</span>
                </div>

                <div className="flex items-center justify-between p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-md">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                    <span className="text-sm">GRID API</span>
                  </div>
                  <span className="text-sm font-medium text-yellow-600">Not Configured</span>
                </div>

                <Link to="/console/system">
                  <Button variant="outline" size="sm" className="w-full mt-4">
                    View System Details
                  </Button>
                </Link>
              </div>
            </Card>
          </section>

          {/* Quick Actions */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link to="/console/scout">
                <Card className="p-6 hover:bg-accent transition-colors cursor-pointer">
                  <Activity className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">New Scout Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Start a new opponent scouting run
                  </p>
                </Card>
              </Link>

              <Link to="/console/report">
                <Card className="p-6 hover:bg-accent transition-colors cursor-pointer">
                  <BarChart3 className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">View Reports</h3>
                  <p className="text-sm text-muted-foreground">
                    Access generated scouting reports
                  </p>
                </Card>
              </Link>

              <Link to="/console/players">
                <Card className="p-6 hover:bg-accent transition-colors cursor-pointer">
                  <TrendingUp className="w-8 h-8 text-primary mb-3" />
                  <h3 className="font-semibold mb-2">Player Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Analyze player performance data
                  </p>
                </Card>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </ConsoleLayout>
  )
}
