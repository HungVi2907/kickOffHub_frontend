import { Link } from 'react-router-dom'
import Card, { CardContent, CardTitle } from '@/shared/components/ui/Card.jsx'
import Skeleton from '@/shared/components/ui/Skeleton.jsx'
import { withFallback } from '@/shared/utils/img.js'

function Section({ title, children }) {
  return (
    <section className="space-y-2">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">{title}</p>
      {children}
    </section>
  )
}

export default function TeamSidebar({ team, venue, playersState }) {
  if (!team) {
    return (
      <Card className="p-6 text-sm text-slate-500">
        Select a team to view details.
      </Card>
    )
  }

  return (
    <Card className="space-y-5 p-5">
      <div className="flex items-start gap-4">
        <img src={withFallback(team.logo)} alt={team.name} className="h-16 w-16 rounded-full bg-white object-contain" />
        <div>
          <CardTitle className="text-xl">{team.name}</CardTitle>
          <p className="text-sm text-slate-500">
            {team.country} • Founded {team.founded || 'N/A'}
          </p>
          <Link to={`/teams/${team.id}`} className="text-xs font-semibold uppercase tracking-widest text-primary-600">
            View team page
          </Link>
        </div>
      </div>

      <Section title="Stadium">
        {venue ? (
          <CardContent className="rounded-xl bg-slate-50 text-sm text-slate-600">
            <p className="font-semibold text-slate-800">{venue.name}</p>
            <p>{venue.city}</p>
            <p className="text-xs">{venue.address}</p>
            <p className="text-xs">Capacity: {venue.capacity || 'N/A'}</p>
          </CardContent>
        ) : (
          <p className="text-sm text-slate-500">No stadium information available.</p>
        )}
      </Section>

      <Section title="Players">
        {playersState.error ? (
          <p className="text-sm text-red-500">{playersState.error.message || 'Unable to load player list'}</p>
        ) : null}
        {playersState.loading ? (
          <div className="space-y-2">
            {Array.from({ length: 4 }).map((_, idx) => (
              <Skeleton key={`player-skeleton-${idx}`} className="h-6 w-full" />
            ))}
          </div>
        ) : !playersState.data?.length ? (
          <p className="text-sm text-slate-500">Select a league and season to view the squad.</p>
        ) : (
          <ul className="max-h-60 space-y-2 overflow-auto text-sm text-slate-700">
            {playersState.data.map((player) => (
              <li key={player.playerId || player.id || player.player?.id}>
                <p className="font-medium">{player.player?.name || player.name}</p>
                <p className="text-xs text-slate-500">
                  {(player.player && player.player.position) || player.position} • #{
                    (player.player && player.player.number) || player.number || '—'
                  }
                </p>
              </li>
            ))}
          </ul>
        )}
      </Section>
    </Card>
  )
}
