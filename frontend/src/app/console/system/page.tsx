import { ConsoleLayout } from '../layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Server, Database, Activity, AlertCircle, CheckCircle, RefreshCw, Trash2, Download } from 'lucide-react'

export default function System() {
  return (
    <ConsoleLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">System</h1>
          <p className="text-muted-foreground mt-1">
            Monitor system health, performance, and service status
          </p>
        </div>

        <div className="space-y-6">
          {/* System Information */}
          <section>
            <h2 className="text-xl font-semibold mb-4">System Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Server className="w-8 h-8 text-primary" />
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-sm text-muted-foreground mb-1">Version</div>
                <div className="text-2xl font-bold">0.1.0</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Activity className="w-8 h-8 text-green-500" />
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-sm text-muted-foreground mb-1">Status</div>
                <div className="text-2xl font-bold text-green-600">Operational</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Server className="w-8 h-8 text-blue-500" />
                  <CheckCircle className="w-5 h-5 text-green-500" />
                </div>
                <div className="text-sm text-muted-foreground mb-1">Uptime</div>
                <div className="text-2xl font-bold">99.9%</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <RefreshCw className="w-8 h-8 text-purple-500" />
                </div>
                <div className="text-sm text-muted-foreground mb-1">Last Updated</div>
                <div className="text-lg font-medium">{new Date().toLocaleDateString()}</div>
              </Card>
            </div>
          </section>

          {/* Service Status */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Service Status</h2>
            <Card className="p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <div>
                      <div className="font-medium">API Server</div>
                      <div className="text-sm text-muted-foreground">Response time: 45ms</div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-600">Operational</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <div>
                      <div className="font-medium">Database</div>
                      <div className="text-sm text-muted-foreground">Queries: 1,234 / hour</div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-600">Connected</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center">
                    <AlertCircle className="w-5 h-5 text-yellow-500 mr-3" />
                    <div>
                      <div className="font-medium">GRID API</div>
                      <div className="text-sm text-muted-foreground">API key required</div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-yellow-600">Not Configured</span>
                </div>

                <div className="flex items-center justify-between p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                    <div>
                      <div className="font-medium">Cache Service</div>
                      <div className="text-sm text-muted-foreground">Hit rate: 87%</div>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-green-600">Active</span>
                </div>
              </div>
            </Card>
          </section>

          {/* Performance Metrics */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Activity className="w-5 h-5 mr-2 text-primary" />
                <h3 className="font-semibold">Performance Metrics</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>CPU Usage</span>
                    <span className="font-medium">23%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-blue-500 h-2 rounded-full" style={{ width: '23%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Memory Usage</span>
                    <span className="font-medium">45%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-sm mb-2">
                    <span>Storage Usage</span>
                    <span className="font-medium">67%</span>
                  </div>
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '67%' }}></div>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center mb-4">
                <Database className="w-5 h-5 mr-2 text-primary" />
                <h3 className="font-semibold">Database Statistics</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between p-3 border border-border rounded-lg">
                  <span className="text-sm">Total Reports</span>
                  <span className="text-sm font-medium">0</span>
                </div>
                <div className="flex justify-between p-3 border border-border rounded-lg">
                  <span className="text-sm">Cached Queries</span>
                  <span className="text-sm font-medium">1,234</span>
                </div>
                <div className="flex justify-between p-3 border border-border rounded-lg">
                  <span className="text-sm">API Requests (24h)</span>
                  <span className="text-sm font-medium">5,678</span>
                </div>
              </div>
            </Card>
          </section>

          {/* System Actions */}
          <section>
            <h2 className="text-xl font-semibold mb-4">System Actions</h2>
            <Card className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Button variant="outline" className="w-full justify-start">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear Cache
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Check for Updates
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Download className="w-4 h-4 mr-2" />
                  Export Logs
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Database className="w-4 h-4 mr-2" />
                  Backup Database
                </Button>
              </div>
            </Card>
          </section>

          {/* System Logs */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Recent System Logs</h2>
            <Card className="p-6">
              <div className="space-y-3 font-mono text-sm">
                <div className="flex items-start space-x-3 p-2 rounded hover:bg-accent">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span>System startup completed successfully</span>
                      <span className="text-muted-foreground">{new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-2 rounded hover:bg-accent">
                  <CheckCircle className="w-4 h-4 text-green-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span>Database connection established</span>
                      <span className="text-muted-foreground">{new Date().toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-2 rounded hover:bg-accent">
                  <AlertCircle className="w-4 h-4 text-yellow-500 mt-0.5" />
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <span>GRID API key not configured</span>
                      <span className="text-muted-foreground">{new Date().toLocaleTimeString()}</span>
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
