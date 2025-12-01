import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/shared/components/ui/Button.jsx'
import Card from '@/shared/components/ui/Card.jsx'
import { ROUTES } from '@/app/paths.js'
import { useAuth } from '@/features/auth/hooks.js'
import { usePostActions, usePostDetail } from '@/features/posts/hooks.js'
import getApiErrorMessage from '@/shared/utils/getApiErrorMessage.js'

const MotionSection = motion.section

export default function PostDetailPage() {
	const { postId } = useParams()
	const { isAuthenticated } = useAuth()
	const { data, loading, error } = usePostDetail(postId)
	const actions = usePostActions(postId)
	const [post, setPost] = useState(null)
	const [likeState, setLikeState] = useState({ liked: false, count: 0 })
	const [commentValue, setCommentValue] = useState('')
	const [commentError, setCommentError] = useState('')
	const [commentLoading, setCommentLoading] = useState(false)
	const [rateLimitError, setRateLimitError] = useState('')
	const [globalError, setGlobalError] = useState('')

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
			setGlobalError('Bạn cần đăng nhập để thích bài viết.')
			return
		}
		try {
			const response = likeState.liked ? await actions.unlike() : await actions.like()
			const payload = response?.data ?? response ?? {}
			const liked = payload.liked ?? !likeState.liked
			const likeCount = payload.likeCount ?? (likeState.count + (liked ? 1 : -1))
			setLikeState({ liked, count: Math.max(0, likeCount) })
		} catch (err) {
			setGlobalError(getApiErrorMessage(err, 'Không thể xử lý yêu cầu like'))
		}
	}

	const handleReport = async () => {
		if (!isAuthenticated) {
			setGlobalError('Bạn cần đăng nhập để báo cáo bài viết.')
			return
		}
		try {
			await actions.report({ reason: 'User report' })
			setGlobalError('Đã gửi báo cáo bài viết. Cảm ơn bạn!')
		} catch (err) {
			setGlobalError(getApiErrorMessage(err, 'Không thể báo cáo bài viết'))
		}
	}

	const handleSubmitComment = async (event) => {
		event.preventDefault()
		if (!isAuthenticated) {
			setCommentError('Bạn cần đăng nhập để bình luận bài viết này.')
			return
		}
		
		// Validate comment content
		const trimmedComment = commentValue.trim()
		if (!trimmedComment) {
			setCommentError('Nội dung bình luận không được để trống')
			return
		}
		// Backend requires minimum 5 characters
		if (trimmedComment.length < 5) {
			setCommentError('Bình luận phải có ít nhất 5 ký tự')
			return
		}
		// Backend allows maximum 500 characters
		if (trimmedComment.length > 500) {
			setCommentError('Bình luận không được vượt quá 500 ký tự')
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
				setRateLimitError(getApiErrorMessage(err, 'Bạn đang bình luận quá nhanh, vui lòng thử lại sau.'))
			} else {
				setCommentError(getApiErrorMessage(err, 'Không thể gửi bình luận'))
			}
		} finally {
			setCommentLoading(false)
		}
	}

	if (loading) {
		return <Card className="border-slate-200 bg-white/80 p-6 shadow-sm">Đang tải bài viết...</Card>
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
						<span>Đăng bởi {post.author?.name || 'Ẩn danh'}</span>
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
						{likeState.liked ? 'Đã thích' : 'Thích'} ({likeState.count})
					</Button>
					<Button variant="outline" onClick={handleReport} disabled={!isAuthenticated} className="rounded-full border-rose-200 text-rose-600 hover:border-rose-400 hover:bg-rose-50">
						Báo cáo
					</Button>
				</div>
				{globalError && <p className="mt-4 text-sm text-rose-500">{globalError}</p>}
			</article>

			<section className="space-y-4">
				<h2 className="text-xl font-semibold text-slate-900">Bình luận</h2>
				<div className="space-y-4">
					{post.comments?.length ? (
						post.comments.map((comment) => (
							<div key={comment.id} className="rounded-2xl border border-slate-200 bg-white/70 p-4">
								<div className="flex items-center justify-between text-xs text-slate-500">
									<span>{comment.author?.name || 'Ẩn danh'}</span>
									<time>{comment.created_at ? new Date(comment.created_at).toLocaleString() : ''}</time>
								</div>
								<p className="mt-2 text-sm text-slate-700 whitespace-pre-line">{comment.content}</p>
							</div>
						))
					) : (
						<p className="text-sm text-slate-500">Chưa có bình luận nào.</p>
					)}
				</div>

				<form onSubmit={handleSubmitComment} className="space-y-3">
					<textarea
						value={commentValue}
						onChange={(event) => setCommentValue(event.target.value)}
						placeholder="Chia sẻ cảm nghĩ của bạn..."
						rows={4}
						className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
						disabled={!isAuthenticated || commentLoading}
					/>
					{commentError && <p className="text-sm text-red-600">{commentError}</p>}
					{rateLimitError && <p className="text-sm text-amber-600">{rateLimitError}</p>}
					{!isAuthenticated && (
						<p className="text-sm text-slate-500">
							<Link to={loginRedirectUrl} className="font-medium text-primary-600 hover:text-primary-500">
								Đăng nhập
							</Link>{' '}
							để tham gia bình luận và tương tác với bài viết.
						</p>
					)}
					<Button type="submit" disabled={commentLoading || !isAuthenticated} className="rounded-full">
						{commentLoading ? 'Đang gửi...' : 'Đăng bình luận'}
					</Button>
				</form>
			</section>
		</MotionSection>
	)
}
