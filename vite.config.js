import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/law-translations/'  // Make sure this matches your GitHub repo name
})