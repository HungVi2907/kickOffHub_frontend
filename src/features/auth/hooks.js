import { useCallback, useEffect, useMemo } from 'react'
import { useShallow } from 'zustand/react/shallow'
import authApi from '@/features/auth/api.js'
import useAuthStore from '@/features/auth/store.js'
import useToast from '@/shared/hooks/useToast.js'

export function useAuth() {
  const toast = useToast()
  const {
    accessToken,
    refreshToken,
    user,
    roles,
    hasHydrated,
    login,
    logout,
    setTokens,
    setUser,
  } = useAuthStore(
    useShallow((state) => ({
      accessToken: state.accessToken,
      refreshToken: state.refreshToken,
      user: state.user,
      roles: state.roles,
      hasHydrated: state.hasHydrated,
      login: state.login,
      logout: state.logout,
      setTokens: state.setTokens,
      setUser: state.setUser,
    })),
  )

  const isAuthenticated = Boolean(accessToken)

  const handleLogin = useCallback(
    async (credentials) => {
      const response = await authApi.login(credentials)
      // API returns normalized: { success, message, data: { token, user } }
      // or { success, message, data: { accessToken, refreshToken, user } }
      const payload = response?.data ?? response
      
      // Backend may return "token" or "accessToken"
      const tokenValue = payload?.token || payload?.accessToken || payload?.tokens?.accessToken
      
      if (!tokenValue) {
        throw new Error('Invalid login response')
      }
      
      // Store token (using accessToken as key in store)
      login({
        accessToken: tokenValue,
        refreshToken: payload.refreshToken || payload.tokens?.refreshToken || null,
        user: payload.user,
      })
      
      // Fetch profile if user data not included
      if (!payload.user) {
        try {
          const profile = await authApi.profile()
          setUser(profile.data ?? profile)
        } catch (err) {
          console.warn('Failed to fetch profile after login:', err)
        }
      }
      
      toast.success('Login successful')
      return payload
    },
    [login, setUser, toast],
  )

  const handleRegister = useCallback(
    async (payload) => {
      const response = await authApi.register(payload)
      toast.success('Account created successfully')
      return response?.data ?? response
    },
    [toast],
  )

  const handleLogout = useCallback(() => {
    logout()
    toast.info('You have been logged out')
  }, [logout, toast])

  const refreshSession = useCallback(async () => {
    if (!refreshToken) {
      handleLogout()
      return null
    }
    const response = await authApi.refresh({ refreshToken })
    const payload = response?.data ?? response
    setTokens({ accessToken: payload.accessToken, refreshToken: payload.refreshToken ?? refreshToken })
    if (payload.user) {
      setUser(payload.user)
    }
    return payload
  }, [refreshToken, setTokens, setUser, handleLogout])

  const fetchProfile = useCallback(async () => {
    const response = await authApi.profile()
    const profile = response?.data ?? response
    setUser(profile)
    return profile
  }, [setUser])

  useEffect(() => {
    if (isAuthenticated && !user && hasHydrated) {
      fetchProfile().catch(() => {
        // ignore profile errors here, global error handling will capture via toast interceptors
      })
    }
  }, [isAuthenticated, user, hasHydrated, fetchProfile])

  const hasRole = useCallback((role) => roles?.includes(role), [roles])

  const value = useMemo(
    () => ({
      accessToken,
      refreshToken,
      user,
      roles,
      isAuthenticated,
      hasHydrated,
      login: handleLogin,
      register: handleRegister,
      logout: handleLogout,
      refresh: refreshSession,
      fetchProfile,
      hasRole,
    }),
    [
      accessToken,
      refreshToken,
      user,
      roles,
      isAuthenticated,
      hasHydrated,
      handleLogin,
      handleRegister,
      handleLogout,
      refreshSession,
      fetchProfile,
      hasRole,
    ],
  )

  return value
}

export default useAuth
