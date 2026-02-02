'use client'

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ConsoleLayout } from '../layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { FileText, Search, Filter, Download, Share2, Clock, TrendingUp, RefreshCw } from 'lucide-react'
import { reportService } from '@/services/report.service'

export default function Report() {
  const [reports, setReports] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      const data = await reportService.list(0, 20)
      setReports(data.reports || [])
    } catch (err) {
      console.error('Failed to fetch reports:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredReports = reports.filter(report =>
    (report.title || report.team_name || '').toLowerCase().includes(searchQuery.toLowerCase())
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
          <h1 className="text-3xl font-bold">Reports</h1>
          <p className="text-muted-foreground mt-1">
            View and manage generated scouting reports
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
                    placeholder="Search reports..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
                <Select className="w-40">
                  <option value="all">All Reports</option>
                  <option value="recent">Recent</option>
                  <option value="archived">Archived</option>
                </Select>
              </div>
              <Link to="/console/scout">
                <Button>
                  <FileText className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </Link>
            </div>
          </Card>

          {/* Reports List */}
          <Card className="p-6">
            {filteredReports.length > 0 ? (
              <div className="space-y-3">
                {filteredReports.map((report) => (
                  <Link key={report.id} to={`/console/report/${report.id}`}>
                    <div className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors">
                      <div className="flex-1">
                        <div className="font-medium mb-1">{report.title || report.team_name}</div>
                        <div className="text-sm text-muted-foreground">
                          {report.template_type || 'Standard'} • {new Date(report.created_at).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className={`text-sm px-3 py-1 rounded-full ${
                          report.status === 'completed' 
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                            : 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400'
                        }`}>
                          {report.status}
                        </div>
                        <Button variant="ghost" size="sm" onClick={(e) => {
                          e.preventDefault()
                          window.open(`/api/report/${report.id}/export/pdf`, '_blank')
                        }}>
                          <Download className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">
                  {searchQuery ? 'No reports found matching your search' : 'No reports generated yet'}
                </p>
                <p className="text-sm text-muted-foreground mb-4">
                  {searchQuery ? 'Try a different search term' : 'Create your first scouting report to see it here'}
                </p>
                {!searchQuery && (
                  <Link to="/console/scout">
                    <Button>Start Scouting</Button>
                  </Link>
                )}
              </div>
            )}
          </Card>

          {/* Report Templates */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Report Templates</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 hover:bg-accent transition-colors cursor-pointer">
                <Clock className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Quick Scout</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Basic opponent overview with key insights
                </p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>5-10 minutes</span>
                </div>
              </Card>

              <Card className="p-6 hover:bg-accent transition-colors cursor-pointer">
                <TrendingUp className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Detailed Analysis</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Comprehensive team breakdown with strategies
                </p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>15-20 minutes</span>
                </div>
              </Card>

              <Card className="p-6 hover:bg-accent transition-colors cursor-pointer">
                <FileText className="w-8 h-8 text-primary mb-3" />
                <h3 className="font-semibold mb-2">Player Focus</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Individual player analysis with performance metrics
                </p>
                <div className="flex items-center text-xs text-muted-foreground">
                  <Clock className="w-3 h-3 mr-1" />
                  <span>10-15 minutes</span>
                </div>
              </Card>
            </div>
          </section>

          {/* Export Options */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Export & Sharing</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start space-x-3 p-4 border border-border rounded-lg">
                <Download className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium mb-1">Export Reports</div>
                  <p className="text-sm text-muted-foreground">
                    Download reports as PDF, CSV, or JSON
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 border border-border rounded-lg">
                <Share2 className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium mb-1">Share with Team</div>
                  <p className="text-sm text-muted-foreground">
                    Collaborate with teammates on reports
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </ConsoleLayout>
  )
}
