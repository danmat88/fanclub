import { createContext } from 'react'

export type Theme =
  | 'nocturna'
  | 'zi-de-meci'
  | 'asediu'
  | 'bucovina'
  | 'regal'
  | 'peluza'
  | 'apus-areni'
  | 'gheata-albastra'

export type ThemeOption = {
  id: Theme
  label: string
  description: string
  mode: 'Întunecată' | 'Luminoasă'
  colors: [string, string, string, string]
}

export const themeOptions: ThemeOption[] = [
  { id: 'nocturna', label: 'Nocturnă', description: 'Albastru electric și luminile stadionului.', mode: 'Întunecată', colors: ['#07152b', '#20d9ff', '#8f6cff', '#35e8a2'] },
  { id: 'zi-de-meci', label: 'Zi de meci', description: 'Aer curat, hârtie albă și albastru puternic.', mode: 'Luminoasă', colors: ['#e8f1f8', '#006fc9', '#6840bc', '#00805a'] },
  { id: 'asediu', label: 'Asediu', description: 'Roșu intens, cărbune și energie de deplasare.', mode: 'Întunecată', colors: ['#18080d', '#ff416c', '#ff9c38', '#ffd05f'] },
  { id: 'bucovina', label: 'Bucovina', description: 'Verde adânc, turcoaz și rădăcini locale.', mode: 'Întunecată', colors: ['#061815', '#19e0bd', '#a788ff', '#c2f56d'] },
  { id: 'regal', label: 'Regal', description: 'Indigo, aur și o atmosferă de gală.', mode: 'Întunecată', colors: ['#0d0a24', '#8da2ff', '#d68cff', '#ffd166'] },
  { id: 'peluza', label: 'Peluză', description: 'Grafit, verde acid și portocaliu de torțe.', mode: 'Întunecată', colors: ['#090d0b', '#b8f500', '#26e6c8', '#ff8a34'] },
  { id: 'apus-areni', label: 'Apus pe Areni', description: 'Violet de seară, coral și cer cald.', mode: 'Întunecată', colors: ['#170a20', '#ff6b8f', '#9e7cff', '#ffc15a'] },
  { id: 'gheata-albastra', label: 'Gheață albastră', description: 'Contrast luminos, rece și foarte clar.', mode: 'Luminoasă', colors: ['#edf6fb', '#007fa8', '#4f5fc7', '#007a68'] },
]

export const themeOrder = themeOptions.map((option) => option.id)

export const themeLabels: Record<Theme, string> = {
  nocturna: 'Nocturnă',
  'zi-de-meci': 'Zi de meci',
  asediu: 'Asediu',
  bucovina: 'Bucovina',
  regal: 'Regal',
  peluza: 'Peluză',
  'apus-areni': 'Apus pe Areni',
  'gheata-albastra': 'Gheață albastră',
}

export type ThemeContextValue = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const ThemeContext = createContext<ThemeContextValue | null>(null)
