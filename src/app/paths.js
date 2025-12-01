export const ROUTES = {
  home: '/',
  countries: '/countries',
  countryDetail: '/countries/:countryId',
  league: '/league',
  leagueDetail: '/league/:leagueId',
  teams: '/teams',
  teamDetail: '/teams/:teamId',
  players: '/players',
  playerDetail: '/players/:id',
  about: '/about',
  forum: '/forum',
  forumNew: '/forum/new',
  postDetail: '/forum/:postId',
  login: '/login',
  register: '/register',
  search: '/search',
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

export default ROUTES
