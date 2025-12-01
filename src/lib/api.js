import axios from 'axios'
import endpoints from './endpoints.js'
import useAuthStore from '@/features/auth/store.js'

const fallbackBaseUrl = import.meta.env.DEV ? '/api' : 'https://api.kickoffhub.space/api'
const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || fallbackBaseUrl

const http = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

let refreshPromise = null

const getNormalizedPayload = (response) => {
  const payload = response?.data
  const success = typeof payload?.success === 'boolean' ? payload.success : true
  const message = typeof payload?.message === 'string' ? payload.message : ''
  const data = 'data' in (payload ?? {}) ? payload.data : payload
  const meta = payload?.meta ?? null

  return {
    success,
    message,
    data,
    meta,
    status: response?.status,
  }
}

const refreshAccessToken = async () => {
  const { refreshToken, setTokens, logout } = useAuthStore.getState()
  if (!refreshToken) {
    logout()
    throw new Error('Missing refresh token')
  }

  try {
    const response = await axios.post(
      `${API_BASE_URL}${endpoints.auth.refresh}`,
      { refreshToken },
      { withCredentials: true },
    )

    const payload = getNormalizedPayload(response)
    const tokens = payload.data ?? {}
    if (!tokens.accessToken) {
      throw new Error(payload.message || 'Refresh token response invalid')
    }

    setTokens({ accessToken: tokens.accessToken, refreshToken: tokens.refreshToken || refreshToken })
    return tokens.accessToken
  } catch (error) {
    useAuthStore.getState().logout()
    throw error
  }
}

http.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

http.interceptors.response.use(
  (response) => {
    response.data = getNormalizedPayload(response)
    return response
  },
  async (error) => {
    const status = error?.response?.status
    const originalRequest = error.config

    if (status === 401 && !originalRequest?._retry) {
      originalRequest._retry = true

      if (!refreshPromise) {
        refreshPromise = refreshAccessToken().finally(() => {
          refreshPromise = null
        })
      }

      try {
        const accessToken = await refreshPromise
        originalRequest.headers.Authorization = `Bearer ${accessToken}`
        return http(originalRequest)
      } catch (refreshError) {
        return Promise.reject(formatApiError(refreshError))
      }
    }

    return Promise.reject(formatApiError(error))
  },
)

function formatApiError(error) {
  const response = error?.response?.data
  const defaultMessage = 'Yêu cầu thất bại. Vui lòng thử lại.'
  const message = response?.message || response?.error?.message || error?.message || defaultMessage
  const normalizedError = new Error(message)
  normalizedError.success = false
  normalizedError.message = message
  normalizedError.data = response?.data ?? null
  normalizedError.status = error?.response?.status
  return normalizedError
}

const api = {
  get: (url, config) => http.get(url, config).then((res) => res.data),
  post: (url, body, config) => http.post(url, body, config).then((res) => res.data),
  put: (url, body, config) => http.put(url, body, config).then((res) => res.data),
  patch: (url, body, config) => http.patch(url, body, config).then((res) => res.data),
  delete: (url, config) => http.delete(url, config).then((res) => res.data),
  client: http,
}

export default api
