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
  const [totalCountries, setTotalCountries] = useState(null)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const totalCountriesLabel = Number.isFinite(totalCountries)
    ? new Intl.NumberFormat().format(totalCountries)
    : '—'
  const [leagues, setLeagues] = useState([])
  const [leagueLoading, setLeagueLoading] = useState(false)
  const [leagueError, setLeagueError] = useState('')
  // The component previously referenced `searchType`, `isSearching` and `activeSearch`
  // in the JSX but those variables were not declared which caused a runtime
  // ReferenceError and prevented the Home page from rendering. Provide
  // sensible defaults so the component can render even if the search UI is
  // not present or wired up yet.
  const [searchType] = useState('countries')
  const [isSearching] = useState(false)
  const [activeSearch] = useState('')

  const fetchData = useCallback(
    async ({ signal } = {}) => {
      setLoading(true)
      setError('')
      try {
        const response = await apiClient.get('/countries', {
          signal,
          params: { page, limit: FEATURED_COUNT },
        })
        const rawData = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
          ? response.data.data
          : []
        setCountries(rawData)
        const pagination = response.data?.pagination || {}
        const totalItems = Number.parseInt(pagination.totalItems, 10)
        const totalPagesFromResponse = Number.parseInt(pagination.totalPages, 10)
        const pageFromResponse = Number.parseInt(pagination.page, 10)

        setTotalCountries((previous) => {
          if (Number.isFinite(totalItems)) {
            return totalItems
          }
          return Number.isFinite(previous) ? previous : rawData.length
        })
        if (Number.isFinite(totalPagesFromResponse) && totalPagesFromResponse > 0) {
          setTotalPages(totalPagesFromResponse)
        } else {
          setTotalPages(1)
        }
        if (Number.isFinite(pageFromResponse) && pageFromResponse > 0) {
          setPage((prevPage) => (prevPage === pageFromResponse ? prevPage : pageFromResponse))
        }
      } catch (err) {
        if (axios.isCancel(err)) return
        const message = err.response?.data?.message || err.message || 'Failed to load data'
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    [page],
  )

  const canGoPrev = page > 1
  const canGoNext = page < totalPages

  const handlePrevPage = () => {
    if (!canGoPrev) {
      return
    }
    setPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    if (!canGoNext) {
      return
    }
    setPage((prev) => prev + 1)
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchData({ signal: controller.signal })
    return () => controller.abort()
  }, [fetchData])

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
        className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur"
      >
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">
              KickOff Hub
            </p>
            <h1 className="text-4xl font-black tracking-tight text-black sm:text-5xl">
              The modern football reference experience
            </h1>
            <p className="text-base text-slate-600">
              Explore clubs, competitions, and national teams with a clean interface inspired by
              fbref.com, powered entirely by the KickOff Hub API.
            </p>
          </div>
            <div className="flex flex-col gap-3 rounded-2xl border border-primary-200 bg-primary-50 px-6 py-5 text-primary-800 shadow-inner">
              <span className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">
              API Snapshot
            </span>
            <p className="text-3xl font-bold">{totalCountriesLabel} Countries</p>
            <p className="text-sm leading-relaxed text-primary-700">
              Start browsing the full list below. Premier League league and team hubs are around the
              corner.
            </p>
          </div>
        </div>
  </MotionSection>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-black">Featured leagues</h2>
            <p className="text-sm text-slate-600text-slate-400">
              Listing all competitions currently available in your KickOff Hub database.
            </p>
          </div>
          <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700bg-primary-900/40text-primary-200">
            {leagues.length} league{leagues.length === 1 ? '' : 's'}
          </span>
        </div>

        {leagueError && (
          <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 text-sm text-red-700border-red-800bg-red-900/40text-red-200">
            <p className="font-semibold">We could not load leagues.</p>
            <p className="mt-1">{leagueError}</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leagueLoading &&
            Array.from({ length: Math.max(leagues.length || 1, 1) }).map((_, index) => (
              <div
                key={`league-skeleton-${index}`}
                className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white/60 shadow-smborder-slate-800bg-navy/60"
              />
            ))}

          {!leagueLoading && !leagueError && leagues.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-sm text-slate-500border-slate-700bg-navy/60text-slate-400">
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
                className="group flex h-32 flex-col justify-between rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400border-slate-800bg-navy/80"
              >
                <div className="flex items-center gap-4">
                  {league.logo ? (
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white/80 shadow-smborder-slate-700bg-navy/80">
                      <img
                        src={league.logo}
                        alt={`${league.name || 'League'} logo`}
                        loading="lazy"
                        onError={handleLeagueLogoError}
                        className="h-10 w-10 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-slate-300 text-[10px] uppercase tracking-[0.3em] text-slate-400border-slate-600">
                      No logo
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-black transition-colors group-hover:text-primary-600">
                      {league.name || 'Unnamed league'}
                    </h3>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400text-slate-500">
                      {league.type || 'League'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400text-slate-500">
                  <span>ID: {league.id ?? 'N/A'}</span>
                  <span>{league.updated_at ? new Date(league.updated_at).toLocaleDateString() : 'Recently synced'}</span>
                </div>
              </MotionLink>
            ))}
        </div>
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-black">Featured countries</h2>
          </div>
          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
            <button
              type="button"
              onClick={() => fetchData()}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-primary-400 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              Refresh
            </button>
          </div>
        </div>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 text-sm text-red-700">
            <p className="font-semibold">We could not load {searchType}.</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {loading &&
            Array.from({ length: FEATURED_COUNT }).map((_, index) => (
              <div
                key={`skeleton-${index}`}
                className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white/60 shadow-sm"
              />
            ))}

          {!loading && !error && countries.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-sm text-slate-500">
              {isSearching
                ? `No ${searchType} match "${activeSearch}".`
                : `No ${searchType} available yet.`}
            </div>
          )}

          {!loading && !error &&
            countries.map((item) => {
              if (searchType === 'players') {
                return (
                  <Link key={item.id} to={`/players/${item.id}`}>
                    <MotionArticle
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.02 }}
                      className="group flex h-40 flex-col justify-between rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-2">
                          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 group-hover:text-primary-500">
                            Player
                          </p>
                          <h3 className="text-xl font-bold text-black transition-colors group-hover:text-primary-600">
                            {item.name || 'Unnamed player'}
                          </h3>
                          <p className="text-sm text-slate-500">
                            <span className="font-semibold text-primary-600">Position:</span> {item.position || 'N/A'}
                          </p>
                        </div>
                        {item.photo && (
                          <div className="h-14 w-14 overflow-hidden rounded-full border border-slate-200 bg-white/80 shadow-sm">
                            <img
                              src={item.photo}
                              alt={item.name}
                              loading="lazy"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>#{String(item.id ?? '')}</span>
                        <span>{item.nationality || 'N/A'}</span>
                      </div>
                    </MotionArticle>
                  </Link>
                )
              } else if (searchType === 'teams') {
                return (
                  <Link key={item.id} to={`/teams/${item.id}`}>
                    <MotionArticle
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: 0.02 }}
                      className="group flex h-40 flex-col justify-between rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg cursor-pointer"
                    >
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 group-hover:text-primary-500">
                          Team
                        </p>
                        <h3 className="text-xl font-bold text-black transition-colors group-hover:text-primary-600">
                          {item.name || 'Unnamed team'}
                        </h3>
                        <p className="text-sm text-slate-500">
                          <span className="font-semibold text-primary-600">Country:</span> {item.country || 'N/A'}
                        </p>
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>#{String(item.id ?? '')}</span>
                        <span>{item.founded || 'N/A'}</span>
                      </div>
                    </MotionArticle>
                  </Link>
                )
              } else {
                // Countries
                return (
                  <MotionArticle
                    key={item.id || item.code || item.name}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.02 }}
                    className="group flex h-40 flex-col justify-between rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-2">
                        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 group-hover:text-primary-500">
                          Country
                        </p>
                        <h3 className="text-xl font-bold text-black transition-colors group-hover:text-primary-600">
                          {item.name || item.country || 'Unnamed country'}
                        </h3>
                        <p className="text-sm text-slate-500">
                          <span className="font-semibold text-primary-600">Code:</span>{' '}
                          {(item.code || 'N/A').toUpperCase()}
                        </p>
                      </div>
                      {item.flag ? (
                        <div className="h-14 w-20 overflow-hidden rounded-lg border border-slate-200 bg-white/80 shadow-sm">
                          <img
                            src={item.flag}
                            alt={`${item.name || item.country || 'Country'} flag`}
                            loading="lazy"
                            className="h-full w-full object-cover"
                            onError={handleFlagError}
                          />
                        </div>
                      ) : (
                        <div className="flex h-14 w-20 items-center justify-center rounded-lg border border-dashed border-slate-300 text-[10px] uppercase tracking-[0.3em] text-slate-400">
                          No flag
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span>#{String(item.id ?? '')}</span>
                      <span>{item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'Recently synced'}</span>
                    </div>
                  </MotionArticle>
                )
              }
            })}
        </div>

        {!isSearching && totalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm shadow-sm">
            <span className="text-slate-600text-slate-300">
              Page {page} of {totalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevPage}
                disabled={!canGoPrev || loading}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 font-medium text-slate-600 transition hover:border-primary-400 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-60border-slate-700bg-navytext-slate-200hover:border-primary-500hover:text-primary-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5 8.25 12l7.5-7.5" />
                </svg>
                <span>Previous</span>
              </button>
              <button
                type="button"
                onClick={handleNextPage}
                disabled={!canGoNext || loading}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 font-medium text-slate-600 transition hover:border-primary-400 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-60border-slate-700bg-navytext-slate-200hover:border-primary-500hover:text-primary-200"
              >
                <span>Next</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="h-4 w-4"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  )
}
