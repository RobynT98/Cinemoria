// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App'
import './global.css'

// Sätt sparat tema direkt vid uppstart (innan React mountar)
{
  const saved = (localStorage.getItem('cm_theme') as 'dark' | 'light' | 'sepia') || 'dark'
  const root = document.documentElement
  // vi använder bara klasser för dark/sepia; "light" = inga extra klasser
  root.classList.remove('dark', 'sepia')
  if (saved === 'dark') root.classList.add('dark')
  if (saved === 'sepia') root.classList.add('sepia')
}

// Vite BASE_URL (t.ex. "/Cinemoria/") → React Router basename utan trailing slash
const basename = (import.meta.env.BASE_URL || '/').replace(/\/$/, '')

const rootEl = document.getElementById('root')!
ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <BrowserRouter basename={basename}>
      <App />
    </BrowserRouter>
  </React.StrictMode>
)

// Registrera service worker om den finns (för Pages/PWA)
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/service-worker.js').catch(() => {
    // tyst fail — inget dramatiskt om SW saknas i dev
  })
}