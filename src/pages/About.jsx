import { motion } from 'framer-motion'

const MotionSection = motion.section

export default function About() {
  return (
    <MotionSection
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="space-y-6"
    >
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">
          Project vision
        </p>
        <h1 className="text-3xl font-bold text-black">About KickOff Hub</h1>
        <p className="max-w-2xl text-sm text-slate-600text-slate-300">
          KickOff Hub is a modern football analytics experience inspired by the depth and clarity of
          fbref.com, powered by our custom API.
        </p>
      </header>
      <div className="space-y-4">
        <div className="rounded-xl border border-slate-200 bg-white/60 p-6 shadow-smborder-slate-800bg-navy/60">
          <h2 className="text-lg font-semibold text-black">Roadmap</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-slate-600text-slate-300">
            <li>Phase 1: Layout foundation, navigation, homepage data fetch.</li>
            <li>Phase 2: Integrate API for countries, leagues, and teams.</li>
            <li>Phase 3: League and team deep dives with charts and motion.</li>
            <li>Phase 4: Advanced analytics dashboards and personalization.</li>
          </ul>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white/60 p-6 shadow-smborder-slate-800bg-navy/60">
          <h2 className="text-lg font-semibold text-black">Tech stack</h2>
          <p className="mt-2 text-sm text-slate-600text-slate-300">
            React, Vite, Tailwind CSS, Framer Motion, Zustand (light state), and modern data
            visualization libraries.
          </p>
        </div>
      </div>
    </MotionSection>
  )
}
