export const endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    profile: '/auth/profile',
    me: '/auth/me',
  },
  teams: {
    root: '/teams',
    byId: (id) => `/teams/${id}`,
    search: '/teams/search',
    seasons: '/seasons',
    leagues: '/leagues',
    leagueDetail: (id) => `/leagues/${id}`,
    leagueSeasonTeams: ({ leagueId, season }) => `/leagues_teams_season/teams/leagues/${leagueId}/seasons/${season}`,
    venues: (id) => `/venues/${id}`,
    popular: '/teams/popular',
    leagueTeams: (id) => `/teams/league/${id}`,
  },
  players: {
    root: '/players',
    byId: (id) => `/players/${id}`,
    search: '/players/search',
    leagueTeamSeason: '/player-team-league-season/players',
    popular: '/players/popular',
    stats: '/players-stats',
  },
  countries: {
    root: '/countries',
    byId: (id) => `/countries/${id}`,
    search: '/countries/search',
  },
  posts: {
    root: '/posts',
    byId: (id) => `/posts/${id}`,
    comments: (postId) => `/posts/${postId}/comments`,
    likes: (postId) => `/posts/${postId}/likes`,
    reports: (postId) => `/posts/${postId}/reports`,
    tags: '/tags',
  },
}

export default endpoints
