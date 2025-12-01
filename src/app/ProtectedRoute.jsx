import { Navigate, Outlet, useLocation } from 'react-router-dom'
import useAuth from '@/features/auth/hooks.js'
import { ROUTES } from '@/app/paths.js'
import GlobalLoader from '@/shared/components/feedback/GlobalLoader.jsx'

export default function ProtectedRoute({ roles }) {
  const location = useLocation()
  const { isAuthenticated, hasHydrated, hasRole } = useAuth()

  if (!hasHydrated) {
    return <GlobalLoader show />
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }

  if (roles && Array.isArray(roles) && roles.length > 0) {
    const allowed = roles.some((role) => hasRole(role))
    if (!allowed) {
      return <Navigate to={ROUTES.home} replace />
    }
  }

  return <Outlet />
}
