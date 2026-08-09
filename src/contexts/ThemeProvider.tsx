import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import { ThemeContext, type Theme } from './theme-context'

const getInitialTheme = (): Theme => {
  let savedTheme: string | null = null

  try {
    savedTheme = localStorage.getItem('cetatea-theme')
  } catch {
    return 'nocturna'
  }

  if (
    savedTheme === 'nocturna' ||
    savedTheme === 'zi-de-meci' ||
    savedTheme === 'asediu' ||
    savedTheme === 'bucovina'
  ) {
    document.documentElement.dataset.theme = savedTheme
    return savedTheme
  }

  return 'nocturna'
}

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>(getInitialTheme)

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    localStorage.setItem('cetatea-theme', theme)
  }, [theme])

  const toggleTheme = useCallback(() => {
    const themes: Theme[] = ['nocturna', 'zi-de-meci', 'asediu', 'bucovina']
    setTheme((currentTheme) => {
      const currentIndex = themes.indexOf(currentTheme)
      return themes[(currentIndex + 1) % themes.length]
    })
  }, [])

  const value = useMemo(() => ({ theme, toggleTheme }), [theme, toggleTheme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
