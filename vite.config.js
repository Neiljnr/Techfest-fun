import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    // Keep the generated app syntax compatible with older iPhone Safari
    // releases commonly found on iPhones with a Home button.
    target: 'safari12',
    cssTarget: 'safari12'
  },
  server: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true
  },
  preview: {
    host: '0.0.0.0',
    port: 4173,
    strictPort: true
  }
})
