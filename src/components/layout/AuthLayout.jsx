import { Link } from 'react-router-dom'

const defaultHighlights = [
  { badge: 'Cộng đồng', text: 'Hơn 5.000 người yêu bóng đá đang thảo luận mỗi ngày.' },
  { badge: 'Phân tích', text: 'Bài viết chuyên sâu về chiến thuật, cầu thủ và giải đấu.' },
  { badge: 'Sự kiện', text: 'Cập nhật tin nóng và lịch thi đấu ngay khi công bố.' },
]

export default function AuthLayout({ title, subtitle, children, footer, highlights = defaultHighlights }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-parchment via-white to-slate-100 px-4 py-10">
      <div className="mx-auto grid w-full max-w-5xl gap-8 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-2xl shadow-primary-100/50 backdrop-blur lg:grid-cols-[1.15fr_0.85fr] lg:p-10">
        <section className="flex flex-col justify-center">
          <div className="mb-8">
            <Link to="/" className="inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 shadow-sm">
              <span>KickOff Hub</span>
              <span className="text-primary-500">•</span>
              <span>Football Insights</span>
            </Link>
            <h1 className="mt-6 text-4xl font-bold text-slate-900">{title}</h1>
            <p className="mt-3 text-base text-slate-600">{subtitle}</p>
          </div>

          <div className="rounded-2xl border border-slate-100 bg-white/80 p-6 shadow-inner">
            {children}
          </div>

          {footer && <div className="mt-6 text-center text-sm text-slate-500">{footer}</div>}
        </section>

        <aside className="relative hidden overflow-hidden rounded-2xl border border-slate-100 bg-gradient-to-br from-[#0b132b] via-[#1c2541] to-[#3d66e6] text-white lg:flex lg:flex-col lg:justify-between">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.15),_transparent_55%)]" aria-hidden="true" />
          <div className="relative z-10 p-8">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-100/80">Cộng đồng bóng đá</p>
            <h2 className="mt-4 text-3xl font-semibold leading-tight">Cùng xây dựng thư viện kiến thức bóng đá hiện đại</h2>
            <p className="mt-3 text-sm text-white/80">
              Tham gia thảo luận, kết nối các chuyên gia dữ liệu và cập nhật chiến thuật mới nhất cùng KickOff Hub.
            </p>
          </div>
          <ul className="relative z-10 space-y-4 px-8 pb-8">
            {highlights.map((item) => (
              <li key={item.badge} className="rounded-2xl border border-white/15 bg-white/5 p-4">
                <span className="inline-flex items-center rounded-full bg-white/90 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-primary-600">
                  {item.badge}
                </span>
                <p className="mt-3 text-sm text-white/90">{item.text}</p>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </div>
  )
}

