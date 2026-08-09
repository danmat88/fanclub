import { useEffect, useState } from 'react'
import { nextMatch } from '../data/clubData'

export type MatchCountdown = {
  days: string
  hours: string
  minutes: string
  seconds: string
}

export function useMatchCountdown(): MatchCountdown {
  const target = new Date(nextMatch.kickoff).getTime()
  const [remaining, setRemaining] = useState(() => Math.max(0, target - Date.now()))

  useEffect(() => {
    const timer = window.setInterval(() => {
      setRemaining(Math.max(0, target - Date.now()))
    }, 1000)

    return () => window.clearInterval(timer)
  }, [target])

  const totalSeconds = Math.floor(remaining / 1000)

  return {
    days: String(Math.floor(totalSeconds / 86400)).padStart(2, '0'),
    hours: String(Math.floor((totalSeconds % 86400) / 3600)).padStart(2, '0'),
    minutes: String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0'),
    seconds: String(totalSeconds % 60).padStart(2, '0'),
  }
}
