import { AnimatePresence, motion } from 'motion/react'
import {
  Activity,
  BellRing,
  CalendarDays,
  Gauge,
  Landmark,
  Maximize2,
  MapPin,
  Megaphone,
  MessageCircle,
  Minimize2,
  Newspaper,
  Palette,
  PanelLeftClose,
  PanelLeftOpen,
  Swords,
  Trophy,
  UsersRound,
  Volume2,
  VolumeX,
  Wifi,
  type LucideIcon,
} from 'lucide-react'
import { useCallback, useEffect, useMemo, useState, type CSSProperties } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import styles from './App.module.css'
import fanEmblem from './assets/brand/cetatea-fan-emblem.webp'
import arenaBackground from './assets/brand/loading-cetatea-arena.webp'
import { LoadingScreen } from './components/LoadingScreen'
import { Navigation } from './components/Navigation'
import { ProfilePanel } from './components/ProfilePanel'
import { ThemePanel } from './components/ThemePanel'
import { navigationItems } from './components/navigationItems'
import {
  performanceModeLabels,
  performanceModeOrder,
} from './contexts/performance-context'
import { themeLabels, type Theme } from './contexts/theme-context'
import { usePerformance } from './contexts/usePerformance'
import { useSound } from './contexts/useSound'
import { useTheme } from './contexts/useTheme'
import { nextMatch } from './data/clubData'
import { useMatchCountdown } from './hooks/useMatchCountdown'
import { firebaseConfigured } from './lib/firebaseConfig'
import {
  CommunityView,
  HeritageView,
  LeagueTableView,
  MatchBroadcast,
  NextMatchView,
  NewsView,
  SquadView,
} from './views/Views'

const viewMap: Record<string, React.ComponentType> = {
  '/': CommunityView,
  '/meci': NextMatchView,
  '/meci-direct': NextMatchView,
  '/tribuna': CommunityView,
  '/lot': SquadView,
  '/clasament': LeagueTableView,
  '/stiri': NewsView,
  '/mostenire': HeritageView,
}

const routeOrder = [...navigationItems.map((item) => item.path), '/meci']
type HeaderView = {
  label: string
  eyebrow: string
  detail: string
  tone: string
  icon: LucideIcon
}

