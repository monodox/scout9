import { api } from '@/lib/api'

export interface Player {
  id: string
  player_name: string
  role?: string
  team?: string
  metrics_json?: Record<string, any>
  tendencies_json?: Record<string, any>
  created_at?: string
  performance_score?: number
}

export interface AddPlayerRequest {
  player_name: string
  team: string
}

export const playersService = {
  // GET /api/players/{id} - Players page
  get: (id: string) => api.get<Player>(`/api/players/${id}`),

  // GET /api/players/
  list: (skip = 0, limit = 10, report_id?: string) =>
    api.get<{ players: Player[]; total: number; report_id?: string }>('/api/players/', {
      params: { skip, limit, ...(report_id && { report_id }) },
    }),

  // POST /api/players/
  add: (data: AddPlayerRequest) =>
    api.post<{ message: string; player: string; team: string }>(
      '/api/players/',
      data
    ),
}
