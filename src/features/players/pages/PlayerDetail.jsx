import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import Button from '@/shared/components/ui/Button.jsx'
import Card from '@/shared/components/ui/Card.jsx'
import Input from '@/shared/components/ui/Input.jsx'
import { ROUTES } from '@/app/paths.js'
import { withFallback } from '@/shared/utils/img.js'
import { usePlayerDetail, usePlayerStats } from '@/features/players/hooks.js'

const MotionSection = motion.section
const DEFAULT_FILTERS = { season: '', leagueid: '', teamid: '' }

function StatTile({ label, value, subtext }) {
  return (
    <Card className="space-y-1 border-slate-200 bg-white/90 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">{label}</p>
      <p className="text-2xl font-bold text-slate-900">{value ?? '—'}</p>
      {subtext ? <p className="text-sm text-slate-500">{subtext}</p> : null}
    </Card>
  )
}

export default function PlayerDetailPage() {
  const { id } = useParams()
  const playerState = usePlayerDetail(id)
  const [formFilters, setFormFilters] = useState(() => ({ ...DEFAULT_FILTERS }))
  const [activeFilters, setActiveFilters] = useState(() => ({ ...DEFAULT_FILTERS }))
  const statsState = usePlayerStats(id, activeFilters)

  const handleFilterChange = (event) => {
    const { name, value } = event.target
    setFormFilters((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (event) => {
    event.preventDefault()
    setActiveFilters({ ...formFilters })
  }

  const handleReset = () => {
    setFormFilters({ ...DEFAULT_FILTERS })
    setActiveFilters({ ...DEFAULT_FILTERS })
  }

  if (playerState.loading) {
    return <p className="py-16 text-center text-sm text-slate-500">Đang tải thông tin cầu thủ...</p>
  }

  if (playerState.error) {
    return <p className="py-16 text-center text-sm text-red-500">{playerState.error.message}</p>
  }

  if (!playerState.data) {
    return <p className="py-16 text-center text-sm text-slate-500">Không tìm thấy cầu thủ</p>
  }

  const player = playerState.data
  const nationalityLabel = player?.country?.name || player?.nationality || 'Không rõ'
  const flagUrl = player?.country?.flag ? withFallback(player.country.flag) : null
  const statsBlocks = statsState.data ?? []

  return (
    <MotionSection initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="space-y-10">
      <header className="space-y-2">
        <Link to={ROUTES.players} className="text-sm font-semibold text-primary-600 hover:underline">
          ← Quay lại danh sách cầu thủ
        </Link>
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">Player profile</p>
          <h1 className="text-3xl font-bold text-slate-900">{player.name}</h1>
          <p className="text-sm text-slate-500">Mã cầu thủ #{player.id}</p>
        </div>
      </header>

      <Card className="border-slate-200 bg-white/95 p-6">
        <div className="flex flex-col items-center gap-6 md:flex-row md:items-center">
          <img
            src={withFallback(player.photo)}
            alt={player.name}
            className="h-32 w-32 rounded-full border border-slate-100 object-cover shadow-lg"
          />
          <div className="space-y-3 text-center md:text-left">
            <p className="text-xl font-semibold text-slate-900">{player.name}</p>
            <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-slate-600 md:justify-start">
              <span className="font-semibold text-slate-900">Quốc tịch:</span>
              {player.country?.flag ? (
                <img src={flagUrl} alt={nationalityLabel} className="h-4 w-6 rounded object-cover" />
              ) : null}
              <span>{nationalityLabel}</span>
            </div>
            <dl className="grid gap-4 text-left text-sm text-slate-600 sm:grid-cols-3">
              {player.age ? (
                <div>
                  <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">Tuổi</dt>
                  <dd className="font-semibold text-slate-900">{player.age}</dd>
                </div>
              ) : null}
              {player.position ? (
                <div>
                  <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">Vị trí</dt>
                  <dd className="font-semibold text-slate-900">{player.position}</dd>
                </div>
              ) : null}
              {player.number ? (
                <div>
                  <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">Số áo</dt>
                  <dd className="font-semibold text-slate-900">{player.number}</dd>
                </div>
              ) : null}
              {player.height ? (
                <div>
                  <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">Chiều cao</dt>
                  <dd className="font-semibold text-slate-900">{player.height}</dd>
                </div>
              ) : null}
              {player.weight ? (
                <div>
                  <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">Cân nặng</dt>
                  <dd className="font-semibold text-slate-900">{player.weight}</dd>
                </div>
              ) : null}
              {player.birth_date ? (
                <div>
                  <dt className="text-xs uppercase tracking-[0.3em] text-slate-400">Ngày sinh</dt>
                  <dd className="font-semibold text-slate-900">{player.birth_date}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        </div>
      </Card>

      <section className="space-y-4 rounded-3xl border border-slate-200 bg-slate-50/70 p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.4em] text-slate-500">Performance stats</p>
            <h2 className="text-2xl font-bold text-slate-900">Chỉ số theo mùa giải</h2>
            <p className="text-sm text-slate-500">Lọc theo mùa giải, giải đấu hoặc đội bóng để tải số liệu từ API-Football.</p>
          </div>
          <form onSubmit={handleSubmit} className="grid w-full gap-2 sm:grid-cols-2 lg:w-auto lg:grid-cols-4">
            <Input
              type="number"
              name="season"
              label="Season"
              value={formFilters.season}
              onChange={handleFilterChange}
              placeholder="2023"
              className="lg:min-w-[140px]"
            />
            <Input
              type="number"
              name="leagueid"
              label="League ID"
              value={formFilters.leagueid}
              onChange={handleFilterChange}
              placeholder="39"
              className="lg:min-w-[140px]"
            />
            <Input
              type="number"
              name="teamid"
              label="Team ID"
              value={formFilters.teamid}
              onChange={handleFilterChange}
              placeholder="33"
              className="lg:min-w-[140px]"
            />
            <div className="flex items-center gap-2">
              <Button type="submit" className="flex-1">
                Tải dữ liệu
              </Button>
              <Button type="button" variant="outline" size="sm" onClick={handleReset}>
                Xoá
              </Button>
            </div>
          </form>
        </div>

        {statsState.loading && <p className="text-sm text-slate-500">Đang đồng bộ dữ liệu thống kê...</p>}
        {statsState.error && <p className="text-sm text-red-500">{statsState.error.message}</p>}
        {!statsState.loading && !statsState.error && !statsBlocks.length && (
          <p className="text-sm text-slate-500">Chưa có thống kê nào cho bộ lọc hiện tại.</p>
        )}

        {!statsState.loading && !statsState.error && statsBlocks.length > 0 && (
          <div className="space-y-6">
            {statsBlocks.map((stat, index) => (
              <article key={`${stat?.league?.id ?? 'league'}-${stat?.team?.id ?? 'team'}-${index}`} className="space-y-4 rounded-3xl border border-slate-200 bg-white/95 p-5 shadow-sm">
                <div className="flex flex-wrap items-center gap-4">
                  {stat?.team?.logo ? (
                    <img
                      src={withFallback(stat.team.logo)}
                      alt={stat.team?.name}
                      className="h-14 w-14 rounded-full border border-slate-200 bg-white object-cover"
                    />
                  ) : null}
                  <div>
                    <p className="text-xs uppercase tracking-[0.4em] text-primary-500">{stat?.league?.name || 'League'}</p>
                    <h3 className="text-xl font-semibold text-slate-900">{stat?.team?.name || 'Team data'}</h3>
                    <p className="text-sm text-slate-500">
                      Season {(stat?.league?.season ?? activeFilters.season) || '—'} • {stat?.games?.position || player.position || 'Unknown role'}
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 md:grid-cols-3">
                  <StatTile label="Ra sân" value={stat?.games?.appearences ?? '—'} subtext={`Phút thi đấu: ${stat?.games?.minutes ?? 0}`} />
                  <StatTile label="Điểm" value={stat?.games?.rating ? Number(stat.games.rating).toFixed(2) : '—'} subtext={`Đá chính: ${stat?.games?.lineups ?? 0}`} />
                  <StatTile label="Bàn thắng" value={stat?.goals?.total ?? 0} subtext={`Kiến tạo: ${stat?.goals?.assists ?? 0}`} />
                  <StatTile label="Dứt điểm" value={stat?.shots?.total ?? 0} subtext={`Trúng đích: ${stat?.shots?.on ?? 0}`} />
                  <StatTile label="Chuyền bóng" value={stat?.passes?.total ?? 0} subtext={`Quan trọng: ${stat?.passes?.key ?? 0}`} />
                  <StatTile label="Qua người" value={stat?.dribbles?.attempts ?? 0} subtext={`Thành công: ${stat?.dribbles?.success ?? 0}`} />
                  <StatTile label="Tranh chấp" value={stat?.duels?.total ?? 0} subtext={`Thắng: ${stat?.duels?.won ?? 0}`} />
                  <StatTile label="Phòng ngự" value={stat?.tackles?.total ?? 0} subtext={`Cắt bóng: ${stat?.tackles?.interceptions ?? 0}`} />
                  <StatTile label="Thẻ phạt" value={`🟨 ${stat?.cards?.yellow ?? 0} • 🟥 ${stat?.cards?.red ?? 0}`} subtext={`Phạm lỗi: ${stat?.fouls?.committed ?? 0}`} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </MotionSection>
  )
}
