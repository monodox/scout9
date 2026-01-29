import { ConsoleLayout } from '../layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Users, Search, Filter, Star, TrendingUp, Award, Target, BarChart3 } from 'lucide-react'

export default function Players() {
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
                  />
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
                <Select className="w-40">
                  <option value="all">All Players</option>
                  <option value="tracked">Tracked</option>
                  <option value="favorites">Favorites</option>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
              <Button>
                <Users className="w-4 h-4 mr-2" />
                Add Player
              </Button>
            </div>
          </Card>

          {/* Players Grid */}
          <Card className="p-6">
            <div className="text-center py-12">
              <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">No players tracked yet</p>
              <p className="text-sm text-muted-foreground mb-4">
                Start tracking players to analyze their performance
              </p>
              <Button>Add Your First Player</Button>
            </div>
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
                <div className="text-2xl font-bold mb-1">0</div>
                <div className="text-sm text-muted-foreground">Top Performers</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-primary" />
                  <Star className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold mb-1">0</div>
                <div className="text-sm text-muted-foreground">Rising Stars</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Award className="w-8 h-8 text-primary" />
                  <Star className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold mb-1">0</div>
                <div className="text-sm text-muted-foreground">MVP Candidates</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <BarChart3 className="w-8 h-8 text-primary" />
                  <Star className="w-5 h-5 text-muted-foreground" />
                </div>
                <div className="text-2xl font-bold mb-1">0</div>
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
