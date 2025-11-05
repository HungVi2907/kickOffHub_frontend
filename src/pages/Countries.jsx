import { motion } from 'framer-motion'

const MotionSection = motion.section

export default function Countries() {
  return (
    <MotionSection
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">
          Explorer
        </p>
        <h1 className="text-3xl font-bold text-navy dark:text-white">
          Countries
        </h1>
        <p className="max-w-2xl text-sm text-slate-600 dark:text-slate-300">
          Browse all national associations supported by the KickOff Hub API. Filters and enhanced
          search will arrive in the next iteration.
        </p>
      </header>
      <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 p-8 text-sm text-slate-500 dark:border-slate-700 dark:bg-navy/60 dark:text-slate-400">
        Country directory is under construction. Stay tuned!
      </div>
    </MotionSection>
  )
}
