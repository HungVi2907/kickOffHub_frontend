import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import apiClient from '../utils/apiClient.js'
import { ROUTES } from '../routes/paths.js'

const DEFAULT_LIMIT = 10

export default function Forum() {
  const [posts, setPosts] = useState([])
  const [pagination, setPagination] = useState({ page: 1, pageSize: DEFAULT_LIMIT, total: 0 })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [filters, setFilters] = useState({ tag: '', status: 'all' })

  const totalPages = useMemo(() => {
    if (!pagination.pageSize) return 1
    return Math.max(1, Math.ceil(pagination.total / pagination.pageSize))
  }, [pagination])

  const fetchPosts = useCallback(
    async ({ page = pagination.page, signal } = {}) => {
      setLoading(true)
      setError('')
      try {
        const params = { page, limit: pagination.pageSize }
        if (filters.tag) params.tag = filters.tag
        if (filters.status !== 'all') params.status = filters.status

        const { data } = await apiClient.get('/posts', { params, signal })
        const list = Array.isArray(data?.data) ? data.data : []
        setPosts(list)
        setPagination((prev) => ({
          page: data?.page ?? page,
          pageSize: data?.pageSize ?? prev.pageSize,
          total: data?.total ?? prev.total,
        }))
      } catch (err) {
        if (err.name === 'CanceledError') return
        const message = err.response?.data?.error || err.message || 'Không thể tải danh sách bài viết'
        setError(message)
      } finally {
        setLoading(false)
      }
    },
    [filters.tag, filters.status, pagination.page, pagination.pageSize],
  )

  useEffect(() => {
    const controller = new AbortController()
    fetchPosts({ signal: controller.signal })
    return () => controller.abort()
  }, [fetchPosts])

  const handleRefresh = () => {
    fetchPosts()
  }

  const handlePageChange = (nextPage) => {
    const page = Math.min(Math.max(nextPage, 1), totalPages)
    if (page === pagination.page) return
    fetchPosts({ page })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm backdrop-blur sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">Diễn đàn</p>
          <h1 className="text-3xl font-bold text-black">Trao đổi chiến thuật & tin tức</h1>
          <p className="text-sm text-slate-600">Chia sẻ bài viết, bình luận và tương tác với cộng đồng KickOff Hub.</p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            to={ROUTES.forumNew}
            className="inline-flex items-center justify-center rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-500"
          >
            + Viết bài mới
          </Link>
          <button
            type="button"
            onClick={handleRefresh}
            className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2 text-sm font-medium text-slate-700 transition hover:border-primary-500 hover:text-primary-600"
          >
            Làm mới
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {loading &&
          Array.from({ length: pagination.pageSize }).map((_, index) => (
            <div key={`post-skeleton-${index}`} className="h-48 animate-pulse rounded-2xl border border-slate-200 bg-white/60" />
          ))}

        {!loading && error && (
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-600">
            <p className="font-semibold">Không thể tải bài viết</p>
            <p className="mt-1">{error}</p>
          </div>
        )}

        {!loading && !error && posts.length === 0 && (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white/60 p-6 text-sm text-slate-500">
            Chưa có bài viết nào. Hãy là người đầu tiên chia sẻ!
          </div>
        )}

        {!loading && !error &&
          posts.map((post) => (
            <Link
              key={post.id}
              to={`/forum/${post.id}`}
              className="group flex h-48 flex-col justify-between rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>#{post.id}</span>
                  <span>{post.likeCount ?? 0} lượt thích</span>
                </div>
                <h3 className="text-xl font-semibold text-black transition group-hover:text-primary-600 line-clamp-2">
                  {post.title}
                </h3>
                <p className="text-sm text-slate-600 line-clamp-3">{post.content}</p>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>{post.author?.name || 'Ẩn danh'}</span>
                <time>{post.created_at ? new Date(post.created_at).toLocaleString() : 'Mới'}</time>
              </div>
              {Array.isArray(post.tags) && post.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span
                      key={tag.id || tag.name}
                      className="rounded-full bg-primary-100 px-2 py-1 text-xs font-medium text-primary-700"
                    >
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
      </div>

      {totalPages > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-full border border-slate-200 bg-white/80 px-4 py-2 text-sm shadow-sm">
          <span className="text-slate-600">
            Trang {pagination.page} / {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1 || loading}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 font-medium text-slate-600 transition hover:border-primary-400 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Trước
            </button>
            <button
              type="button"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= totalPages || loading}
              className="inline-flex items-center gap-2 rounded-full border border-slate-300 bg-white px-4 py-2 font-medium text-slate-600 transition hover:border-primary-400 hover:text-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sau
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
