import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/oxanium'
import '@fontsource-variable/space-grotesk'
import '@fontsource/barlow-condensed/latin-ext-500.css'
import '@fontsource/barlow-condensed/latin-ext-600.css'
import '@fontsource/barlow-condensed/latin-ext-700.css'
import '@fontsource/barlow-condensed/latin-ext-800.css'
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
