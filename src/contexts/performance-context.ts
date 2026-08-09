import { createContext } from 'react'

export type PerformanceMode = 'automat' | 'complet' | 'economie'
export type ResolvedPerformanceMode = Exclude<PerformanceMode, 'automat'>

export const performanceModeOrder: PerformanceMode[] = ['automat', 'complet', 'economie']

export const performanceModeLabels: Record<PerformanceMode, string> = {
  automat: 'Automat',
  complet: 'Complet',
  economie: 'Economie',
}

export type PerformanceContextValue = {
  mode: PerformanceMode
  resolvedMode: ResolvedPerformanceMode
  isEconomy: boolean
  cycleMode: () => void
}

export const PerformanceContext = createContext<PerformanceContextValue | null>(null)
