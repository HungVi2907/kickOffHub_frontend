import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import apiClient from '../utils/apiClient.js'
import useAuthStore from '../store/useAuthStore.js'
import getApiErrorMessage from '../utils/getApiErrorMessage.js'
import { ROUTES } from '@/app/paths.js'

export default function PostDetail() {
  const { postId } = useParams()
  const user = useAuthStore((state) => state.user)
  const isAuthenticated = Boolean(user)
  const currentPath = typeof window !== 'undefined' ? window.location.pathname : ROUTES.forum
  const loginRedirectUrl = `${ROUTES.login}?redirect=${encodeURIComponent(currentPath)}`
  const [post, setPost] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [commentForm, setCommentForm] = useState({ content: '' })
  const [commentError, setCommentError] = useState('')
  const [commentLoading, setCommentLoading] = useState(false)
  const [likeState, setLikeState] = useState({ liked: false, count: 0 })
  const [rateLimitError, setRateLimitError] = useState('')

  useEffect(() => {
    let ignore = false

    const fetchDetail = async () => {
      setLoading(true)
      setError('')
      try {
        const { data } = await apiClient.get(`/posts/${postId}`)
        if (!ignore) {
          setPost(data)
          setLikeState({ liked: data.isLikedByCurrentUser ?? false, count: data.likeCount ?? 0 })
        }
      } catch (err) {
        if (!ignore) {
          setError(getApiErrorMessage(err, 'Không thể tải bài viết'))
        }
      } finally {
        if (!ignore) setLoading(false)
      }
    }

    fetchDetail()
    return () => {
      ignore = true
    }
  }, [postId])

  const handleCommentChange = (event) => {
    setCommentForm({ content: event.target.value })
  }

  const handleSubmitComment = async (event) => {
    event.preventDefault()
    if (!isAuthenticated) {
      setCommentError('Bạn cần đăng nhập để bình luận bài viết này.')
      return
    }
    if (!commentForm.content.trim()) {
      setCommentError('Nội dung bình luận không được để trống')
      return
    }
    setCommentLoading(true)
    setCommentError('')
    setRateLimitError('')

    try {
      const { data } = await apiClient.post(`/posts/${postId}/comments`, commentForm)
      setPost((prev) => ({
        ...prev,
        comments: [...(prev?.comments ?? []), data],
      }))
      setCommentForm({ content: '' })
    } catch (err) {
      if (err.response?.status === 429) {
        setRateLimitError(
          err.response?.data?.error?.message || 'Bạn đang bình luận quá nhanh, vui lòng thử lại sau.'
        )
      } else {
        setCommentError(getApiErrorMessage(err, 'Không thể gửi bình luận'))
      }
    } finally {
      setCommentLoading(false)
    }
  }

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      setError('Bạn cần đăng nhập để thích bài viết.')
      return
    }
    try {
      const { data } = await apiClient.post(`/posts/${postId}/like`)
      setLikeState({ liked: data.liked, count: data.likeCount })
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể xử lý yêu cầu like'))
    }
  }

  const handleReport = async () => {
    if (!isAuthenticated) {
      setError('Bạn cần đăng nhập để báo cáo bài viết.')
      return
    }
    try {
      await apiClient.post(`/posts/${postId}/report`)
      alert('Đã gửi báo cáo bài viết. Cảm ơn bạn!')
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể báo cáo bài viết'))
    }
  }

  if (loading) {
    return <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">Đang tải bài viết...</div>
  }

  if (error) {
    return (
      <div className="rounded-3xl border border-red-200 bg-red-50 p-6 text-red-600">
        <p className="font-semibold">{error}</p>
      </div>
    )
  }

  if (!post) {
    return null
  }

  return (
    <div className="space-y-8">
      <article className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between text-sm text-slate-500">
            <span>Đăng bởi {post.author?.name || 'Ẩn danh'}</span>
            <time>{post.created_at ? new Date(post.created_at).toLocaleString() : ''}</time>
          </div>
          <h1 className="text-3xl font-bold text-black">{post.title}</h1>
          <div className="prose max-w-none text-slate-700">{post.content}</div>
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
        <div className="mt-6 flex items-center gap-3">
          <button
            type="button"
            onClick={handleToggleLike}
            disabled={!isAuthenticated}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition ${
              likeState.liked
                ? 'border-primary-500 bg-primary-600 text-white hover:bg-primary-500'
                : 'border-slate-200 bg-white text-slate-600 hover:border-primary-400 hover:text-primary-600'
            } ${!isAuthenticated ? 'opacity-60' : ''}`}
          >
            <span>{likeState.liked ? 'Đã thích' : 'Thích'}</span>
            <span className="text-xs">({likeState.count})</span>
          </button>
          <button
            type="button"
            onClick={handleReport}
            disabled={!isAuthenticated}
            className={`inline-flex items-center gap-2 rounded-full border border-rose-200 bg-white px-4 py-2 text-sm font-medium text-rose-600 transition hover:border-rose-400 hover:bg-rose-50 ${
              !isAuthenticated ? 'opacity-60' : ''
            }`}
          >
            Báo cáo
          </button>
        </div>
      </article>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-black">Bình luận</h2>
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
            value={commentForm.content}
            onChange={handleCommentChange}
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
          <button
            type="submit"
            disabled={commentLoading || !isAuthenticated}
            className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {commentLoading ? 'Đang gửi...' : 'Đăng bình luận'}
          </button>
        </form>
      </section>
    </div>
  )
}
