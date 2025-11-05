import { useCallback, useEffect, useMemo, useState } from 'react'
import axios from 'axios'
import { motion } from 'framer-motion'
import { useNavigate, useParams } from 'react-router-dom'
import apiClient from '../utils/apiClient.js'

const MotionSection = motion.section
const MotionCard = motion.article

const DEFAULT_SEASON = 2023

function normaliseTeams(payload = []) {
  return payload.map((entry) => {
    const team = entry?.team ?? entry
    const venue = entry?.venue ?? entry?.Venue ?? {}

    return {
      id: team?.id ?? entry?.id ?? null,
      name: team?.name ?? entry?.name ?? 'Unknown team',
      logo: team?.logo ?? entry?.logo ?? '',
      code: team?.code ?? entry?.code ?? '',
      country: team?.country ?? entry?.country ?? '',
      founded: team?.founded ?? entry?.founded ?? null,
      national: team?.national ?? entry?.national ?? false,
      venueName: venue?.name ?? entry?.venue_name ?? '',
      venueCity: venue?.city ?? entry?.city ?? '',
      venueCapacity: venue?.capacity ?? entry?.capacity ?? '',
    }
  })
}

export default function League() {
  const { leagueId } = useParams()
  const navigate = useNavigate()

  const numericLeagueId = useMemo(() => {
    if (!leagueId) return null
    const parsed = Number(leagueId)
    return Number.isFinite(parsed) ? parsed : null
  }, [leagueId])

  const [league, setLeague] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [teams, setTeams] = useState([])
  const [teamsLoading, setTeamsLoading] = useState(false)
  const [teamsError, setTeamsError] = useState('')
  const [season] = useState(DEFAULT_SEASON)

  const bootstrapDefaultLeague = useCallback(() => {
    const controller = new AbortController()
    setLoading(true)
    setError('')

    ;(async () => {
      try {
        const response = await apiClient.get('/leagues', { signal: controller.signal })
        const collection = Array.isArray(response.data) ? response.data : response.data?.data || []
        if (collection.length > 0) {
          navigate(`/league/${collection[0].id}`, { replace: true })
        } else {
          setError('No leagues available yet. Please import one to continue.')
        }
      } catch (err) {
        if (axios.isCancel(err)) return
        const message = err.response?.data?.message || err.message || 'Unable to load leagues'
        setError(message)
      } finally {
        setLoading(false)
      }
    })()

    return () => controller.abort()
  }, [navigate])

  useEffect(() => {
    if (!leagueId) {
      const cleanup = bootstrapDefaultLeague()
      return cleanup
    }
    if (numericLeagueId === null) {
      setError('Invalid league identifier provided.')
    }
    return undefined
  }, [bootstrapDefaultLeague, leagueId, numericLeagueId])

  useEffect(() => {
    if (numericLeagueId === null) return

    const controller = new AbortController()
    setLoading(true)
    setError('')
    setLeague(null)

    apiClient
      .get(`/leagues/${numericLeagueId}`, { signal: controller.signal })
      .then((response) => {
        setLeague(response.data)
      })
      .catch((err) => {
        if (axios.isCancel(err)) return
        const message = err.response?.data?.message || err.message || 'Failed to load league details'
        setError(message)
      })
      .finally(() => {
        setLoading(false)
      })

    return () => controller.abort()
  }, [numericLeagueId])

  useEffect(() => {
    if (numericLeagueId === null) return

    const controller = new AbortController()
    setTeamsLoading(true)
    setTeamsError('')
    setTeams([])

    apiClient
      .get(`/teams/league/${numericLeagueId}`, {
        signal: controller.signal,
        params: { season },
      })
      .then((response) => {
        const payload = Array.isArray(response.data)
          ? response.data
          : response.data?.data || []
        setTeams(normaliseTeams(payload))
      })
      .catch((err) => {
        if (axios.isCancel(err)) return
        const message = err.response?.data?.message || err.message || 'Failed to load league teams'
        setTeamsError(message)
      })
      .finally(() => {
        setTeamsLoading(false)
      })

    return () => controller.abort()
  }, [numericLeagueId, season])

  const hasContent = Boolean(league) && !loading && !error

  return (
    <div className="space-y-10">
      <MotionSection
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-sm dark:border-slate-800 dark:bg-navy/80"
      >
        <div className="grid gap-8 p-8 md:grid-cols-[auto,1fr]">
          <div className="flex flex-col items-center justify-center gap-4">
            <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg dark:border-slate-700 dark:bg-navy">
              {hasContent && league?.logo ? (
                <img
                  src={league.logo}
                  alt={`${league.name ?? 'League'} logo`}
                  className="h-24 w-24 object-contain"
                  loading="lazy"
                  onError={(event) => {
                    event.currentTarget.style.display = 'none'
                  }}
                />
              ) : (
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                  League
                </span>
              )}
            </div>
            <div className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary-700 dark:bg-primary-900/40 dark:text-primary-200">
              {league?.type || 'League'}
            </div>
          </div>

          <div className="space-y-4">
            <header className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">
                Season {season}
              </p>
              <h1 className="text-3xl font-bold text-navy dark:text-white">
                {loading && !league ? 'Loading league…' : league?.name || 'League details'}
              </h1>
            </header>
            {error && !loading && (
              <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/40 dark:text-red-200">
                <p className="font-semibold">We could not load the requested league.</p>
                <p className="mt-1">{error}</p>
              </div>
            )}
            {loading && !league && (
              <div className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white/60 dark:border-slate-700 dark:bg-navy/60" />
            )}
            {hasContent && (
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-navy/80 dark:text-slate-300">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                    League ID
                  </p>
                  <p className="mt-2 text-lg font-semibold text-navy dark:text-white">{league.id}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600 shadow-sm dark:border-slate-700 dark:bg-navy/80 dark:text-slate-300">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                    Updated at
                  </p>
                  <p className="mt-2 text-lg font-semibold text-navy dark:text-white">
                    {league.updated_at ? new Date(league.updated_at).toLocaleString() : 'Recently synced'}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      </MotionSection>

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-navy dark:text-white">Clubs</h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Live roster sourced from the KickOff Hub API for the {season} campaign.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-slate-500">
            <span>Season</span>
            <span className="rounded-full bg-white/70 px-3 py-1 font-semibold text-slate-700 shadow-sm dark:bg-navy/60 dark:text-slate-200">
              {season}
            </span>
          </div>
        </div>

        {teamsError && (
          <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 text-sm text-red-700 dark:border-red-800 dark:bg-red-900/40 dark:text-red-200">
            <p className="font-semibold">Unable to load league squads.</p>
            <p className="mt-1">{teamsError}</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {teamsLoading &&
            Array.from({ length: 6 }).map((_, index) => (
              <div
                key={`team-skeleton-${index}`}
                className="h-36 animate-pulse rounded-xl border border-slate-200 bg-white/60 shadow-sm dark:border-slate-800 dark:bg-navy/60"
              />
            ))}

          {!teamsLoading && !teamsError && teams.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-sm text-slate-500 dark:border-slate-700 dark:bg-navy/60 dark:text-slate-400">
              No clubs found for this league and season yet.
            </div>
          )}

          {!teamsLoading && !teamsError &&
            teams.map((team) => (
              <MotionCard
                key={team.id || team.name}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.02 }}
                className="group flex h-36 flex-col justify-between rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg dark:border-slate-800 dark:bg-navy/80"
              >
                <div className="flex items-start gap-4">
                  <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white/90 shadow-sm dark:border-slate-700 dark:bg-navy/90">
                    {team.logo ? (
                      <img
                        src={team.logo}
                        alt={`${team.name} logo`}
                        loading="lazy"
                        onError={(event) => {
                          event.currentTarget.style.display = 'none'
                        }}
                        className="h-12 w-12 object-contain"
                      />
                    ) : (
                      <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                        Club
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-lg font-semibold text-navy transition-colors group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-200">
                      {team.name}
                    </h3>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400 dark:text-slate-500">
                      {team.country || league?.name || 'Club'}
                    </p>
                  </div>
                </div>
                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
                  <span>Founded {team.founded || '—'}</span>
                  <span>{team.venueName ? `${team.venueName}${team.venueCity ? ` · ${team.venueCity}` : ''}` : 'Venue TBD'}</span>
                </div>
              </MotionCard>
            ))}
        </div>
      </section>
    </div>
  )
}
