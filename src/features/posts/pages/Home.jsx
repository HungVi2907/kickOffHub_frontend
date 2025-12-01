import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/shared/components/ui/Button.jsx'
import Card, { CardContent } from '@/shared/components/ui/Card.jsx'
import Skeleton from '@/shared/components/ui/Skeleton.jsx'
import { ROUTES } from '@/app/paths.js'
import countryApi from '@/features/countries/api.js'
import playerApi from '@/features/players/api.js'
import teamApi from '@/features/teams/api.js'
import getApiErrorMessage from '@/shared/utils/getApiErrorMessage.js'
import { withFallback } from '@/shared/utils/img.js'

const MotionSection = motion.section
const FEATURED_COUNT = 12
const numberFormatter = new Intl.NumberFormat()

const toArray = (payload) => {
	const base = payload?.data ?? payload ?? []
	if (Array.isArray(base)) return base
	if (Array.isArray(base?.data)) return base.data
	if (Array.isArray(base?.results)) return base.results
	if (Array.isArray(payload?.results)) return payload.results
	return []
}

const extractPagination = (payload = {}) => {
	const base =
		payload?.meta?.pagination ||
		payload?.meta ||
		payload?.pagination ||
		payload?.data?.pagination ||
		{}

	const toNumber = (value) => {
		const parsed = Number.parseInt(value, 10)
		return Number.isFinite(parsed) ? parsed : null
	}

	return {
		page: toNumber(base.page),
		totalPages: toNumber(base.totalPages ?? base.total_pages),
		totalItems: toNumber(base.totalItems ?? base.total_items ?? base.total),
	}
}

const formatCount = (value) => (Number.isFinite(value) ? numberFormatter.format(value) : '—')

