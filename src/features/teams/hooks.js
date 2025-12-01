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
      toast.error(error.message || 'Unable to load teams list')
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
        toast.error(error.message || 'Unable to load seasons and leagues')
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
      // Response structure: { success, message, data: { data: [...], pagination: {...} } }
      // Extract the actual teams array from nested data
      const payload = response?.data ?? response
      const teams = Array.isArray(payload?.data) ? payload.data : (Array.isArray(payload) ? payload : [])
      setState({ data: teams, loading: false, error: null })
    } catch (error) {
      setState({ data: [], loading: false, error })
      toast.error(error.message || 'Unable to load popular teams')
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
      const teamRes = await teamApi.detail(teamId)
      const teamData = teamRes?.data ?? teamRes
      let venueData = null
      
      // Fetch venue separately and silently handle errors
      if (teamData?.venue_id) {
        try {
          const venueResponse = await teamApi.venue(teamData.venue_id)
          venueData = venueResponse?.data ?? venueResponse
        } catch (venueError) {
          // Silently handle venue fetch errors - just log to console
          console.warn('Venue fetch failed:', venueError.message || venueError)
          venueData = null
        }
      }
      
      setState({ team: teamData, venue: venueData, loading: false, error: null })
    } catch (error) {
      setState({ team: null, venue: null, loading: false, error })
      toast.error(error.message || 'Unable to load team data')
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
        toast.error(error.message || 'Unable to load league information')
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
      toast.error(error.message || 'Unable to load league teams')
    }
  }, [leagueId, season, toast])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { ...state, refetch: fetch }
}
