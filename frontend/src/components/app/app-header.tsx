import { Link } from 'react-router-dom'

export function AppHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-2xl font-bold">Scout9</span>
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <Link to="/" className="text-sm hover:text-primary">
              Home
            </Link>
            <Link to="/console/dashboard" className="text-sm hover:text-primary">
              Dashboard
            </Link>
            <Link to="/login" className="text-sm hover:text-primary">
              Sign In
            </Link>
          </nav>
        </div>
      </div>
    </header>
  )
}
