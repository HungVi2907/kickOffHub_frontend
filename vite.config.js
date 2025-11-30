import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Dev server proxy to backend API to avoid CORS during development
  server: {
    proxy: {
      // Proxy any request starting with /api to the backend server
      '/api': {
        // Use local backend by default, allow override with env var when needed
        target: 'https://kickoffhub.space',
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, '/api') // no rewrite needed
      },
    },
  },
})
  