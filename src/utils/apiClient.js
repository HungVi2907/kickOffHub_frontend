import axios from 'axios'
import useAuthStore from '../store/useAuthStore.js'

const fallbackBaseUrl = import.meta.env.DEV ? '/api' : 'https://kickoffhub-api.onrender.com/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || fallbackBaseUrl

const apiClient = axios.create({
  baseURL: API_BASE_URL,
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
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      const { logout } = useAuthStore.getState()
      logout()
    }
    return Promise.reject(error)
  },
)

export default apiClient
