import { AppHeader } from '@/components/app/app-header'
import { AppFooter } from '@/components/app/app-footer'

interface LegalLayoutProps {
  children: React.ReactNode
}

export function LegalLayout({ children }: LegalLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <AppHeader />
      <main className="flex-1">
        {children}
      </main>
      <AppFooter />
    </div>
  )
}
