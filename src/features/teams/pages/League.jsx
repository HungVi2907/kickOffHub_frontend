import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Card from '@/shared/components/ui/Card.jsx'
import Skeleton from '@/shared/components/ui/Skeleton.jsx'
import Button from '@/shared/components/ui/Button.jsx'
import { withFallback } from '@/shared/utils/img.js'
import {
  useTeamsMeta,
  useLeagueDetail,
  useLeagueTeams,
} from '@/features/teams/hooks.js'

const MotionSection = motion.section
const MotionCard = motion.article
const DEFAULT_SEASON = 2023

export default function LeaguePage() {
  const { leagueId } = useParams()
  const navigate = useNavigate()
  const meta = useTeamsMeta()
  const [season, setSeason] = useState(DEFAULT_SEASON)

  useEffect(() => {
    if (meta.seasons?.length && !season) {
      const sorted = [...meta.seasons]
        .map((entry) => Number(entry.season ?? entry.id ?? entry))
        .filter((value) => Number.isInteger(value))
        .sort((a, b) => b - a)
      if (sorted.length) {
        setSeason(sorted.includes(DEFAULT_SEASON) ? DEFAULT_SEASON : sorted[0])
      }
    }
  }, [meta.seasons, season])

  const leagueDetail = useLeagueDetail(leagueId)
  const leagueTeams = useLeagueTeams(leagueId, season)
  const hasLeagueSelected = Boolean(leagueId)

  const seasonOptions = useMemo(() => {
    return meta.seasons
      .map((entry) => Number(entry.season ?? entry.id ?? entry))
      .filter((value) => Number.isInteger(value))
      .sort((a, b) => b - a)
  }, [meta.seasons])

  if (!hasLeagueSelected) {
    return (
      <div className="space-y-10">
        <MotionSection
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="space-y-6"
        >
          <header className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">Competitions</p>
            <h1 className="text-3xl font-bold text-slate-900">Leagues</h1>
            <p className="text-sm text-slate-600">Chọn giải đấu để xem chi tiết và danh sách câu lạc bộ theo mùa giải.</p>
          </header>
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-slate-900">Các mùa giải được hỗ trợ</h2>
            {meta.loading ? (
              <Skeleton className="mt-4 h-6 w-full" />
            ) : (
              <div className="mt-4 flex flex-wrap gap-2">
                {seasonOptions.map((seasonValue) => (
                  <span
                    key={seasonValue}
                    className="rounded-full bg-primary-50 px-3 py-1 text-xs font-semibold text-primary-700"
                  >
                    {seasonValue}
                  </span>
                ))}
              </div>
            )}
          </Card>
        </MotionSection>

        <section className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">Danh sách giải đấu</h2>
            <p className="text-sm text-slate-600">Bấm vào giải đấu để xem chi tiết và đội tham dự.</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {meta.loading &&
              Array.from({ length: 6 }).map((_, index) => (
                <Skeleton key={`league-skeleton-${index}`} className="h-36 w-full" />
              ))}
            {!meta.loading &&
              meta.leagues.map((league, index) => (
                <MotionCard
                  key={league.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.02 * index }}
                  className="group flex h-36 cursor-pointer flex-col justify-between rounded-2xl border border-slate-100 bg-white p-5 shadow-sm transition hover:-translate-y-1"
                  onClick={() => navigate(`/league/${league.id}`)}
                >
                  <div className="flex items-start gap-4">
                    <div className="flex h-14 w-14 items-center justify-center rounded-full border border-slate-200 bg-white">
                      {league.logo ? (
                        <img src={withFallback(league.logo)} alt={league.name} className="h-12 w-12 object-contain" />
                      ) : (
                        <span className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">League</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-lg font-semibold text-slate-900 group-hover:text-primary-600">
                        {league.name}
                      </p>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">{league.type || 'League'}</p>
                    </div>
                  </div>
                </MotionCard>
              ))}
          </div>
        </section>
      </div>
    )
  }

  const league = leagueDetail.data

  return (
    <div className="space-y-6">
      <Button variant="ghost" onClick={() => navigate('/league')}>
        ← Quay lại danh sách
      </Button>

      <Card className="p-6 space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <img src={withFallback(league?.logo)} alt={league?.name} className="h-20 w-20 rounded-2xl border border-slate-200 object-contain" />
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">Season {season || '—'}</p>
            <h1 className="text-3xl font-bold text-slate-900">{league?.name || 'League'}</h1>
            <p className="text-sm text-slate-500">{league?.type}</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={season || ''}
            onChange={(event) => setSeason(Number(event.target.value))}
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
          >
            <option value="">Chọn mùa giải</option>
            {seasonOptions.map((value) => (
              <option key={`season-${value}`} value={value}>
                {value}
              </option>
            ))}
          </select>
          <Button variant="secondary" onClick={() => leagueTeams.refetch?.()}>
            Làm mới danh sách đội
          </Button>
        </div>
      </Card>

      <section className="space-y-3">
        <h2 className="text-2xl font-semibold text-slate-900">Câu lạc bộ tham dự</h2>
        {leagueTeams.error && (
          <p className="text-sm text-red-500">{leagueTeams.error.message || 'Không thể tải câu lạc bộ.'}</p>
        )}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {leagueTeams.loading ? (
            Array.from({ length: 6 }).map((_, index) => <Skeleton key={`team-skeleton-${index}`} className="h-32" />)
          ) : leagueTeams.data.length ? (
            leagueTeams.data.map((team) => (
              <Card key={team.id} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm">
                <img src={withFallback(team.logo)} alt={team.name} className="h-12 w-12 rounded-full object-cover" />
                <div>
                  <p className="font-semibold text-slate-900">{team.name}</p>
                  <p className="text-xs text-slate-500">{team.country}</p>
                </div>
              </Card>
            ))
          ) : (
            <p className="col-span-full text-sm text-slate-500">Không có câu lạc bộ nào cho mùa giải này.</p>
          )}
        </div>
      </section>
    </div>
  )
}
