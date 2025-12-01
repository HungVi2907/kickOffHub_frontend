/**
 * =============================================================================
 * POSTS HOOKS
 * =============================================================================
 * 
 * Custom React hooks for posts functionality.
 * All hooks use postApi which internally uses the configured axios instance.
 * 
 * IMPORTANT: These hooks handle API calls correctly through postApi.
 * Do NOT use fetch() or raw axios - always use the postApi methods.
 */
import { useCallback, useEffect, useState } from 'react'
import postApi from '@/features/posts/api.js'
import useToast from '@/shared/hooks/useToast.js'

/**
 * Hook for fetching posts list with pagination
 * @param {Object} params - Query parameters for filtering/pagination
 */
export function usePosts(params = {}) {
  const toast = useToast()
  const [state, setState] = useState({ data: [], pagination: null, loading: true, error: null })
  const paramsKey = JSON.stringify(params ?? {})

  const fetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      // Uses postApi.list which calls: api.get('/posts', { params })
      // axios baseURL ensures correct backend URL is used
      const response = await postApi.list(paramsKey ? JSON.parse(paramsKey) : {})
      
      // Extract nested data from API response
      // API returns: { success, message, data: { total, page, pageSize, data: [...posts] } }
      const payload = response?.data ?? response ?? {}
      
      // Extract posts array from the nested structure
      const data = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.data?.data)
        ? payload.data.data
        : Array.isArray(payload)
        ? payload
        : []
      
      // Extract pagination info
      // Backend returns: { total, page, pageSize, data: [...] }
      const pagination = {
        total: payload?.total ?? payload?.data?.total ?? 0,
        page: payload?.page ?? payload?.data?.page ?? 1,
        pageSize: payload?.pageSize ?? payload?.data?.pageSize ?? params.limit ?? 10,
        totalPages: payload?.total 
          ? Math.ceil(payload.total / (payload?.pageSize ?? 10))
          : payload?.data?.total
            ? Math.ceil(payload.data.total / (payload?.data?.pageSize ?? 10))
            : 1
      }
      
      setState({ data: data ?? [], pagination, loading: false, error: null })
    } catch (error) {
      setState({ data: [], pagination: null, loading: false, error })
      toast.error(error.message || 'Unable to load posts')
    }
  }, [paramsKey, toast])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { ...state, refetch: fetch }
}

/**
 * Hook for fetching single post details
 * @param {string|number} postId - The post ID to fetch
 */
export function usePostDetail(postId) {
  const toast = useToast()
  const [state, setState] = useState({ data: null, loading: true, error: null })

  const fetch = useCallback(async () => {
    if (!postId) return
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
      // Uses postApi.detail which calls: api.get(`/posts/${id}`)
      const response = await postApi.detail(postId)
      setState({ data: response?.data ?? response, loading: false, error: null })
    } catch (error) {
      setState({ data: null, loading: false, error })
      toast.error(error.message || 'Unable to load post')
    }
  }, [postId, toast])

  useEffect(() => {
    fetch()
  }, [fetch])

  return { ...state, refetch: fetch }
}

/**
 * Hook providing post actions: like, unlike, comment, report
 * 
 * IMPORTANT API REQUIREMENTS:
 * - Like/Unlike: No request body needed
 * - Comment: Body MUST be { content: string } with 5-500 chars
 * - Report: Body should be { reason: string }
 * 
 * @param {string|number} postId - The post ID to perform actions on
 */
export function usePostActions(postId) {
  const toast = useToast()

  /**
   * Like a post
   * API: POST /posts/:id/likes (no body)
   */
  const like = useCallback(async () => {
    if (!postId) return null
    // postApi.like calls: api.post(`/posts/${postId}/likes`)
    const response = await postApi.like(postId)
    toast.success('You liked this post')
    return response?.data ?? response
  }, [postId, toast])

  /**
   * Unlike a post
   * API: DELETE /posts/:id/likes (no body)
   */
  const unlike = useCallback(async () => {
    if (!postId) return null
    // postApi.unlike calls: api.delete(`/posts/${postId}/likes`)
    const response = await postApi.unlike(postId)
    toast.info('Removed like from post')
    return response?.data ?? response
  }, [postId, toast])

  /**
   * Add comment to post
   * API: POST /posts/:id/comments
   * BODY: { content: string } - MUST use "content" key, 5-500 chars
   * 
   * @param {Object} payload - Must be { content: "..." }
   */
  const comment = useCallback(
    async (payload) => {
      if (!postId) return null
      
      // Validate comment content before API call
      const content = payload?.content?.trim()
      if (!content || content.length < 5) {
        throw new Error('Comment must have at least 5 characters')
      }
      if (content.length > 500) {
        throw new Error('Comment cannot exceed 500 characters')
      }
      
      // postApi.addComment calls: api.post(`/posts/${postId}/comments`, { content })
      // Backend expects: { content: string }
      const response = await postApi.addComment(postId, { content })
      toast.success('Comment posted')
      return response?.data ?? response
    },
    [postId, toast],
  )

  /**
   * Report a post
   * API: POST /posts/:id/reports
   * BODY: { reason: string }
   * 
   * @param {Object} payload - Should be { reason: "..." }
   */
  // TEMPORARILY DISABLED - Report feature is inactive
  // Original implementation preserved below:
  // const report = useCallback(
  //   async (payload) => {
  //     if (!postId) return null
  //     // postApi.report calls: api.post(`/posts/${postId}/reports`, payload)
  //     const response = await postApi.report(postId, payload)
  //     toast.info('Report submitted')
  //     return response?.data ?? response
  //   },
  //   [postId, toast],
  // )
  const report = useCallback(
    async () => {
      // Feature temporarily disabled - no API call made
      toast.info('The report feature is currently disabled.')
      return null
    },
    [toast],
  )

  return { like, unlike, comment, report }
}
