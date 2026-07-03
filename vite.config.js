import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  // Relative base so the build works at any mount path (e.g. GitHub Pages
  // serves the app under /automation-agent/).
  base: './',
  plugins: [react()],
  build: { outDir: 'dist' },
})
