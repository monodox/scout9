import { ConsoleSidebar } from '@/components/console/console-sidebar'
import { ConsoleHeader } from '@/components/console/console-header'

interface ConsoleLayoutProps {
  children: React.ReactNode
}

export function ConsoleLayout({ children }: ConsoleLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden">
      <ConsoleSidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <ConsoleHeader />
        <main className="flex-1 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
