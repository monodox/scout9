import { Routes, Route, Navigate } from 'react-router-dom'
import Terms from './app/legal/terms/page'
import Privacy from './app/legal/privacy/page'
import Cookies from './app/legal/cookies/page'
import Login from './app/auth/login/page'
import Signup from './app/auth/signup/page'
import ForgotPassword from './app/auth/forgot-password/page'
import VerifyEmail from './app/auth/verify-email/page'
import ResetPassword from './app/auth/reset-password/page'
import Dashboard from './app/console/dashboard/page'
import Scout from './app/console/scout/page'
import Report from './app/console/report/page'
import ReportDetail from './app/console/report/[id]/page'
import Players from './app/console/players/page'
import PlayerDetail from './app/console/players/[id]/page'
import Strategies from './app/console/strategies/page'
import StrategyDetail from './app/console/strategies/[id]/page'
import Compositions from './app/console/compositions/page'
import CompositionDetail from './app/console/compositions/[id]/page'
import Settings from './app/console/settings/page'
import System from './app/console/system/page'
import Support from './app/console/support/page'

function App() {
  return (
    <div className="min-h-screen">
      <Routes>
        <Route path="/" element={<Navigate to="/console/dashboard" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/console/dashboard" element={<Dashboard />} />
        <Route path="/console/scout" element={<Scout />} />
        <Route path="/console/report" element={<Report />} />
        <Route path="/console/report/:id" element={<ReportDetail />} />
        <Route path="/console/players" element={<Players />} />
        <Route path="/console/players/:id" element={<PlayerDetail />} />
        <Route path="/console/strategies" element={<Strategies />} />
        <Route path="/console/strategies/:id" element={<StrategyDetail />} />
        <Route path="/console/compositions" element={<Compositions />} />
        <Route path="/console/compositions/:id" element={<CompositionDetail />} />
        <Route path="/console/settings" element={<Settings />} />
        <Route path="/console/system" element={<System />} />
        <Route path="/console/support" element={<Support />} />
        <Route path="/legal/terms" element={<Terms />} />
        <Route path="/legal/privacy" element={<Privacy />} />
        <Route path="/legal/cookies" element={<Cookies />} />
      </Routes>
    </div>
  )
}

export default App
