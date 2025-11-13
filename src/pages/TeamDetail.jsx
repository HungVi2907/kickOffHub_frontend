import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import apiClient from '../utils/apiClient'

export default function TeamDetail() {
  const { teamId } = useParams()
  const [team, setTeam] = useState(null)
  const [venue, setVenue] = useState(null)
  const [seasons, setSeasons] = useState([])
  const [leagues, setLeagues] = useState([])
  const [selectedSeason, setSelectedSeason] = useState('')
  const [selectedLeague, setSelectedLeague] = useState('')
  const [players, setPlayers] = useState([])
  const [loadingPlayers, setLoadingPlayers] = useState(false)

  useEffect(() => {
    fetchTeam()
    fetchLists()
  }, [teamId])

  async function fetchLists() {
    try {
      const [sRes, lRes] = await Promise.all([apiClient.get('/seasons'), apiClient.get('/leagues')])
      setSeasons(Array.isArray(sRes.data) ? sRes.data : [])
      setLeagues(Array.isArray(lRes.data) ? lRes.data : [])
      if (Array.isArray(sRes.data) && sRes.data.length > 0) setSelectedSeason(sRes.data[0].season)
    } catch (err) {
      console.error('Failed to load seasons/leagues', err)
    }
  }

  async function fetchTeam() {
    try {
      const res = await apiClient.get(`/teams/${teamId}`)
      setTeam(res.data)
      if (res.data && res.data.venue_id) {
        try {
          const vRes = await apiClient.get(`/venues/${res.data.venue_id}`)
          setVenue(vRes.data)
        } catch (vErr) {
          console.warn('Failed to load venue', vErr)
        }
      }
    } catch (err) {
      console.error('Failed to load team', err)
    }
  }

  async function fetchPlayers() {
    if (!selectedLeague || !selectedSeason) return
    setLoadingPlayers(true)
    try {
      const res = await apiClient.get('/player-team-league-season/players', {
        params: { leagueId: selectedLeague, teamId, season: selectedSeason }
      })
      // endpoint returns { players: [...] } or array
      if (res.data && Array.isArray(res.data.players)) setPlayers(res.data.players)
      else if (Array.isArray(res.data)) setPlayers(res.data)
      else setPlayers([])
    } catch (err) {
      console.error('Failed to load players', err)
      setPlayers([])
    } finally {
      setLoadingPlayers(false)
    }
  }

  useEffect(() => {
    // refetch players when league/season changes
    fetchPlayers()
  }, [selectedLeague, selectedSeason])

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/teams" className="text-sm text-primary-600">← Back to teams</Link>
        <h1 className="text-2xl font-bold">Team detail</h1>
      </div>

      {team ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="rounded-xl border bg-white p-4">
              <div className="flex items-start gap-4">
                <img src={team.logo} alt="team" className="w-20 h-20 object-contain" />
                <div>
                  <h2 className="text-xl font-bold">{team.name}</h2>
                  <div className="text-sm text-slate-600">{team.country} • Founded {team.founded}</div>
                </div>
              </div>

              <div className="mt-4">
                <h3 className="font-semibold">Venue</h3>
                {venue ? (
                  <div className="mt-2">
                    {venue.image ? (
                      <img src={venue.image} alt={venue.name} className="w-full max-h-80 object-cover rounded" />
                    ) : (
                      <div className="w-full h-48 bg-slate-100 flex items-center justify-center">No image available</div>
                    )}

                    <div className="mt-2 text-sm text-slate-700">
                      <div className="font-medium">{venue.name}</div>
                      <div className="text-xs text-slate-500">{venue.city} • {venue.address}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-slate-500">No venue information available.</div>
                )}
              </div>

              <div className="mt-6">
                <h3 className="font-semibold">Players</h3>
                <div className="flex gap-2 items-center mt-2">
                  <select value={selectedLeague} onChange={(e) => setSelectedLeague(e.target.value)} className="border px-2 py-1 rounded">
                    <option value="">Select league</option>
                    {leagues.map((l) => <option key={l.id} value={l.id}>{l.name}</option>)}
                  </select>

                  <select value={selectedSeason} onChange={(e) => setSelectedSeason(e.target.value)} className="border px-2 py-1 rounded">
                    <option value="">Select season</option>
                    {seasons.map((s) => <option key={s.season} value={s.season}>{s.season}</option>)}
                  </select>

                  <button onClick={fetchPlayers} className="ml-auto bg-primary-600 text-white px-3 py-1 rounded">Load players</button>
                </div>

                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {loadingPlayers ? (
                    <div className="text-sm text-slate-500">Loading players…</div>
                  ) : players.length === 0 ? (
                    <div className="text-sm text-slate-500 col-span-full">No players found. Choose league & season.</div>
                  ) : (
                    players.map((p) => {
                      const player = p.player || p
                      const playerId = player.id || player.playerId
                      return (
                        <Link
                          key={playerId}
                          to={`/players/${playerId}`}
                          className="border rounded p-2 text-center block hover:shadow"
                        >
                          {player.photo ? (
                            <img src={player.photo} alt={player.name} className="w-full h-28 object-cover rounded" />
                          ) : (
                            <div className="w-full h-28 bg-slate-100 flex items-center justify-center">No image</div>
                          )}
                          <div className="mt-2 text-sm font-medium">{player.name}</div>
                          <div className="text-xs text-slate-500">{player.position || ''} • #{player.number || '—'}</div>
                        </Link>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>

          <aside className="space-y-4">
            <div className="rounded-xl border bg-white p-4">
              <h4 className="font-semibold">Quick info</h4>
              <div className="text-sm text-slate-600 mt-2">
                <div>Country: {team.country}</div>
                <div>Founded: {team.founded}</div>
                <div>Venue: {venue ? venue.name : 'N/A'}</div>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        <div className="text-sm text-slate-500">Loading team…</div>
      )}
    </div>
  )
}
