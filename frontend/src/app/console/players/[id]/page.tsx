import { useParams, Link } from 'react-router-dom'
import { ConsoleLayout } from '../../layout'
import { ArrowLeft } from 'lucide-react'

export default function PlayerDetail() {
  const { id } = useParams<{ id: string }>()

  return (
    <ConsoleLayout>
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/console/players"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Players
        </Link>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Player Analysis</h1>
            <p className="text-muted-foreground mt-1">Player ID: {id}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Player Name</div>
              <div className="text-2xl font-bold">-</div>
            </div>
            <div className="border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Team</div>
              <div className="text-2xl font-bold">-</div>
            </div>
            <div className="border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Performance Score</div>
              <div className="text-2xl font-bold">-</div>
            </div>
          </div>

          <div className="border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Player Tendencies</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Playstyle</h3>
                <p className="text-sm text-muted-foreground">
                  Player tendencies and playstyle analysis will appear here.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Preferred Positions</h3>
                <p className="text-sm text-muted-foreground">
                  Position preferences and performance data will appear here.
                </p>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Performance Insights</h2>
            <p className="text-muted-foreground">
              Detailed performance metrics and insights will be displayed here.
            </p>
          </div>

          <div className="border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Strengths & Weaknesses</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2 text-green-600">Strengths</h3>
                <p className="text-sm text-muted-foreground">
                  Player strengths will be listed here.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-red-600">Weaknesses</h3>
                <p className="text-sm text-muted-foreground">
                  Areas for improvement will be listed here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ConsoleLayout>
  )
}
