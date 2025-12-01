import { Fragment, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/shared/utils/cn.js'
import Button from './Button.jsx'

const modalRoot = typeof document !== 'undefined' ? document.body : null

export default function Modal({
  open,
  onClose,
  title,
  children,
  size = 'md',
  hideCloseButton = false,
  className,
}) {
  useEffect(() => {
    if (!modalRoot || !open) return
    const original = modalRoot.style.overflow
    modalRoot.style.overflow = 'hidden'
    return () => {
      modalRoot.style.overflow = original
    }
  }, [open])

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
  }

  if (!modalRoot) return null

  return createPortal(
    <AnimatePresence>
      {open && (
        <Fragment>
          <motion.div
            className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <div className={cn('w-full rounded-2xl bg-white p-6 shadow-xl', sizeClasses[size], className)}>
              <div className="flex items-start justify-between gap-4">
                {typeof title === 'string' ? (
                  <h3 className="text-lg font-semibold text-slate-900">{title}</h3>
                ) : (
                  title
                )}
                {!hideCloseButton && (
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label="Đóng"
                    onClick={onClose}
                    className="text-slate-400 hover:text-slate-600"
                  >
                    ×
                  </Button>
                )}
              </div>
              <div className="mt-4 text-sm text-slate-700">{children}</div>
            </div>
          </motion.div>
        </Fragment>
      )}
    </AnimatePresence>,
    modalRoot,
  )
}
