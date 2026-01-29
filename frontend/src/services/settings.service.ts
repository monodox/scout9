import { api } from '@/lib/api'

export interface Settings {
  theme: string
  notifications: boolean
  language: string
}

export interface UpdateSettingsRequest {
  theme?: string
  notifications?: boolean
  language?: string
}

export const settingsService = {
  // GET /api/settings - Settings page
  get: () => api.get<Settings>('/api/settings/'),

  // PUT /api/settings - Settings page
  update: (data: UpdateSettingsRequest) =>
    api.put<{ message: string } & Settings>('/api/settings/', data),
}
