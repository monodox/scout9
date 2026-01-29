import { Link, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Search,
  FileText,
  Users,
  Target,
  Layers,
  Settings,
  Monitor,
  HelpCircle
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navigation = [
  { name: 'Dashboard', href: '/console/dashboard', icon: LayoutDashboard },
  { name: 'Scout', href: '/console/scout', icon: Search },
  { name: 'Reports', href: '/console/report', icon: FileText },
  { name: 'Players', href: '/console/players', icon: Users },
  { name: 'Strategies', href: '/console/strategies', icon: Target },
  { name: 'Compositions', href: '/console/compositions', icon: Layers },
]

const secondaryNavigation = [
  { name: 'Settings', href: '/console/settings', icon: Settings },
  { name: 'System', href: '/console/system', icon: Monitor },
  { name: 'Support', href: '/console/support', icon: HelpCircle },
]

export function ConsoleSidebar() {
  const location = useLocation()

  return (
    <aside className="w-64 border-r border-border bg-background">
      <div className="flex h-full flex-col">
        <div className="flex h-16 items-center border-b border-border px-6">
          <Link to="/" className="flex items-center space-x-2">
            <span className="text-xl font-bold">Scout9</span>
          </Link>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border px-3 py-4">
          {secondaryNavigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center space-x-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-accent text-accent-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <item.icon className="h-5 w-5" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </aside>
  )
}
