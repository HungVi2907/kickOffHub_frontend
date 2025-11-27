export default function Footer() {
  return (
    <footer className="mt-10 border-t border-slate-200 bg-white/60 text-xs text-slate-500">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-center sm:flex-row sm:items-center sm:justify-between sm:text-left">
        <p>
          Copyright {new Date().getFullYear()} KickOff Hub. Crafted for football enthusiasts.
        </p>
        <p className="text-[11px] uppercase tracking-widest">
          Data source: KickOff Hub API | Inspired by fbref.com style
        </p>
      </div>
    </footer>
  )
}
