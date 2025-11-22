export const ROUTES = {
  home: '/',
  countries: '/countries',
  league: '/league',
  leagueDetail: '/league/:leagueId',
  teams: '/teams',
  players: '/players',
  playerDetail: '/players/:id',
  about: '/about',
  teamDetail: '/teams/:teamId',
  forum: '/forum',
  forumNew: '/forum/new',
  postDetail: '/forum/:postId',
  login: '/login',
  register: '/register',
}

export const NAV_LINKS = [
  { label: 'Home', path: ROUTES.home },
  { label: 'Countries', path: ROUTES.countries },
  { label: 'League', path: ROUTES.league },
  { label: 'Teams', path: ROUTES.teams },
  { label: 'Players', path: ROUTES.players },
  { label: 'Forum', path: ROUTES.forum },
  { label: 'About', path: ROUTES.about },
]
