import Button from '@/shared/components/ui/Button.jsx'

export default function ErrorFallback({ title = 'Có lỗi xảy ra', message, onRetry }) {
  return (
    <div className="rounded-2xl border border-red-100 bg-red-50/70 p-6 text-red-900">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="mt-2 text-sm text-red-800">{message || 'Vui lòng thử lại sau vài phút.'}</p>
      {onRetry && (
        <Button variant="destructive" className="mt-4" onClick={onRetry}>
          Thử lại
        </Button>
      )}
    </div>
  )
}
