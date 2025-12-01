import api from '@/lib/api.js'
import endpoints from '@/lib/endpoints.js'

export const postApi = {
  list: (params) => api.get(endpoints.posts.root, { params }),
  detail: (id) => api.get(endpoints.posts.byId(id)),
  create: (payload) => api.post(endpoints.posts.root, payload),
  update: (id, payload) => api.put(endpoints.posts.byId(id), payload),
  remove: (id) => api.delete(endpoints.posts.byId(id)),
  like: (postId) => api.post(endpoints.posts.likes(postId)),
  unlike: (postId) => api.delete(endpoints.posts.likes(postId)),
  comments: (postId, params) => api.get(endpoints.posts.comments(postId), { params }),
  addComment: (postId, payload) => api.post(endpoints.posts.comments(postId), payload),
  report: (postId, payload) => api.post(endpoints.posts.reports(postId), payload),
  tags: () => api.get(endpoints.posts.tags),
}

export default postApi
