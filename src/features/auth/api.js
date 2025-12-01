import api from '@/lib/api.js'
import endpoints from '@/lib/endpoints.js'

export const authApi = {
  login: (payload) => api.post(endpoints.auth.login, payload),
  register: (payload) => api.post(endpoints.auth.register, payload),
  refresh: (payload) => api.post(endpoints.auth.refresh, payload),
  profile: () => api.get(endpoints.auth.profile),
  me: () => api.get(endpoints.auth.me),
}

export default authApi
