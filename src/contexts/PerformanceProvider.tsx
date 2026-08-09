import { MotionConfig } from 'motion/react'
import { useCallback, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  PerformanceContext,
  performanceModeOrder,
  type PerformanceMode,
} from './performance-context'

type ConnectionHints = EventTarget & {
  saveData?: boolean
}

type NavigatorWithPerformanceHints = Navigator & {
  connection?: ConnectionHints
  deviceMemory?: number
}

const getInitialMode = (): PerformanceMode => {
  try {
    const savedMode = localStorage.getItem('cetatea-performance')
    if (savedMode === 'automat' || savedMode === 'complet' || savedMode === 'economie') {
      return savedMode
    }
  } catch {
    // Modul automat este o valoare implicită sigură dacă stocarea este indisponibilă.
  }

  return 'automat'
}

const shouldUseEconomyMode = () => {
  const performanceNavigator = navigator as NavigatorWithPerformanceHints
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const savesData = Boolean(performanceNavigator.connection?.saveData)
  const hasLimitedMemory =
    typeof performanceNavigator.deviceMemory === 'number' && performanceNavigator.deviceMemory <= 4
  const hasLimitedCpu =
    typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency <= 4

  return prefersReducedMotion || savesData || hasLimitedMemory || hasLimitedCpu
}

export function PerformanceProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PerformanceMode>(getInitialMode)
  const [autoEconomy, setAutoEconomy] = useState(shouldUseEconomyMode)
  const resolvedMode = mode === 'automat' ? (autoEconomy ? 'economie' : 'complet') : mode
  const isEconomy = resolvedMode === 'economie'

  useEffect(() => {
    const motionPreference = window.matchMedia('(prefers-reduced-motion: reduce)')
    const connection = (navigator as NavigatorWithPerformanceHints).connection
    const updateAutomaticMode = () => setAutoEconomy(shouldUseEconomyMode())

    motionPreference.addEventListener('change', updateAutomaticMode)
    connection?.addEventListener('change', updateAutomaticMode)

    return () => {
      motionPreference.removeEventListener('change', updateAutomaticMode)
      connection?.removeEventListener('change', updateAutomaticMode)
    }
  }, [])

  useEffect(() => {
    document.documentElement.dataset.performanceMode = mode
    document.documentElement.dataset.performance = resolvedMode

    try {
      localStorage.setItem('cetatea-performance', mode)
    } catch {
      // Interfața rămâne funcțională și fără acces la stocarea locală.
    }
  }, [mode, resolvedMode])

  const cycleMode = useCallback(() => {
    setMode((currentMode) => {
      const currentIndex = performanceModeOrder.indexOf(currentMode)
      return performanceModeOrder[(currentIndex + 1) % performanceModeOrder.length]
    })
  }, [])

  const value = useMemo(
    () => ({ mode, resolvedMode, isEconomy, cycleMode }),
    [cycleMode, isEconomy, mode, resolvedMode],
  )

  return (
    <PerformanceContext.Provider value={value}>
      <MotionConfig reducedMotion={isEconomy ? 'always' : 'never'}>{children}</MotionConfig>
    </PerformanceContext.Provider>
  )
}
