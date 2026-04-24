import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

const rootElement = document.getElementById('root')
if (!rootElement) throw new Error('Root element not found')

createRoot(rootElement).render(
  <StrictMode>
    <div className="min-h-screen bg-zinc-50 flex items-center justify-center">
      <p className="text-zinc-500 text-sm">Carregando...</p>
    </div>
  </StrictMode>
)
