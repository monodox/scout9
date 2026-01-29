import { ConsoleLayout } from '../layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Layers, Search, Filter, TrendingUp, Target, Percent, Shield, Swords } from 'lucide-react'

export default function Compositions() {
  return (
    <ConsoleLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Compositions</h1>
          <p className="text-muted-foreground mt-1">
            Analyze team compositions and champion synergies
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
                    placeholder="Search compositions..."
                    className="pl-10"
                  />
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
                <Select className="w-40">
                  <option value="all">All Compositions</option>
                  <option value="popular">Popular</option>
                  <option value="meta">Meta</option>
                  <option value="counter">Counter</option>
                </Select>
                <Button variant="outline" size="icon">
                  <Filter className="w-4 h-4" />
                </Button>
              </div>
              <Button>
                <Layers className="w-4 h-4 mr-2" />
                Analyze Composition
              </Button>
            </div>
          </Card>

          {/* Composition Overview */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Composition Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Layers className="w-8 h-8 text-primary" />
                </div>
                <div className="text-2xl font-bold mb-1">0</div>
                <div className="text-sm text-muted-foreground">Total Compositions</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Percent className="w-8 h-8 text-green-500" />
                </div>
                <div className="text-2xl font-bold mb-1">-</div>
                <div className="text-sm text-muted-foreground">Win Rate</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-blue-500" />
                </div>
                <div className="text-2xl font-bold mb-1">-</div>
                <div className="text-sm text-muted-foreground">Most Picked</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Target className="w-8 h-8 text-purple-500" />
                </div>
                <div className="text-2xl font-bold mb-1">0</div>
                <div className="text-sm text-muted-foreground">Synergies Found</div>
              </Card>
            </div>
          </section>

          {/* Composition Types */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Composition Types</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 hover:bg-accent transition-colors cursor-pointer">
                <Swords className="w-8 h-8 text-red-500 mb-3" />
                <h3 className="font-semibold mb-2">Aggressive Comps</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Early game focused with high burst damage
                </p>
                <div className="text-2xl font-bold">0</div>
                <div className="text-xs text-muted-foreground">Analyzed</div>
              </Card>

              <Card className="p-6 hover:bg-accent transition-colors cursor-pointer">
                <Shield className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="font-semibold mb-2">Defensive Comps</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Scaling focused with strong disengage
                </p>
                <div className="text-2xl font-bold">0</div>
                <div className="text-xs text-muted-foreground">Analyzed</div>
              </Card>

              <Card className="p-6 hover:bg-accent transition-colors cursor-pointer">
                <Target className="w-8 h-8 text-purple-500 mb-3" />
                <h3 className="font-semibold mb-2">Balanced Comps</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Versatile with multiple win conditions
                </p>
                <div className="text-2xl font-bold">0</div>
                <div className="text-xs text-muted-foreground">Analyzed</div>
              </Card>
            </div>
          </section>

          {/* Recent Compositions */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Recent Compositions</h2>
            <Card className="p-6">
              <div className="text-center py-12">
                <Layers className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">No compositions analyzed yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Start analyzing team compositions to see patterns
                </p>
                <Button>Analyze Your First Composition</Button>
              </div>
            </Card>
          </section>

          {/* Composition Insights */}
          <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Synergy Analysis</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 border border-border rounded-lg">
                  <Target className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium mb-1">Champion Synergies</div>
                    <p className="text-sm text-muted-foreground">
                      Identify powerful champion combinations
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 border border-border rounded-lg">
                  <Layers className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium mb-1">Role Balance</div>
                    <p className="text-sm text-muted-foreground">
                      Analyze team role distribution
                    </p>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Composition Trends</h3>
              <div className="space-y-4">
                <div className="flex items-start space-x-3 p-4 border border-border rounded-lg">
                  <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium mb-1">Meta Evolution</div>
                    <p className="text-sm text-muted-foreground">
                      Track how compositions change over time
                    </p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-4 border border-border rounded-lg">
                  <Shield className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <div className="font-medium mb-1">Counter Strategies</div>
                    <p className="text-sm text-muted-foreground">
                      Find effective counter compositions
                    </p>
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
