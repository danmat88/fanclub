import { AnimatePresence, motion } from 'motion/react'
import {
  CalendarDays,
  Landmark,
  Megaphone,
  MoreHorizontal,
  Newspaper,
  Trophy,
  UsersRound,
  X,
  type LucideIcon,
} from 'lucide-react'
import { useEffect, useState, type CSSProperties } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { nextMatch } from '../data/clubData'
import { panelBackdropVariants, panelFromBottomVariants, panelLayerVariants } from './panelMotion'
import styles from './MobileNavigation.module.css'

type MobileNavigationProps = {
  activePath: string
  economy?: boolean
  matchBadge: string
  onNavigate: (path: string) => void
  startupVisible?: boolean
}

type MobileDestination = {
  path: string
  label: string
  detail: string
  tone: string
  icon: LucideIcon
}

const primaryDestinations: MobileDestination[] = [
  { path: '/', label: 'Tribuna', detail: 'Comunitate', tone: 'var(--tone-green)', icon: Megaphone },
  { path: '/stiri', label: 'Știri', detail: 'Noutăți', tone: 'var(--tone-cyan)', icon: Newspaper },
  { path: '/meci', label: 'Meci', detail: 'Centru meci', tone: 'var(--tone-cyan)', icon: CalendarDays },
  { path: '/lot', label: 'Echipa', detail: 'Lot și staff', tone: 'var(--tone-amber)', icon: UsersRound },
]

const secondaryDestinations: MobileDestination[] = [
  { path: '/clasament', label: 'Sezonul', detail: 'Clasament, rezultate și calendar', tone: 'var(--tone-rose)', icon: Trophy },
  { path: '/mostenire', label: 'Moștenirea', detail: 'Istorie, Areni și cântări', tone: 'var(--tone-violet)', icon: Landmark },
]

export function MobileNavigation({
  activePath,
  economy = false,
  matchBadge,
  onNavigate,
  startupVisible = true,
}: MobileNavigationProps) {
  const navigate = useNavigate()
  const [moreOpen, setMoreOpen] = useState(false)
  const secondaryActive = secondaryDestinations.some((item) => item.path === activePath)

  useEffect(() => {
    setMoreOpen(false)
  }, [activePath])

  useEffect(() => {
    if (!moreOpen) return
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMoreOpen(false)
    }
    document.addEventListener('keydown', closeOnEscape)
    return () => document.removeEventListener('keydown', closeOnEscape)
  }, [moreOpen])

  const goTo = (path: string) => {
    setMoreOpen(false)
    onNavigate(path)
    void navigate(path)
  }

  return (
    <motion.div
      className={styles.mobileNavigationShell}
      initial={false}
      animate={{ opacity: startupVisible ? 1 : 0, y: startupVisible ? 0 : 54 }}
      transition={{ delay: startupVisible ? .12 : 0, duration: economy ? .34 : .62, ease: [0.16, 1, 0.3, 1] }}
      aria-hidden={!startupVisible}
    >
      <AnimatePresence initial={false} mode="sync">
        {moreOpen && (
          <motion.div
            className={styles.moreLayer}
            variants={panelLayerVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <motion.button
              className={styles.moreBackdrop}
              type="button"
              variants={panelBackdropVariants}
              onClick={() => setMoreOpen(false)}
              aria-label="Închide meniul"
            />
            <motion.section
              id="navigatie-mobila-secundara"
              className={styles.moreSheet}
              role="dialog"
              aria-label="Mai multe destinații"
              variants={panelFromBottomVariants}
            >
              <header>
                <span><small>Explorează Cetatea</small><strong>Mai multe destinații</strong></span>
                <button type="button" onClick={() => setMoreOpen(false)} aria-label="Închide"><X /></button>
              </header>
              <div>
                {secondaryDestinations.map((item) => {
                  const Icon = item.icon
                  const active = activePath === item.path
                  return (
                    <button
                      type="button"
                      key={item.path}
                      className={active ? styles.sheetItemActive : ''}
                      style={{ '--mobile-tone': item.tone } as CSSProperties}
                      onClick={() => goTo(item.path)}
                      aria-current={active ? 'page' : undefined}
                    >
                      <span><Icon aria-hidden="true" /></span>
                      <i><strong>{item.label}</strong><small>{item.detail}</small></i>
                      <em>{active ? 'DESCHIS' : 'VEZI'}</em>
                    </button>
                  )
                })}
              </div>
              <footer><i /><span>Navigația rămâne la îndemână în fiecare secțiune.</span></footer>
            </motion.section>
          </motion.div>
        )}
      </AnimatePresence>

      <nav className={styles.mobileNavigation} aria-label="Navigația principală mobilă">
        {primaryDestinations.slice(0, 2).map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={`${styles.navItem} ${activePath === item.path ? styles.navItemActive : ''}`}
              style={{ '--mobile-tone': item.tone } as CSSProperties}
              onClick={() => onNavigate(item.path)}
              aria-current={activePath === item.path ? 'page' : undefined}
            >
              <span><Icon strokeWidth={2} aria-hidden="true" /><i /></span>
              <small>{item.label}</small>
            </NavLink>
          )
        })}

        <NavLink
          to="/meci"
          className={`${styles.navItem} ${styles.matchItem} ${activePath === '/meci' ? styles.navItemActive : ''}`}
          style={{ '--mobile-tone': 'var(--tone-cyan)' } as CSSProperties}
          onClick={() => onNavigate('/meci')}
          aria-current={activePath === '/meci' ? 'page' : undefined}
          aria-label={`Meci: ${nextMatch.home.name} cu ${nextMatch.away.name}, ${matchBadge}`}
        >
          <span><CalendarDays strokeWidth={2} aria-hidden="true" /><b>{matchBadge}</b><i /></span>
          <small>Meci</small>
        </NavLink>

        {primaryDestinations.slice(3).map((item) => {
          const Icon = item.icon
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={`${styles.navItem} ${activePath === item.path ? styles.navItemActive : ''}`}
              style={{ '--mobile-tone': item.tone } as CSSProperties}
              onClick={() => onNavigate(item.path)}
              aria-current={activePath === item.path ? 'page' : undefined}
            >
              <span><Icon strokeWidth={2} aria-hidden="true" /><i /></span>
              <small>{item.label}</small>
            </NavLink>
          )
        })}

        <button
          type="button"
          className={`${styles.navItem} ${secondaryActive || moreOpen ? styles.navItemActive : ''}`}
          style={{ '--mobile-tone': 'var(--tone-violet)' } as CSSProperties}
          aria-expanded={moreOpen}
          aria-controls="navigatie-mobila-secundara"
          onClick={() => setMoreOpen((current) => !current)}
        >
          <span><MoreHorizontal strokeWidth={2.1} aria-hidden="true" /><i /></span>
          <small>Mai mult</small>
        </button>
      </nav>
    </motion.div>
  )
}
