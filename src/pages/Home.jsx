import { useCallback, useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import apiClient from '../utils/apiClient.js'

const FEATURED_COUNT = 12

const SEARCH_OPTIONS = [
  { value: 'players', label: 'Players', placeholder: 'e.g. Messi, Haaland...' },
  { value: 'teams', label: 'Teams', placeholder: 'e.g. Arsenal, Inter...' },
  { value: 'leagues', label: 'Leagues', placeholder: 'e.g. Premier League...' },
  { value: 'countries', label: 'Countries', placeholder: 'e.g. Argentina, Japan...' },
]

const SEARCH_LABELS = {
  players: 'players',
  teams: 'teams',
  leagues: 'leagues',
  countries: 'countries',
}

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
  const [searchType, setSearchType] = useState('players')
  const [searchInput, setSearchInput] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [activeSearch, setActiveSearch] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [searchError, setSearchError] = useState('')

  const [players, setPlayers] = useState([])
  const [playerLoading, setPlayerLoading] = useState(false)
  const [playerError, setPlayerError] = useState('')
  const [totalPlayers, setTotalPlayers] = useState(null)
  const [playerPage, setPlayerPage] = useState(1)
  const [playerTotalPages, setPlayerTotalPages] = useState(1)

  const currentSearchOption = SEARCH_OPTIONS.find((option) => option.value === searchType)
  const searchPlaceholder = currentSearchOption?.placeholder || 'Type a keyword...'
  const searchLabelLower = SEARCH_LABELS[searchType] || 'players'

  const searchEndpoints = {
    players: { url: '/players/search', param: 'name' },
    teams: { url: '/teams/search', param: 'name' },
    leagues: { url: '/leagues/search', param: 'name' },
    countries: { url: '/countries/search', param: 'name' },
  }

  const handleSelectSearchType = (value) => {
    if (value === searchType) return
    setSearchType(value)
    setSearchInput('')
    setSearchError('')
    if (isSearching) {
      setIsSearching(false)
      setSearchResults([])
      setActiveSearch('')
      setSearchLoading(false)
    }
  }

  const handleResetSearch = () => {
    setIsSearching(false)
    setActiveSearch('')
    setSearchResults([])
    setSearchError('')
    setSearchLoading(false)
    setSearchInput('')
  }

  const handleSearchSubmit = async (event) => {
    event.preventDefault()
    if (searchLoading) return
    const trimmed = searchInput.trim()
    if (!trimmed) {
      handleResetSearch()
      return
    }

    const endpoint = searchEndpoints[searchType] || searchEndpoints.players
    setIsSearching(true)
    setActiveSearch(trimmed)
    setSearchLoading(true)
    setSearchError('')

    try {
      const params = { limit: FEATURED_COUNT }
      params[endpoint.param] = trimmed
      const { data } = await apiClient.get(endpoint.url, { params })
      const list = Array.isArray(data?.results)
        ? data.results
        : Array.isArray(data)
        ? data
        : Array.isArray(data?.data)
        ? data.data
        : []
      setSearchResults(list)
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Unable to search at the moment'
      setSearchResults([])
      setSearchError(message)
    } finally {
      setSearchLoading(false)
    }
  }

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

  const fetchPlayers = useCallback(
    async ({ signal } = {}) => {
      setPlayerLoading(true)
      setPlayerError('')
      try {
        const response = await apiClient.get('/players/popular', {
          signal,
          params: { page: playerPage, limit: FEATURED_COUNT },
        })
        const rawData = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data?.data)
          ? response.data.data
          : []
        setPlayers(rawData)
        const pagination = response.data?.pagination || {}
        const totalItems = Number.parseInt(pagination.totalItems, 10)
        const totalPagesFromResponse = Number.parseInt(pagination.totalPages, 10)
        const pageFromResponse = Number.parseInt(pagination.page, 10)

        setTotalPlayers((previous) => {
          if (Number.isFinite(totalItems)) {
            return totalItems
          }
          return Number.isFinite(previous) ? previous : rawData.length
        })
        if (Number.isFinite(totalPagesFromResponse) && totalPagesFromResponse > 0) {
          setPlayerTotalPages(totalPagesFromResponse)
        } else {
          setPlayerTotalPages(1)
        }
        if (Number.isFinite(pageFromResponse) && pageFromResponse > 0) {
          setPlayerPage((prevPage) => (prevPage === pageFromResponse ? prevPage : pageFromResponse))
        }
      } catch (err) {
        if (axios.isCancel(err)) return
        const message = err.response?.data?.message || err.message || 'Failed to load players'
        setPlayerError(message)
      } finally {
        setPlayerLoading(false)
      }
    },
    [playerPage],
  )

  const canGoPrevPlayer = playerPage > 1
  const canGoNextPlayer = playerPage < playerTotalPages

  const handlePrevPlayerPage = () => {
    if (!canGoPrevPlayer) {
      return
    }
    setPlayerPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPlayerPage = () => {
    if (!canGoNextPlayer) {
      return
    }
    setPlayerPage((prev) => prev + 1)
  }

  useEffect(() => {
    const controller = new AbortController()
    fetchPlayers({ signal: controller.signal })
    return () => controller.abort()
  }, [fetchPlayers])

  const activeCardType = isSearching ? searchType : 'players'
  const activeCardLabel = SEARCH_LABELS[activeCardType] || 'cầu thủ'
  const displayedItems = isSearching ? searchResults : players
  const listLoading = isSearching ? searchLoading : playerLoading
  const listError = isSearching ? '' : playerError
  const listEmptyMessage = isSearching
    ? activeSearch
      ? `No ${activeCardLabel} found for “${activeSearch}”.`
      : 'Type a keyword to start searching.'
    : 'No players available yet.'

  const renderResultCard = (item) => {
    if (activeCardType === 'teams') {
      return (
        <Link key={item.id || item.name} to={`/teams/${item.id ?? ''}`}>
          <article className="group flex h-40 flex-col justify-between rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
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
          </article>
        </Link>
      )
    }

    if (activeCardType === 'leagues') {
      return (
        <Link key={item.id || item.name} to={`/league/${item.id ?? ''}`}>
          <article className="group flex h-40 flex-col justify-between rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <div className="flex items-start gap-4">
              {item.logo ? (
                <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white/80 shadow-sm">
                  <img
                    src={item.logo}
                    alt={item.name || 'League'}
                    loading="lazy"
                    onError={handleLeagueLogoError}
                    className="h-12 w-12 object-contain"
                  />
                </div>
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-full border border-dashed border-slate-300 text-[10px] uppercase tracking-[0.3em] text-slate-400">
                  No logo
                </div>
              )}
              <div className="space-y-1">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400 group-hover:text-primary-500">League</p>
                <h3 className="text-xl font-bold text-black transition-colors group-hover:text-primary-600">
                  {item.name || 'Unnamed league'}
                </h3>
                <p className="text-sm text-slate-500">Loại: {item.type || 'League'}</p>
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>ID: {item.id ?? 'N/A'}</span>
              <span>{item.updated_at ? new Date(item.updated_at).toLocaleDateString() : 'Recently synced'}</span>
            </div>
          </article>
        </Link>
      )
    }

    if (activeCardType === 'countries') {
      return (
        <article
          key={item.id || item.code || item.name}
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
                <span className="font-semibold text-primary-600">Code:</span> {(item.code || 'N/A').toUpperCase()}
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
        </article>
      )
    }

    return (
      <Link key={item.id || item.name} to={`/players/${item.id ?? ''}`}>
        <article className="group flex h-40 flex-col justify-between rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
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
                <img src={item.photo} alt={item.name} loading="lazy" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>#{String(item.id ?? '')}</span>
            <span>{item.nationality || 'N/A'}</span>
          </div>
        </article>
      </Link>
    )
  }

  return (
    <div className="space-y-12">
      <section className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm backdrop-blur">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">
              KickOff Hub
            </p>
            <h1 className="text-4xl font-black tracking-tight text-black sm:text-5xl">
              Welcome to Kick-Off Hub!
            </h1>
            <p className="text-base text-slate-600">
              The ultimate gathering place for football lovers — where you can explore teams, leagues, and the most accurate stats.
Let’s feel the rhythm of the pitch and live every match with passion!
            </p>
          </div>
        </div>
  </section>

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">Quick lookup</p>
            <h2 className="text-2xl font-semibold text-black">Search football data</h2>
            <p className="text-sm text-slate-500">Choose a data type and enter a keyword to see up to {FEATURED_COUNT} results.</p>
          </div>
          {isSearching && (
            <button
              type="button"
              onClick={handleResetSearch}
              className="inline-flex items-center gap-2 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 transition hover:border-rose-300 hover:text-rose-600"
            >
              Clear search
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-2">
          {SEARCH_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => handleSelectSearchType(option.value)}
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                option.value === searchType
                  ? 'bg-primary-600 text-white shadow'
                  : 'border border-slate-200 bg-white text-slate-600 hover:border-primary-400 hover:text-primary-600'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row">
          <input
            type="search"
            value={searchInput}
            onChange={(event) => setSearchInput(event.target.value)}
            placeholder={searchPlaceholder}
            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base text-slate-800 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
          />
          <button
            type="submit"
            disabled={searchLoading}
            className="rounded-2xl bg-primary-600 px-6 py-3 text-base font-semibold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {searchLoading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {searchError && <p className="text-sm text-rose-600">{searchError}</p>}
        {isSearching && !searchLoading && !searchError && activeSearch && (
          <p className="text-sm text-slate-500">
            Showing {searchLabelLower} results matching “{activeSearch}”.
          </p>
        )}
      </section>

      <section className="space-y-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold text-black">
              {isSearching ? `Results for ${currentSearchOption?.label || 'search'}` : 'Popular players'}
            </h2>
            <p className="text-sm text-slate-500">
              {isSearching
                ? activeSearch
                  ? `Showing ${displayedItems.length} ${activeCardLabel} for “${activeSearch}”.`
                  : 'Type a keyword to start searching.'
                : 'Recently synced featured players.'}
            </p>
          </div>
          {!isSearching && (
            <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <button
                type="button"
                onClick={() => fetchPlayers()}
                disabled={playerLoading}
                className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm transition hover:border-primary-400 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Refresh
              </button>
            </div>
          )}
        </div>

        {listError && (
          <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 text-sm text-red-700">
            <p className="font-semibold">We could not load popular players.</p>
            <p className="mt-1">{listError}</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {listLoading &&
            Array.from({ length: FEATURED_COUNT }).map((_, index) => (
              <div
                key={`result-skeleton-${index}`}
                className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white/60 shadow-sm"
              />
            ))}

          {!listLoading && !listError && displayedItems.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-sm text-slate-500">
              {listEmptyMessage}
            </div>
          )}

          {!listLoading && !listError && displayedItems.map((item) => renderResultCard(item))}
        </div>

        {!isSearching && playerTotalPages > 1 && (
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm shadow-sm">
            <span className="text-slate-600 text-slate-300">
              Page {playerPage} of {playerTotalPages}
            </span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handlePrevPlayerPage}
                disabled={!canGoPrevPlayer || playerLoading}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 font-medium text-slate-600 transition hover:border-primary-400 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-60 border-slate-700 bg-navy text-slate-200 hover:border-primary-500 hover:text-primary-200"
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
                onClick={handleNextPlayerPage}
                disabled={!canGoNextPlayer || playerLoading}
                className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 font-medium text-slate-600 transition hover:border-primary-400 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-60 border-slate-700 bg-navy text-slate-200 hover:border-primary-500 hover:text-primary-200"
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

      <section className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-black">Popular leagues</h2>
            <p className="text-sm text-slate-600 text-slate-400">
              Listing all competitions currently available in your KickOff Hub database.
            </p>
          </div>
          <span className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700 bg-primary-900/40 text-primary-200">
            {leagues.length} league{leagues.length === 1 ? '' : 's'}
          </span>
        </div>

        {leagueError && (
          <div className="rounded-xl border border-red-200 bg-red-50/70 p-4 text-sm text-red-700 border-red-800 bg-red-900/40 text-red-200">
            <p className="font-semibold">We could not load leagues.</p>
            <p className="mt-1">{leagueError}</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leagueLoading &&
            Array.from({ length: Math.max(leagues.length || 1, 1) }).map((_, index) => (
              <div
                key={`league-skeleton-${index}`}
                className="h-32 animate-pulse rounded-xl border border-slate-200 bg-white/60 shadow-sm border-slate-800 bg-navy/60"
              />
            ))}

          {!leagueLoading && !leagueError && leagues.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-6 text-sm text-slate-500 border-slate-700 bg-navy/60 text-slate-400">
              No leagues have been synced yet. Import one from the backend to see it here.
            </div>
          )}

          {!leagueLoading && !leagueError &&
            leagues.map((league) => (
              <Link
                to={`/league/${league.id ?? ''}`}
                key={league.id || league.name}
                className="group flex h-32 flex-col justify-between rounded-xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-400 border-slate-800 bg-navy/80"
              >
                <div className="flex items-center gap-4">
                  {league.logo ? (
                      <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-white/80 shadow-sm border-slate-700 bg-navy/80">
                      <img
                        src={league.logo}
                        alt={`${league.name || 'League'} logo`}
                        loading="lazy"
                        onError={handleLeagueLogoError}
                        className="h-10 w-10 object-contain"
                      />
                    </div>
                  ) : (
                    <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-slate-300 text-[10px] uppercase tracking-[0.3em] text-slate-400 border-slate-600">
                      No logo
                    </div>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold text-black transition-colors group-hover:text-primary-600">
                      {league.name || 'Unnamed league'}
                    </h3>
                    <p className="text-xs uppercase tracking-[0.3em] text-slate-400 text-slate-500">
                      {league.type || 'League'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between text-xs text-slate-400 text-slate-500">
                  <span>ID: {league.id ?? 'N/A'}</span>
                  <span>{league.updated_at ? new Date(league.updated_at).toLocaleDateString() : 'Recently synced'}</span>
                </div>
              </Link>
            ))}
        </div>
      </section>
    </div>
  )
}
