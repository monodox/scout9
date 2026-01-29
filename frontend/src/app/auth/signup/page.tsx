import { Link } from 'react-router-dom'
import { AuthLayout } from '../layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'

export default function Signup() {
  return (
    <AuthLayout>
      <div className="flex min-h-[calc(100vh-16rem)] items-center justify-center px-4">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-2xl font-semibold">Create your account</h2>
          </div>

          <form className="mt-8 space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">Full name</Label>
                <Input
                  id="name"
                  name="name"
                  type="text"
                  required
                  placeholder="Full name"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="email">Email address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="Email address"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  required
                  placeholder="Password"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm password</Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  required
                  placeholder="Confirm password"
                  className="mt-2"
                />
              </div>
            </div>

            <div className="flex items-center">
              <Checkbox id="terms" name="terms" required />
              <Label htmlFor="terms" className="ml-2 font-normal">
                I agree to the{' '}
                <Link to="/legal/terms" className="text-primary hover:underline">
                  Terms of Service
                </Link>
              </Label>
            </div>

            <Button type="submit" className="w-full">
              Sign up
            </Button>

            <p className="text-center text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>
    </AuthLayout>
  )
}
