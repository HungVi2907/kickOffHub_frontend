import axios from 'axios'
import useAuthStore from '../store/useAuthStore.js'

const fallbackBaseUrl = import.meta.env.DEV ? '/api' : 'https://api.kickoffhub.space/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || fallbackBaseUrl

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
})

apiClient.interceptors.request.use((config) => {
  const { token } = useAuthStore.getState()
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

apiClient.interceptors.response.use(
  (response) => {
    const payload = response?.data

    if (payload && typeof payload === 'object' && 'success' in payload) {
      response.meta = {
        success: payload.success,
        message: payload.message,
      }
      response.data = payload.data ?? null
    }

    return response
  },
  (error) => {
    const status = error.response?.status
    if (status === 401) {
      const { logout } = useAuthStore.getState()
      logout()
    }

    const normalizedMessage =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Yêu cầu thất bại'

    error.message = normalizedMessage
    return Promise.reject(error)
  },
)

export default apiClient
