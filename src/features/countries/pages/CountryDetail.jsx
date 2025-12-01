import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Card, { CardContent } from '@/shared/components/ui/Card.jsx'
import Skeleton from '@/shared/components/ui/Skeleton.jsx'
import { ROUTES } from '@/app/paths.js'
import countryApi from '@/features/countries/api.js'
import teamApi from '@/features/teams/api.js'
import playerApi from '@/features/players/api.js'
import { withFallback } from '@/shared/utils/img.js'
import getApiErrorMessage from '@/shared/utils/getApiErrorMessage.js'

const MotionSection = motion.section

const toArray = (payload) => {
  const base = payload?.data ?? payload ?? []
  if (Array.isArray(base)) return base
  if (Array.isArray(base?.data)) return base.data
  if (Array.isArray(base?.results)) return base.results
  if (Array.isArray(payload?.results)) return payload.results
  return []
}

export default function CountryDetailPage() {
  const { countryId } = useParams()
  const [countryState, setCountryState] = useState({ data: null, loading: true, error: null })
  const [leaguesState, setLeaguesState] = useState({ data: [], loading: false, error: null })
  const [playersState, setPlayersState] = useState({ data: [], loading: false, error: null })

  // Reset all states when countryId changes
  useEffect(() => {
    setCountryState({ data: null, loading: true, error: null })
    setLeaguesState({ data: [], loading: false, error: null })
    setPlayersState({ data: [], loading: false, error: null })
  }, [countryId])

  useEffect(() => {
    if (!countryId) return

    let isActive = true
    setCountryState((prev) => ({ ...prev, loading: true, error: null }))

    countryApi
      .detail(countryId)
      .then((response) => {
        if (!isActive) return
        const data = response?.data ?? response
        setCountryState({ data, loading: false, error: null })
      })
      .catch((error) => {
        if (!isActive) return
        setCountryState({ data: null, loading: false, error: getApiErrorMessage(error) })
      })

    return () => {
      isActive = false
    }
  }, [countryId])

  useEffect(() => {
    // Only fetch leagues when country data is available
    if (!countryState.data?.name) return

    let isActive = true
    setLeaguesState((prev) => ({ ...prev, loading: true, error: null }))

    teamApi
      .leagues()
      .then((response) => {
        if (!isActive) return
        const allLeagues = response?.data ?? response ?? []
        const list = Array.isArray(allLeagues) ? allLeagues : allLeagues?.data ?? []
        // Filter leagues by country name or code
        const countryName = countryState.data?.name?.toLowerCase() || ''
        const countryCode = countryState.data?.code?.toLowerCase() || ''
        const filtered = list.filter((league) => {
          const leagueCountry = (league.country || '').toLowerCase()
          return leagueCountry === countryName || leagueCountry === countryCode
        })
        setLeaguesState({ data: filtered, loading: false, error: null })
      })
      .catch((error) => {
        if (!isActive) return
        setLeaguesState({ data: [], loading: false, error: getApiErrorMessage(error) })
      })

    return () => {
      isActive = false
    }
  }, [countryState.data])

  useEffect(() => {
    // Only fetch players when country data is available
    if (!countryState.data?.name) return

    let isActive = true
    setPlayersState((prev) => ({ ...prev, loading: true, error: null }))

    playerApi
      .list({ nationality: countryState.data.name, limit: 12 })
      .then((response) => {
        if (!isActive) return
        const players = toArray(response)
        setPlayersState({ data: players, loading: false, error: null })
      })
      .catch((error) => {
        if (!isActive) return
        setPlayersState({ data: [], loading: false, error: getApiErrorMessage(error) })
      })

    return () => {
      isActive = false
    }
  }, [countryState.data])

  const country = countryState.data

  if (countryState.loading) {
    return (
      <MotionSection
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </MotionSection>
    )
  }

  if (countryState.error) {
    return (
      <MotionSection
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <Link to={ROUTES.countries} className="text-sm font-semibold text-primary-600 hover:underline">
          ← Back to countries
        </Link>
        <p className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-600">
          {countryState.error}
        </p>
      </MotionSection>
    )
  }

  if (!country) {
    return (
      <MotionSection
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="space-y-6"
      >
        <Link to={ROUTES.countries} className="text-sm font-semibold text-primary-600 hover:underline">
          ← Back to countries
        </Link>
        <p className="text-sm text-slate-500">Country not found.</p>
      </MotionSection>
    )
  }

  return (
    <MotionSection
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <header className="space-y-2">
        <Link to={ROUTES.countries} className="text-sm font-semibold text-primary-600 hover:underline">
          ← Back to countries
        </Link>
        <h1 className="text-3xl font-bold text-slate-900">{country.name}</h1>
      </header>

      <Card className="p-6">
        <div className="flex flex-wrap items-start gap-6">
          {country.flag ? (
            <img
              src={withFallback(country.flag)}
              alt={country.name}
              className="h-24 w-36 rounded-xl object-cover shadow-sm"
            />
          ) : (
            <div className="flex h-24 w-36 items-center justify-center rounded-xl border border-dashed border-slate-300 text-xs uppercase tracking-[0.3em] text-slate-400">
              No flag
            </div>
          )}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">Country</p>
            <h2 className="text-2xl font-bold text-slate-900">{country.name}</h2>
            <p className="text-sm text-slate-600">
              Code: <span className="font-semibold">{(country.code || 'N/A').toUpperCase()}</span>
            </p>
          </div>
        </div>
      </Card>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Leagues in {country.name}</h2>
          <p className="text-sm text-slate-500">Competitions and leagues associated with this country.</p>
        </div>

        {leaguesState.loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, index) => (
              <Card key={`league-skeleton-${index}`} className="border-slate-200 bg-white/70">
                <CardContent>
                  <Skeleton className="mb-2 h-5 w-24" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {leaguesState.error && (
          <p className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-600">
            {leaguesState.error}
          </p>
        )}

        {!leaguesState.loading && !leaguesState.error && leaguesState.data.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-4 py-3 text-sm text-slate-500">
            No leagues found for this country.
          </p>
        )}

        {!leaguesState.loading && !leaguesState.error && leaguesState.data.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {leaguesState.data.map((league) => (
              <Link
                to={`${ROUTES.league}/${league.id ?? ''}`}
                key={league.id || league.name}
                className="group rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary-300 hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  {league.logo ? (
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white">
                      <img src={withFallback(league.logo)} alt={league.name} className="h-10 w-10 object-contain" />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-slate-300 text-[10px] uppercase tracking-[0.3em] text-slate-400">
                      N/A
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">League</p>
                    <h3 className="text-lg font-semibold text-slate-900 transition-colors group-hover:text-primary-600">
                      {league.name || 'Unnamed league'}
                    </h3>
                    <p className="text-sm text-slate-500">{league.type || 'Competition'}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-semibold text-slate-900">Players from {country.name}</h2>
          <p className="text-sm text-slate-500">Football players with {country.name} nationality.</p>
        </div>

        {playersState.loading && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card key={`player-skeleton-${index}`} className="border-slate-200 bg-white/70">
                <CardContent>
                  <Skeleton className="mb-2 h-5 w-24" />
                  <Skeleton className="h-4 w-32" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {playersState.error && (
          <p className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-600">
            {playersState.error}
          </p>
        )}

        {!playersState.loading && !playersState.error && playersState.data.length === 0 && (
          <p className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-4 py-3 text-sm text-slate-500">
            No players found from this country.
          </p>
        )}

        {!playersState.loading && !playersState.error && playersState.data.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {playersState.data.map((player) => (
              <Link
                to={`${ROUTES.players}/${player.id ?? ''}`}
                key={player.id || player.name}
                className="group rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary-300 hover:shadow-lg"
              >
                <div className="flex items-center gap-4">
                  {player.photo ? (
                    <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white">
                      <img src={withFallback(player.photo)} alt={player.name} className="h-12 w-12 rounded-full object-cover" />
                    </div>
                  ) : (
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-slate-300 text-[10px] uppercase tracking-[0.3em] text-slate-400">
                      N/A
                    </div>
                  )}
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400">Player</p>
                    <h3 className="text-lg font-semibold text-slate-900 transition-colors group-hover:text-primary-600">
                      {player.name || 'Unknown player'}
                    </h3>
                    <p className="text-sm text-slate-500">{player.position || 'Position N/A'}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </MotionSection>
  )
}
