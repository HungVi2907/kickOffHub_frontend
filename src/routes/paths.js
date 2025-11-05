export const ROUTES = {
  home: '/',
  countries: '/countries',
  league: '/league',
  leagueDetail: '/league/:leagueId',
  teams: '/teams',
  about: '/about',
  teamDetail: '/teams/:teamId',
}

export const NAV_LINKS = [
  { label: 'Home', path: ROUTES.home },
  { label: 'Countries', path: ROUTES.countries },
  { label: 'League', path: ROUTES.league },
  { label: 'Teams', path: ROUTES.teams },
  { label: 'About', path: ROUTES.about },
]
