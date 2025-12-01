import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '@/shared/components/ui/Button.jsx'
import Input from '@/shared/components/ui/Input.jsx'
import Card from '@/shared/components/ui/Card.jsx'
import { ROUTES } from '@/app/paths.js'
import postApi from '@/features/posts/api.js'
// Đã loại bỏ Cloudinary, chỉ dùng API backend
import getApiErrorMessage from '@/shared/utils/getApiErrorMessage.js'
import { uploadImage } from "../api/upload";

const imageUrl = await uploadImage(selectedFile);

// =============================================================================
// CONSTANTS
// =============================================================================

/**
 * Post status options for the dropdown
 */
const STATUS_OPTIONS = [
	{ value: 'public', label: 'Công khai' },
	{ value: 'draft', label: 'Lưu nháp' },
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

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function PostCreatePage() {
	const navigate = useNavigate()
	
	// -----------------------------------------------------------------------------
	// Form State
	// -----------------------------------------------------------------------------
	const [form, setForm] = useState({ title: '', content: '', tags: '', status: 'public' })
	
	// -----------------------------------------------------------------------------
	// Image Upload State
	// -----------------------------------------------------------------------------
	const [imageFile, setImageFile] = useState(null) // The selected File object
	const [imagePreview, setImagePreview] = useState('') // Object URL for preview
	const [uploadingImage, setUploadingImage] = useState(false) // Upload in progress flag
	
	// -----------------------------------------------------------------------------
	// UI State
	// -----------------------------------------------------------------------------
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	// Memoized tag preview array
	const tagPreview = useMemo(() => parseTags(form.tags), [form.tags])

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
					setError('Vui lòng chọn file ảnh hợp lệ (JPEG, PNG, GIF, WebP)');
					return;
				}
				// Validate file size (5MB)
				const maxFileSize = 5 * 1024 * 1024;
				if (file.size > maxFileSize) {
					setError('Kích thước ảnh tối đa là 5MB');
					return;
				}

		// Clear any previous errors
		setError('')

		// Revoke previous preview URL to prevent memory leaks
		if (imagePreview) {
			URL.revokeObjectURL(imagePreview)
		}

		// Store file and create preview
		setImageFile(file)
		setImagePreview(URL.createObjectURL(file))
	}

	/**
	 * Remove the selected image
	 */
	const handleRemoveImage = () => {
		if (imagePreview) {
			URL.revokeObjectURL(imagePreview)
		}
		setImageFile(null)
		setImagePreview('')
	}

	/**
	 * Handle form submission
	 * 1. Validate required fields
	 * 2. Upload image to Cloudinary (if selected)
	 * 3. Create post with imageUrl
	 * 4. Navigate to the new post
	 */
	const handleSubmit = async (event) => {
		event.preventDefault()
		setError('')
		setSuccess('')

		// Validate required fields
		const trimmedTitle = form.title.trim()
		const trimmedContent = form.content.trim()
		if (!trimmedTitle || !trimmedContent) {
			setError('Tiêu đề và nội dung là bắt buộc.')
			return
		}

		setSubmitting(true)
		try {
			// ---------------------------------------------------------------------
			// Step 1: Upload image qua API backend (nếu có ảnh)
			// ---------------------------------------------------------------------
			let imageUrl = null;
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
					throw new Error(`Lỗi tải ảnh: ${uploadError.message}`);
				} finally {
					setUploadingImage(false);
				}
			}

			// ---------------------------------------------------------------------
			// Step 2: Build payload and create post
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

			// Add image URL if uploaded successfully
			if (imageUrl) {
				payload.imageUrl = imageUrl
			}

			// ---------------------------------------------------------------------
			// Step 3: Call API to create the post
			// ---------------------------------------------------------------------
			const response = await postApi.create(payload)
			const created = response?.data ?? response

			if (!created?.id) {
				throw new Error('Phản hồi không hợp lệ, thiếu ID bài viết')
			}

			// ---------------------------------------------------------------------
			// Step 4: Success! Navigate to the new post
			// ---------------------------------------------------------------------
			setSuccess('Đăng bài thành công! Đang chuyển đến bài viết...')
			setTimeout(() => navigate(`${ROUTES.forum}/${created.id}`), 800)

		} catch (err) {
			setError(getApiErrorMessage(err, 'Không thể đăng bài viết'))
		} finally {
			setSubmitting(false)
		}
	}

	return (
		<div className="space-y-6">
			<Card className="border-slate-200 bg-white/90 p-6 shadow-sm">
				<div className="flex flex-wrap items-start justify-between gap-4">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">Chia sẻ kiến thức</p>
						<h1 className="mt-2 text-3xl font-bold text-slate-900">Viết bài mới</h1>
						<p className="mt-1 text-sm text-slate-500">Lan tỏa góc nhìn của bạn về chiến thuật, cầu thủ hay giải đấu bạn yêu thích.</p>
					</div>
					<Link
						to={ROUTES.forum}
						className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-primary-400 hover:text-primary-600"
					>
						← Quay lại diễn đàn
					</Link>
				</div>
			</Card>

			<div className="grid gap-6 lg:grid-cols-[minmax(0,_2fr)_minmax(0,_1fr)]">
				<Card as="form" onSubmit={handleSubmit} className="space-y-5 border-slate-200 bg-white/90 p-6 shadow-sm">
					{/* ---------------------------------------------------------------------
					    Title Input
					--------------------------------------------------------------------- */}
					<Input
						label="Tiêu đề"
						id="title"
						name="title"
						value={form.title}
						onChange={handleChange}
						placeholder="Ví dụ: Phân tích 4-2-3-1 của Arsenal"
					/>

					{/* ---------------------------------------------------------------------
					    Content Textarea
					--------------------------------------------------------------------- */}
					<label className="text-sm font-medium text-slate-700" htmlFor="content">
						Nội dung bài viết
						<textarea
							id="content"
							name="content"
							rows={10}
							value={form.content}
							onChange={handleChange}
							placeholder="Chia sẻ góc nhìn chiến thuật, phân tích dữ liệu hoặc trải nghiệm của bạn..."
							className="mt-2 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 shadow-sm transition focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200"
						/>
					</label>
					<p className="text-xs text-slate-400">Mẹo: hãy chia thành từng đoạn nhỏ để dễ đọc hơn.</p>

					{/* ---------------------------------------------------------------------
					    Image Upload Section
					--------------------------------------------------------------------- */}
					<div className="space-y-3">
						<label className="text-sm font-medium text-slate-700">
							Ảnh minh họa (tùy chọn)
						</label>
						
						{/* File Input */}
						<div className="flex items-center gap-3">
							<label className="cursor-pointer rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-3 text-sm text-slate-600 transition hover:border-primary-400 hover:bg-primary-50 hover:text-primary-600">
								<span className="flex items-center gap-2">
									<svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
									</svg>
									{imageFile ? 'Thay đổi ảnh' : 'Chọn ảnh'}
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

						{/* Image Preview */}
						{imagePreview && (
							<div className="relative inline-block">
								<img
									src={imagePreview}
									alt="Preview"
									className="max-h-48 rounded-xl border border-slate-200 object-cover shadow-sm"
								/>
								{/* Remove Image Button */}
								<button
									type="button"
									onClick={handleRemoveImage}
									disabled={submitting}
									className="absolute -right-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-white shadow-md transition hover:bg-red-600 disabled:opacity-50"
									title="Xóa ảnh"
								>
									<svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						)}

						<p className="text-xs text-slate-400">
							Định dạng hỗ trợ: JPEG, PNG, GIF, WebP. Kích thước tối đa: 5MB.
						</p>
					</div>

					{/* ---------------------------------------------------------------------
					    Tags Input
					--------------------------------------------------------------------- */}
					<Input
						label="Tags (tối đa 10)"
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
						Trạng thái bài viết
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
							? 'Đang tải ảnh lên...' 
							: submitting 
								? 'Đang đăng bài...' 
								: 'Xuất bản bài viết'}
					</Button>
				</Card>

				<Card className="space-y-4 border-slate-200 bg-white/70 p-6 shadow-sm">
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Hướng dẫn nhanh</p>
						<ul className="mt-4 space-y-3 text-sm text-slate-600">
							<li>• Nội dung tối thiểu 50 ký tự, ưu tiên bố cục rõ ràng.</li>
							<li>• Tags giúp người đọc dễ lọc chủ đề — hãy chọn tối đa 10 thẻ.</li>
							<li>• Bạn có thể lưu nháp và hoàn thiện sau bằng cách chọn trạng thái "Lưu nháp".</li>
						</ul>
					</div>
					<hr className="border-dashed border-slate-200" />
					<div>
						<p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Quy tắc cộng đồng</p>
						<p className="mt-2 text-sm text-slate-600">Tôn trọng tác giả khác, dẫn nguồn khi cần thiết và tránh chia sẻ thông tin sai lệch.</p>
					</div>
				</Card>
			</div>
		</div>
	)
}
