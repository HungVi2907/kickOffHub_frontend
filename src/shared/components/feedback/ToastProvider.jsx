import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import Button from '@/shared/components/ui/Button.jsx'
import { cn } from '@/shared/utils/cn.js'

const ToastContext = createContext(null)

const toastVariants = {
  info: 'border-slate-200 bg-white text-slate-800',
  success: 'border-emerald-200 bg-emerald-50 text-emerald-900',
  error: 'border-red-200 bg-red-50 text-red-900',
  warning: 'border-amber-200 bg-amber-50 text-amber-900',
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const timersRef = useRef(new Map())

  const removeToast = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id))
    const timeout = timersRef.current.get(id)
    if (timeout) {
      clearTimeout(timeout)
      timersRef.current.delete(id)
    }
  }, [])

  const addToast = useCallback((toast) => {
    const id = toast.id || crypto.randomUUID?.() || String(Date.now())
    setToasts((current) => [...current, { id, variant: 'info', duration: 4000, ...toast }])

    if (toast.duration !== Infinity) {
      const timer = setTimeout(() => removeToast(id), toast.duration ?? 4000)
      timersRef.current.set(id, timer)
    }
    return id
  }, [removeToast])

  const value = useMemo(
    () => ({ addToast, removeToast }),
    [addToast, removeToast],
  )

  return (
    <ToastContext.Provider value={value}>
      {children}
      {typeof document !== 'undefined' &&
        createPortal(
          <div className="pointer-events-none fixed inset-x-0 top-4 z-[60] flex justify-center px-4">
            <div className="flex w-full max-w-md flex-col gap-3">
              <AnimatePresence>
                {toasts.map((toast) => (
                  <motion.div
                    key={toast.id}
                    initial={{ opacity: 0, y: -8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.2 }}
                    className={cn(
                      'pointer-events-auto rounded-2xl border p-4 shadow-lg shadow-slate-900/10',
                      toastVariants[toast.variant] || toastVariants.info,
                    )}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        {toast.title && <p className="text-sm font-semibold">{toast.title}</p>}
                        {toast.description && <p className="text-sm opacity-80">{toast.description}</p>}
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeToast(toast.id)}
                        className="text-current"
                        aria-label="Close notification"
                      >
                        ×
                      </Button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>,
          document.body,
        )}
    </ToastContext.Provider>
  )
}

export function useToastContext() {
  const ctx = useContext(ToastContext)
  if (!ctx) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return ctx
}

export default ToastProvider
