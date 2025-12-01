import { Link } from 'react-router-dom'
import Card from '@/shared/components/ui/Card.jsx'
import Skeleton from '@/shared/components/ui/Skeleton.jsx'
import { withFallback } from '@/shared/utils/img.js'

export default function PopularTeams({ teams, loading, error }) {
  if (loading) {
    return (
      <Card className="p-4">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={`popular-team-${index}`} className="h-28 w-full" />
          ))}
        </div>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="p-4 text-sm text-red-500">{error.message || 'Unable to load featured clubs'}</Card>
    )
  }

  if (!teams?.length) {
    return <Card className="p-4 text-sm text-slate-500">No featured clubs yet.</Card>
  }

  return (
    <Card className="space-y-3 p-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">Popular teams</p>
        <p className="text-sm text-slate-600">Most followed clubs by the community this week.</p>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {teams.map((team) => (
          <Link key={`popular-team-${team.id}`} to={`/teams/${team.id}`} className="group">
            <article className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-3 shadow-sm transition hover:-translate-y-1 hover:border-primary-200">
              <img
                src={withFallback(team.logo)}
                alt={team.name}
                className="h-14 w-14 rounded-full border border-white/80 object-cover"
              />
              <div>
                <p className="font-semibold text-slate-900 group-hover:text-primary-600">{team.name}</p>
                <p className="text-xs text-slate-500">{team.country}</p>
              </div>
            </article>
          </Link>
        ))}
      </div>
    </Card>
  )
}
