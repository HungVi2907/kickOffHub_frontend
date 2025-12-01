import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import Button from '@/shared/components/ui/Button.jsx'
import Input from '@/shared/components/ui/Input.jsx'
import Card from '@/shared/components/ui/Card.jsx'
import { ROUTES } from '@/app/paths.js'
import postApi from '@/features/posts/api.js'
import { usePostDetail } from '@/features/posts/hooks.js'
import { useAuth } from '@/features/auth/hooks.js'
import getApiErrorMessage from '@/shared/utils/getApiErrorMessage.js'
import { uploadImage } from "../../../api/upload";


// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Post status options for the dropdown
 */
const STATUS_OPTIONS = [
	{ value: 'public', label: 'Public' },
	{ value: 'draft', label: 'Draft' },
]

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Parse comma-separated tags string into an array of unique tags
 * @param {string} raw - Raw tags string (e.g., "tag1, tag2, TAG1")
 * @returns {string[]} - Array of unique tags (case-insensitive deduplication)
 */
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

/**
 * Convert tags array to comma-separated string
 * @param {Array} tags - Array of tag objects with name property
 * @returns {string} - Comma-separated tag names
 */
const tagsToString = (tags) => {
	if (!Array.isArray(tags)) return ''
	return tags.map(tag => tag.name || tag).join(', ')
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function PostEditPage() {
	const { postId } = useParams()
	const navigate = useNavigate()
	const { user } = useAuth()
	
	// Fetch existing post data
	const { data: existingPost, loading: loadingPost, error: loadError } = usePostDetail(postId)
	
	// -----------------------------------------------------------------------------
	// Form State
	// -----------------------------------------------------------------------------
	const [form, setForm] = useState({ title: '', content: '', tags: '', status: 'public' })
	const [initialized, setInitialized] = useState(false)
	
	// -----------------------------------------------------------------------------
	// Image Upload State
	// -----------------------------------------------------------------------------
	const [imageFile, setImageFile] = useState(null) // The selected File object
	const [imagePreview, setImagePreview] = useState('') // Object URL for preview
	const [existingImageUrl, setExistingImageUrl] = useState('') // Existing image from the post
	const [uploadingImage, setUploadingImage] = useState(false) // Upload in progress flag
	
	// -----------------------------------------------------------------------------
	// UI State
	// -----------------------------------------------------------------------------
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	// Memoized tag preview array
	const tagPreview = useMemo(() => parseTags(form.tags), [form.tags])

	// Check if current user is the post owner
	const isOwner = useMemo(() => {
		if (!user?.id || !existingPost) return false
		return user.id === existingPost.user_id || user.id === existingPost.author?.id
	}, [user?.id, existingPost])

	// Initialize form with existing post data
	useEffect(() => {
		if (existingPost && !initialized) {
			setForm({
				title: existingPost.title || '',
				content: existingPost.content || '',
				tags: tagsToString(existingPost.tags),
				status: existingPost.status || 'public',
			})
			const existingImage = existingPost.imageUrl || existingPost.image_url
			if (existingImage) {
				setExistingImageUrl(existingImage)
			}
			setInitialized(true)
		}
	}, [existingPost, initialized])

	// Redirect if not owner
	useEffect(() => {
		if (initialized && !isOwner) {
			navigate(`/forum/${postId}`, { replace: true })
		}
	}, [initialized, isOwner, postId, navigate])

	// -----------------------------------------------------------------------------
	// Event Handlers
	// -----------------------------------------------------------------------------

	/**
	 * Handle text input changes for title, content, tags, status
	 */
	const handleChange = (event) => {
		const { name, value } = event.target
		setForm((prev) => ({ ...prev, [name]: value }))
	}

	/**
	 * Handle image file selection
	 * Creates a preview URL and stores the file for upload
	 */
	const handleImageChange = (event) => {
		const file = event.target.files?.[0]
		if (!file) return

		// Validate file type
		const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
		if (!allowedTypes.includes(file.type)) {
			setError('Please select a valid image file (JPEG, PNG, GIF, WebP)');
			return;
		}
		// Validate file size (5MB)
		const maxFileSize = 5 * 1024 * 1024;
		if (file.size > maxFileSize) {
			setError('Maximum image size is 5MB');
			return;
		}

		// Clear any previous errors
		setError('')

		// Revoke previous preview URL to prevent memory leaks
		if (imagePreview) {
			URL.revokeObjectURL(imagePreview)
		}

		// Store file and create preview (this replaces existing image)
		setImageFile(file)
		setImagePreview(URL.createObjectURL(file))
		setExistingImageUrl('') // Clear existing image when selecting new one
	}

	/**
	 * Remove the selected/existing image
	 */
	const handleRemoveImage = () => {
		if (imagePreview) {
			URL.revokeObjectURL(imagePreview)
		}
		setImageFile(null)
		setImagePreview('')
		setExistingImageUrl('')
	}

	/**
	 * Handle form submission
	 * 1. Validate required fields
	 * 2. Upload image to Cloudinary (if new image selected)
	 * 3. Update post with imageUrl
	 * 4. Navigate to the post
	 */
	const handleSubmit = async (event) => {
		event.preventDefault()
		setError('')
		setSuccess('')

		// Validate required fields
		const trimmedTitle = form.title.trim()
		const trimmedContent = form.content.trim()
		if (!trimmedTitle || !trimmedContent) {
			setError('Title and content are required.')
			return
		}

		setSubmitting(true)
		try {
			// ---------------------------------------------------------------------
			// Step 1: Upload new image via backend API (if new image selected)
			// ---------------------------------------------------------------------
			let imageUrl = existingImageUrl || null;
			if (imageFile) {
				setUploadingImage(true);
				try {
					imageUrl = await uploadImage(imageFile);
					if (!imageUrl) {
						throw new Error('Upload succeeded but no URL returned');
					}
					console.log('✅ Image uploaded successfully:', imageUrl);
				} catch (uploadError) {
					console.error('❌ Image upload failed:', uploadError);
					throw new Error(`Image upload error: ${uploadError.message}`);
				} finally {
					setUploadingImage(false);
				}
			}

			// ---------------------------------------------------------------------
			// Step 2: Build payload and update post
			// ---------------------------------------------------------------------
			const payload = {
				title: trimmedTitle,
				content: trimmedContent,
				status: form.status,
			}

			// Add tags if provided
			if (tagPreview.length) {
				payload.tags = tagPreview
			}

			// Add image URL (new upload, existing, or null if removed)
			payload.imageUrl = imageUrl

			// ---------------------------------------------------------------------
			// Step 3: Call API to update the post
			// ---------------------------------------------------------------------
			await postApi.update(postId, payload)

			// ---------------------------------------------------------------------
			// Step 4: Success! Navigate to the post
			// ---------------------------------------------------------------------
			setSuccess('Post updated successfully! Redirecting...')
			setTimeout(() => navigate(`${ROUTES.forum}/${postId}`), 800)

		} catch (err) {
			setError(getApiErrorMessage(err, 'Unable to update post'))
		} finally {
			setSubmitting(false)
		}
	}

	// Loading state
	if (loadingPost) {
		return (
			<Card className="border-slate-200 bg-white/80 p-6 shadow-sm">
				Loading post...
			</Card>
		)
	}

	// Error loading post
	if (loadError) {
		return (
			<Card className="border-red-200 bg-red-50 p-6 text-red-600">
				<p className="font-semibold">{getApiErrorMessage(loadError)}</p>
				<Link to={ROUTES.forum} className="mt-4 inline-block text-sm underline">
					Back to forum
				</Link>
			</Card>
		)
	}

	// Not owner - show nothing while redirecting
	if (initialized && !isOwner) {
		return null
	}

	return (
		<div className="space-y-6">
			<Card className="border-slate-200 bg-white/90 p-6 shadow-sm">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">Edit post</p>
						<h1 className="mt-2 text-3xl font-bold text-slate-900">Update your post</h1>
						<p className="mt-1 text-sm text-slate-500">Make changes to your post content, tags, or image.</p>
					</div>
					<Link
						to={`/forum/${postId}`}
						className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-primary-400 hover:text-primary-600"
					>
						← Back to post
					</Link>
				</div>
			</Card>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,_2fr)_minmax(0,_1fr)]">
				<Card as="form" onSubmit={handleSubmit} className="space-y-5 border-slate-200 bg-white/90 p-6 shadow-sm">
					{/* ---------------------------------------------------------------------
					    Title Input
					--------------------------------------------------------------------- */}
					<Input
						label="Title"
						id="title"
						name="title"
						value={form.title}
						onChange={handleChange}
						placeholder="e.g., Analyzing Arsenal's 4-2-3-1 formation"
					/>

					{/* ---------------------------------------------------------------------
					    Content Textarea
					--------------------------------------------------------------------- */}
					<label className="text-sm font-medium text-slate-700" htmlFor="content">
						Post content
						<textarea
							id="content"
							name="content"
							rows={10}
							value={form.content}
							onChange={handleChange}
							placeholder="Share your tactical insights, data analysis, or experience..."
							className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
						/>
					</label>
					<p className="text-xs text-slate-400">Tip: break into small paragraphs for better readability.</p>

					{/* ---------------------------------------------------------------------
					    Image Upload Section
					--------------------------------------------------------------------- */}
					<div className="space-y-3">
						<label className="text-sm font-medium text-slate-700">
							Cover image (optional)
						</label>
						
						{/* File Input */}
						<div className="flex items-center gap-3">
							<label className="cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 transition hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600">
								<span className="flex items-center gap-2">
									<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
									</svg>
									{imageFile ? 'Change image' : existingImageUrl ? 'Replace image' : 'Select image'}
								</span>
								<input
									type="file"
									accept="image/*"
									onChange={handleImageChange}
									className="hidden"
									disabled={submitting}
								/>
							</label>
							
							{imageFile && (
								<span className="text-xs text-slate-500">
									{imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
								</span>
							)}
						</div>

						{/* Image Preview (new upload or existing) */}
						{(imagePreview || existingImageUrl) && (
							<div className="relative inline-block">
								<img
									src={imagePreview || existingImageUrl}
									alt="Preview"
									className="max-h-48 rounded-xl border border-slate-200 object-cover shadow-sm"
								/>
								{/* Remove Image Button */}
								<button
									type="button"
									onClick={handleRemoveImage}
									disabled={submitting}
									className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition hover:bg-red-600 disabled:opacity-50"
									title="Remove image"
								>
									<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						)}

						<p className="text-xs text-slate-400">
							Supported formats: JPEG, PNG, GIF, WebP. Maximum size: 5MB.
						</p>
					</div>

					{/* ---------------------------------------------------------------------
					    Tags Input
					--------------------------------------------------------------------- */}
					<Input
						label="Tags (max 10)"
						id="tags"
						name="tags"
						value={form.tags}
						onChange={handleChange}
						placeholder="premier league, man city, tactics"
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

					{/* ---------------------------------------------------------------------
					    Status Select
					--------------------------------------------------------------------- */}
					<label className="text-sm font-medium text-slate-700">
						Post status
						<select
							id="status"
							name="status"
							value={form.status}
							onChange={handleChange}
							className="mt-1 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
						>
							{STATUS_OPTIONS.map((option) => (
								<option key={option.value} value={option.value}>
									{option.label}
								</option>
							))}
						</select>
					</label>

					{/* ---------------------------------------------------------------------
					    Error / Success Messages
					--------------------------------------------------------------------- */}
					{error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
					{success && <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>}

					{/* ---------------------------------------------------------------------
					    Submit Button
					--------------------------------------------------------------------- */}
					<Button type="submit" isLoading={submitting || uploadingImage} className="w-full rounded-2xl">
						{uploadingImage 
							? 'Uploading image...' 
							: submitting 
								? 'Updating post...' 
								: 'Update post'}
					</Button>
				</Card>

				<Card className="space-y-4 border-slate-200 bg-white/70 p-6 shadow-sm">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Editing tips</p>
						<ul className="mt-4 space-y-3 text-sm text-slate-600">
							<li>• Minimum 50 characters of content, with clear formatting preferred.</li>
							<li>• Tags help readers filter by topic — use up to 10 tags.</li>
							<li>• You can save as draft to hide the post temporarily.</li>
						</ul>
					</div>
					<hr className="border-dashed border-slate-200" />
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Community guidelines</p>
						<p className="mt-2 text-sm text-slate-600">Respect other authors, cite sources when needed, and avoid sharing misleading information.</p>
					</div>
				</Card>
			</div>
		</div>
	)
}
