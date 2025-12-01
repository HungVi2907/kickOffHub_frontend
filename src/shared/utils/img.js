const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || ''

export function buildImageUrl(path) {
  if (!path) return ''
  if (/^https?:\/\//i.test(path)) {
    return path
  }
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL.replace(/\/?$/, '')}${normalizedPath}`
}

export function withFallback(src, fallback = 'https://placehold.co/200x200?text=KickOffHub') {
  const resolved = buildImageUrl(src)
  return resolved || fallback
}

// Convenient alias
export const img = buildImageUrl

export default buildImageUrl
