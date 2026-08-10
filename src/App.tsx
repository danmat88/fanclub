import { AnimatePresence, motion } from 'motion/react'
import {
  BellRing,
  CalendarDays,
  Clock3,
  MapPin,
  PanelLeftClose,
  PanelLeftOpen,
  Swords,
  Trophy,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styles from './App.module.css'
import fanEmblem from './assets/brand/cetatea-fan-emblem.webp'
import arenaBackground from './assets/brand/loading-cetatea-arena.webp'
import { LoadingScreen } from './components/LoadingScreen'
import { Navigation } from './components/Navigation'
import { navigationItems } from './components/navigationItems'
import {
  performanceModeLabels,
  performanceModeOrder,
} from './contexts/performance-context'
import { themeLabels, type Theme } from './contexts/theme-context'
import { usePerformance } from './contexts/usePerformance'
import { useSound } from './contexts/useSound'
import { useTheme } from './contexts/useTheme'
import { latestResult, nextMatch } from './data/clubData'
import { useMatchCountdown } from './hooks/useMatchCountdown'
import { firebaseConfigured } from './lib/firebaseConfig'
import {
  CommunityView,
  FanIdView,
  LeagueTableView,
  LiveCenterView,
  NextMatchView,
  SquadView,
} from './views/Views'

const viewMap: Record<string, React.ComponentType> = {
  '/': NextMatchView,
  '/meci-direct': LiveCenterView,
  '/tribuna': CommunityView,
  '/lot': SquadView,
  '/clasament': LeagueTableView,
  '/carnet': FanIdView,
}

const routeOrder = ['/', ...navigationItems.map((item) => item.path)]
const themeOrder: Theme[] = ['nocturna', 'zi-de-meci', 'asediu', 'bucovina']

const appReveal = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.32, staggerChildren: 0.1, delayChildren: 0.06 },
  },
}

const railReveal = {
  hidden: { opacity: 0, x: -46 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.68,
      ease: [0.16, 1, 0.3, 1] as const,
      staggerChildren: 0.11,
      delayChildren: 0.08,
    },
  },
}

const workspaceReveal = {
  hidden: { opacity: 0, x: 52 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: 0.72,
      ease: [0.16, 1, 0.3, 1] as const,
      staggerChildren: 0.13,
      delayChildren: 0.12,
    },
  },
}

const interfaceItemReveal = {
  hidden: { opacity: 0, y: 22, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.58, ease: [0.16, 1, 0.3, 1] as const },
  },
}

const interfaceItemEconomyReveal = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.22, ease: 'easeOut' as const },
  },
}

const pageVariants = {
  enter: (direction: number) => ({
    opacity: 0,
    x: direction >= 0 ? 90 : -90,
    clipPath:
      direction >= 0
        ? 'inset(0 0 0 20% round 18px)'
        : 'inset(0 20% 0 0 round 18px)',
  }),
  center: {
    opacity: 1,
    x: 0,
    clipPath: 'inset(0 0 0 0 round 0px)',
  },
  exit: (direction: number) => ({
    opacity: 0,
    x: direction >= 0 ? -72 : 72,
    clipPath:
      direction >= 0
        ? 'inset(0 18% 0 0 round 18px)'
        : 'inset(0 0 0 18% round 18px)',
  }),
}

const pageEconomyVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
}

