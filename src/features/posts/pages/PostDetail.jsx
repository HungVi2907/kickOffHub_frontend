import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/shared/components/ui/Button.jsx'
import Card from '@/shared/components/ui/Card.jsx'
import { ROUTES } from '@/app/paths.js'
import { useAuth } from '@/features/auth/hooks.js'
import { usePostActions, usePostDetail } from '@/features/posts/hooks.js'
import getApiErrorMessage from '@/shared/utils/getApiErrorMessage.js'
import postsApi from '@/features/posts/api.js'

const MotionSection = motion.section

export default function PostDetailPage() {
	const { postId } = useParams()
	const navigate = useNavigate()
	const { isAuthenticated, user } = useAuth()
	const { data, loading, error } = usePostDetail(postId)
	const actions = usePostActions(postId)
	const [post, setPost] = useState(null)
	const [likeState, setLikeState] = useState({ liked: false, count: 0 })
	const [commentValue, setCommentValue] = useState('')
	const [commentError, setCommentError] = useState('')
	const [commentLoading, setCommentLoading] = useState(false)
	const [rateLimitError, setRateLimitError] = useState('')
	const [globalError, setGlobalError] = useState('')
	const [deleteLoading, setDeleteLoading] = useState(false)

	// Check if current user is the post owner
	const isOwner = useMemo(() => {
		if (!user?.id || !post) return false
		return user.id === post.user_id || user.id === post.author?.id
	}, [user?.id, post])

	useEffect(() => {
		if (data) {
			setPost(data)
			setLikeState({ liked: data.isLikedByCurrentUser ?? false, count: data.likeCount ?? 0 })
		}
	}, [data])

	const loginRedirectUrl = useMemo(() => {
		const currentPath = typeof window !== 'undefined' ? window.location.pathname : ROUTES.forum
		return `${ROUTES.login}?redirect=${encodeURIComponent(currentPath)}`
	}, [])

	const handleToggleLike = async () => {
		if (!isAuthenticated) {
			setGlobalError('Please log in to like this post.')
			return
		}
		try {
			const response = likeState.liked ? await actions.unlike() : await actions.like()
			const payload = response?.data ?? response ?? {}
			const liked = payload.liked ?? !likeState.liked
			const likeCount = payload.likeCount ?? (likeState.count + (liked ? 1 : -1))
			setLikeState({ liked, count: Math.max(0, likeCount) })
		} catch (err) {
			setGlobalError(getApiErrorMessage(err, 'Unable to process like request'))
		}
	}

	// TEMPORARILY DISABLED - Report feature is inactive
	// Original implementation preserved below:
	// const handleReport = async () => {
	// 	if (!isAuthenticated) {
	// 		setGlobalError('Please log in to report this post.')
	// 		return
	// 	}
	// 	try {
	// 		await actions.report({ reason: 'User report' })
	// 		setGlobalError('Report submitted. Thank you!')
	// 	} catch (err) {
	// 		setGlobalError(getApiErrorMessage(err, 'Unable to report post'))
	// 	}
	// }
	const handleReport = () => {
		// Feature temporarily disabled - no API call made
		setGlobalError('The report feature is currently disabled.')
	}

	const handleEdit = () => {
		navigate(`/forum/${postId}/edit`)
	}

	const handleDelete = async () => {
		if (!window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
			return
		}
		setDeleteLoading(true)
		setGlobalError('')
		try {
			await postsApi.remove(postId)
			navigate(ROUTES.forum, { replace: true })
		} catch (err) {
			setGlobalError(getApiErrorMessage(err, 'Unable to delete post'))
		} finally {
			setDeleteLoading(false)
		}
	}

	const handleSubmitComment = async (event) => {
		event.preventDefault()
		if (!isAuthenticated) {
			setCommentError('Please log in to comment on this post.')
			return
		}
		
		// Validate comment content
		const trimmedComment = commentValue.trim()
		if (!trimmedComment) {
			setCommentError('Comment cannot be empty')
			return
		}
		// Backend requires minimum 5 characters
		if (trimmedComment.length < 5) {
			setCommentError('Comment must be at least 5 characters')
			return
		}
		// Backend allows maximum 500 characters
		if (trimmedComment.length > 500) {
			setCommentError('Comment cannot exceed 500 characters')
			return
		}
		
		setCommentLoading(true)
		setCommentError('')
		setRateLimitError('')
		try {
			// IMPORTANT: Backend expects { content: string }
			// Using wrong key (text/comment/body) causes 400 Bad Request
			const response = await actions.comment({ content: trimmedComment })
			const newComment = response?.data ?? response
			setPost((prev) => ({ ...prev, comments: [...(prev?.comments ?? []), newComment] }))
			setCommentValue('')
		} catch (err) {
			if (err?.status === 429) {
				setRateLimitError(getApiErrorMessage(err, 'You are commenting too fast, please try again later.'))
			} else {
				setCommentError(getApiErrorMessage(err, 'Unable to submit comment'))
			}
		} finally {
			setCommentLoading(false)
		}
	}

	if (loading) {
		return <Card className="border-slate-200 bg-white/80 p-6 shadow-sm">Loading post...</Card>
	}

	if (error) {
		return (
			<Card className="border-red-200 bg-red-50 p-6 text-red-600">
				<p className="font-semibold">{getApiErrorMessage(error)}</p>
			</Card>
		)
	}

	if (!post) {
		return null
	}

	return (
		<MotionSection initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-8">
			<article className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm">
				<div className="flex flex-col gap-4">
				<div className="flex items-center justify-between text-sm text-slate-500">
					<span>Posted by {post.author?.name || post.author?.username || 'Anonymous'}</span>
						<time>{post.created_at ? new Date(post.created_at).toLocaleString() : ''}</time>
					</div>
					<h1 className="text-3xl font-bold text-slate-900">{post.title}</h1>
					
					{/* Post Image (if available) */}
					{(post.imageUrl || post.image_url) && (
						<div className="my-4 overflow-hidden rounded-xl border border-slate-200">
							<img
								src={post.imageUrl || post.image_url}
								alt={post.title}
								className="max-h-[500px] w-full object-contain bg-slate-50"
								loading="lazy"
							/>
						</div>
					)}
					
					<div className="prose max-w-none text-slate-700 whitespace-pre-line">{post.content}</div>
					{Array.isArray(post.tags) && post.tags.length > 0 && (
						<div className="flex flex-wrap gap-2">
							{post.tags.map((tag) => (
								<span key={tag.id || tag.name} className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
									#{tag.name}
								</span>
							))}
						</div>
					)}
				</div>
				<div className="mt-6 flex flex-wrap items-center gap-3">
				<Button onClick={handleToggleLike} disabled={!isAuthenticated} className={`rounded-full ${likeState.liked ? 'bg-primary-600 text-white hover:bg-primary-500' : ''}`}>
					{likeState.liked ? 'Liked' : 'Like'} ({likeState.count})
				</Button>
				{/* TEMPORARILY DISABLED - Report button hidden
				<Button variant="outline" onClick={handleReport} disabled={!isAuthenticated} className="rounded-full border-rose-200 text-rose-600 hover:border-rose-400 hover:bg-rose-50">
					Report
				</Button>
				*/}
				{isOwner && (
					<>
						<Button variant="outline" onClick={handleEdit} className="rounded-full border-blue-200 text-blue-600 hover:border-blue-400 hover:bg-blue-50">
							Edit
						</Button>
						<Button variant="outline" onClick={handleDelete} disabled={deleteLoading} className="rounded-full border-red-300 text-red-600 hover:border-red-500 hover:bg-red-50">
							{deleteLoading ? 'Deleting...' : 'Delete'}
						</Button>
					</>
				)}
				</div>
				{globalError && <p className="mt-4 text-sm text-rose-500">{globalError}</p>}
			</article>

			<section className="space-y-4">
				<h2 className="text-xl font-semibold text-slate-900">Comments</h2>
				<div className="space-y-4">
					{post.comments?.length ? (
						post.comments.map((comment) => (
							<div key={comment.id} className="rounded-2xl border border-slate-200 bg-white/70 p-4">
								<div className="flex items-center justify-between text-xs text-slate-500">
									<span>{comment.author?.name || comment.author?.username || 'Anonymous'}</span>
									<time>{comment.created_at ? new Date(comment.created_at).toLocaleString() : ''}</time>
								</div>
								<p className="mt-2 text-sm text-slate-700 whitespace-pre-line">{comment.content}</p>
							</div>
						))
					) : (
						<p className="text-sm text-slate-500">No comments yet.</p>
					)}
				</div>

				<form onSubmit={handleSubmitComment} className="space-y-3">
					<textarea
						value={commentValue}
						onChange={(event) => setCommentValue(event.target.value)}
						placeholder="Share your thoughts..."
						rows={4}
						className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
						disabled={!isAuthenticated || commentLoading}
					/>
					{commentError && <p className="text-sm text-red-600">{commentError}</p>}
					{rateLimitError && <p className="text-sm text-amber-600">{rateLimitError}</p>}
					{!isAuthenticated && (
						<p className="text-sm text-slate-500">
							<Link to={loginRedirectUrl} className="font-medium text-primary-600 hover:text-primary-500">
								Log in
							</Link>{' '}
							to join the discussion and interact with posts.
						</p>
					)}
					<Button type="submit" disabled={commentLoading || !isAuthenticated} className="rounded-full">
						{commentLoading ? 'Submitting...' : 'Post comment'}
					</Button>
				</form>
			</section>
		</MotionSection>
	)
}
