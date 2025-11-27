import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import apiClient from '../utils/apiClient'
import { Link } from 'react-router-dom'

const MotionSection = motion.section

export default function Teams() {
  const [leagues, setLeagues] = useState([])
  const [seasons, setSeasons] = useState([])
  const [teams, setTeams] = useState([])
  const [loadingTeams, setLoadingTeams] = useState(false)
  const [selectedLeague, setSelectedLeague] = useState('')
  const [selectedSeason, setSelectedSeason] = useState('')
  const [selectedTeam, setSelectedTeam] = useState(null)
  const [teamVenue, setTeamVenue] = useState(null)
  const [players, setPlayers] = useState([])
  const [loadingPlayers, setLoadingPlayers] = useState(false)
  const [popularTeams, setPopularTeams] = useState([])
  const [popularLoading, setPopularLoading] = useState(false)
  const [popularError, setPopularError] = useState(null)

  useEffect(() => {
    fetchInitialData()
  }, [])

  useEffect(() => {
    let ignore = false
    const fetchPopularTeams = async () => {
      setPopularLoading(true)
      setPopularError(null)
      try {
        const response = await apiClient.get('/teams/popular', { params: { page: 1, limit: 8 } })
        if (!ignore) {
          setPopularTeams(response.data?.data || [])
        }
      } catch (err) {
        if (!ignore) {
          setPopularError(err.response?.data?.error || 'Failed to load popular teams')
        }
      } finally {
        if (!ignore) {
          setPopularLoading(false)
        }
      }
    }

    fetchPopularTeams()
    return () => {
      ignore = true
    }
  }, [])

  useEffect(() => {
    // whenever league or season changes, reload teams list
    fetchTeams()
    setSelectedTeam(null)
    setTeamVenue(null)
    setPlayers([])
  }, [selectedLeague, selectedSeason])

  async function fetchInitialData() {
    try {
      const [sRes, lRes] = await Promise.all([apiClient.get('/seasons'), apiClient.get('/leagues')])
      setSeasons(Array.isArray(sRes.data) ? sRes.data : [])
      setLeagues(Array.isArray(lRes.data) ? lRes.data : [])
      // fetch teams default
      fetchTeams()
    } catch (err) {
      console.error('Failed to load initial data', err)
    }
  }

  async function fetchTeams() {
    setLoadingTeams(true)
    try {
      let res
      if (selectedLeague && selectedSeason) {
        res = await apiClient.get(`/leagues_teams_season/teams/leagues/${selectedLeague}/seasons/${selectedSeason}`)
        setTeams(Array.isArray(res.data) ? res.data : [])
      } else {
        res = await apiClient.get('/teams?limit=200')
        // endpoint returns { data: [...], pagination: { ... } }
        const data = res.data && res.data.data ? res.data.data : []
        setTeams(data)
      }
    } catch (err) {
      console.error('Failed to load teams', err)
      setTeams([])
    } finally {
      setLoadingTeams(false)
    }
  }

  async function handleSelectTeam(team) {
    setSelectedTeam(team)
    setTeamVenue(null)
    setPlayers([])

    try {
      // fetch fresh team detail (to ensure venue_id present)
      const tRes = await apiClient.get(`/teams/${team.id}`)
      const teamDetail = tRes.data || team
      setSelectedTeam(teamDetail)

      if (teamDetail.venue_id) {
        try {
          const vRes = await apiClient.get(`/venues/${teamDetail.venue_id}`)
          setTeamVenue(vRes.data)
        } catch (vErr) {
          console.warn('Failed to fetch venue', vErr)
        }
      }

      // fetch players if we have season + league
      if (selectedLeague && selectedSeason) {
        await fetchPlayers({ leagueId: selectedLeague, teamId: team.id, season: selectedSeason })
      }
    } catch (err) {
      console.error('Failed to load team details', err)
    }
  }

  async function fetchPlayers({ leagueId, teamId, season }) {
    setLoadingPlayers(true)
    try {
      const res = await apiClient.get('/player-team-league-season/players', {
        params: { leagueId, teamId, season }
      })
      // response may be { players: [...], total, filters } or direct array
      if (res.data && Array.isArray(res.data.players)) {
        setPlayers(res.data.players)
      } else if (Array.isArray(res.data)) {
        setPlayers(res.data)
      } else {
        setPlayers([])
      }
    } catch (err) {
      console.error('Failed to fetch players', err)
      setPlayers([])
    } finally {
      setLoadingPlayers(false)
    }
  }

  async function handleApplyFilters() {
    // fetch teams already triggered by effect; if a team selected and filters exist, refetch players
    if (selectedTeam && selectedLeague && selectedSeason) {
      fetchPlayers({ leagueId: selectedLeague, teamId: selectedTeam.id, season: selectedSeason })
    }
  }

  return (
    <MotionSection
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">Squads</p>
        <h1 className="text-3xl font-bold text-black">Team directory</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Browse teams, view venue details and players filtered by league & season.
        </p>
      </header>

      <section className="space-y-3 rounded-2xl border border-primary-100 bg-primary-50/70 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">Popular teams</p>
          <span className="text-sm text-primary-700/80">Community favourites highlighted here.</span>
        </div>
        {popularLoading && <p className="text-sm text-primary-700">Loading popular clubs...</p>}
        {popularError && <p className="text-sm text-red-500">{popularError}</p>}
        {!popularLoading && !popularError && popularTeams.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {popularTeams.map((team) => (
              <Link key={`popular-team-${team.id}`} to={`/teams/${team.id}`} className="group">
                <article className="flex items-center gap-3 rounded-2xl border border-primary-100 bg-white/90 p-3 shadow-sm transition hover:shadow-lg">
                  <img
                    src={team.logo || 'https://placehold.co/80x80?text=Team'}
                    alt={team.name}
                    className="h-16 w-16 rounded-full object-cover shadow-inner"
                  />
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-primary-600">{team.name}</h3>
                    <p className="text-sm text-slate-600">{team.country || 'Unknown country'}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-primary-500">Fan favourite</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
        {!popularLoading && !popularError && popularTeams.length === 0 && (
          <p className="text-sm text-slate-500">No clubs are marked popular yet.</p>
        )}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <section className="lg:col-span-2 space-y-4">
          <div className="flex gap-3 items-center">
            <select
              className="border rounded px-3 py-2"
              value={selectedLeague}
              onChange={(e) => setSelectedLeague(e.target.value)}
            >
              <option value="">All leagues</option>
              {leagues.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>

            <select
              className="border rounded px-3 py-2"
              value={selectedSeason}
              onChange={(e) => setSelectedSeason(e.target.value)}
            >
              <option value="">All seasons</option>
              {seasons.map((s) => (
                <option key={s.season} value={s.season}>{s.season}</option>
              ))}
            </select>

            <button
              className="ml-auto bg-primary-600 text-white px-3 py-2 rounded"
              onClick={handleApplyFilters}
            >Apply</button>
          </div>

          <div className="rounded-xl border bg-white p-4">
            {loadingTeams ? (
              <p className="text-sm text-slate-500">Loading teams…</p>
            ) : teams.length === 0 ? (
              <p className="text-sm text-slate-500">No teams found for selected filters.</p>
            ) : (
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {teams.map((t) => (
                  <li
                    key={t.id}
                    className={`flex items-center gap-3 p-3 rounded border cursor-pointer hover:bg-slate-50 ${selectedTeam && selectedTeam.id === t.id ? 'bg-slate-100' : ''}`}
                    onClick={() => handleSelectTeam(t)}
                  >
                    <img src={t.logo} alt="logo" className="w-10 h-10 object-contain" />
                    <div>
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="text-xs text-slate-500">{t.country}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <div className="rounded-xl border bg-white p-4">
            {selectedTeam ? (
              <div>
                <div className="flex items-start gap-4">
                  <img src={selectedTeam.logo} alt="team" className="w-16 h-16 object-contain" />
                  <div>
                    <h2 className="text-lg font-bold">{selectedTeam.name}</h2>
                    <div className="text-sm text-slate-600">{selectedTeam.country} • Founded {selectedTeam.founded}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <h3 className="font-semibold">Venue</h3>
                  {teamVenue ? (
                    <div className="text-sm text-slate-700">
                      <div className="font-medium">{teamVenue.name}</div>
                      <div className="text-xs text-slate-500">{teamVenue.city} • {teamVenue.address}</div>
                      <div className="text-xs text-slate-500">Capacity: {teamVenue.capacity || 'N/A'}</div>
                    </div>
                  ) : (
                    <div className="text-sm text-slate-500">No venue information available.</div>
                  )}
                </div>

                <div className="mt-3 flex gap-2">
                  <Link
                    to={selectedTeam ? `/teams/${selectedTeam.id}` : '#'}
                    className="text-sm bg-white border px-3 py-1 rounded shadow-sm"
                  >
                    Detail
                  </Link>
                </div>

                <div className="mt-4">
                  <h3 className="font-semibold">Players</h3>
                  <div className="text-xs text-slate-500 mb-2">Players are filtered by selected league and season.</div>
                  {(!selectedLeague || !selectedSeason) ? (
                    <div className="text-sm text-slate-500">Choose a league and season to load players.</div>
                  ) : loadingPlayers ? (
                    <div className="text-sm text-slate-500">Loading players…</div>
                  ) : players.length === 0 ? (
                    <div className="text-sm text-slate-500">No players found for this team in the selected season.</div>
                  ) : (
                    <ul className="space-y-2 max-h-60 overflow-auto">
                      {players.map((p) => (
                        <li key={p.playerId || (p.player && p.player.id)} className="text-sm">
                          <div className="font-medium">{(p.player && p.player.name) || p.name}</div>
                          <div className="text-xs text-slate-500">{(p.player && p.player.position) || p.position} • #{(p.player && p.player.number) || p.number || '—'}</div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            ) : (
              <div className="text-sm text-slate-500">Select a team to view details.</div>
            )}
          </div>
        </aside>
      </div>
    </MotionSection>
  )
}
