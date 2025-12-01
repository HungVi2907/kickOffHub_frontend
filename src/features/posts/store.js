import { create } from 'zustand'
import { devtools } from 'zustand/middleware'

const initialState = {
  tag: '',
  search: '',
  sort: 'newest',
  status: 'all',
  page: 1,
  limit: 9,
}

export const usePostFiltersStore = create(
  devtools((set) => ({
    ...initialState,
    setFilters: (payload) => set((state) => ({ ...state, ...payload })),
    reset: () => set(initialState),
  })),
)

export default usePostFiltersStore