const headerViews: Record<string, HeaderView> = {
  '/': {
    label: 'Tribuna',
    eyebrow: 'Comunitatea alb-albastră',
    detail: 'Zidul Cetății · activ acum',
    tone: 'var(--tone-green)',
    icon: Megaphone,
  },
  '/meci': {
    label: 'Următorul meci',
    eyebrow: 'Centrul confruntării',
    detail: `${nextMatch.round} · ${nextMatch.timeLabel}`,
    tone: 'var(--tone-cyan)',
    icon: Swords,
  },
  '/tribuna': {
    label: 'Tribuna',
    eyebrow: 'Comunitatea alb-albastră',
    detail: 'Zidul Cetății · activ acum',
    tone: 'var(--tone-green)',
    icon: Megaphone,
  },
  '/meci-direct': {
    label: 'Următorul meci',
    eyebrow: 'Centrul confruntării',
    detail: `${nextMatch.round} · ${nextMatch.timeLabel}`,
    tone: 'var(--tone-cyan)',
    icon: Swords,
  },
  '/lot': {
    label: 'Echipa',
    eyebrow: 'Lotul Cetății',
    detail: '26 jucători · staff tehnic',
    tone: 'var(--tone-amber)',
    icon: UsersRound,
  },
  '/clasament': {
    label: 'Sezonul',
    eyebrow: 'Liga a II-a',
    detail: 'Clasament · formă · calendar',
    tone: 'var(--tone-rose)',
    icon: Trophy,
  },
  '/stiri': {
    label: 'Știri',
    eyebrow: 'Jurnalul Cetății',
    detail: 'Noutăți · reacții · conversații',
    tone: 'var(--tone-cyan)',
    icon: Newspaper,
  },
  '/mostenire': {
    label: 'Moștenirea',
    eyebrow: 'Identitatea Cetății',
    detail: 'Istorie · Areni · cântări',
    tone: 'var(--tone-violet)',
    icon: Landmark,
  },
}

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
  const { theme, setTheme } = useTheme()
  const { mode: performanceMode, resolvedMode, isEconomy, cycleMode } = usePerformance()
  const { isMuted, play, toggleMute } = useSound()
  const canonicalPath = location.pathname === '/tribuna'
    ? '/'
    : location.pathname === '/meci-direct'
      ? '/meci'
      : location.pathname
  const isMatchRoute = canonicalPath === '/meci'
  const currentIndex = Math.max(0, routeOrder.indexOf(canonicalPath))
  const [direction, setDirection] = useState(1)
  const [lastIndex, setLastIndex] = useState(currentIndex)
  const [isFullscreen, setIsFullscreen] = useState(Boolean(document.fullscreenElement))
  const [matchAlert, setMatchAlert] = useState(
    () => localStorage.getItem('cetatea-match-alert') === 'active',
  )
  const [isRailCollapsed, setIsRailCollapsed] = useState(
    () => localStorage.getItem('cetatea-rail') === 'restrans',
  )
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const [isThemePanelOpen, setIsThemePanelOpen] = useState(false)
  const [broadcastAnchor, setBroadcastAnchor] = useState<HTMLDivElement | null>(null)
  const [broadcastActive, setBroadcastActive] = useState(false)
  const [broadcastStarted, setBroadcastStarted] = useState(false)
  const [broadcastDismissed, setBroadcastDismissed] = useState(false)
  const [broadcastRequestToken, setBroadcastRequestToken] = useState(0)
  const ActiveView = viewMap[location.pathname] ?? CommunityView
  const currentHeader = headerViews[canonicalPath] ?? headerViews['/']
  const HeaderIcon = currentHeader.icon
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

  useEffect(() => {
    if (location.pathname !== '/carnet') return
    setIsProfileOpen(true)
    void navigate('/', { replace: true })
  }, [location.pathname, navigate])

  const closeProfilePanel = useCallback(() => setIsProfileOpen(false), [])
  const closeThemePanel = useCallback(() => setIsThemePanelOpen(false), [])

  const handleBroadcastActiveChange = useCallback((active: boolean) => {
    setBroadcastActive(active)
    if (active) {
      setBroadcastStarted(true)
      setBroadcastDismissed(false)
    }
  }, [])

  const handleNavigate = (path: string) => {
    const nextIndex = Math.max(0, routeOrder.indexOf(path))
    setDirection(nextIndex >= lastIndex ? 1 : -1)
    setLastIndex(nextIndex)
    setIsProfileOpen(false)
    play('navigate')
  }

  const goToMatch = () => {
    handleNavigate('/meci')
    void navigate('/meci')
  }

  const goToCommunity = () => {
    handleNavigate('/')
    void navigate('/')
  }

  const returnToBroadcast = () => {
    setBroadcastDismissed(false)
    setBroadcastRequestToken((current) => current + 1)
    goToMatch()
  }

  const closeBroadcast = () => {
    setBroadcastDismissed(true)
    play('toggle')
  }

  const openThemePanel = () => {
    setIsThemePanelOpen(true)
    setIsProfileOpen(false)
    play('toggle')
  }

  const selectTheme = (nextTheme: Theme) => {
    setTheme(nextTheme)
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

        <motion.section className={`${styles.railMatch} ${isMatchRoute ? styles.railMatchActive : ''}`} variants={interfaceReveal}>
          <button className={styles.railMatchOpen} onClick={goToMatch} aria-current={isMatchRoute ? 'page' : undefined}>
            <span className={styles.collapsedMatch} aria-hidden={!isRailCollapsed}>
              <CalendarDays strokeWidth={1.8} />
              <span><strong>{countdown.days}</strong><small>zile</small></span>
            </span>
            <span className={styles.matchEyebrow}>
              <strong><CalendarDays strokeWidth={1.9} aria-hidden="true" /> Următorul meci</strong>
              <em>{nextMatch.round}</em>
            </span>

            <span className={styles.slimFixture}>
              <span className={styles.slimTeam}>
                <img src={nextMatch.home.badge} alt="Sigla Cetatea Suceava" />
                <span><b>{nextMatch.home.name}</b><small>{nextMatch.home.city}</small></span>
              </span>
              <span className={styles.kickoffNode} aria-label={`${nextMatch.compactDateLabel}, ora ${nextMatch.timeLabel}`}>
                <small>{nextMatch.compactDateLabel}</small>
                <strong>{nextMatch.timeLabel}</strong>
                <em>VS</em>
              </span>
              <span className={`${styles.slimTeam} ${styles.slimTeamAway}`}>
                <img src={nextMatch.away.badge} alt="Sigla CSM Satu Mare" />
                <span><b>{nextMatch.away.name}</b><small>{nextMatch.away.city}</small></span>
              </span>
            </span>

            <span className={styles.matchQuickInfo}>
              <span className={styles.matchVenue} title={nextMatch.venue}>
                <MapPin strokeWidth={2} aria-hidden="true" />
                <span>{nextMatch.venue}</span>
              </span>
              <span className={styles.railCountdown} aria-label="Timp rămas până la meci">
                <span><b>{countdown.days}</b><small>z</small></span>
                <i>:</i>
                <span><b>{countdown.hours}</b><small>h</small></span>
                <i>:</i>
                <span><b>{countdown.minutes}</b><small>m</small></span>
                <i>:</i>
                <span><b>{countdown.seconds}</b><small>s</small></span>
              </span>
            </span>
          </button>

          <button
            className={`${styles.matchAlert} ${matchAlert ? styles.alertActive : ''}`}
            onClick={toggleMatchAlert}
            aria-pressed={matchAlert}
          >
            <span><BellRing strokeWidth={1.9} aria-hidden="true" /> {matchAlert ? 'Alertă activă' : 'Anunță-mă'}</span>
            <b>{matchAlert ? 'PORNITĂ' : 'OPRITĂ'}</b>
          </button>
        </motion.section>

        <motion.div className={styles.navigationSlot} variants={interfaceReveal}>
          <Navigation
            activePath={canonicalPath}
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
        <motion.header
          className={styles.topbar}
          variants={interfaceReveal}
          style={{ '--header-tone': currentHeader.tone } as CSSProperties}
        >
          <div className={styles.headerContext}>
            <span className={styles.headerSequence} aria-hidden="true">0{currentIndex + 1}</span>
            <span className={styles.headerRouteIcon} aria-hidden="true"><HeaderIcon strokeWidth={1.8} /></span>
            <motion.span
              className={styles.headerRouteCopy}
              key={location.pathname}
              initial={isEconomy ? { opacity: 0 } : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: isEconomy ? .16 : .32, ease: [0.16, 1, 0.3, 1] }}
            >
              <small><i /> {currentHeader.eyebrow}</small>
              <strong>{currentHeader.label}</strong>
            </motion.span>
            <span className={styles.headerConnection} title={firebaseConfigured ? 'Firebase conectat' : 'Firebase pregătit pentru configurare'}>
              <Wifi strokeWidth={1.8} aria-hidden="true" />
              <span><b>{firebaseConfigured ? 'Conectat' : 'Mod local'}</b><small>{currentHeader.detail}</small></span>
            </span>
          </div>

          <button type="button" className={styles.communityPulse} onClick={goToCommunity} aria-label="Deschide Tribuna Cetății: 12 reacții noi în comunitate">
            <span className={styles.pulseMark} aria-hidden="true"><Activity strokeWidth={1.9} /></span>
            <span className={styles.pulseCopy}><small>Tribuna Cetății</small><strong>Zidul este activ</strong></span>
            <span className={styles.pulseWave} aria-hidden="true"><i /><i /><i /><i /><i /><i /></span>
            <span className={styles.pulseUpdates}><MessageCircle strokeWidth={1.8} aria-hidden="true" /><b>12</b><small>noi</small></span>
          </button>

          <div className={styles.controls} role="group" aria-label="Comenzile aplicației">
            <button
              className={`${styles.control} ${isThemePanelOpen ? styles.themeControlActive : ''}`}
              onClick={openThemePanel}
              aria-label={`Deschide galeria de teme. Tema curentă: ${themeLabels[theme]}`}
              aria-expanded={isThemePanelOpen}
              aria-controls="theme-panel"
              title="Alege tema aplicației"
            >
              <Palette className={styles.controlGlyph} strokeWidth={1.8} aria-hidden="true" />
              <span className={styles.controlLabel}>{themeLabels[theme]}</span>
              <i className={styles.controlNode} aria-hidden="true" />
            </button>
            <button
              className={styles.control}
              onClick={toggleMute}
              aria-pressed={isMuted}
              aria-label={isMuted ? 'Activează sunetele' : 'Dezactivează sunetele'}
              title={isMuted ? 'Activează sunetele' : 'Oprește sunetele'}
            >
              {isMuted
                ? <VolumeX className={styles.controlGlyph} strokeWidth={1.8} aria-hidden="true" />
                : <Volume2 className={styles.controlGlyph} strokeWidth={1.8} aria-hidden="true" />}
              <span className={styles.controlLabel}>{isMuted ? 'Sunet oprit' : 'Sunet activ'}</span>
              <i className={styles.controlNode} aria-hidden="true" />
            </button>
            <button
              className={styles.control}
              onClick={handlePerformance}
              aria-label={`Mod performanță: ${performanceModeLabels[performanceMode]}. Efecte active: ${performanceModeLabels[resolvedMode]}. Următorul mod: ${performanceModeLabels[nextPerformanceMode]}`}
              title={`Performanță: ${performanceModeLabels[performanceMode]} · efecte ${performanceModeLabels[resolvedMode].toLowerCase()}`}
            >
              <Gauge className={styles.controlGlyph} strokeWidth={1.8} aria-hidden="true" />
              <span className={styles.controlLabel} aria-live="polite">{performanceModeLabels[performanceMode]}</span>
              <i className={styles.controlNode} aria-hidden="true" />
            </button>
            <button
              className={styles.control}
              onClick={() => void toggleFullscreen()}
              aria-label={isFullscreen ? 'Ieși din ecran complet' : 'Activează ecranul complet'}
              title={isFullscreen ? 'Ieși din ecran complet' : 'Ecran complet'}
            >
              {isFullscreen
                ? <Minimize2 className={styles.controlGlyph} strokeWidth={1.8} aria-hidden="true" />
                : <Maximize2 className={styles.controlGlyph} strokeWidth={1.8} aria-hidden="true" />}
              <span className={styles.controlLabel}>{isFullscreen ? 'Micșorează' : 'Extinde'}</span>
              <i className={styles.controlNode} aria-hidden="true" />
            </button>
            <button
              className={`${styles.control} ${styles.profileControl} ${isProfileOpen ? styles.profileControlActive : ''}`}
              aria-label={isProfileOpen ? 'Închide profilul și setările' : 'Deschide profilul și setările'}
              aria-expanded={isProfileOpen}
              aria-controls="profile-panel"
              onClick={() => {
                setIsThemePanelOpen(false)
                setIsProfileOpen((current) => !current)
                play('toggle')
              }}
            >
              <b>CS</b>
              <span className={styles.controlLabel}>Profil</span>
              <i className={styles.controlNode} aria-hidden="true" />
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
              {isMatchRoute ? (
                <NextMatchView
                  broadcastAnchorRef={setBroadcastAnchor}
                  broadcastRequestToken={broadcastRequestToken}
                  onBroadcastActiveChange={handleBroadcastActiveChange}
                />
              ) : (
                <ActiveView />
              )}
            </motion.div>
          </AnimatePresence>
        </motion.div>

        <motion.div className={styles.viewportIndex} variants={interfaceReveal}>
          {String(currentIndex + 1).padStart(2, '0')} / {String(routeOrder.length).padStart(2, '0')}
        </motion.div>
      </motion.main>

      {broadcastStarted && !broadcastDismissed && (
        <MatchBroadcast
          anchor={broadcastAnchor}
          docked={isMatchRoute && broadcastActive}
          onClose={closeBroadcast}
          onReturnToMatch={returnToBroadcast}
        />
      )}

      <ThemePanel
        open={isThemePanelOpen}
        activeTheme={theme}
        onClose={closeThemePanel}
        onSelect={selectTheme}
      />

      <ProfilePanel
        open={isProfileOpen}
        connected={firebaseConfigured}
        isMuted={isMuted}
        performanceLabel={performanceModeLabels[performanceMode]}
        themeLabel={themeLabels[theme]}
        onClose={closeProfilePanel}
        onCyclePerformance={handlePerformance}
        onCycleTheme={openThemePanel}
        onToggleSound={toggleMute}
      />
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
