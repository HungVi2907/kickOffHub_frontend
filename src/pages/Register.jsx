import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '../components/layout/AuthLayout.jsx'
import apiClient from '../utils/apiClient.js'
import { ROUTES } from '../routes/paths.js'

export default function Register() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const passwordChecklist = useMemo(() => {
    const hasLength = form.password.length >= 8
    const hasNumber = /\d/.test(form.password)
    const hasUpper = /[A-Z]/.test(form.password)
    return [
      { label: 'At least 8 characters', passed: hasLength },
      { label: 'Contains at least one number', passed: hasNumber },
      { label: 'Includes an uppercase letter', passed: hasUpper },
    ]
  }, [form.password])

  const handleChange = (event) => {
    const { name, value, type, checked } = event.target
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (form.password !== form.confirmPassword) {
        throw new Error('Confirmation password does not match.')
      }
      if (!form.acceptTerms) {
        throw new Error('You must agree to the KickOff Hub community terms.')
      }
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      }
      await apiClient.post('/auth/register', payload)
      setSuccess('Registration successful! Please sign in to get started.')
      setTimeout(() => navigate(ROUTES.login), 1200)
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Registration failed'
      setError(message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <AuthLayout
      title="Create your KickOff Hub account"
      subtitle="Join analysts, coaches, and fans who dive deeper into the beautiful game."
      footer={
        <>
          Already have an account?{' '}
          <Link to={ROUTES.login} className="font-medium text-primary-600 hover:text-primary-500">
            Sign in now
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
              Full name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              placeholder="Alex Nguyen"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Work or personal email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              value={form.email}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              placeholder="you@example.com"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={form.password}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-slate-700">
              Confirm password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              placeholder="Re-enter your password"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Password strength</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {passwordChecklist.map((item) => (
              <li key={item.label} className="flex items-center gap-2">
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                    item.passed ? 'border-emerald-400 bg-emerald-50 text-emerald-600' : 'border-slate-200 bg-white text-slate-400'
                  }`}
                >
                  ✓
                </span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>

        <label className="flex items-start gap-3 text-sm text-slate-600">
          <input
            type="checkbox"
            name="acceptTerms"
            checked={form.acceptTerms}
            onChange={handleChange}
            className="mt-1 h-4 w-4 rounded border-slate-300 text-primary-600 focus:ring-primary-500"
            required
          />
          <span>
            I agree to the{' '}
            <a href="https://kickoffhub-api.onrender.com/policy" className="font-semibold text-primary-600" target="_blank" rel="noreferrer">
              community guidelines
            </a>{' '}
            and commit to sharing positive content.
          </span>
        </label>

        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Creating your account...' : 'Complete registration'}
        </button>
      </form>
    </AuthLayout>
  )
}
