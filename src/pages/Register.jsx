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
      { label: 'Tối thiểu 8 ký tự', passed: hasLength },
      { label: 'Chứa ít nhất 1 số', passed: hasNumber },
      { label: 'Có chữ in hoa', passed: hasUpper },
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
        throw new Error('Mật khẩu xác nhận chưa trùng khớp.')
      }
      if (!form.acceptTerms) {
        throw new Error('Bạn cần đồng ý với điều khoản cộng đồng KickOff Hub.')
      }
      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        password: form.password,
      }
      await apiClient.post('/auth/register', payload)
      setSuccess('Đăng ký thành công! Vui lòng đăng nhập để bắt đầu.')
      setTimeout(() => navigate(ROUTES.login), 1200)
    } catch (err) {
      const message = err.response?.data?.error || err.response?.data?.message || err.message || 'Đăng ký thất bại'
      setError(message)
    } finally {
      setLoading(false)
    }
  }
  return (
    <AuthLayout
      title="Tạo tài khoản KickOff Hub"
      subtitle="Đồng hành cùng các nhà phân tích, HLV và người hâm mộ hiểu sâu trò chơi đẹp nhất thế giới."
      footer={
        <>
          Đã có tài khoản?{' '}
          <Link to={ROUTES.login} className="font-medium text-primary-600 hover:text-primary-500">
            Đăng nhập ngay
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="name" className="mb-1 block text-sm font-medium text-slate-700">
              Họ và tên
            </label>
            <input
              id="name"
              name="name"
              type="text"
              required
              value={form.name}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              placeholder="Nguyễn Văn A"
            />
          </div>
          <div>
            <label htmlFor="email" className="mb-1 block text-sm font-medium text-slate-700">
              Email công việc / cá nhân
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
              Mật khẩu
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
              Xác nhận mật khẩu
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              value={form.confirmPassword}
              onChange={handleChange}
              className="w-full rounded-xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
              placeholder="Nhập lại mật khẩu"
            />
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-slate-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Mức độ an toàn</p>
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
            Tôi đồng ý với{' '}
            <a href="https://kickoffhub-api.onrender.com/policy" className="font-semibold text-primary-600" target="_blank" rel="noreferrer">
              điều khoản cộng đồng
            </a>{' '}
            và cam kết chia sẻ nội dung tích cực.
          </span>
        </label>

        {error && <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>}
        {success && <p className="rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-600">{success}</p>}

        <button
          type="submit"
          disabled={loading}
          className="inline-flex w-full items-center justify-center rounded-xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? 'Đang khởi tạo...' : 'Hoàn tất đăng ký'}
        </button>
      </form>
    </AuthLayout>
  )
}
