import Button from '@/shared/components/ui/Button.jsx'
import { cn } from '@/shared/utils/cn.js'

export default function TeamFilters({
  leagues = [],
  seasons = [],
  selectedLeague,
  selectedSeason,
  onLeagueChange,
  onSeasonChange,
  onApply,
}) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm lg:flex-row lg:items-end">
      <div className="flex-1">
        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">League</label>
        <select
          className={cn(
            'mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200',
          )}
          value={selectedLeague}
          onChange={(event) => onLeagueChange?.(event.target.value)}
        >
          <option value="">All leagues</option>
          {leagues.map((league) => (
            <option key={league.id} value={league.id}>
              {league.name}
            </option>
          ))}
        </select>
      </div>

      <div className="flex-1">
        <label className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Season</label>
        <select
          className={cn(
            'mt-1 w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm text-slate-700 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-200',
          )}
          value={selectedSeason}
          onChange={(event) => onSeasonChange?.(event.target.value)}
        >
          <option value="">All</option>
          {seasons.map((season) => (
            <option key={season.season || season.id} value={season.season || season.id}>
              {season.displayName || season.season || season.name}
            </option>
          ))}
        </select>
      </div>

      <Button onClick={onApply} className="w-full lg:w-auto">
        Apply
      </Button>
    </div>
  )
}
