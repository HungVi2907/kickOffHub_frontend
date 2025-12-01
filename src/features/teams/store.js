import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

const filtersStore = (set) => ({
  leagueId: '',
  season: '',
  setLeague: (leagueId) => set({ leagueId }),
  setSeason: (season) => set({ season }),
  reset: () => set({ leagueId: '', season: '' }),
})

export const useTeamFiltersStore = create(devtools(filtersStore))

export default useTeamFiltersStore
