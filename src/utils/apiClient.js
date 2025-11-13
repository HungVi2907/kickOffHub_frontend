import axios from 'axios'

const fallbackBaseUrl = import.meta.env.DEV
  ? '/api'
  : 'https://kickoffhub-api.onrender.com/api'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || fallbackBaseUrl

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

export default apiClient
