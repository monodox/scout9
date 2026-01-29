import { api } from '@/lib/api'

export interface Composition {
  id: number
  name: string
  composition_data: Record<string, unknown>
  win_rate: number
  pick_rate: number
  games_played: number
  created_at: string
}

export const compositionsService = {
  // GET /api/compositions/{id} - Compositions page
  get: (id: number) => api.get<Composition>(`/api/compositions/${id}`),

  // GET /api/compositions/
  list: (skip = 0, limit = 10) =>
    api.get<{ compositions: Composition[]; total: number }>(
      '/api/compositions/',
      {
        params: { skip, limit },
      }
    ),

  // POST /api/compositions/analyze
  analyze: (match_id: string) =>
    api.post<{ message: string; status: string }>(
      '/api/compositions/analyze',
      { match_id }
    ),
}
