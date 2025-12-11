import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './index.css'
import { initTracking } from './utils/tracking.js'

// Inicializa tracking quando a aplicação carrega
initTracking().catch(error => {
  console.error('Erro ao inicializar tracking:', error)
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)









