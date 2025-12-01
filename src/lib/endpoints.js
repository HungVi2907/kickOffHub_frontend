/**
 * =============================================================================
 * API ENDPOINTS CONFIGURATION
 * =============================================================================
 * 
 * Centralized endpoint definitions for the entire application.
 * 
 * IMPORTANT: These are RELATIVE paths without /api prefix.
 * The axios instance in api.js has baseURL configured which includes /api.
 * 
 * Example:
 * - Endpoint: '/posts'
 * - baseURL (dev): '/api'
 * - Final URL: '/api/posts' → Vite proxy → http://localhost:3000/api/posts
 * 
 * DO NOT add '/api' prefix here - it's already in baseURL!
 */
export const endpoints = {
  // ---------------------------------------------------------------------------
  // Authentication endpoints
  // ---------------------------------------------------------------------------
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    profile: '/auth/profile',
    me: '/auth/me',
  },
  
  // ---------------------------------------------------------------------------
  // Teams & Leagues endpoints
  // ---------------------------------------------------------------------------
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
  
  // ---------------------------------------------------------------------------
  // Players endpoints
  // ---------------------------------------------------------------------------
  players: {
    root: '/players',
    byId: (id) => `/players/${id}`,
    search: '/players/search',
    leagueTeamSeason: '/player-team-league-season/players',
    popular: '/players/popular',
    stats: '/players-stats',
  },
  
  // ---------------------------------------------------------------------------
  // Countries endpoints
  // ---------------------------------------------------------------------------
  countries: {
    root: '/countries',
    byId: (id) => `/countries/${id}`,
    search: '/countries/search',
  },
  
  // ---------------------------------------------------------------------------
  // Posts endpoints (Forum)
  // ---------------------------------------------------------------------------
  posts: {
    root: '/posts',
    byId: (id) => `/posts/${id}`,
    // Comments: POST body must be { content: string }
    comments: (postId) => `/posts/${postId}/comments`,
    // Likes: POST to like, DELETE to unlike (no body needed)
    likes: (postId) => `/posts/${postId}/likes`,
    // Reports: POST with { reason: string }
    reports: (postId) => `/posts/${postId}/reports`,
    tags: '/tags',
  },
}

export default endpoints
