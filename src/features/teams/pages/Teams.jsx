import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import TeamFilters from '@/features/teams/components/TeamFilters.jsx'
import TeamList from '@/features/teams/components/TeamList.jsx'
import TeamSidebar from '@/features/teams/components/TeamSidebar.jsx'
import PopularTeams from '@/features/teams/components/PopularTeams.jsx'
import {
  useTeamFilters,
  useTeamsList,
  usePopularTeams,
  useTeamDetail,
  useTeamsMeta,
} from '@/features/teams/hooks.js'
import { useTeamPlayers } from '@/features/players/hooks.js'

const MotionSection = motion.section

export default function TeamsPage() {
  const { leagueId, season, setLeague, setSeason } = useTeamFilters()
  const [activeTeam, setActiveTeam] = useState(null)

  const { leagues, seasons } = useTeamsMeta()
  const teamsState = useTeamsList({ leagueId, season, limit: 200 })
  const popularTeams = usePopularTeams({ page: 1, limit: 8 })
  const detailState = useTeamDetail(activeTeam?.id)
  const playersState = useTeamPlayers({ leagueId, teamId: activeTeam?.id, season })

  useEffect(() => {
    if (!activeTeam && teamsState.data?.length) {
      setActiveTeam(teamsState.data[0])
    }
  }, [teamsState.data, activeTeam])

  useEffect(() => {
    setActiveTeam(null)
  }, [leagueId, season])

  const handleApplyFilters = () => {
    teamsState.refetch?.()
    playersState.refetch?.()
  }

  return (
    <MotionSection
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="space-y-6"
    >
      <header className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-primary-500">Squads</p>
        <h1 className="text-3xl font-bold text-slate-900">Team directory</h1>
        <p className="max-w-2xl text-sm text-slate-600">
          Duyệt danh sách câu lạc bộ, tra cứu sân vận động và đội hình theo giải đấu, mùa giải mà bạn quan tâm.
        </p>
      </header>

      <PopularTeams {...popularTeams} />

      <TeamFilters
        leagues={leagues}
        seasons={seasons}
        selectedLeague={leagueId}
        selectedSeason={season}
        onLeagueChange={setLeague}
        onSeasonChange={setSeason}
        onApply={handleApplyFilters}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,_2fr)_minmax(320px,_1fr)]">
        <TeamList
          teams={teamsState.data}
          loading={teamsState.loading}
          selectedTeam={activeTeam}
          onSelect={setActiveTeam}
        />
        <TeamSidebar team={detailState.team || activeTeam} venue={detailState.venue} playersState={playersState} />
      </div>
    </MotionSection>
  )
}
