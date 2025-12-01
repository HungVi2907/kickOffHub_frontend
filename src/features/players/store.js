import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

export const usePlayerFiltersStore = create(
  devtools((set) => ({
    search: '',
    teamId: '',
    leagueId: '',
    season: '',
    page: 1,
    limit: 20,
    setFilters: (payload) => set((state) => ({ ...state, ...payload })),
    reset: () => set({ search: '', teamId: '', leagueId: '', season: '', page: 1 }),
  })),
)

export default usePlayerFiltersStore
