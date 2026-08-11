import { AnimatePresence, motion, type Variants } from 'motion/react'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  BarChart3,
  Bell,
  BookOpen,
  Bookmark,
  CalendarPlus,
  CalendarDays,
  Castle,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock3,
  Crosshair,
  Eye,
  ExternalLink,
  Flag,
  Flame,
  Gamepad2,
  GitCompareArrows,
  GripHorizontal,
  Heart,
  Headphones,
  History,
  ImagePlus,
  LayoutDashboard,
  MapPin,
  Maximize2,
  Medal,
  MessageCircle,
  Mic2,
  Minus,
  Newspaper,
  Pause,
  Play,
  Plus,
  Search,
  Send,
  Share2,
  Shield,
  Sparkles,
  Star,
  Swords,
  Quote,
  ThumbsUp,
  TicketCheck,
  Trophy,
  UserRoundCog,
  UsersRound,
  Video,
  Volume2,
  VolumeX,
  Wifi,
  X,
  Zap,
} from 'lucide-react'
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type FormEvent,
  type PointerEvent as ReactPointerEvent,
  type RefCallback,
} from 'react'
import fanEmblem from '../assets/brand/cetatea-fan-emblem.webp'
import arenaBackground from '../assets/brand/loading-cetatea-arena.webp'
import { AppScrollArea } from '../components/AppScrollArea'
import { useSound } from '../contexts/useSound'
import { club, latestResult, nextMatch, squad, standings, technicalStaff, upcomingFixtures, type FormResult, type PlayerPosition } from '../data/clubData'
import { useMatchCountdown } from '../hooks/useMatchCountdown'
import styles from './Views.module.css'

const reveal: Variants = {
  hidden: { opacity: 0, y: 18 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      delay,
      duration: 0.5,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  }),
}

function ViewIntro({
  code,
  label,
  title,
  accent,
}: {
  code: string
  label: string
  title: string
  accent: string
}) {
  return (
    <motion.header
      className={styles.viewIntro}
      variants={reveal}
      initial="hidden"
      animate="visible"
    >
      <div className={styles.viewCode}>
        <span>{code}</span>
        <i />
        {label}
      </div>
      <h1>
        {title} <em>{accent}</em>
      </h1>
    </motion.header>
  )
}

function HudLabel({ children, value }: { children: string; value?: string }) {
  return (
    <div className={styles.hudLabel}>
      <span>{children}</span>
      {value && <strong>{value}</strong>}
    </div>
  )
}

type WallMessage = {
  id: number
  author: string
  text: string
  time: string
}

const initialMessages: WallMessage[] = [
  { id: 1, author: 'Mihai / Peluza Nord', text: 'Areni trebuie să se audă în tot orașul.', time: '10:42' },
  { id: 2, author: 'Ioana / Centru', text: 'Vin cu încă patru oameni. Toți în alb-albastru.', time: '10:47' },
  { id: 3, author: 'Radu / Burdujeni', text: 'Cetatea nu cade. Ne vedem la stadion!', time: '10:51' },
]

type MatchCenterMode = 'centru' | 'transmisiune' | 'program'

const matchCenterModes = [
  { id: 'centru' as const, label: 'Centrul meciului', meta: 'Scor și predicții', icon: TicketCheck },
  { id: 'transmisiune' as const, label: 'Transmisiune', meta: 'Video · audio · text', icon: Video },
  { id: 'program' as const, label: 'Planul zilei', meta: 'Repere și acces', icon: CalendarDays },
]

const matchDayMoments = [
  { time: '09:30', label: 'Sosire recomandată', meta: 'Intră devreme în atmosfera Areniului', official: false },
  { time: '10:20', label: 'Încălzirea echipelor', meta: 'Moment orientativ înaintea partidei', official: false },
  { time: '10:50', label: 'Echipele intră pe teren', meta: 'Ultimele minute înainte de start', official: false },
  { time: nextMatch.timeLabel, label: 'Fluierul de start', meta: `${nextMatch.round} · ora oficială`, official: true },
]

const configuredMatchStreamUrl = import.meta.env.VITE_MATCH_STREAM_URL?.trim() as string | undefined
const demoYouTubeVideoId = '6jqWAYfKroA'
const demoYouTubeStreamUrl = `https://www.youtube-nocookie.com/embed/${demoYouTubeVideoId}?autoplay=1&mute=1&controls=0&disablekb=1&fs=0&iv_load_policy=3&loop=1&playlist=${demoYouTubeVideoId}&playsinline=1&rel=0&hl=ro`
const matchStreamUrl = configuredMatchStreamUrl || demoYouTubeStreamUrl
const isDemoStream = !configuredMatchStreamUrl

type YouTubePlayerController = {
  destroy: () => void
  getCurrentTime: () => number
  getDuration: () => number
  getPlayerState: () => number
  isMuted: () => boolean
  mute: () => void
  pauseVideo: () => void
  playVideo: () => void
  seekTo: (seconds: number, allowSeekAhead: boolean) => void
  unMute: () => void
}

type YouTubePlayerEvent = { target: YouTubePlayerController }
type YouTubeStateEvent = YouTubePlayerEvent & { data: number }

type YouTubeApi = {
  Player: new (
    element: HTMLIFrameElement,
    options: {
      events: {
        onReady: (event: YouTubePlayerEvent) => void
        onStateChange: (event: YouTubeStateEvent) => void
        onError: () => void
      }
    },
  ) => YouTubePlayerController
}

declare global {
  interface Window {
    YT?: YouTubeApi
    onYouTubeIframeAPIReady?: () => void
  }
}

let youtubeApiPromise: Promise<YouTubeApi> | null = null

function loadYouTubeApi() {
  if (window.YT?.Player) return Promise.resolve(window.YT)
  if (youtubeApiPromise) return youtubeApiPromise

  youtubeApiPromise = new Promise<YouTubeApi>((resolve, reject) => {
    const previousReadyHandler = window.onYouTubeIframeAPIReady

    window.onYouTubeIframeAPIReady = () => {
      previousReadyHandler?.()
      if (window.YT?.Player) resolve(window.YT)
      else reject(new Error('API-ul YouTube nu a putut fi inițializat.'))
    }

    const existingScript = document.querySelector<HTMLScriptElement>('script[src="https://www.youtube.com/iframe_api"]')
    if (existingScript) return

    const script = document.createElement('script')
    script.src = 'https://www.youtube.com/iframe_api'
    script.async = true
    script.addEventListener('error', () => {
      youtubeApiPromise = null
      reject(new Error('API-ul YouTube nu a putut fi încărcat.'))
    }, { once: true })
    document.head.append(script)
  })

  return youtubeApiPromise
}

type BroadcastPhase = 'loading' | 'playing' | 'blocked' | 'error'

type BroadcastRect = {
  top: number
  left: number
  width: number
  height: number
}

type BroadcastDragSession = {
  pointerId: number
  startX: number
  startY: number
  startLeft: number
  startTop: number
  moved: boolean
  captureElement: HTMLElement
}

type MatchBroadcastProps = {
  anchor: HTMLDivElement | null
  docked: boolean
  onClose: () => void
  onReturnToMatch: () => void
  source?: string
}

function formatVideoTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return '00:00'
  const minutes = Math.floor(value / 60)
  const seconds = Math.floor(value % 60)
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}

