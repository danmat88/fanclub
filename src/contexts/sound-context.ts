import { createContext } from 'react'

export type SoundName = 'navigate' | 'toggle' | 'success'

export type SoundContextValue = {
  isMuted: boolean
  play: (sound: SoundName) => void
  toggleMute: () => void
}

export const SoundContext = createContext<SoundContextValue | null>(null)
