import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import AuthLayout from '@/shared/components/layout/AuthLayout.jsx'
import Button from '@/shared/components/ui/Button.jsx'
import Input from '@/shared/components/ui/Input.jsx'
import { ROUTES } from '@/app/paths.js'
import useAuth from '@/features/auth/hooks.js'

export default function RegisterPage() {
  const navigate = useNavigate()
  const { register } = useAuth()
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
      { label: 'Contains at least 1 number', passed: hasNumber },
      { label: 'Contains uppercase letter', passed: hasUpper },
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

    try {
      if (form.password !== form.confirmPassword) {
        throw new Error('Passwords do not match.')
      }
      if (!form.acceptTerms) {
        throw new Error('You must agree to the KickOff Hub community guidelines.')
      }
      setLoading(true)
      await register({
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      })
      setSuccess('Registration successful! Please log in to get started.')
      setTimeout(() => navigate(ROUTES.login), 1200)
    } catch (err) {
      setError(err?.message || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Create a KickOff Hub account"
      subtitle="Join analysts, coaches, and fans who understand the beautiful game at its deepest level."
      footer={
        <>
          Already have an account?{' '}
          <Link to={ROUTES.login} className="font-medium text-primary-600 hover:text-primary-500">
            Log in now
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="name"
            name="name"
            type="text"
            required
            label="Full name"
            placeholder="John Doe"
            value={form.name}
            onChange={handleChange}
          />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            label="Work / personal email"
            placeholder="you@example.com"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            required
            label="Password"
            placeholder="••••••••"
            value={form.password}
            onChange={handleChange}
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            label="Confirm password"
            placeholder="Re-enter password"
            value={form.confirmPassword}
            onChange={handleChange}
          />
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Password strength</p>
          <ul className="mt-3 space-y-2 text-sm text-slate-600">
            {passwordChecklist.map((item) => (
              <li key={item.label} className="flex items-center gap-2">
                <span
                  className={`inline-flex h-5 w-5 items-center justify-center rounded-full border text-[10px] ${
                    item.passed
                      ? 'border-emerald-400 bg-emerald-50 text-emerald-600'
                      : 'border-slate-200 bg-white text-slate-400'
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
            <a
              href="https://kickoffhub-api.onrender.com/policy"
              className="font-semibold text-primary-600"
              target="_blank"
              rel="noreferrer"
            >
              community guidelines
            </a>{' '}
            and commit to sharing positive content.
          </span>
        </label>

        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600">{success}</p>}

        <Button type="submit" className="w-full" isLoading={loading}>
          {loading ? 'Creating account...' : 'Complete registration'}
        </Button>
      </form>
    </AuthLayout>
  )
}
