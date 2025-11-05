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
        target: ' https://kickoffhub-api.onrender.com',
        changeOrigin: true,
        secure: false,
        // rewrite: (path) => path.replace(/^\/api/, '/api') // no rewrite needed
      },
    },
  },
})
