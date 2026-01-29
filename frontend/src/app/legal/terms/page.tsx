import { LegalLayout } from '../layout'

export default function Terms() {
  return (
    <LegalLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        <div className="prose">
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using Scout9, you accept and agree to be bound by these Terms of Service.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">2. Use License</h2>
          <p className="mb-4">
            Permission is granted to temporarily use Scout9 for personal, non-commercial purposes.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">3. Disclaimer</h2>
          <p className="mb-4">
            Scout9 is provided "as is" without any representations or warranties, express or implied.
          </p>
        </div>
      </div>
    </LegalLayout>
  )
}
