import { useCallback, useEffect, useState } from 'react'
import postApi from '@/features/posts/api.js'
import useToast from '@/shared/hooks/useToast.js'

export function usePosts(params = {}) {
  const toast = useToast()
  const [state, setState] = useState({ data: [], pagination: null, loading: true, error: null })
  const paramsKey = JSON.stringify(params ?? {})

  const fetch = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
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

export function usePostDetail(postId) {
  const toast = useToast()
  const [state, setState] = useState({ data: null, loading: true, error: null })

  const fetch = useCallback(async () => {
    if (!postId) return
    setState((prev) => ({ ...prev, loading: true, error: null }))
    try {
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

export function usePostActions(postId) {
  const toast = useToast()

  const like = useCallback(async () => {
    if (!postId) return null
    const response = await postApi.like(postId)
    toast.success('Bạn đã thích bài viết')
    return response?.data ?? response
  }, [postId, toast])

  const unlike = useCallback(async () => {
    if (!postId) return null
    const response = await postApi.unlike(postId)
    toast.info('Đã bỏ thích bài viết')
    return response?.data ?? response
  }, [postId, toast])

  const comment = useCallback(
    async (payload) => {
      if (!postId) return null
      const response = await postApi.addComment(postId, payload)
      toast.success('Đã đăng bình luận')
      return response?.data ?? response
    },
    [postId, toast],
  )

  const report = useCallback(
    async (payload) => {
      if (!postId) return null
      const response = await postApi.report(postId, payload)
      toast.info('Đã gửi báo cáo')
      return response?.data ?? response
    },
    [postId, toast],
  )

  return { like, unlike, comment, report }
}
