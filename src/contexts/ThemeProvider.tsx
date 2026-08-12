import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ThemeContext, themeBrowserColors, themeOrder, type Theme } from './theme-context'

const getInitialTheme = (): Theme => {
  let savedTheme: string | null = null

  try {
    savedTheme = localStorage.getItem('cetatea-theme')
  } catch {
    return 'nocturna'
  }

  if (themeOrder.includes(savedTheme as Theme)) {
    document.documentElement.dataset.theme = savedTheme as Theme
    return savedTheme as Theme
  }

  return 'nocturna'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setActiveTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    const browserColor = themeBrowserColors[theme]
    const themeColorMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    themeColorMeta?.setAttribute('content', browserColor)
    document.documentElement.style.backgroundColor = browserColor
    localStorage.setItem('cetatea-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    setActiveTheme((currentTheme) => {
      const currentIndex = themeOrder.indexOf(currentTheme)
      return themeOrder[(currentIndex + 1) % themeOrder.length]
    })
  }, [])

  const setTheme = useCallback((nextTheme: Theme) => setActiveTheme(nextTheme), [])
  const value = useMemo(() => ({ theme, setTheme, toggleTheme }), [theme, setTheme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
