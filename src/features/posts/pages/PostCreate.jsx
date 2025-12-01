import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import Button from '@/shared/components/ui/Button.jsx'
import Input from '@/shared/components/ui/Input.jsx'
import Card from '@/shared/components/ui/Card.jsx'
import { ROUTES } from '@/app/paths.js'
import postApi from '@/features/posts/api.js'
import getApiErrorMessage from '@/shared/utils/getApiErrorMessage.js'

const STATUS_OPTIONS = [
	{ value: 'public', label: 'Công khai' },
	{ value: 'draft', label: 'Lưu nháp' },
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

export default function PostCreatePage() {
	const navigate = useNavigate()
	const [form, setForm] = useState({ title: '', content: '', tags: '', status: 'public' })
	const [submitting, setSubmitting] = useState(false)
	const [error, setError] = useState('')
	const [success, setSuccess] = useState('')

	const tagPreview = useMemo(() => parseTags(form.tags), [form.tags])

	const handleChange = (event) => {
		const { name, value } = event.target
		setForm((prev) => ({ ...prev, [name]: value }))
	}

	const handleSubmit = async (event) => {
		event.preventDefault()
		setError('')
		setSuccess('')

		const trimmedTitle = form.title.trim()
		const trimmedContent = form.content.trim()
		if (!trimmedTitle || !trimmedContent) {
			setError('Tiêu đề và nội dung là bắt buộc.')
			return
		}

		setSubmitting(true)
		try {
			const payload = {
				title: trimmedTitle,
				content: trimmedContent,
				status: form.status,
			}
			if (tagPreview.length) {
				payload.tags = tagPreview
			}
			const response = await postApi.create(payload)
			const created = response?.data ?? response
			if (!created?.id) {
				throw new Error('Phản hồi không hợp lệ, thiếu ID bài viết')
			}
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
					<Input
						label="Tiêu đề"
						id="title"
						name="title"
						value={form.title}
						onChange={handleChange}
						placeholder="Ví dụ: Phân tích 4-2-3-1 của Arsenal"
					/>

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

					{error && <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>}
					{success && <p className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{success}</p>}

					<Button type="submit" isLoading={submitting} className="w-full rounded-2xl">
						{submitting ? 'Đang đăng bài...' : 'Xuất bản bài viết'}
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
