import { useCallback, useEffect, useState } from 'react'
import playerApi from '@/features/players/api.js'
import useToast from '@/shared/hooks/useToast.js'

export function usePlayers(params = {}) {
  const toast = useToast()
  const [state, setState] = useState({ data: [], pagination: null, loading: true, error: null })
  const paramsKey = JSON.stringify(params ?? {})

  const fetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const response = await playerApi.list(paramsKey ? JSON.parse(paramsKey) : {})
      const payloadData = response?.data ?? response ?? []
      const normalizedData = Array.isArray(payloadData?.data)
        ? payloadData.data
        : Array.isArray(payloadData?.data?.data)
        ? payloadData.data.data
        : Array.isArray(payloadData)
        ? payloadData
        : []
      setState({
        data: normalizedData ?? [],
        pagination: response?.meta ?? payloadData?.pagination ?? payloadData?.data?.pagination ?? null,
        loading: false,
        error: null,
      })
    } catch (error) {
      setState({ data: [], pagination: null, loading: false, error })
      toast.error(error.message || 'Không thể tải danh sách cầu thủ')
    }
  }, [paramsKey, toast])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { ...state, refetch: fetch }
}

export function usePlayerSearch(query, options = { limit: 100 }) {
  const toast = useToast()
  const [state, setState] = useState({ data: [], loading: false, error: null })
  const optionsKey = JSON.stringify(options)

  useEffect(() => {
    if (!query) {
      setState({ data: [], loading: false, error: null })
      return
    }

    let isMounted = true
    setState({ data: [], loading: true, error: null })
    playerApi
      .search({ name: query, ...options })
      .then((response) => {
        if (!isMounted) return
        const payload = response?.data?.results ?? response?.data ?? response ?? []
        setState({ data: payload, loading: false, error: null })
      })
      .catch((error) => {
        if (!isMounted) return
        setState({ data: [], loading: false, error })
        toast.error(error.message || 'Không thể tìm kiếm cầu thủ')
      })

    return () => {
      isMounted = false
    }
  }, [query, optionsKey, toast])

  return state
}

export function usePopularPlayers(params = {}) {
  const toast = useToast()
  const [state, setState] = useState({ data: [], loading: true, error: null })
  const paramsKey = JSON.stringify(params ?? {})

  useEffect(() => {
    let isMounted = true
    setState((prev) => ({ ...prev, loading: true, error: null }))

    playerApi
      .popular(paramsKey ? JSON.parse(paramsKey) : {})
      .then((response) => {
        if (!isMounted) return
        const payload = Array.isArray(response?.data)
          ? response.data
          : Array.isArray(response?.data?.data)
          ? response.data.data
          : Array.isArray(response)
          ? response
          : []
        setState({ data: payload ?? [], loading: false, error: null })
      })
      .catch((error) => {
        if (!isMounted) return
        setState({ data: [], loading: false, error })
        toast.error(error.message || 'Không thể tải danh sách cầu thủ nổi bật')
      })

    return () => {
      isMounted = false
    }
  }, [paramsKey, toast])

  return state
}

export function usePlayerDetail(playerId) {
  const toast = useToast()
  const [state, setState] = useState({ data: null, loading: true, error: null })

  const fetch = useCallback(async () => {
    if (!playerId) return
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const response = await playerApi.detail(playerId)
      setState({ data: response?.data ?? response, loading: false, error: null })
    } catch (error) {
      setState({ data: null, loading: false, error })
      toast.error(error.message || 'Không thể tải thông tin cầu thủ')
    }
  }, [playerId, toast])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { ...state, refetch: fetch }
}

export function useTeamPlayers({ leagueId, teamId, season }) {
  const toast = useToast()
  const [state, setState] = useState({ data: [], loading: false, error: null })

  const fetch = useCallback(async () => {
    if (!leagueId || !teamId || !season) {
      setState({ data: [], loading: false, error: null })
      return
    }
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const response = await playerApi.leagueTeamSeason({ leagueId, teamId, season })
      const players = response?.data?.players ?? response?.data ?? response ?? []
      setState({ data: players ?? [], loading: false, error: null })
    } catch (error) {
      setState({ data: [], loading: false, error })
      toast.error(error.message || 'Không thể tải danh sách cầu thủ theo đội')
    }
  }, [leagueId, teamId, season, toast])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { ...state, refetch: fetch }
}

export function usePlayerStats(playerId, filters = {}) {
  const toast = useToast()
  const [state, setState] = useState({ data: [], loading: false, error: null })
  const filtersKey = JSON.stringify(filters ?? {})

  const fetch = useCallback(
    async (overrideFilters) => {
      if (!playerId) {
        setState({ data: [], loading: false, error: null })
        return
      }

      const activeFilters = overrideFilters ?? filters ?? {}
      const params = { playerid: playerId }
      if (activeFilters.season) params.season = activeFilters.season
      if (activeFilters.leagueid) params.leagueid = activeFilters.leagueid
      if (activeFilters.teamid) params.teamid = activeFilters.teamid

      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const response = await playerApi.stats(params)
        const base = response?.data ?? response ?? {}
        const container = Array.isArray(base) ? base : base?.data ?? base
        const list = Array.isArray(container?.response) ? container.response : Array.isArray(container) ? container : []
        const stats = list.flatMap((entry) => entry?.statistics || [])
        setState({ data: stats, loading: false, error: null })
      } catch (error) {
        setState({ data: [], loading: false, error })
        toast.error(error.message || 'Không thể tải thống kê cầu thủ')
      }
    },
    [playerId, filtersKey, toast],
  )

  useEffect(() => {
    fetch(filters)
  }, [fetch, filtersKey])

  return { ...state, refetch: fetch }
}
