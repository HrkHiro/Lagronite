import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('recharts')) return 'chart-vendor'
            if (id.includes('react-webcam')) return 'camera-vendor'
            if (id.includes('socket.io-client')) return 'socket-vendor'
            if (id.includes('framer-motion')) return 'motion-vendor'
            if (id.includes('react-router-dom') || id.includes('react-dom') || id.includes('react')) {
              return 'react-vendor'
            }
          }
        },
      },
    },
  },
})
