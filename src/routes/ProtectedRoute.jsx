import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import useAuthStore from '../store/useAuthStore.js'
import { ROUTES } from '@/app/paths.js'

export default function ProtectedRoute() {
  const { token, hasHydrated } = useAuthStore(
    useShallow((state) => ({ token: state.token, hasHydrated: state.hasHydrated })),
  )
  const location = useLocation()

  if (!hasHydrated) {
    return (
      <div className="flex min-h-[200px] items-center justify-center text-sm text-slate-500">
        Đang chuẩn bị dữ liệu đăng nhập...
      </div>
    )
  }

  if (!token) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }

  return <Outlet />
}
