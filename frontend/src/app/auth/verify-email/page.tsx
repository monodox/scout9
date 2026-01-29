import { Link } from 'react-router-dom'
import { Mail } from 'lucide-react'
import { AuthLayout } from '../layout'
import { Button } from '@/components/ui/button'

export default function VerifyEmail() {
  return (
    <AuthLayout>
      <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8 text-center">
          <div>
            <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-6">
              <Mail className="w-8 h-8 text-primary" />
            </div>
            <h2 className="text-2xl font-semibold">Verify your email</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We've sent a verification link to your email address. Please check your inbox and click the link to verify your account.
            </p>
          </div>

          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Didn't receive the email?
            </p>

            <Button type="button" className="w-full">
              Resend verification email
            </Button>

            <Link
              to="/login"
              className="block text-sm text-primary hover:underline font-medium"
            >
              Back to sign in
            </Link>
          </div>
        </div>
      </div>
    </AuthLayout>
  )
}
