import { useCallback } from 'react'
import { useToastContext } from '@/shared/components/feedback/ToastProvider.jsx'

export function useToast() {
  const { addToast } = useToastContext()

  const toast = useCallback(
    (options) => addToast({ ...options }),
    [addToast],
  )

  toast.success = useCallback(
    (description, title = 'Thành công') =>
      addToast({ title, description, variant: 'success' }),
    [addToast],
  )

  toast.error = useCallback(
    (description, title = 'Đã có lỗi xảy ra') =>
      addToast({ title, description, variant: 'error' }),
    [addToast],
  )

  toast.warning = useCallback(
    (description, title = 'Chú ý') =>
      addToast({ title, description, variant: 'warning' }),
    [addToast],
  )

  toast.info = useCallback(
    (description, title = 'Thông báo') =>
      addToast({ title, description, variant: 'info' }),
    [addToast],
  )

  return toast
}

export default useToast
