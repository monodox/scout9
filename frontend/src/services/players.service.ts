import { api } from '@/lib/api'

export interface Player {
  id: number
  player_id: string
  player_name: string
  team: string
  stats?: Record<string, unknown>
  performance_score: number
  created_at: string
}

export interface AddPlayerRequest {
  player_name: string
  team: string
}

export const playersService = {
  // GET /api/players/{id} - Players page
  get: (id: number) => api.get<Player>(`/api/players/${id}`),

  // GET /api/players/
  list: (skip = 0, limit = 10) =>
    api.get<{ players: Player[]; total: number }>('/api/players/', {
      params: { skip, limit },
    }),

  // POST /api/players/
  add: (data: AddPlayerRequest) =>
    api.post<{ message: string; player: string; team: string }>(
      '/api/players/',
      data
    ),
}
