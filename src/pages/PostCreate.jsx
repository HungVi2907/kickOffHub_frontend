import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import apiClient from '../utils/apiClient.js'
import getApiErrorMessage from '../utils/getApiErrorMessage.js'
import { ROUTES } from '@/app/paths.js'

const STATUS_OPTIONS = [
  { value: 'public', label: 'Public' },
  { value: 'draft', label: 'Draft' },
]

const parseTags = (raw) => {
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

export default function PostCreate() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', content: '', tags: '', status: 'public' })
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState('')

  useEffect(() => {
    return () => {
      if (imagePreview) {
        URL.revokeObjectURL(imagePreview)
      }
    }
  }, [imagePreview])

  const tagPreview = useMemo(() => parseTags(form.tags), [form.tags])

  const handleChange = (event) => {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleImageChange = (event) => {
    const file = event.target.files?.[0]
    if (!file) {
      setImageFile(null)
      setImagePreview('')
      return
    }
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview)
    }
    setImageFile(file)
    setImagePreview(URL.createObjectURL(file))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setSuccess('')

    const trimmedTitle = form.title.trim()
    const trimmedContent = form.content.trim()
    if (!trimmedTitle || !trimmedContent) {
      setError('Title and content are required.')
      return
    }

    setSubmitting(true)
    try {
      const payload = new FormData()
      payload.append('title', trimmedTitle)
      payload.append('content', trimmedContent)
      payload.append('status', form.status)
      if (tagPreview.length) {
        payload.append('tags', JSON.stringify(tagPreview))
      }
      if (imageFile) {
        payload.append('image', imageFile)
      }
      const { data } = await apiClient.post('/posts', payload, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setSuccess('Post published successfully! Redirecting to the article...')
      setTimeout(() => navigate(`${ROUTES.forum}/${data.id}`), 800)
    } catch (err) {
      setError(getApiErrorMessage(err, 'Không thể đăng bài viết'))
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">Share your insight</p>
            <h1 className="mt-2 text-3xl font-bold text-slate-900">Write a new post</h1>
            <p className="mt-1 text-sm text-slate-500">Share your take on tactics, players, or any competition you love.</p>
          </div>
          <Link
            to={ROUTES.forum}
            className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-primary-400 hover:text-primary-600"
          >
            ← Back to forum
          </Link>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,_2fr)_minmax(0,_1fr)]">
        <form onSubmit={handleSubmit} className="space-y-5 rounded-3xl border border-slate-200 bg-white/90 p-6 shadow-sm">
          <div className="space-y-2">
            <label htmlFor="title" className="text-sm font-medium text-slate-700">Title</label>
            <input
              id="title"
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Example: Arsenal's 4-2-3-1 build-up"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="content" className="text-sm font-medium text-slate-700">
              Post content
            </label>
            <textarea
              id="content"
              name="content"
              rows={10}
              value={form.content}
              onChange={handleChange}
              placeholder="Share your tactical take, data analysis, or match experience..."
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
            <p className="text-xs text-slate-400">Tip: break ideas into short paragraphs for readability.</p>
          </div>

            <div className="space-y-2">
              <label htmlFor="image" className="text-sm font-medium text-slate-700">
                Cover image (optional)
              </label>
              <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-4">
                {imagePreview ? (
                  <div className="space-y-3">
                  <img src={imagePreview} alt="Preview" className="h-64 w-full rounded-2xl object-cover" />
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <span>{imageFile?.name}</span>
                      <button
                        type="button"
                        onClick={() => {
                          setImageFile(null)
                          setImagePreview('')
                        }}
                        className="text-rose-600"
                      >
                        Remove image
                      </button>
                    </div>
                  </div>
                ) : (
                  <label
                    htmlFor="image"
                    className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white/70 px-4 py-8 text-center text-sm text-slate-500 hover:border-primary-300"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-primary-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v.75A2.25 2.25 0 0 0 5.25 19.5h13.5A2.25 2.25 0 0 0 21 17.25V16.5M16.5 7.5 12 3m0 0L7.5 7.5M12 3v13.5" />
                    </svg>
                    <span>Click to upload a local image (max 3 MB)</span>
                  </label>
                )}
                <input id="image" name="image" type="file" accept="image/*" onChange={handleImageChange} className="sr-only" />
              </div>
            </div>

          <div className="space-y-2">
            <label htmlFor="tags" className="text-sm font-medium text-slate-700">
              Tags (up to 10)
            </label>
            <input
              id="tags"
              name="tags"
              type="text"
              value={form.tags}
              onChange={handleChange}
              placeholder="premier league, man city, tactics"
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            />
            {tagPreview.length > 0 && (
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                {tagPreview.map((tag) => (
                  <span key={tag} className="rounded-full bg-primary-50 px-3 py-1 text-primary-700">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <label htmlFor="status" className="text-sm font-medium text-slate-700">
              Post status
            </label>
            <select
              id="status"
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                {option.label}
                </option>
              ))}
            </select>
          </div>

          {error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
          {success && <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>}

          <button
            type="submit"
            disabled={submitting}
            className="inline-flex w-full items-center justify-center rounded-2xl bg-primary-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-primary-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
          {submitting ? 'Publishing...' : 'Publish post'}
          </button>
        </form>

        <aside className="rounded-3xl border border-slate-200 bg-white/70 p-6 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Quick tips</p>
          <ul className="mt-4 space-y-3 text-sm text-slate-600">
            <li>• Minimum 50 characters with a clear, easy-to-scan structure.</li>
            <li>• Tags help readers filter topics — pick up to 10 relevant ones.</li>
            <li>• Save a draft and finish later by choosing the "Draft" status.</li>
          </ul>
          <hr className="my-4 border-dashed border-slate-200" />
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Community guidelines</p>
          <p className="mt-2 text-sm text-slate-600">
            Respect other authors, cite sources when needed, and avoid spreading misinformation.
          </p>
        </aside>
      </div>
    </div>
  )
}
