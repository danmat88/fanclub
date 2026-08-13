import { AnimatePresence, motion } from 'motion/react'
import {
  BellRing,
  Check,
  ChevronRight,
  Gauge,
  LogIn,
  MapPin,
  Palette,
  ShieldCheck,
  SlidersHorizontal,
  Target,
  UserRound,
  Volume2,
  VolumeX,
  X,
  Zap,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import fanEmblem from '../assets/brand/cetatea-fan-emblem.webp'
import { useSound } from '../contexts/useSound'
import { panelBackdropVariants, panelFromRightVariants, panelLayerVariants } from './panelMotion'
import styles from './ProfilePanel.module.css'

type ProfileTab = 'profil' | 'preferinte' | 'misiuni'

type ProfilePanelProps = {
  open: boolean
  connected: boolean
  isMuted: boolean
  performanceLabel: string
  themeLabel: string
  onClose: () => void
  onCyclePerformance: () => void
  onCycleTheme: () => void
  onToggleSound: () => void
}

const tabs = [
  { id: 'profil' as const, label: 'Profil', icon: UserRound },
  { id: 'preferinte' as const, label: 'Preferințe', icon: SlidersHorizontal },
  { id: 'misiuni' as const, label: 'Misiuni', icon: Target },
]

const missions = [
  { title: 'Vino în alb-albastru', meta: 'Zi de meci', reward: '+80 PR' },
  { title: 'Trimite un mesaj în Peluză', meta: 'Comunitate', reward: '+45 PR' },
  { title: 'Invită un suporter nou', meta: 'Cetatea crește', reward: '+20 PR' },
]

export function ProfilePanel({
  open,
  connected,
  isMuted,
  performanceLabel,
  themeLabel,
  onClose,
  onCyclePerformance,
  onCycleTheme,
  onToggleSound,
}: ProfilePanelProps) {
  const { play } = useSound()
  const panelRef = useRef<HTMLElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const previousFocus = useRef<HTMLElement | null>(null)
  const [activeTab, setActiveTab] = useState<ProfileTab>('profil')
  const [notifications, setNotifications] = useState(true)
  const [claimed, setClaimed] = useState<number[]>([0])

  useEffect(() => {
    if (!open) return

    previousFocus.current = document.activeElement as HTMLElement | null
    const focusTimer = window.setTimeout(() => closeRef.current?.focus(), 80)

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose()
        return
      }

      if (event.key !== 'Tab' || !panelRef.current) return
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>('button:not([disabled]), [href], input, [tabindex]:not([tabindex="-1"])'),
      )
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

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      window.clearTimeout(focusTimer)
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus.current?.focus()
    }
  }, [onClose, open])

  const chooseTab = (tab: ProfileTab) => {
    setActiveTab(tab)
    play('navigate')
  }

  const toggleMission = (index: number) => {
    setClaimed((current) => current.includes(index)
      ? current.filter((item) => item !== index)
      : [...current, index])
    play('success')
  }

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
            aria-label="Închide panoul profilului"
            onClick={onClose}
            variants={panelBackdropVariants}
          />

          <motion.aside
            id="profile-panel"
            ref={panelRef}
            className={styles.panel}
            role="dialog"
            aria-modal="true"
            aria-labelledby="profile-panel-title"
            variants={panelFromRightVariants}
          >
            <header className={styles.panelHeader}>
              <div>
                <span><i /> Centru personal</span>
                <strong id="profile-panel-title">Carnetul Cetății</strong>
              </div>
              <button ref={closeRef} type="button" onClick={onClose} aria-label="Închide panoul">
                <X aria-hidden="true" />
              </button>
            </header>

            <div className={styles.identity}>
              <span className={styles.avatar}><img src={fanEmblem} alt="Emblema Cetatea Suceava" /></span>
              <div>
                <small>Membru digital</small>
                <strong>Suporter Cetatea</strong>
                <span><MapPin aria-hidden="true" /> Suceava · Peluza Areni</span>
              </div>
              <b>#1932</b>
            </div>

            <nav className={styles.tabs} aria-label="Secțiunile contului">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    type="button"
                    key={tab.id}
                    className={activeTab === tab.id ? styles.tabActive : ''}
                    onClick={() => chooseTab(tab.id)}
                    aria-pressed={activeTab === tab.id}
                  >
                    <Icon aria-hidden="true" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>

            <div className={styles.panelBody}>
              <AnimatePresence mode="wait" initial={false}>
                {activeTab === 'profil' && (
                  <motion.section key="profil" className={styles.tabContent} {...tabMotion}>
                    <div className={styles.levelBlock}>
                      <span><Zap aria-hidden="true" /> Nivel tribună</span>
                      <strong>08</strong>
                      <div><i /></div>
                      <small>680 / 1000 puncte până la nivelul 09</small>
                    </div>

                    <div className={styles.profileStats}>
                      <span><strong>12</strong><small>Meciuri</small></span>
                      <span><strong>7</strong><small>Misiuni</small></span>
                      <span><strong>284</strong><small>Reputație</small></span>
                    </div>

                    <div className={styles.securityLine}>
                      <ShieldCheck aria-hidden="true" />
                      <span><strong>Identitate protejată</strong><small>{connected ? 'Cont conectat prin Firebase' : 'Profil demonstrativ local'}</small></span>
                      <i>{connected ? 'ACTIV' : 'LOCAL'}</i>
                    </div>

                    <button type="button" className={styles.primaryAction} onClick={() => play('success')}>
                      <LogIn aria-hidden="true" />
                      <span><strong>{connected ? 'Gestionează contul' : 'Conectează-te'}</strong><small>Sincronizează profilul și recompensele</small></span>
                      <ChevronRight aria-hidden="true" />
                    </button>
                  </motion.section>
                )}

                {activeTab === 'preferinte' && (
                  <motion.section key="preferinte" className={styles.tabContent} {...tabMotion}>
                    <button type="button" className={styles.setting} onClick={onCycleTheme}>
                      <Palette aria-hidden="true" />
                      <span><strong>Tema aplicației</strong><small>Culorile întregii experiențe</small></span>
                      <b>{themeLabel}</b>
                    </button>
                    <button type="button" className={styles.setting} onClick={onToggleSound}>
                      {isMuted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
                      <span><strong>Sunetele tribunei</strong><small>Feedback pentru acțiuni și navigare</small></span>
                      <b>{isMuted ? 'OPRITE' : 'ACTIVE'}</b>
                    </button>
                    <button type="button" className={`${styles.setting} ${styles.performanceSetting}`} onClick={onCyclePerformance}>
                      <Gauge aria-hidden="true" />
                      <span><strong>Performanță vizuală</strong><small>Nivelul animațiilor și efectelor</small></span>
                      <b>{performanceLabel}</b>
                    </button>
                    <button
                      type="button"
                      className={styles.setting}
                      onClick={() => {
                        setNotifications((current) => !current)
                        play('toggle')
                      }}
                      aria-pressed={notifications}
                    >
                      <BellRing aria-hidden="true" />
                      <span><strong>Notificări de meci</strong><small>Lot, scor, goluri și știri urgente</small></span>
                      <b>{notifications ? 'ACTIVE' : 'OPRITE'}</b>
                    </button>
                  </motion.section>
                )}

                {activeTab === 'misiuni' && (
                  <motion.section key="misiuni" className={styles.tabContent} {...tabMotion}>
                    <div className={styles.missionHeading}>
                      <span>Misiuni disponibile</span>
                      <strong>{claimed.length} / {missions.length} realizate</strong>
                    </div>
                    {missions.map((mission, index) => {
                      const complete = claimed.includes(index)
                      return (
                        <button
                          type="button"
                          key={mission.title}
                          className={`${styles.mission} ${complete ? styles.missionComplete : ''}`}
                          onClick={() => toggleMission(index)}
                          aria-pressed={complete}
                        >
                          <span>{complete ? <Check aria-hidden="true" /> : `0${index + 1}`}</span>
                          <div><small>{mission.meta}</small><strong>{mission.title}</strong></div>
                          <b>{complete ? 'GATA' : mission.reward}</b>
                        </button>
                      )
                    })}
                  </motion.section>
                )}
              </AnimatePresence>
            </div>

            <footer className={styles.panelFooter}>
              <span>CSM Cetatea 1932 Suceava</span>
              <strong>Din oraș. Pentru oraș.</strong>
            </footer>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  )
}

const tabMotion = {
  initial: { opacity: 0, x: 22 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -16 },
  transition: { duration: .28, ease: [0.16, 1, 0.3, 1] as const },
}
