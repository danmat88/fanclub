import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/manrope'
import '@fontsource-variable/oxanium'
import '@fontsource-variable/saira'
import App from './App'
import { PerformanceProvider } from './contexts/PerformanceProvider'
import { SoundProvider } from './contexts/SoundProvider'
import { ThemeProvider } from './contexts/ThemeProvider'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <PerformanceProvider>
          <SoundProvider>
            <App />
          </SoundProvider>
        </PerformanceProvider>
      </ThemeProvider>
    </BrowserRouter>
  </StrictMode>,
)
