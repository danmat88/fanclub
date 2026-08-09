import { useContext } from 'react'
import { PerformanceContext } from './performance-context'

export function usePerformance() {
  const context = useContext(PerformanceContext)

  if (!context) {
    throw new Error('usePerformance trebuie folosit în PerformanceProvider')
  }

  return context
}
