import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import useTheme from '../../hooks/useTheme'
import { NAV_LINKS } from '../../routes/paths.js'

const linkBaseClass =
  'px-3 py-2 text-sm font-medium transition-colors duration-200 rounded-md'

const MotionHeader = motion.header
const MotionNav = motion.nav

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme()

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className="group inline-flex items-center gap-2 rounded-md border border-transparent bg-primary-600 px-3 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-sm transition hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400"
      aria-label="Toggle dark mode"
    >
      <span className="h-2 w-2 rounded-full bg-white transition group-hover:scale-110" />
      {isDark ? 'Light' : 'Dark'}
    </button>
  )
}

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

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
            : 'text-slate-600 hover:bg-primary-100 hover:text-primary-800 dark:text-slate-100 dark:hover:bg-primary-900/60 dark:hover:text-white',
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
      className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur dark:border-slate-800 dark:bg-navy/80"
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <NavLink to="/" className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-600 text-lg font-bold text-white shadow-lg">
            KH
          </span>
          <div className="flex flex-col">
            <span className="text-lg font-bold text-navy dark:text-white">KickOff Hub</span>
            <span className="text-xs uppercase tracking-widest text-slate-500 dark:text-slate-400">
              Football analytics
            </span>
          </div>
        </NavLink>

        <div className="flex items-center gap-3 lg:hidden">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setIsOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white p-2 text-slate-600 shadow-sm transition hover:bg-primary-100 hover:text-primary-800 dark:border-slate-700 dark:bg-navy dark:text-slate-100 dark:hover:bg-primary-900/60"
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

        <nav className="hidden gap-1 lg:flex">{NAV_LINKS.map(renderLink)}</nav>

        <div className="hidden lg:block">
          <ThemeToggle />
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <MotionNav
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-slate-200 bg-white px-4 py-3 shadow-lg lg:hidden dark:border-slate-700 dark:bg-navy"
          >
            <div className="flex flex-col gap-2">{NAV_LINKS.map(renderLink)}</div>
          </MotionNav>
        )}
      </AnimatePresence>
    </MotionHeader>
  )
}
