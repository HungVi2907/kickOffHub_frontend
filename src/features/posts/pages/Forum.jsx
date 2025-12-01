import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import Button from '@/shared/components/ui/Button.jsx'
import Card from '@/shared/components/ui/Card.jsx'
import Input from '@/shared/components/ui/Input.jsx'
import { ROUTES } from '@/app/paths.js'
import { usePosts } from '@/features/posts/hooks.js'
import { usePostFiltersStore } from '@/features/posts/store.js'
import getApiErrorMessage from '@/shared/utils/getApiErrorMessage.js'

const MotionSection = motion.section
const statusOptions = [
	{ value: 'all', label: 'All' },
	{ value: 'public', label: 'Public' },
	{ value: 'draft', label: 'Draft' },
]

export default function ForumPage() {
	const { tag, search, sort, status, page, limit, setFilters, reset } = usePostFiltersStore(
		useShallow((state) => ({
			tag: state.tag,
			search: state.search,
			sort: state.sort,
			status: state.status,
			page: state.page,
			limit: state.limit,
			setFilters: state.setFilters,
			reset: state.reset,
		})),
	)

	const queryParams = useMemo(() => {
		const params = { page, limit, sort }
		if (tag) params.tag = tag
		if (search) params.search = search
		if (status && status !== 'all') params.status = status
		return params
	}, [tag, search, sort, status, page, limit])

	const postsState = usePosts(queryParams)
	const posts = postsState.data ?? []
	const pagination = postsState.pagination ?? {}
	const currentPage = pagination.page ?? page
	const pageSize = pagination.pageSize ?? limit
	const totalItems = pagination.total ?? posts.length
	const totalPages = pagination.totalPages ?? (pageSize ? Math.max(1, Math.ceil(totalItems / pageSize)) : 1)

	const handlePageChange = (direction) => {
		const nextPage = Math.min(Math.max(currentPage + direction, 1), totalPages)
		if (nextPage === currentPage) return
		setFilters({ page: nextPage })
	}

	const handleRefresh = () => {
		postsState.refetch?.()
	}

	return (
		<MotionSection initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} className="space-y-8">
			<Card className="space-y-4 border-slate-200 bg-white/80 p-6 shadow-sm">
				<div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">Forum</p>
						<h1 className="text-3xl font-bold text-slate-900">Tactics & News Discussion</h1>
						<p className="text-sm text-slate-600">Share posts, comment, and interact with the KickOff Hub community.</p>
					</div>
					<div className="flex flex-col gap-3 sm:flex-row">
						<Link
							to={ROUTES.forumNew}
							className="inline-flex items-center justify-center rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-500"
						>
							+ Write new post
						</Link>
						<Button variant="outline" onClick={handleRefresh} className="rounded-full">
							Refresh
						</Button>
					</div>
				</div>
				<div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
					<Input
						label="Keyword"
						value={search}
						onChange={(event) => setFilters({ search: event.target.value, page: 1 })}
						placeholder="Tactics, transfer..."
					/>
					<Input
						label="Tag"
						value={tag}
						onChange={(event) => setFilters({ tag: event.target.value, page: 1 })}
						placeholder="premier league"
					/>
					<label className="text-sm font-medium text-slate-600">
						Status
						<select
							value={status}
							onChange={(event) => setFilters({ status: event.target.value, page: 1 })}
							className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none"
						>
							{statusOptions.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</label>
					<label className="text-sm font-medium text-slate-600">
						Sort by
						<select
							value={sort}
							onChange={(event) => setFilters({ sort: event.target.value, page: 1 })}
							className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-3 py-3 text-sm text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none"
						>
							<option value="newest">Newest</option>
							<option value="likes">Most Liked</option>
						</select>
					</label>
				</div>
				<div className="flex flex-wrap gap-3 text-xs text-slate-500">
					<span>
						{totalItems || 0} posts • Page {currentPage}/{totalPages}
					</span>
					<Button variant="ghost" size="sm" onClick={() => reset()}>
						Clear filters
					</Button>
				</div>
			</Card>

			{postsState.loading && (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{Array.from({ length: limit }).map((_, index) => (
						<div key={`post-skeleton-${index}`} className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white/60" />
					))}
				</div>
			)}

			{!postsState.loading && postsState.error && (
				<Card className="border-red-200 bg-red-50 text-sm text-red-600">
					<p className="font-semibold">Unable to load posts</p>
					<p className="mt-1">{getApiErrorMessage(postsState.error)}</p>
				</Card>
			)}

			{!postsState.loading && !postsState.error && posts.length === 0 && (
				<Card className="border-dashed border-slate-300 bg-white/60 text-center text-sm text-slate-500">
					No matching posts found. Be the first to share!
				</Card>
			)}

			{!postsState.loading && !postsState.error && posts.length > 0 && (
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{posts.map((post) => (
						<Link
							key={post.id}
							to={`${ROUTES.forum}/${post.id}`}
							className="group h-full"
						>
							<Card className="flex h-full flex-col justify-between border-slate-200 bg-white/80 shadow-sm transition hover:-translate-y-1 hover:shadow-lg overflow-hidden">
								{/* Post Image (if available) */}
								{(post.imageUrl || post.image_url) && (
									<div className="relative h-40 w-full overflow-hidden bg-slate-100">
										<img
											src={post.imageUrl || post.image_url}
											alt={post.title}
											className="h-full w-full object-cover transition group-hover:scale-105"
											loading="lazy"
										/>
									</div>
								)}
								<div className="flex flex-1 flex-col justify-between p-5">
									<div className="space-y-3">
										<div className="flex items-center justify-between text-xs text-slate-400">
											<span>#{post.id}</span>
											<span>{post.likeCount ?? 0} likes</span>
										</div>
										<h3 className="text-xl font-semibold text-slate-900 transition group-hover:text-primary-600 line-clamp-2">
											{post.title}
										</h3>
										<p className="text-sm text-slate-600 line-clamp-3">{post.content}</p>
									</div>
									<div className="mt-3 flex items-center justify-between text-xs text-slate-500">
										<span>{post.author?.name || post.author?.username || 'Anonymous'}</span>
										<time>{post.created_at ? new Date(post.created_at).toLocaleString() : 'New'}</time>
									</div>
									{Array.isArray(post.tags) && post.tags.length > 0 && (
										<div className="mt-3 flex flex-wrap gap-2">
											{post.tags.map((tagItem) => (
												<span key={tagItem.id || tagItem.name} className="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-700">
													#{tagItem.name}
												</span>
											))}
										</div>
									)}
								</div>
							</Card>
						</Link>
					))}
				</div>
			)}

			{totalPages > 1 && (
				<div className="flex flex-wrap items-center justify-center gap-3 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm shadow-sm">
					<span className="text-slate-600">
						Page {currentPage} / {totalPages}
					</span>
					<div className="flex items-center gap-2">
						<Button variant="outline" size="sm" onClick={() => handlePageChange(-1)} disabled={currentPage <= 1 || postsState.loading}>
							Previous
						</Button>
						<Button variant="outline" size="sm" onClick={() => handlePageChange(1)} disabled={currentPage >= totalPages || postsState.loading}>
							Next
						</Button>
					</div>
				</div>
			)}
		</MotionSection>
	)
}
