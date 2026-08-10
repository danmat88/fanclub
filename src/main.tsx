import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import '@fontsource-variable/exo-2'
import '@fontsource-variable/space-grotesk'
import '@fontsource/chakra-petch/500.css'
import '@fontsource/chakra-petch/700.css'
import '@fontsource/barlow-condensed/600.css'
import '@fontsource/barlow-condensed/800.css'
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
