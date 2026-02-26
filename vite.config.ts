import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "https://wmunda.dev.dg-prod.su",
        changeOrigin: true,
        secure: false,
      },
    },
  },
  build: {
    sourcemap: true,
  }
})