export function MatchBroadcast({
  anchor,
  docked,
  onClose,
  onReturnToMatch,
  source = matchStreamUrl,
}: MatchBroadcastProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const shellRef = useRef<HTMLElement>(null)
  const dragSessionRef = useRef<BroadcastDragSession | null>(null)
  const playerRef = useRef<YouTubePlayerController | null>(null)
  const revealTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const blockedTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const statePollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const visibilityTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const relocationTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initialDockFrameRef = useRef<number | null>(null)
  const previousDockedRef = useRef(docked)
  const previousDockTargetRef = useRef(false)
  const initiallyDockedRef = useRef(docked)
  const userPausedRef = useRef(false)
  const { isMuted: isSoundMuted, toggleMute: toggleSound } = useSound()
  const soundMutedRef = useRef(isSoundMuted)
  const [phase, setPhase] = useState<BroadcastPhase>('loading')
  const [isPaused, setIsPaused] = useState(false)
  const [resumeShield, setResumeShield] = useState(false)
  const [isRelocating, setIsRelocating] = useState(false)
  const [initialDockReady, setInitialDockReady] = useState(!docked)
  const [timeline, setTimeline] = useState({ current: 0, duration: 0 })
  const [anchorRect, setAnchorRect] = useState<BroadcastRect | null>(null)
  const [viewport, setViewport] = useState(() => ({
    width: window.innerWidth,
    height: window.innerHeight,
  }))
  const [floatingPosition, setFloatingPosition] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('cetatea-video-position') ?? '{}')
      return {
        x: typeof stored.x === 'number' ? Math.min(1, Math.max(0, stored.x)) : 1,
        y: typeof stored.y === 'number' ? Math.min(1, Math.max(0, stored.y)) : 1,
      }
    } catch {
      return { x: 1, y: 1 }
    }
  })
  const [dragPosition, setDragPosition] = useState<{ left: number; top: number } | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  const stream = useMemo(() => {
    try {
      const url = new URL(source)
      const hostname = url.hostname.replace(/^www\./, '')
      const isYouTube = hostname === 'youtube.com'
        || hostname.endsWith('.youtube.com')
        || hostname === 'youtube-nocookie.com'
        || hostname.endsWith('.youtube-nocookie.com')

      if (isYouTube) {
        url.searchParams.set('enablejsapi', '1')
        url.searchParams.set('origin', window.location.origin)
      }

      return { src: url.toString(), isYouTube }
    } catch {
      return { src: source, isYouTube: false }
    }
  }, [source])

  useEffect(() => {
    const syncViewport = () => setViewport({ width: window.innerWidth, height: window.innerHeight })
    window.addEventListener('resize', syncViewport)
    return () => window.removeEventListener('resize', syncViewport)
  }, [])

  useEffect(() => {
    if (!docked || !anchor) {
      setAnchorRect(null)
      return
    }

    let settled = false

    const measure = () => {
      const rect = anchor.getBoundingClientRect()
      if (rect.width < 2 || rect.height < 2) return

      const next = {
        top: rect.top,
        left: rect.left,
        width: rect.width,
        height: rect.height,
      }
      setAnchorRect((current) => {
        if (
          current
          && Math.abs(current.top - next.top) < .5
          && Math.abs(current.left - next.left) < .5
          && Math.abs(current.width - next.width) < .5
          && Math.abs(current.height - next.height) < .5
        ) return current
        return next
      })
    }

    const observer = new ResizeObserver(() => {
      if (settled) measure()
    })
    observer.observe(anchor)
    const settleTimer = setTimeout(() => {
      settled = true
      measure()
    }, 560)

    return () => {
      observer.disconnect()
      clearTimeout(settleTimer)
    }
  }, [anchor, docked])

  const hasDockTarget = docked && Boolean(anchorRect)

  useLayoutEffect(() => {
    if (initialDockReady || !initiallyDockedRef.current) return

    if (!docked) {
      setInitialDockReady(true)
      return
    }

    if (!anchorRect) return
    initialDockFrameRef.current = requestAnimationFrame(() => {
      setInitialDockReady(true)
      initialDockFrameRef.current = null
    })

    return () => {
      if (initialDockFrameRef.current !== null) cancelAnimationFrame(initialDockFrameRef.current)
    }
  }, [anchorRect, docked, initialDockReady])

  useLayoutEffect(() => {
    const dockModeChanged = previousDockedRef.current !== docked
    const dockTargetAcquired = !previousDockTargetRef.current && hasDockTarget

    previousDockedRef.current = docked
    previousDockTargetRef.current = hasDockTarget

    if (!dockModeChanged && !dockTargetAcquired) return

    setIsRelocating(true)
    if (relocationTimerRef.current) clearTimeout(relocationTimerRef.current)
    relocationTimerRef.current = setTimeout(() => setIsRelocating(false), dockTargetAcquired ? 760 : 680)
  }, [docked, hasDockTarget])

  useEffect(() => () => {
    if (relocationTimerRef.current) clearTimeout(relocationTimerRef.current)
    if (initialDockFrameRef.current !== null) cancelAnimationFrame(initialDockFrameRef.current)
  }, [])

  useEffect(() => {
    soundMutedRef.current = isSoundMuted
    const player = playerRef.current
    if (!player) return
    if (isSoundMuted) player.mute()
    else player.unMute()
  }, [isSoundMuted])

  useEffect(() => {
    if (!stream.isYouTube) return

    let isActive = true
    let player: YouTubePlayerController | null = null

    const revealPlayingStream = () => {
      if (!isActive || revealTimerRef.current) return

      // YouTube își stinge propriul overlay imediat după pornire.
      // Păstrăm afișul aplicației peste acea etapă, apoi dezvăluim cadrul curat.
      revealTimerRef.current = setTimeout(() => {
        revealTimerRef.current = null
        if (!isActive || playerRef.current?.getPlayerState() !== 1) return
        if (blockedTimerRef.current) clearTimeout(blockedTimerRef.current)
        if (statePollTimerRef.current) clearInterval(statePollTimerRef.current)
        setIsPaused(false)
        setPhase('playing')
      }, 5200)
    }

    void loadYouTubeApi()
      .then((api) => {
        if (!isActive || !iframeRef.current) return

        player = new api.Player(iframeRef.current, {
          events: {
            onReady: (event) => {
              if (!isActive) return
              playerRef.current = event.target
              event.target.mute()
              event.target.playVideo()
              statePollTimerRef.current = setInterval(() => {
                if (event.target.getPlayerState() === 1) revealPlayingStream()
              }, 250)
              blockedTimerRef.current = setTimeout(() => {
                if (isActive) setPhase('blocked')
              }, 6000)
            },
            onStateChange: (event) => {
              if (!isActive) return
              if (event.data === 1) {
                if (!soundMutedRef.current) event.target.unMute()
                setIsPaused(false)
                revealPlayingStream()
              }
              if (event.data === 2) setIsPaused(true)
            },
            onError: () => {
              if (isActive) setPhase('error')
            },
          },
        })
        playerRef.current = player
      })
      .catch(() => {
        if (isActive) setPhase('error')
      })

    return () => {
      isActive = false
      if (revealTimerRef.current) clearTimeout(revealTimerRef.current)
      if (blockedTimerRef.current) clearTimeout(blockedTimerRef.current)
      if (statePollTimerRef.current) clearInterval(statePollTimerRef.current)
      if (visibilityTimerRef.current) clearTimeout(visibilityTimerRef.current)
      if (playerRef.current === player) playerRef.current = null
      player?.destroy()
    }
  }, [stream.isYouTube, stream.src])

  useEffect(() => {
    if (phase !== 'playing') return

    const syncTimeline = () => {
      const player = playerRef.current
      if (!player) return
      setTimeline({
        current: player.getCurrentTime() || 0,
        duration: player.getDuration() || 0,
      })
    }

    syncTimeline()
    const interval = setInterval(syncTimeline, 500)
    return () => clearInterval(interval)
  }, [phase])

  useEffect(() => {
    if (phase !== 'playing') return

    const handleVisibility = () => {
      if (document.visibilityState !== 'visible' || userPausedRef.current) return

      setResumeShield(true)
      playerRef.current?.playVideo()
      if (visibilityTimerRef.current) clearTimeout(visibilityTimerRef.current)
      visibilityTimerRef.current = setTimeout(() => setResumeShield(false), 4800)
    }

    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [phase])

  const requestPlayback = () => {
    if (!playerRef.current) {
      setPhase('error')
      return
    }

    setPhase('loading')
    playerRef.current.mute()
    playerRef.current.playVideo()
    if (blockedTimerRef.current) clearTimeout(blockedTimerRef.current)
    blockedTimerRef.current = setTimeout(() => setPhase('blocked'), 6000)
  }

  const togglePlayback = () => {
    const player = playerRef.current
    if (!player) return

    if (isPaused || player.getPlayerState() !== 1) {
      userPausedRef.current = false
      setIsPaused(false)
      setResumeShield(true)
      player.playVideo()
      if (visibilityTimerRef.current) clearTimeout(visibilityTimerRef.current)
      visibilityTimerRef.current = setTimeout(() => setResumeShield(false), 3200)
      return
    }

    userPausedRef.current = true
    player.pauseVideo()
    setIsPaused(true)
  }

  const toggleVideoMute = () => {
    toggleSound()
  }

  const seekVideo = (value: number) => {
    playerRef.current?.seekTo(value, true)
    setTimeline((current) => ({ ...current, current: value }))
  }

  const closePlayer = () => {
    userPausedRef.current = true
    playerRef.current?.pauseVideo()
    onClose()
  }

  const curtainCopy = phase === 'blocked'
    ? 'Browserul a oprit pornirea automată'
    : phase === 'error'
      ? 'Semnalul video nu este disponibil'
      : 'Pregătim cadrul transmisiei'

  const floatingWidth = Math.min(410, Math.max(286, viewport.width * .285), viewport.width - 24)
  const floatingHeight = floatingWidth * 9 / 16
  const floatingMargin = 12
  const floatingTravelX = Math.max(0, viewport.width - floatingWidth - floatingMargin * 2)
  const floatingTravelY = Math.max(0, viewport.height - floatingHeight - floatingMargin * 2)
  const floatingLeft = floatingMargin + floatingTravelX * floatingPosition.x
  const floatingTop = floatingMargin + floatingTravelY * floatingPosition.y
  const placement = docked && anchorRect
    ? anchorRect
    : {
        top: dragPosition?.top ?? floatingTop,
        left: dragPosition?.left ?? floatingLeft,
        width: floatingWidth,
        height: floatingHeight,
      }
  const isFloating = !docked
  const isInitialDockPending = initiallyDockedRef.current && !initialDockReady

  const clampFloatingPosition = (left: number, top: number) => {
    const maxLeft = Math.max(floatingMargin, viewport.width - floatingWidth - floatingMargin)
    const maxTop = Math.max(floatingMargin, viewport.height - floatingHeight - floatingMargin)
    return {
      left: Math.min(maxLeft, Math.max(floatingMargin, left)),
      top: Math.min(maxTop, Math.max(floatingMargin, top)),
    }
  }

  const startFloatingDrag = (event: ReactPointerEvent<HTMLElement>, force = false) => {
    if (!isFloating || (!force && (event.target as HTMLElement).closest('button'))) return
    const rect = shellRef.current?.getBoundingClientRect()
    if (!rect) return

    event.preventDefault()
    event.stopPropagation()
    event.currentTarget.setPointerCapture(event.pointerId)
    dragSessionRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      startLeft: rect.left,
      startTop: rect.top,
      moved: false,
      captureElement: event.currentTarget,
    }
    setDragPosition({ left: rect.left, top: rect.top })
    setIsDragging(true)
  }

  const moveFloatingDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const session = dragSessionRef.current
    if (!session || session.pointerId !== event.pointerId) return

    event.preventDefault()
    const deltaX = event.clientX - session.startX
    const deltaY = event.clientY - session.startY
    if (Math.abs(deltaX) > 2 || Math.abs(deltaY) > 2) session.moved = true
    setDragPosition(clampFloatingPosition(session.startLeft + deltaX, session.startTop + deltaY))
  }

  const finishFloatingDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const session = dragSessionRef.current
    if (!session || session.pointerId !== event.pointerId) return

    const deltaX = event.clientX - session.startX
    const deltaY = event.clientY - session.startY
    const finalPosition = clampFloatingPosition(session.startLeft + deltaX, session.startTop + deltaY)

    if (session.captureElement.hasPointerCapture(session.pointerId)) {
      session.captureElement.releasePointerCapture(session.pointerId)
    }
    dragSessionRef.current = null

    if (session.moved) {
      const nextPosition = {
        x: floatingTravelX > 0 ? (finalPosition.left - floatingMargin) / floatingTravelX : 0,
        y: floatingTravelY > 0 ? (finalPosition.top - floatingMargin) / floatingTravelY : 0,
      }
      setFloatingPosition(nextPosition)
      localStorage.setItem('cetatea-video-position', JSON.stringify(nextPosition))
    }

    setDragPosition(null)
    setIsDragging(false)
  }

  const cancelFloatingDrag = () => {
    const session = dragSessionRef.current
    if (session?.captureElement.hasPointerCapture(session.pointerId)) {
      session.captureElement.releasePointerCapture(session.pointerId)
    }
    dragSessionRef.current = null
    setDragPosition(null)
    setIsDragging(false)
  }

  const moveFloatingWithKeyboard = (deltaX: number, deltaY: number) => {
    const next = clampFloatingPosition(floatingLeft + deltaX, floatingTop + deltaY)
    const nextPosition = {
      x: floatingTravelX > 0 ? (next.left - floatingMargin) / floatingTravelX : 0,
      y: floatingTravelY > 0 ? (next.top - floatingMargin) / floatingTravelY : 0,
    }
    setFloatingPosition(nextPosition)
    localStorage.setItem('cetatea-video-position', JSON.stringify(nextPosition))
  }

  return (
    <section
      ref={shellRef}
      className={`${styles.broadcastShell} ${isFloating ? styles.broadcastShellFloating : styles.broadcastShellDocked} ${isDragging ? styles.broadcastShellDragging : ''} ${isInitialDockPending ? styles.broadcastShellInitialDockPending : ''}`}
      aria-label={isFloating ? 'Mini-playerul transmisiei' : 'Transmisiunea meciului'}
      style={{
        '--broadcast-poster': `url("${arenaBackground}")`,
        '--broadcast-x': `${placement.left}px`,
        '--broadcast-y': `${placement.top}px`,
        width: placement.width,
        height: placement.height,
      } as CSSProperties}
    >
      <div className={`${styles.broadcastPlayer} ${isPaused ? styles.broadcastPlayerPaused : ''}`}>
        <iframe
          ref={iframeRef}
          className={`${styles.broadcastFrame} ${phase === 'playing' ? styles.broadcastFrameReady : ''}`}
          src={stream.src}
          title="Transmisiunea video Cetatea Suceava"
          allow="autoplay; encrypted-media; picture-in-picture"
          referrerPolicy="strict-origin-when-cross-origin"
          tabIndex={-1}
          onLoad={() => {
            if (!stream.isYouTube) setPhase('playing')
          }}
        />

        <div
          className={`${styles.broadcastTopShield} ${isFloating ? styles.broadcastDragSurface : ''}`}
          onPointerDown={(event) => {
            startFloatingDrag(event)
          }}
          onPointerMove={moveFloatingDrag}
          onPointerUp={finishFloatingDrag}
          onPointerCancel={cancelFloatingDrag}
        >
          <span><i /> CETATEA LIVE</span>
          <small>{isFloating ? 'Transmisiunea continuă' : 'Semnalul oficial al suporterilor'}</small>
          {isFloating && (
            <span className={styles.broadcastWindowActions}>
              <button
                type="button"
                className={styles.broadcastDragHandle}
                onPointerDown={(event) => startFloatingDrag(event, true)}
                onKeyDown={(event) => {
                  const distance = event.shiftKey ? 64 : 24
                  if (event.key === 'ArrowLeft') moveFloatingWithKeyboard(-distance, 0)
                  else if (event.key === 'ArrowRight') moveFloatingWithKeyboard(distance, 0)
                  else if (event.key === 'ArrowUp') moveFloatingWithKeyboard(0, -distance)
                  else if (event.key === 'ArrowDown') moveFloatingWithKeyboard(0, distance)
                  else return
                  event.preventDefault()
                }}
                aria-label="Mută mini-playerul"
                title="Trage pentru a muta"
              ><GripHorizontal /></button>
              <button type="button" onClick={onReturnToMatch} aria-label="Deschide transmisiunea în centrul meciului"><Maximize2 /></button>
              <button type="button" onClick={closePlayer} aria-label="Închide mini-playerul"><X /></button>
            </span>
          )}
        </div>

        {phase === 'playing' && (
          <div className={styles.broadcastControls}>
            <button type="button" onClick={togglePlayback} aria-label={isPaused ? 'Continuă redarea' : 'Pune pauză'}>
              {isPaused ? <Play /> : <Pause />}
            </button>
            <time>{formatVideoTime(timeline.current)}</time>
            <input
              type="range"
              min="0"
              max={Math.max(timeline.duration, 1)}
              step="0.1"
              value={Math.min(timeline.current, Math.max(timeline.duration, 1))}
              onChange={(event) => seekVideo(Number(event.target.value))}
              disabled={timeline.duration <= 0}
              aria-label="Poziția în transmisie"
              style={{ '--video-progress': `${timeline.duration > 0 ? timeline.current / timeline.duration * 100 : 100}%` } as CSSProperties}
            />
            <time>{timeline.duration > 0 ? formatVideoTime(timeline.duration) : 'LIVE'}</time>
            <button type="button" onClick={toggleVideoMute} aria-label={isSoundMuted ? 'Pornește toate sunetele' : 'Oprește toate sunetele'}>
              {isSoundMuted ? <VolumeX /> : <Volume2 />}
            </button>
            {isFloating && (
              <button type="button" onClick={onReturnToMatch} aria-label="Revino la centrul meciului"><Maximize2 /></button>
            )}
          </div>
        )}

        {isPaused && phase === 'playing' && (
          <button type="button" className={styles.broadcastPauseVeil} onClick={togglePlayback}>
            <span><Play /></span>
            <strong>Transmisiune în pauză</strong>
            <small>Apasă pentru a continua</small>
          </button>
        )}

        <div className={`${styles.broadcastResumeShield} ${resumeShield ? styles.broadcastResumeShieldVisible : ''}`} aria-hidden="true">
          <span><i /> Semnal reluat</span>
        </div>

        <div className={`${styles.broadcastRelocationShield} ${isRelocating ? styles.broadcastRelocationShieldVisible : ''}`} aria-hidden="true">
          <Video />
          <span><i /> {isFloating ? 'Transmisiunea te urmează' : 'Revenim în centrul meciului'}</span>
        </div>

        <div
          className={`${styles.broadcastCurtain} ${phase === 'playing' ? styles.broadcastCurtainHidden : ''}`}
          role="status"
          aria-live="polite"
          aria-hidden={phase === 'playing'}
        >
          <div className={styles.broadcastCurtainContent}>
            <span className={styles.broadcastSignal}><i /> CETATEA LIVE</span>
            <img src={fanEmblem} alt="" aria-hidden="true" />
            <strong>{curtainCopy}</strong>

            {phase === 'loading' ? (
              <span className={styles.broadcastProgress} aria-hidden="true"><i /></span>
            ) : (
              <button type="button" onClick={requestPlayback} disabled={phase === 'error'}>
                <Play aria-hidden="true" />
                {phase === 'blocked' ? 'Pornește transmisiunea' : 'Semnal indisponibil'}
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}

type NextMatchViewProps = {
  broadcastAnchorRef?: RefCallback<HTMLDivElement>
  broadcastRequestToken?: number
  onBroadcastActiveChange?: (active: boolean) => void
}

export function NextMatchView({
  broadcastAnchorRef,
  broadcastRequestToken = 0,
  onBroadcastActiveChange,
}: NextMatchViewProps = {}) {
  const countdown = useMatchCountdown()
  const { play } = useSound()
  const [mode, setMode] = useState<MatchCenterMode>(isDemoStream ? 'transmisiune' : 'centru')
  const [messages, setMessages] = useState<WallMessage[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('cetatea-match-messages') ?? '[]')
      return Array.isArray(stored) ? [...initialMessages, ...stored] : initialMessages
    } catch {
      return initialMessages
    }
  })
  const [message, setMessage] = useState('')
  const [scorePrediction, setScorePrediction] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('cetatea-score-prediction') ?? '{}')
      return {
        home: typeof stored.home === 'number' ? stored.home : 2,
        away: typeof stored.away === 'number' ? stored.away : 0,
      }
    } catch {
      return { home: 2, away: 0 }
    }
  })
  const [checkedIn, setCheckedIn] = useState(() => localStorage.getItem('cetatea-match-checkin') === 'active')
  const [matchReminder, setMatchReminder] = useState(() => localStorage.getItem('cetatea-next-match-reminder') === 'active')

  useEffect(() => {
    if (broadcastRequestToken > 0) setMode('transmisiune')
  }, [broadcastRequestToken])

  useEffect(() => {
    onBroadcastActiveChange?.(mode === 'transmisiune')
    return () => onBroadcastActiveChange?.(false)
  }, [mode, onBroadcastActiveChange])

  useEffect(() => {
    localStorage.setItem('cetatea-match-messages', JSON.stringify(messages.filter((item) => item.id > 3)))
  }, [messages])

  useEffect(() => {
    localStorage.setItem('cetatea-score-prediction', JSON.stringify(scorePrediction))
  }, [scorePrediction])

  useEffect(() => {
    localStorage.setItem('cetatea-match-checkin', checkedIn ? 'active' : 'inactive')
  }, [checkedIn])

  useEffect(() => {
    localStorage.setItem('cetatea-next-match-reminder', matchReminder ? 'active' : 'inactive')
  }, [matchReminder])

  const sendMessage = (event: FormEvent) => {
    event.preventDefault()
    const cleanMessage = message.trim()
    if (!cleanMessage) return

    setMessages((current) => [
      ...current,
      {
        id: Date.now(),
        author: 'Tu / Carnet suporter',
        text: cleanMessage,
        time: new Intl.DateTimeFormat('ro-RO', {
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date()),
      },
    ])
    setMessage('')
    play('success')
  }

  const quickMessage = (text: string) => {
    setMessage(text)
    play('navigate')
  }

  const changeScore = (team: 'home' | 'away', direction: number) => {
    setScorePrediction((current) => ({
      ...current,
      [team]: Math.max(0, Math.min(9, current[team] + direction)),
    }))
    play('toggle')
  }

  const toggleCheckIn = () => {
    setCheckedIn((current) => !current)
    play('success')
  }

  const toggleMatchReminder = () => {
    setMatchReminder((current) => !current)
    play('success')
  }

  const addMatchToCalendar = () => {
    const start = new Date(nextMatch.kickoff)
    const end = new Date(start.getTime() + 2 * 60 * 60 * 1000)
    const toCalendarDate = (date: Date) => date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
    const calendar = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Fan Club Cetatea Suceava//RO',
      'BEGIN:VEVENT',
      `DTSTART:${toCalendarDate(start)}`,
      `DTEND:${toCalendarDate(end)}`,
      `SUMMARY:${nextMatch.home.name} - ${nextMatch.away.name}`,
      `LOCATION:${nextMatch.venue}`,
      `DESCRIPTION:${nextMatch.competition} · ${nextMatch.round}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ].join('\r\n')
    const url = URL.createObjectURL(new Blob([calendar], { type: 'text/calendar;charset=utf-8' }))
    const anchor = document.createElement('a')
    anchor.href = url
    anchor.download = 'cetatea-suceava-csm-satu-mare.ics'
    document.body.appendChild(anchor)
    anchor.click()
    anchor.remove()
    URL.revokeObjectURL(url)
    play('success')
  }

  const shareMatch = async () => {
    const text = `${nextMatch.home.name} – ${nextMatch.away.name}, ${nextMatch.dateLabel}, ora ${nextMatch.timeLabel}, ${nextMatch.venue}`
    try {
      if (navigator.share) await navigator.share({ title: 'Următorul meci al Cetății', text })
      else await navigator.clipboard?.writeText(text)
      play('success')
    } catch {
      // Distribuirea poate fi anulată de utilizator.
    }
  }

  return (
    <section className={`${styles.view} ${styles.matchCenterView}`}>
      <ViewIntro code="MEC–01" label="Următorul meci / Match Center" title="Areni intră în" accent="stare de asediu." />

      <div className={styles.matchCenterHub}>
        <motion.nav className={styles.matchCenterModes} variants={reveal} initial="hidden" animate="visible" aria-label="Modurile centrului de meci">
          {matchCenterModes.map((item, index) => {
            const Icon = item.icon
            return (
              <button type="button" key={item.id} className={mode === item.id ? styles.matchCenterModeActive : ''} onClick={() => { setMode(item.id); play('navigate') }} aria-pressed={mode === item.id}>
                <span>0{index + 1}</span><Icon aria-hidden="true" /><div><strong>{item.label}</strong><small>{item.meta}</small></div><i />
              </button>
            )
          })}
          <div className={styles.matchCenterSignal}><span><i /> Program oficial</span><strong>{nextMatch.dateLabel} · {nextMatch.timeLabel}</strong></div>
        </motion.nav>

        <div className={styles.matchCenterScene}>
          <div className={styles.matchCenterGrid}>
            <div className={styles.matchModeScene}>
              <AnimatePresence mode="wait" initial={false}>
                {mode === 'centru' && (
                  <motion.article key="centru" className={styles.matchOverview} initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }} transition={{ duration: .42, ease: [0.16, 1, 0.3, 1] }}>
                    <header><span><i /> {nextMatch.competition} · {nextMatch.round}</span><strong>{nextMatch.venue}</strong><em>PROGRAMAT</em></header>

                    <div className={styles.matchCountdownCommand} aria-label="Timp rămas până la meci">
                      <div><small>Începe în</small><strong>Fiecare voce contează.</strong></div>
                      {[[countdown.days, 'Zile'], [countdown.hours, 'Ore'], [countdown.minutes, 'Min.'], [countdown.seconds, 'Sec.']].map(([value, label]) => (
                        <span key={label}><strong>{value}</strong><small>{label}</small></span>
                      ))}
                    </div>

                    <div className={styles.matchClash}>
                      <div className={styles.matchClubHome}><span><img src={nextMatch.home.badge} alt="Sigla Cetatea Suceava" /></span><div><small>Gazde · {nextMatch.home.city}</small><h2>{nextMatch.home.name}</h2><strong>Î / V</strong></div></div>
                      <div className={styles.matchVersus}><small>{nextMatch.timeLabel}</small><strong>VS</strong><i /><span>{nextMatch.round}</span></div>
                      <div className={styles.matchClubAway}><div><small>Oaspeți · {nextMatch.away.city}</small><h2>{nextMatch.away.name}</h2><strong>Î / E</strong></div><span><img src={nextMatch.away.badge} alt="Sigla CSM Satu Mare" /></span></div>
                    </div>

                    <div className={styles.matchEssentials}>
                      <span>
                        <span className={styles.factIcon} aria-hidden="true"><CalendarDays /></span>
                        <span className={styles.factCopy}>
                          <small>Data</small>
                          <strong className={styles.factValueFull}>{nextMatch.dateLabel}</strong>
                          <strong className={styles.factValueCompact}>{nextMatch.compactDateLabel}</strong>
                        </span>
                      </span>
                      <span>
                        <span className={styles.factIcon} aria-hidden="true"><MapPin /></span>
                        <span className={styles.factCopy}><small>Locul</small><strong>{nextMatch.venue}</strong></span>
                      </span>
                      <span>
                        <span className={styles.factIcon} aria-hidden="true"><UsersRound /></span>
                        <span className={styles.factCopy}><small>Suporteri conectați</small><strong>{checkedIn ? 285 : 284}</strong></span>
                      </span>
                    </div>

                    <footer className={styles.matchOverviewActions}>
                      <button type="button" className={matchReminder ? styles.matchOverviewActionActive : ''} onClick={toggleMatchReminder} aria-pressed={matchReminder}><Bell aria-hidden="true" /><span><strong>{matchReminder ? 'Alertă activată' : 'Anunță-mă'}</strong><small>Lot, start și scor</small></span></button>
                      <button type="button" onClick={addMatchToCalendar}><CalendarPlus aria-hidden="true" /><span><strong>Adaugă în calendar</strong><small>Fișier compatibil .ics</small></span></button>
                      <button type="button" onClick={() => void shareMatch()}><Share2 aria-hidden="true" /><span><strong>Cheamă un suporter</strong><small>Distribuie confruntarea</small></span></button>
                    </footer>
                  </motion.article>
                )}

                {mode === 'transmisiune' && (
                  <motion.div ref={broadcastAnchorRef} key="transmisiune" className={styles.broadcastExperience} initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }} transition={{ duration: .42, ease: [0.16, 1, 0.3, 1] }}>
                    <span className={styles.broadcastDockTarget} aria-hidden="true"><i /><small>Pregătim transmisia</small></span>
                  </motion.div>
                )}

                {mode === 'program' && (
                  <motion.div key="program" className={styles.matchDayExperience} initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }} transition={{ duration: .42, ease: [0.16, 1, 0.3, 1] }}>
                    <div className={styles.matchDayTimeline}>
                      <header><div><small>Plan recomandat</small><strong>Ritmul zilei de meci</strong></div><span>START {nextMatch.timeLabel}</span></header>
                      <div>
                        {matchDayMoments.map((moment, index) => (
                          <article key={`${moment.time}-${moment.label}`} className={moment.official ? styles.matchDayOfficial : ''}>
                            <span><b>{moment.time}</b><i /></span>
                            <div><small>0{index + 1} · {moment.official ? 'ORĂ OFICIALĂ' : 'REPER ORIENTATIV'}</small><strong>{moment.label}</strong><p>{moment.meta}</p></div>
                            {moment.official && <Wifi aria-hidden="true" />}
                          </article>
                        ))}
                      </div>
                    </div>

                    <aside className={styles.stadiumBriefing}>
                      <header><span><MapPin aria-hidden="true" /> Coordonatele Cetății</span><strong>ARENI / SV</strong></header>
                      <div className={styles.stadiumRadar}><span /><span /><i /><strong>47.64°N<br />26.24°E</strong></div>
                      <h2>{nextMatch.venue}</h2>
                      <p>Vino în alb-albastru și verifică informațiile oficiale înainte de plecare. Orele din plan, exceptând startul, sunt orientative.</p>
                      <div className={styles.matchChecklist}><span><i /> Bilet / acces</span><span><i /> Fular alb-albastru</span><span><i /> Voce pentru 90'</span></div>
                      <button type="button" className={checkedIn ? styles.matchChecklistActive : ''} onClick={toggleCheckIn}><TicketCheck aria-hidden="true" /> {checkedIn ? 'Participarea este confirmată' : 'Confirmă că vii la Areni'} <ArrowRight aria-hidden="true" /></button>
                    </aside>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <motion.aside className={styles.matchRoom} variants={reveal} initial="hidden" animate="visible" custom={.12}>
              <header><div><small>Camera suporterilor</small><strong>Pulsul dinaintea meciului.</strong></div><span><i /> 284 online</span></header>

              <div className={styles.exactScorePrediction}>
                <header><span>Predicția ta de scor</span><small>Se salvează automat</small></header>
                <div>
                  {(['home', 'away'] as const).map((team) => (
                    <span key={team}>
                      <small>{team === 'home' ? nextMatch.home.name : nextMatch.away.name}</small>
                      <div><button type="button" onClick={() => changeScore(team, -1)} aria-label={`Scade scorul pentru ${team === 'home' ? nextMatch.home.name : nextMatch.away.name}`}><Minus aria-hidden="true" /></button><strong>{scorePrediction[team]}</strong><button type="button" onClick={() => changeScore(team, 1)} aria-label={`Crește scorul pentru ${team === 'home' ? nextMatch.home.name : nextMatch.away.name}`}><Plus aria-hidden="true" /></button></div>
                    </span>
                  ))}
                  <b>:</b>
                </div>
                <footer><span>Predicția comunității</span><strong>2 – 0 · 38%</strong></footer>
              </div>

              <div className={styles.matchRoomCheckIn}>
                <div><span>Suporteri care vin</span><strong>{checkedIn ? '1.933' : '1.932'}</strong></div>
                <button type="button" className={checkedIn ? styles.matchRoomChecked : ''} onClick={toggleCheckIn} aria-pressed={checkedIn}><TicketCheck aria-hidden="true" />{checkedIn ? 'Vin la Areni' : 'Confirmă prezența'}<i /></button>
              </div>

              <div className={styles.matchRoomMessages} aria-live="polite">
                {messages.slice(-3).map((wallMessage, index) => (
                  <motion.article key={wallMessage.id} initial={{ opacity: 0, x: 14 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * .04 }}>
                    <span>{wallMessage.author.slice(0, 2).toUpperCase()}</span><div><header><strong>{wallMessage.author}</strong><time>{wallMessage.time}</time></header><p>{wallMessage.text}</p></div>
                  </motion.article>
                ))}
              </div>

              <div className={styles.matchQuickMessages}>{['Forza Cetatea!', 'Toți la Areni', 'Alb-albastru'].map((text) => <button type="button" key={text} onClick={() => quickMessage(text)}>{text}</button>)}</div>
              <form className={styles.matchRoomComposer} onSubmit={sendMessage}>
                <span>CS</span><label><input value={message} maxLength={72} onChange={(event) => setMessage(event.target.value)} placeholder="Scrie în camera meciului..." /><small>{message.length}/72</small></label><button type="submit" disabled={!message.trim()} aria-label="Trimite mesajul"><Send aria-hidden="true" /></button>
              </form>
            </motion.aside>
          </div>
        </div>
      </div>
    </section>
  )
}

const liveEvents = [
  ['—', 'Așteptăm fluierul de start', 'Sistem'],
  ['00', 'Echipa de start va apărea aici', 'Lot'],
  ['00', 'Evenimentele vor fi sincronizate prin Firebase', 'Date'],
]

export function LiveCenterView() {
  return (
    <section className={styles.view}>
      <ViewIntro code="DIR–02" label="Centru de meci" title="Fiecare fază." accent="Fiecare secundă." />
      <div className={styles.liveLayout}>
        <motion.div className={styles.liveScore} variants={reveal} initial="hidden" animate="visible" custom={0.05}>
          <HudLabel value="ÎN AȘTEPTARE">Motorul meciului</HudLabel>
          <div className={styles.scoreline}>
            <span>CET</span><strong>0</strong><i>:</i><strong>0</strong><span>SAT</span>
          </div>
          <div className={styles.liveMinute}><i /> ÎNAINTE DE MECI</div>
          <div className={styles.pitchMap}>
            <span className={styles.centerCircle} />
            {[18, 32, 48, 61, 74, 27, 53, 82].map((left, index) => (
              <i
                key={left}
                className={index > 4 ? styles.opponentDot : ''}
                style={{ '--player-x': `${left}%`, '--player-y': `${24 + (index % 3) * 25}%` } as CSSProperties}
              />
            ))}
          </div>
          <div className={styles.liveMetrics}>
            <span><small>Posesie</small><strong>— / —</strong></span>
            <span><small>Șuturi</small><strong>0 / 0</strong></span>
            <span><small>Ocazii</small><strong>0 / 0</strong></span>
          </div>
        </motion.div>

        <motion.aside className={styles.eventStream} variants={reveal} initial="hidden" animate="visible" custom={0.13}>
          <div className={styles.wallHeading}><div><span>Flux de meci</span><strong>Totul, în timp real.</strong></div><em>SINCRONIZAT</em></div>
          {liveEvents.map(([minute, text, type]) => (
            <article className={styles.liveEvent} key={text}>
              <strong>{minute}'</strong><div><span>{type}</span><p>{text}</p></div>
            </article>
          ))}
          <div className={styles.dataNotice}><i /> Modul se activează automat în ziua meciului.</div>
        </motion.aside>
      </div>
    </section>
  )
}

type TribuneFilter = 'Toate' | 'Oficial' | 'Suporteri' | 'Media'
type TribunePostLabel = 'Discuție' | 'Din tribună' | 'Analiză'
type ComposerMode = 'mesaj' | 'fotografie'
type TribuneSort = 'Pentru tine' | 'Recente' | 'Populare'
type TribuneReaction = 'inima' | 'foc' | 'forta'
type TribuneArenaGame = 'penalty' | 'quiz' | 'jucator' | 'cronologie'
type PenaltyOpponent = 'suporter' | 'calculator'
type PenaltyRole = 'executant' | 'portar'
type PenaltyTechnique = 'plasat' | 'putere' | 'panenka'
type PenaltyZone = 'stanga-sus' | 'stanga-jos' | 'centru' | 'dreapta-sus' | 'dreapta-jos'

type PenaltyResolution = {
  userChoice: PenaltyZone
  opponentChoice: PenaltyZone
  role: PenaltyRole
  goal: boolean
}

type PenaltyHistoryItem = {
  side: 'user' | 'opponent'
  goal: boolean
}

type TribunePost = {
  id: string
  author: string
  initials: string
  role: string
  time: string
  text: string
  official?: boolean
  image?: string
  label?: string
  reactionBase: number
  commentBase: number
  tone: string
  userCreated?: boolean
  pinned?: boolean
}

type TribuneComment = {
  id: string
  author: string
  text: string
  time: string
}

const tribuneFilters: TribuneFilter[] = ['Toate', 'Oficial', 'Suporteri', 'Media']
const tribunePostLabels: TribunePostLabel[] = ['Discuție', 'Din tribună', 'Analiză']
const tribuneSorts: TribuneSort[] = ['Pentru tine', 'Recente', 'Populare']

const seedTribunePosts: TribunePost[] = [
  {
    id: 'oficial-victorie',
    author: 'Cetatea Suceava',
    initials: 'CS',
    role: 'Canal oficial',
    time: 'astăzi · 09:32',
    text: `Trei puncte câștigate la Târgu Mureș. Victoria cu ${latestResult.score} rămâne în urmă; de acum, toată energia merge spre Areni. Ce păstrăm din ultimul meci?`,
    official: true,
    pinned: true,
    label: 'După meci',
    reactionBase: 86,
    commentBase: 14,
    tone: 'var(--tone-cyan)',
  },
  {
    id: 'suporter-areni',
    author: 'Mara S.',
    initials: 'MS',
    role: 'Tribuna a II-a',
    time: 'acum 34 min.',
    text: 'Areniul are o liniște aparte înainte de meci. Sâmbătă îl umplem din nou cu alb și albastru.',
    image: arenaBackground,
    label: 'Din oraș',
    reactionBase: 39,
    commentBase: 7,
    tone: 'var(--tone-violet)',
  },
  {
    id: 'suporter-intrebare',
    author: 'Andrei / Burdujeni',
    initials: 'AB',
    role: 'Membru din 2026',
    time: 'acum 51 min.',
    text: 'Care a fost momentul în care ați simțit că echipa nu mai poate pierde la Târgu Mureș? Sunt curios cum s-a văzut meciul din fiecare colț al orașului.',
    label: 'Discuție',
    reactionBase: 22,
    commentBase: 11,
    tone: 'var(--tone-amber)',
  },
  {
    id: 'analiza-mijloc',
    author: 'Toma N.',
    initials: 'TN',
    role: 'Observator din Areni',
    time: 'acum 1 oră',
    text: 'Mi-a plăcut cum linia de mijloc a închis spațiile după pauză. Pentru următorul meci aș păstra aceeași agresivitate, dar cu mai mult curaj la ultima pasă.',
    label: 'Analiză',
    reactionBase: 31,
    commentBase: 9,
    tone: 'var(--tone-green)',
  },
  {
    id: 'voce-cartier',
    author: 'Elena / Obcini',
    initials: 'EO',
    role: 'Voce din cartier',
    time: 'acum 2 ore',
    text: 'Prima mea amintire de pe Areni este cu tata, în ploaie, fără să plece nimeni înainte de fluier. Asta înseamnă Cetatea pentru mine: rămâi până la capăt.',
    label: 'Din tribună',
    reactionBase: 54,
    commentBase: 18,
    tone: 'var(--tone-rose)',
  },
]

const tribunePollOptions = [
  'Disciplina echipei',
  'Curajul în atac',
  'Unitatea grupului',
]

const penaltyZones: Array<{ id: PenaltyZone; label: string; x: number; y: number }> = [
  { id: 'stanga-sus', label: 'Stânga sus', x: 18, y: 22 },
  { id: 'stanga-jos', label: 'Stânga jos', x: 20, y: 68 },
  { id: 'centru', label: 'Centru', x: 50, y: 48 },
  { id: 'dreapta-sus', label: 'Dreapta sus', x: 82, y: 22 },
  { id: 'dreapta-jos', label: 'Dreapta jos', x: 80, y: 68 },
]

const penaltyTechniques: Array<{ id: PenaltyTechnique; label: string; detail: string; hint: string; points: number }> = [
  { id: 'plasat', label: 'Plasat', detail: 'Sigur', hint: 'Execuție sigură: dacă portarul ghicește colțul, apără.', points: 15 },
  { id: 'putere', label: 'Putere', detail: 'Risc', hint: 'Poate învinge portarul pe același colț, dar poate rata poarta.', points: 20 },
  { id: 'panenka', label: 'Panenka', detail: 'Curaj', hint: 'Bonus maxim dacă tragi pe centru și portarul pleacă.', points: 30 },
]

const tribuneArenaGames = [
  { id: 'penalty' as const, label: 'Penalty-uri', detail: 'Atacant contra portar', icon: Crosshair, tone: 'var(--tone-cyan)' },
  { id: 'quiz' as const, label: 'Quiz Blitz', detail: 'Patru variante, una corectă', icon: Zap, tone: 'var(--tone-amber)' },
  { id: 'jucator' as const, label: 'Ghicește jucătorul', detail: 'Indiciile dezvăluie omul', icon: Shield, tone: 'var(--tone-green)' },
  { id: 'cronologie' as const, label: 'Cronologia', detail: 'Pune istoria în ordine', icon: History, tone: 'var(--tone-violet)' },
]

const tribuneQuiz = {
  question: 'În ce an a fost fondat clubul Cetatea Suceava?',
  options: ['1924', '1932', '1948', '2024'],
  correct: 1,
}

const arenaPlayerChallenge = {
  clues: ['Poartă numărul 10.', 'Joacă la mijloc.', 'Prenumele său este Ilie.'],
  options: ['Ilie Marian', 'Mario Bai', 'Andrei Bugeac', 'Radu Ungurianu'],
  correct: 0,
}

const arenaTimelineEvents = [
  { id: 'reinfiintare', label: 'Clubul este reînființat', year: 2024 },
  { id: 'victorie', label: 'Victoria cu 2–0 la Târgu Mureș', year: 2026 },
  { id: 'fondare', label: 'Este fondată Cetatea Suceava', year: 1932 },
]

const arenaLeaderboard = [
  { position: 1, name: 'Mara / Areni', points: 1280 },
  { position: 2, name: 'Radu / Burdujeni', points: 1175 },
  { position: 3, name: 'Ioana / Centru', points: 1090 },
]

const initialTribuneComments: Record<string, TribuneComment[]> = {
  'oficial-victorie': [
    { id: 'c-1', author: 'Ioana P.', text: 'Atitudinea. Echipa a rămas compactă până la final.', time: '09:41' },
    { id: 'c-2', author: 'Radu / George Enescu', text: 'Rezultatul ne dă exact energia de care aveam nevoie pentru Areni.', time: '09:48' },
  ],
  'suporter-areni': [
    { id: 'c-3', author: 'Mihai C.', text: 'Ne vedem în tribuna a doua. Toți în alb-albastru!', time: 'acum 21 min.' },
  ],
}

function readStoredPosts() {
  try {
    const stored = JSON.parse(localStorage.getItem('cetatea-tribune-posts') ?? '[]')
    return Array.isArray(stored) ? stored as TribunePost[] : []
  } catch {
    return []
  }
}

function readStoredRecord<T>(key: string, fallback: T): T {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) as T : fallback
  } catch {
    return fallback
  }
}

function readStoredReactions() {
  const stored = readStoredRecord<Record<string, boolean | TribuneReaction>>('cetatea-tribune-reactions', {})
  return Object.fromEntries(Object.entries(stored).flatMap(([postId, reaction]) => {
    if (reaction === true) return [[postId, 'inima' as TribuneReaction]]
    if (reaction === 'inima' || reaction === 'foc' || reaction === 'forta') return [[postId, reaction]]
    return []
  }))
}

export function CommunityView() {
  const { play } = useSound()
  const [filter, setFilter] = useState<TribuneFilter>('Toate')
  const [feedSort, setFeedSort] = useState<TribuneSort>('Pentru tine')
  const [posts, setPosts] = useState<TribunePost[]>(() => [...readStoredPosts(), ...seedTribunePosts])
  const [reactions, setReactions] = useState<Record<string, TribuneReaction>>(() => readStoredReactions())
  const [comments, setComments] = useState<Record<string, TribuneComment[]>>(
    () => readStoredRecord('cetatea-tribune-comments', initialTribuneComments),
  )
  const [composerOpen, setComposerOpen] = useState(false)
  const [composerText, setComposerText] = useState(() => localStorage.getItem('cetatea-tribune-draft') ?? '')
  const [composerImage, setComposerImage] = useState('')
  const [composerError, setComposerError] = useState('')
  const [composerMode, setComposerMode] = useState<ComposerMode>('mesaj')
  const [composerLabel, setComposerLabel] = useState<TribunePostLabel>('Discuție')
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>(
    () => readStoredRecord('cetatea-tribune-bookmarks', {}),
  )
  const [activeArenaGame, setActiveArenaGame] = useState<TribuneArenaGame>('penalty')
  const [arenaPoints, setArenaPoints] = useState(
    () => readStoredRecord('cetatea-arena-puncte', 640),
  )
  const [penaltyOpponent, setPenaltyOpponent] = useState<PenaltyOpponent>('suporter')
  const [penaltyTechnique, setPenaltyTechnique] = useState<PenaltyTechnique>('plasat')
  const [penaltyTurn, setPenaltyTurn] = useState(0)
  const [penaltyScore, setPenaltyScore] = useState({ user: 0, opponent: 0 })
  const [penaltyResolution, setPenaltyResolution] = useState<PenaltyResolution | null>(null)
  const [penaltyHistory, setPenaltyHistory] = useState<PenaltyHistoryItem[]>([])
  const [quizAnswer, setQuizAnswer] = useState<number | null>(null)
  const [playerGuess, setPlayerGuess] = useState<number | null>(null)
  const [revealedClues, setRevealedClues] = useState(1)
  const [timelineOrder, setTimelineOrder] = useState<string[]>([])
  const [timelineChecked, setTimelineChecked] = useState(false)
  const [quickCommentDrafts, setQuickCommentDrafts] = useState<Record<string, string>>({})
  const [activePostId, setActivePostId] = useState<string | null>(null)
  const [commentDraft, setCommentDraft] = useState('')
  const [pollVote, setPollVote] = useState<number | null>(() => {
    const stored = localStorage.getItem('cetatea-tribune-poll')
    return stored === null ? null : Number(stored)
  })

  const visiblePosts = useMemo(() => {
    const filtered = posts.filter((post) => {
      if (filter === 'Oficial') return post.official
      if (filter === 'Suporteri') return !post.official
      if (filter === 'Media') return Boolean(post.image)
      return true
    })
    if (feedSort === 'Recente') return filtered

    const score = (post: TribunePost) => (
      post.reactionBase
      + (reactions[post.id] ? 1 : 0)
      + ((post.commentBase + (comments[post.id]?.length ?? 0)) * 2)
    )
    if (feedSort === 'Populare') return [...filtered].sort((a, b) => score(b) - score(a))
    return [...filtered].sort((a, b) => Number(Boolean(b.pinned)) - Number(Boolean(a.pinned)) || score(b) - score(a))
  }, [comments, feedSort, filter, posts, reactions])

  const activePost = posts.find((post) => post.id === activePostId)
  const activePostComments = activePost ? comments[activePost.id] ?? [] : []
  const activePostReaction = activePost ? reactions[activePost.id] : undefined
  const totalContributions = posts.reduce((total, post) => (
    total + post.reactionBase + post.commentBase + (comments[post.id]?.length ?? 0)
  ), 0)
  const pollScores = [52, 31, 17].map((score, index) => score + (pollVote === index ? 1 : 0))
  const pollTotal = pollScores.reduce((sum, score) => sum + score, 0)
  const penaltyRole: PenaltyRole = penaltyTurn % 2 === 0 ? 'executant' : 'portar'
  const penaltyRound = Math.min(5, Math.floor(penaltyTurn / 2) + 1)
  const penaltyComplete = penaltyTurn >= 10
  const timelineCorrect = timelineOrder.join('|') === 'fondare|reinfiintare|victorie'
  const activeArenaDefinition = tribuneArenaGames.find((game) => game.id === activeArenaGame) ?? tribuneArenaGames[0]
  const ActiveArenaIcon = activeArenaDefinition.icon
  const penaltyBallZone = penaltyResolution
    ? penaltyZones.find((zone) => zone.id === (penaltyResolution.role === 'executant' ? penaltyResolution.userChoice : penaltyResolution.opponentChoice))
    : null
  const penaltyKeeperZone = penaltyResolution
    ? penaltyZones.find((zone) => zone.id === (penaltyResolution.role === 'portar' ? penaltyResolution.userChoice : penaltyResolution.opponentChoice))
    : null
  const penaltyPositiveMoments = penaltyHistory.filter((item) => item.side === 'user' ? item.goal : !item.goal).length
  const penaltyMomentum = Math.min(100, 28 + (penaltyPositiveMoments * 14))
  const penaltyStreakBreak = [...penaltyHistory].reverse().findIndex((item) => item.side === 'user' ? !item.goal : item.goal)
  const penaltyStreak = penaltyStreakBreak === -1 ? penaltyHistory.length : penaltyStreakBreak
  const arenaMissionProgress = [
    penaltyHistory.length > 0,
    quizAnswer !== null,
    playerGuess === arenaPlayerChallenge.correct || (timelineChecked && timelineCorrect),
  ].filter(Boolean).length
  const arenaUserRank = arenaPoints >= 1280 ? 1 : arenaPoints >= 1175 ? 2 : arenaPoints >= 1090 ? 3 : arenaPoints >= 900 ? 8 : arenaPoints >= 760 ? 10 : 12

  useEffect(() => {
    localStorage.setItem('cetatea-tribune-reactions', JSON.stringify(reactions))
  }, [reactions])

  useEffect(() => {
    localStorage.setItem('cetatea-tribune-comments', JSON.stringify(comments))
  }, [comments])

  useEffect(() => {
    localStorage.setItem('cetatea-tribune-bookmarks', JSON.stringify(bookmarks))
  }, [bookmarks])

  useEffect(() => {
    localStorage.setItem('cetatea-arena-puncte', JSON.stringify(arenaPoints))
  }, [arenaPoints])

  useEffect(() => {
    if (composerText.trim()) localStorage.setItem('cetatea-tribune-draft', composerText)
    else localStorage.removeItem('cetatea-tribune-draft')
  }, [composerText])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setComposerOpen(false)
      setActivePostId(null)
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [])

  const persistUserPosts = (nextPosts: TribunePost[]) => {
    const userPosts = nextPosts.filter((post) => post.userCreated)
    try {
      localStorage.setItem('cetatea-tribune-posts', JSON.stringify(userPosts))
    } catch {
      const withoutImages = userPosts.map((post) => ({ ...post, image: undefined }))
      localStorage.setItem('cetatea-tribune-posts', JSON.stringify(withoutImages))
    }
  }

  const openComposer = () => {
    setActivePostId(null)
    setComposerOpen(true)
    play('toggle')
  }

  const openComposerFor = (mode: ComposerMode, label: TribunePostLabel = 'Discuție') => {
    setComposerMode(mode)
    setComposerLabel(label)
    openComposer()
  }

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (file.size > 900_000) {
      setComposerError('Imaginea poate avea maximum 900 KB în această versiune locală.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setComposerImage(typeof reader.result === 'string' ? reader.result : '')
      setComposerMode('fotografie')
      setComposerError('')
    }
    reader.readAsDataURL(file)
  }

  const publishPost = (event: FormEvent) => {
    event.preventDefault()
    const text = composerText.trim()
    if (!text) return

    const newPost: TribunePost = {
      id: `suporter-${Date.now()}`,
      author: 'Suporter Cetatea',
      initials: 'SC',
      role: 'Membru al Tribunei',
      time: 'acum',
      text,
      image: composerImage || undefined,
      label: composerLabel,
      reactionBase: 0,
      commentBase: 0,
      tone: 'var(--tone-green)',
      userCreated: true,
    }
    const nextPosts = [newPost, ...posts]
    setPosts(nextPosts)
    persistUserPosts(nextPosts)
    setComposerText('')
    setComposerImage('')
    setComposerMode('mesaj')
    setComposerLabel('Discuție')
    localStorage.removeItem('cetatea-tribune-draft')
    setComposerOpen(false)
    setFilter('Toate')
    play('success')
  }

  const toggleReaction = (postId: string, reaction: TribuneReaction) => {
    setReactions((current) => {
      if (current[postId] === reaction) {
        const next = { ...current }
        delete next[postId]
        return next
      }
      return { ...current, [postId]: reaction }
    })
    play('toggle')
  }

  const toggleBookmark = (postId: string) => {
    setBookmarks((current) => ({ ...current, [postId]: !current[postId] }))
    play('toggle')
  }

  const openPost = (postId: string) => {
    setComposerOpen(false)
    setActivePostId(postId)
    play('toggle')
  }

  const submitComment = (event: FormEvent) => {
    event.preventDefault()
    if (!activePostId || !commentDraft.trim()) return
    const newComment: TribuneComment = {
      id: `comentariu-${Date.now()}`,
      author: 'Tu',
      text: commentDraft.trim(),
      time: 'acum',
    }
    setComments((current) => ({
      ...current,
      [activePostId]: [...(current[activePostId] ?? []), newComment],
    }))
    setCommentDraft('')
    play('success')
  }

  const submitQuickComment = (event: FormEvent, postId: string) => {
    event.preventDefault()
    const text = quickCommentDrafts[postId]?.trim()
    if (!text) return
    const newComment: TribuneComment = {
      id: `comentariu-rapid-${Date.now()}`,
      author: 'Tu',
      text,
      time: 'acum',
    }
    setComments((current) => ({
      ...current,
      [postId]: [...(current[postId] ?? []), newComment],
    }))
    setQuickCommentDrafts((current) => ({ ...current, [postId]: '' }))
    play('success')
  }

  const selectPollVote = (index: number) => {
    setPollVote(index)
    localStorage.setItem('cetatea-tribune-poll', String(index))
    play('toggle')
  }

  const selectArenaGame = (game: TribuneArenaGame) => {
    setActiveArenaGame(game)
    play('toggle')
  }

  const resetPenaltyDuel = (opponent: PenaltyOpponent = penaltyOpponent) => {
    setPenaltyOpponent(opponent)
    setPenaltyTurn(0)
    setPenaltyScore({ user: 0, opponent: 0 })
    setPenaltyResolution(null)
    setPenaltyHistory([])
    setPenaltyTechnique('plasat')
    play('toggle')
  }

  const playPenaltyZone = (userChoice: PenaltyZone) => {
    if (penaltyResolution || penaltyComplete) return
    const opponentChoice = penaltyZones[Math.floor(Math.random() * penaltyZones.length)]?.id ?? 'centru'
    const chance = Math.random()
    let goal = userChoice !== opponentChoice
    if (penaltyRole === 'executant' && penaltyTechnique === 'putere') {
      goal = userChoice === opponentChoice ? chance < .28 : chance > .12
    }
    if (penaltyRole === 'executant' && penaltyTechnique === 'panenka') {
      goal = userChoice === 'centru' ? opponentChoice !== 'centru' : userChoice !== opponentChoice && chance > .42
    }
    const resolution: PenaltyResolution = { userChoice, opponentChoice, role: penaltyRole, goal }

    setPenaltyResolution(resolution)
    setPenaltyHistory((current) => [...current, { side: penaltyRole === 'executant' ? 'user' : 'opponent', goal }])
    if (goal) {
      setPenaltyScore((current) => penaltyRole === 'executant'
        ? { ...current, user: current.user + 1 }
        : { ...current, opponent: current.opponent + 1 })
    }
    const positiveResult = penaltyRole === 'executant' ? goal : !goal
    const techniquePoints = penaltyTechniques.find((technique) => technique.id === penaltyTechnique)?.points ?? 15
    setArenaPoints((current) => current + (positiveResult ? (penaltyRole === 'portar' ? 20 : techniquePoints) : 3))
    play(positiveResult ? 'success' : 'toggle')
  }

  const continuePenaltyDuel = () => {
    setPenaltyResolution(null)
    setPenaltyTurn((current) => Math.min(10, current + 1))
    play('toggle')
  }

  const answerArenaQuiz = (answer: number) => {
    if (quizAnswer !== null) return
    setQuizAnswer(answer)
    if (answer === tribuneQuiz.correct) setArenaPoints((current) => current + 40)
    play(answer === tribuneQuiz.correct ? 'success' : 'toggle')
  }

  const guessArenaPlayer = (answer: number) => {
    if (playerGuess === arenaPlayerChallenge.correct) return
    setPlayerGuess(answer)
    if (answer === arenaPlayerChallenge.correct) {
      setArenaPoints((current) => current + Math.max(15, 50 - ((revealedClues - 1) * 15)))
      play('success')
      return
    }
    setRevealedClues((current) => Math.min(arenaPlayerChallenge.clues.length, current + 1))
    play('toggle')
  }

  const selectTimelineEvent = (eventId: string) => {
    setTimelineChecked(false)
    setTimelineOrder((current) => current.includes(eventId)
      ? current.filter((id) => id !== eventId)
      : [...current, eventId])
    play('toggle')
  }

  const checkArenaTimeline = () => {
    if (timelineOrder.length !== arenaTimelineEvents.length) return
    setTimelineChecked(true)
    if (timelineCorrect) setArenaPoints((current) => current + 45)
    play(timelineCorrect ? 'success' : 'toggle')
  }

  const resetArenaTimeline = () => {
    setTimelineOrder([])
    setTimelineChecked(false)
    play('toggle')
  }

  const startMemoryPrompt = () => {
    setComposerText('Prima mea amintire de pe Areni este ')
    setComposerLabel('Din tribună')
    setComposerMode('mesaj')
    openComposer()
  }

  return (
    <section className={`${styles.view} ${styles.tribuneView}`}>
      <ViewIntro code="TRI–01" label="Comunitatea Cetății" title="Aici vorbește" accent="Suceava." />

      <div className={styles.tribuneLayout}>
        <motion.section className={styles.tribuneFeedColumn} variants={reveal} initial="hidden" animate="visible" custom={0.05}>
          <header className={styles.tribuneFeedHeader}>
            <div>
              <span><i /> Zidul Cetății</span>
              <strong>Tot ce contează pentru suporteri.</strong>
            </div>
            <div className={styles.tribuneFeedStatus}>
              <span><Wifi aria-hidden="true" /> Zid sincronizat</span>
              <strong>{totalContributions} contribuții</strong>
            </div>
          </header>

          <section className={styles.tribuneComposerDock} aria-label="Creează o postare">
            <div className={styles.tribuneComposerPrompt}>
              <span className={styles.tribuneAvatar}>SC</span>
              <button type="button" onClick={() => openComposerFor('mesaj')}>
                {composerText.trim() ? 'Ai o ciornă salvată. Deschide editorul.' : 'La ce te gândești?'}</button>
            </div>
            <footer>
              <button type="button" onClick={() => openComposerFor('mesaj', 'Discuție')}><MessageCircle aria-hidden="true" /> Discuție</button>
              <button type="button" onClick={() => openComposerFor('fotografie', 'Din tribună')}><ImagePlus aria-hidden="true" /> Foto / video</button>
              <button type="button" onClick={startMemoryPrompt}><Sparkles aria-hidden="true" /> Poveste din Areni</button>
            </footer>
          </section>

          <div className={styles.tribuneFeedToolbar}>
            <div className={styles.tribuneFilters} role="group" aria-label="Filtrează mesajele">
              {tribuneFilters.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={filter === item ? styles.tribuneFilterActive : ''}
                  onClick={() => { setFilter(item); play('toggle') }}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className={styles.tribuneSorts} role="group" aria-label="Ordonează mesajele">
              <span>Ordine</span>
              {tribuneSorts.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={feedSort === item ? styles.tribuneSortActive : ''}
                  onClick={() => { setFeedSort(item); play('toggle') }}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <AppScrollArea className={styles.tribuneFeedScroll} contentClassName={styles.tribuneFeed} label="Fluxul comunității">
            {(filter === 'Toate' || filter === 'Oficial') && (
              <article className={`${styles.tribunePost} ${styles.tribunePollPost}`} style={{ '--post-tone': 'var(--tone-violet)' } as CSSProperties}>
                <header className={styles.tribunePostHeader}>
                  <span className={styles.tribunePostAvatar}><img src={fanEmblem} alt="" /></span>
                  <span className={styles.tribunePostAuthor}>
                    <strong>Cetatea Suceava <BadgeCheck aria-label="Cont oficial" /></strong>
                    <small>Sondaj oficial · activ astăzi</small>
                  </span>
                  <em>Sondaj</em>
                </header>
                <p>Ce a definit victoria de la Târgu Mureș?</p>
                <div className={styles.tribunePollOptions}>
                  {tribunePollOptions.map((option, index) => {
                    const percentage = Math.round((pollScores[index] / pollTotal) * 100)
                    return (
                      <button
                        type="button"
                        key={option}
                        className={pollVote === index ? styles.tribunePollSelected : ''}
                        onClick={() => selectPollVote(index)}
                      >
                        <i style={{ '--poll-width': pollVote === null ? '0%' : `${percentage}%` } as CSSProperties} />
                        <span>{option}</span>
                        <b>{pollVote === null ? 'ALEGE' : `${percentage}%`}</b>
                      </button>
                    )
                  })}
                </div>
                <div className={styles.tribunePollMeta}>
                  <span><BarChart3 aria-hidden="true" /> {pollTotal} voturi în comunitate</span>
                  <small>{pollVote === null ? 'Rezultatele apar după vot' : 'Vot înregistrat · îl poți schimba'}</small>
                </div>
              </article>
            )}

            <AnimatePresence initial={false}>
              {visiblePosts.map((post, index) => {
                const postComments = comments[post.id] ?? []
                const latestComment = postComments.at(-1)
                const reaction = reactions[post.id]
                const bookmarked = Boolean(bookmarks[post.id])
                return (
                  <motion.article
                    layout
                    id={`tribuna-${post.id}`}
                    key={post.id}
                    className={`${styles.tribunePost} ${post.pinned ? styles.tribunePostPinned : ''}`}
                    style={{ '--post-tone': post.tone } as CSSProperties}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: Math.min(index * 0.035, 0.12) }}
                  >
                    {post.pinned && (
                      <div className={styles.tribunePinnedFlag}>
                        <Sparkles aria-hidden="true" /><strong>Fixat de club</strong><span>Conversația principală</span>
                      </div>
                    )}
                    <header className={styles.tribunePostHeader}>
                      <span className={styles.tribunePostAvatar}>{post.official ? <img src={fanEmblem} alt="" /> : post.initials}</span>
                      <span className={styles.tribunePostAuthor}>
                        <strong>{post.author}{post.official && <BadgeCheck aria-label="Cont oficial" />}</strong>
                        <small>{post.role} · {post.time}</small>
                      </span>
                      {post.label && <em>{post.label}</em>}
                    </header>
                    <p>{post.text}</p>
                    {post.image && (
                      <div className={styles.tribunePostMedia}>
                        <img src={post.image} alt="Atmosferă alb-albastră la Stadionul Areni" />
                        <span><ImagePlus aria-hidden="true" /> Din comunitate</span>
                      </div>
                    )}
                    <footer>
                      <div className={styles.tribuneReactionDeck}>
                        <span>{post.reactionBase + (reaction ? 1 : 0)} reacții</span>
                        <div role="group" aria-label={`Reacționează la postarea lui ${post.author}`}>
                          <button type="button" className={reaction === 'inima' ? styles.tribuneReacted : ''} aria-pressed={reaction === 'inima'} onClick={() => toggleReaction(post.id, 'inima')} aria-label="Inimă"><Heart aria-hidden="true" fill={reaction === 'inima' ? 'currentColor' : 'none'} /></button>
                          <button type="button" className={reaction === 'foc' ? styles.tribuneReactedFire : ''} aria-pressed={reaction === 'foc'} onClick={() => toggleReaction(post.id, 'foc')} aria-label="Foc"><Flame aria-hidden="true" fill={reaction === 'foc' ? 'currentColor' : 'none'} /></button>
                          <button type="button" className={reaction === 'forta' ? styles.tribuneReactedForce : ''} aria-pressed={reaction === 'forta'} onClick={() => toggleReaction(post.id, 'forta')} aria-label="Forță"><Zap aria-hidden="true" fill={reaction === 'forta' ? 'currentColor' : 'none'} /></button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => openPost(post.id)}
                      >
                        <MessageCircle aria-hidden="true" />
                        <span>Discuție</span>
                        <b>{post.commentBase + postComments.length}</b>
                      </button>
                      <button
                        type="button"
                        className={bookmarked ? styles.tribuneBookmarked : ''}
                        aria-pressed={bookmarked}
                        onClick={() => toggleBookmark(post.id)}
                      >
                        <Bookmark aria-hidden="true" fill={bookmarked ? 'currentColor' : 'none'} />
                        <span>{bookmarked ? 'Salvat' : 'Salvează'}</span>
                      </button>
                    </footer>
                    {latestComment && (
                      <button type="button" className={styles.tribuneCommentPreview} onClick={() => openPost(post.id)}>
                        <span>{latestComment.author.slice(0, 2).toUpperCase()}</span>
                        <span>
                          <strong>{latestComment.author}</strong>
                          <small>{latestComment.text}</small>
                        </span>
                        <ChevronRight aria-hidden="true" />
                      </button>
                    )}
                    <form className={styles.tribuneQuickReply} onSubmit={(event) => submitQuickComment(event, post.id)}>
                      <span>SC</span>
                      <input
                        type="text"
                        value={quickCommentDrafts[post.id] ?? ''}
                        maxLength={180}
                        aria-label={`Răspunde la postarea lui ${post.author}`}
                        placeholder="Scrie un răspuns..."
                        onChange={(event) => setQuickCommentDrafts((current) => ({ ...current, [post.id]: event.target.value }))}
                      />
                      <button type="submit" disabled={!quickCommentDrafts[post.id]?.trim()} aria-label="Trimite răspunsul">
                        <Send aria-hidden="true" />
                      </button>
                    </form>
                  </motion.article>
                )
              })}
            </AnimatePresence>

            {visiblePosts.length === 0 && (
              <div className={styles.tribuneEmpty}>
                <Search aria-hidden="true" />
                <strong>Niciun mesaj în filtrul acesta.</strong>
                <button type="button" onClick={() => setFilter('Toate')}>Vezi tot Zidul</button>
              </div>
            )}
          </AppScrollArea>
        </motion.section>

        <motion.div className={styles.tribuneArenaShell} variants={reveal} initial="hidden" animate="visible" custom={0.13}>
          <AppScrollArea className={styles.tribuneArenaScroll} contentClassName={styles.tribuneActiveRail} label="Arena Tribunei">
            <header className={styles.tribuneArenaHeader}>
              <div>
                <span><Gamepad2 aria-hidden="true" /> Arena Tribunei</span>
                <strong>Joacă, provoacă și urcă în Liga Suporterilor.</strong>
              </div>
              <span><i /> 126 jucători activi</span>
            </header>

            <section className={styles.arenaGameStage} style={{ '--arena-game-tone': activeArenaDefinition.tone } as CSSProperties}>
              <header className={styles.arenaStageHeader}>
                <span><ActiveArenaIcon aria-hidden="true" /></span>
                <div><small>Joc activ</small><strong>{activeArenaDefinition.label}</strong></div>
                <em><Trophy aria-hidden="true" /> {arenaPoints} puncte</em>
              </header>

              {activeArenaGame === 'penalty' && (
                <div className={styles.penaltyGame}>
                  <div className={styles.penaltyModeSwitch} role="group" aria-label="Alege adversarul">
                    <button type="button" className={penaltyOpponent === 'suporter' ? styles.penaltyModeActive : ''} onClick={() => resetPenaltyDuel('suporter')}><UsersRound aria-hidden="true" /> Suporter</button>
                    <button type="button" className={penaltyOpponent === 'calculator' ? styles.penaltyModeActive : ''} onClick={() => resetPenaltyDuel('calculator')}><Shield aria-hidden="true" /> Străjerul</button>
                  </div>

                  <div className={styles.penaltyScoreboard}>
                    <span><small>Tu</small><strong>{penaltyScore.user}</strong><i>{penaltyHistory.filter((item) => item.side === 'user').map((item, index) => <b key={index} className={item.goal ? styles.penaltyGoalMark : styles.penaltyMissMark} />)}</i></span>
                    <em><b>Runda {penaltyRound}/5</b><small>{penaltyOpponent === 'suporter' ? 'Duel asincron' : 'Contra calculatorului'}</small></em>
                    <span><small>{penaltyOpponent === 'suporter' ? 'Mara / Areni' : 'Străjerul'}</small><strong>{penaltyScore.opponent}</strong><i>{penaltyHistory.filter((item) => item.side === 'opponent').map((item, index) => <b key={index} className={item.goal ? styles.penaltyGoalMark : styles.penaltyMissMark} />)}</i></span>
                  </div>

                  <div className={styles.penaltyPlayOptions}>
                    {penaltyRole === 'executant' ? (
                      <div className={styles.penaltyTechniques} role="group" aria-label="Alege tehnica șutului">
                        {penaltyTechniques.map((technique) => (
                          <button type="button" key={technique.id} title={technique.hint} disabled={Boolean(penaltyResolution)} className={penaltyTechnique === technique.id ? styles.penaltyTechniqueActive : ''} onClick={() => { setPenaltyTechnique(technique.id); play('toggle') }}>
                            <strong>{technique.label}</strong><small>{technique.detail} · +{technique.points}</small>
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className={styles.penaltyKeeperBrief}><Eye aria-hidden="true" /><span><strong>Citește executantul</strong><small>Alege colțul înaintea șutului.</small></span></div>
                    )}
                    <div className={styles.penaltyMomentum}>
                      <span><small>Pulsul peluzei</small><em>{penaltyMomentum}%</em></span>
                      <i><b style={{ width: `${penaltyMomentum}%` }} /></i>
                      <small>Serie personală: <b>{penaltyStreak}</b></small>
                    </div>
                  </div>

                  <div className={styles.penaltyGoalScene}>
                    <div className={styles.penaltyGoalFrame} aria-label={penaltyRole === 'executant' ? 'Alege unde tragi' : 'Alege unde plonjezi'}>
                      <i className={styles.penaltyNet} aria-hidden="true" />
                      <span className={styles.penaltyGoalVenue} aria-hidden="true">ARENI · POARTA NORD</span>
                      <span className={styles.penaltyCrowd} aria-hidden="true">
                        {[12, 20, 9, 24, 15, 22, 11, 19, 25, 13, 21, 16, 23, 10, 18, 24, 14, 22].map((height, index) => <i key={`${height}-${index}`} style={{ '--fan-height': `${height}px` } as CSSProperties} />)}
                      </span>
                      <motion.span
                        className={styles.penaltyKeeper}
                        aria-hidden="true"
                        animate={{ left: `${penaltyKeeperZone?.x ?? 50}%`, top: `${penaltyKeeperZone?.y ?? 68}%`, x: '-50%', y: '-50%', rotate: penaltyKeeperZone ? (penaltyKeeperZone.x - 50) * .28 : 0 }}
                        transition={{ type: 'spring', stiffness: 260, damping: 21 }}
                      ><i /><b /></motion.span>
                      <motion.span
                        className={styles.penaltyBall}
                        aria-hidden="true"
                        animate={{ left: `${penaltyBallZone?.x ?? 50}%`, top: `${penaltyBallZone?.y ?? 88}%`, x: '-50%', y: '-50%', scale: penaltyBallZone ? .7 : 1 }}
                        transition={{ type: 'spring', stiffness: 310, damping: 24 }}
                      ><CircleDot /></motion.span>
                      <div className={styles.penaltyTargets}>
                        {penaltyZones.map((zone) => (
                          <button
                            type="button"
                            key={zone.id}
                            disabled={Boolean(penaltyResolution) || penaltyComplete}
                            className={penaltyResolution?.userChoice === zone.id ? styles.penaltyTargetSelected : ''}
                            style={{ '--zone-x': `${zone.x}%`, '--zone-y': `${zone.y}%` } as CSSProperties}
                            onClick={() => playPenaltyZone(zone.id)}
                            aria-label={`${penaltyRole === 'executant' ? 'Trage' : 'Plonjează'} ${zone.label.toLowerCase()}`}
                          >
                            <i /><span>{zone.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className={styles.penaltyInstruction}>
                      {penaltyComplete ? (
                        <>
                          <span><Medal aria-hidden="true" /></span>
                          <div><small>Duel încheiat</small><strong>{penaltyScore.user === penaltyScore.opponent ? 'Egalitate. Revanșa decide.' : penaltyScore.user > penaltyScore.opponent ? 'Ai câștigat duelul!' : 'Adversarul câștigă de data asta.'}</strong></div>
                          <button type="button" onClick={() => resetPenaltyDuel()}>Revanșă</button>
                        </>
                      ) : penaltyResolution ? (
                        <>
                          <span className={penaltyRole === 'executant' ? (penaltyResolution.goal ? styles.penaltyPositive : styles.penaltyNegative) : (!penaltyResolution.goal ? styles.penaltyPositive : styles.penaltyNegative)}>
                            {penaltyRole === 'executant' ? (penaltyResolution.goal ? <Zap /> : <Shield />) : (!penaltyResolution.goal ? <Shield /> : <CircleDot />)}
                          </span>
                          <div>
                            <small>{penaltyRole === 'executant' ? `Execuție ${penaltyTechnique}` : 'Tu în poartă'}</small>
                            <strong>{penaltyRole === 'executant' ? (penaltyResolution.goal ? 'GOL!' : 'Portarul a apărat.') : (!penaltyResolution.goal ? 'PARADĂ!' : 'Adversarul a înscris.')}</strong>
                          </div>
                          <button type="button" onClick={continuePenaltyDuel}>{penaltyTurn === 9 ? 'Rezultat' : penaltyRole === 'executant' ? 'Acum aperi' : 'Runda următoare'}</button>
                        </>
                      ) : (
                        <>
                          <span><Crosshair aria-hidden="true" /></span>
                          <div><small>{penaltyRole === 'executant' ? 'Ești executant' : 'Ești portar'}</small><strong>{penaltyRole === 'executant' ? 'Alege locul șutului.' : 'Anticipează și alege plonjonul.'}</strong></div>
                          <em>+{penaltyRole === 'executant' ? penaltyTechniques.find((technique) => technique.id === penaltyTechnique)?.points ?? 15 : 20} pct.</em>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {activeArenaGame === 'quiz' && (
                <div className={styles.arenaQuickChallenge}>
                  <span className={styles.arenaChallengeIndex}>01 / 05</span>
                  <small>Quiz Blitz · întrebarea zilei</small>
                  <h3>{tribuneQuiz.question}</h3>
                  <div className={styles.arenaAnswerGrid}>
                    {tribuneQuiz.options.map((option, index) => (
                      <button
                        type="button"
                        key={option}
                        className={quizAnswer === null ? '' : index === tribuneQuiz.correct ? styles.arenaAnswerCorrect : quizAnswer === index ? styles.arenaAnswerWrong : ''}
                        onClick={() => answerArenaQuiz(index)}
                      ><span>{String.fromCharCode(65 + index)}</span><strong>{option}</strong></button>
                    ))}
                  </div>
                  <footer>{quizAnswer === null ? <><Clock3 /> Răspunde pentru 40 de puncte.</> : quizAnswer === tribuneQuiz.correct ? <><Trophy /> Corect. Ai câștigat 40 de puncte.</> : <><Shield /> Răspunsul corect era 1932.</>}</footer>
                </div>
              )}

              {activeArenaGame === 'jucator' && (
                <div className={styles.arenaQuickChallenge}>
                  <span className={styles.arenaChallengeIndex}>{revealedClues} / {arenaPlayerChallenge.clues.length} indicii</span>
                  <small>Dosarul misterios</small>
                  <h3>Cine este jucătorul?</h3>
                  <div className={styles.arenaClues}>
                    {arenaPlayerChallenge.clues.slice(0, revealedClues).map((clue, index) => <span key={clue}><b>{index + 1}</b>{clue}</span>)}
                  </div>
                  <div className={styles.arenaAnswerGrid}>
                    {arenaPlayerChallenge.options.map((option, index) => (
                      <button
                        type="button"
                        key={option}
                        className={playerGuess === arenaPlayerChallenge.correct && index === arenaPlayerChallenge.correct ? styles.arenaAnswerCorrect : playerGuess === index ? styles.arenaAnswerWrong : ''}
                        onClick={() => guessArenaPlayer(index)}
                      ><span>{squad.find((player) => player.name === option)?.number ?? '?'}</span><strong>{option}</strong></button>
                    ))}
                  </div>
                  <footer>{playerGuess === arenaPlayerChallenge.correct ? <><Trophy /> Identificat. Punctele au fost adăugate.</> : <><Eye /> Un răspuns greșit dezvăluie încă un indiciu.</>}</footer>
                </div>
              )}

              {activeArenaGame === 'cronologie' && (
                <div className={styles.arenaQuickChallenge}>
                  <span className={styles.arenaChallengeIndex}>{timelineOrder.length} / {arenaTimelineEvents.length}</span>
                  <small>Cronologia Cetății</small>
                  <h3>Alege evenimentele de la cel mai vechi la cel mai nou.</h3>
                  <div className={styles.arenaTimelineOrder}>
                    {timelineOrder.length === 0 && <small>Ordinea ta va apărea aici.</small>}
                    {timelineOrder.map((eventId, index) => {
                      const event = arenaTimelineEvents.find((item) => item.id === eventId)
                      return <span key={eventId}><b>{index + 1}</b>{event?.label}</span>
                    })}
                  </div>
                  <div className={styles.arenaTimelineChoices}>
                    {arenaTimelineEvents.map((event) => (
                      <button type="button" key={event.id} disabled={timelineOrder.includes(event.id)} onClick={() => selectTimelineEvent(event.id)}>{event.label}</button>
                    ))}
                  </div>
                  <footer>
                    <span>{timelineChecked ? (timelineCorrect ? 'Ordine perfectă · +45 puncte' : 'Ordinea nu este corectă.') : 'Completează cele trei poziții.'}</span>
                    {timelineChecked && !timelineCorrect ? <button type="button" onClick={resetArenaTimeline}>Încearcă din nou</button> : <button type="button" disabled={timelineOrder.length !== arenaTimelineEvents.length || timelineChecked} onClick={checkArenaTimeline}>Verifică</button>}
                  </footer>
                </div>
              )}
            </section>

            <section className={styles.arenaGameLibrary}>
              <header><span><Swords aria-hidden="true" /> Alege provocarea</span><em>4 jocuri</em></header>
              <div>
                {tribuneArenaGames.map((game) => {
                  const GameIcon = game.icon
                  return (
                    <button type="button" key={game.id} className={activeArenaGame === game.id ? styles.arenaGameSelected : ''} style={{ '--game-tone': game.tone } as CSSProperties} onClick={() => selectArenaGame(game.id)}>
                      <span><GameIcon aria-hidden="true" /></span>
                      <strong>{game.label}</strong>
                      <small>{game.detail}</small>
                      <i><ChevronRight aria-hidden="true" /></i>
                    </button>
                  )
                })}
              </div>
            </section>

            <section className={styles.arenaLeague}>
              <header><span><Medal aria-hidden="true" /> Liga Suporterilor</span><em>Săptămâna 03</em></header>
              <div>
                {arenaLeaderboard.map((player) => (
                  <span key={player.name}><b>{player.position}</b><strong>{player.name}</strong><em>{player.points}</em></span>
                ))}
              </div>
              <footer>
                <span><b>{arenaUserRank}</b><strong>Tu</strong></span>
                <em>{arenaPoints} pct.</em>
                <i><b style={{ width: `${Math.min(100, Math.round((arenaPoints / 900) * 100))}%` }} /></i>
                <small>{arenaPoints >= 900 ? 'Ai intrat în lupta pentru Top 10.' : `${900 - arenaPoints} pct. până la Top 10`}</small>
              </footer>
            </section>

            <section className={styles.arenaMissions}>
              <header>
                <span><Star aria-hidden="true" /> Misiunile zilei</span>
                <em>{arenaMissionProgress}/3</em>
              </header>
              <div>
                <button type="button" className={penaltyHistory.length > 0 ? styles.arenaMissionDone : ''} onClick={() => selectArenaGame('penalty')}>
                  <CircleDot aria-hidden="true" /><span><strong>Intră într-un duel</strong><small>Joacă prima fază</small></span><em>{penaltyHistory.length > 0 ? 'GATA' : '+20'}</em>
                </button>
                <button type="button" className={quizAnswer !== null ? styles.arenaMissionDone : ''} onClick={() => selectArenaGame('quiz')}>
                  <Zap aria-hidden="true" /><span><strong>Răspuns fulger</strong><small>Încheie Quiz Blitz</small></span><em>{quizAnswer !== null ? 'GATA' : '+40'}</em>
                </button>
                <button type="button" className={playerGuess === arenaPlayerChallenge.correct || (timelineChecked && timelineCorrect) ? styles.arenaMissionDone : ''} onClick={() => selectArenaGame('jucator')}>
                  <Shield aria-hidden="true" /><span><strong>Detectivul lotului</strong><small>Identifică jucătorul</small></span><em>{playerGuess === arenaPlayerChallenge.correct || (timelineChecked && timelineCorrect) ? 'GATA' : '+50'}</em>
                </button>
              </div>
            </section>
          </AppScrollArea>
        </motion.div>
      </div>

      <AnimatePresence>
        {composerOpen && (
          <motion.div
            className={styles.tribuneOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => { if (event.target === event.currentTarget) setComposerOpen(false) }}
          >
            <motion.div
              className={styles.tribuneComposer}
              role="dialog"
              aria-modal="true"
              aria-label="Publică pe Zidul Cetății"
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
            >
              <form className={styles.tribuneComposerForm} onSubmit={publishPost}>
                <AppScrollArea className={styles.tribuneComposerScroll} contentClassName={styles.tribuneComposerBody} label="Editorul postării">
                  <header className={styles.tribuneDialogHeader}>
                    <strong>Creează o postare</strong>
                    <button type="button" onClick={() => setComposerOpen(false)} aria-label="Închide"><X /></button>
                  </header>

                  <div className={styles.tribuneComposerIdentity}>
                    <span>SC</span>
                    <div>
                      <strong>Suporter Cetatea</strong>
                      <button type="button" aria-label="Vizibilitate: toată comunitatea">
                        <UsersRound aria-hidden="true" /> Toată Tribuna
                      </button>
                    </div>
                  </div>

                  <div className={styles.tribuneComposerField}>
                    <textarea
                      autoFocus
                      value={composerText}
                      maxLength={420}
                      onChange={(event) => setComposerText(event.target.value)}
                      placeholder="La ce te gândești?"
                    />
                  </div>

                  {composerMode === 'fotografie' && !composerImage && (
                    <label className={styles.tribunePhotoDrop} htmlFor="tribune-photo-input">
                      <ImagePlus aria-hidden="true" />
                      <span><strong>Adaugă fotografii sau video</strong><small>JPG, PNG sau WEBP · maximum 900 KB</small></span>
                    </label>
                  )}
                  {composerImage && (
                    <div className={styles.tribuneComposerPreview}>
                      <img src={composerImage} alt="Previzualizarea fotografiei selectate" />
                      <button type="button" onClick={() => setComposerImage('')} aria-label="Elimină fotografia"><X /></button>
                    </div>
                  )}
                  {composerError && <p className={styles.tribuneComposerError}>{composerError}</p>}

                  <div className={styles.tribuneComposerTags}>
                    <span>Subiect</span>
                    <div>
                      {tribunePostLabels.map((label) => (
                        <button
                          type="button"
                          key={label}
                          className={composerLabel === label ? styles.tribuneComposerTagActive : ''}
                          onClick={() => setComposerLabel(label)}
                        >
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <input id="tribune-photo-input" className={styles.tribuneFileInput} type="file" accept="image/*" onChange={handlePhoto} />
                  <div className={styles.tribuneAddToPost}>
                    <strong>Adaugă la postare</strong>
                    <div>
                      <label htmlFor="tribune-photo-input" title="Adaugă foto sau video">
                        <ImagePlus aria-hidden="true" /><span>Foto / video</span>
                      </label>
                      <button type="button" onClick={() => setComposerLabel('Discuție')} title="Pornește o discuție">
                        <MessageCircle aria-hidden="true" /><span>Discuție</span>
                      </button>
                      <button type="button" onClick={() => setComposerLabel('Din tribună')} title="Poveste din tribună">
                        <Sparkles aria-hidden="true" /><span>Din tribună</span>
                      </button>
                    </div>
                  </div>

                  <footer className={styles.tribuneComposerActions}>
                    <small>{composerText.length} / 420</small>
                    <button type="submit" disabled={!composerText.trim()}>Postează</button>
                  </footer>
                </AppScrollArea>
              </form>
            </motion.div>
          </motion.div>
        )}

        {activePost && (
          <motion.div
            className={styles.tribuneOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => { if (event.target === event.currentTarget) setActivePostId(null) }}
          >
            <motion.aside
              className={styles.tribuneThread}
              role="dialog"
              aria-modal="true"
              aria-label={`Discuție: ${activePost.author}`}
              initial={{ opacity: 0, y: 24, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 18, scale: 0.98 }}
            >
              <header className={styles.tribuneDialogHeader}>
                <strong>Postarea lui {activePost.author}</strong>
                <button type="button" onClick={() => setActivePostId(null)} aria-label="Închide"><X /></button>
              </header>
              <section className={styles.tribuneThreadSource} style={{ '--post-tone': activePost.tone } as CSSProperties}>
                <header>
                  <span className={styles.tribunePostAvatar}>{activePost.official ? <img src={fanEmblem} alt="" /> : activePost.initials}</span>
                  <span>
                    <strong>{activePost.author}{activePost.official && <BadgeCheck aria-label="Cont oficial" />}</strong>
                    <small>{activePost.role} · {activePost.time}</small>
                  </span>
                  {activePost.label && <em>{activePost.label}</em>}
                </header>
                <p>{activePost.text}</p>
                <footer>
                  <div className={styles.tribuneThreadReactionChoices} role="group" aria-label="Alege o reacție">
                    <button type="button" className={activePostReaction === 'inima' ? styles.tribuneReacted : ''} aria-pressed={activePostReaction === 'inima'} onClick={() => toggleReaction(activePost.id, 'inima')}><Heart aria-hidden="true" fill={activePostReaction === 'inima' ? 'currentColor' : 'none'} /></button>
                    <button type="button" className={activePostReaction === 'foc' ? styles.tribuneReactedFire : ''} aria-pressed={activePostReaction === 'foc'} onClick={() => toggleReaction(activePost.id, 'foc')}><Flame aria-hidden="true" fill={activePostReaction === 'foc' ? 'currentColor' : 'none'} /></button>
                    <button type="button" className={activePostReaction === 'forta' ? styles.tribuneReactedForce : ''} aria-pressed={activePostReaction === 'forta'} onClick={() => toggleReaction(activePost.id, 'forta')}><Zap aria-hidden="true" fill={activePostReaction === 'forta' ? 'currentColor' : 'none'} /></button>
                    <b>{activePost.reactionBase + (activePostReaction ? 1 : 0)}</b>
                  </div>
                  <span><MessageCircle aria-hidden="true" /> {activePost.commentBase + activePostComments.length} contribuții</span>
                  <button
                    type="button"
                    className={bookmarks[activePost.id] ? styles.tribuneBookmarked : ''}
                    aria-pressed={Boolean(bookmarks[activePost.id])}
                    onClick={() => toggleBookmark(activePost.id)}
                  >
                    <Bookmark aria-hidden="true" fill={bookmarks[activePost.id] ? 'currentColor' : 'none'} />
                    {bookmarks[activePost.id] ? 'Salvat' : 'Salvează'}
                  </button>
                </footer>
              </section>
              <div className={styles.tribuneThreadHeading}>
                <span>Comentarii</span>
                <small>{activePostComments.length === 1 ? '1 răspuns afișat' : `${activePostComments.length} răspunsuri afișate`}</small>
              </div>
              <AppScrollArea className={styles.tribuneCommentsScroll} contentClassName={styles.tribuneComments} label="Comentariile postării">
                {activePostComments.map((comment) => (
                  <article key={comment.id}>
                    <span>{comment.author.slice(0, 2).toUpperCase()}</span>
                    <div><strong>{comment.author}<small>{comment.time}</small></strong><p>{comment.text}</p></div>
                  </article>
                ))}
                {activePostComments.length === 0 && (
                  <div className={styles.tribuneNoComments}><MessageCircle /><span><strong>Deschide tu discuția.</strong><small>Primul comentariu poate da tonul.</small></span></div>
                )}
              </AppScrollArea>
              <form onSubmit={submitComment}>
                <span className={styles.tribuneReplyAvatar}>SC</span>
                <div className={styles.tribuneReplyField}>
                  <input
                    autoFocus
                    value={commentDraft}
                    onChange={(event) => setCommentDraft(event.target.value)}
                    placeholder="Scrie un răspuns…"
                    maxLength={240}
                  />
                  <small>{commentDraft.length}/240</small>
                </div>
                <button type="submit" disabled={!commentDraft.trim()} aria-label="Trimite comentariul"><Send /></button>
              </form>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

type HeritageEra = {
  year: string
  eyebrow: string
  title: string
  story: string
  facts: string[]
  tone: string
}

const heritageEras: HeritageEra[] = [
  {
    year: '1932',
    eyebrow: 'Începutul organizat',
    title: 'Cetatea Sucevei primește un nume și o echipă.',
    story: 'Numele inspirat de Cetatea de Scaun intră în fotbalul organizat. Echipa pornește în Liga de Est, apoi ajunge în noua Divizie C.',
    facts: ['Primul club organizat', 'Liga de Est', 'Rădăcini sucevene'],
    tone: 'var(--tone-cyan)',
  },
  {
    year: '1937–38',
    eyebrow: 'Prima confirmare',
    title: 'Locul secund în Seria a II-a Est.',
    story: 'La numai câțiva ani de la fondare, Cetatea încheie pe poziția a doua și își confirmă statutul de formație competitivă a regiunii.',
    facts: ['Divizia C', 'Seria a II-a Est', 'Locul 2'],
    tone: 'var(--tone-green)',
  },
  {
    year: '1950–57',
    eyebrow: 'Fotbalul renaște',
    title: 'Din Burdujeni spre centrul Sucevei.',
    story: 'Spartac Burdujeni promovează în Divizia B în 1954. Trei ani mai târziu se mută la Suceava și devine Progresul, deschizând o nouă etapă.',
    facts: ['Promovare în 1954', 'Mutare în 1957', 'Progresul Suceava'],
    tone: 'var(--tone-violet)',
  },
  {
    year: '1972–88',
    eyebrow: 'Vârful unei generații',
    title: 'CSM Suceava ajunge pe prima scenă.',
    story: 'Clubul Sportiv Municipal este înființat la 19 iulie 1972. Apogeul vine în 1987, odată cu promovarea în Divizia A și sezonul jucat între marile echipe ale țării.',
    facts: ['CSM din 1972', 'Promovare în 1987', 'Divizia A'],
    tone: 'var(--tone-amber)',
  },
  {
    year: '2004–10',
    eyebrow: 'Cetatea revine',
    title: 'Un nou club-fanion, o poveste întreruptă.',
    story: 'Cetatea Suceava este reînființată în 2004 și ajunge în eșalonul secund. Instabilitatea financiară duce însă la excluderea și dizolvarea clubului în 2010.',
    facts: ['Reînființare', 'Eșalonul secund', 'Final în 2010'],
    tone: 'var(--tone-rose)',
  },
  {
    year: '2024–azi',
    eyebrow: 'Cetatea se ridică din nou',
    title: 'Orașul își adună fotbalul sub același simbol.',
    story: 'CSM Cetatea 1932 Suceava renaște în vara lui 2024. Câștigă Liga a IV-a și barajul cu AS Bârsănești în primul sezon, iar în 2026 ajunge din nou în Liga a II-a.',
    facts: ['Proiect comun', 'Promovare imediată', 'Liga a II-a 2026'],
    tone: 'var(--tone-cyan)',
  },
]

const heritageChants = [
  {
    title: 'Sub ziduri alb-albastre',
    mood: 'Imnul intrării',
    tempo: '84 BPM',
    lines: ['Sub ziduri alb-albastre,', 'orașul cântă iar,', 'Cetatea merge înainte,', 'Suceava până la final!'],
  },
  {
    title: 'Din Areni până-n Cetate',
    mood: 'Chemare și răspuns',
    tempo: '96 BPM',
    lines: ['Din Areni până-n Cetate,', 'alb și-albastru peste toate,', 'glasul nostru nu va sta,', 'hai, Suceava, luptă iar!'],
  },
  {
    title: 'Nimeni nu ne frânge',
    mood: 'Final de meci',
    tempo: '108 BPM',
    lines: ['Când Cetatea intră-n joc,', 'toată peluza ia foc,', 'nouăzeci de minute cântăm,', 'lângă tine noi rămânem!'],
  },
]

const heritageNames = ['Cetatea Sucevei', 'Spartac', 'Progresul', 'Victoria', 'Dinamo', 'Viitorul', 'Chimia', 'CSM Suceava', 'Bucovina', 'Foresta', 'Cetatea 1932']

export function HeritageView() {
  const { play } = useSound()
  const [eraIndex, setEraIndex] = useState(0)
  const [chantIndex, setChantIndex] = useState(0)
  const [chantPlaying, setChantPlaying] = useState(false)
  const [chantLine, setChantLine] = useState(0)
  const [supportedChants, setSupportedChants] = useState<Record<number, boolean>>(
    () => readStoredRecord('cetatea-mostenire-cantari', {}),
  )
  const [memoryDraft, setMemoryDraft] = useState('')
  const [savedMemory, setSavedMemory] = useState(() => localStorage.getItem('cetatea-mostenire-amintire') ?? '')

  const activeEra = heritageEras[eraIndex]
  const activeChant = heritageChants[chantIndex]

  useEffect(() => {
    if (!chantPlaying) return
    const lineTimer = window.setInterval(() => {
      setChantLine((current) => (current + 1) % activeChant.lines.length)
    }, 1450)
    return () => window.clearInterval(lineTimer)
  }, [activeChant.lines.length, chantPlaying])

  const selectHeritageEra = (index: number) => {
    setEraIndex(index)
    play('toggle')
  }

  const selectHeritageChant = (index: number) => {
    setChantIndex(index)
    setChantLine(0)
    setChantPlaying(false)
    play('toggle')
  }

  const toggleChant = () => {
    setChantPlaying((current) => !current)
    play('toggle')
  }

  const supportChant = () => {
    setSupportedChants((current) => {
      const next = { ...current, [chantIndex]: !current[chantIndex] }
      localStorage.setItem('cetatea-mostenire-cantari', JSON.stringify(next))
      return next
    })
    play('success')
  }

  const saveHeritageMemory = (event: FormEvent) => {
    event.preventDefault()
    const memory = memoryDraft.trim()
    if (!memory) return
    localStorage.setItem('cetatea-mostenire-amintire', memory)
    setSavedMemory(memory)
    setMemoryDraft('')
    play('success')
  }

  return (
    <section className={`${styles.view} ${styles.heritageView}`}>
      <ViewIntro code="MOȘ–1932" label="Arhiva vie a suporterilor" title="Tot ce rămâne" accent="după fluier." />

      <div className={styles.heritageLayout}>
        <motion.section className={styles.heritageChronicle} variants={reveal} initial="hidden" animate="visible" custom={0.05}>
          <header className={styles.heritageSectionHeader}>
            <div><span><BookOpen aria-hidden="true" /> Firul istoriei</span><strong>Șase porți către trecutul fotbalului sucevean.</strong></div>
            <em>{String(eraIndex + 1).padStart(2, '0')} / {String(heritageEras.length).padStart(2, '0')}</em>
          </header>

          <div className={styles.heritageEraRail} role="tablist" aria-label="Momentele istoriei Cetății">
            {heritageEras.map((era, index) => (
              <button type="button" role="tab" key={era.year} aria-selected={eraIndex === index} className={eraIndex === index ? styles.heritageEraActive : ''} onClick={() => selectHeritageEra(index)}>
                <i /><strong>{era.year}</strong><small>{era.eyebrow}</small>
              </button>
            ))}
          </div>

          <AnimatePresence mode="wait">
            <motion.article
              key={activeEra.year}
              className={styles.heritageEraStage}
              style={{ '--heritage-tone': activeEra.tone } as CSSProperties}
              initial={{ opacity: 0, x: 18 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: .3, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className={styles.heritageGhostYear} aria-hidden="true">{activeEra.year}</span>
              <div className={styles.heritageEraCopy}>
                <small><Flag aria-hidden="true" /> {activeEra.eyebrow}</small>
                <strong>{activeEra.title}</strong>
                <p>{activeEra.story}</p>
              </div>
              <div className={styles.heritageEraFacts}>
                {activeEra.facts.map((fact, index) => <span key={fact}><b>0{index + 1}</b><strong>{fact}</strong></span>)}
              </div>
              <footer>
                <a href="https://cetateasuceava.com/istorie/" target="_blank" rel="noreferrer">Istoria oficială <ExternalLink aria-hidden="true" /></a>
                <div>
                  <button type="button" disabled={eraIndex === 0} onClick={() => selectHeritageEra(eraIndex - 1)} aria-label="Momentul anterior"><ChevronLeft /></button>
                  <i><b style={{ width: `${((eraIndex + 1) / heritageEras.length) * 100}%` }} /></i>
                  <button type="button" disabled={eraIndex === heritageEras.length - 1} onClick={() => selectHeritageEra(eraIndex + 1)} aria-label="Momentul următor"><ChevronRight /></button>
                </div>
              </footer>
            </motion.article>
          </AnimatePresence>

          <footer className={styles.heritageNames}>
            <span><History aria-hidden="true" /> Numele prin timp</span>
            <div>{heritageNames.map((name, index) => <span key={name}><b>{String(index + 1).padStart(2, '0')}</b>{name}</span>)}</div>
          </footer>
        </motion.section>

        <motion.aside className={styles.heritageSideShell} variants={reveal} initial="hidden" animate="visible" custom={0.13}>
          <AppScrollArea className={styles.heritageSideScroll} contentClassName={styles.heritageSide} label="Cântări, stadion și amintiri">
            <section className={styles.heritageChantbook}>
              <header className={styles.heritageSectionHeader}>
                <div><span><Mic2 aria-hidden="true" /> Caietul peluzei</span><strong>Cântări scrise pentru vocile Cetății.</strong></div>
                <em>COMUNITAR</em>
              </header>

              <div className={styles.heritageChantTabs} role="tablist" aria-label="Alege cântarea">
                {heritageChants.map((chant, index) => (
                  <button type="button" role="tab" key={chant.title} aria-selected={chantIndex === index} className={chantIndex === index ? styles.heritageChantTabActive : ''} onClick={() => selectHeritageChant(index)}>
                    <b>0{index + 1}</b><span><strong>{chant.title}</strong><small>{chant.mood}</small></span>
                  </button>
                ))}
              </div>

              <div className={`${styles.heritageChantStage} ${chantPlaying ? styles.heritageChantPlaying : ''}`}>
                <header><span><Headphones aria-hidden="true" /> Ghid de ritm</span><em>{activeChant.tempo}</em></header>
                <div className={styles.heritageChantLines} aria-live="polite">
                  {activeChant.lines.map((line, index) => <strong key={line} className={chantLine === index ? styles.heritageChantLineActive : ''}><b>{index + 1}</b>{line}</strong>)}
                </div>
                <span className={styles.heritageEqualizer} aria-hidden="true">
                  {[36, 72, 48, 92, 58, 81, 44, 68, 96, 52, 77, 41, 88, 61, 74, 46, 84, 56].map((height, index) => <i key={`${height}-${index}`} style={{ '--chant-bar': `${height}%` } as CSSProperties} />)}
                </span>
                <footer>
                  <button type="button" className={styles.heritagePlayButton} onClick={toggleChant}>{chantPlaying ? <Pause /> : <Play />}<span>{chantPlaying ? 'Oprește repetiția' : 'Repetă scandarea'}</span></button>
                  <button type="button" className={supportedChants[chantIndex] ? styles.heritageChantSupported : ''} aria-pressed={Boolean(supportedChants[chantIndex])} onClick={supportChant}><Heart fill={supportedChants[chantIndex] ? 'currentColor' : 'none'} /><span>{supportedChants[chantIndex] ? 'În caietul meu' : 'Păstrează'}</span></button>
                </footer>
              </div>
            </section>

            <div className={styles.heritageLowerGrid}>
              <section className={styles.heritageAreni}>
                <img src={arenaBackground} alt="Atmosferă nocturnă inspirată de Stadionul Areni" />
                <div>
                  <span><Castle aria-hidden="true" /> Casa Cetății</span>
                  <strong>Stadionul Areni</strong>
                  <p>Inaugurat în 1963. Aici s-a jucat inclusiv sezonul de Divizia A din 1987–1988.</p>
                  <footer><span><b>1963</b><small>inaugurare</small></span><span><b>≈12.500</b><small>locuri</small></span><a href="https://cetateasuceava.com/stadion/" target="_blank" rel="noreferrer" aria-label="Pagina oficială a Stadionului Areni"><ExternalLink /></a></footer>
                </div>
              </section>

              <section className={styles.heritageMemory}>
                <header><span><Quote aria-hidden="true" /> Arhiva ta</span><em>PE ACEST DISPOZITIV</em></header>
                {savedMemory ? (
                  <blockquote><p>„{savedMemory}”</p><footer><span>Amintire păstrată</span><button type="button" onClick={() => { setMemoryDraft(savedMemory); setSavedMemory(''); play('toggle') }}>Editează</button></footer></blockquote>
                ) : (
                  <form onSubmit={saveHeritageMemory}>
                    <label htmlFor="heritage-memory">Care este prima ta amintire de pe Areni?</label>
                    <textarea id="heritage-memory" value={memoryDraft} maxLength={180} placeholder="Un meci, o voce, o persoană..." onChange={(event) => setMemoryDraft(event.target.value)} />
                    <footer><small>{memoryDraft.length}/180</small><button type="submit" disabled={!memoryDraft.trim()}>Păstrează în arhivă</button></footer>
                  </form>
                )}
              </section>
            </div>
          </AppScrollArea>
        </motion.aside>
      </div>
    </section>
  )
}

type TeamMode = 'lot' | 'asezare' | 'staff'

const teamModes = [
  { id: 'lot' as const, label: 'Lot interactiv', meta: '26 jucători', icon: UsersRound },
  { id: 'asezare' as const, label: 'Așezare tactică', meta: '4–4–2', icon: LayoutDashboard },
  { id: 'staff' as const, label: 'Staff tehnic', meta: `${technicalStaff.length} membri`, icon: UserRoundCog },
]

const positionFilters = ['Toți', 'Portar', 'Fundaș', 'Mijlocaș', 'Atacant'] as const

const positionTone: Record<PlayerPosition, string> = {
  Portar: 'var(--tone-amber)',
  Fundaș: 'var(--tone-cyan)',
  Mijlocaș: 'var(--tone-violet)',
  Atacant: 'var(--tone-rose)',
}

const positionRole: Record<PlayerPosition, string> = {
  Portar: 'Ultimul zid',
  Fundaș: 'Garda cetății',
  Mijlocaș: 'Arhitectul jocului',
  Atacant: 'Vârful asediului',
}

const formationSlots = [
  { number: 1, x: 50, y: 88 },
  { number: 24, x: 17, y: 67 },
  { number: 5, x: 39, y: 72 },
  { number: 21, x: 61, y: 72 },
  { number: 6, x: 83, y: 67 },
  { number: 14, x: 16, y: 42 },
  { number: 73, x: 39, y: 49 },
  { number: 10, x: 61, y: 49 },
  { number: 7, x: 84, y: 42 },
  { number: 25, x: 37, y: 19 },
  { number: 9, x: 63, y: 19 },
]

function playerRadar(number: number, position: PlayerPosition) {
  const positionBoost = { Portar: 4, Fundaș: 7, Mijlocaș: 11, Atacant: 14 }[position]
  return [
    { label: 'Energie', value: 68 + ((number * 3 + positionBoost) % 27) },
    { label: 'Tehnică', value: 64 + ((number * 5 + positionBoost) % 31) },
    { label: 'Impact', value: 61 + ((number * 7 + positionBoost) % 34) },
  ]
}

export function SquadView() {
  const { play } = useSound()
  const [mode, setMode] = useState<TeamMode>('lot')
  const [position, setPosition] = useState<'Toți' | PlayerPosition>('Toți')
  const [selectedNumber, setSelectedNumber] = useState(10)
  const [query, setQuery] = useState('')
  const [comparison, setComparison] = useState<number[]>([])
  const [showComparison, setShowComparison] = useState(false)
  const [favorites, setFavorites] = useState<number[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('cetatea-favorite-players') ?? '[]')
      return Array.isArray(stored) ? stored.filter((value): value is number => typeof value === 'number') : []
    } catch {
      return []
    }
  })

  const filteredSquad = useMemo(() => squad.filter((player) => {
    const matchesPosition = position === 'Toți' || player.position === position
    const normalizedQuery = query.trim().toLocaleLowerCase('ro')
    const matchesQuery = !normalizedQuery || player.name.toLocaleLowerCase('ro').includes(normalizedQuery) || String(player.number).includes(normalizedQuery)
    return matchesPosition && matchesQuery
  }), [position, query])

  const selectedPlayer = squad.find((player) => player.number === selectedNumber) ?? squad[0]
  const selectedIndex = squad.findIndex((player) => player.number === selectedPlayer.number)
  const radar = playerRadar(selectedPlayer.number, selectedPlayer.position)
  const comparisonPlayers = comparison
    .map((number) => squad.find((player) => player.number === number))
    .filter((player): player is (typeof squad)[number] => Boolean(player))

  useEffect(() => {
    localStorage.setItem('cetatea-favorite-players', JSON.stringify(favorites))
  }, [favorites])

  useEffect(() => {
    if (!showComparison) return
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setShowComparison(false)
    }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [showComparison])

  const selectPlayer = (number: number) => {
    setSelectedNumber(number)
    play('navigate')
  }

  const stepPlayer = (direction: number) => {
    const nextIndex = (selectedIndex + direction + squad.length) % squad.length
    selectPlayer(squad[nextIndex].number)
  }

  const toggleFavorite = (number: number) => {
    setFavorites((current) => current.includes(number)
      ? current.filter((item) => item !== number)
      : [...current, number])
    play('success')
  }

  const toggleComparison = (number: number) => {
    setComparison((current) => {
      if (current.includes(number)) return current.filter((item) => item !== number)
      if (current.length < 2) return [...current, number]
      return [current[1], number]
    })
    play('toggle')
  }

  return (
    <section className={`${styles.view} ${styles.teamView}`}>
      <ViewIntro code="LOT–04" label="Garda Cetății / centru interactiv" title="O echipă." accent="Un singur puls." />

      <div className={styles.teamHub}>
        <motion.nav className={styles.teamModes} variants={reveal} initial="hidden" animate="visible" aria-label="Modurile secțiunii Echipa">
          {teamModes.map((item, index) => {
            const Icon = item.icon
            return (
              <button
                type="button"
                key={item.id}
                className={mode === item.id ? styles.teamModeActive : ''}
                onClick={() => { setMode(item.id); play('navigate') }}
                aria-pressed={mode === item.id}
              >
                <span>0{index + 1}</span>
                <Icon aria-hidden="true" />
                <div><strong>{item.label}</strong><small>{item.meta}</small></div>
                <i />
              </button>
            )
          })}
          <div className={styles.teamPulse}><span><i /> Lot verificat</span><strong>SEZON 26/27</strong></div>
        </motion.nav>

        <div className={styles.teamScene}>
          <AnimatePresence mode="wait" initial={false}>
            {mode === 'lot' && (
              <motion.div
                key="lot"
                className={styles.teamRosterExperience}
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -22 }}
                transition={{ duration: .42, ease: [0.16, 1, 0.3, 1] }}
              >
                <article className={styles.playerSpotlight} style={{ '--player-tone': positionTone[selectedPlayer.position] } as CSSProperties}>
                  <header>
                    <span><i /> Jucător selectat</span>
                    <strong>{positionRole[selectedPlayer.position]}</strong>
                    <em>DISPONIBIL</em>
                  </header>

                  <div className={styles.playerHero}>
                    <span className={styles.playerWatermark}>{String(selectedPlayer.number).padStart(2, '0')}</span>
                    <div className={styles.playerSigil}>
                      <i /><i />
                      <img src={club.badge} alt="Sigla Cetatea Suceava" />
                      <b>{String(selectedPlayer.number).padStart(2, '0')}</b>
                    </div>
                    <div className={styles.playerIdentity}>
                      <small>{selectedPlayer.position} · CSM Cetatea 1932</small>
                      <h2>{selectedPlayer.name}</h2>
                      <span><Shield aria-hidden="true" /> Român · Prima echipă</span>
                    </div>
                    <div className={styles.playerStepper}>
                      <button type="button" onClick={() => stepPlayer(-1)} aria-label="Jucătorul precedent"><ChevronLeft aria-hidden="true" /></button>
                      <span>{String(selectedIndex + 1).padStart(2, '0')} / {squad.length}</span>
                      <button type="button" onClick={() => stepPlayer(1)} aria-label="Jucătorul următor"><ChevronRight aria-hidden="true" /></button>
                    </div>
                  </div>

                  <div className={styles.playerRadar}>
                    <div className={styles.radarHeading}><span><Activity aria-hidden="true" /> Radar comunitar</span><small>Indicator vizual · neoficial</small></div>
                    {radar.map((metric) => (
                      <span key={metric.label}><small>{metric.label}</small><i><b style={{ '--metric': `${metric.value}%` } as CSSProperties} /></i><strong>{metric.value}</strong></span>
                    ))}
                  </div>

                  <footer className={styles.playerActions}>
                    <button
                      type="button"
                      className={favorites.includes(selectedPlayer.number) ? styles.playerActionActive : ''}
                      onClick={() => toggleFavorite(selectedPlayer.number)}
                      aria-pressed={favorites.includes(selectedPlayer.number)}
                    >
                      <Heart aria-hidden="true" />
                      <span><strong>{favorites.includes(selectedPlayer.number) ? 'Favorit în Cetate' : 'Adaugă la favoriți'}</strong><small>{68 + ((selectedPlayer.number * 11) % 29)}% puls suporteri</small></span>
                    </button>
                    <button
                      type="button"
                      className={comparison.includes(selectedPlayer.number) ? styles.playerActionActive : ''}
                      onClick={() => toggleComparison(selectedPlayer.number)}
                      aria-pressed={comparison.includes(selectedPlayer.number)}
                    >
                      <GitCompareArrows aria-hidden="true" />
                      <span><strong>{comparison.includes(selectedPlayer.number) ? 'Selectat pentru duel' : 'Adaugă la comparație'}</strong><small>{comparison.length} din 2 selectați</small></span>
                    </button>
                  </footer>
                </article>

                <aside className={styles.squadDirectory}>
                  <header>
                    <div><small>Garda completă</small><strong>Explorează lotul</strong></div>
                    <button
                      type="button"
                      onClick={() => setShowComparison(true)}
                      disabled={comparisonPlayers.length < 2}
                      title={comparisonPlayers.length < 2 ? 'Selectează doi jucători' : 'Deschide comparația'}
                    >
                      <GitCompareArrows aria-hidden="true" /> {comparisonPlayers.length}/2
                    </button>
                  </header>

                  <label className={styles.playerSearch}>
                    <Search aria-hidden="true" />
                    <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Caută nume sau număr" />
                    <span>{filteredSquad.length}</span>
                  </label>

                  <div className={styles.positionFilters} aria-label="Filtrează lotul după post">
                    {positionFilters.map((filter) => (
                      <button
                        type="button"
                        key={filter}
                        className={position === filter ? styles.positionFilterActive : ''}
                        onClick={() => { setPosition(filter); play('toggle') }}
                        aria-pressed={position === filter}
                      >
                        {filter === 'Toți' ? 'Toți' : filter.slice(0, 3)}
                      </button>
                    ))}
                  </div>

                  <div
                    className={`${styles.playerDirectoryGrid} ${
                      filteredSquad.length <= 4
                        ? styles.playerDirectorySparse
                        : filteredSquad.length <= 12
                          ? styles.playerDirectoryCompact
                          : ''
                    }`}
                    data-density={filteredSquad.length <= 4 ? 'rar' : filteredSquad.length <= 12 ? 'compact' : 'complet'}
                  >
                    {filteredSquad.map((player) => {
                      const compactName = player.name.split(' ').at(-1) ?? player.name

                      return (
                        <button
                          type="button"
                          key={player.number}
                          className={`${selectedPlayer.number === player.number ? styles.directoryPlayerActive : ''} ${favorites.includes(player.number) ? styles.directoryPlayerFavorite : ''}`}
                          style={{ '--player-tone': positionTone[player.position] } as CSSProperties}
                          onClick={() => selectPlayer(player.number)}
                          aria-pressed={selectedPlayer.number === player.number}
                          title={`${player.name} · ${player.position}`}
                        >
                          <b>{String(player.number).padStart(2, '0')}</b>
                          <span>
                            <strong><span className={styles.playerNameFull}>{player.name}</span><span className={styles.playerNameCompact}>{compactName}</span></strong>
                            <small>{player.position}</small>
                          </span>
                          {favorites.includes(player.number) && <Star aria-label="Favorit" />}
                          <i />
                        </button>
                      )
                    })}
                    {!filteredSquad.length && <p className={styles.noPlayers}>Niciun jucător găsit.</p>}
                  </div>
                </aside>
              </motion.div>
            )}

            {mode === 'asezare' && (
              <motion.div
                key="asezare"
                className={styles.formationExperience}
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -22 }}
                transition={{ duration: .42, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className={styles.formationBoard}>
                  <header><span><CircleDot aria-hidden="true" /> Plan tactic interactiv</span><strong>4–4–2 / ECHILIBRAT</strong></header>
                  <div className={styles.formationPitch}>
                    <span className={styles.pitchHalf} /><span className={styles.pitchCircle} /><span className={styles.pitchBoxTop} /><span className={styles.pitchBoxBottom} />
                    {formationSlots.map((slot) => {
                      const player = squad.find((item) => item.number === slot.number)
                      if (!player) return null
                      return (
                        <button
                          type="button"
                          key={slot.number}
                          className={selectedPlayer.number === player.number ? styles.formationPlayerActive : ''}
                          style={{ '--x': `${slot.x}%`, '--y': `${slot.y}%`, '--player-tone': positionTone[player.position] } as CSSProperties}
                          onClick={() => selectPlayer(player.number)}
                        >
                          <i>{player.number}</i><span>{player.name.split(' ').at(-1)}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <aside className={styles.formationIntel} style={{ '--player-tone': positionTone[selectedPlayer.position] } as CSSProperties}>
                  <span className={styles.formationBadge}><img src={club.badge} alt="Sigla Cetatea Suceava" /><b>{selectedPlayer.number}</b></span>
                  <small>Rol în așezare</small>
                  <h2>{selectedPlayer.name}</h2>
                  <strong>{positionRole[selectedPlayer.position]}</strong>
                  <p>Selectează orice poziție de pe teren pentru a explora rapid jucătorul și rolul său în sistem.</p>
                  <div>{radar.map((metric) => <span key={metric.label}><small>{metric.label}</small><b>{metric.value}</b></span>)}</div>
                  <button type="button" onClick={() => { setMode('lot'); play('navigate') }}><UsersRound aria-hidden="true" /> Deschide profilul complet <ArrowRight aria-hidden="true" /></button>
                </aside>
              </motion.div>
            )}

            {mode === 'staff' && (
              <motion.div
                key="staff"
                className={styles.staffExperience}
                initial={{ opacity: 0, x: 28 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -22 }}
                transition={{ duration: .42, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className={styles.staffCommand}>
                  <header><span>Comandamentul tehnic</span><strong>Oamenii din spatele echipei.</strong></header>
                  <div className={styles.staffGrid}>
                    {technicalStaff.map((member, index) => (
                      <article key={member.name} style={{ '--staff-index': String(index + 1) } as CSSProperties}>
                        <span><UserRoundCog aria-hidden="true" /></span>
                        <div><small>{member.role}</small><strong>{member.name}</strong></div>
                        <b>0{index + 1}</b>
                        <i />
                      </article>
                    ))}
                  </div>
                </div>
                <aside className={styles.staffManifesto}>
                  <span><Zap aria-hidden="true" /> Principiul Cetății</span>
                  <h2>Rigoare.<br />Curaj.<br /><em>Împreună.</em></h2>
                  <p>Fiecare rol susține aceeași construcție: o echipă pregătită, unită și conectată permanent la Suceava.</p>
                  <div><strong>6</strong><span>departamente<br />un singur obiectiv</span></div>
                </aside>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {showComparison && comparisonPlayers.length === 2 && (
          <motion.div
            className={styles.teamComparison}
            role="dialog"
            aria-modal="true"
            aria-labelledby="team-comparison-title"
            initial={{ opacity: 0, y: 30, clipPath: 'inset(10% 8%)' }}
            animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0)' }}
            exit={{ opacity: 0, y: 22, clipPath: 'inset(8% 6%)' }}
            transition={{ duration: .42, ease: [0.16, 1, 0.3, 1] }}
          >
            <header>
              <div><small>Laboratorul lotului</small><strong id="team-comparison-title">Comparație directă</strong></div>
              <button type="button" autoFocus onClick={() => setShowComparison(false)} aria-label="Închide comparația"><X aria-hidden="true" /></button>
            </header>
            <div className={styles.comparisonGrid}>
              {comparisonPlayers.map((player, playerIndex) => (
                <article key={player.number} style={{ '--player-tone': positionTone[player.position] } as CSSProperties}>
                  <span className={styles.comparisonNumber}>{String(player.number).padStart(2, '0')}</span>
                  <div className={styles.comparisonIdentity}><img src={club.badge} alt="" /><span><small>{player.position}</small><strong>{player.name}</strong></span></div>
                  <div className={styles.comparisonMetrics}>
                    {playerRadar(player.number, player.position).map((metric) => (
                      <span key={metric.label}><small>{metric.label}</small><i><b style={{ '--metric': `${metric.value}%` } as CSSProperties} /></i><strong>{metric.value}</strong></span>
                    ))}
                  </div>
                  <button type="button" onClick={() => { selectPlayer(player.number); setShowComparison(false) }}>Deschide profilul <ArrowRight aria-hidden="true" /></button>
                  {playerIndex === 0 && <em>VS</em>}
                </article>
              ))}
            </div>
            <footer><span>Radar comunitar · indicator conceptual, nu statistică oficială</span><button type="button" onClick={() => { setComparison([]); setShowComparison(false) }}>Golește selecția</button></footer>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

type SeasonMode = 'clasament' | 'forma' | 'calendar'

const seasonModes = [
  { id: 'clasament' as const, label: 'Clasament', meta: '22 cluburi', icon: Trophy },
  { id: 'forma' as const, label: 'Radar de formă', meta: 'Etapele 1–2', icon: Activity },
  { id: 'calendar' as const, label: 'Calendar', meta: 'Următoarele 6', icon: CalendarDays },
]

export function LeagueTableView() {
  const { play } = useSound()
  const [mode, setMode] = useState<SeasonMode>('clasament')
  const [selectedPosition, setSelectedPosition] = useState(10)
  const [simulation, setSimulation] = useState<FormResult>('V')
  const [selectedFixtureIndex, setSelectedFixtureIndex] = useState(0)
  const [reminders, setReminders] = useState<number[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('cetatea-fixture-reminders') ?? '[]')
      return Array.isArray(stored) ? stored.filter((value): value is number => typeof value === 'number') : []
    } catch {
      return []
    }
  })

  const standingColumns = [standings.slice(0, 11), standings.slice(11)]
  const cetateaStanding = standings.find((row) => row.name === club.name) ?? standings[9]
  const selectedTeam = standings.find((row) => row.position === selectedPosition) ?? cetateaStanding
  const selectedFixture = upcomingFixtures[selectedFixtureIndex] ?? upcomingFixtures[0]
  const simulationPoints = simulation === 'V' ? 3 : simulation === 'E' ? 1 : 0
  const projectedPoints = cetateaStanding.points + simulationPoints
  const projectedPosition = 1 + standings.filter((row) => row.name !== club.name && row.points > projectedPoints).length

  useEffect(() => {
    localStorage.setItem('cetatea-fixture-reminders', JSON.stringify(reminders))
  }, [reminders])

  const selectTeam = (position: number) => {
    setSelectedPosition(position)
    play('navigate')
  }

  const badgeForTeam = (teamName: string) => {
    if (teamName.includes('Cetatea')) return club.badge
    const normalized = teamName.toLocaleLowerCase('ro')
    return standings.find((row) => (
      normalized.includes(row.shortName.toLocaleLowerCase('ro'))
      || row.shortName.toLocaleLowerCase('ro').includes(normalized)
    ))?.badge ?? fanEmblem
  }

  const toggleReminder = (index: number) => {
    setReminders((current) => current.includes(index)
      ? current.filter((item) => item !== index)
      : [...current, index])
    play('success')
  }

  return (
    <section className={`${styles.view} ${styles.seasonView}`}>
      <ViewIntro code="L2–05" label="Liga a II-a / centrul sezonului" title="Fiecare etapă." accent="Un nou asediu." />

      <div className={styles.seasonHub}>
        <motion.nav className={styles.seasonModes} variants={reveal} initial="hidden" animate="visible" aria-label="Modurile centrului sezonului">
          {seasonModes.map((item, index) => {
            const Icon = item.icon
            return (
              <button
                type="button"
                key={item.id}
                className={mode === item.id ? styles.seasonModeActive : ''}
                onClick={() => { setMode(item.id); play('navigate') }}
                aria-pressed={mode === item.id}
              >
                <span>0{index + 1}</span><Icon aria-hidden="true" />
                <div><strong>{item.label}</strong><small>{item.meta}</small></div><i />
              </button>
            )
          })}
          <div className={styles.seasonSignal}>
            <span><i /> Date oficiale</span>
            <strong>ACTUALIZAT DUPĂ E2</strong>
          </div>
        </motion.nav>

        <div className={styles.seasonScene}>
          <AnimatePresence mode="wait" initial={false}>
            {mode === 'clasament' && (
              <motion.div
                key="clasament"
                className={styles.seasonStandingsExperience}
                initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }}
                transition={{ duration: .42, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className={styles.seasonTableCommand}>
                  <header>
                    <div><small>Clasament complet</small><strong>Liga a II-a · 2026/27</strong></div>
                    <div className={styles.seasonLegend}><span><i /> Promovare</span><span><i /> Cetatea</span></div>
                  </header>
                  <div className={styles.seasonStandingColumns}>
                    {standingColumns.map((column, columnIndex) => (
                      <div className={styles.seasonStandingColumn} key={columnIndex}>
                        <div className={styles.seasonTableHead}><span>#</span><span>Club</span><span>M</span><span>±</span><span>P</span></div>
                        {column.map((row) => (
                          <button
                            type="button"
                            className={`${row.name === club.name ? styles.seasonOurTeam : ''} ${selectedTeam.position === row.position ? styles.seasonTeamSelected : ''}`}
                            key={row.position}
                            onClick={() => selectTeam(row.position)}
                            aria-pressed={selectedTeam.position === row.position}
                          >
                            <span>{String(row.position).padStart(2, '0')}</span>
                            <strong><img src={row.badge} alt="" />{row.shortName}</strong>
                            <small>{row.played}</small><small>{row.goalDifference > 0 ? `+${row.goalDifference}` : row.goalDifference}</small><b>{row.points}</b><i />
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <aside className={styles.seasonInspector}>
                  <header><span>Club inspectat</span><strong>POZIȚIA {String(selectedTeam.position).padStart(2, '0')}</strong></header>
                  <div className={styles.inspectedClub}>
                    <span><img src={selectedTeam.badge} alt="" /><b>{String(selectedTeam.position).padStart(2, '0')}</b></span>
                    <small>{selectedTeam.name === club.name ? 'Cetatea noastră' : 'Adversar în campionat'}</small>
                    <h2>{selectedTeam.shortName}</h2>
                  </div>
                  <div className={styles.inspectedStats}>
                    <span><small>Meciuri</small><strong>{selectedTeam.played}</strong></span>
                    <span><small>Golaveraj</small><strong>{selectedTeam.goalDifference > 0 ? `+${selectedTeam.goalDifference}` : selectedTeam.goalDifference}</strong></span>
                    <span><small>Puncte</small><strong>{selectedTeam.points}</strong></span>
                  </div>
                  <div className={styles.inspectedForm}><small>Forma recentă</small><div>{selectedTeam.form.map((result, index) => <i key={`${result}-${index}`} className={result === 'V' ? styles.formWin : result === 'E' ? styles.formDraw : styles.formLoss}>{result}</i>)}</div></div>

                  <div className={styles.seasonSimulator}>
                    <header><span>Simulator Cetatea · Etapa 3</span><small>SCENARIU</small></header>
                    <div>{(['V', 'E', 'Î'] as FormResult[]).map((result) => <button type="button" key={result} className={simulation === result ? styles.simulationActive : ''} onClick={() => { setSimulation(result); play('toggle') }}>{result}</button>)}</div>
                    <p>Dacă următorul meci se încheie cu <strong>{simulation === 'V' ? 'victorie' : simulation === 'E' ? 'egal' : 'înfrângere'}</strong>:</p>
                    <footer><span><small>Poziție estimată</small><strong>#{projectedPosition}</strong></span><span><small>Puncte</small><strong>{projectedPoints}</strong></span></footer>
                  </div>
                </aside>
              </motion.div>
            )}

            {mode === 'forma' && (
              <motion.div
                key="forma"
                className={styles.seasonFormExperience}
                initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }}
                transition={{ duration: .42, ease: [0.16, 1, 0.3, 1] }}
              >
                <article className={styles.formSpotlight}>
                  <header><span><Activity aria-hidden="true" /> Radarul campionatului</span><small>După etapa a II-a</small></header>
                  <div className={styles.formClubIdentity}>
                    <span><img src={selectedTeam.badge} alt="" /><strong>{String(selectedTeam.position).padStart(2, '0')}</strong></span>
                    <div><small>Club selectat</small><h2>{selectedTeam.shortName}</h2><p>{selectedTeam.wins} victorii · {selectedTeam.draws} egaluri · {selectedTeam.losses} înfrângeri</p></div>
                  </div>
                  <div className={styles.formTrajectory}>
                    <span>ETAPA</span>{Array.from({ length: 5 }, (_, index) => <b key={index}>0{index + 1}</b>)}
                    <small>REZULTAT</small>
                    {Array.from({ length: 5 }, (_, index) => {
                      const result = selectedTeam.form[index]
                      return <i key={index} className={result === 'V' ? styles.formWin : result === 'E' ? styles.formDraw : result === 'Î' ? styles.formLoss : styles.formPending}>{result ?? '·'}</i>
                    })}
                  </div>
                  <div className={styles.formBars}>
                    <span><small>Randament</small><i><b style={{ '--form-width': `${Math.min(100, selectedTeam.points / Math.max(1, selectedTeam.played * 3) * 100)}%` } as CSSProperties} /></i><strong>{Math.round(selectedTeam.points / Math.max(1, selectedTeam.played * 3) * 100)}%</strong></span>
                    <span><small>Ofensivă</small><i><b style={{ '--form-width': `${55 + Math.max(0, selectedTeam.goalDifference) * 7}%` } as CSSProperties} /></i><strong>{55 + Math.max(0, selectedTeam.goalDifference) * 7}</strong></span>
                    <span><small>Impuls</small><i><b style={{ '--form-width': `${selectedTeam.form.at(-1) === 'V' ? 86 : selectedTeam.form.at(-1) === 'E' ? 61 : 38}%` } as CSSProperties} /></i><strong>{selectedTeam.form.at(-1) === 'V' ? '↑' : selectedTeam.form.at(-1) === 'E' ? '→' : '↓'}</strong></span>
                  </div>
                  <footer><span>Indicatori calculați din rezultatele oficiale disponibile</span><strong>{selectedTeam.points - cetateaStanding.points === 0 ? 'LA EGALITATE CU CETATEA' : `${Math.abs(selectedTeam.points - cetateaStanding.points)} PCT. ${selectedTeam.points > cetateaStanding.points ? 'PESTE' : 'SUB'} CETATEA`}</strong></footer>
                </article>

                <aside className={styles.formMatrix}>
                  <header><div><small>Toată liga</small><strong>Matricea formei</strong></div><span>V · E · Î</span></header>
                  <div>
                    {standings.map((row) => (
                      <button type="button" key={row.position} className={`${row.name === club.name ? styles.formMatrixOurTeam : ''} ${selectedTeam.position === row.position ? styles.formMatrixSelected : ''}`} onClick={() => selectTeam(row.position)}>
                        <span>{String(row.position).padStart(2, '0')}</span><img src={row.badge} alt="" /><strong>{row.shortName}</strong>
                        <div>{row.form.map((result, index) => <i key={`${result}-${index}`} className={result === 'V' ? styles.formWin : result === 'E' ? styles.formDraw : styles.formLoss}>{result}</i>)}</div>
                      </button>
                    ))}
                  </div>
                </aside>
              </motion.div>
            )}

            {mode === 'calendar' && (
              <motion.div
                key="calendar"
                className={styles.seasonCalendarExperience}
                initial={{ opacity: 0, x: 28 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }}
                transition={{ duration: .42, ease: [0.16, 1, 0.3, 1] }}
              >
                <div className={styles.fixtureTimeline}>
                  <header><div><small>Drumul Cetății</small><strong>Următoarele confruntări</strong></div><span>6 MECIURI</span></header>
                  <div>
                    {upcomingFixtures.map((fixture, index) => (
                      <button type="button" key={`${fixture.date}-${fixture.home}`} className={selectedFixtureIndex === index ? styles.fixtureTimelineActive : ''} onClick={() => { setSelectedFixtureIndex(index); play('navigate') }}>
                        <span><small>ETAPA</small><strong>0{index + 3}</strong></span>
                        <time><strong>{fixture.date}</strong><small>{fixture.time}</small></time>
                        <div><strong>{fixture.home}</strong><i /><strong>{fixture.away}</strong><small>{fixture.venue}</small></div>
                        {reminders.includes(index) && <Bell aria-label="Alertă activă" />}
                      </button>
                    ))}
                  </div>
                </div>

                <aside className={styles.fixtureFocus}>
                  <header><span><i /> Meci selectat</span><strong>ETAPA {String(selectedFixtureIndex + 3).padStart(2, '0')}</strong></header>
                  <div className={styles.fixtureDuel}>
                    <span><img src={badgeForTeam(selectedFixture.home)} alt="" /><strong>{selectedFixture.home}</strong></span>
                    <b>VS<small>{selectedFixture.time}</small></b>
                    <span><img src={badgeForTeam(selectedFixture.away)} alt="" /><strong>{selectedFixture.away}</strong></span>
                  </div>
                  <div className={styles.fixtureCoordinates}>
                    <span>
                      <span className={styles.factIcon} aria-hidden="true"><CalendarDays /></span>
                      <span className={styles.factCopy}><small>Data</small><strong>{selectedFixture.date}</strong></span>
                    </span>
                    <span>
                      <span className={styles.factIcon} aria-hidden="true"><CircleDot /></span>
                      <span className={styles.factCopy}><small>Stadion</small><strong>{selectedFixture.venue}</strong></span>
                    </span>
                  </div>
                  <button type="button" className={reminders.includes(selectedFixtureIndex) ? styles.fixtureReminderActive : ''} onClick={() => toggleReminder(selectedFixtureIndex)} aria-pressed={reminders.includes(selectedFixtureIndex)}>
                    <Bell aria-hidden="true" /><span><strong>{reminders.includes(selectedFixtureIndex) ? 'Alerta este activă' : 'Activează alerta de meci'}</strong><small>Primești noutățile înainte de start</small></span><i />
                  </button>
                  <footer><span>Program publicat de club</span><strong>ORE LOCALE</strong></footer>
                </aside>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  )
}

type NewsCategory = 'Toate' | 'Meci' | 'Echipă' | 'Comunitate' | 'Club'

type NewsArticle = {
  id: number
  category: Exclude<NewsCategory, 'Toate'>
  kicker: string
  title: string
  summary: string
  body: [string, string]
  date: string
  readTime: string
  image: string
  imagePosition: string
  tone: string
}

type NewsReaction = 'inima' | 'foc' | 'forta'

type NewsComment = {
  id: string
  articleId: number
  author: string
  initials: string
  message: string
  time: string
  verified?: boolean
}

const newsArticles: NewsArticle[] = [
  {
    id: 1,
    category: 'Meci',
    kicker: 'Pregătirea Areniului',
    title: 'Cetatea cheamă orașul la primul mare asediu al sezonului.',
    summary: 'Tot ce trebuie să știe suporterii înaintea duelului cu CSM Satu Mare: acces, atmosferă și momentele serii.',
    body: [
      'Porțile Stadionului Areni se deschid mai devreme pentru ca fiecare suporter să poată intra în ritmul meciului. Zona dedicată fanilor va reuni mesajele comunității, muzica tribunei și ultimele informații despre echipă.',
      'Recomandarea clubului suporterilor este simplă: vino în alb-albastru, ajungi devreme și păstrează voce pentru toate cele 90 de minute. Cetatea se construiește cu fiecare om din tribună.',
    ],
    date: '10 august 2026',
    readTime: '4 min.',
    image: arenaBackground,
    imagePosition: 'center 52%',
    tone: 'var(--tone-cyan)',
  },
  {
    id: 2,
    category: 'Echipă',
    kicker: 'Din vestiar',
    title: 'Victoria de la Târgu Mureș a aprins încrederea Cetății.',
    summary: 'O privire din interior asupra rezultatului care a legat echipa și a dat startul unei săptămâni intense.',
    body: [
      'Succesul cu 2–0 a venit din disciplină, răbdare și o energie transmisă de suporterii care au făcut deplasarea. Stafful a păstrat însă mesajul clar: victoria este un punct de plecare, nu o destinație.',
      'În zilele următoare, lotul intră într-un program axat pe recuperare și pregătirea fazelor fixe. Obiectivul este ca Areniul să vadă o echipă curajoasă, compactă și gata să controleze ritmul.',
    ],
    date: '9 august 2026',
    readTime: '3 min.',
    image: arenaBackground,
    imagePosition: '72% center',
    tone: 'var(--tone-violet)',
  },
  {
    id: 3,
    category: 'Comunitate',
    kicker: 'Vocile peluzei',
    title: 'Mesajele suporterilor intră pe ecranele Cetății.',
    summary: 'Cele mai puternice mesaje din Peluză vor deveni parte din experiența digitală și din ziua de meci.',
    body: [
      'Peluza din aplicație nu este doar un flux de comentarii. Este locul în care scandările, poveștile și inițiativele fanilor pot primi vizibilitatea pe care o merită.',
      'Mesajele apreciate de comunitate vor fi selectate în colecția săptămânii, iar autorii vor primi reputație în carnetul digital. Respectul și pasiunea rămân regulile de bază.',
    ],
    date: '8 august 2026',
    readTime: '5 min.',
    image: fanEmblem,
    imagePosition: 'center',
    tone: 'var(--tone-green)',
  },
  {
    id: 4,
    category: 'Club',
    kicker: 'Identitate alb-albastră',
    title: '1932 nu este doar un an. Este semnalul care ne adună.',
    summary: 'O nouă serie editorială readuce la viață oamenii, locurile și momentele care au construit fotbalul sucevean.',
    body: [
      'Seria „Arhiva Cetății” va conecta generațiile prin fotografii, mărturii și povești din jurul Areniului. Fiecare episod va putea fi salvat în profil și distribuit comunității.',
      'Prima poveste pornește de la tribune: de la vocile care au rămas, indiferent de ligă, vreme sau rezultat. Identitatea clubului este memoria orașului dusă mai departe.',
    ],
    date: '7 august 2026',
    readTime: '6 min.',
    image: fanEmblem,
    imagePosition: 'center',
    tone: 'var(--tone-amber)',
  },
  {
    id: 5,
    category: 'Echipă',
    kicker: 'Garda Cetății',
    title: 'Lotul intră într-o săptămână decisivă pentru ritmul sezonului.',
    summary: 'Antrenamente deschise, dueluri pentru titularizare și detaliile urmărite de staff înaintea etapei a treia.',
    body: [
      'Concurența din lot crește, iar fiecare compartiment are obiective clare pentru următorul meci. Intensitatea fără minge și viteza tranziției sunt prioritățile săptămânii.',
      'Suporterii vor primi în aplicație informațiile esențiale despre lot, convocări și formula de start, imediat ce acestea devin oficiale.',
    ],
    date: '6 august 2026',
    readTime: '3 min.',
    image: club.badge,
    imagePosition: 'center',
    tone: 'var(--tone-rose)',
  },
  {
    id: 6,
    category: 'Meci',
    kicker: 'Drumul alb-albastru',
    title: 'Ghidul suporterului pentru deplasarea de la Ștefănești.',
    summary: 'Program, stadion și reperele utile pentru fanii care vor să ducă vocea Cetății în următoarea deplasare.',
    body: [
      'Următorul meci din deplasare este programat pe 22 august, de la ora 11:00, la Stadionul Dumitru Mătărau. În centrul de sezon poți activa alerta și păstra toate coordonatele partidei aproape.',
      'Clubul suporterilor va reuni într-un singur flux informațiile confirmate despre acces și punctele de întâlnire. Verifică aplicația înainte de plecare pentru eventualele actualizări ale programului.',
    ],
    date: '5 august 2026',
    readTime: '4 min.',
    image: arenaBackground,
    imagePosition: '35% center',
    tone: 'var(--tone-cyan)',
  },
  {
    id: 7,
    category: 'Comunitate',
    kicker: 'Oameni de Cetate',
    title: 'Poveștile din tribună primesc un loc al lor în aplicație.',
    summary: 'O serie nouă dedicată suporterilor care duc identitatea alb-albastră mai departe, generație după generație.',
    body: [
      'Fiecare meci are vocile sale, iar în spatele fiecărei voci există o poveste. Noua serie va aduce în față suporteri, familii și grupuri care au rămas aproape de fotbalul sucevean.',
      'Comunitatea va putea propune povești și reacționa la fiecare episod. Cele mai apreciate mărturii vor rămâne în arhiva digitală a Cetății.',
    ],
    date: '4 august 2026',
    readTime: '5 min.',
    image: fanEmblem,
    imagePosition: 'center',
    tone: 'var(--tone-green)',
  },
  {
    id: 8,
    category: 'Club',
    kicker: 'Harta Cetății',
    title: 'Suceava se conectează într-o singură rețea alb-albastră.',
    summary: 'Cartierele, diaspora și tribuna se întâlnesc într-o hartă vie a comunității Cetatea.',
    body: [
      'Harta Cetății va arăta energia comunității fără să expună locații personale. Fiecare suporter va putea alege zona pe care o reprezintă și va contribui la pulsul colectiv.',
      'Obiectivul este simplu: să vedem cât de departe ajunge identitatea alb-albastră și să transformăm conexiunile digitale în inițiative pentru oraș și stadion.',
    ],
    date: '3 august 2026',
    readTime: '4 min.',
    image: arenaBackground,
    imagePosition: 'center 68%',
    tone: 'var(--tone-violet)',
  },
]

const newsCategories: NewsCategory[] = ['Toate', 'Meci', 'Echipă', 'Comunitate', 'Club']

const newsReactionOptions = [
  { id: 'inima' as const, label: 'Alb-albastru', icon: Heart, base: 126 },
  { id: 'foc' as const, label: 'Foc în tribună', icon: Flame, base: 84 },
  { id: 'forta' as const, label: 'Forța Cetății', icon: ThumbsUp, base: 63 },
]

const seededNewsComments: NewsComment[] = [
  { id: 'c-1', articleId: 1, author: 'Mihai S.', initials: 'MS', message: 'Areniul trebuie să fie plin. Venim devreme și cântăm până la final!', time: 'acum 8 min.', verified: true },
  { id: 'c-2', articleId: 1, author: 'Andreea C.', initials: 'AC', message: 'Foarte utile informațiile despre acces. Hai, Cetatea!', time: 'acum 21 min.' },
  { id: 'c-3', articleId: 2, author: 'Radu din Burdujeni', initials: 'RB', message: 'Victoria asta ne-a dat încredere. Continuăm la fel pe Areni.', time: 'acum 34 min.', verified: true },
  { id: 'c-4', articleId: 3, author: 'Peluza Nord', initials: 'PN', message: 'Vocile suporterilor trebuie să se audă și aici, și pe stadion.', time: 'acum 1 oră', verified: true },
  { id: 'c-5', articleId: 4, author: 'Sorin 1932', initials: 'S2', message: 'Aștept cu nerăbdare arhiva și fotografiile vechi ale Areniului.', time: 'acum 2 ore' },
  { id: 'c-6', articleId: 5, author: 'Ioana M.', initials: 'IM', message: 'Mult succes întregului lot în săptămâna care urmează!', time: 'acum 3 ore' },
  { id: 'c-7', articleId: 6, author: 'George din Centru', initials: 'GC', message: 'Foarte bună ideea cu toate detaliile deplasării într-un singur loc.', time: 'acum 4 ore' },
  { id: 'c-8', articleId: 7, author: 'Familia Alb-Albastră', initials: 'FA', message: 'Avem trei generații care merg împreună la Areni. Trimitem povestea!', time: 'acum 5 ore', verified: true },
  { id: 'c-9', articleId: 8, author: 'Cetățean din diaspora', initials: 'CD', message: 'Suceava se simte aproape chiar și de la mii de kilometri.', time: 'acum 6 ore' },
]

export function NewsView() {
  const { play } = useSound()
  const [category, setCategory] = useState<NewsCategory>('Toate')
  const [activeIndex, setActiveIndex] = useState(0)
  const [autoplay, setAutoplay] = useState(true)
  const [hovering, setHovering] = useState(false)
  const [saved, setSaved] = useState<number[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('cetatea-saved-news') ?? '[]')
      return Array.isArray(stored) ? stored.filter((id): id is number => typeof id === 'number') : []
    } catch {
      return []
    }
  })
  const [readerArticle, setReaderArticle] = useState<NewsArticle | null>(null)
  const [conversationArticle, setConversationArticle] = useState<NewsArticle | null>(null)
  const [commentDraft, setCommentDraft] = useState('')
  const [likedComments, setLikedComments] = useState<string[]>([])
  const [reactions, setReactions] = useState<Record<number, NewsReaction>>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('cetatea-news-reactions') ?? '{}')
      return stored && typeof stored === 'object' ? stored : {}
    } catch {
      return {}
    }
  })
  const [userComments, setUserComments] = useState<NewsComment[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('cetatea-news-comments') ?? '[]')
      return Array.isArray(stored) ? stored : []
    } catch {
      return []
    }
  })

  const visibleArticles = useMemo(
    () => category === 'Toate'
      ? newsArticles
      : newsArticles.filter((article) => article.category === category),
    [category],
  )
  const activeArticle = visibleArticles[activeIndex] ?? visibleArticles[0]

  useEffect(() => {
    setActiveIndex(0)
  }, [category])

  useEffect(() => {
    localStorage.setItem('cetatea-saved-news', JSON.stringify(saved))
  }, [saved])

  useEffect(() => {
    localStorage.setItem('cetatea-news-reactions', JSON.stringify(reactions))
  }, [reactions])

  useEffect(() => {
    localStorage.setItem('cetatea-news-comments', JSON.stringify(userComments))
  }, [userComments])

  useEffect(() => {
    if (!autoplay || hovering || readerArticle || conversationArticle || visibleArticles.length < 2) return
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % visibleArticles.length)
    }, 7000)
    return () => window.clearInterval(timer)
  }, [autoplay, conversationArticle, hovering, readerArticle, visibleArticles.length])

  useEffect(() => {
    if (!readerArticle && !conversationArticle) return
    const closeOverlay = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      setReaderArticle(null)
      setConversationArticle(null)
    }
    document.addEventListener('keydown', closeOverlay)
    return () => document.removeEventListener('keydown', closeOverlay)
  }, [conversationArticle, readerArticle])

  const moveCarousel = (direction: number) => {
    setActiveIndex((current) => (
      current + direction + visibleArticles.length
    ) % visibleArticles.length)
    play('navigate')
  }

  const selectArticle = (index: number) => {
    setActiveIndex(index)
    play('navigate')
  }

  const toggleSaved = (id: number) => {
    setSaved((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id])
    play('success')
  }

  const commentsForArticle = (articleId: number) => [
    ...seededNewsComments.filter((comment) => comment.articleId === articleId),
    ...userComments.filter((comment) => comment.articleId === articleId),
  ]

  const reactionCount = (articleId: number, reactionIndex: number, reaction: NewsReaction) => (
    newsReactionOptions[reactionIndex].base
      + articleId * (reactionIndex + 3)
      + (reactions[articleId] === reaction ? 1 : 0)
  )

  const reactToArticle = (articleId: number, reaction: NewsReaction) => {
    setReactions((current) => {
      const next = { ...current }
      if (next[articleId] === reaction) delete next[articleId]
      else next[articleId] = reaction
      return next
    })
    play('success')
  }

  const openConversation = (article: NewsArticle) => {
    setReaderArticle(null)
    setConversationArticle(article)
    setAutoplay(false)
    play('navigate')
  }

  const submitComment = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const message = commentDraft.trim()
    if (!message || !conversationArticle) return
    setUserComments((current) => [
      ...current,
      {
        id: `user-${Date.now()}`,
        articleId: conversationArticle.id,
        author: 'Suporter Cetatea',
        initials: 'CS',
        message,
        time: 'acum câteva secunde',
      },
    ])
    setCommentDraft('')
    play('success')
  }

  const shareArticle = async (article: NewsArticle) => {
    try {
      if (navigator.share) {
        await navigator.share({ title: article.title, text: article.summary })
      } else {
        await navigator.clipboard?.writeText(`${article.title} — ${window.location.href}`)
      }
      play('success')
    } catch {
      // Distribuirea poate fi anulată de utilizator.
    }
  }

  if (!activeArticle) return null

  return (
    <section className={`${styles.view} ${styles.newsView}`}>
      <ViewIntro code="ȘT–06" label="Centrul editorial al Cetății" title="Poveștile care țin" accent="orașul aproape." />

      <div
        className={styles.newsLayout}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
      >
        <motion.article
          className={styles.newsHero}
          style={{ '--news-tone': activeArticle.tone } as CSSProperties}
          tabIndex={0}
          aria-label="Caruselul principal de știri. Folosește săgețile stânga și dreapta."
          onKeyDown={(event) => {
            if (event.key === 'ArrowLeft') moveCarousel(-1)
            if (event.key === 'ArrowRight') moveCarousel(1)
          }}
          variants={reveal}
          initial="hidden"
          animate="visible"
          custom={.05}
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={activeArticle.id}
              className={styles.newsSlide}
              initial={{ opacity: 0, x: 48, clipPath: 'inset(0 0 0 18%)' }}
              animate={{ opacity: 1, x: 0, clipPath: 'inset(0 0 0 0%)' }}
              exit={{ opacity: 0, x: -36, clipPath: 'inset(0 16% 0 0)' }}
              transition={{ duration: .52, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className={styles.newsMedia}>
                <img src={activeArticle.image} style={{ objectPosition: activeArticle.imagePosition }} alt="" />
                <span aria-hidden="true" />
              </div>

              <div className={styles.newsCopy} aria-live="polite">
                <div className={styles.newsKicker}><Sparkles aria-hidden="true" /> {activeArticle.kicker}<i />{activeArticle.category}</div>
                <h2>{activeArticle.title}</h2>
                <p>{activeArticle.summary}</p>
                <div className={styles.newsMeta}>
                  <span><CalendarDays aria-hidden="true" /> {activeArticle.date}</span>
                  <span><Clock3 aria-hidden="true" /> {activeArticle.readTime}</span>
                  <span><Eye aria-hidden="true" /> 1,9K</span>
                </div>
                <div className={styles.newsActions}>
                  <button type="button" onClick={() => { setReaderArticle(activeArticle); setAutoplay(false); play('navigate') }}>
                    <Newspaper aria-hidden="true" /><span>Citește povestea</span><ArrowRight aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    className={saved.includes(activeArticle.id) ? styles.newsActionActive : ''}
                    onClick={() => toggleSaved(activeArticle.id)}
                    aria-pressed={saved.includes(activeArticle.id)}
                    aria-label={saved.includes(activeArticle.id) ? 'Elimină din articolele salvate' : 'Salvează articolul'}
                  >
                    <Bookmark aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => void shareArticle(activeArticle)} aria-label="Distribuie articolul">
                    <Share2 aria-hidden="true" />
                  </button>
                  <button type="button" onClick={() => openConversation(activeArticle)} aria-label="Deschide conversația">
                    <MessageCircle aria-hidden="true" />
                  </button>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          <div className={styles.heroNavigation}>
            <button type="button" onClick={() => moveCarousel(-1)} aria-label="Știrea precedentă"><ArrowLeft aria-hidden="true" /></button>
            <span><strong>0{activeIndex + 1}</strong><i />0{visibleArticles.length}</span>
            <button type="button" onClick={() => moveCarousel(1)} aria-label="Știrea următoare"><ArrowRight aria-hidden="true" /></button>
          </div>
          <div className={`${styles.newsProgress} ${!autoplay || hovering ? styles.newsProgressPaused : ''}`} key={`${activeArticle.id}-${autoplay}`}><i /></div>
        </motion.article>

        <motion.aside className={styles.newsNavigator} variants={reveal} initial="hidden" animate="visible" custom={.13}>
          <div className={styles.newsFilters} aria-label="Filtrează știrile">
            {newsCategories.map((item) => (
              <button
                type="button"
                key={item}
                className={category === item ? styles.newsFilterActive : ''}
                onClick={() => { setCategory(item); play('navigate') }}
                aria-pressed={category === item}
              >
                {item}
              </button>
            ))}
          </div>

          <div
            className={`${styles.newsQueue} ${
              visibleArticles.length <= 2
                ? styles.newsQueueSparse
                : visibleArticles.length <= 4
                  ? styles.newsQueueCompact
                  : ''
            }`}
            data-density={visibleArticles.length <= 2 ? 'rar' : visibleArticles.length <= 4 ? 'compact' : 'complet'}
          >
            {visibleArticles.map((article, index) => (
              <button
                type="button"
                key={article.id}
                className={activeIndex === index ? styles.newsQueueActive : ''}
                style={{ '--news-tone': article.tone } as CSSProperties}
                onClick={() => selectArticle(index)}
                aria-current={activeIndex === index ? 'true' : undefined}
              >
                <span>0{index + 1}</span>
                <div><small>{article.category} · {article.readTime} · {commentsForArticle(article.id).length} mesaje</small><strong>{article.title}</strong></div>
                <i />
              </button>
            ))}
          </div>

          <div className={styles.newsCommunityPulse} style={{ '--news-tone': activeArticle.tone } as CSSProperties}>
            <header><span><MessageCircle aria-hidden="true" /> Pulsul știrii</span><small>{commentsForArticle(activeArticle.id).length} mesaje</small></header>
            <div>
              {newsReactionOptions.map((reaction, reactionIndex) => {
                const Icon = reaction.icon
                const active = reactions[activeArticle.id] === reaction.id
                return (
                  <button
                    type="button"
                    key={reaction.id}
                    className={active ? styles.newsReactionActive : ''}
                    onClick={() => reactToArticle(activeArticle.id, reaction.id)}
                    aria-pressed={active}
                    title={reaction.label}
                  >
                    <Icon aria-hidden="true" /><span>{reactionCount(activeArticle.id, reactionIndex, reaction.id)}</span>
                  </button>
                )
              })}
              <button type="button" className={styles.openConversation} onClick={() => openConversation(activeArticle)}>
                Intră în conversație <ArrowRight aria-hidden="true" />
              </button>
            </div>
          </div>

          <button
            type="button"
            className={styles.autoplayControl}
            onClick={() => { setAutoplay((current) => !current); play('toggle') }}
            aria-pressed={autoplay}
          >
            {autoplay ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
            <span><strong>{autoplay ? 'Flux automat activ' : 'Flux automat oprit'}</strong><small>Schimbare la fiecare 7 secunde</small></span>
            <Bell aria-hidden="true" />
          </button>
        </motion.aside>
      </div>

      <AnimatePresence>
        {readerArticle && (
          <motion.div
            className={styles.articleReader}
            role="dialog"
            aria-modal="true"
            aria-labelledby="article-reader-title"
            initial={{ opacity: 0, y: 34, clipPath: 'inset(12% 8% 0)' }}
            animate={{ opacity: 1, y: 0, clipPath: 'inset(0 0 0)' }}
            exit={{ opacity: 0, y: 24, clipPath: 'inset(0 8% 12%)' }}
            transition={{ duration: .46, ease: [0.16, 1, 0.3, 1] }}
            style={{ '--news-tone': readerArticle.tone } as CSSProperties}
          >
            <header>
              <span>{readerArticle.category} / {readerArticle.date}</span>
              <button type="button" autoFocus onClick={() => setReaderArticle(null)} aria-label="Închide articolul"><X aria-hidden="true" /></button>
            </header>
            <div>
              <small>{readerArticle.kicker}</small>
              <h2 id="article-reader-title">{readerArticle.title}</h2>
              {readerArticle.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
            </div>
            <footer>
              <span><Clock3 aria-hidden="true" /> {readerArticle.readTime} de lectură</span>
              <div>
                <button type="button" onClick={() => toggleSaved(readerArticle.id)}><Bookmark aria-hidden="true" /> {saved.includes(readerArticle.id) ? 'Salvat' : 'Salvează'}</button>
                <button type="button" onClick={() => void shareArticle(readerArticle)}><Share2 aria-hidden="true" /> Distribuie</button>
                <button type="button" onClick={() => openConversation(readerArticle)}><MessageCircle aria-hidden="true" /> Conversație</button>
              </div>
            </footer>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {conversationArticle && (
          <motion.div
            className={styles.newsConversationLayer}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <button type="button" className={styles.newsConversationBackdrop} onClick={() => setConversationArticle(null)} aria-label="Închide conversația" />
            <motion.aside
              className={styles.newsConversation}
              role="dialog"
              aria-modal="true"
              aria-labelledby="news-conversation-title"
              style={{ '--news-tone': conversationArticle.tone } as CSSProperties}
              initial={{ x: '108%' }}
              animate={{ x: 0 }}
              exit={{ x: '108%' }}
              transition={{ duration: .5, ease: [0.16, 1, 0.3, 1] }}
            >
              <header>
                <div><small>Conversația Cetății</small><strong id="news-conversation-title">Pulsul comunității</strong></div>
                <button type="button" onClick={() => setConversationArticle(null)} aria-label="Închide conversația"><X aria-hidden="true" /></button>
              </header>

              <div className={styles.conversationArticle}>
                <span>{conversationArticle.category} · {conversationArticle.date}</span>
                <strong>{conversationArticle.title}</strong>
              </div>

              <div className={styles.conversationReactions}>
                {newsReactionOptions.map((reaction, reactionIndex) => {
                  const Icon = reaction.icon
                  const active = reactions[conversationArticle.id] === reaction.id
                  return (
                    <button
                      type="button"
                      key={reaction.id}
                      className={active ? styles.conversationReactionActive : ''}
                      onClick={() => reactToArticle(conversationArticle.id, reaction.id)}
                      aria-pressed={active}
                    >
                      <Icon aria-hidden="true" /><span><strong>{reaction.label}</strong><small>{reactionCount(conversationArticle.id, reactionIndex, reaction.id)} reacții</small></span>
                    </button>
                  )
                })}
              </div>

              <div className={styles.commentThread} aria-live="polite">
                {commentsForArticle(conversationArticle.id).slice(-4).map((comment) => (
                  <article key={comment.id} className={comment.id.startsWith('user-') ? styles.ownComment : ''}>
                    <span>{comment.initials}</span>
                    <div>
                      <header><strong>{comment.author}{comment.verified && <BadgeCheck aria-label="Suporter verificat" />}</strong><small>{comment.time}</small></header>
                      <p>{comment.message}</p>
                      <footer>
                        <button
                          type="button"
                          className={likedComments.includes(comment.id) ? styles.commentLiked : ''}
                          onClick={() => {
                            setLikedComments((current) => current.includes(comment.id) ? current.filter((id) => id !== comment.id) : [...current, comment.id])
                            play('toggle')
                          }}
                          aria-pressed={likedComments.includes(comment.id)}
                        >
                          <Heart aria-hidden="true" /> {likedComments.includes(comment.id) ? 'Apreciat' : 'Apreciază'}
                        </button>
                        <button type="button" onClick={() => setCommentDraft(`@${comment.author} `)}>Răspunde</button>
                      </footer>
                    </div>
                  </article>
                ))}
              </div>

              <form className={styles.commentComposer} onSubmit={submitComment}>
                <span>CS</span>
                <label>
                  <input
                    autoFocus
                    value={commentDraft}
                    onChange={(event) => setCommentDraft(event.target.value)}
                    maxLength={220}
                    placeholder="Scrie un mesaj pentru Cetate..."
                  />
                  <small>{commentDraft.length}/220</small>
                </label>
                <button type="submit" disabled={!commentDraft.trim()} aria-label="Publică mesajul"><Send aria-hidden="true" /></button>
              </form>
              <footer className={styles.conversationRules}><BadgeCheck aria-hidden="true" /> Respect, pasiune și dialog alb-albastru.</footer>
            </motion.aside>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}

const missions = [
  ['Vino în alb-albastru', 'Zi de meci', '80'],
  ['Trimite un mesaj pe Zid', 'Comunitate', '45'],
  ['Invită un suporter', 'Echipă', '20'],
]

export function FanIdView() {
  const { play } = useSound()
  const [claimed, setClaimed] = useState<number[]>([0])

  return (
    <section className={styles.view}>
      <ViewIntro code="CS–06" label="Carnetul suporterului" title="Identitatea ta." accent="Reputația ta." />
      <div className={styles.fanIdLayout}>
        <motion.div className={styles.digitalPass} variants={reveal} initial="hidden" animate="visible" custom={0.05}>
          <div className={styles.passTop}><span>Clubul suporterilor / Cetatea Suceava</span><i>ACTIV</i></div>
          <div className={styles.passCore}>
            <div className={styles.fanAvatar}>CS</div>
            <div><small>Membru digital</small><strong>Suporter Cetatea</strong><span>SUCEAVA / ROMÂNIA</span></div>
            <b>#1932</b>
          </div>
          <div className={styles.xpBlock}><span><small>Nivel tribună</small><strong>08</strong></span><div><i /></div><em>680 / 1000 puncte</em></div>
          <div className={styles.passCode}>0100 1110 1000 1100 / CETATEA</div>
        </motion.div>

        <motion.aside className={styles.missions} variants={reveal} initial="hidden" animate="visible" custom={0.13}>
          <div className={styles.wallHeading}><div><span>Misiuni de meci</span><strong>Câștigă reputație.</strong></div><em>+PUNCTE</em></div>
          {missions.map(([title, category, xp], index) => (
            <button
              key={title}
              className={claimed.includes(index) ? styles.missionClaimed : ''}
              onClick={() => {
                setClaimed((current) => current.includes(index) ? current.filter((item) => item !== index) : [...current, index])
                play('success')
              }}
              aria-pressed={claimed.includes(index)}
            >
              <span>0{index + 1}</span><div><small>{category}</small><strong>{title}</strong></div><b>{claimed.includes(index) ? 'GATA' : `+${xp} PR`}</b>
            </button>
          ))}
        </motion.aside>
      </div>
    </section>
  )
}
