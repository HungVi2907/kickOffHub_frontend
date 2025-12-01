import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import AuthLayout from '@/shared/components/layout/AuthLayout.jsx'
import Button from '@/shared/components/ui/Button.jsx'
import Input from '@/shared/components/ui/Input.jsx'
import { ROUTES } from '@/app/paths.js'
import useAuth from '@/features/auth/hooks.js'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isAuthenticated, login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const highlights = useMemo(
    () => [
      { badge: 'Realtime', text: 'Track scores and analyze data in real time.' },
      { badge: 'Secure', text: 'Account protected with JWT encryption and multi-layer authentication.' },
    ],
    [],
  )

  useEffect(() => {
    if (isAuthenticated) {
      navigate(ROUTES.forum, { replace: true })
    }
  }, [isAuthenticated, navigate])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login(form)
      const redirectTo = location.state?.from?.pathname || ROUTES.forum
      navigate(redirectTo, { replace: true })
    } catch (err) {
      setError(err?.message || 'Login failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Log in to follow your favorite posts, save tactics, and join in-depth discussions with the community."
      footer={
        <>
          Don't have an account?{' '}
          <Link to={ROUTES.register} className="font-medium text-primary-600 hover:text-primary-500">
            Sign up now
          </Link>
        </>
      }
      highlights={highlights}
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          id="email"
          name="email"
          type="email"
          inputMode="email"
          autoComplete="email"
          required
          label="Email"
          placeholder="you@example.com"
          value={form.email}
          onChange={handleChange}
        />

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-widest text-slate-600">
            <span>Password</span>
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-primary-600 hover:text-primary-500"
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
          <Input
            id="password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            autoComplete="current-password"
            required
            hiddenLabel
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
          />
          <p className="text-xs text-slate-400">Use a password with at least 8 characters for better security.</p>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <Button type="submit" className="w-full" isLoading={loading}>
          {loading ? 'Logging in...' : 'Log in to KickOff Hub'}
        </Button>
      </form>
    </AuthLayout>
  )
}
