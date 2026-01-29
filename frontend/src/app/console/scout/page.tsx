import { ConsoleLayout } from '../layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select } from '@/components/ui/select'
import { Activity, Calendar, Search, Target } from 'lucide-react'

export default function Scout() {
  return (
    <ConsoleLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Scout Analysis</h1>
          <p className="text-muted-foreground mt-1">
            Configure an opponent and generate a new automated scouting analysis
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Configuration Form */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="p-6">
              <div className="flex items-center mb-6">
                <Target className="w-5 h-5 mr-2 text-primary" />
                <h2 className="text-xl font-semibold">Scout Configuration</h2>
              </div>

              <form className="space-y-6">
                <div>
                  <Label htmlFor="teamName">Opponent Team *</Label>
                  <Input
                    id="teamName"
                    type="text"
                    placeholder="Enter team name or ID"
                    className="mt-2"
                    required
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Team to analyze and scout
                  </p>
                </div>

                <div>
                  <Label htmlFor="matchId">Match ID (Optional)</Label>
                  <Input
                    id="matchId"
                    type="text"
                    placeholder="Specific match ID to analyze"
                    className="mt-2"
                  />
                  <p className="text-sm text-muted-foreground mt-1">
                    Leave empty to analyze all recent matches
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="dateFrom">Date From</Label>
                    <div className="relative mt-2">
                      <Input
                        id="dateFrom"
                        type="date"
                        className="pl-10"
                      />
                      <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="dateTo">Date To</Label>
                    <div className="relative mt-2">
                      <Input
                        id="dateTo"
                        type="date"
                        className="pl-10"
                      />
                      <Calendar className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="analysisDepth">Analysis Depth</Label>
                  <Select id="analysisDepth" className="mt-2">
                    <option value="quick">Quick Scan</option>
                    <option value="standard">Standard Analysis</option>
                    <option value="deep">Deep Analysis</option>
                  </Select>
                  <p className="text-sm text-muted-foreground mt-1">
                    Determines the thoroughness of the scouting analysis
                  </p>
                </div>

                <div>
                  <Label htmlFor="focus">Focus Areas</Label>
                  <Select id="focus" className="mt-2">
                    <option value="all">All Areas</option>
                    <option value="players">Player Performance</option>
                    <option value="strategies">Team Strategies</option>
                    <option value="compositions">Compositions</option>
                  </Select>
                </div>

                <div className="pt-4">
                  <Button type="submit" className="w-full" size="lg">
                    <Activity className="w-4 h-4 mr-2" />
                    Start Scouting Analysis
                  </Button>
                </div>
              </form>
            </Card>
          </div>

          {/* Information Sidebar */}
          <div className="space-y-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Analysis Options</h3>
              <div className="space-y-4 text-sm">
                <div>
                  <div className="font-medium mb-1">Quick Scan</div>
                  <p className="text-muted-foreground">
                    Fast overview of recent performance
                  </p>
                </div>
                <div>
                  <div className="font-medium mb-1">Standard Analysis</div>
                  <p className="text-muted-foreground">
                    Comprehensive team and player insights
                  </p>
                </div>
                <div>
                  <div className="font-medium mb-1">Deep Analysis</div>
                  <p className="text-muted-foreground">
                    Detailed patterns, trends, and predictions
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-blue-50 dark:bg-blue-900/20 border-blue-200">
              <h3 className="font-semibold mb-2 text-blue-900 dark:text-blue-100">
                Pro Tip
              </h3>
              <p className="text-sm text-blue-800 dark:text-blue-200">
                For best results, analyze at least 5-10 recent matches. This provides
                enough data for meaningful pattern detection.
              </p>
            </Card>
          </div>
        </div>

        {/* Recent Scouts */}
        <div className="mt-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Recent Scouting Runs</h2>
            <div className="relative">
              <Input
                type="search"
                placeholder="Search scouts..."
                className="pl-10 w-64"
              />
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            </div>
          </div>

          <Card className="p-6">
            <div className="text-center py-12">
              <Activity className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No scouting runs yet</p>
              <p className="text-sm text-muted-foreground mt-2">
                Start your first scouting analysis using the form above
              </p>
            </div>
          </Card>
        </div>
      </div>
    </ConsoleLayout>
  )
}