export default function HomePage() {
	const [countryPage, setCountryPage] = useState(1)
	const [countriesState, setCountriesState] = useState({
		items: [],
		loading: true,
		error: '',
		totalPages: 1,
		totalItems: null,
	})

	const [leagueState, setLeagueState] = useState({ items: [], loading: true, error: '' })
	const [playerPage, setPlayerPage] = useState(1)
	const [playerRefreshKey, setPlayerRefreshKey] = useState(0)
	const [playerState, setPlayerState] = useState({
		items: [],
		loading: true,
		error: '',
		totalPages: 1,
		totalItems: null,
	})

	// State for live database counts
	const [countryCount, setCountryCount] = useState(0)
	const [playerCount, setPlayerCount] = useState(0)

	// Fetch countries count from database
	useEffect(() => {
		let isActive = true
		countryApi
			.count()
			.then((response) => {
				if (!isActive) return
				const total = response?.data?.total ?? response?.total ?? 0
				setCountryCount(total)
			})
			.catch(() => {
				// Silently handle errors, keep count at 0
			})
		return () => {
			isActive = false
		}
	}, [])

	// Fetch players count from database
	useEffect(() => {
		let isActive = true
		playerApi
			.count()
			.then((response) => {
				if (!isActive) return
				const total = response?.data?.total ?? response?.total ?? 0
				setPlayerCount(total)
			})
			.catch(() => {
				// Silently handle errors, keep count at 0
			})
		return () => {
			isActive = false
		}
	}, [])

	// TEMPORARILY DISABLED - Explore Countries feature
	// useEffect(() => {
	// 	let isActive = true
	// 	setCountriesState((prev) => ({ ...prev, loading: true, error: '' }))
	// 	countryApi
	// 		.list({ page: countryPage, limit: FEATURED_COUNT })
	// 		.then((response) => {
	// 			if (!isActive) return
	// 			const items = toArray(response)
	// 			const pagination = extractPagination(response)
	// 			setCountriesState({
	// 				items,
	// 				loading: false,
	// 				error: '',
	// 				totalPages: pagination.totalPages ?? 1,
	// 				totalItems: pagination.totalItems ?? items.length,
	// 			})
	// 			if (pagination.page && pagination.page !== countryPage) {
	// 				setCountryPage(pagination.page)
	// 			}
	// 		})
	// 		.catch((error) => {
	// 			if (!isActive) return
	// 			setCountriesState((prev) => ({ ...prev, loading: false, error: getApiErrorMessage(error) }))
	// 		})
	// 	return () => {
	// 		isActive = false
	// 	}
	// }, [countryPage])

	useEffect(() => {
		let isActive = true
		setLeagueState((prev) => ({ ...prev, loading: true, error: '' }))
		teamApi
			.leagues()
			.then((response) => {
				if (!isActive) return
				setLeagueState({ items: toArray(response), loading: false, error: '' })
			})
			.catch((error) => {
				if (!isActive) return
				setLeagueState({ items: [], loading: false, error: getApiErrorMessage(error) })
			})
		return () => {
			isActive = false
		}
	}, [])

	// TEMPORARILY DISABLED - Browse Player feature
	// useEffect(() => {
	// 	let isActive = true
	// 	setPlayerState((prev) => ({ ...prev, loading: true, error: '' }))
	// 	playerApi
	// 		.popular({ page: playerPage, limit: FEATURED_COUNT })
	// 		.then((response) => {
	// 			if (!isActive) return
	// 			const items = toArray(response)
	// 			const pagination = extractPagination(response)
	// 			setPlayerState({
	// 				items,
	// 				loading: false,
	// 				error: '',
	// 				totalPages: pagination.totalPages ?? 1,
	// 				totalItems: pagination.totalItems ?? items.length,
	// 			})
	// 			if (pagination.page && pagination.page !== playerPage) {
	// 				setPlayerPage(pagination.page)
	// 			}
	// 		})
	// 		.catch((error) => {
	// 			if (!isActive) return
	// 			setPlayerState((prev) => ({ ...prev, loading: false, error: getApiErrorMessage(error) }))
	// 		})
	// 	return () => {
	// 		isActive = false
	// 	}
	// }, [playerPage, playerRefreshKey])

	const countryCountLabel = useMemo(() => formatCount(countryCount), [countryCount])
	const playerCountLabel = useMemo(() => formatCount(playerCount), [playerCount])
	const leagueCountLabel = useMemo(() => formatCount(leagueState.items.length), [leagueState.items.length])

	const canPrevCountries = countryPage > 1
	const canNextCountries = countryPage < (countriesState.totalPages || 1)
	const canPrevPlayers = playerPage > 1
	const canNextPlayers = playerPage < (playerState.totalPages || 1)

	const handleRefreshPlayers = () => {
		setPlayerRefreshKey((key) => key + 1)
	}

	return (
		<MotionSection
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.4 }}
			className="space-y-12"
		>
			<Card className="border-slate-200 bg-gradient-to-br from-primary-50 via-white to-rose-50">
				<CardContent className="space-y-6 p-8">
					<div className="space-y-3">
						<p className="text-xs font-semibold uppercase tracking-[0.4em] text-primary-500">KickOff Hub</p>
						<h1 className="text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">Dive into global football intelligence</h1>
						<p className="max-w-2xl text-base text-slate-600">
							Explore nations, leagues, clubs, and players powered by the KickOff Hub API, then share your take with the community forum.
						</p>
					</div>
					<div className="grid gap-4 sm:grid-cols-3">
						{[
							{ label: 'Countries Synced', value: countryCountLabel },
							{ label: 'Leagues tracked', value: leagueCountLabel },
							{ label: 'Player Synced', value: playerCountLabel },
						].map((stat) => (
							<Card key={stat.label} className="border-transparent bg-white/80 shadow-none">
								<CardContent className="space-y-1">
									<p className="text-xs uppercase tracking-[0.3em] text-slate-400">{stat.label}</p>
									<p className="text-3xl font-bold text-slate-900">{stat.value}</p>
								</CardContent>
							</Card>
						))}
					</div>
					{/* TEMPORARILY DISABLED - Browse Player, Explore Countries, Refresh Spotlight buttons
					<div className="flex flex-wrap gap-3">
						<Button type="button" onClick={() => setPlayerPage(1)} className="rounded-2xl px-6">
							Browse players
						</Button>
						<Button type="button" variant="secondary" onClick={() => setCountryPage(1)} className="rounded-2xl px-6">
							Explore countries
						</Button>
						<Button type="button" variant="outline" onClick={handleRefreshPlayers} className="rounded-2xl px-6">
							Refresh spotlight
						</Button>
					</div>
					*/}
				</CardContent>
			</Card>

			<section className="space-y-4">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<h2 className="text-2xl font-semibold text-slate-900">Popular leagues</h2>
						<p className="text-sm text-slate-500">Live snapshot of competitions available in your KickOff Hub workspace.</p>
					</div>
					<span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-600">
						{leagueCountLabel} tracked
					</span>
				</div>

				{leagueState.error && (
					<p className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-600">
						{leagueState.error}
					</p>
				)}

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{leagueState.loading &&
						Array.from({ length: 3 }).map((_, index) => (
							<Card key={`league-skeleton-${index}`} className="border-slate-200 bg-white/70">
								<CardContent>
									<Skeleton className="mb-2 h-5 w-24" />
									<Skeleton className="mb-1 h-4 w-32" />
									<Skeleton className="h-4 w-48" />
								</CardContent>
							</Card>
						))}

					{!leagueState.loading &&
						!leagueState.error &&
						leagueState.items.length === 0 && (
							<p className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-4 py-3 text-sm text-slate-500">
								No leagues have been synced yet.
							</p>
						)}

					{leagueState.items.map((league) => (
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
			</section>

			{/* TEMPORARILY DISABLED - Explore Countries section
			<section className="space-y-4">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<h2 className="text-2xl font-semibold text-slate-900">Featured countries</h2>
						<p className="text-sm text-slate-500">Browse federations currently available from the API.</p>
					</div>
					<span className="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-600">
						{countryCountLabel} total
					</span>
				</div>

				{countriesState.error && (
					<p className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-600">
						{countriesState.error}
					</p>
				)}

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{countriesState.loading &&
						Array.from({ length: 6 }).map((_, index) => (
							<Card key={`country-skeleton-${index}`} className="border-slate-200 bg-white/70">
								<CardContent>
									<Skeleton className="mb-2 h-5 w-32" />
									<Skeleton className="h-4 w-20" />
								</CardContent>
							</Card>
						))}

					{!countriesState.loading &&
						!countriesState.error &&
						countriesState.items.length === 0 && (
							<p className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-4 py-3 text-sm text-slate-500">
								No countries available yet.
							</p>
						)}

					{countriesState.items.map((country) => (
						<Link
							to={`${ROUTES.countries}/${country.id}`}
							key={country.id || country.code || country.name}
							className="group block"
						>
							<Card className="border-slate-200 bg-white/80 p-5 transition hover:-translate-y-1 hover:border-primary-300 hover:shadow-lg">
								<div className="flex items-center gap-4">
									{country.flag ? (
										<img
											src={withFallback(country.flag)}
											alt={country.name}
											className="h-12 w-20 rounded-xl object-cover"
										/>
									) : (
										<div className="flex h-12 w-20 items-center justify-center rounded-xl border border-dashed border-slate-200 text-[10px] uppercase tracking-[0.4em] text-slate-400">
											N/A
										</div>
									)}
									<div className="flex-1">
										<p className="text-xs uppercase tracking-[0.3em] text-slate-400">Country</p>
										<h3 className="text-lg font-semibold text-slate-900 transition-colors group-hover:text-primary-600">{country.name || country.country || 'Unnamed country'}</h3>
										<p className="text-sm text-slate-500">Code: {(country.code || '').toUpperCase() || 'N/A'}</p>
									</div>
								</div>
							</Card>
						</Link>
					))}
				</div>

				{countriesState.totalPages > 1 && (
					<div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600">
						<span>
							Page {countryPage} of {countriesState.totalPages || 1}
						</span>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								type="button"
								onClick={() => setCountryPage((page) => Math.max(1, page - 1))}
								disabled={!canPrevCountries || countriesState.loading}
							>
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								type="button"
								onClick={() => setCountryPage((page) => page + 1)}
								disabled={!canNextCountries || countriesState.loading}
							>
								Next
							</Button>
						</div>
					</div>
				)}
			</section>
			*/}

			{/* TEMPORARILY DISABLED - Browse Player (Popular players) section
			<section className="space-y-4">
				<div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
					<div>
						<h2 className="text-2xl font-semibold text-slate-900">Popular players</h2>
						<p className="text-sm text-slate-500">Updated from the /players/popular endpoint with pagination support.</p>
					</div>
					<Button type="button" variant="outline" size="sm" onClick={handleRefreshPlayers} disabled={playerState.loading}>
						Refresh list
					</Button>
				</div>

				{playerState.error && (
					<p className="rounded-2xl border border-rose-200 bg-rose-50/80 px-4 py-3 text-sm text-rose-600">
						{playerState.error}
					</p>
				)}

				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{playerState.loading &&
						Array.from({ length: 6 }).map((_, index) => (
							<Card key={`player-skeleton-${index}`} className="border-slate-200 bg-white/70">
								<CardContent>
									<Skeleton className="mb-2 h-5 w-32" />
									<Skeleton className="h-4 w-20" />
								</CardContent>
							</Card>
						))}

					{playerState.items.map((player) => (
						<Link
							to={`${ROUTES.players}/${player.id ?? ''}`}
							key={player.id || player.name}
							className="group rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary-300 hover:shadow-lg"
						>
							<div className="flex items-start justify-between gap-3">
								<div className="space-y-2">
									<p className="text-xs uppercase tracking-[0.3em] text-slate-400">Player</p>
									<h3 className="text-xl font-semibold text-slate-900 transition-colors group-hover:text-primary-600">
										{player.name || 'Unnamed player'}
									</h3>
									<p className="text-sm text-slate-500">{player.position || 'Unknown position'}</p>
								</div>
								{player.photo ? (
									<img src={withFallback(player.photo)} alt={player.name} className="h-14 w-14 rounded-full border border-slate-200 object-cover" />
								) : null}
							</div>
							<div className="mt-4 flex items-center justify-between text-xs text-slate-400">
								<span>#{player.id ?? 'N/A'}</span>
								<span>{player.nationality || 'Unknown nation'}</span>
							</div>
						</Link>
					))}
				</div>

				{playerState.totalPages > 1 && (
					<div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-600">
						<span>
							Page {playerPage} of {playerState.totalPages || 1}
						</span>
						<div className="flex gap-2">
							<Button
								variant="outline"
								size="sm"
								type="button"
								onClick={() => setPlayerPage((page) => Math.max(1, page - 1))}
								disabled={!canPrevPlayers || playerState.loading}
							>
								Previous
							</Button>
							<Button
								variant="outline"
								size="sm"
								type="button"
								onClick={() => setPlayerPage((page) => page + 1)}
								disabled={!canNextPlayers || playerState.loading}
							>
								Next
							</Button>
						</div>
					</div>
				)}
			</section>
			*/}
		</MotionSection>
	)
}
