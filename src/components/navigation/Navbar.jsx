import { useMemo, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useShallow } from 'zustand/react/shallow'
import { NAV_LINKS, ROUTES } from '../../routes/paths.js'
import useAuthStore from '../../store/useAuthStore.js'

const linkBaseClass =
  'px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md'

const MotionHeader = motion.header
const MotionNav = motion.nav

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const { token, user, logout } = useAuthStore(
    useShallow((state) => ({ token: state.token, user: state.user, logout: state.logout })),
  )
  const initials = useMemo(() => {
    if (!user?.name) return 'KH'
    return user.name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((segment) => segment[0].toUpperCase())
      .join('')
  }, [user?.name])

  const handleLogout = () => {
    logout()
    setIsOpen(false)
  }

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    const trimmed = searchTerm.trim()
    if (!trimmed) {
      return
    }
    console.info(`Search requested for: ${trimmed}`)
  }

  const renderLink = (link) => (
    <NavLink
      key={link.path}
      to={link.path}
      onClick={() => setIsOpen(false)}
      className={({ isActive }) =>
        [
          linkBaseClass,
          isActive
            ? 'bg-primary-600/90 text-white'
            : 'text-slate-600 hover:bg-primary-100 hover:text-primary-800',
        ].join(' ')
      }
    >
      {link.label}
    </NavLink>
  )

  return (
    <MotionHeader
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur"
    >
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex w-full flex-wrap items-center justify-between gap-3">
          <NavLink to="/" className="flex items-center gap-3">
            <img src="/logo-kickoffhub.jpg" alt="KickOff Hub Logo" className="h-12 w-12 rounded-full shadow-lg" />
            <div className="flex flex-col">
              <span className="text-xl font-bold text-black">KickOff Hub</span>
              <span className="text-xs uppercase tracking-widest text-slate-500">
                Football analytics
              </span>
            </div>
          </NavLink>

          <div className="ml-auto flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsOpen((prev) => !prev)}
              className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:bg-primary-100 hover:text-primary-800 lg:hidden"
              aria-label="Toggle navigation"
            >
              <span className="sr-only">Toggle navigation</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-5 w-5"
              >
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 5.25h16.5M3.75 12h16.5M3.75 18.75h16.5" />
                )}
              </svg>
            </button>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 border-t border-slate-200 pt-3">
          <nav className="hidden flex-1 flex-wrap items-center gap-1 lg:flex">{NAV_LINKS.map(renderLink)}</nav>
          <form
            onSubmit={handleSearchSubmit}
            className="flex w-full items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 shadow-sm transition focus-within:border-primary-600 focus-within:ring-2 focus-within:ring-primary-200 sm:w-auto sm:flex-1 lg:max-w-md"
            role="search"
            aria-label="Tìm kiếm"
          >
            <input
              type="search"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search teams, players, leagues..."
              className="flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth="1.5"
                stroke="currentColor"
                className="h-4 w-4"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-4.35-4.35m0 0a7 7 0 1 0-9.9-9.9 7 7 0 0 0 9.9 9.9Z" />
              </svg>
              <span className="hidden sm:inline">Search</span>
            </button>
          </form>
          <div className="hidden items-center gap-2 lg:flex">
            {token ? (
              <>
                <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-700">
                    {initials}
                  </div>
                  <div className="flex flex-col leading-tight">
                    <span className="text-xs uppercase tracking-widest text-slate-400">Thành viên</span>
                    <span className="font-semibold text-slate-800 line-clamp-1">{user?.name || 'KickOff User'}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-600"
                >
                  Đăng xuất
                </button>
              </>
            ) : (
              <>
                <Link
                  to={ROUTES.login}
                  className="rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary-500 hover:text-primary-600"
                >
                  Đăng nhập
                </Link>
                <Link
                  to={ROUTES.register}
                  className="rounded-full bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-500"
                >
                  Đăng ký
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <MotionNav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-200 bg-white px-4 py-3 shadow-lg lg:hidden"
          >
            <div className="flex flex-col gap-2">
              {NAV_LINKS.map(renderLink)}
              {token ? (
                <button
                  type="button"
                  onClick={handleLogout}
                  className="rounded-full border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700 transition hover:border-rose-200 hover:text-rose-600"
                >
                  Đăng xuất
                </button>
              ) : (
                <>
                  <Link
                    to={ROUTES.login}
                    onClick={() => setIsOpen(false)}
                    className="rounded-full border border-slate-200 px-4 py-2 text-center text-sm font-semibold text-slate-700 transition hover:border-primary-500 hover:text-primary-600"
                  >
                    Đăng nhập
                  </Link>
                  <Link
                    to={ROUTES.register}
                    onClick={() => setIsOpen(false)}
                    className="rounded-full bg-primary-600 px-4 py-2 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-primary-500"
                  >
                    Đăng ký
                  </Link>
                </>
              )}
            </div>
          </MotionNav>
        )}
      </AnimatePresence>
    </MotionHeader>
  )
}
