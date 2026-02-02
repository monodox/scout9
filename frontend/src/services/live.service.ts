import { api } from '@/lib/api'

export interface LiveMatch {
  id: string
  state: 'LIVE' | 'UPCOMING'
  startTime: string
  title: string
  tournament: {
    id: string
    name: string
  }
  teams: Array<{
    id: string
    name: string
    images?: {
      logo?: string
    }
  }>
  games: Array<{
    id: string
    state: string
    number: number
  }>
}

export interface Tournament {
  id: string
  name: string
  slug: string
  region: string
  prizePool?: number
  startDate: string
  endDate: string
  teams: Array<{
    id: string
    name: string
  }>
}

export const liveService = {
  async getLiveMatches(): Promise<{ total: number; matches: LiveMatch[] }> {
    const response = await api.get<{ total: number; matches: LiveMatch[] }>('/api/live/matches')
    return response
  },

  async getActiveTournaments(): Promise<{ total: number; tournaments: Tournament[] }> {
    const response = await api.get<{ total: number; tournaments: Tournament[] }>('/api/live/tournaments')
    return response
  },
}
