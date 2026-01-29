import { api } from '@/lib/api'

export interface SupportRequest {
  subject: string
  category: string
  message: string
  email?: string
}

export interface SupportTicket {
  id: number
  subject: string
  category: string
  status: string
  created_at: string
}

export const supportService = {
  // POST /api/support - Support page
  submit: (data: SupportRequest) =>
    api.post<{ message: string; ticket_id: string; status: string }>(
      '/api/support/',
      data
    ),

  // GET /api/support/
  list: (skip = 0, limit = 10) =>
    api.get<{ tickets: SupportTicket[]; total: number }>('/api/support/', {
      params: { skip, limit },
    }),
}
