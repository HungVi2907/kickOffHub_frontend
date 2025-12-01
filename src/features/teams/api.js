import api from '@/lib/api.js'
import endpoints from '@/lib/endpoints.js'

export const teamApi = {
  list: (params) => api.get(endpoints.teams.root, { params }),
  search: (params) => api.get(endpoints.teams.search, { params }),
  detail: (id) => api.get(endpoints.teams.byId(id)),
  seasons: () => api.get(endpoints.teams.seasons),
  leagues: () => api.get(endpoints.teams.leagues),
  leagueDetail: (id) => api.get(endpoints.teams.leagueDetail(id)),
  leagueTeams: (id, params) => api.get(endpoints.teams.leagueTeams(id), { params }),
  teamsByLeagueSeason: ({ leagueId, season }) =>
    api.get(endpoints.teams.leagueSeasonTeams({ leagueId, season })),
  venue: (id) => api.get(endpoints.teams.venues(id)),
  popular: (params) => api.get(endpoints.teams.popular, { params }),
}

export default teamApi
