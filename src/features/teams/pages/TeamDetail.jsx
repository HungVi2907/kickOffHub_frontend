import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/shared/components/ui/Button.jsx'
import Card from '@/shared/components/ui/Card.jsx'
import Skeleton from '@/shared/components/ui/Skeleton.jsx'
import { withFallback } from '@/shared/utils/img.js'
import {
  useTeamDetail,
  useTeamsMeta,
} from '@/features/teams/hooks.js'
import { useTeamPlayers } from '@/features/players/hooks.js'

const MotionDiv = motion.div

export default function TeamDetailPage() {
  const { teamId } = useParams()
  const detailState = useTeamDetail(teamId)
  const meta = useTeamsMeta()
  const [selectedLeague, setSelectedLeague] = useState('')
  const [selectedSeason, setSelectedSeason] = useState('')

  const playersState = useTeamPlayers({ leagueId: selectedLeague, teamId, season: selectedSeason })

  useEffect(() => {
    if (!selectedSeason && meta.seasons?.length) {
      setSelectedSeason(meta.seasons[0].season || meta.seasons[0].id)
    }
    if (!selectedLeague && meta.leagues?.length) {
      setSelectedLeague(meta.leagues[0].id)
    }
  }, [meta.seasons, meta.leagues, selectedSeason, selectedLeague])

  const team = detailState.team
  const venue = detailState.venue

  if (detailState.loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!team) {
    return <p className="text-sm text-slate-500">Không tìm thấy đội bóng.</p>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/teams" className="text-sm font-semibold text-primary-600">
          ← Danh sách đội bóng
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">{team.name}</h1>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,_2fr)_minmax(320px,_1fr)]">
        <div className="space-y-6">
          <Card className="p-6 space-y-6">
            <div className="flex flex-wrap items-start gap-4">
              <img src={withFallback(team.logo)} alt={team.name} className="h-20 w-20 rounded-full border border-white/70" />
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Câu lạc bộ</p>
                <h2 className="text-2xl font-bold text-slate-900">{team.name}</h2>
                <p className="text-sm text-slate-600">
                  {team.country} • Founded {team.founded || 'N/A'}
                </p>
              </div>
            </div>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Sân vận động</p>
              {venue ? (
                <MotionDiv layout className="space-y-3">
                  {venue.image ? (
                    <img
                      src={withFallback(venue.image)}
                      alt={venue.name}
                      className="h-64 w-full rounded-2xl object-cover"
                    />
                  ) : (
                    <div className="flex h-48 items-center justify-center rounded-2xl bg-slate-100 text-sm text-slate-500">
                      Chưa có hình ảnh sân vận động
                    </div>
                  )}
                  <div className="rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                    <p className="font-semibold text-slate-800">{venue.name}</p>
                    <p>{venue.city}</p>
                    <p className="text-xs">{venue.address}</p>
                    <p className="text-xs">Sức chứa: {venue.capacity || 'N/A'}</p>
                  </div>
                </MotionDiv>
              ) : (
                <p className="text-sm text-slate-500">Không có thông tin sân vận động.</p>
              )}
            </section>

            <section className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Đội hình</p>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <select
                  value={selectedLeague}
                  onChange={(event) => setSelectedLeague(event.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
                >
                  <option value="">Chọn giải đấu</option>
                  {meta.leagues.map((league) => (
                    <option key={league.id} value={league.id}>
                      {league.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedSeason}
                  onChange={(event) => setSelectedSeason(event.target.value)}
                  className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm focus:border-primary-500 focus:outline-none"
                >
                  <option value="">Chọn mùa giải</option>
                  {meta.seasons.map((season) => (
                    <option key={season.season || season.id} value={season.season || season.id}>
                      {season.season || season.displayName || season.name}
                    </option>
                  ))}
                </select>
                <Button onClick={() => playersState.refetch?.()} variant="secondary">
                  Tải đội hình
                </Button>
              </div>

              {playersState.error && (
                <p className="text-sm text-red-500">{playersState.error.message || 'Không thể tải cầu thủ'}</p>
              )}

              <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3">
                {playersState.loading ? (
                  Array.from({ length: 6 }).map((_, idx) => <Skeleton key={`player-card-${idx}`} className="h-36 w-full" />)
                ) : playersState.data?.length ? (
                  playersState.data.map((playerItem) => {
                    const player = playerItem.player || playerItem
                    const playerId = player.id || player.playerId
                    return (
                      <Link
                        key={playerId}
                        to={`/players/${playerId}`}
                        className="rounded-2xl border border-slate-100 bg-white p-4 text-center shadow-sm transition hover:-translate-y-1"
                      >
                        {player.photo ? (
                          <img
                            src={withFallback(player.photo)}
                            alt={player.name}
                            className="mx-auto h-28 w-28 rounded-full object-cover"
                          />
                        ) : (
                          <div className="mx-auto flex h-28 w-28 items-center justify-center rounded-full bg-slate-100 text-xs text-slate-500">
                            No image
                          </div>
                        )}
                        <p className="mt-3 text-sm font-semibold text-slate-900">{player.name}</p>
                        <p className="text-xs text-slate-500">
                          {player.position || player.player?.position} • #{player.number || player.player?.number || '—'}
                        </p>
                      </Link>
                    )
                  })
                ) : (
                  <p className="col-span-full text-sm text-slate-500">
                    Chọn giải đấu và mùa giải để xem đội hình.
                  </p>
                )}
              </div>
            </section>
          </Card>
        </div>

        <div className="space-y-4">
          <Card className="p-4 text-sm text-slate-600">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500">Thông tin nhanh</p>
            <ul className="mt-3 space-y-2">
              <li>Quốc gia: {team.country}</li>
              <li>Thành lập: {team.founded || 'N/A'}</li>
              <li>Sân nhà: {venue?.name || 'N/A'}</li>
            </ul>
          </Card>
        </div>
      </div>
    </div>
  )
}
