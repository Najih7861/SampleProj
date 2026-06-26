import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      // Forward API calls to the .NET backend (http profile)
      '/api': {
        target: 'http://localhost:5169',
        changeOrigin: true,
      },
      // Uploaded images are served as static files from the backend.
      '/uploads': {
        target: 'http://localhost:5169',
        changeOrigin: true,
      },
      // Analytics dashboard — Python FastAPI microservice (see client/analytics-service).
      '/analytics': {
        target: 'http://localhost:8000',
        changeOrigin: true,
      },
    },
  },
})
