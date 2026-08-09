import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { SoundContext, type SoundName } from './sound-context'

export function SoundProvider({ children }: { children: ReactNode }) {
  const [isMuted, setIsMuted] = useState(
    () => localStorage.getItem('cetatea-sound') === 'muted',
  )
  const audioContextRef = useRef<AudioContext | null>(null)

  const getAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext()
    }

    if (audioContextRef.current.state === 'suspended') {
      void audioContextRef.current.resume()
    }

    return audioContextRef.current
  }, [])

  const synthesize = useCallback(
    (sound: SoundName) => {
      const context = getAudioContext()
      const now = context.currentTime
      const gain = context.createGain()
      gain.connect(context.destination)
      gain.gain.setValueAtTime(0.0001, now)
      gain.gain.exponentialRampToValueAtTime(0.055, now + 0.012)

      const notes =
        sound === 'success'
          ? [329.63, 440, 659.25]
          : sound === 'toggle'
            ? [520, 390]
            : [220, 340]

      notes.forEach((frequency, index) => {
        const oscillator = context.createOscillator()
        const noteGain = context.createGain()
        const start = now + index * 0.045
        const end = start + (sound === 'success' ? 0.12 : 0.075)

        oscillator.type = sound === 'navigate' ? 'triangle' : 'sine'
        oscillator.frequency.setValueAtTime(frequency, start)
        noteGain.gain.setValueAtTime(0.7 / notes.length, start)
        noteGain.gain.exponentialRampToValueAtTime(0.0001, end)
        oscillator.connect(noteGain)
        noteGain.connect(gain)
        oscillator.start(start)
        oscillator.stop(end)
      })

      gain.gain.exponentialRampToValueAtTime(
        0.0001,
        now + (sound === 'success' ? 0.3 : 0.2),
      )
    },
    [getAudioContext],
  )

  const play = useCallback(
    (sound: SoundName) => {
      if (!isMuted) synthesize(sound)
    },
    [isMuted, synthesize],
  )

  const toggleMute = useCallback(() => {
    setIsMuted((currentValue) => {
      const nextValue = !currentValue
      localStorage.setItem('cetatea-sound', nextValue ? 'muted' : 'active')
      if (!nextValue) synthesize('success')
      return nextValue
    })
  }, [synthesize])

  const value = useMemo(
    () => ({ isMuted, play, toggleMute }),
    [isMuted, play, toggleMute],
  )

  return <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
}
