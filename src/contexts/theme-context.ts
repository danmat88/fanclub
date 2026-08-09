import { createContext } from 'react'

export type Theme = 'nocturna' | 'zi-de-meci' | 'asediu' | 'bucovina'

export const themeLabels: Record<Theme, string> = {
  nocturna: 'Nocturnă',
  'zi-de-meci': 'Zi de meci',
  asediu: 'Asediu',
  bucovina: 'Bucovina',
}

export type ThemeContextValue = {
  theme: Theme
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
