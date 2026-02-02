'use client'

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ConsoleLayout } from '../layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Lightbulb, Search, Filter, TrendingUp, Shield, Zap, Target, Percent, RefreshCw } from 'lucide-react'
import { strategiesService } from '@/services/strategies.service'

export default function Strategies() {
  const [strategies, setStrategies] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchStrategies()
  }, [])

  const fetchStrategies = async () => {
    try {
      const data = await strategiesService.list(0, 20)
      setStrategies(data.strategies || [])
    } catch (err) {
      console.error('Failed to fetch strategies:', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredStrategies = strategies.filter(strategy =>
    (strategy.name || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const avgSuccessRate = strategies.length > 0
    ? Math.round(strategies.reduce((sum, s) => sum + (s.success_rate || 0), 0) / strategies.length)
    : 0

  const mostCommon = strategies.length > 0
    ? strategies.sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0))[0]?.name || '-'
    : '-'

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
          <h1 className="text-3xl font-bold">Strategies</h1>
          <p className="text-muted-foreground mt-1">
            Analyze team strategies and tactical patterns
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
                    placeholder="Search strategies..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                </div>
                <Select className="w-40">
                  <option value="all">All Strategies</option>
                  <option value="offensive">Offensive</option>
                  <option value="defensive">Defensive</option>
                  <option value="economic">Economic</option>
                </Select>
              </div>
              <Button>
                <Lightbulb className="w-4 h-4 mr-2" />
                Analyze Strategy
              </Button>
            </div>
          </Card>

          {/* Strategy Overview */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Strategy Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Lightbulb className="w-8 h-8 text-primary" />
                </div>
                <div className="text-2xl font-bold mb-1">{strategies.length}</div>
                <div className="text-sm text-muted-foreground">Total Strategies</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <TrendingUp className="w-8 h-8 text-green-500" />
                </div>
                <div className="text-2xl font-bold mb-1">{mostCommon}</div>
                <div className="text-sm text-muted-foreground">Most Common</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Percent className="w-8 h-8 text-blue-500" />
                </div>
                <div className="text-2xl font-bold mb-1">{avgSuccessRate}%</div>
                <div className="text-sm text-muted-foreground">Avg Success Rate</div>
              </Card>

              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <Target className="w-8 h-8 text-purple-500" />
                </div>
                <div className="text-2xl font-bold mb-1">{strategies.filter(s => s.success_rate >= 70).length}</div>
                <div className="text-sm text-muted-foreground">High Win Rate</div>
              </Card>
            </div>
          </section>

          {/* Strategy Categories */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Strategy Categories</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="p-6 hover:bg-accent transition-colors cursor-pointer">
                <Zap className="w-8 h-8 text-orange-500 mb-3" />
                <h3 className="font-semibold mb-2">Offensive Strategies</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Aggressive plays and early game dominance
                </p>
                <div className="text-2xl font-bold">0</div>
                <div className="text-xs text-muted-foreground">Analyzed</div>
              </Card>

              <Card className="p-6 hover:bg-accent transition-colors cursor-pointer">
                <Shield className="w-8 h-8 text-blue-500 mb-3" />
                <h3 className="font-semibold mb-2">Defensive Strategies</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Counter-strategies and late game scaling
                </p>
                <div className="text-2xl font-bold">0</div>
                <div className="text-xs text-muted-foreground">Analyzed</div>
              </Card>

              <Card className="p-6 hover:bg-accent transition-colors cursor-pointer">
                <TrendingUp className="w-8 h-8 text-green-500 mb-3" />
                <h3 className="font-semibold mb-2">Economic Strategies</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Resource management and scaling patterns
                </p>
                <div className="text-2xl font-bold">0</div>
                <div className="text-xs text-muted-foreground">Analyzed</div>
              </Card>
            </div>
          </section>

          {/* Recent Strategies */}
          <section>
            <h2 className="text-xl font-semibold mb-4">Recent Strategies</h2>
            <Card className="p-6">
              <div className="text-center py-12">
                <Lightbulb className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-2">No strategies analyzed yet</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Start analyzing matches to identify team strategies
                </p>
                <Button>Analyze Your First Strategy</Button>
              </div>
            </Card>
          </section>

          {/* Strategy Insights */}
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Strategy Insights</h3>
            <div className="space-y-4">
              <div className="flex items-start space-x-3 p-4 border border-border rounded-lg">
                <Target className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium mb-1">Win Condition Analysis</div>
                  <p className="text-sm text-muted-foreground">
                    Identify primary win conditions and execution patterns
                  </p>
                </div>
              </div>
              <div className="flex items-start space-x-3 p-4 border border-border rounded-lg">
                <TrendingUp className="w-5 h-5 text-primary mt-0.5" />
                <div>
                  <div className="font-medium mb-1">Adaptation Tracking</div>
                  <p className="text-sm text-muted-foreground">
                    Monitor how strategies evolve across matches
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
