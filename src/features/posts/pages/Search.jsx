import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/shared/components/ui/Button.jsx'
import Input from '@/shared/components/ui/Input.jsx'
import { ROUTES } from '@/app/paths.js'
import api from '@/lib/api.js'
import endpoints from '@/lib/endpoints.js'
import getApiErrorMessage from '@/shared/utils/getApiErrorMessage.js'
import { withFallback } from '@/shared/utils/img.js'

const MotionSection = motion.section

const buildPlayerCard = (player) => (
	<Link
		key={`player-${player.id}`}
		to={`${ROUTES.players}/${player.id}`}
		className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:border-primary-300 hover:shadow-md"
	>
		<img
			src={withFallback(player.photo)}
			alt={player.name}
			className="h-16 w-16 rounded-full object-cover shadow-inner"
		/>
		<div className="flex-1">
			<p className="text-sm uppercase tracking-[0.2em] text-primary-500">Player</p>
			<h3 className="text-lg font-semibold text-slate-900">{player.name}</h3>
			<p className="text-sm text-slate-600">
				{player.position || 'Unknown position'} • {player.nationality || 'N/A'}
			</p>
		</div>
		<span className="text-sm font-semibold text-primary-600 transition group-hover:translate-x-1">View</span>
	</Link>
)

const buildTeamCard = (team) => (
	<Link
		key={`team-${team.id}`}
		to={`${ROUTES.teams}/${team.id}`}
		className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:border-primary-300 hover:shadow-md"
	>
		<img
			src={withFallback(team.logo)}
			alt={team.name}
			className="h-16 w-16 rounded-full border border-slate-200 bg-white object-contain p-2"
		/>
		<div className="flex-1">
			<p className="text-sm uppercase tracking-[0.2em] text-emerald-500">Team</p>
			<h3 className="text-lg font-semibold text-slate-900">{team.name}</h3>
			<p className="text-sm text-slate-600">
				{team.country || 'Unknown country'} {team.founded ? `• Est. ${team.founded}` : ''}
			</p>
		</div>
		<span className="text-sm font-semibold text-primary-600 transition group-hover:translate-x-1">View</span>
	</Link>
)

const buildCountryCard = (country) => (
	<Link
		key={`country-${country.id}`}
		to={`${ROUTES.countries}/${country.id}`}
		className="group flex items-center gap-4 rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm transition hover:border-primary-300 hover:shadow-md"
	>
		{country.flag ? (
			<img src={withFallback(country.flag)} alt={country.name} className="h-10 w-14 rounded object-cover" />
		) : (
			<div className="flex h-10 w-14 items-center justify-center rounded bg-slate-100 text-xs font-semibold text-slate-500">
				{country.code || 'N/A'}
			</div>
		)}
		<div className="flex-1">
			<p className="text-sm uppercase tracking-[0.2em] text-amber-500">Country</p>
			<h3 className="text-lg font-semibold text-slate-900">{country.name}</h3>
			<p className="text-sm text-slate-600">Code: {country.code || '—'}</p>
		</div>
		<span className="text-sm font-semibold text-primary-600 transition group-hover:translate-x-1">View</span>
	</Link>
)

const defaultResults = { players: [], teams: [], countries: [] }

const extractList = (payload) => {
	if (!payload) return []
	const data = payload?.data ?? payload
	if (Array.isArray(data?.results)) return data.results
	if (Array.isArray(data?.data)) return data.data
	if (Array.isArray(data)) return data
	return []
}

