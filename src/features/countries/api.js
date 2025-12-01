import api from '@/lib/api.js'
import endpoints from '@/lib/endpoints.js'

export const countryApi = {
  list: (params) => api.get(endpoints.countries.root, { params }),
  detail: (id) => api.get(endpoints.countries.byId(id)),
  search: (params) => api.get(endpoints.countries.search, { params }),
  popular: () => api.get(endpoints.countries.popular),
  count: () => api.get(endpoints.countries.count),
}

export default countryApi
