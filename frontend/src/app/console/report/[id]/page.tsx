import { useParams, Link } from 'react-router-dom'
import { ConsoleLayout } from '../../layout'
import { ArrowLeft } from 'lucide-react'

export default function ReportDetail() {
  const { id } = useParams<{ id: string }>()

  return (
    <ConsoleLayout>
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/console/report"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Reports
        </Link>

        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Scouting Report</h1>
              <p className="text-muted-foreground mt-1">Report ID: {id}</p>
            </div>
            <div className="flex gap-2">
              <button className="px-4 py-2 border border-border rounded-md hover:bg-accent">
                Export PDF
              </button>
              <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90">
                Share Report
              </button>
            </div>
          </div>

          <div className="border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Report Summary</h2>
            <div className="space-y-4">
              <div>
                <div className="text-sm text-muted-foreground">Team</div>
                <div className="text-lg font-medium">-</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Match Period</div>
                <div className="text-lg font-medium">-</div>
              </div>
              <div>
                <div className="text-sm text-muted-foreground">Status</div>
                <div className="text-lg font-medium">-</div>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Key Insights</h2>
            <p className="text-muted-foreground">
              Report insights will be displayed here once analysis is complete.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link
              to={`/console/players/${id}`}
              className="border border-border rounded-lg p-6 hover:bg-accent transition-colors"
            >
              <h3 className="font-semibold mb-2">Player Analysis</h3>
              <p className="text-sm text-muted-foreground">
                View player tendencies and performance
              </p>
            </Link>

            <Link
              to={`/console/strategies/${id}`}
              className="border border-border rounded-lg p-6 hover:bg-accent transition-colors"
            >
              <h3 className="font-semibold mb-2">Team Strategies</h3>
              <p className="text-sm text-muted-foreground">
                Analyze strategies and patterns
              </p>
            </Link>

            <Link
              to={`/console/compositions/${id}`}
              className="border border-border rounded-lg p-6 hover:bg-accent transition-colors"
            >
              <h3 className="font-semibold mb-2">Compositions</h3>
              <p className="text-sm text-muted-foreground">
                Review composition picks and trends
              </p>
            </Link>
          </div>
        </div>
      </div>
    </ConsoleLayout>
  )
}
