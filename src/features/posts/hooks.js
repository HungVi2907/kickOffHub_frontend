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
      const payload = response?.data ?? response ?? {}
      const data = Array.isArray(payload?.data)
        ? payload.data
        : Array.isArray(payload?.data?.data)
        ? payload.data.data
        : Array.isArray(payload)
        ? payload
        : []
      const pagination =
        payload?.pagination ||
        payload?.meta ||
        response?.meta ||
        payload?.data?.pagination ||
        null
      setState({ data: data ?? [], pagination, loading: false, error: null })
    } catch (error) {
      setState({ data: [], pagination: null, loading: false, error })
      toast.error(error.message || 'Không thể tải danh sách bài viết')
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
      toast.error(error.message || 'Không thể tải bài viết')
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
    toast.success('Bạn đã thích bài viết')
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
    toast.info('Đã bỏ thích bài viết')
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
        throw new Error('Bình luận phải có ít nhất 5 ký tự')
      }
      if (content.length > 500) {
        throw new Error('Bình luận không được vượt quá 500 ký tự')
      }
      
      // postApi.addComment calls: api.post(`/posts/${postId}/comments`, { content })
      // Backend expects: { content: string }
      const response = await postApi.addComment(postId, { content })
      toast.success('Đã đăng bình luận')
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
  const report = useCallback(
    async (payload) => {
      if (!postId) return null
      // postApi.report calls: api.post(`/posts/${postId}/reports`, payload)
      const response = await postApi.report(postId, payload)
      toast.info('Đã gửi báo cáo')
      return response?.data ?? response
    },
    [postId, toast],
  )

  return { like, unlike, comment, report }
}
