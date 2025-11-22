import { Navigate, Route, Routes } from 'react-router-dom'
import MainLayout from '../components/layout/MainLayout.jsx'
import About from '../pages/About.jsx'
import Countries from '../pages/Countries.jsx'
import Forum from '../pages/Forum.jsx'
import Home from '../pages/Home.jsx'
import League from '../pages/League.jsx'
import Login from '../pages/Login.jsx'
import Players from '../pages/Players.jsx'
import PlayerDetail from '../pages/PlayerDetail.jsx'
import PostCreate from '../pages/PostCreate.jsx'
import PostDetail from '../pages/PostDetail.jsx'
import Register from '../pages/Register.jsx'
import TeamDetail from '../pages/TeamDetail.jsx'
import Teams from '../pages/Teams.jsx'
import ProtectedRoute from './ProtectedRoute.jsx'
import { ROUTES } from './paths.js'

export default function AppRoutes({ location }) {
  return (
    <Routes location={location}>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="countries" element={<Countries />} />
        <Route path="league" element={<League />} />
        <Route path="league/:leagueId" element={<League />} />
        <Route path="teams" element={<Teams />} />
        <Route path="teams/:teamId" element={<TeamDetail />} />
        <Route path="players" element={<Players />} />
        <Route path="players/:id" element={<PlayerDetail />} />
        <Route path="forum" element={<Forum />} />
        <Route element={<ProtectedRoute />}>
          <Route path="forum/new" element={<PostCreate />} />
        </Route>
        <Route path="forum/:postId" element={<PostDetail />} />
        <Route path="about" element={<About />} />
      </Route>
      <Route path={ROUTES.login} element={<Login />} />
      <Route path={ROUTES.register} element={<Register />} />
      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  )
}
