import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Ändra detta om repo-namnet inte är "cinemoria".
const repoBase = '/cinemoria/'

export default defineConfig({
  plugins: [react()],
  base: repoBase, // <-- viktigt för GitHub Pages
  server: { port: 5173 }
})