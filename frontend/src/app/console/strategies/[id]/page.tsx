import { useParams, Link } from 'react-router-dom'
import { ConsoleLayout } from '../../layout'
import { ArrowLeft } from 'lucide-react'

export default function StrategyDetail() {
  const { id } = useParams<{ id: string }>()

  return (
    <ConsoleLayout>
      <div className="container mx-auto px-4 py-8">
        <Link
          to="/console/strategies"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Strategies
        </Link>

        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Strategy Analysis</h1>
            <p className="text-muted-foreground mt-1">Strategy ID: {id}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Strategy Name</div>
              <div className="text-2xl font-bold">-</div>
            </div>
            <div className="border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Type</div>
              <div className="text-2xl font-bold">-</div>
            </div>
            <div className="border border-border rounded-lg p-6">
              <div className="text-sm text-muted-foreground mb-2">Success Rate</div>
              <div className="text-2xl font-bold">-</div>
            </div>
          </div>

          <div className="border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Strategy Overview</h2>
            <p className="text-muted-foreground">
              Detailed strategy description and usage context will appear here.
            </p>
          </div>

          <div className="border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Site Preferences</h2>
            <div className="space-y-4">
              <div>
                <h3 className="font-medium mb-2">Attacking Side</h3>
                <p className="text-sm text-muted-foreground">
                  Site preferences when attacking will be shown here.
                </p>
              </div>
              <div>
                <h3 className="font-medium mb-2">Defending Side</h3>
                <p className="text-sm text-muted-foreground">
                  Defensive site preferences will be shown here.
                </p>
              </div>
            </div>
          </div>

          <div className="border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Macro Patterns</h2>
            <p className="text-muted-foreground">
              Team macro patterns and strategic tendencies will be displayed here.
            </p>
          </div>

          <div className="border border-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Execution Details</h2>
            <p className="text-muted-foreground">
              Strategy execution breakdown and key moments will appear here.
            </p>
          </div>
        </div>
      </div>
    </ConsoleLayout>
  )
}
