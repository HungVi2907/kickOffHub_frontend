import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useShallow } from 'zustand/react/shallow'
import Card from '@/shared/components/ui/Card.jsx'
import Button from '@/shared/components/ui/Button.jsx'
import { withFallback } from '@/shared/utils/img.js'
import { usePlayers, usePlayerSearch, usePopularPlayers } from '@/features/players/hooks.js'
import { usePlayerFiltersStore } from '@/features/players/store.js'

const MotionSection = motion.section

export default function PlayersPage() {
  const { search, page, limit, setFilters } = usePlayerFiltersStore(
    useShallow((state) => ({
      search: state.search,
      page: state.page,
      limit: state.limit,
      setFilters: state.setFilters,
    })),
  )
  const [inputValue, setInputValue] = useState(search)
  const playersState = usePlayers({ page, limit })
  const searchState = usePlayerSearch(search)
  const popularPlayers = usePopularPlayers({ page: 1, limit: 8 })
  const popularList = Array.isArray(popularPlayers.data) ? popularPlayers.data : []

  const isSearching = Boolean(search?.trim())
  const listState = isSearching ? searchState : playersState
  const players = listState.data ?? []

  const handleSearchSubmit = (event) => {
    event.preventDefault()
    setFilters({ search: inputValue.trim(), page: 1 })
  }

  const handlePagination = (direction) => {
    setFilters({ page: page + direction })
  }

  return (
    <MotionSection
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">Players</p>
        <h1 className="text-3xl font-bold text-slate-900">Player Directory</h1>
        <p className="max-w-2xl text-sm text-slate-600">Search and explore detailed player profiles.</p>
      </header>

      <section className="space-y-3 rounded-2xl border border-amber-100 bg-amber-50/70 p-4 shadow-sm">
        <div className="flex items-center gap-2">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-amber-500">Fan favourites</p>
          <span className="text-xs text-amber-600">Most loved by the community</span>
        </div>
        {popularPlayers.loading && <p className="text-sm text-amber-700">Loading...</p>}
        {popularPlayers.error && <p className="text-sm text-red-500">{popularPlayers.error.message}</p>}
        {!popularPlayers.loading && !popularPlayers.error && (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {popularList.map((player) => (
              <Link key={`popular-${player.id}`} to={`/players/${player.id}`} className="group">
                <article className="flex items-center gap-3 rounded-2xl border border-amber-200 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                  <img
                    src={withFallback(player.photo)}
                    alt={player.name}
                    className="h-16 w-16 rounded-full object-cover shadow-inner"
                  />
                  <div>
                    <h3 className="font-semibold text-slate-900 group-hover:text-primary-600">{player.name}</h3>
                    <p className="text-sm text-slate-600">{player.position || 'Unknown'}</p>
                    <p className="text-xs uppercase tracking-[0.2em] text-amber-500">Popular pick</p>
                  </div>
                </article>
              </Link>
            ))}
            {!popularList.length && <p className="text-sm text-slate-500">No players marked as popular yet.</p>}
          </div>
        )}
      </section>

      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <input
          type="text"
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          placeholder="Search players by name..."
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
        />
        <Button type="submit">Search</Button>
      </form>

      {listState.loading && <p className="text-center text-sm text-slate-500">Loading players...</p>}
      {listState.error && <p className="text-center text-sm text-red-500">{listState.error.message}</p>}

      {!listState.loading && !listState.error && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {players.map((player) => (
              <Link key={player.id} to={`/players/${player.id}`} className="block">
                <Card className="flex flex-col items-center gap-3 p-4 text-center">
                  {player.photo ? (
                    <img src={withFallback(player.photo)} alt={player.name} className="h-24 w-24 rounded-full object-cover" />
                  ) : (
                    <div className="flex h-24 w-24 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-500">
                      No image
                    </div>
                  )}
                  <div>
                    <p className="text-base font-semibold text-slate-900">{player.name}</p>
                    <p className="text-xs text-slate-500">{player.position}</p>
                    <p className="text-xs text-slate-400">{player.nationality}</p>
                  </div>
                </Card>
              </Link>
            ))}
            {!players.length && <p className="col-span-full text-center text-sm text-slate-500">No matching players found.</p>}
          </div>

          {!isSearching && playersState?.data?.length > 0 && (
            <div className="flex items-center justify-center gap-2 text-sm text-slate-700">
              <Button variant="outline" disabled={page <= 1} onClick={() => handlePagination(-1)}>
                Previous
              </Button>
              <span>
                Page {page} • {playersState?.pagination?.total || '∞'} players
              </span>
              <Button variant="outline" disabled={players.length < limit} onClick={() => handlePagination(1)}>
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </MotionSection>
  )
}
