import { useContext } from 'react'
import { SoundContext } from './sound-context'

export function useSound() {
  const context = useContext(SoundContext)

  if (!context) {
    throw new Error('useSound trebuie folosit în SoundProvider')
  }

  return context
}
