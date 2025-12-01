import { AnimatePresence, motion } from 'framer-motion'
import Spinner from '@/shared/components/ui/Spinner.jsx'
import { cn } from '@/shared/utils/cn.js'

export default function GlobalLoader({ show }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          className="fixed inset-0 z-40 flex items-center justify-center bg-white/70 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className={cn('flex flex-col items-center gap-2 text-sm font-medium text-slate-600')}>
            <Spinner size="lg" className="text-primary-600" />
            <p>Đang tải dữ liệu...</p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
