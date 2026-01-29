import { api } from '@/lib/api'

export interface ScoutRequest {
  team_name: string
  match_id?: string
  date_from?: string
  date_to?: string
}

export interface Scout {
  id: number
  team_name: string
  match_id?: string
  status: string
  created_at: string
  completed_at?: string
  results?: Record<string, unknown>
}

export const scoutService = {
  // POST /api/scout/run - Scout page
  run: (data: ScoutRequest) => api.post<Scout>('/api/scout/run', data),

  // GET /api/scout/
  list: (skip = 0, limit = 10) =>
    api.get<{ scouts: Scout[]; total: number }>('/api/scout/', {
      params: { skip, limit },
    }),

  // GET /api/scout/{id}
  get: (id: number) => api.get<Scout>(`/api/scout/${id}`),
}
