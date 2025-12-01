import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useShallow } from 'zustand/react/shallow'
import AuthLayout from '../components/layout/AuthLayout.jsx'
import apiClient from '../utils/apiClient.js'
import getApiErrorMessage from '../utils/getApiErrorMessage.js'
import useAuthStore from '../store/useAuthStore.js'
import { ROUTES } from '@/app/paths.js'

export default function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token, login } = useAuthStore(
    useShallow((state) => ({ token: state.token, login: state.login })),
  )
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const highlights = useMemo(
    () => [
      { badge: 'Realtime', text: 'Track live scores and data insights in real time.' },
      { badge: 'Security', text: 'Accounts are protected via JWT encryption and layered auth.' },
    ],
    [],
  )

  useEffect(() => {
    if (token) {
      navigate(ROUTES.forum, { replace: true })
    }
  }, [token, navigate])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      const { data } = await apiClient.post('/auth/login', form)
      const payload = data?.data ?? data
      if (!payload?.token || !payload?.user) {
        throw new Error('Invalid login response')
      }
      login({ token: payload.token, user: payload.user })
      const redirectTo = location.state?.from?.pathname || ROUTES.forum
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Đăng nhập thất bại'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to follow favorite posts, save tactics, and join the expert community conversation."
      footer={
        <>
          Need an account?{' '}
          <Link to={ROUTES.register} className="font-medium text-primary-600 hover:text-primary-500">
            Sign up now
          </Link>
        </>
      }
      highlights={highlights}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
            Email
          </label>
          <div className="relative">
            <input
              id="email"
              name="email"
              type="email"
              inputMode="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              className="peer w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              placeholder="you@example.com"
            />
            <span className="pointer-events-none absolute inset-y-0 right-4 flex items-center text-slate-300 peer-focus:text-primary-400">
              @
            </span>
          </div>
        </div>

        <div>
          <label htmlFor="password" className="mb-1 flex items-center justify-between text-sm font-medium text-slate-700">
            <span>Password</span>
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-xs font-semibold uppercase tracking-widest text-primary-600 hover:text-primary-500"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              placeholder="••••••••"
            />
          </div>
          <p className="mt-2 text-xs text-slate-400">Use at least 8 characters for stronger security.</p>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Signing you in...' : 'Sign in to KickOff Hub'}
        </button>
      </form>
    </AuthLayout>
  )
}
