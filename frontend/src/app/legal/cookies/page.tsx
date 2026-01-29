import { LegalLayout } from '../layout'

export default function Cookies() {
  return (
    <LegalLayout>
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Cookie Policy</h1>
        <div className="prose">
          <p className="mb-4">Last updated: {new Date().toLocaleDateString()}</p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">1. What Are Cookies</h2>
          <p className="mb-4">
            Cookies are small text files stored on your device when you visit Scout9.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">2. How We Use Cookies</h2>
          <p className="mb-4">
            We use cookies to understand how you use our service and to improve your experience.
          </p>

          <h2 className="text-2xl font-semibold mt-6 mb-4">3. Managing Cookies</h2>
          <p className="mb-4">
            You can control cookies through your browser settings and choose to refuse all or some cookies.
          </p>
        </div>
      </div>
    </LegalLayout>
  )
}
