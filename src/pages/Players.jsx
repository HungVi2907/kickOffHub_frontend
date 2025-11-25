import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import apiClient from '../utils/apiClient.js'

const MotionSection = motion.section

export default function Players() {
  const [players, setPlayers] = useState([])
  const [pagination, setPagination] = useState({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [page, setPage] = useState(1)
  const [limit] = useState(20)
  const [popularPlayers, setPopularPlayers] = useState([])
  const [popularLoading, setPopularLoading] = useState(false)
  const [popularError, setPopularError] = useState(null)

  useEffect(() => {
    const fetchPlayers = async () => {
      setLoading(true)
      setError(null)
      try {
        let response
        if (searchQuery.trim()) {
          response = await apiClient.get('/players/search', {
            params: { name: searchQuery, limit: 100 }
          })
          setPlayers(response.data.results || [])
          setPagination({ total: response.data.total, limit: response.data.limit, keyword: response.data.keyword })
        } else {
          response = await apiClient.get('/players', {
            params: { page, limit }
          })
          setPlayers(response.data.data || [])
          setPagination(response.data.pagination || {})
        }
      } catch (err) {
        setError(err.response?.data?.error || 'Failed to fetch players')
      } finally {
        setLoading(false)
      }
    }

    fetchPlayers()
  }, [page, searchQuery, limit])

  useEffect(() => {
    let ignore = false
    const fetchPopularPlayers = async () => {
      setPopularLoading(true)
      setPopularError(null)
      try {
        const response = await apiClient.get('/players/popular', { params: { page: 1, limit: 8 } })
        if (!ignore) {
          setPopularPlayers(response.data.data || [])
        }
      } catch (err) {
        if (!ignore) {
          setPopularError(err.response?.data?.error || 'Failed to load fan favorites')
        }
      } finally {
        if (!ignore) {
          setPopularLoading(false)
        }
      }
    }

    fetchPopularPlayers()
    return () => {
      ignore = true
    }
  }, [])

  const handleSearch = (e) => {
    e.preventDefault()
    setPage(1) // Reset to first page on search
  }

  const handlePageChange = (newPage) => {
    setPage(newPage)
  }

  return (
    <MotionSection
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">
          Players
        </p>
        <h1 className="text-3xl font-bold text-black">Player Directory</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Browse and search football players. View detailed player information and statistics.
        </p>
      </header>

      <section className="space-y-3 rounded-2xl border border-yellow-100 bg-amber-50/70 p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">
            Fan favourites
          </p>
          <span className="text-sm text-amber-700/80">
            Spotlight on players marked as <code className="rounded bg-white/60 px-1">isPopular</code>
          </span>
        </div>
        {popularLoading && <p className="text-sm text-amber-700">Loading featured players...</p>}
        {popularError && <p className="text-sm text-red-500">{popularError}</p>}
        {!popularLoading && !popularError && popularPlayers.length > 0 && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {popularPlayers.map((player) => (
              <Link key={`popular-${player.id}`} to={`/players/${player.id}`} className="group">
                <article className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-white/90 p-3 shadow-sm transition hover:shadow-lg">
                  <img
                    src={player.photo || 'https://placehold.co/80x80?text=Player'}
                    alt={player.name}
                    className="h-16 w-16 rounded-full object-cover shadow-inner"
                  />
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-primary-600">{player.name}</h3>
                    <p className="text-sm text-slate-600">{player.position || 'Unknown position'}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-amber-500">Popular pick</p>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
        {!popularLoading && !popularError && popularPlayers.length === 0 && (
          <p className="text-sm text-slate-500">We have not flagged anyone as popular yet. Check back soon!</p>
        )}
      </section>

      <form onSubmit={handleSearch} className="flex gap-2">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search players by name..."
          className="flex-1 rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:border-primary-500 focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-primary-500 px-4 py-2 text-sm font-medium text-white hover:bg-primary-600 focus:outline-none"
        >
          Search
        </button>
      </form>

      {loading && <p className="text-center text-slate-500">Loading...</p>}
      {error && <p className="text-center text-red-500">{error}</p>}

      {!loading && !error && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {players.map((player) => (
              <Link key={player.id} to={`/players/${player.id}`} className="block">
                <div className="rounded-xl border border-slate-300 bg-white p-4 shadow-sm hover:shadow-md transition-shadow">
                  {player.photo && (
                    <img src={player.photo} alt={player.name} className="mb-2 h-24 w-24 rounded-full object-cover" />
                  )}
                  <h3 className="text-lg font-semibold text-black">{player.name}</h3>
                  <p className="text-sm text-slate-600">{player.position}</p>
                  <p className="text-sm text-slate-600">{player.nationality}</p>
                  {player.number && <p className="text-sm text-slate-600">Number: {player.number}</p>}
                </div>
              </Link>
            ))}
          </div>

          {!searchQuery && pagination.totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page <= 1}
                className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:opacity-50"
              >
                Previous
              </button>
              <span className="px-3 py-1 text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page >= pagination.totalPages}
                className="rounded-lg border border-slate-300 px-3 py-1 text-sm disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </MotionSection>
  )
}