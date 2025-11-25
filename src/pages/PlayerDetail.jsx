import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import apiClient from '../utils/apiClient.js'

const MotionSection = motion.section

const StatTile = ({ label, value, subtext }) => (
  <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm">
    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{label}</p>
    <p className="text-2xl font-bold text-slate-900">{value ?? '—'}</p>
    {subtext && <p className="text-sm text-slate-500">{subtext}</p>}
  </div>
)

export default function PlayerDetail() {
  const { id } = useParams()
  const [player, setPlayer] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [playerStats, setPlayerStats] = useState([])
  const [statsLoading, setStatsLoading] = useState(false)
  const [statsError, setStatsError] = useState(null)
  const [statsFilters, setStatsFilters] = useState(() => ({ season: '', leagueid: '', teamid: '' }))

  useEffect(() => {
    const fetchPlayer = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await apiClient.get(`/players/${id}`)
        setPlayer(response.data)
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch player details')
      } finally {
        setLoading(false)
      }
    }

    if (id) {
      fetchPlayer()
    }
  }, [id])

  const fetchPlayerStats = async (filters) => {
    if (!id) return
    setStatsLoading(true)
    setStatsError(null)
    try {
      const params = { playerid: id }
      const activeFilters = filters ?? statsFilters
      if (activeFilters.season) params.season = activeFilters.season
      if (activeFilters.leagueid) params.leagueid = activeFilters.leagueid
      if (activeFilters.teamid) params.teamid = activeFilters.teamid

      const response = await apiClient.get('/players-stats', { params })
      const payload = response.data?.data?.response || []
      const stats = payload.length ? payload[0].statistics || [] : []
      setPlayerStats(stats)
    } catch (err) {
      setPlayerStats([])
      setStatsError(err.response?.data?.error || 'Failed to load player stats')
    } finally {
      setStatsLoading(false)
    }
  }

  useEffect(() => {
    if (!id) return
    const baseline = { season: '', leagueid: '', teamid: '' }
    setStatsFilters(baseline)
    fetchPlayerStats(baseline)
  }, [id])

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setStatsFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleStatsSubmit = (event) => {
    event.preventDefault()
    fetchPlayerStats(statsFilters)
  }

  const handleResetFilters = () => {
    const reset = { season: '', leagueid: '', teamid: '' }
    setStatsFilters(reset)
    fetchPlayerStats(reset)
  }

  if (loading) return <p className="text-center text-slate-500">Loading...</p>
  if (error) return <p className="text-center text-red-500">{error}</p>
  if (!player) return <p className="text-center text-slate-500">Player not found</p>

  const nationalityLabel = player.country?.name || player.nationality || 'Unknown'
  const flagUrl = player.country?.flag

  return (
    <MotionSection
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-8"
    >
      <header className="space-y-2">
        <Link to="/players" className="text-sm text-primary-500 hover:underline">
          ← Back to Players
        </Link>
        <h1 className="text-3xl font-bold text-black">{player.name}</h1>
        <p className="text-sm text-slate-500">ID #{player.id}</p>
      </header>

      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
        <div className="flex flex-col items-center space-y-4 md:flex-row md:items-center md:space-x-6 md:space-y-0">
          {player.photo && (
            <img src={player.photo} alt={player.name} className="h-32 w-32 rounded-full object-cover shadow-lg" />
          )}
          <div className="space-y-2 text-center md:text-left">
            <p className="text-xl font-semibold text-slate-900">{player.name}</p>
            {player.firstname && <p className="text-sm text-slate-600">Firstname: {player.firstname}</p>}
            {player.lastname && <p className="text-sm text-slate-600">Lastname: {player.lastname}</p>}
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-600 md:justify-start">
              <span className="font-semibold text-slate-900">Nationality:</span>
              {flagUrl && <img src={flagUrl} alt={nationalityLabel} className="h-4 w-6 rounded object-cover" />}
              <span>{nationalityLabel}</span>
            </div>
            <dl className="grid grid-cols-2 gap-3 text-sm text-slate-600 sm:grid-cols-3">
              {player.age && (
                <div>
                  <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">Age</dt>
                  <dd className="font-semibold text-slate-900">{player.age}</dd>
                </div>
              )}
              {player.position && (
                <div>
                  <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">Position</dt>
                  <dd className="font-semibold text-slate-900">{player.position}</dd>
                </div>
              )}
              {player.number && (
                <div>
                  <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">Number</dt>
                  <dd className="font-semibold text-slate-900">{player.number}</dd>
                </div>
              )}
              {player.height && (
                <div>
                  <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">Height</dt>
                  <dd className="font-semibold text-slate-900">{player.height}</dd>
                </div>
              )}
              {player.weight && (
                <div>
                  <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">Weight</dt>
                  <dd className="font-semibold text-slate-900">{player.weight}</dd>
                </div>
              )}
              {player.birth_date && (
                <div>
                  <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">Birth date</dt>
                  <dd className="font-semibold text-slate-900">{player.birth_date}</dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Performance stats</p>
            <h2 className="text-2xl font-bold text-slate-900">Season drill-down</h2>
            <p className="text-sm text-slate-500">
              Adjust the filters to retrieve official API-Football statistics for this player.
            </p>
          </div>
          <form onSubmit={handleStatsSubmit} className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4 lg:items-end">
            <label className="text-sm text-slate-600">
              Season
              <input
                type="number"
                name="season"
                value={statsFilters.season}
                onChange={handleFilterChange}
                placeholder="2021"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </label>
            <label className="text-sm text-slate-600">
              League ID
              <input
                type="number"
                name="leagueid"
                value={statsFilters.leagueid}
                onChange={handleFilterChange}
                placeholder="39"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </label>
            <label className="text-sm text-slate-600">
              Team ID
              <input
                type="number"
                name="teamid"
                value={statsFilters.teamid}
                onChange={handleFilterChange}
                placeholder="33"
                className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
              />
            </label>
            <div className="flex items-center gap-2">
              <button
                type="submit"
                className="flex-1 rounded-2xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-primary-500"
              >
                Refresh stats
              </button>
              <button
                type="button"
                onClick={handleResetFilters}
                className="rounded-2xl border border-slate-300 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500"
              >
                Clear
              </button>
            </div>
          </form>
        </div>

        {statsLoading && <p className="text-sm text-slate-500">Loading match data...</p>}
        {statsError && <p className="text-sm text-red-500">{statsError}</p>}
        {!statsLoading && !statsError && playerStats.length === 0 && (
          <p className="text-sm text-slate-500">No statistics available for the selected filters.</p>
        )}

        {!statsLoading && !statsError && playerStats.length > 0 && (
          <div className="space-y-6">
            {playerStats.map((stat, index) => (
              <article
                key={`${stat.league?.id ?? 'league'}-${stat.team?.id ?? 'team'}-${index}`}
                className="space-y-4 rounded-3xl border border-slate-200 bg-white/90 p-5 shadow-sm"
              >
                <div className="flex flex-wrap items-center gap-4">
                  {stat.team?.logo && (
                    <img src={stat.team.logo} alt={stat.team.name} className="h-14 w-14 rounded-full border border-slate-200 bg-white object-cover" />
                  )}
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-primary-500">
                      {stat.league?.name || 'League'}
                    </p>
                    <h3 className="text-xl font-semibold text-slate-900">{stat.team?.name || 'Team data'}</h3>
                    <p className="text-sm text-slate-500">
                      Season {stat.league?.season ?? statsFilters.season ?? '—'} • {stat.games?.position || player.position || 'Unknown role'}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 md:grid-cols-3">
                  <StatTile
                    label="Appearances"
                    value={stat.games?.appearences ?? '—'}
                    subtext={`Minutes: ${stat.games?.minutes ?? 0}`}
                  />
                  <StatTile
                    label="Rating"
                    value={stat.games?.rating ? Number(stat.games.rating).toFixed(2) : '—'}
                    subtext={`Lineups: ${stat.games?.lineups ?? 0}`}
                  />
                  <StatTile
                    label="Goals"
                    value={stat.goals?.total ?? 0}
                    subtext={`Assists: ${stat.goals?.assists ?? 0}`}
                  />
                  <StatTile
                    label="Shots"
                    value={stat.shots?.total ?? 0}
                    subtext={`On target: ${stat.shots?.on ?? 0}`}
                  />
                  <StatTile
                    label="Passing"
                    value={stat.passes?.total ?? 0}
                    subtext={`Key: ${stat.passes?.key ?? 0}`}
                  />
                  <StatTile
                    label="Dribbles"
                    value={stat.dribbles?.attempts ?? 0}
                    subtext={`Success: ${stat.dribbles?.success ?? 0}`}
                  />
                  <StatTile
                    label="Duels"
                    value={stat.duels?.total ?? 0}
                    subtext={`Won: ${stat.duels?.won ?? 0}`}
                  />
                  <StatTile
                    label="Defensive actions"
                    value={stat.tackles?.total ?? 0}
                    subtext={`Interceptions: ${stat.tackles?.interceptions ?? 0}`}
                  />
                  <StatTile
                    label="Cards"
                    value={`🟨 ${stat.cards?.yellow ?? 0} • 🟥 ${stat.cards?.red ?? 0}`}
                    subtext={`Fouls: Drawn ${stat.fouls?.drawn ?? 0} / Committed ${stat.fouls?.committed ?? 0}`}
                  />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </MotionSection>
  )
}