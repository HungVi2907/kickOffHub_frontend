import { useCallback, useEffect, useState } from 'react'
import { useShallow } from 'zustand/react/shallow'
import teamApi from '@/features/teams/api.js'
import useToast from '@/shared/hooks/useToast.js'
import { useTeamFiltersStore } from '@/features/teams/store.js'

export function useTeamFilters() {
  return useTeamFiltersStore(
    useShallow((state) => ({
      leagueId: state.leagueId,
      season: state.season,
      setLeague: state.setLeague,
      setSeason: state.setSeason,
      reset: state.reset,
    })),
  )
}

export function useTeamsList(params = {}) {
  const toast = useToast()
  const [state, setState] = useState({ data: [], loading: true, error: null })
  const paramsKey = JSON.stringify(params ?? {})

  const fetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const parsedParams = paramsKey ? JSON.parse(paramsKey) : {}
      let payload
      if (parsedParams.leagueId && parsedParams.season) {
        payload = await teamApi.teamsByLeagueSeason({ leagueId: parsedParams.leagueId, season: parsedParams.season })
      } else {
        payload = await teamApi.list(parsedParams)
      }
      const data = Array.isArray(payload?.data) ? payload.data : payload
      setState({ data: data ?? [], loading: false, error: null })
    } catch (error) {
      setState({ data: [], loading: false, error })
      toast.error(error.message || 'Không thể tải danh sách đội bóng')
    }
  }, [paramsKey, toast])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { ...state, refetch: fetch }
}

export function useTeamsMeta() {
  const toast = useToast()
  const [state, setState] = useState({ leagues: [], seasons: [], loading: true, error: null })

  useEffect(() => {
    let isMounted = true
    const fetchMeta = async () => {
      setState((prev) => ({ ...prev, loading: true, error: null }))
      try {
        const [seasonsRes, leaguesRes] = await Promise.all([teamApi.seasons(), teamApi.leagues()])
        if (!isMounted) return
        setState({
          leagues: Array.isArray(leaguesRes?.data) ? leaguesRes.data : leaguesRes ?? [],
          seasons: Array.isArray(seasonsRes?.data) ? seasonsRes.data : seasonsRes ?? [],
          loading: false,
          error: null,
        })
      } catch (error) {
        if (!isMounted) return
        setState({ leagues: [], seasons: [], loading: false, error })
        toast.error(error.message || 'Không thể tải danh sách mùa giải và giải đấu')
      }
    }

    fetchMeta()
    return () => {
      isMounted = false
    }
  }, [toast])

  return state
}

export function usePopularTeams(params = {}) {
  const toast = useToast()
  const [state, setState] = useState({ data: [], loading: true, error: null })
  const paramsKey = JSON.stringify(params ?? {})

  const fetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const response = await teamApi.popular(paramsKey ? JSON.parse(paramsKey) : {})
      const data = Array.isArray(response?.data) ? response.data : response
      setState({ data: data ?? [], loading: false, error: null })
    } catch (error) {
      setState({ data: [], loading: false, error })
      toast.error(error.message || 'Không thể tải danh sách đội nổi bật')
    }
  }, [paramsKey, toast])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { ...state, refetch: fetch }
}

export function useTeamDetail(teamId) {
  const toast = useToast()
  const [state, setState] = useState({ team: null, venue: null, loading: true, error: null })

  const fetch = useCallback(async () => {
    if (!teamId) return
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const [teamRes, venueRes] = await Promise.all([
        teamApi.detail(teamId),
        // venue id is inside team detail so fetch after first request
        Promise.resolve(null),
      ])
      const teamData = teamRes?.data ?? teamRes
      let venueData = null
      if (teamData?.venue_id) {
        const venueResponse = await teamApi.venue(teamData.venue_id)
        venueData = venueResponse?.data ?? venueResponse
      }
      setState({ team: teamData, venue: venueData, loading: false, error: null })
    } catch (error) {
      setState({ team: null, venue: null, loading: false, error })
      toast.error(error.message || 'Không thể tải dữ liệu đội bóng')
    }
  }, [teamId, toast])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { ...state, refetch: fetch }
}

export function useLeagueDetail(leagueId) {
  const toast = useToast()
  const [state, setState] = useState({ data: null, loading: !!leagueId, error: null })

  useEffect(() => {
    if (!leagueId) {
      setState({ data: null, loading: false, error: null })
      return
    }

    let isMounted = true
    setState((prev) => ({ ...prev, loading: true, error: null }))

    teamApi
      .leagueDetail(leagueId)
      .then((response) => {
        if (!isMounted) return
        setState({ data: response?.data ?? response, loading: false, error: null })
      })
      .catch((error) => {
        if (!isMounted) return
        setState({ data: null, loading: false, error })
        toast.error(error.message || 'Không thể tải thông tin giải đấu')
      })

    return () => {
      isMounted = false
    }
  }, [leagueId, toast])

  return state
}

export function useLeagueTeams(leagueId, season) {
  const toast = useToast()
  const [state, setState] = useState({ data: [], loading: false, error: null })

  const fetch = useCallback(async () => {
    if (!leagueId) {
      setState({ data: [], loading: false, error: null })
      return
    }
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      const response = await teamApi.leagueTeams(leagueId, season ? { season } : undefined)
      const payload = Array.isArray(response?.data) ? response.data : response
      setState({ data: payload ?? [], loading: false, error: null })
    } catch (error) {
      setState({ data: [], loading: false, error })
      toast.error(error.message || 'Không thể tải danh sách câu lạc bộ của giải đấu')
    }
  }, [leagueId, season, toast])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { ...state, refetch: fetch }
}
