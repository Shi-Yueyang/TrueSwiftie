import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
// import Anitest from './Anitest.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {/* <Anitest/> */}
  </StrictMode>,
)
