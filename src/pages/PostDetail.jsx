import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import apiClient from '../utils/apiClient.js'
import useAuthStore from '../store/useAuthStore.js'
import { ROUTES } from '../routes/paths.js'

const STATUS_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'draft', label: 'Draft' },
]

const parseTagsInput = (raw) => {
  if (!raw) return []
  const unique = new Map()
  raw
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)
    .forEach((tag) => {
      const key = tag.toLowerCase()
      if (!unique.has(key)) {
        unique.set(key, tag)
      }
    })
  return [...unique.values()]
}

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
  const [editing, setEditing] = useState(false)
  const [editForm, setEditForm] = useState({ title: '', content: '', tags: '', status: 'public' })
  const [editError, setEditError] = useState('')
  const [editSubmitting, setEditSubmitting] = useState(false)
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')
  const [removeImage, setRemoveImage] = useState(false)
  const isAuthor = useMemo(() => {
    if (!post || !user) return false
    return post.author?.id === user.id
  }, [post, user])

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
          const message = err.response?.data?.error || err.message || 'Unable to load the post'
          setError(message)
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

  useEffect(() => {
    if (!post || !isAuthor) return
    setEditForm({
      title: post.title || '',
      content: post.content || '',
      tags: Array.isArray(post.tags) ? post.tags.map((tag) => tag.name).join(', ') : '',
      status: post.status || 'public',
    })
    setRemoveImage(false)
    setImageFile(null)
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImagePreview('')
  }, [post])

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const handleCommentChange = (event) => {
    setCommentForm({ content: event.target.value })
  }

  const handleSubmitComment = async (event) => {
    event.preventDefault()
    if (!isAuthenticated) {
      setCommentError('You must sign in to comment on this post.')
      return
    }
    if (!commentForm.content.trim()) {
      setCommentError('Comment content cannot be empty.')
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
        setRateLimitError(err.response.data?.error || 'You are commenting too quickly, please try again shortly.')
      } else {
        const message = err.response?.data?.error || err.message || 'Unable to submit comment'
        setCommentError(message)
      }
    } finally {
      setCommentLoading(false)
    }
  }

  const handleToggleLike = async () => {
    if (!isAuthenticated) {
      setError('You must sign in to like this post.')
      return
    }
    try {
      const { data } = await apiClient.post(`/posts/${postId}/like`)
      setLikeState({ liked: data.liked, count: data.likeCount })
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Unable to process the like request'
      setError(message)
    }
  }

  const handleReport = async () => {
    if (!isAuthenticated) {
      setError('You must sign in to report this post.')
      return
    }
    try {
      await apiClient.post(`/posts/${postId}/report`)
      alert('Report submitted. Thank you!')
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Unable to report the post'
      setError(message)
    }
  }

  const handleEditChange = (event) => {
    const { name, value } = event.target
    setEditForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      setImageFile(null)
      if (imagePreview) URL.revokeObjectURL(imagePreview)
      setImagePreview('')
      return
    }
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImageFile(file)
    setRemoveImage(false)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleCancelEdit = () => {
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImagePreview('')
    setImageFile(null)
    setRemoveImage(false)
    if (post) {
      setEditForm({
        title: post.title || '',
        content: post.content || '',
        tags: Array.isArray(post.tags) ? post.tags.map((tag) => tag.name).join(', ') : '',
        status: post.status || 'public',
      })
    }
    setEditing(false)
    setEditError('')
  }

  const handleSubmitEdit = async (event) => {
    event.preventDefault()
    if (!post) return
    const trimmedTitle = editForm.title.trim()
    const trimmedContent = editForm.content.trim()
    if (!trimmedTitle || !trimmedContent) {
      setEditError('Title and content cannot be empty.')
      return
    }
    setEditError('')
    setEditSubmitting(true)
    try {
      const payload = new FormData()
      payload.append('title', trimmedTitle)
      payload.append('content', trimmedContent)
      payload.append('status', editForm.status)

      const tagsArray = parseTagsInput(editForm.tags)
      payload.append('tags', JSON.stringify(tagsArray))

      if (imageFile) {
        payload.append('image', imageFile)
      } else if (removeImage) {
        payload.append('removeImage', 'true')
      }

      const { data } = await apiClient.put(`/posts/${post.id}`, payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setPost(data)
      setLikeState({ liked: data.isLikedByCurrentUser ?? likeState.liked, count: data.likeCount ?? likeState.count })
      setEditing(false)
      setImageFile(null)
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
      setImagePreview('')
      setRemoveImage(false)
    } catch (err) {
      const message = err.response?.data?.error || err.message || 'Unable to update the post'
      setEditError(message)
    } finally {
      setEditSubmitting(false)
    }
  }

  if (loading) {
    return <div className="rounded-3xl border border-slate-200 bg-white/80 p-6 shadow-sm">Loading post...</div>
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

  const imageSrc = post.imageUrl || post.image_url
  const createdAtText = post.created_at ? new Date(post.created_at).toLocaleString() : ''
  const updatedAtText = post.updated_at ? new Date(post.updated_at).toLocaleString() : ''
  const hasEdited = Boolean(post.updated_at && post.created_at && post.updated_at !== post.created_at)

  return (
    <div className="space-y-8">
      <article className="rounded-3xl border border-slate-200 bg-white/80 p-8 shadow-sm">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-2 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
            <div>
              <p>Posted by {post.author?.name || 'Anonymous'}</p>
              <time className="block text-xs text-slate-400">Created at: {createdAtText}</time>
              {hasEdited && <time className="block text-xs text-emerald-600">Last edited: {updatedAtText}</time>}
            </div>
            {isAuthor && (
              <button
                type="button"
                onClick={() => {
                  if (editing) {
                    handleCancelEdit()
                  } else {
                    setEditError('')
                    setEditing(true)
                  }
                }}
                className={`inline-flex items-center justify-center rounded-full border px-4 py-2 text-sm font-semibold transition ${
                  editing
                    ? 'border-rose-300 bg-rose-50 text-rose-600 hover:bg-rose-100'
                    : 'border-primary-200 bg-primary-50 text-primary-700 hover:border-primary-400'
                }`}
              >
                {editing ? 'Exit edit mode' : 'Edit post'}
              </button>
            )}
          </div>

          {editing ? (
            <form onSubmit={handleSubmitEdit} className="mt-2 space-y-5">
              <div className="space-y-2">
                <label htmlFor="edit-title" className="text-sm font-medium text-slate-700">
                  Title
                </label>
                <input
                  id="edit-title"
                  name="title"
                  type="text"
                  value={editForm.title}
                  onChange={handleEditChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="edit-content" className="text-sm font-medium text-slate-700">
                  Content
                </label>
                <textarea
                  id="edit-content"
                  name="content"
                  rows={10}
                  value={editForm.content}
                  onChange={handleEditChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700" htmlFor="edit-image">
                  Cover image
                </label>
                <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-4">
                  {(imagePreview || imageSrc) ? (
                    <div className="space-y-3">
                      <img
                        src={imagePreview || imageSrc}
                        alt="Post image"
                        className="max-h-80 w-full rounded-2xl object-cover"
                      />
                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <label
                          htmlFor="edit-image"
                          className="cursor-pointer rounded-full border border-primary-200 px-3 py-1 text-primary-700"
                        >
                          Choose another image
                        </label>
                        {imagePreview && (
                          <button
                            type="button"
                            onClick={() => {
                              URL.revokeObjectURL(imagePreview)
                              setImagePreview('')
                              setImageFile(null)
                            }}
                            className="text-rose-600"
                          >
                            Discard new image
                          </button>
                        )}
                        {imageSrc && !imagePreview && (
                          <button
                            type="button"
                            onClick={() => setRemoveImage((prev) => !prev)}
                            className={`text-sm font-medium ${removeImage ? 'text-emerald-600' : 'text-rose-600'}`}
                          >
                            {removeImage ? 'Undo removing image' : 'Remove current image'}
                          </button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <label
                      htmlFor="edit-image"
                      className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-4 py-8 text-center text-sm text-slate-500 hover:border-primary-300"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v.75A2.25 2.25 0 0 0 5.25 19.5h13.5A2.25 2.25 0 0 0 21 17.25V16.5M16.5 7.5 12 3m0 0L7.5 7.5M12 3v13.5" />
                      </svg>
                      <span>Click to upload from your device (max 3 MB)</span>
                    </label>
                  )}
                  <input id="edit-image" name="image" type="file" accept="image/*" className="sr-only" onChange={handleEditImageChange} />
                </div>
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-tags" className="text-sm font-medium text-slate-700">
                  Tags
                </label>
                <input
                  id="edit-tags"
                  name="tags"
                  type="text"
                  value={editForm.tags}
                  onChange={handleEditChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                  placeholder="premier league, tactics"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="edit-status" className="text-sm font-medium text-slate-700">
                  Status
                </label>
                <select
                  id="edit-status"
                  name="status"
                  value={editForm.status}
                  onChange={handleEditChange}
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {editError && <p className="text-sm text-red-600">{editError}</p>}

              <div className="flex flex-wrap gap-3">
                <button
                  type="submit"
                  disabled={editSubmitting}
                  className="inline-flex items-center justify-center rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {editSubmitting ? 'Saving...' : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 px-5 py-2 text-sm font-semibold text-slate-600 transition hover:border-slate-400"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-black">{post.title}</h1>
              <div className="prose max-w-none whitespace-pre-line text-slate-700">{post.content}</div>
              {imageSrc && (
                <div className="overflow-hidden rounded-3xl border border-slate-100 bg-slate-50">
                  <img
                    src={imageSrc}
                    alt={`Illustration for post ${post.title}`}
                    className="h-auto w-full object-cover"
                    loading="lazy"
                  />
                </div>
              )}
              {Array.isArray(post.tags) && post.tags.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {post.tags.map((tag) => (
                    <span key={tag.id || tag.name} className="rounded-full bg-primary-100 px-3 py-1 text-xs font-semibold text-primary-700">
                      #{tag.name}
                    </span>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        {!editing && (
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
              <span>{likeState.liked ? 'Liked' : 'Like'}</span>
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
              Report
            </button>
          </div>
        )}
      </article>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-black">Comments</h2>
        <div className="space-y-4">
          {post.comments?.length ? (
            post.comments.map((comment) => (
              <div key={comment.id} className="rounded-2xl border border-slate-200 bg-white/70 p-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span>{comment.author?.name || 'Anonymous'}</span>
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
            value={commentForm.content}
            onChange={handleCommentChange}
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
                Sign in
              </Link>{' '}
              to join the conversation and interact with this post.
            </p>
          )}
          <button
            type="submit"
            disabled={commentLoading || !isAuthenticated}
            className="inline-flex items-center gap-2 rounded-full bg-primary-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {commentLoading ? 'Posting...' : 'Post comment'}
          </button>
        </form>
      </section>
    </div>
  )
}
