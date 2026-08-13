import { AnimatePresence, motion } from 'motion/react'
import { Check, MoonStar, Palette, Sun, X } from 'lucide-react'
import { useEffect, useRef, type CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { themeOptions, type Theme } from '../contexts/theme-context'
import { AppScrollArea } from './AppScrollArea'
import { panelBackdropVariants, panelFromRightVariants, panelLayerVariants } from './panelMotion'
import styles from './ThemePanel.module.css'

type ThemePanelProps = {
  open: boolean
  activeTheme: Theme
  onClose: () => void
  onSelect: (theme: Theme) => void
}

export function ThemePanel({ open, activeTheme, onClose, onSelect }: ThemePanelProps) {
  const panelRef = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!open) return
    previousFocus.current = document.activeElement as HTMLElement | null
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 80)
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }
      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = Array.from(panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled])'))
      if (!focusable.length) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', onKeyDown)
      previousFocus.current?.focus()
    }
  }, [onClose, open])

  return createPortal(
    <AnimatePresence initial={false} mode="sync">
      {open && (
        <motion.div
          className={styles.layer}
          variants={panelLayerVariants}
          initial="closed"
          animate="open"
          exit="closed"
        >
          <motion.button
            type="button"
            className={styles.backdrop}
            onClick={onClose}
            aria-label="Închide galeria de teme"
            variants={panelBackdropVariants}
          />

          <motion.aside
            id="theme-panel"
            ref={panelRef}
            className={styles.panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="theme-panel-title"
            variants={panelFromRightVariants}
          >
            <header className={styles.header}>
              <span className={styles.headerIcon}><Palette aria-hidden="true" /></span>
              <div>
                <small>Atelier vizual</small>
                <strong id="theme-panel-title">Alege atmosfera Cetății</strong>
                <p>Paleta se aplică instantaneu. Panoul rămâne deschis ca să le poți compara.</p>
              </div>
              <button ref={closeRef} type="button" onClick={onClose} aria-label="Închide panoul de teme">
                <X aria-hidden="true" />
              </button>
            </header>

            <AppScrollArea className={styles.themeScroll} contentClassName={styles.themeGrid} label="Temele aplicației">
              {themeOptions.map((option, index) => {
                const active = option.id === activeTheme
                const ModeIcon = option.mode === 'Luminoasă' ? Sun : MoonStar
                return (
                  <button
                    type="button"
                    key={option.id}
                    className={`${styles.themeOption} ${active ? styles.themeActive : ''}`}
                    onClick={() => onSelect(option.id)}
                    aria-pressed={active}
                    style={{
                      '--theme-main': option.colors[1],
                      '--theme-second': option.colors[2],
                      '--theme-warm': option.colors[3],
                      '--theme-base': option.colors[0],
                    } as CSSProperties}
                  >
                    <span className={styles.optionNumber}>{String(index + 1).padStart(2, '0')}</span>
                    <span className={styles.palettePreview} aria-hidden="true">
                      {option.colors.map((color) => <i key={color} style={{ background: color }} />)}
                    </span>
                    <span className={styles.optionCopy}>
                      <span><ModeIcon aria-hidden="true" /> {option.mode}</span>
                      <strong>{option.label}</strong>
                      <small>{option.description}</small>
                    </span>
                    <span className={styles.activeMark} aria-hidden="true">
                      {active ? <Check /> : <i />}
                    </span>
                  </button>
                )
              })}
            </AppScrollArea>

            <footer className={styles.footer}>
              <span><i /> Tema activă</span>
              <strong>{themeOptions.find((option) => option.id === activeTheme)?.label}</strong>
              <small>Alegerea este memorată pe acest dispozitiv.</small>
            </footer>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}
