import { api } from '@/lib/api';

export interface GridMatch {
  id: string;
  name: string;
  startTimeScheduled: string;
  endTimeScheduled: string;
}

export interface GridTournament {
  id: string;
  name: string;
  nameShortened: string;
}

export interface GridOrganization {
  id: string;
  name: string;
  teams: { name: string }[];
}

export interface GridTeam {
  id: string;
  name: string;
  colorPrimary: string;
  colorSecondary: string;
}

export interface GridPlayer {
  id: string;
  name: string;
  firstName: string;
  lastName: string;
  nationality: string;
}

export interface GridSeriesState {
  message: string;
  live_series: any[];
}

export interface GridStats {
  message: string;
  stats: any[];
}

// Grid Service - All GRID API data categories
export const gridService = {
  // Matches (Series)
  async getMatches(): Promise<{ total: number; matches: GridMatch[] }> {
    const response = await api.get('/api/live/matches');
    return response.data;
  },

  // Tournaments
  async getTournaments(): Promise<{ total: number; tournaments: GridTournament[] }> {
    const response = await api.get('/api/live/tournaments');
    return response.data;
  },

  // Organizations
  async getOrganizations(): Promise<{ total: number; organizations: GridOrganization[] }> {
    const response = await api.get('/api/live/organizations');
    return response.data;
  },

  // Teams
  async getTeams(): Promise<{ total: number; teams: GridTeam[] }> {
    const response = await api.get('/api/live/teams');
    return response.data;
  },

  // Players
  async getPlayers(): Promise<{ total: number; players: GridPlayer[] }> {
    const response = await api.get('/api/live/players');
    return response.data;
  },

  // Series State (Live Data)
  async getSeriesState(): Promise<{ total: number; series_state: GridSeriesState }> {
    const response = await api.get('/api/live/series-state');
    return response.data;
  },

  // Statistics
  async getStats(): Promise<{ total: number; stats: GridStats }> {
    const response = await api.get('/api/live/stats');
    return response.data;
  }
};