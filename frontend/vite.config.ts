import { defineConfig } from 'vite'

const apiTarget = process.env.VITE_API_TARGET || 'http://localhost:8000'

export default defineConfig({
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': apiTarget,
      '/ws': {
        target: apiTarget,
        ws: true,
      },
    },
  },
})
