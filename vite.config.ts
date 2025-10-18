import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// måste matcha repo-namnet exakt (skiftläge också!)
const repoBase = '/Cinemoria/'

export default defineConfig({
  plugins: [react()],
  base: repoBase,
  server: { port: 5173 }
})