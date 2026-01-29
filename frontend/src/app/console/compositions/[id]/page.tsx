import { useParams, Link } from 'react-router-dom'
import { ConsoleLayout } from '../../layout'
import { ArrowLeft } from 'lucide-react'

export default function CompositionDetail() {
  const { id } = useParams<{ id: string }>()

  return (
    <ConsoleLayout>
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/console/compositions"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Compositions
        </Link>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Composition Analysis</h1>
            <p className="text-muted-foreground mt-1">Composition ID: {id}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Composition</div>
              <div className="text-2xl font-bold">-</div>
            </div>
            <div className="border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Win Rate</div>
              <div className="text-2xl font-bold">-</div>
            </div>
            <div className="border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Pick Rate</div>
              <div className="text-2xl font-bold">-</div>
            </div>
            <div className="border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Games Played</div>
              <div className="text-2xl font-bold">-</div>
            </div>
          </div>

          <div className="border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Composition Details</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Agent/Champion Selection</h3>
                <p className="text-sm text-muted-foreground">
                  Composition lineup will be displayed here.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Role Distribution</h3>
                <p className="text-sm text-muted-foreground">
                  Role breakdown and positioning will appear here.
                </p>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Pick Trends</h2>
            <p className="text-muted-foreground">
              Historical pick trends and meta evolution will be shown here.
            </p>
          </div>

          <div className="border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Synergies & Counters</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-medium mb-2 text-green-600">Synergies</h3>
                <p className="text-sm text-muted-foreground">
                  Composition synergies will be listed here.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2 text-red-600">Counter Picks</h3>
                <p className="text-sm text-muted-foreground">
                  Counter picks and weaknesses will be listed here.
                </p>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Performance Metrics</h2>
            <p className="text-muted-foreground">
              Detailed performance statistics and match outcomes will be displayed here.
            </p>
          </div>
        </div>
      </div>
    </ConsoleLayout>
  )
}
