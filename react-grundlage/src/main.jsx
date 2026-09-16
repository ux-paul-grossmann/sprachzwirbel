import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './original/style_default.css'
import './original/themeswitcher.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
