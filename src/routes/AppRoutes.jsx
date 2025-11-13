import { Route, Routes } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout.jsx'
import About from '../pages/About.jsx'
import Countries from '../pages/Countries.jsx'
import Home from '../pages/Home.jsx'
import League from '../pages/League.jsx'
import Teams from '../pages/Teams.jsx'
import Players from '../pages/Players.jsx'
import PlayerDetail from '../pages/PlayerDetail.jsx'
import TeamDetail from '../pages/TeamDetail.jsx'
import { ROUTES } from './paths.js'

export default function AppRoutes({ location }) {
  return (
    <Routes location={location}>
      <Route element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path={ROUTES.countries} element={<Countries />} />
  <Route path={ROUTES.league} element={<League />} />
  <Route path={ROUTES.leagueDetail} element={<League />} />
        <Route path={ROUTES.teams} element={<Teams />} />
        <Route path={ROUTES.teamDetail} element={<TeamDetail />} />
        <Route path={ROUTES.players} element={<Players />} />
        <Route path={ROUTES.playerDetail} element={<PlayerDetail />} />
        <Route path={ROUTES.about} element={<About />} />
      </Route>
    </Routes>
  )
}
