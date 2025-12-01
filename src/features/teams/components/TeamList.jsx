import { Link } from 'react-router-dom'
import Card from '@/shared/components/ui/Card.jsx'
import Skeleton from '@/shared/components/ui/Skeleton.jsx'
import { buildImageUrl, withFallback } from '@/shared/utils/img.js'
import { cn } from '@/shared/utils/cn.js'

function TeamRow({ team, isActive, onSelect }) {
  return (
    <li
      className={cn(
        'flex cursor-pointer items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 shadow-sm transition hover:border-primary-200 hover:bg-primary-50/60',
        isActive && 'border-primary-300 bg-primary-50',
      )}
      onClick={() => onSelect?.(team)}
    >
      <img
        src={withFallback(team.logo)}
        alt={team.name}
        className="h-12 w-12 rounded-full border border-white/70 object-cover"
      />
      <div className="flex-1">
        <p className="text-sm font-semibold text-slate-900">{team.name}</p>
        <p className="text-xs text-slate-500">{team.country || 'Unknown'}</p>
      </div>
      <Link
        to={`/teams/${team.id}`}
        className="text-xs font-semibold uppercase tracking-widest text-primary-600 hover:text-primary-500"
        onClick={(event) => event.stopPropagation()}
      >
        Chi tiết
      </Link>
    </li>
  )
}

export default function TeamList({ teams, loading, onSelect, selectedTeam }) {
  if (loading) {
    return (
      <Card className="p-4">
        <div className="space-y-2">
          {Array.from({ length: 6 }).map((_, index) => (
            <Skeleton key={`team-skeleton-${index}`} className="h-14 w-full" />
          ))}
        </div>
      </Card>
    )
  }

  if (!teams?.length) {
    return (
      <Card className="p-6 text-sm text-slate-500">
        Không tìm thấy đội bóng phù hợp với bộ lọc hiện tại.
      </Card>
    )
  }

  return (
    <Card className="p-4">
      <ul className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {teams.map((team) => (
          <TeamRow key={team.id} team={team} isActive={selectedTeam?.id === team.id} onSelect={onSelect} />
        ))}
      </ul>
    </Card>
  )
}
