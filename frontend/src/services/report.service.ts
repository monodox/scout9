import { api } from '@/lib/api'

export interface Report {
  id: number
  title: string
  team_name: string
  template_type: string
  status: string
  created_at: string
  data?: Record<string, unknown>
}

export interface ReportGenerateRequest {
  scout_id: number
  template: string
}

export const reportService = {
  // GET /api/report/{id} - Report page
  get: (id: number) => api.get<Report>(`/api/report/${id}`),

  // GET /api/report/
  list: (skip = 0, limit = 10) =>
    api.get<{ reports: Report[]; total: number }>('/api/report/', {
      params: { skip, limit },
    }),

  // POST /api/report/generate
  generate: (data: ReportGenerateRequest) =>
    api.post<{ message: string; status: string }>('/api/report/generate', data),
}
