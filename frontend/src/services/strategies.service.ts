import { api } from '@/lib/api'

export interface Strategy {
  id: number
  name: string
  strategy_type: string
  description?: string
  success_rate: number
  usage_count: number
  data?: Record<string, unknown>
  created_at: string
}

export const strategiesService = {
  // GET /api/strategies/{id} - Strategies page
  get: (id: number) => api.get<Strategy>(`/api/strategies/${id}`),

  // GET /api/strategies/
  list: (skip = 0, limit = 10) =>
    api.get<{ strategies: Strategy[]; total: number }>('/api/strategies/', {
      params: { skip, limit },
    }),

  // POST /api/strategies/analyze
  analyze: (match_id: string) =>
    api.post<{ message: string; status: string }>('/api/strategies/analyze', {
      match_id,
    }),
}
