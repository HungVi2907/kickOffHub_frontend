import { lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import AppLayout from '@/app/layout.jsx'
import ProtectedRoute from '@/app/ProtectedRoute.jsx'
import { ROUTES } from '@/app/paths.js'

const HomePage = lazy(() => import('@/features/posts/pages/Home.jsx'))
const AboutPage = lazy(() => import('@/features/posts/pages/About.jsx'))
const SearchPage = lazy(() => import('@/features/posts/pages/Search.jsx'))
const ForumPage = lazy(() => import('@/features/posts/pages/Forum.jsx'))
const PostCreatePage = lazy(() => import('@/features/posts/pages/PostCreate.jsx'))
const PostDetailPage = lazy(() => import('@/features/posts/pages/PostDetail.jsx'))
const CountriesPage = lazy(() => import('@/features/teams/pages/Countries.jsx'))
const LeaguePage = lazy(() => import('@/features/teams/pages/League.jsx'))
const TeamsPage = lazy(() => import('@/features/teams/pages/Teams.jsx'))
const TeamDetailPage = lazy(() => import('@/features/teams/pages/TeamDetail.jsx'))
const PlayersPage = lazy(() => import('@/features/players/pages/Players.jsx'))
const PlayerDetailPage = lazy(() => import('@/features/players/pages/PlayerDetail.jsx'))
const LoginPage = lazy(() => import('@/features/auth/pages/Login.jsx'))
const RegisterPage = lazy(() => import('@/features/auth/pages/Register.jsx'))

export default function AppRoutes({ location }) {
  return (
    <Routes location={location}>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<HomePage />} />
        <Route path="countries" element={<CountriesPage />} />
        <Route path="league" element={<LeaguePage />} />
        <Route path="league/:leagueId" element={<LeaguePage />} />
        <Route path="teams" element={<TeamsPage />} />
        <Route path="teams/:teamId" element={<TeamDetailPage />} />
        <Route path="players" element={<PlayersPage />} />
        <Route path="players/:id" element={<PlayerDetailPage />} />
        <Route path="search" element={<SearchPage />} />
        <Route path="forum" element={<ForumPage />} />
        <Route element={<ProtectedRoute />}>
          <Route path="forum/new" element={<PostCreatePage />} />
        </Route>
        <Route path="forum/:postId" element={<PostDetailPage />} />
        <Route path="about" element={<AboutPage />} />
      </Route>
      <Route path={ROUTES.login} element={<LoginPage />} />
      <Route path={ROUTES.register} element={<RegisterPage />} />
      <Route path="*" element={<Navigate to={ROUTES.home} replace />} />
    </Routes>
  )
}
