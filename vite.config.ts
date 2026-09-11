import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,  // Expose to network
    proxy: {
      '/api': {
        target: 'http://localhost:8000',  // This still works inside Codespace
        changeOrigin: true,
      }
    }
  }
})