export default function SearchPage() {
	const navigate = useNavigate()
	const [searchParams] = useSearchParams()
	const keyword = useMemo(() => (searchParams.get('q') ?? '').trim(), [searchParams])
	const [query, setQuery] = useState(keyword)
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState(null)
	const [results, setResults] = useState(defaultResults)

	useEffect(() => {
		setQuery(keyword)
	}, [keyword])

	useEffect(() => {
		if (!keyword) {
			setResults(defaultResults)
			setError(null)
			return
		}

		let aborted = false
		const fetchResults = async () => {
			setLoading(true)
			setError(null)
			try {
				const [playersRes, teamsRes, countriesRes] = await Promise.allSettled([
					api.get(endpoints.players.search, { params: { name: keyword, limit: 12 } }),
					api.get(endpoints.teams.search, { params: { name: keyword, limit: 12 } }),
					api.get(endpoints.countries.search, { params: { name: keyword, limit: 12 } }),
				])

				if (aborted) return

				const nextResults = {
					players: playersRes.status === 'fulfilled' ? extractList(playersRes.value) : [],
					teams: teamsRes.status === 'fulfilled' ? extractList(teamsRes.value) : [],
					countries: countriesRes.status === 'fulfilled' ? extractList(countriesRes.value) : [],
				}

				setResults(nextResults)
				const failures = [playersRes, teamsRes, countriesRes].filter((res) => res.status === 'rejected')
				if (failures.length) {
					setError('Unable to load some search results. Please try again later.')
				}
			} catch (err) {
				if (aborted) return
				setResults(defaultResults)
				setError(getApiErrorMessage(err, 'Unable to perform search right now.'))
			} finally {
				if (!aborted) {
					setLoading(false)
				}
			}
		}

		fetchResults()
		return () => {
			aborted = true
		}
	}, [keyword])

	const handleSubmit = (event) => {
		event.preventDefault()
		const trimmed = query.trim()
		if (!trimmed) {
			navigate(ROUTES.search)
			setResults(defaultResults)
			return
		}
		navigate(`${ROUTES.search}?q=${encodeURIComponent(trimmed)}`)
	}

	const sections = [
		{ key: 'players', title: 'Players', data: results.players, builder: buildPlayerCard, empty: 'No players found for this search.' },
		{ key: 'teams', title: 'Teams', data: results.teams, builder: buildTeamCard, empty: 'No clubs matched your query.' },
		{ key: 'countries', title: 'Countries', data: results.countries, builder: buildCountryCard, empty: 'No federations found with that keyword.' },
	]

	return (
		<MotionSection initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-10">
			<header className="space-y-3 rounded-3xl bg-gradient-to-br from-primary-600 via-primary-500 to-rose-500 p-6 text-white shadow-lg">
				<p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">Universal search</p>
				<h1 className="text-4xl font-black tracking-tight">Find players, teams & nations</h1>
				<p className="max-w-2xl text-sm text-white/80">
					Type a name and Hit Enter to search across the KickOff Hub knowledge base. Results update instantly for players, clubs, and national teams.
				</p>
				<form onSubmit={handleSubmit} className="mt-6 grid gap-3 rounded-2xl bg-white/10 p-4 backdrop-blur lg:grid-cols-[minmax(0,_1fr)_auto]">
					<Input
						type="search"
						value={query}
						onChange={(event) => setQuery(event.target.value)}
						placeholder="Ex: Ronaldo, Arsenal, Argentina..."
						className="flex-1"
						inputClassName="border-none bg-white/90 px-4 py-3 text-lg text-slate-900 placeholder:text-slate-400"
						hiddenLabel
					/>
					<Button type="submit" className="h-full rounded-2xl bg-white text-lg font-semibold text-primary-600 hover:bg-primary-50">
						Search
					</Button>
				</form>
			</header>

			{!keyword && <p className="text-center text-sm text-slate-500">Start typing above to explore the database.</p>}

			{keyword && (
				<div className="space-y-8">
					{loading && <p className="text-center text-slate-500">Searching for “{keyword}”...</p>}
					{error && <p className="text-center text-rose-500">{error}</p>}
					{!loading && !error &&
						sections.map((section) => (
							<section key={section.key} className="space-y-3">
								<div className="flex items-center justify-between">
									<h2 className="text-2xl font-semibold text-slate-900">{section.title}</h2>
									<span className="text-sm text-slate-500">
										{section.data.length ? `${section.data.length} results` : 'No results'}
									</span>
								</div>
								{section.data.length ? (
									<div className="grid gap-4 lg:grid-cols-2">{section.data.map(section.builder)}</div>
								) : (
									<p className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-4 text-sm text-slate-500">{section.empty}</p>
								)}
							</section>
						))}
				</div>
			)}
		</MotionSection>
	)
}
