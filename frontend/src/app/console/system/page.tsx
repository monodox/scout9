'use client'

import { useState, useEffect } from 'react'
import { ConsoleLayout } from '../layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Server, Database, Activity, AlertCircle, CheckCircle, RefreshCw, Trash2, Download, Wifi, WifiOff } from 'lucide-react'
import { systemService } from '@/services/system.service'

interface SystemStatus {
  status: string
  version: string
  uptime: string
  grid_api: string
  last_updated: string
}

interface SystemOverview {
  total_scouts: number
  reports_generated: number
  players_tracked: number
  strategies_analyzed: number
  recent_activity: Array<{
    id: number
    type: string
    description: string
    timestamp: string
  }>
}

export default function System() {
  const [status, setStatus] = useState<SystemStatus | null>(null)
  const [overview, setOverview] = useState<SystemOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date())
  const [isOnline, setIsOnline] = useState(true)

  const fetchSystemData = async () => {
    try {
      const [statusRes, overviewRes] = await Promise.all([
        systemService.getStatus(),
        systemService.getOverview()
      ])
      setStatus(statusRes)
      setOverview(overviewRes)
      setIsOnline(true)
      setError(null)
      setLastUpdate(new Date())
    } catch (err) {
      console.error('Failed to fetch system data:', err)
      setError('Failed to connect to backend')
      setIsOnline(false)
    } finally {
      setLoading(false)
    }
  }

  const handleClearCache = async () => {
    try {
      await systemService.clearCache()
      alert('Cache cleared successfully')
      fetchSystemData()
    } catch (err) {
      alert('Failed to clear cache')
    }
  }

  const handleRefresh = () => {
    setLoading(true)
    fetchSystemData()
  }

  useEffect(() => {
    fetchSystemData()

    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemData, 30000)
    return () => clearInterval(interval)
  }, [])

  if (loading && !status) {
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

  const isOperational = isOnline && status?.status === 'healthy'
  const gridStatus = status?.grid_api || 'unavailable'

  return (
    <ConsoleLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">System Status</h1>
              <p className="text-muted-foreground mt-1">
                Monitor data sources, processing status, and application health.
              </p>
            </div>
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
          {error && (
            <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg flex items-center">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
              <span className="text-red-700 dark:text-red-400">{error}</span>
            </div>
          )}
          <div className="mt-2 text-sm text-muted-foreground">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </div>
        </div>

        <div className="space-y-6">
          {/* System Information */}
          <section>
            <h2 className="text-xl font-semibold mb-4">System Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Server className="w-8 h-8 text-primary" />
                  {isOnline ? (
                    <Wifi className="w-5 h-5 text-green-500" />
                  ) : (
                    <WifiOff className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="text-sm text-muted-foreground mb-1">Connection</div>
                <div className={`text-2xl font-bold ${isOnline ? 'text-green-600' : 'text-red-600'}`}>
                  {isOnline ? 'Online' : 'Offline'}
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Activity className={`w-8 h-8 ${isOperational ? 'text-green-500' : 'text-red-500'}`} />
                  {isOperational ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <AlertCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="text-sm text-muted-foreground mb-1">Status</div>
                <div className={`text-2xl font-bold ${isOperational ? 'text-green-600' : 'text-red-600'}`}>
                  {isOperational ? 'Operational' : 'Degraded'}
                </div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Server className="w-8 h-8 text-blue-500" />
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-sm text-muted-foreground mb-1">Version</div>
                <div className="text-2xl font-bold">{status?.version || '0.1.0'}</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <RefreshCw className="w-8 h-8 text-purple-500" />
                </div>
                <div className="text-sm text-muted-foreground mb-1">Uptime</div>
                <div className="text-lg font-medium">{status?.uptime || 'N/A'}</div>
              </Card>
            </div>
          </section>

          {/* Service Status */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Service Status</h2>
            <Card className="p-6">
              <div className="space-y-4">
                <div className={`flex items-center justify-between p-4 rounded-lg ${
                  isOnline 
                    ? 'bg-green-50 dark:bg-green-900/20' 
                    : 'bg-red-50 dark:bg-red-900/20'
                }`}>
                  <div className="flex items-center">
                    {isOnline ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-red-500 mr-3" />
                    )}
                    <div>
                      <div className="font-medium">Backend API</div>
                      <div className="text-sm text-muted-foreground">
                        {isOnline ? 'Connected' : 'Connection failed'}
                      </div>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${
                    isOnline ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {isOnline ? 'Healthy' : 'Unavailable'}
                  </span>
                </div>

                <div className={`flex items-center justify-between p-4 rounded-lg ${
                  gridStatus === 'configured'
                    ? 'bg-green-50 dark:bg-green-900/20'
                    : 'bg-yellow-50 dark:bg-yellow-900/20'
                }`}>
                  <div className="flex items-center">
                    {gridStatus === 'configured' ? (
                      <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    ) : (
                      <AlertCircle className="w-5 h-5 text-yellow-500 mr-3" />
                    )}
                    <div>
                      <div className="font-medium">GRID API</div>
                      <div className="text-sm text-muted-foreground">
                        {gridStatus === 'configured' ? 'Ready' : 'API key required'}
                      </div>
                    </div>
                  </div>
                  <span className={`text-sm font-medium ${
                    gridStatus === 'configured' ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {gridStatus === 'configured' ? 'Active' : 'Not Configured'}
                  </span>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <div>
                      <div className="font-medium">Supabase Database</div>
                      <div className="text-sm text-muted-foreground">PostgreSQL connected</div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <div>
                      <div className="font-medium">Cache Service</div>
                      <div className="text-sm text-muted-foreground">In-memory caching</div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
              </div>
            </Card>
          </section>

          {/* Database Statistics */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Database className="w-5 h-5 mr-2 text-primary" />
                <h3 className="font-semibold">Database Statistics</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between p-3 border border-border rounded-lg">
                  <span className="text-sm">Total Reports</span>
                  <span className="text-sm font-medium">{overview?.reports_generated || 0}</span>
                </div>
                <div className="flex justify-between p-3 border border-border rounded-lg">
                  <span className="text-sm">Players Tracked</span>
                  <span className="text-sm font-medium">{overview?.players_tracked || 0}</span>
                </div>
                <div className="flex justify-between p-3 border border-border rounded-lg">
                  <span className="text-sm">Strategies Analyzed</span>
                  <span className="text-sm font-medium">{overview?.strategies_analyzed || 0}</span>
                </div>
                <div className="flex justify-between p-3 border border-border rounded-lg">
                  <span className="text-sm">Total Scouts</span>
                  <span className="text-sm font-medium">{overview?.total_scouts || 0}</span>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Activity className="w-5 h-5 mr-2 text-primary" />
                <h3 className="font-semibold">Recent Activity</h3>
              </div>
              <div className="space-y-3">
                {overview?.recent_activity && overview.recent_activity.length > 0 ? (
                  overview.recent_activity.slice(0, 4).map((activity) => (
                    <div key={activity.id} className="flex justify-between p-3 border border-border rounded-lg">
                      <div className="flex-1">
                        <div className="text-sm font-medium">{activity.type}</div>
                        <div className="text-xs text-muted-foreground">{activity.description}</div>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-sm text-muted-foreground text-center py-4">
                    No recent activity
                  </div>
                )}
              </div>
            </Card>
          </section>

          {/* System Actions */}
          <section>
            <h2 className="text-xl font-semibold mb-4">System Actions</h2>
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleClearCache}
                  disabled={!isOnline}
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cache
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={handleRefresh}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Status
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  disabled
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export Logs
                </Button>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  disabled
                >
                  <Database className="w-4 h-4 mr-2" />
                  Backup Database
                </Button>
              </div>
            </Card>
          </section>

          {/* System Logs */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Recent System Events</h2>
            <Card className="p-6">
              <div className="space-y-3 font-mono text-sm">
                <div className="flex items-start space-x-3 p-2 rounded hover:bg-accent">
                  {isOnline ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span>{isOnline ? 'Backend API connected' : 'Backend API connection failed'}</span>
                      <span className="text-muted-foreground">{lastUpdate.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-2 rounded hover:bg-accent">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span>Database connection established</span>
                      <span className="text-muted-foreground">{lastUpdate.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-2 rounded hover:bg-accent">
                  {gridStatus === 'configured' ? (
                    <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span>
                        {gridStatus === 'configured' 
                          ? 'GRID API configured and ready' 
                          : 'GRID API key not configured'}
                      </span>
                      <span className="text-muted-foreground">{lastUpdate.toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </section>
        </div>
      </div>
    </ConsoleLayout>
  )
}
