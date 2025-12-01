import { create } from 'zustand'
import { persist } from 'zustand/middleware'

const useAuthStore = create(
  persist(
    (set) => ({
      token: null,
      user: null,
      hasHydrated: false,
      login: ({ token, user }) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
      setUser: (user) => set({ user }),
      setHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'kickoffhub-auth',
      partialize: (state) => ({ token: state.token, user: state.user }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to load saved login data:', error)
          return
        }
        state?.setHydrated(true)
      },
    },
  ),
)

export default useAuthStore
