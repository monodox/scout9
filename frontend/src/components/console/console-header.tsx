import { Bell, User, Menu, Info } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function ConsoleHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="flex h-16 items-center justify-between px-6">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="md:hidden">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="hidden md:flex items-center space-x-2 text-sm text-muted-foreground">
            <Info className="h-4 w-4" />
            <span title="Scout9: Automated opponent scouting powered by official esports data.">
              Scout9 - Automated opponent scouting powered by official esports data.
            </span>
          </div>
        </div>

        <div className="flex-1" />

        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm">
            <Bell className="h-5 w-5" />
          </Button>

          <Button variant="ghost" size="sm">
            <User className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </header>
  )
}
