import { Link } from 'react-router-dom'
import { ConsoleLayout } from '../layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { FileText, Search, Filter, Download, Share2, Clock, TrendingUp } from 'lucide-react'

export default function Report() {
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
                  />
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
                <Select className="w-40">
                  <option value="all">All Reports</option>
                  <option value="recent">Recent</option>
                  <option value="archived">Archived</option>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
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
            <div className="text-center py-12">
              <FileText className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No reports generated yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first scouting report to see it here
              </p>
              <Link to="/console/scout">
                <Button>Start Scouting</Button>
              </Link>
            </div>
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
