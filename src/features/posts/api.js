/**
 * =============================================================================
 * POSTS API MODULE
 * =============================================================================
 * 
 * IMPORTANT: All endpoints use the axios instance from @/lib/api.js
 * which has baseURL configured from VITE_API_URL environment variable.
 * 
 * DO NOT use:
 *   - fetch('/api/posts/...')  → Bypasses baseURL, causes 404
 *   - axios.post('/api/...')   → Creates new axios instance without config
 *   - Relative URLs like '/posts/...' without the api instance
 * 
 * ALWAYS use:
 *   - api.get/post/put/delete from @/lib/api.js
 *   - endpoints from @/lib/endpoints.js
 * 
 * This ensures all requests go through the configured baseURL
 * and include authentication headers automatically.
 */
import api from '@/lib/api.js'
import endpoints from '@/lib/endpoints.js'

export const postApi = {
  // -----------------------------------------------------------------------------
  // CRUD Operations
  // -----------------------------------------------------------------------------
  
  /** List posts with optional filters/pagination */
  list: (params) => api.get(endpoints.posts.root, { params }),
  
  /** Get single post by ID */
  detail: (id) => api.get(endpoints.posts.byId(id)),
  
  /** Create new post - payload: { title, content, status, tags?, imageUrl? } */
  create: (payload) => api.post(endpoints.posts.root, payload),
  
  /** Update existing post */
  update: (id, payload) => api.put(endpoints.posts.byId(id), payload),
  
  /** Delete post */
  remove: (id) => api.delete(endpoints.posts.byId(id)),

  // -----------------------------------------------------------------------------
  // Like/Unlike - Endpoint: POST/DELETE /posts/:id/likes
  // No request body needed
  // -----------------------------------------------------------------------------
  
  /** Like a post */
  like: (postId) => api.post(endpoints.posts.likes(postId)),
  
  /** Unlike a post */
  unlike: (postId) => api.delete(endpoints.posts.likes(postId)),

  // -----------------------------------------------------------------------------
  // Comments - Endpoint: GET/POST /posts/:id/comments
  // POST body MUST be: { content: string } (min 5 chars, max 500 chars)
  // Using wrong key (text/comment/body) → 400 Bad Request
  // -----------------------------------------------------------------------------
  
  /** Get comments for a post */
  comments: (postId, params) => api.get(endpoints.posts.comments(postId), { params }),
  
  /** Add comment to post - payload MUST be { content: "..." } */
  addComment: (postId, payload) => api.post(endpoints.posts.comments(postId), payload),

  // -----------------------------------------------------------------------------
  // Reports - Endpoint: POST /posts/:id/reports
  // Body: { reason: string }
  // -----------------------------------------------------------------------------
  
  /** Report a post */
  report: (postId, payload) => api.post(endpoints.posts.reports(postId), payload),

  // -----------------------------------------------------------------------------
  // Tags
  // -----------------------------------------------------------------------------
  
  /** Get all available tags */
  tags: () => api.get(endpoints.posts.tags),
}

export default postApi
