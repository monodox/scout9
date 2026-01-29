import { LegalLayout } from '../layout'

export default function Privacy() {
  return (
    <LegalLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        <div className="prose">
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">1. Information We Collect</h2>
          <p className="mb-4">
            We collect information that you provide directly to us when using Scout9.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">2. How We Use Information</h2>
          <p className="mb-4">
            We use the information we collect to provide, maintain, and improve our services.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">3. Data Security</h2>
          <p className="mb-4">
            We take reasonable measures to help protect your information from loss, theft, misuse, and unauthorized access.
          </p>
        </div>
      </div>
    </LegalLayout>
  )
}
