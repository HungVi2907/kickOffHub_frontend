import { useEffect, useMemo, useState } from 'react'
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

function normaliseLeagues(payload = []) {
  return payload
    .map((entry) => ({
      id: entry?.id ?? null,
      name: entry?.name ?? 'Unknown league',
      type: entry?.type ?? 'League',
      logo: entry?.logo ?? '',
    }))
    .filter((entry) => entry.id !== null)
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

  const [availableLeagues, setAvailableLeagues] = useState([])
  const [leaguesLoading, setLeaguesLoading] = useState(false)
  const [leaguesError, setLeaguesError] = useState('')

  const [teams, setTeams] = useState([])
  const [teamsLoading, setTeamsLoading] = useState(false)
  const [teamsError, setTeamsError] = useState('')
  const [season, setSeason] = useState(null)
  const [availableSeasons, setAvailableSeasons] = useState([])
  const [seasonLoading, setSeasonLoading] = useState(false)
  const [seasonError, setSeasonError] = useState('')

  useEffect(() => {
    const controller = new AbortController()
    setSeasonLoading(true)
    setSeasonError('')

    apiClient
      .get('/seasons', { signal: controller.signal })
      .then((response) => {
        const collection = Array.isArray(response.data) ? response.data : response.data?.data || []
        const seasons = collection
          .map((entry) => Number(entry?.season ?? entry))
          .filter((value) => Number.isInteger(value))
        const uniqueSeasons = Array.from(new Set(seasons)).sort((a, b) => b - a)
        setAvailableSeasons(uniqueSeasons)

  if (uniqueSeasons.length === 0) return

        setSeason((current) => {
          if (current && uniqueSeasons.includes(current)) {
            return current
          }
          if (uniqueSeasons.includes(DEFAULT_SEASON)) {
            return DEFAULT_SEASON
          }
          return uniqueSeasons[0]
        })
      })
      .catch((err) => {
        if (axios.isCancel(err)) return
        const message =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Failed to load seasons list'
        setSeasonError(message)
      })
      .finally(() => {
        setSeasonLoading(false)
      })

    return () => controller.abort()
  }, [])

  useEffect(() => {
    if (!leagueId) {
      setLeague(null)
      setError('')
      return
    }
    if (numericLeagueId === null) {
      setLeague(null)
      setError('Invalid league identifier provided.')
    }
  }, [leagueId, numericLeagueId])

  useEffect(() => {
    const controller = new AbortController()
    setLeaguesLoading(true)
    setLeaguesError('')

    apiClient
      .get('/leagues', { signal: controller.signal })
      .then((response) => {
        const collection = Array.isArray(response.data) ? response.data : response.data?.data || []
        setAvailableLeagues(normaliseLeagues(collection))
      })
      .catch((err) => {
        if (axios.isCancel(err)) return
        const message =
          err.response?.data?.message ||
          err.response?.data?.error ||
          err.message ||
          'Failed to load leagues'
        setLeaguesError(message)
      })
      .finally(() => {
        setLeaguesLoading(false)
      })

    return () => controller.abort()
  }, [])

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
    if (numericLeagueId === null || season === null) {
      setTeams([])
      setTeamsError('')
      setTeamsLoading(false)
      return
    }

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
  const seasonLabel = season ?? 'N/A'

  return (
    <div className="space-y-10">
      {!numericLeagueId ? (
        <>
          <MotionSection
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-sm"
          >
            <div className="p-8">
              <header className="space-y-2">
                <h1 className="text-3xl font-bold text-black">Leagues</h1>
                <p className="text-sm text-slate-600">
                  Select a league to view its teams and seasons.
                </p>
              </header>
            </div>
          </MotionSection>

          <MotionSection
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-sm"
          >
            <div className="p-8">
              <h2 className="text-2xl font-semibold text-black mb-4">Available Seasons</h2>
              <div className="flex flex-wrap gap-2">
                {availableSeasons.map((seasonValue) => (
                  <span
                    key={seasonValue}
                    className="rounded-full bg-primary-100 px-3 py-1 text-sm font-medium text-primary-700"
                  >
                    {seasonValue}
                  </span>
                ))}
              </div>
            </div>
          </MotionSection>

          <section className="space-y-6">
            <div>
              <h2 className="text-2xl font-semibold text-black">All Leagues</h2>
              <p className="text-sm text-slate-600">
                Click on a league to view its details and teams.
              </p>
            </div>

            {leaguesError && (
              <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 text-sm text-red-700">
                <p className="font-semibold">Unable to load leagues.</p>
                <p className="mt-1">{leaguesError}</p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {leaguesLoading &&
                Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`league-skeleton-${index}`}
                    className="h-36 animate-pulse rounded-xl border border-slate-200 bg-white/60 shadow-sm"
                  />
                ))}

              {!leaguesLoading && !leaguesError && availableLeagues.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-sm text-slate-500">
                  No leagues found.
                </div>
              )}

              {!leaguesLoading && !leaguesError &&
                availableLeagues.map((league) => (
                  <MotionCard
                    key={league.id}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.02 }}
                    onClick={() => navigate(`/league/${league.id}`)}
                    className="group flex h-36 cursor-pointer flex-col justify-between rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white/90 shadow-sm">
                        {league.logo ? (
                          <img
                            src={league.logo}
                            alt={`${league.name} logo`}
                            loading="lazy"
                            onError={(event) => {
                              event.currentTarget.style.display = 'none'
                            }}
                            className="h-12 w-12 object-contain"
                          />
                        ) : (
                          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400">
                            League
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-semibold text-black transition-colors group-hover:text-primary-600">
                          {league.name}
                        </h3>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                          {league.type}
                        </p>
                      </div>
                    </div>
                  </MotionCard>
                ))}
            </div>
          </section>
        </>
      ) : (
        <>
          <MotionSection
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="overflow-hidden rounded-3xl border border-slate-200 bg-white/80 shadow-sm"
          >
            <div className="grid gap-8 p-8 md:grid-cols-[auto,1fr]">
              <div className="flex flex-col items-center justify-center gap-4">
                <div className="flex h-28 w-28 items-center justify-center overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-lg">
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
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                      League
                    </span>
                  )}
                </div>
                <div className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-primary-700">
                  {league?.type || 'League'}
                </div>
              </div>

              <div className="space-y-4">
                <header className="space-y-2">
                  <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">
                    Season {seasonLabel}
                  </p>
                  <h1 className="text-3xl font-bold text-black">
                    {loading && !league ? 'Loading league...' : league?.name || 'League details'}
                  </h1>
                </header>
                {error && !loading && (
                  <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 text-sm text-red-700">
                    <p className="font-semibold">We could not load the requested league.</p>
                    <p className="mt-1">{error}</p>
                  </div>
                )}
                {loading && !league && (
                  <div className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white/60" />
                )}
                {hasContent && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="rounded-xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                        League ID
                      </p>
                      <p className="mt-2 text-lg font-semibold text-black">{league.id}</p>
                    </div>
                    <div className="rounded-xl border border-slate-200 bg-white/80 p-4 text-sm text-slate-600 shadow-sm">
                      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
                        Updated at
                      </p>
                      <p className="mt-2 text-lg font-semibold text-black">
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
                <h2 className="text-2xl font-semibold text-black">Clubs</h2>
                <p className="text-sm text-slate-600text-slate-400">
                  Live roster sourced from the KickOff Hub API for the {seasonLabel} campaign.
                </p>
              </div>
            <div className="flex flex-col items-end gap-1 text-xs text-slate-500text-slate-400">
              <label htmlFor="league-season" className="text-[11px] uppercase tracking-[0.3em] text-slate-400text-slate-500">
                Season
              </label>
              <select
                id="league-season"
                value={season ?? ''}
                onChange={(event) => {
                  const { value: rawValue } = event.target
                  if (rawValue === '') {
                    setSeason(null)
                    return
                  }
                  const nextSeason = Number(rawValue)
                  setSeason(Number.isNaN(nextSeason) ? null : nextSeason)
                }}
                disabled={seasonLoading || availableSeasons.length === 0}
                className="w-32 rounded-lg border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-700 shadow-sm transition focus:border-primary-400 focus:outline-none focus:ring-2 focus:ring-primary-200 disabled:cursor-not-allowed disabled:bg-slate-100border-slate-700bg-navy/70text-slate-200focus:border-primary-500focus:ring-primary-500/40"
              >
                {availableSeasons.length === 0 ? (
                  <option value="">{seasonLoading ? 'Loading...' : 'No seasons'}</option>
                ) : (
                  availableSeasons.map((seasonValue) => (
                    <option key={seasonValue} value={seasonValue}>
                      {seasonValue}
                    </option>
                  ))
                )}
              </select>
              {seasonError && (
                <span className="text-[11px] text-red-500text-red-300">{seasonError}</span>
              )}
            </div>
            </div>

            {teamsError && (
              <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 text-sm text-red-700border-red-800bg-red-900/40text-red-200">
                <p className="font-semibold">Unable to load league squads.</p>
                <p className="mt-1">{teamsError}</p>
              </div>
            )}

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {teamsLoading &&
                Array.from({ length: 6 }).map((_, index) => (
                  <div
                    key={`team-skeleton-${index}`}
                    className="h-36 animate-pulse rounded-xl border border-slate-200 bg-white/60 shadow-smborder-slate-800bg-navy/60"
                  />
                ))}

              {!teamsLoading && !teamsError && season === null && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-sm text-slate-500border-slate-700bg-navy/60text-slate-400">
                  Select a season to view the league clubs.
                </div>
              )}

              {!teamsLoading && !teamsError && season !== null && teams.length === 0 && (
                <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-sm text-slate-500border-slate-700bg-navy/60text-slate-400">
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
                    className="group flex h-36 flex-col justify-between rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lgborder-slate-800bg-navy/80"
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white/90 shadow-smborder-slate-700bg-navy/90">
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
                          <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-slate-400text-slate-500">
                            Club
                          </span>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="truncate text-lg font-semibold text-black transition-colors group-hover:text-primary-600">
                          {team.name}
                        </h3>
                        <p className="text-xs uppercase tracking-[0.3em] text-slate-400text-slate-500">
                          {team.country || league?.name || 'Club'}
                        </p>
                      </div>
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500text-slate-400">
                      <span>Founded {team.founded || 'N/A'}</span>
                      <span>{team.venueName ? `${team.venueName}${team.venueCity ? ` - ${team.venueCity}` : ''}` : 'Venue TBD'}</span>
                    </div>
                  </MotionCard>
                ))}
            </div>
          </section>
        </>
      )}
    </div>
  )
}