function AppShell() {
  const location = useLocation()
  const navigate = useNavigate()
  const countdown = useMatchCountdown()
  const { theme, toggleTheme } = useTheme()
  const { mode: performanceMode, resolvedMode, isEconomy, cycleMode } = usePerformance()
  const { isMuted, play, toggleMute } = useSound()
  const currentIndex = Math.max(0, routeOrder.indexOf(location.pathname))
  const [direction, setDirection] = useState(1)
  const [lastIndex, setLastIndex] = useState(currentIndex)
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement))
  const [matchAlert, setMatchAlert] = useState(
    () => localStorage.getItem('cetatea-match-alert') === 'active',
  )
  const [isRailCollapsed, setIsRailCollapsed] = useState(
    () => localStorage.getItem('cetatea-rail') === 'restrans',
  )
  const ActiveView = viewMap[location.pathname] ?? NextMatchView
  const nextTheme = themeOrder[(themeOrder.indexOf(theme) + 1) % themeOrder.length]
  const nextPerformanceMode =
    performanceModeOrder[
      (performanceModeOrder.indexOf(performanceMode) + 1) % performanceModeOrder.length
    ]
  const interfaceReveal = isEconomy ? interfaceItemEconomyReveal : interfaceItemReveal

  useEffect(() => {
    const syncFullscreen = () => setIsFullscreen(Boolean(document.fullscreenElement))
    document.addEventListener('fullscreenchange', syncFullscreen)
    return () => document.removeEventListener('fullscreenchange', syncFullscreen)
  }, [])

  const handleNavigate = (path: string) => {
    const nextIndex = Math.max(0, routeOrder.indexOf(path))
    setDirection(nextIndex >= lastIndex ? 1 : -1)
    setLastIndex(nextIndex)
    play('navigate')
  }

  const goToMatch = () => {
    handleNavigate('/')
    void navigate('/')
  }

  const handleTheme = () => {
    toggleTheme()
    play('toggle')
  }

  const handlePerformance = () => {
    cycleMode()
    play('toggle')
  }

  const toggleFullscreen = async () => {
    try {
      if (document.fullscreenElement) {
        await document.exitFullscreen()
      } else {
        await document.documentElement.requestFullscreen()
      }
      play('toggle')
    } catch {
      // Unele browsere blochează ecranul complet dacă fereastra nu este activă.
    }
  }

  const toggleMatchAlert = () => {
    setMatchAlert((current) => {
      const next = !current
      localStorage.setItem('cetatea-match-alert', next ? 'active' : 'inactive')
      return next
    })
    play('success')
  }

  const toggleRail = () => {
    setIsRailCollapsed((current) => {
      const next = !current
      localStorage.setItem('cetatea-rail', next ? 'restrans' : 'extins')
      return next
    })
    play('toggle')
  }

  return (
    <motion.div
      className={`${styles.app} ${isRailCollapsed ? styles.appRailCollapsed : ''}`}
      variants={appReveal}
      initial="hidden"
      animate="visible"
    >
      <motion.div className={styles.ambient} variants={interfaceReveal} aria-hidden="true">
        <span className={styles.orbitOne} />
        <span className={styles.orbitTwo} />
        <span className={styles.axis} />
      </motion.div>

      <motion.aside
        className={`${styles.rail} ${isRailCollapsed ? styles.railCollapsed : ''}`}
        variants={railReveal}
        aria-label="Panoul clubului suporterilor"
      >
        <motion.div className={styles.brand} variants={interfaceReveal}>
          <span className={styles.brandMark}>
            <img src={fanEmblem} alt="" />
          </span>
          <span className={styles.brandCopy}>
            <small>Clubul suporterilor</small>
            <strong>Cetatea 1932</strong>
            <em>Suceava · Stadionul Areni</em>
          </span>
          <button
            type="button"
            className={styles.railToggle}
            onClick={toggleRail}
            aria-controls="navigatie-principala"
            aria-expanded={!isRailCollapsed}
            aria-label={isRailCollapsed ? 'Extinde panoul lateral' : 'Restrânge panoul lateral'}
            title={isRailCollapsed ? 'Extinde panoul' : 'Restrânge panoul'}
          >
            {isRailCollapsed
              ? <PanelLeftOpen strokeWidth={1.9} aria-hidden="true" />
              : <PanelLeftClose strokeWidth={1.9} aria-hidden="true" />}
          </button>
        </motion.div>

        <motion.section className={`${styles.railMatch} ${location.pathname === '/' ? styles.railMatchActive : ''}`} variants={interfaceReveal}>
          <button className={styles.railMatchOpen} onClick={goToMatch} aria-current={location.pathname === '/' ? 'page' : undefined}>
            <span className={styles.collapsedMatch} aria-hidden={!isRailCollapsed}>
              <CalendarDays strokeWidth={1.8} />
              <span><strong>{countdown.days}</strong><small>zile</small></span>
            </span>
            <span className={styles.matchEyebrow}>
              <strong><CalendarDays strokeWidth={1.9} aria-hidden="true" /> Următorul meci</strong>
              <em>{nextMatch.round}</em>
            </span>

            <span className={styles.railTeams}>
              <span>
                <img src={nextMatch.home.badge} alt="Sigla Cetatea Suceava" />
                <span><b>{nextMatch.home.name}</b><small>{nextMatch.home.city}</small></span>
              </span>
              <span className={styles.versus} aria-label="contra">
                <Swords strokeWidth={1.8} aria-hidden="true" />
                <small>VS</small>
              </span>
              <span>
                <img src={nextMatch.away.badge} alt="Sigla CSM Satu Mare" />
                <span><b>{nextMatch.away.name}</b><small>{nextMatch.away.city}</small></span>
              </span>
            </span>

            <span className={styles.railDate}>
              <span className={styles.matchDateMain}>
                <CalendarDays strokeWidth={1.8} aria-hidden="true" />
                <b>{nextMatch.dateLabel}</b>
              </span>
              <span className={styles.matchMeta}>
                <span><Clock3 strokeWidth={2} aria-hidden="true" /> {nextMatch.timeLabel}</span>
                <span><MapPin strokeWidth={2} aria-hidden="true" /> {nextMatch.venue}</span>
              </span>
            </span>

            <span className={styles.railCountdown} aria-label="Timp rămas până la meci">
              <span><b>{countdown.days}</b><small>zile</small></span>
              <i>:</i>
              <span><b>{countdown.hours}</b><small>ore</small></span>
              <i>:</i>
              <span><b>{countdown.minutes}</b><small>min.</small></span>
              <i>:</i>
              <span><b>{countdown.seconds}</b><small>sec.</small></span>
            </span>

            <span className={styles.lastResult}>
              <small><Trophy strokeWidth={1.8} aria-hidden="true" /> Ultimul rezultat</small>
              <b>{latestResult.home} <strong>{latestResult.score}</strong> Cetatea</b>
            </span>
          </button>

          <button
            className={`${styles.matchAlert} ${matchAlert ? styles.alertActive : ''}`}
            onClick={toggleMatchAlert}
            aria-pressed={matchAlert}
          >
            <span><BellRing strokeWidth={1.9} aria-hidden="true" /> {matchAlert ? 'Alerta este activă' : 'Activează alerta'}</span>
            <b>{matchAlert ? 'ACTIVĂ' : 'OPRITĂ'}</b>
          </button>
        </motion.section>

        <motion.div className={styles.navigationSlot} variants={interfaceReveal}>
          <Navigation
            activePath={location.pathname}
            collapsed={isRailCollapsed}
            onNavigate={handleNavigate}
          />
        </motion.div>

        <motion.div className={styles.heritage} variants={interfaceReveal}>
          <span className={styles.heritageLine}>Din oraș. Pentru oraș.</span>
          <strong className={styles.heritageMotto}>Alb-albastru / din 1932</strong>
          <strong className={styles.heritageCompact} aria-hidden={!isRailCollapsed}>1932</strong>
        </motion.div>
      </motion.aside>

      <motion.main className={styles.workspace} variants={workspaceReveal}>
        <motion.header className={styles.topbar} variants={interfaceReveal}>
          <div className={styles.systemStatus}>
            <span><i /> Sistem de meci</span>
            <small>{firebaseConfigured ? 'Date conectate' : 'Mod local pregătit'}</small>
          </div>

          <div className={styles.commandSignature} aria-hidden="true">
            <span>CSM Cetatea 1932</span>
            <i />
            <strong>Areni / Zi de meci</strong>
          </div>

          <div className={styles.controls}>
            <button
              className={styles.control}
              onClick={handleTheme}
              aria-label={`Schimbă tema. Tema curentă: ${themeLabels[theme]}`}
              title={`Următoarea temă: ${themeLabels[nextTheme]}`}
            >
              <span className={`${styles.themeIcon} ${theme === 'zi-de-meci' ? styles.light : ''}`} />
              <span>{themeLabels[theme]}</span>
            </button>
            <button
              className={styles.control}
              onClick={toggleMute}
              aria-pressed={isMuted}
              aria-label={isMuted ? 'Activează sunetele' : 'Dezactivează sunetele'}
              title={isMuted ? 'Activează sunetele' : 'Oprește sunetele'}
            >
              <span className={`${styles.soundIcon} ${isMuted ? styles.muted : ''}`}>
                <i /><i /><i />
              </span>
              <span>{isMuted ? 'Sunet oprit' : 'Sunet activ'}</span>
            </button>
            <button
              className={styles.control}
              onClick={handlePerformance}
              aria-label={`Mod performanță: ${performanceModeLabels[performanceMode]}. Efecte active: ${performanceModeLabels[resolvedMode]}. Următorul mod: ${performanceModeLabels[nextPerformanceMode]}`}
              title={`Performanță: ${performanceModeLabels[performanceMode]} · efecte ${performanceModeLabels[resolvedMode].toLowerCase()}`}
            >
              <span
                className={`${styles.performanceIcon} ${
                  resolvedMode === 'economie'
                    ? styles.performanceEconomy
                    : styles.performanceComplete
                } ${performanceMode === 'automat' ? styles.performanceAuto : ''}`}
                aria-hidden="true"
              >
                <i />
              </span>
              <span aria-live="polite">{performanceModeLabels[performanceMode]}</span>
            </button>
            <button
              className={styles.control}
              onClick={() => void toggleFullscreen()}
              aria-label={isFullscreen ? 'Ieși din ecran complet' : 'Activează ecranul complet'}
              title={isFullscreen ? 'Ieși din ecran complet' : 'Ecran complet'}
            >
              <span className={`${styles.fullscreenIcon} ${isFullscreen ? styles.fullscreenActive : ''}`}>
                <i /><i /><i /><i />
              </span>
              <span>{isFullscreen ? 'Ecran complet' : 'Extinde'}</span>
            </button>
            <button
              className={`${styles.control} ${styles.profileControl}`}
              aria-label="Deschide carnetul suporterului"
              onClick={() => {
                handleNavigate('/carnet')
                void navigate('/carnet')
              }}
            >
              <b>CS</b>
              <span>Carnet</span>
            </button>
          </div>
        </motion.header>

        <motion.div className={styles.stage} variants={interfaceReveal}>
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              className={styles.page}
              key={location.pathname}
              custom={direction}
              variants={isEconomy ? pageEconomyVariants : pageVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={
                isEconomy
                  ? { duration: 0.2, ease: 'easeOut' }
                  : { duration: 0.56, ease: [0.76, 0, 0.24, 1] }
              }
            >
              <ActiveView />
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div className={styles.viewportIndex} variants={interfaceReveal}>0{currentIndex + 1} / 06</motion.div>
      </motion.main>
    </motion.div>
  )
}

export default function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSceneReady, setIsSceneReady] = useState(false)
  const finishLoading = useCallback(() => setIsLoading(false), [])
  const content = useMemo(
    () =>
      isLoading ? (
        <LoadingScreen key="loader" isSceneReady={isSceneReady} onComplete={finishLoading} />
      ) : (
        <AppShell key="app" />
      ),
    [finishLoading, isLoading, isSceneReady],
  )

  return (
    <div className={styles.applicationRoot}>
      <div className={styles.persistentScene} aria-hidden="true">
        <img
          src={arenaBackground}
          alt=""
          onLoad={() => setIsSceneReady(true)}
          onError={() => setIsSceneReady(true)}
        />
        <span />
      </div>
      <AnimatePresence mode="wait">{content}</AnimatePresence>
    </div>
  )
}
