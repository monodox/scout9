import { api } from '@/lib/api'

export interface SystemOverview {
  total_scouts: number
  reports_generated: number
  players_tracked: number
  strategies_analyzed: number
  recent_activity: Array<{
    id: number
    type: string
    description: string
    timestamp: string
  }>
}

export interface SystemStatus {
  status: string
  version: string
  uptime: string
  grid_api: string
  last_updated: string
}

export const systemService = {
  // GET /api/system/overview - Dashboard
  getOverview: () => api.get<SystemOverview>('/api/system/overview'),

  // GET /api/system/status - System page
  getStatus: () => api.get<SystemStatus>('/api/system/status'),

  // GET /api/system/health
  getHealth: () => api.get<{ status: string }>('/api/system/health'),

  // GET /api/system/grid-status
  getGridStatus: () =>
    api.get<{ grid_api: string; status: string }>('/api/system/grid-status'),

  // POST /api/system/cache/clear
  clearCache: () => api.post<{ message: string }>('/api/system/cache/clear'),
}
