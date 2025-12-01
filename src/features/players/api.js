import api from '@/lib/api.js'
import endpoints from '@/lib/endpoints.js'

export const playerApi = {
  list: (params) => api.get(endpoints.players.root, { params }),
  search: (params) => api.get(endpoints.players.search, { params }),
  detail: (id) => api.get(endpoints.players.byId(id)),
  leagueTeamSeason: (params) => api.get(endpoints.players.leagueTeamSeason, { params }),
  popular: (params) => api.get(endpoints.players.popular, { params }),
  stats: (params) => api.get(endpoints.players.stats, { params }),
}

export default playerApi
