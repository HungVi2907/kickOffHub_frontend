import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

const initialState = {
  accessToken: null,
  refreshToken: null,
  user: null,
  roles: [],
  hasHydrated: false,
}

const useAuthStore = create(
  persist(
    (set, get) => ({
      ...initialState,
      login: ({ accessToken, refreshToken, user }) =>
        set({
          accessToken: accessToken ?? get().accessToken,
          refreshToken: refreshToken ?? get().refreshToken,
          user: user ?? get().user,
          roles: user?.roles ?? get().roles ?? [],
        }),
      logout: () => set(initialState),
      setTokens: ({ accessToken, refreshToken }) =>
        set((state) => ({
          accessToken: accessToken ?? state.accessToken,
          refreshToken: refreshToken ?? state.refreshToken,
        })),
      setUser: (user) => set({ user, roles: user?.roles ?? [] }),
      setHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'kickoffhub-auth',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        user: state.user,
        roles: state.roles,
      }),
      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Auth store hydration failed', error)
          return
        }
        state?.setHydrated(true)
      },
    },
  ),
)

export default useAuthStore
