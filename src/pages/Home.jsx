import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import apiClient from '../utils/apiClient.js'

const FEATURED_COUNT = 12

const heroVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
}

const MotionSection = motion.section
const MotionArticle = motion.article
const MotionLink = motion(Link)

export default function Home() {
  const [countries, setCountries] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [leagues, setLeagues] = useState([])
  const [leagueLoading, setLeagueLoading] = useState(false)
  const [leagueError, setLeagueError] = useState('')

  const fetchCountries = useCallback(
    async ({ signal } = {}) => {
      setLoading(true)
      setError('')
      try {
        const response = await apiClient.get('/countries', { signal })
        const list = Array.isArray(response.data)
          ? response.data
          : response.data?.data || []
        setCountries(list.slice(0, FEATURED_COUNT))
      } catch (err) {
        if (axios.isCancel(err)) return
        const message = err.response?.data?.message || err.message || 'Failed to load countries'
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchCountries({ signal: controller.signal })
    return () => controller.abort()
  }, [fetchCountries])

  const handleFlagError = useCallback((event) => {
    event.currentTarget.style.display = 'none'
  }, [])

  const fetchLeagues = useCallback(
    async ({ signal } = {}) => {
      setLeagueLoading(true)
      setLeagueError('')
      try {
        const response = await apiClient.get('/leagues', { signal })
        const list = Array.isArray(response.data) ? response.data : response.data?.data || []
        setLeagues(list)
      } catch (err) {
        if (axios.isCancel(err)) return
        const message = err.response?.data?.message || err.message || 'Failed to load leagues'
        setLeagueError(message)
      } finally {
        setLeagueLoading(false)
      }
    },
    [],
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchLeagues({ signal: controller.signal })
    return () => controller.abort()
  }, [fetchLeagues])

  const handleLeagueLogoError = useCallback((event) => {
    event.currentTarget.style.display = 'none'
  }, [])

  return (
    <div className="space-y-12">
      <MotionSection
        variants={heroVariants}
        initial="hidden"
        animate="visible"
        transition={{ duration: 0.6 }}
        className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur dark:border-slate-800 dark:bg-navy/80"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">
              KickOff Hub
            </p>
            <h1 className="text-4xl font-black tracking-tight text-navy dark:text-white sm:text-5xl">
              The modern football reference experience
            </h1>
            <p className="text-base text-slate-600 dark:text-slate-300">
              Explore clubs, competitions, and national teams with a clean interface inspired by
              fbref.com, powered entirely by the KickOff Hub API.
            </p>
          </div>
          <div className="flex flex-col gap-3 rounded-2xl border border-primary-200 bg-primary-50 px-6 py-5 text-primary-800 shadow-inner dark:border-primary-900 dark:bg-primary-900/30 dark:text-primary-200">
            <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600 dark:text-primary-300">
              API Snapshot
            </span>
            <p className="text-3xl font-bold">171 Countries</p>
            <p className="text-sm leading-relaxed text-primary-700 dark:text-primary-200/80">
              Start browsing the full list below. Premier League league and team hubs are around the
              corner.
            </p>
          </div>
        </div>
  </MotionSection>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-navy dark:text-white">Featured leagues</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Listing all competitions currently available in your KickOff Hub database.
            </p>
          </div>
          <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700 dark:bg-primary-900/40 dark:text-primary-200">
            {leagues.length} league{leagues.length === 1 ? '' : 's'}
          </span>
        </div>

        {leagueError && (
          <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/40 dark:text-red-200">
            <p className="font-semibold">We could not load leagues.</p>
            <p className="mt-1">{leagueError}</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leagueLoading &&
            Array.from({ length: Math.max(leagues.length || 1, 1) }).map((_, index) => (
              <div
                key={`league-skeleton-${index}`}
                className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white/60 shadow-sm dark:border-slate-800 dark:bg-navy/60"
              />
            ))}

          {!leagueLoading && !leagueError && leagues.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-navy/60 dark:text-slate-400">
              No leagues have been synced yet. Import one from the backend to see it here.
            </div>
          )}

          {!leagueLoading && !leagueError &&
            leagues.map((league) => (
              <MotionLink
                to={`/league/${league.id ?? ''}`}
                key={league.id || league.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.02 }}
                className="group flex h-32 flex-col justify-between rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400 dark:border-slate-800 dark:bg-navy/80"
              >
                <div className="flex items-center gap-4">
                  {league.logo ? (
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white/80 shadow-sm dark:border-slate-700 dark:bg-navy/80">
                      <img
                        src={league.logo}
                        alt={`${league.name || 'League'} logo`}
                        loading="lazy"
                        onError={handleLeagueLogoError}
                        className="h-10 w-10 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-slate-300 text-[10px] uppercase tracking-[0.3em] text-slate-400 dark:border-slate-600">
                      No logo
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-navy transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-200">
                      {league.name || 'Unnamed league'}
                    </h3>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                      {league.type || 'League'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                  <span>ID: {league.id ?? 'N/A'}</span>
                  <span>{league.updated_at ? new Date(league.updated_at).toLocaleDateString() : 'Recently synced'}</span>
                </div>
              </MotionLink>
            ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-navy dark:text-white">Featured countries</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Showing the first {FEATURED_COUNT} countries returned from the API.
            </p>
          </div>
          <button
            type="button"
            onClick={() => fetchCountries()}
            className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-primary-400 hover:text-primary-600 dark:border-slate-700 dark:bg-navy dark:text-slate-200 dark:hover:border-primary-500 dark:hover:text-primary-200"
          >
            Refresh
          </button>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/40 dark:text-red-200">
            <p className="font-semibold">We could not load countries.</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading &&
            Array.from({ length: FEATURED_COUNT }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white/60 shadow-sm dark:border-slate-800 dark:bg-navy/60"
              />
            ))}

          {!loading && !error && countries.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-navy/60 dark:text-slate-400">
              No countries available yet.
            </div>
          )}

          {!loading && !error &&
            countries.map((country) => (
              <MotionArticle
                key={country.id || country.code || country.name}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.02 }}
                className="group flex h-40 flex-col justify-between rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-navy/80"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 group-hover:text-primary-500 dark:text-slate-500 dark:group-hover:text-primary-300">
                      Country
                    </p>
                    <h3 className="text-xl font-bold text-navy transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-200">
                      {country.name || country.country || 'Unnamed country'}
                    </h3>
                    <p className="text-sm text-slate-500 dark:text-slate-300">
                      <span className="font-semibold text-primary-600 dark:text-primary-300">Code:</span>{' '}
                      {(country.code || 'N/A').toUpperCase()}
                    </p>
                  </div>
                  {country.flag ? (
                    <div className="h-14 w-20 overflow-hidden rounded-lg border border-slate-200 bg-white/80 shadow-sm dark:border-slate-700 dark:bg-navy/80">
                      <img
                        src={country.flag}
                        alt={`${country.name || country.country || 'Country'} flag`}
                        loading="lazy"
                        className="h-full w-full object-cover"
                        onError={handleFlagError}
                      />
                    </div>
                  ) : (
                    <div className="flex h-14 w-20 items-center justify-center rounded-lg border border-dashed border-slate-300 text-[10px] uppercase tracking-[0.3em] text-slate-400 dark:border-slate-600">
                      No flag
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
                  <span>#{String(country.id ?? '')}</span>
                  <span>{country.updated_at ? new Date(country.updated_at).toLocaleDateString() : 'Recently synced'}</span>
                </div>
              </MotionArticle>
            ))}
        </div>
      </section>
    </div>
  )
}
