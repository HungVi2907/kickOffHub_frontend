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
      { badge: 'Realtime', text: 'Theo dõi tỉ số và phân tích dữ liệu trong thời gian thực.' },
      { badge: 'An toàn', text: 'Tài khoản được bảo vệ bằng mã hóa JWT và xác thực đa tầng.' },
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
      setError(err?.message || 'Đăng nhập thất bại')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout
      title="Chào mừng trở lại"
      subtitle="Đăng nhập để theo dõi bài viết yêu thích, lưu chiến thuật và tham gia thảo luận với cộng đồng chuyên sâu."
      footer={
        <>
          Chưa có tài khoản?{' '}
          <Link to={ROUTES.register} className="font-medium text-primary-600 hover:text-primary-500">
            Đăng ký ngay
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
            <span>Mật khẩu</span>
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="text-primary-600 hover:text-primary-500"
            >
              {showPassword ? 'Ẩn' : 'Hiện'}
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
          <p className="text-xs text-slate-400">Sử dụng mật khẩu tối thiểu 8 ký tự để tăng bảo mật.</p>
        </div>

        {error && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
        )}

        <Button type="submit" className="w-full" isLoading={loading}>
          {loading ? 'Đang đăng nhập...' : 'Đăng nhập vào KickOff Hub'}
        </Button>
      </form>
    </AuthLayout>
  )
}
