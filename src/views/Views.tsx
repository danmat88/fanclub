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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock3,
  Copy,
  Crown,
  Eye,
  EyeOff,
  ExternalLink,
  Flag,
  Flame,
  GitCompareArrows,
  GripHorizontal,
  Heart,
  Headphones,
  History,
  ImagePlus,
  LayoutDashboard,
  LoaderCircle,
  MapPin,
  Maximize2,
  Medal,
  Megaphone,
  MessageCircle,
  Mic2,
  Minus,
  MoreHorizontal,
  Move,
  Newspaper,
  Pause,
  PencilLine,
  Play,
  Plus,
  RotateCcw,
  Search,
  Send,
  Share2,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  Quote,
  ThumbsUp,
  TicketCheck,
  Trophy,
  Undo2,
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
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ChangeEvent,
  type DragEvent as ReactDragEvent,
  type FormEvent,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type RefCallback,
  type SyntheticEvent,
  type UIEvent,
} from 'react'
import { createPortal } from 'react-dom'
import fanEmblem from '../assets/brand/cetatea-fan-emblem.webp'
import arenaBackground from '../assets/brand/loading-cetatea-arena.webp'
import { AppScrollArea } from '../components/AppScrollArea'
import { panelBackdropVariants, panelFromRightVariants, panelLayerVariants } from '../components/panelMotion'
import { useSound } from '../contexts/useSound'
import { club, latestResult, nextMatch, squad, standings, technicalStaff, upcomingFixtures, type FormResult, type Player, type PlayerPosition } from '../data/clubData'
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

const nonSensitiveTextFieldProps = {
  autoCapitalize: 'sentences',
  autoComplete: 'off',
  autoCorrect: 'on',
  'data-1p-ignore': 'true',
  'data-bwignore': 'true',
  'data-form-type': 'other',
  'data-lpignore': 'true',
  inputMode: 'text',
  spellCheck: true,
} as const

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
  const floatingBottomReserve = viewport.width <= 900 ? Math.min(112, viewport.height * .2) : 0
  const floatingTravelY = Math.max(0, viewport.height - floatingHeight - floatingMargin * 2 - floatingBottomReserve)
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
    const maxTop = Math.max(floatingMargin, viewport.height - floatingHeight - floatingMargin - floatingBottomReserve)
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
              <form className={styles.matchRoomComposer} autoComplete="off" onSubmit={sendMessage}>
                <span>CS</span><label><input {...nonSensitiveTextFieldProps} type="text" name="mesaj_camera_meciului" enterKeyHint="send" aria-label="Mesaj pentru camera meciului" value={message} maxLength={72} onChange={(event) => setMessage(event.target.value)} placeholder="Scrie în camera meciului..." /><small>{message.length}/72</small></label><button type="submit" disabled={!message.trim()} aria-label="Trimite mesajul"><Send aria-hidden="true" /></button>
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

type TribuneFilter = 'Toate' | 'Imagini' | 'Sondaje' | 'Meci'
type ComposerMode = 'mesaj' | 'fotografie' | 'sondaj'
type ComposerTone = 'verde' | 'cyan' | 'violet' | 'chihlimbar' | 'roz'
type TribuneSort = 'Recente' | 'În discuție' | 'Apreciate' | 'Salvate'
type TribuneReaction = 'inima' | 'foc' | 'forta'
type AnchoredPanelPlacement = 'above' | 'below'
type TribuneInteractiveFeature = 'jucator' | 'primul-11'
type SupporterFormationId = '4-2-3-1' | '4-3-3' | '3-4-2-1'
type SupporterFormationSlot = {
  id: string
  label: string
  shortLabel: string
  x: number
  y: number
  accepts: PlayerPosition[]
}
type SupporterFormation = {
  id: SupporterFormationId
  name: string
  idea: string
  slots: SupporterFormationSlot[]
}
type FormationDrafts = Record<SupporterFormationId, Record<string, string>>
type TribuneFormation = {
  system: SupporterFormationId
  captainId: string
  assignments: Array<{ slotId: string; playerId: string }>
}
type TribuneMotmCandidate = {
  playerId: string
  matchLine: string
  reason: string
  baseVotes: number
  tone: string
}

type TribunePost = {
  id: string
  author: string
  initials: string
  role: string
  time: string
  text: string
  image?: string
  images?: string[]
  poll?: {
    options: string[]
    votes: number[]
  }
  label?: string
  reactionBase: number
  commentBase: number
  tone: string
  userCreated?: boolean
  colorCard?: boolean
  formation?: TribuneFormation
}

type TribuneComment = {
  id: string
  author: string
  text: string
  time: string
}

const tribuneFilters: TribuneFilter[] = ['Toate', 'Imagini', 'Sondaje', 'Meci']
const tribuneSorts: TribuneSort[] = ['Recente', 'În discuție', 'Apreciate', 'Salvate']
const TRIBUNE_INITIAL_POSTS = 3
const TRIBUNE_POST_BATCH = 3
const TRIBUNE_POST_MENU_ESTIMATED_HEIGHT = 168
const TRIBUNE_REACTION_PICKER_ESTIMATED_HEIGHT = 42
const TRIBUNE_MOTM_STORAGE_KEY = 'cetatea-tribuna-motm-2026-08-08'
const TRIBUNE_FORMATION_STORAGE_KEY = 'cetatea-primul-11-suporter'

const supporterFormations: SupporterFormation[] = [
  {
    id: '4-2-3-1',
    name: 'Echilibru',
    idea: 'Doi mijlocași de control și trei oameni între linii.',
    slots: [
      { id: 'p', label: 'Portar', shortLabel: 'P', x: 50, y: 91, accepts: ['Portar'] },
      { id: 'fd', label: 'Fundaș dreapta', shortLabel: 'FD', x: 86, y: 73, accepts: ['Fundaș'] },
      { id: 'fcd', label: 'Fundaș central', shortLabel: 'FC', x: 62, y: 78, accepts: ['Fundaș'] },
      { id: 'fcs', label: 'Fundaș central', shortLabel: 'FC', x: 38, y: 78, accepts: ['Fundaș'] },
      { id: 'fs', label: 'Fundaș stânga', shortLabel: 'FS', x: 14, y: 73, accepts: ['Fundaș'] },
      { id: 'mcd', label: 'Mijlocaș central', shortLabel: 'MC', x: 63, y: 56, accepts: ['Mijlocaș', 'Fundaș'] },
      { id: 'mcs', label: 'Mijlocaș central', shortLabel: 'MC', x: 37, y: 56, accepts: ['Mijlocaș', 'Fundaș'] },
      { id: 'ed', label: 'Extremă dreapta', shortLabel: 'ED', x: 84, y: 34, accepts: ['Atacant', 'Mijlocaș'] },
      { id: 'mo', label: 'Mijlocaș ofensiv', shortLabel: 'MO', x: 50, y: 39, accepts: ['Mijlocaș', 'Atacant'] },
      { id: 'es', label: 'Extremă stânga', shortLabel: 'ES', x: 16, y: 34, accepts: ['Atacant', 'Mijlocaș'] },
      { id: 'a', label: 'Atacant', shortLabel: 'A', x: 50, y: 14, accepts: ['Atacant'] },
    ],
  },
  {
    id: '4-3-3',
    name: 'Presiune',
    idea: 'Lățime în atac și un triunghi compact la mijloc.',
    slots: [
      { id: 'p', label: 'Portar', shortLabel: 'P', x: 50, y: 91, accepts: ['Portar'] },
      { id: 'fd', label: 'Fundaș dreapta', shortLabel: 'FD', x: 86, y: 73, accepts: ['Fundaș'] },
      { id: 'fcd', label: 'Fundaș central', shortLabel: 'FC', x: 62, y: 78, accepts: ['Fundaș'] },
      { id: 'fcs', label: 'Fundaș central', shortLabel: 'FC', x: 38, y: 78, accepts: ['Fundaș'] },
      { id: 'fs', label: 'Fundaș stânga', shortLabel: 'FS', x: 14, y: 73, accepts: ['Fundaș'] },
      { id: 'md', label: 'Mijlocaș defensiv', shortLabel: 'MD', x: 50, y: 59, accepts: ['Mijlocaș', 'Fundaș'] },
      { id: 'mcd', label: 'Mijlocaș central', shortLabel: 'MC', x: 68, y: 45, accepts: ['Mijlocaș'] },
      { id: 'mcs', label: 'Mijlocaș central', shortLabel: 'MC', x: 32, y: 45, accepts: ['Mijlocaș'] },
      { id: 'ed', label: 'Extremă dreapta', shortLabel: 'ED', x: 82, y: 24, accepts: ['Atacant', 'Mijlocaș'] },
      { id: 'a', label: 'Atacant', shortLabel: 'A', x: 50, y: 13, accepts: ['Atacant'] },
      { id: 'es', label: 'Extremă stânga', shortLabel: 'ES', x: 18, y: 24, accepts: ['Atacant', 'Mijlocaș'] },
    ],
  },
  {
    id: '3-4-2-1',
    name: 'Asediu',
    idea: 'Trei fundași, benzi înalte și doi creatori în spatele vârfului.',
    slots: [
      { id: 'p', label: 'Portar', shortLabel: 'P', x: 50, y: 91, accepts: ['Portar'] },
      { id: 'fcd', label: 'Fundaș central', shortLabel: 'FC', x: 72, y: 76, accepts: ['Fundaș'] },
      { id: 'fc', label: 'Fundaș central', shortLabel: 'FC', x: 50, y: 81, accepts: ['Fundaș'] },
      { id: 'fcs', label: 'Fundaș central', shortLabel: 'FC', x: 28, y: 76, accepts: ['Fundaș'] },
      { id: 'md', label: 'Bandă dreapta', shortLabel: 'BD', x: 85, y: 54, accepts: ['Mijlocaș', 'Fundaș', 'Atacant'] },
      { id: 'mcd', label: 'Mijlocaș central', shortLabel: 'MC', x: 62, y: 57, accepts: ['Mijlocaș'] },
      { id: 'mcs', label: 'Mijlocaș central', shortLabel: 'MC', x: 38, y: 57, accepts: ['Mijlocaș'] },
      { id: 'ms', label: 'Bandă stânga', shortLabel: 'BS', x: 15, y: 54, accepts: ['Mijlocaș', 'Fundaș', 'Atacant'] },
      { id: 'mod', label: 'Creator dreapta', shortLabel: 'MO', x: 65, y: 32, accepts: ['Mijlocaș', 'Atacant'] },
      { id: 'mos', label: 'Creator stânga', shortLabel: 'MO', x: 35, y: 32, accepts: ['Mijlocaș', 'Atacant'] },
      { id: 'a', label: 'Atacant', shortLabel: 'A', x: 50, y: 13, accepts: ['Atacant'] },
    ],
  },
]

const supporterFormationDefaults: Record<SupporterFormationId, string[]> = {
  '4-2-3-1': ['alin-ciobanu', 'andrei-mihai', 'vladut-cimbru', 'ricardo-farcas', 'ciprian-perju', 'gabriel-david', 'vlad-ilie', 'catalin-golofca', 'cosmin-tucaliuc', 'stephane-ferhaoui', 'gabriel-raducan'],
  '4-3-3': ['alin-ciobanu', 'andrei-mihai', 'vladut-cimbru', 'ricardo-farcas', 'ciprian-perju', 'gabriel-david', 'vlad-ilie', 'andrei-cerlinca', 'catalin-golofca', 'gabriel-raducan', 'stephane-ferhaoui'],
  '3-4-2-1': ['alin-ciobanu', 'vladut-cimbru', 'ruslan-chelari', 'ricardo-farcas', 'andrei-mihai', 'gabriel-david', 'vlad-ilie', 'ciprian-perju', 'cosmin-tucaliuc', 'stephane-ferhaoui', 'gabriel-raducan'],
}

const createDefaultFormationDrafts = (): FormationDrafts => Object.fromEntries(
  supporterFormations.map((formation) => [
    formation.id,
    Object.fromEntries(formation.slots.map((slot, index) => [slot.id, supporterFormationDefaults[formation.id][index]])),
  ]),
) as FormationDrafts

const tribuneMotmCandidates: TribuneMotmCandidate[] = [
  { playerId: 'gabriel-raducan', matchLine: 'Gol · atacant central', reason: 'A atacat permanent spațiul și a deschis drumul victoriei.', baseVotes: 382, tone: 'var(--tone-green)' },
  { playerId: 'gabriel-david', matchLine: 'Gol · 78 de minute', reason: 'A controlat centrul terenului și a închis tabela.', baseVotes: 346, tone: 'var(--tone-cyan)' },
  { playerId: 'alin-ciobanu', matchLine: 'Poartă intactă · 90 de minute', reason: 'Sigur la intervenții într-un meci câștigat fără gol primit.', baseVotes: 273, tone: 'var(--tone-violet)' },
  { playerId: 'stephane-ferhaoui', matchLine: 'Pasă decisivă · energie în atac', reason: 'A creat superioritate și a oferit pasa care a rupt echilibrul.', baseVotes: 198, tone: 'var(--tone-amber)' },
  { playerId: 'ciprian-perju', matchLine: '90 de minute · flancul stâng', reason: 'A păstrat echipa compactă și a câștigat duelurile importante.', baseVotes: 124, tone: 'var(--tone-rose)' },
]
const [tribuneMotmHomeScore = '0', tribuneMotmAwayScore = '0'] = latestResult.score.split('–').map((score) => score.trim())

const resolveAnchoredPanelPlacement = (
  anchor: HTMLElement,
  panelHeight: number,
  viewport: HTMLElement | null,
): AnchoredPanelPlacement => {
  const anchorBounds = anchor.getBoundingClientRect()
  const viewportBounds = viewport?.getBoundingClientRect()
  const visibleTop = Math.max(0, viewportBounds?.top ?? 0) + 10
  const visibleBottom = Math.min(window.innerHeight, viewportBounds?.bottom ?? window.innerHeight) - 10
  const availableAbove = anchorBounds.top - visibleTop
  const availableBelow = visibleBottom - anchorBounds.bottom
  const requiredSpace = panelHeight + 12

  if (availableBelow >= requiredSpace) return 'below'
  if (availableAbove >= requiredSpace) return 'above'
  return availableAbove > availableBelow ? 'above' : 'below'
}
const composerTones: Array<{ id: ComposerTone; label: string; color: string }> = [
  { id: 'verde', label: 'Verde Cetatea', color: 'var(--tone-green)' },
  { id: 'cyan', label: 'Albastru Areni', color: 'var(--tone-cyan)' },
  { id: 'violet', label: 'Violet nocturn', color: 'var(--tone-violet)' },
  { id: 'chihlimbar', label: 'Chihlimbar', color: 'var(--tone-amber)' },
  { id: 'roz', label: 'Roșu tribună', color: 'var(--tone-rose)' },
]

const seedTribunePosts: TribunePost[] = [
  {
    id: 'suporter-sondaj',
    author: 'Radu / George Enescu',
    initials: 'RG',
    role: 'Pe Areni din 2009',
    time: 'acum 18 min.',
    text: 'Ce credeți că a făcut diferența în victoria de la Târgu Mureș?',
    poll: {
      options: ['Disciplina echipei', 'Curajul în atac', 'Unitatea grupului'],
      votes: [52, 31, 17],
    },
    label: 'După meci',
    reactionBase: 46,
    commentBase: 0,
    tone: 'var(--tone-violet)',
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
    commentBase: 0,
    tone: 'var(--tone-cyan)',
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
    commentBase: 0,
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
    commentBase: 0,
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
    commentBase: 0,
    tone: 'var(--tone-rose)',
    colorCard: true,
  },
]

const initialTribuneComments: Record<string, TribuneComment[]> = {
  'suporter-sondaj': [
    { id: 'c-1', author: 'Ioana P.', text: 'Atitudinea. Echipa a rămas compactă până la final.', time: '09:41' },
    { id: 'c-2', author: 'Radu / George Enescu', text: 'Rezultatul ne dă exact energia de care aveam nevoie pentru Areni.', time: '09:48' },
  ],
  'suporter-areni': [
    { id: 'c-3', author: 'Mihai C.', text: 'Ne vedem în tribuna a doua. Toți în alb-albastru!', time: 'acum 21 min.' },
  ],
  'suporter-intrebare': [
    { id: 'c-4', author: 'Sorin / Ițcani', text: 'După golul al doilea. Echipa controla fiecare duel.', time: 'acum 37 min.' },
    { id: 'c-5', author: 'Diana M.', text: 'Pentru mine, intervenția portarului de după pauză.', time: 'acum 31 min.' },
  ],
  'analiza-mijloc': [
    { id: 'c-6', author: 'Paul / Centru', text: 'Exact. Presiunea după pierderea mingii a schimbat ritmul.', time: 'acum 46 min.' },
  ],
  'voce-cartier': [
    { id: 'c-7', author: 'Mara S.', text: 'Așa am ajuns și eu prima dată pe Areni, tot cu tata.', time: 'acum 1 oră' },
    { id: 'c-8', author: 'Radu G.', text: 'Poveștile astea ne țin împreună.', time: 'acum 52 min.' },
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

function readStoredMotmVote() {
  const storedVote = readStoredRecord<string | null>(TRIBUNE_MOTM_STORAGE_KEY, null)
  return tribuneMotmCandidates.some((candidate) => candidate.playerId === storedVote) ? storedVote : null
}

function readStoredReactions() {
  const stored = readStoredRecord<Record<string, boolean | TribuneReaction>>('cetatea-tribune-reactions', {})
  return Object.fromEntries(Object.entries(stored).flatMap(([postId, reaction]) => {
    if (reaction === true) return [[postId, 'inima' as TribuneReaction]]
    if (reaction === 'inima' || reaction === 'foc' || reaction === 'forta') return [[postId, reaction]]
    return []
  }))
}

function readStoredFormationDrafts(): FormationDrafts {
  const defaults = createDefaultFormationDrafts()
  const stored = readStoredRecord<Partial<FormationDrafts>>(TRIBUNE_FORMATION_STORAGE_KEY, {})

  supporterFormations.forEach((formation) => {
    const storedDraft = stored[formation.id]
    if (!storedDraft || typeof storedDraft !== 'object') return
    formation.slots.forEach((slot) => {
      const playerId = storedDraft[slot.id]
      if (typeof playerId === 'string' && squad.some((player) => player.id === playerId)) {
        defaults[formation.id][slot.id] = playerId
      }
    })
  })

  return defaults
}

function TribuneFormationCard({ formation, variant = 'feed' }: { formation: TribuneFormation; variant?: 'feed' | 'thread' | 'preview' }) {
  const system = supporterFormations.find((item) => item.id === formation.system) ?? supporterFormations[0]
  const assignmentMap = Object.fromEntries(formation.assignments.map((assignment) => [assignment.slotId, assignment.playerId]))
  const captain = squad.find((player) => player.id === formation.captainId)

  return (
    <section className={styles.tribuneFormationCard} data-variant={variant} aria-label={`Primul 11 al suporterului în sistem ${system.id}`}>
      <header>
        <span><ShieldCheck aria-hidden="true" /><i><small>Primul meu 11</small><strong>{nextMatch.home.name} – {nextMatch.away.name}</strong></i></span>
        <em>{system.id}</em>
      </header>
      <div className={styles.tribuneFormationPitch}>
        <span className={styles.tribuneFormationHalf} aria-hidden="true" />
        <span className={styles.tribuneFormationCircle} aria-hidden="true" />
        <span className={styles.tribuneFormationAreaTop} aria-hidden="true" />
        <span className={styles.tribuneFormationAreaBottom} aria-hidden="true" />
        {system.slots.map((slot) => {
          const player = squad.find((item) => item.id === assignmentMap[slot.id])
          if (!player) return null
          const shortName = player.name.split(' ').at(-1) ?? player.name
          return (
            <span
              key={slot.id}
              className={styles.tribuneFormationPlayer}
              style={{ '--formation-x': `${slot.x}%`, '--formation-y': `${slot.y}%`, '--formation-tone': positionTone[player.position] } as CSSProperties}
            >
              <i><SquadPortrait player={player} lazy />{formation.captainId === player.id && <b>C</b>}</i>
              <strong>{shortName}</strong>
            </span>
          )
        })}
      </div>
      <footer><span><i /> Formația unui suporter</span><strong>{captain ? `Căpitan · ${captain.name.split(' ').at(-1)}` : system.idea}</strong></footer>
    </section>
  )
}

type TribuneMediaMosaicProps = {
  author: string
  images: string[]
  onOpen: (index: number) => void
  onPromote?: (index: number) => void
  onRemove?: (index: number) => void
  variant: 'composer' | 'feed' | 'thread'
}

function markTribuneImageReady(event: SyntheticEvent<HTMLImageElement>) {
  const image = event.currentTarget
  const tile = image.closest<HTMLElement>('[data-media-tile]')
  if (!tile) return
  const ratio = image.naturalWidth / Math.max(1, image.naturalHeight)
  tile.dataset.orientation = ratio > 1.28 ? 'landscape' : ratio < 0.82 ? 'portrait' : 'square'
  tile.dataset.loaded = 'true'
}

function TribuneMediaMosaic({ author, images, onOpen, onPromote, onRemove, variant }: TribuneMediaMosaicProps) {
  const visibleImages = variant === 'thread' ? images.slice(0, 1) : images.slice(0, 4)
  const variantClass = variant === 'composer'
    ? styles.tribuneMediaComposer
    : variant === 'thread'
      ? styles.tribuneMediaThread
      : styles.tribuneMediaFeed

  return (
    <div
      className={`${styles.tribuneMediaMosaic} ${variantClass}`}
      data-count={visibleImages.length}
      aria-label={images.length === 1 ? 'O fotografie' : `${images.length} fotografii`}
    >
      {visibleImages.map((image, index) => {
        const remainingImages = index === visibleImages.length - 1 ? images.length - visibleImages.length : 0
        return (
          <div key={`${image.slice(0, 32)}-${index}`} className={styles.tribuneMediaTile} data-media-tile>
            <button
              type="button"
              className={styles.tribuneMediaOpen}
              onClick={() => onOpen(index)}
              aria-label={`Deschide fotografia ${index + 1} publicată de ${author}`}
            >
              <span className={styles.tribuneMediaBackdrop} aria-hidden="true"><img src={image} alt="" /></span>
              <img
                className={styles.tribuneMediaImage}
                src={image}
                alt={`Fotografia ${index + 1} publicată de ${author}`}
                loading={variant === 'feed' ? 'lazy' : 'eager'}
                decoding="async"
                onLoad={markTribuneImageReady}
              />
              {remainingImages > 0 && <span className={styles.tribuneMediaMore}>+{remainingImages}</span>}
              {variant === 'thread' && images.length > 1 && (
                <span className={styles.tribuneMediaCount}><ImagePlus aria-hidden="true" /> {images.length}</span>
              )}
              {variant !== 'thread' && <span className={styles.tribuneMediaExpand}><Maximize2 aria-hidden="true" /></span>}
            </button>
            {onRemove && (
              <button
                type="button"
                className={styles.tribuneMediaRemove}
                onClick={() => onRemove(index)}
                aria-label={`Elimină fotografia ${index + 1}`}
              ><X aria-hidden="true" /></button>
            )}
            {onPromote && (
              index === 0 ? (
                <span className={styles.tribuneMediaCoverBadge}><Star aria-hidden="true" /> Copertă</span>
              ) : (
                <button
                  type="button"
                  className={styles.tribuneMediaPromote}
                  onClick={() => onPromote(index)}
                  aria-label={`Folosește fotografia ${index + 1} drept copertă`}
                  title="Folosește drept copertă"
                ><Star aria-hidden="true" /></button>
              )
            )}
          </div>
        )
      })}
    </div>
  )
}

const TRIBUNE_IMAGE_MAX_BYTES = 10_000_000
const TRIBUNE_IMAGE_MAX_EDGE = 1920
const TRIBUNE_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp'])

function optimizeTribuneImage(file: File) {
  return new Promise<string>((resolve, reject) => {
    const source = URL.createObjectURL(file)
    const image = new Image()
    image.onload = () => {
      const scale = Math.min(1, TRIBUNE_IMAGE_MAX_EDGE / Math.max(image.naturalWidth, image.naturalHeight))
      const width = Math.max(1, Math.round(image.naturalWidth * scale))
      const height = Math.max(1, Math.round(image.naturalHeight * scale))
      const canvas = document.createElement('canvas')
      canvas.width = width
      canvas.height = height
      const context = canvas.getContext('2d')
      if (!context) {
        URL.revokeObjectURL(source)
        reject(new Error('Canvas indisponibil'))
        return
      }
      context.imageSmoothingEnabled = true
      context.imageSmoothingQuality = 'high'
      context.drawImage(image, 0, 0, width, height)
      const optimized = canvas.toDataURL('image/webp', 0.86)
      URL.revokeObjectURL(source)
      resolve(optimized)
    }
    image.onerror = () => {
      URL.revokeObjectURL(source)
      reject(new Error('Imagine invalidă'))
    }
    image.src = source
  })
}

export function CommunityView() {
  const { play } = useSound()
  const [filter, setFilter] = useState<TribuneFilter>('Toate')
  const [feedSort, setFeedSort] = useState<TribuneSort>('Recente')
  const [filterOpen, setFilterOpen] = useState(false)
  const [showFloatingComposer, setShowFloatingComposer] = useState(false)
  const [visiblePostCount, setVisiblePostCount] = useState(TRIBUNE_INITIAL_POSTS)
  const [mobileTribuneSection, setMobileTribuneSection] = useState<'flux' | 'interactiv' | 'discutie'>('flux')
  const [posts, setPosts] = useState<TribunePost[]>(() => [...readStoredPosts(), ...seedTribunePosts])
  const [reactions, setReactions] = useState<Record<string, TribuneReaction>>(() => readStoredReactions())
  const [comments, setComments] = useState<Record<string, TribuneComment[]>>(
    () => ({ ...initialTribuneComments, ...readStoredRecord<Record<string, TribuneComment[]>>('cetatea-tribune-comments', {}) }),
  )
  const [composerOpen, setComposerOpen] = useState(false)
  const [composerText, setComposerText] = useState(() => localStorage.getItem('cetatea-tribune-draft') ?? '')
  const [composerImages, setComposerImages] = useState<string[]>([])
  const [processingImages, setProcessingImages] = useState(false)
  const [composerPollOptions, setComposerPollOptions] = useState(['', ''])
  const [attachMatch, setAttachMatch] = useState(false)
  const [composerError, setComposerError] = useState('')
  const [composerMode, setComposerMode] = useState<ComposerMode>('mesaj')
  const [composerTone, setComposerTone] = useState<ComposerTone>('verde')
  const [composerAppearanceOpen, setComposerAppearanceOpen] = useState(false)
  const [bookmarks, setBookmarks] = useState<Record<string, boolean>>(
    () => readStoredRecord('cetatea-tribune-bookmarks', {}),
  )
  const [hiddenPosts, setHiddenPosts] = useState<Record<string, boolean>>(
    () => readStoredRecord('cetatea-tribune-hidden', {}),
  )
  const [postMenuId, setPostMenuId] = useState<string | null>(null)
  const [postMenuPlacement, setPostMenuPlacement] = useState<AnchoredPanelPlacement>('below')
  const [copiedPostId, setCopiedPostId] = useState<string | null>(null)
  const [lastHiddenPostId, setLastHiddenPostId] = useState<string | null>(null)
  const [reactionBurst, setReactionBurst] = useState<{ postId: string; reaction: TribuneReaction } | null>(null)
  const [reactionPickerPostId, setReactionPickerPostId] = useState<string | null>(null)
  const [reactionPickerPlacement, setReactionPickerPlacement] = useState<AnchoredPanelPlacement>('above')
  const [motmVote, setMotmVote] = useState<string | null>(() => readStoredMotmVote())
  const [motmSelection, setMotmSelection] = useState(
    () => readStoredMotmVote() ?? tribuneMotmCandidates[0].playerId,
  )
  const [motmEditingVote, setMotmEditingVote] = useState(false)
  const [interactiveFeature, setInteractiveFeature] = useState<TribuneInteractiveFeature>('jucator')
  const [formationSystem, setFormationSystem] = useState<SupporterFormationId>(() => {
    const stored = localStorage.getItem('cetatea-primul-11-sistem')
    return supporterFormations.some((formation) => formation.id === stored) ? stored as SupporterFormationId : '4-2-3-1'
  })
  const [formationDrafts, setFormationDrafts] = useState<FormationDrafts>(() => readStoredFormationDrafts())
  const [selectedFormationSlot, setSelectedFormationSlot] = useState('a')
  const [formationRosterMode, setFormationRosterMode] = useState<'potriviti' | 'tot-lotul'>('potriviti')
  const [formationCaptain, setFormationCaptain] = useState(() => localStorage.getItem('cetatea-primul-11-capitan') ?? 'gabriel-david')
  const [formationShareOpen, setFormationShareOpen] = useState(false)
  const [formationShareText, setFormationShareText] = useState('Așa aș începe următorul meci. Voi pe cine ați schimba?')
  const [formationPublishedId, setFormationPublishedId] = useState<string | null>(null)
  const [formationDrag, setFormationDrag] = useState<{ playerId: string; x: number; y: number } | null>(null)
  const [formationDropSlot, setFormationDropSlot] = useState<string | null>(null)
  const [activePostId, setActivePostId] = useState<string | null>(null)
  const [commentDraft, setCommentDraft] = useState('')
  const [likedComments, setLikedComments] = useState<Record<string, boolean>>(
    () => readStoredRecord('cetatea-tribune-comment-likes', {}),
  )
  const [mediaViewer, setMediaViewer] = useState<{ images: string[]; index: number; author: string } | null>(null)
  const [pollVotes, setPollVotes] = useState<Record<string, number>>(
    () => readStoredRecord('cetatea-tribune-poll-votes', {}),
  )
  const reactionHoldTimerRef = useRef<number | null>(null)
  const reactionHoldOpenedRef = useRef(false)
  const mediaSwipeStartRef = useRef<{ x: number; y: number } | null>(null)
  const feedViewportRef = useRef<HTMLDivElement>(null)
  const composerDockRef = useRef<HTMLElement>(null)
  const feedLoadMoreRef = useRef<HTMLDivElement>(null)
  const postMenuAnchorRef = useRef<HTMLButtonElement>(null)
  const postMenuPanelRef = useRef<HTMLDivElement>(null)
  const reactionPickerAnchorRef = useRef<HTMLButtonElement>(null)
  const reactionPickerPanelRef = useRef<HTMLDivElement>(null)
  const formationPointerRef = useRef<{ playerId: string; sourceSlotId?: string; pointerId: number; startX: number; startY: number; dragged: boolean } | null>(null)
  const formationSuppressClickRef = useRef(false)
  const [composerViewport, setComposerViewport] = useState({
    height: window.innerHeight,
    keyboardOpen: false,
    offsetTop: 0,
  })

  const visiblePosts = useMemo(() => {
    const filtered = posts.filter((post) => {
      if (hiddenPosts[post.id]) return false
      if (feedSort === 'Salvate' && !bookmarks[post.id]) return false
      if (filter === 'Imagini') return Boolean(post.images?.length || post.image)
      if (filter === 'Sondaje') return Boolean(post.poll)
      if (filter === 'Meci') return Boolean(post.label?.toLocaleLowerCase('ro').includes('meci'))
      return true
    })
    if (feedSort === 'Recente' || feedSort === 'Salvate') return filtered

    if (feedSort === 'În discuție') {
      return [...filtered].sort((a, b) => (
        b.commentBase + (comments[b.id]?.length ?? 0)
      ) - (
        a.commentBase + (comments[a.id]?.length ?? 0)
      ))
    }
    return [...filtered].sort((a, b) => (
      b.reactionBase + (reactions[b.id] ? 1 : 0)
    ) - (
      a.reactionBase + (reactions[a.id] ? 1 : 0)
    ))
  }, [bookmarks, comments, feedSort, filter, hiddenPosts, posts, reactions])

  const updateFloatingComposerVisibility = useCallback((viewport = feedViewportRef.current) => {
    const composerDock = composerDockRef.current
    if (!viewport || !composerDock) {
      setShowFloatingComposer(false)
      return
    }

    const viewportBounds = viewport.getBoundingClientRect()
    const composerBounds = composerDock.getBoundingClientRect()
    const feedCanScroll = viewport.scrollHeight > viewport.clientHeight + 1
    const composerDistanceFromTop = composerBounds.bottom - viewportBounds.top

    setShowFloatingComposer((current) => {
      if (!feedCanScroll) return false
      if (composerDistanceFromTop <= -6) return true
      if (composerDistanceFromTop >= 6) return false
      return current
    })
  }, [])

  const renderedPosts = visiblePosts.slice(0, visiblePostCount)
  const hasMorePosts = visiblePostCount < visiblePosts.length
  const activeSupporterFormation = supporterFormations.find((formation) => formation.id === formationSystem) ?? supporterFormations[0]
  const activeFormationDraft = formationDrafts[formationSystem]
  const activeFormationSlot = activeSupporterFormation.slots.find((slot) => slot.id === selectedFormationSlot) ?? activeSupporterFormation.slots.at(-1)!
  const activeFormationPlayerIds = activeSupporterFormation.slots.map((slot) => activeFormationDraft[slot.id]).filter(Boolean)
  const formationCompleteCount = new Set(activeFormationPlayerIds).size
  const selectedFormationPlayer = squad.find((player) => player.id === activeFormationDraft[activeFormationSlot.id])
  const resolvedFormationCaptain = activeFormationPlayerIds.includes(formationCaptain) ? formationCaptain : activeFormationPlayerIds[0] ?? ''
  const formationRosterPlayers = squad.filter((player) => (
    formationRosterMode === 'tot-lotul' || activeFormationSlot.accepts.includes(player.position)
  )).sort((first, second) => {
    const firstSelected = activeFormationPlayerIds.includes(first.id) ? 1 : 0
    const secondSelected = activeFormationPlayerIds.includes(second.id) ? 1 : 0
    if (firstSelected !== secondSelected) return secondSelected - firstSelected
    return (second.appearances ?? 0) - (first.appearances ?? 0) || first.name.localeCompare(second.name, 'ro')
  })
  const formationForSharing: TribuneFormation = {
    system: formationSystem,
    captainId: resolvedFormationCaptain,
    assignments: activeSupporterFormation.slots
      .map((slot) => ({ slotId: slot.id, playerId: activeFormationDraft[slot.id] }))
      .filter((assignment) => Boolean(assignment.playerId)),
  }

  useEffect(() => {
    setVisiblePostCount(TRIBUNE_INITIAL_POSTS)
  }, [feedSort, filter])

  useEffect(() => {
    localStorage.setItem(TRIBUNE_FORMATION_STORAGE_KEY, JSON.stringify(formationDrafts))
  }, [formationDrafts])

  useEffect(() => {
    localStorage.setItem('cetatea-primul-11-sistem', formationSystem)
  }, [formationSystem])

  useEffect(() => {
    localStorage.setItem('cetatea-primul-11-capitan', formationCaptain)
  }, [formationCaptain])

  useEffect(() => {
    const viewport = feedViewportRef.current
    const sentinel = feedLoadMoreRef.current
    if (!viewport || !sentinel || !hasMorePosts) return

    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting) return
      setVisiblePostCount((current) => Math.min(current + TRIBUNE_POST_BATCH, visiblePosts.length))
    }, {
      root: viewport,
      rootMargin: '0px 0px 280px 0px',
      threshold: 0.01,
    })

    observer.observe(sentinel)
    return () => observer.disconnect()
  }, [hasMorePosts, visiblePostCount, visiblePosts.length])

  useLayoutEffect(() => {
    const viewport = feedViewportRef.current
    const composerDock = composerDockRef.current
    if (!viewport || !composerDock) return

    const updateVisibility = () => updateFloatingComposerVisibility(viewport)
    const resizeObserver = new ResizeObserver(updateVisibility)
    resizeObserver.observe(viewport)
    resizeObserver.observe(composerDock.parentElement ?? composerDock)
    updateVisibility()

    return () => resizeObserver.disconnect()
  }, [updateFloatingComposerVisibility, visiblePosts])

  useLayoutEffect(() => {
    const anchor = postMenuAnchorRef.current
    const panel = postMenuPanelRef.current
    if (!postMenuId || !anchor || !panel) return

    const updatePlacement = () => setPostMenuPlacement(resolveAnchoredPanelPlacement(
      anchor,
      panel.getBoundingClientRect().height,
      feedViewportRef.current,
    ))
    updatePlacement()
    window.addEventListener('resize', updatePlacement)
    return () => window.removeEventListener('resize', updatePlacement)
  }, [postMenuId])

  useLayoutEffect(() => {
    const anchor = reactionPickerAnchorRef.current
    const panel = reactionPickerPanelRef.current
    if (!reactionPickerPostId || !anchor || !panel) return

    const updatePlacement = () => setReactionPickerPlacement(resolveAnchoredPanelPlacement(
      anchor,
      panel.getBoundingClientRect().height,
      feedViewportRef.current,
    ))
    updatePlacement()
    window.addEventListener('resize', updatePlacement)
    return () => window.removeEventListener('resize', updatePlacement)
  }, [reactionPickerPostId])

  const activePost = posts.find((post) => post.id === activePostId)
  const activePostComments = activePost ? comments[activePost.id] ?? [] : []
  const activePostReaction = activePost ? reactions[activePost.id] : undefined
  const composerValidPollOptions = composerPollOptions.filter((option) => option.trim()).length
  const composerCanPublish = !processingImages && (composerMode === 'sondaj'
    ? Boolean(composerText.trim()) && composerValidPollOptions >= 2
    : Boolean(composerText.trim() || composerImages.length))
  const commentInputRef = useRef<HTMLInputElement>(null)
  const totalContributions = posts.reduce((total, post) => (
    total + post.reactionBase + post.commentBase + (comments[post.id]?.length ?? 0)
  ), 0)
  const motmCandidates = useMemo(() => tribuneMotmCandidates.map((candidate) => ({
    ...candidate,
    player: squad.find((player) => player.id === candidate.playerId) ?? squad[0],
    votes: candidate.baseVotes + (motmVote === candidate.playerId ? 1 : 0),
  })), [motmVote])
  const motmResults = useMemo(() => [...motmCandidates].sort((left, right) => right.votes - left.votes), [motmCandidates])
  const motmTotalVotes = motmResults.reduce((total, candidate) => total + candidate.votes, 0)
  const motmLeader = motmResults[0]
  const selectedMotmCandidate = motmCandidates.find((candidate) => candidate.playerId === motmSelection) ?? motmCandidates[0]
  const userMotmCandidate = motmVote ? motmCandidates.find((candidate) => candidate.playerId === motmVote) : null
  const motmResultsVisible = Boolean(motmVote) && !motmEditingVote
  const motmLead = motmResults.length > 1 ? motmResults[0].votes - motmResults[1].votes : 0
  const motmDuelVotes = (motmResults[0]?.votes ?? 0) + (motmResults[1]?.votes ?? 0)
  const motmDuelShare = motmDuelVotes ? Math.round(((motmResults[0]?.votes ?? 0) / motmDuelVotes) * 100) : 50

  useEffect(() => {
    localStorage.setItem('cetatea-tribune-reactions', JSON.stringify(reactions))
  }, [reactions])

  useEffect(() => {
    localStorage.setItem('cetatea-tribune-comments', JSON.stringify(comments))
  }, [comments])

  useEffect(() => {
    localStorage.setItem('cetatea-tribune-comment-likes', JSON.stringify(likedComments))
  }, [likedComments])

  useEffect(() => {
    localStorage.setItem('cetatea-tribune-bookmarks', JSON.stringify(bookmarks))
  }, [bookmarks])

  useEffect(() => {
    localStorage.setItem('cetatea-tribune-hidden', JSON.stringify(hiddenPosts))
  }, [hiddenPosts])

  useEffect(() => {
    localStorage.setItem('cetatea-tribune-poll-votes', JSON.stringify(pollVotes))
  }, [pollVotes])

  useEffect(() => {
    if (motmVote) localStorage.setItem(TRIBUNE_MOTM_STORAGE_KEY, JSON.stringify(motmVote))
    else localStorage.removeItem(TRIBUNE_MOTM_STORAGE_KEY)
  }, [motmVote])

  useEffect(() => {
    if (composerText.trim()) localStorage.setItem('cetatea-tribune-draft', composerText)
    else localStorage.removeItem('cetatea-tribune-draft')
  }, [composerText])

  useLayoutEffect(() => {
    if (!composerOpen) return

    const viewport = window.visualViewport
    const initialHeight = viewport?.height ?? window.innerHeight
    const updateComposerViewport = () => {
      const height = viewport?.height ?? window.innerHeight
      const offsetTop = viewport?.offsetTop ?? 0
      setComposerViewport({
        height,
        keyboardOpen: initialHeight - height > 96,
        offsetTop,
      })
    }

    updateComposerViewport()
    viewport?.addEventListener('resize', updateComposerViewport)
    viewport?.addEventListener('scroll', updateComposerViewport)
    window.addEventListener('resize', updateComposerViewport)

    return () => {
      viewport?.removeEventListener('resize', updateComposerViewport)
      viewport?.removeEventListener('scroll', updateComposerViewport)
      window.removeEventListener('resize', updateComposerViewport)
    }
  }, [composerOpen])

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return
      if (mediaViewer) {
        setMediaViewer(null)
        return
      }
      if (composerOpen) {
        setComposerOpen(false)
        return
      }
      if (postMenuId) {
        setPostMenuId(null)
        window.requestAnimationFrame(() => postMenuAnchorRef.current?.focus())
        return
      }
      if (reactionPickerPostId) {
        setReactionPickerPostId(null)
        window.requestAnimationFrame(() => reactionPickerAnchorRef.current?.focus())
        return
      }
      if (activePostId) {
        setActivePostId(null)
        setMobileTribuneSection('flux')
      }
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [activePostId, composerOpen, mediaViewer, postMenuId, reactionPickerPostId])

  useEffect(() => {
    const closePostMenu = (event: PointerEvent) => {
      if (!(event.target as HTMLElement).closest('[data-tribune-menu]')) setPostMenuId(null)
      if (!(event.target as HTMLElement).closest('[data-reaction-control]')) setReactionPickerPostId(null)
    }
    document.addEventListener('pointerdown', closePostMenu)
    return () => document.removeEventListener('pointerdown', closePostMenu)
  }, [])

  useEffect(() => () => {
    if (reactionHoldTimerRef.current !== null) window.clearTimeout(reactionHoldTimerRef.current)
  }, [])

  useEffect(() => {
    if (!lastHiddenPostId) return
    const timer = window.setTimeout(() => setLastHiddenPostId(null), 5000)
    return () => window.clearTimeout(timer)
  }, [lastHiddenPostId])

  useEffect(() => {
    if (!mediaViewer || mediaViewer.images.length < 2) return
    const onMediaKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return
      const direction = event.key === 'ArrowLeft' ? -1 : 1
      setMediaViewer((current) => current ? {
        ...current,
        index: (current.index + direction + current.images.length) % current.images.length,
      } : null)
    }
    document.addEventListener('keydown', onMediaKeyDown)
    return () => document.removeEventListener('keydown', onMediaKeyDown)
  }, [mediaViewer])

  useEffect(() => {
    if (!mediaViewer || mediaViewer.images.length < 2) return
    const previousIndex = (mediaViewer.index - 1 + mediaViewer.images.length) % mediaViewer.images.length
    const nextIndex = (mediaViewer.index + 1) % mediaViewer.images.length
    ;[previousIndex, nextIndex].forEach((index) => {
      const preload = new Image()
      preload.src = mediaViewer.images[index]
    })
  }, [mediaViewer])

  const persistUserPosts = (nextPosts: TribunePost[]) => {
    const userPosts = nextPosts.filter((post) => post.userCreated)
    try {
      localStorage.setItem('cetatea-tribune-posts', JSON.stringify(userPosts))
    } catch {
      const withoutImages = userPosts.map((post) => ({ ...post, image: undefined, images: undefined }))
      localStorage.setItem('cetatea-tribune-posts', JSON.stringify(withoutImages))
    }
  }

  const openComposer = () => {
    setActivePostId(null)
    setPostMenuId(null)
    setReactionPickerPostId(null)
    setMobileTribuneSection('flux')
    setComposerAppearanceOpen(false)
    setComposerOpen(true)
    play('toggle')
  }

  const openComposerFor = (mode: ComposerMode) => {
    setComposerMode(mode)
    openComposer()
  }

  const handlePhoto = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []).slice(0, Math.max(0, 4 - composerImages.length))
    event.target.value = ''
    if (!files.length || processingImages) return
    if (files.some((file) => !TRIBUNE_IMAGE_TYPES.has(file.type))) {
      setComposerError('Folosește fotografii JPG, PNG sau WEBP.')
      return
    }
    if (files.some((file) => file.size > TRIBUNE_IMAGE_MAX_BYTES)) {
      setComposerError('Fiecare fotografie poate avea maximum 10 MB.')
      return
    }
    setProcessingImages(true)
    setComposerError('')
    Promise.all(files.map(optimizeTribuneImage)).then((images) => {
      setComposerImages((current) => [...current, ...images.filter(Boolean)].slice(0, 4))
      setComposerMode('fotografie')
      setComposerError('')
    }).catch(() => setComposerError('Fotografia nu a putut fi procesată. Încearcă o altă imagine.'))
      .finally(() => setProcessingImages(false))
  }

  const publishPost = (event: FormEvent) => {
    event.preventDefault()
    const text = composerText.trim()
    const pollOptions = composerPollOptions.map((option) => option.trim()).filter(Boolean)
    if (!text && !composerImages.length) return
    if (composerMode === 'sondaj' && !text) {
      setComposerError('Scrie întrebarea sondajului înainte de publicare.')
      return
    }
    if (composerMode === 'sondaj' && pollOptions.length < 2) {
      setComposerError('Adaugă cel puțin două variante de răspuns.')
      return
    }

    const newPost: TribunePost = {
      id: `suporter-${Date.now()}`,
      author: 'Suporter Cetatea',
      initials: 'SC',
      role: 'Pe Areni, împreună',
      time: 'acum',
      text,
      images: composerImages.length ? composerImages : undefined,
      poll: composerMode === 'sondaj' ? { options: pollOptions, votes: pollOptions.map(() => 0) } : undefined,
      label: attachMatch ? 'Despre meci' : undefined,
      reactionBase: 0,
      commentBase: 0,
      tone: composerTones.find((tone) => tone.id === composerTone)?.color ?? 'var(--tone-green)',
      userCreated: true,
    }
    const nextPosts = [newPost, ...posts]
    setPosts(nextPosts)
    persistUserPosts(nextPosts)
    setComposerText('')
    setComposerImages([])
    setComposerPollOptions(['', ''])
    setAttachMatch(false)
    setComposerError('')
    setComposerMode('mesaj')
    setComposerTone('verde')
    setComposerAppearanceOpen(false)
    localStorage.removeItem('cetatea-tribune-draft')
    setComposerOpen(false)
    setFilter('Toate')
    setFeedSort('Recente')
    setVisiblePostCount(TRIBUNE_INITIAL_POSTS)
    setShowFloatingComposer(false)
    play('success')
  }

  const assignFormationPlayer = useCallback((slotId: string, playerId: string) => {
    setFormationDrafts((current) => {
      const draft = { ...current[formationSystem] }
      const previousSlot = Object.entries(draft).find(([, assignedPlayerId]) => assignedPlayerId === playerId)?.[0]
      const replacedPlayer = draft[slotId]

      draft[slotId] = playerId
      if (previousSlot && previousSlot !== slotId) draft[previousSlot] = replacedPlayer

      return { ...current, [formationSystem]: draft }
    })
    setSelectedFormationSlot(slotId)
    play('toggle')
  }, [formationSystem, play])

  const selectSupporterFormation = (system: SupporterFormationId) => {
    setFormationSystem(system)
    setSelectedFormationSlot('a')
    setFormationRosterMode('potriviti')
    play('navigate')
  }

  const resetSupporterFormation = () => {
    const defaults = createDefaultFormationDrafts()
    setFormationDrafts((current) => ({ ...current, [formationSystem]: defaults[formationSystem] }))
    setSelectedFormationSlot('a')
    play('success')
  }

  const handleFormationDragStart = (event: ReactDragEvent<HTMLElement>, playerId: string, sourceSlotId?: string) => {
    event.dataTransfer.effectAllowed = 'move'
    event.dataTransfer.setData('application/x-cetatea-player', JSON.stringify({ playerId, sourceSlotId }))
    event.dataTransfer.setData('text/plain', playerId)
  }

  const handleFormationDrop = (event: ReactDragEvent<HTMLElement>, slotId: string) => {
    event.preventDefault()
    let playerId = event.dataTransfer.getData('text/plain')
    try {
      const payload = JSON.parse(event.dataTransfer.getData('application/x-cetatea-player') || '{}') as { playerId?: string }
      playerId = payload.playerId ?? playerId
    } catch {
      // Identificatorul text rămâne alternativa sigură pentru drag-and-drop nativ.
    }
    if (squad.some((player) => player.id === playerId)) assignFormationPlayer(slotId, playerId)
    setFormationDrag(null)
    setFormationDropSlot(null)
  }

  const beginFormationPointerDrag = (event: ReactPointerEvent<HTMLElement>, playerId: string, sourceSlotId?: string) => {
    if (event.button !== 0 || event.pointerType === 'mouse') return
    formationPointerRef.current = {
      playerId,
      sourceSlotId,
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      dragged: false,
    }
    event.currentTarget.setPointerCapture?.(event.pointerId)
  }

  const moveFormationPointerDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const pointer = formationPointerRef.current
    if (!pointer || pointer.pointerId !== event.pointerId) return
    const distance = Math.hypot(event.clientX - pointer.startX, event.clientY - pointer.startY)
    if (distance > 6) pointer.dragged = true
    if (!pointer.dragged) return
    event.preventDefault()
    setFormationDrag({ playerId: pointer.playerId, x: event.clientX, y: event.clientY })
    setFormationDropSlot(document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-formation-slot]')?.dataset.formationSlot ?? null)
  }

  const finishFormationPointerDrag = (event: ReactPointerEvent<HTMLElement>) => {
    const pointer = formationPointerRef.current
    formationPointerRef.current = null
    if (!pointer || pointer.pointerId !== event.pointerId) return
    event.currentTarget.releasePointerCapture?.(event.pointerId)
    if (!pointer.dragged) return

    formationSuppressClickRef.current = true
    const dropTarget = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>('[data-formation-slot]')
    const slotId = dropTarget?.dataset.formationSlot
    if (slotId) assignFormationPlayer(slotId, pointer.playerId)
    setFormationDrag(null)
    setFormationDropSlot(null)
    window.setTimeout(() => { formationSuppressClickRef.current = false }, 0)
  }

  const handleFormationSlotClick = (slotId: string) => {
    if (formationSuppressClickRef.current) return
    setSelectedFormationSlot(slotId)
    setFormationRosterMode('potriviti')
    play('navigate')
  }

  const handleFormationRosterClick = (playerId: string) => {
    if (formationSuppressClickRef.current) return
    assignFormationPlayer(activeFormationSlot.id, playerId)
  }

  const openFormationShare = () => {
    if (formationCompleteCount !== 11) return
    setFormationShareText('Așa aș începe următorul meci. Voi pe cine ați schimba?')
    setFormationShareOpen(true)
    play('toggle')
  }

  const publishFormationPost = (event: FormEvent) => {
    event.preventDefault()
    if (formationCompleteCount !== 11) return
    const postId = `primul-11-${Date.now()}`
    const newPost: TribunePost = {
      id: postId,
      author: 'Suporter Cetatea',
      initials: 'SC',
      role: 'Pe Areni, împreună',
      time: 'acum',
      text: formationShareText.trim() || 'Acesta este primul meu 11 pentru următorul meci.',
      label: 'Primul 11 · Meci',
      reactionBase: 0,
      commentBase: 0,
      tone: 'var(--tone-green)',
      userCreated: true,
      formation: formationForSharing,
    }
    const nextPosts = [newPost, ...posts]
    setPosts(nextPosts)
    persistUserPosts(nextPosts)
    setFormationShareOpen(false)
    setFormationPublishedId(postId)
    setMobileTribuneSection('flux')
    setActivePostId(null)
    setFilter('Toate')
    setFeedSort('Recente')
    setVisiblePostCount(TRIBUNE_INITIAL_POSTS)
    setShowFloatingComposer(false)
    window.requestAnimationFrame(() => feedViewportRef.current?.scrollTo({ top: 0, behavior: 'smooth' }))
    window.setTimeout(() => setFormationPublishedId((current) => current === postId ? null : current), 3200)
    play('success')
  }

  const toggleReaction = (postId: string, reaction: TribuneReaction) => {
    const removingReaction = reactions[postId] === reaction
    if (!removingReaction) {
      setReactionBurst({ postId, reaction })
      window.setTimeout(() => setReactionBurst((current) => current?.postId === postId ? null : current), 720)
    }
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

  const selectReaction = (postId: string, reaction: TribuneReaction) => {
    toggleReaction(postId, reaction)
    setReactionPickerPostId(null)
  }

  const togglePostMenu = (event: ReactMouseEvent<HTMLButtonElement>, postId: string) => {
    const opening = postMenuId !== postId
    postMenuAnchorRef.current = event.currentTarget
    setReactionPickerPostId(null)
    setPostMenuId(opening ? postId : null)
    if (opening) {
      setPostMenuPlacement(resolveAnchoredPanelPlacement(
        event.currentTarget,
        TRIBUNE_POST_MENU_ESTIMATED_HEIGHT,
        feedViewportRef.current,
      ))
    }
    play('toggle')
  }

  const toggleReactionPicker = (event: ReactMouseEvent<HTMLButtonElement>, postId: string) => {
    const opening = reactionPickerPostId !== postId
    reactionPickerAnchorRef.current = event.currentTarget
    setPostMenuId(null)
    setReactionPickerPostId(opening ? postId : null)
    if (opening) {
      setReactionPickerPlacement(resolveAnchoredPanelPlacement(
        event.currentTarget,
        TRIBUNE_REACTION_PICKER_ESTIMATED_HEIGHT,
        feedViewportRef.current,
      ))
      play('toggle')
    }
  }

  const startReactionHold = (event: ReactPointerEvent<HTMLButtonElement>, postId: string) => {
    if (event.pointerType === 'mouse') return
    const anchor = event.currentTarget
    reactionPickerAnchorRef.current = anchor
    setReactionPickerPlacement(resolveAnchoredPanelPlacement(
      anchor,
      TRIBUNE_REACTION_PICKER_ESTIMATED_HEIGHT,
      feedViewportRef.current,
    ))
    if (reactionHoldTimerRef.current !== null) window.clearTimeout(reactionHoldTimerRef.current)
    reactionHoldOpenedRef.current = false
    reactionHoldTimerRef.current = window.setTimeout(() => {
      reactionHoldOpenedRef.current = true
      setPostMenuId(null)
      setReactionPickerPostId(postId)
      play('toggle')
    }, 420)
  }

  const finishReactionHold = () => {
    if (reactionHoldTimerRef.current !== null) window.clearTimeout(reactionHoldTimerRef.current)
    reactionHoldTimerRef.current = null
  }

  const activatePrimaryReaction = (postId: string, reaction?: TribuneReaction) => {
    finishReactionHold()
    if (reactionHoldOpenedRef.current) {
      reactionHoldOpenedRef.current = false
      return
    }
    selectReaction(postId, reaction ?? 'forta')
  }

  const toggleBookmark = (postId: string) => {
    setBookmarks((current) => ({ ...current, [postId]: !current[postId] }))
    play('toggle')
  }

  const copyPostText = async (post: TribunePost) => {
    try {
      await navigator.clipboard.writeText(post.text)
      setCopiedPostId(post.id)
      window.setTimeout(() => setCopiedPostId((current) => current === post.id ? null : current), 1800)
      play('success')
    } catch {
      setCopiedPostId(null)
    }
    setPostMenuId(null)
  }

  const hidePost = (postId: string) => {
    setHiddenPosts((current) => ({ ...current, [postId]: true }))
    setLastHiddenPostId(postId)
    setPostMenuId(null)
    play('toggle')
  }

  const undoHiddenPost = () => {
    if (!lastHiddenPostId) return
    setHiddenPosts((current) => ({ ...current, [lastHiddenPostId]: false }))
    setLastHiddenPostId(null)
    play('success')
  }

  const openPost = (postId: string) => {
    setComposerOpen(false)
    setPostMenuId(null)
    setReactionPickerPostId(null)
    setActivePostId(postId)
    setMobileTribuneSection('discutie')
    play('toggle')
  }

  const handleFeedScroll = (event: UIEvent<HTMLDivElement>) => {
    if (postMenuId) setPostMenuId(null)
    if (reactionPickerPostId) setReactionPickerPostId(null)
    updateFloatingComposerVisibility(event.currentTarget)
  }

  const openMediaViewer = (images: string[], index: number, author: string) => {
    setPostMenuId(null)
    setReactionPickerPostId(null)
    setMediaViewer({ images, index, author })
    play('toggle')
  }

  const moveMediaViewer = (direction: -1 | 1) => {
    setMediaViewer((current) => current ? {
      ...current,
      index: (current.index + direction + current.images.length) % current.images.length,
    } : null)
    play('navigate')
  }

  const beginMediaSwipe = (event: ReactPointerEvent<HTMLDivElement>) => {
    mediaSwipeStartRef.current = { x: event.clientX, y: event.clientY }
  }

  const finishMediaSwipe = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = mediaSwipeStartRef.current
    mediaSwipeStartRef.current = null
    if (!start || !mediaViewer || mediaViewer.images.length < 2) return
    const horizontalDistance = event.clientX - start.x
    const verticalDistance = event.clientY - start.y
    if (Math.abs(horizontalDistance) < 48 || Math.abs(horizontalDistance) <= Math.abs(verticalDistance) * 1.15) return
    moveMediaViewer(horizontalDistance < 0 ? 1 : -1)
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

  const replyToComment = (author: string) => {
    setCommentDraft(`@${author} `)
    window.requestAnimationFrame(() => commentInputRef.current?.focus())
    play('toggle')
  }

  const toggleCommentLike = (commentId: string) => {
    setLikedComments((current) => ({ ...current, [commentId]: !current[commentId] }))
    play('toggle')
  }

  const selectPollVote = (postId: string, index: number) => {
    setPollVotes((current) => ({ ...current, [postId]: index }))
    play('toggle')
  }

  const selectMotmCandidate = (playerId: string) => {
    setMotmSelection(playerId)
    play('navigate')
  }

  const stepMotmCandidate = (direction: -1 | 1) => {
    const currentIndex = motmCandidates.findIndex((candidate) => candidate.playerId === motmSelection)
    const nextIndex = (currentIndex + direction + motmCandidates.length) % motmCandidates.length
    selectMotmCandidate(motmCandidates[nextIndex].playerId)
  }

  const confirmMotmVote = () => {
    if (!motmSelection) return
    setMotmVote(motmSelection)
    setMotmEditingVote(false)
    play('success')
  }

  const editMotmVote = () => {
    if (motmVote) setMotmSelection(motmVote)
    setMotmEditingVote(true)
    play('toggle')
  }

  const activePostImages = activePost
    ? activePost.images?.length ? activePost.images : activePost.image ? [activePost.image] : []
    : []
  const activePostCommentCount = activePost ? activePost.commentBase + activePostComments.length : 0

  const discussionPanel = activePost ? (
    <motion.aside
      key={`discutie-${activePost.id}`}
      className={`${styles.tribuneThread} ${styles.tribuneThreadRail}`}
      aria-label={`Discuție: ${activePost.author}`}
      initial={{ opacity: 0, x: 24 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 18 }}
    >
      <header className={styles.tribuneThreadTopbar}>
        <button type="button" onClick={() => { setActivePostId(null); setMobileTribuneSection('flux') }} aria-label="Înapoi la fluxul Tribunei"><ArrowLeft /></button>
        <span>
          <strong>Conversație</strong>
          <small>{activePostCommentCount === 1 ? 'Un răspuns' : `${activePostCommentCount} răspunsuri`} de la suporteri</small>
        </span>
        <button
          type="button"
          className={bookmarks[activePost.id] ? styles.tribuneBookmarked : ''}
          aria-label={bookmarks[activePost.id] ? 'Elimină din postările salvate' : 'Salvează postarea'}
          aria-pressed={Boolean(bookmarks[activePost.id])}
          onClick={() => toggleBookmark(activePost.id)}
        >
          <Bookmark fill={bookmarks[activePost.id] ? 'currentColor' : 'none'} />
        </button>
      </header>
      <section className={styles.tribuneThreadSource} style={{ '--post-tone': activePost.tone } as CSSProperties}>
        <header>
          <span className={styles.tribunePostAvatar}>{activePost.initials}<i /></span>
          <span><strong>{activePost.author}</strong><small>{activePost.role} · {activePost.time}</small></span>
          {activePost.label && <em>{activePost.label}</em>}
        </header>
        <div className={styles.tribuneThreadSourceBody}>
          {activePost.text && <p>{activePost.text}</p>}
          {activePostImages.length > 0 && (
            <TribuneMediaMosaic
              author={activePost.author}
              images={activePostImages}
              variant="thread"
              onOpen={(imageIndex) => openMediaViewer(activePostImages, imageIndex, activePost.author)}
            />
          )}
        </div>
        {activePost.formation && <TribuneFormationCard formation={activePost.formation} variant="thread" />}
        <div className={styles.tribuneThreadStats}>
          <span><i><Zap /><Heart /><Flame /></i><b>{activePost.reactionBase + (activePostReaction ? 1 : 0)} reacții</b></span>
          <span>{activePostCommentCount === 1 ? '1 comentariu' : `${activePostCommentCount} comentarii`}</span>
        </div>
        <footer className={styles.tribuneThreadActions}>
          <div className={styles.tribuneThreadReactionChoices} role="group" aria-label="Alege o reacție">
            <button type="button" className={activePostReaction === 'forta' ? styles.tribuneReactedForce : ''} aria-label="Forța" aria-pressed={activePostReaction === 'forta'} onClick={() => toggleReaction(activePost.id, 'forta')}><Zap aria-hidden="true" /><span>Forța</span></button>
            <button type="button" className={activePostReaction === 'inima' ? styles.tribuneReacted : ''} aria-label="Respect" aria-pressed={activePostReaction === 'inima'} onClick={() => toggleReaction(activePost.id, 'inima')}><Heart aria-hidden="true" /><span>Respect</span></button>
            <button type="button" className={activePostReaction === 'foc' ? styles.tribuneReactedFire : ''} aria-label="Superb" aria-pressed={activePostReaction === 'foc'} onClick={() => toggleReaction(activePost.id, 'foc')}><Flame aria-hidden="true" /><span>Superb</span></button>
          </div>
          <button type="button" onClick={() => commentInputRef.current?.focus()}><MessageCircle aria-hidden="true" /> Comentează</button>
        </footer>
      </section>
      <div className={styles.tribuneThreadHeading}>
        <span><strong>Ce spun suporterii</strong><small>Toate vocile au același loc aici.</small></span>
        <button type="button"><Sparkles /> Relevante</button>
      </div>
      <AppScrollArea
        className={styles.tribuneCommentsScroll}
        contentClassName={styles.tribuneComments}
        horizontalScroll={false}
        label="Comentariile postării"
        scrollToEndKey={`${activePost.id}:${activePostComments.length}`}
      >
        {activePostComments.map((comment) => (
          <article key={comment.id} className={comment.author === 'Tu' ? styles.tribuneOwnComment : ''}>
            <span>{comment.author === 'Tu' ? 'SC' : comment.author.slice(0, 2).toUpperCase()}<i /></span>
            <div>
              <div className={styles.tribuneCommentBubble}><strong>{comment.author}</strong><p>{comment.text}</p></div>
              <footer>
                <button type="button" className={likedComments[comment.id] ? styles.tribuneCommentLiked : ''} aria-pressed={Boolean(likedComments[comment.id])} onClick={() => toggleCommentLike(comment.id)}>{likedComments[comment.id] ? 'Apreciat' : 'Apreciază'}</button>
                <button type="button" onClick={() => replyToComment(comment.author)}>Răspunde</button>
                <small>{comment.time}</small>
              </footer>
            </div>
          </article>
        ))}
        {activePostComments.length === 0 && (
          <div className={styles.tribuneNoComments}><span><MessageCircle /><i /></span><strong>Fii prima voce.</strong><small>Spune ce ai văzut, ce ai simțit sau ce ai schimba.</small><button type="button" onClick={() => commentInputRef.current?.focus()}>Scrie primul comentariu</button></div>
        )}
      </AppScrollArea>
      <form className={styles.tribuneReplyComposer} autoComplete="off" onSubmit={submitComment}>
        <span className={styles.tribuneReplyAvatar}>SC</span>
        <div className={styles.tribuneReplyField}>
          <input {...nonSensitiveTextFieldProps} ref={commentInputRef} type="text" name="comentariu_tribuna" enterKeyHint="send" aria-label="Comentariu în Tribună" value={commentDraft} onChange={(event) => setCommentDraft(event.target.value)} placeholder="Scrie un comentariu…" maxLength={240} />
          <span><small>{commentDraft.length}/240</small><em>Enter pentru a publica</em></span>
        </div>
        <button type="submit" disabled={!commentDraft.trim()} aria-label="Trimite comentariul"><Send /></button>
      </form>
    </motion.aside>
  ) : null

  return (
    <section className={`${styles.view} ${styles.tribuneView}`}>
      <ViewIntro code="TRI–01" label="Comunitatea Cetății" title="Aici vorbește" accent="Suceava." />

      <nav className={styles.tribuneMobileSectionTabs} aria-label="Zonele Tribunei">
        <button
          type="button"
          className={mobileTribuneSection === 'flux' ? styles.tribuneMobileSectionActive : ''}
          aria-pressed={mobileTribuneSection === 'flux'}
          onClick={() => {
            setActivePostId(null)
            setMobileTribuneSection('flux')
            play('toggle')
          }}
        >
          <Megaphone aria-hidden="true" />
          <span>Flux</span>
          <small>{visiblePosts.length}</small>
        </button>
        <button
          type="button"
          className={mobileTribuneSection !== 'flux' ? styles.tribuneMobileSectionActive : ''}
          aria-pressed={mobileTribuneSection !== 'flux'}
          onClick={() => {
            setMobileTribuneSection(activePost ? 'discutie' : 'interactiv')
            setComposerOpen(false)
            play('toggle')
          }}
        >
          {activePost ? <MessageCircle aria-hidden="true" /> : interactiveFeature === 'primul-11' ? <ShieldCheck aria-hidden="true" /> : <Trophy aria-hidden="true" />}
          <span>{activePost ? 'Discuție' : 'Interactiv'}</span>
          <small>{activePost ? activePostCommentCount : interactiveFeature === 'primul-11' ? `${formationCompleteCount}/11` : 'Vot'}</small>
        </button>
      </nav>

      <div className={styles.tribuneLayout} data-mobile-section={mobileTribuneSection}>
        <motion.section className={styles.tribuneFeedColumn} variants={reveal} initial="hidden" animate="visible" custom={0.05}>
          <header className={styles.tribuneFeedHeader}>
            <div>
              <span><i /> Fluxul suporterilor</span>
              <strong>Scris de suporteri. Pentru suporteri.</strong>
            </div>
            <div className={styles.tribuneFeedStatus}>
              <span><Wifi aria-hidden="true" /> Tribuna este vie</span>
              <strong>{totalContributions} contribuții</strong>
            </div>
          </header>

          <div className={styles.tribuneFeedToolbar}>
            <div className={styles.tribuneSorts} role="group" aria-label="Ordonează mesajele">
              {tribuneSorts.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={feedSort === item ? styles.tribuneSortActive : ''}
                  onClick={() => {
                    if (feedSort !== item) {
                      setFeedSort(item)
                      setVisiblePostCount(TRIBUNE_INITIAL_POSTS)
                      setShowFloatingComposer(false)
                    }
                    play('toggle')
                  }}
                >
                  {item}
                </button>
              ))}
            </div>
            <button
              type="button"
              className={`${styles.tribuneFilterToggle} ${filter !== 'Toate' ? styles.tribuneFilterToggleActive : ''}`}
              aria-expanded={filterOpen}
              onClick={() => { setFilterOpen((current) => !current); play('toggle') }}
            >
              <SlidersHorizontal aria-hidden="true" /> <span>Filtre</span>
              {filter !== 'Toate' && <b>1</b>}
            </button>
          </div>

          <AnimatePresence initial={false}>
            {filterOpen && (
              <motion.div
                className={styles.tribuneFilterTray}
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
              >
                <span>Arată</span>
                <div className={styles.tribuneFilters} role="group" aria-label="Filtrează postările">
                  {tribuneFilters.map((item) => (
                    <button
                      type="button"
                      key={item}
                      className={filter === item ? styles.tribuneFilterActive : ''}
                      onClick={() => {
                        if (filter !== item) {
                          setFilter(item)
                          setVisiblePostCount(TRIBUNE_INITIAL_POSTS)
                          setShowFloatingComposer(false)
                        }
                        play('toggle')
                      }}
                    >
                      {item}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => setFilterOpen(false)} aria-label="Închide filtrele"><X /></button>
              </motion.div>
            )}
          </AnimatePresence>

          <AnimatePresence>
            {showFloatingComposer && (
              <motion.button
                type="button"
                className={styles.tribuneFloatingComposer}
                initial={{ opacity: 0, scale: 0.72, y: 12 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.72, y: 12 }}
                whileHover={{ scale: 1.06 }}
                whileTap={{ scale: 0.94 }}
                onClick={() => openComposerFor('mesaj')}
                aria-label="Creează o postare"
                title="Postare nouă"
              >
                <PencilLine aria-hidden="true" />
                <span>Scrie</span>
              </motion.button>
            )}
          </AnimatePresence>

          <AppScrollArea
            key={`${feedSort}-${filter}-${posts[0]?.id ?? 'gol'}`}
            className={styles.tribuneFeedScroll}
            contentClassName={styles.tribuneFeed}
            horizontalScroll={false}
            label="Fluxul comunității"
            onScroll={handleFeedScroll}
            showScrollbar={false}
            viewportRef={feedViewportRef}
          >
            <section ref={composerDockRef} className={styles.tribuneComposerDock} aria-label="Creează o postare">
              <div className={styles.tribuneComposerDockMain}>
                <span className={styles.tribuneAvatar}>SC<i /></span>
                <button className={styles.tribuneComposerEntry} type="button" onClick={() => openComposerFor('mesaj')}>
                  <span>{composerText.trim() ? 'Ai o ciornă salvată' : 'Spune ceva Tribunei…'}</span>
                  <small>{composerText.trim() ? 'Continuă de unde ai rămas' : 'Toți suporterii o vor vedea'}</small>
                </button>
              </div>
              <footer className={styles.tribuneComposerShortcuts}>
                <button type="button" onClick={() => openComposerFor('fotografie')}><ImagePlus aria-hidden="true" /><span>Fotografii</span></button>
                <button type="button" onClick={() => openComposerFor('sondaj')}><BarChart3 aria-hidden="true" /><span>Sondaj</span></button>
                <button type="button" onClick={() => { setAttachMatch(true); openComposerFor('mesaj') }}><CalendarDays aria-hidden="true" /><span>Despre meci</span></button>
              </footer>
            </section>

            <AnimatePresence initial={false}>
              {renderedPosts.map((post, index) => {
                const postComments = comments[post.id] ?? []
                const commentPreview = postComments.slice(-1)
                const reaction = reactions[post.id]
                const bookmarked = Boolean(bookmarks[post.id])
                const postImages = post.images?.length ? post.images : post.image ? [post.image] : []
                const selectedPollVote = pollVotes[post.id]
                const pollScores = post.poll?.votes.map((score, optionIndex) => score + (selectedPollVote === optionIndex ? 1 : 0)) ?? []
                const pollTotal = pollScores.reduce((total, score) => total + score, 0)
                const totalCommentCount = post.commentBase + postComments.length
                const reactionBurstForPost = reactionBurst?.postId === post.id ? reactionBurst.reaction : null
                return (
                  <motion.article
                    layout
                    id={`tribuna-${post.id}`}
                    key={post.id}
                    className={`${styles.tribunePost} ${postImages.length ? styles.tribunePostWithMedia : ''} ${post.poll ? styles.tribunePostWithPoll : ''} ${post.colorCard ? styles.tribunePostColor : ''} ${postMenuId === post.id || reactionPickerPostId === post.id ? styles.tribunePostOverlayOpen : ''}`}
                    style={{ '--post-tone': post.tone } as CSSProperties}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ delay: Math.min(index * 0.035, 0.12) }}
                  >
                    <AnimatePresence>
                      {reactionBurstForPost && (
                        <motion.span
                          className={`${styles.tribuneReactionBurst} ${reactionBurstForPost === 'inima' ? styles.tribuneBurstHeart : reactionBurstForPost === 'foc' ? styles.tribuneBurstFire : styles.tribuneBurstForce}`}
                          initial={{ opacity: 0, scale: .35, y: 8 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 1.45, y: -12 }}
                        >
                          {reactionBurstForPost === 'inima' ? <Heart fill="currentColor" /> : reactionBurstForPost === 'foc' ? <Flame fill="currentColor" /> : <Zap fill="currentColor" />}
                        </motion.span>
                      )}
                    </AnimatePresence>
                    <header className={styles.tribunePostHeader}>
                      <span className={styles.tribunePostAvatar}>{post.initials}<i /></span>
                      <span className={styles.tribunePostAuthor}>
                        <strong>{post.author}</strong>
                        <small>{post.role}<i />{post.time}</small>
                      </span>
                      <div className={styles.tribunePostHeaderActions} data-tribune-menu>
                        {post.label && <em>{post.label}</em>}
                        <button
                          type="button"
                          aria-label={`Opțiuni pentru postarea lui ${post.author}`}
                          aria-expanded={postMenuId === post.id}
                          aria-controls={`optiuni-postare-${post.id}`}
                          aria-haspopup="menu"
                          onClick={(event) => togglePostMenu(event, post.id)}
                        ><MoreHorizontal /></button>
                        <AnimatePresence>
                          {postMenuId === post.id && (
                            <motion.div
                              ref={postMenuPanelRef}
                              id={`optiuni-postare-${post.id}`}
                              role="menu"
                              aria-label={`Opțiunile postării lui ${post.author}`}
                              className={`${styles.tribunePostMenu} ${postMenuPlacement === 'above' ? styles.tribunePostMenuAbove : ''}`}
                              initial={{ opacity: 0, y: postMenuPlacement === 'above' ? 5 : -5, scale: .97 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: postMenuPlacement === 'above' ? 4 : -4, scale: .97 }}
                            >
                              <button role="menuitem" type="button" onClick={() => { toggleBookmark(post.id); setPostMenuId(null) }}><Bookmark aria-hidden="true" fill={bookmarked ? 'currentColor' : 'none'} /><span><strong>{bookmarked ? 'Elimină din salvate' : 'Salvează postarea'}</strong><small>Păstreaz-o pentru mai târziu</small></span></button>
                              <button role="menuitem" type="button" onClick={() => { void copyPostText(post) }}><Copy aria-hidden="true" /><span><strong>Copiază textul</strong><small>Trimite ideea mai departe</small></span></button>
                              <button role="menuitem" type="button" onClick={() => hidePost(post.id)}><EyeOff aria-hidden="true" /><span><strong>Ascunde postarea</strong><small>Nu va mai apărea în feed</small></span></button>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </header>
                    <div className={`${styles.tribunePostBody} ${postImages.length ? styles.tribunePostBodyWithMedia : ''}`}>
                      {post.text && <p>{post.text}</p>}
                      {postImages.length > 0 && (
                        <TribuneMediaMosaic
                          author={post.author}
                          images={postImages}
                          variant="feed"
                          onOpen={(imageIndex) => openMediaViewer(postImages, imageIndex, post.author)}
                        />
                      )}
                    </div>
                    {post.formation && <TribuneFormationCard formation={post.formation} />}
                    {post.poll && (
                      <div className={styles.tribunePollBlock}>
                        <div className={styles.tribunePollOptions}>
                          {post.poll.options.map((option, optionIndex) => {
                            const percentage = pollTotal ? Math.round((pollScores[optionIndex] / pollTotal) * 100) : 0
                            const hasVoted = selectedPollVote !== undefined
                            return (
                              <button
                                type="button"
                                key={option}
                                className={selectedPollVote === optionIndex ? styles.tribunePollSelected : ''}
                                onClick={() => selectPollVote(post.id, optionIndex)}
                              >
                                <i style={{ '--poll-width': hasVoted ? `${percentage}%` : '0%' } as CSSProperties} />
                                <span>{option}</span>
                                <b>{hasVoted ? `${percentage}%` : 'ALEGE'}</b>
                              </button>
                            )
                          })}
                        </div>
                        <div className={styles.tribunePollMeta}>
                          <span><BarChart3 aria-hidden="true" /> {pollTotal} {pollTotal === 1 ? 'vot' : 'voturi'}</span>
                          <small>{selectedPollVote === undefined ? 'Rezultatele apar după vot' : 'Poți schimba alegerea'}</small>
                        </div>
                      </div>
                    )}
                    <div className={styles.tribuneEngagement}>
                      <span>
                        <i><Zap aria-hidden="true" /><Heart aria-hidden="true" /><Flame aria-hidden="true" /></i>
                        <b>{post.reactionBase + (reaction ? 1 : 0)} reacții</b>
                      </span>
                      <button type="button" onClick={() => openPost(post.id)}>{totalCommentCount} {totalCommentCount === 1 ? 'comentariu' : 'comentarii'}</button>
                    </div>
                    <footer>
                      <div className={styles.tribuneReactionControl} data-reaction-control>
                        <button
                          type="button"
                          className={`${styles.tribuneReactionButton} ${reaction ? styles.tribuneReactionActive : ''} ${reaction === 'inima' ? styles.tribuneReacted : reaction === 'foc' ? styles.tribuneReactedFire : reaction === 'forta' ? styles.tribuneReactedForce : ''}`}
                          aria-pressed={Boolean(reaction)}
                          onPointerDown={(event) => startReactionHold(event, post.id)}
                          onPointerUp={finishReactionHold}
                          onPointerCancel={finishReactionHold}
                          onPointerLeave={finishReactionHold}
                          onClick={() => activatePrimaryReaction(post.id, reaction)}
                        >
                          {reaction === 'inima'
                            ? <Heart aria-hidden="true" fill="currentColor" />
                            : reaction === 'foc'
                              ? <Flame aria-hidden="true" fill="currentColor" />
                              : <Zap aria-hidden="true" fill={reaction === 'forta' ? 'currentColor' : 'none'} />}
                          <span>{reaction === 'inima' ? 'Respect' : reaction === 'foc' ? 'Superb' : reaction === 'forta' ? 'Forța!' : 'Reacție'}</span>
                        </button>
                        <button
                          type="button"
                          className={styles.tribuneReactionMenuToggle}
                          aria-label="Arată toate reacțiile"
                          aria-expanded={reactionPickerPostId === post.id}
                          aria-controls={`reactii-${post.id}`}
                          onClick={(event) => toggleReactionPicker(event, post.id)}
                        >
                          <ChevronDown aria-hidden="true" />
                        </button>
                        <div
                          ref={reactionPickerPostId === post.id ? reactionPickerPanelRef : undefined}
                          id={`reactii-${post.id}`}
                          className={`${styles.tribuneReactionPicker} ${reactionPickerPostId === post.id && reactionPickerPlacement === 'below' ? styles.tribuneReactionPickerBelow : ''} ${reactionPickerPostId === post.id ? styles.tribuneReactionPickerOpen : ''}`}
                          role="group"
                          aria-label={`Alege reacția pentru postarea lui ${post.author}`}
                        >
                          <button type="button" className={reaction === 'forta' ? styles.tribuneReactedForce : ''} onClick={() => selectReaction(post.id, 'forta')}><Zap aria-hidden="true" fill={reaction === 'forta' ? 'currentColor' : 'none'} /> Forța!</button>
                          <button type="button" className={reaction === 'inima' ? styles.tribuneReacted : ''} onClick={() => selectReaction(post.id, 'inima')}><Heart aria-hidden="true" fill={reaction === 'inima' ? 'currentColor' : 'none'} /> Respect</button>
                          <button type="button" className={reaction === 'foc' ? styles.tribuneReactedFire : ''} onClick={() => selectReaction(post.id, 'foc')}><Flame aria-hidden="true" fill={reaction === 'foc' ? 'currentColor' : 'none'} /> Superb</button>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => openPost(post.id)}
                      >
                        <MessageCircle aria-hidden="true" />
                        <span>Comentează</span>
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
                    {commentPreview.length > 0 && (
                      <div className={styles.tribuneCommentPreviews}>
                        {totalCommentCount > 1 && <button type="button" className={styles.tribuneAllComments} onClick={() => openPost(post.id)}>Vezi toate cele {totalCommentCount} comentarii</button>}
                        {commentPreview.map((comment) => (
                          <button type="button" className={styles.tribuneCommentPreview} key={comment.id} onClick={() => openPost(post.id)}>
                            <span>{comment.author.slice(0, 2).toUpperCase()}</span>
                            <span><strong>{comment.author}</strong><small>{comment.text}</small></span>
                            <ChevronRight aria-hidden="true" />
                          </button>
                        ))}
                      </div>
                    )}
                  </motion.article>
                )
              })}
            </AnimatePresence>

            {hasMorePosts && (
              <div ref={feedLoadMoreRef} className={styles.tribuneFeedLoader} role="status" aria-live="polite">
                <LoaderCircle aria-hidden="true" />
                <span><strong>Urmează alte postări</strong><small>Fluxul continuă automat</small></span>
              </div>
            )}

            {!hasMorePosts && visiblePosts.length > TRIBUNE_INITIAL_POSTS && (
              <div className={styles.tribuneFeedEnd} aria-label="Ai ajuns la finalul postărilor disponibile">
                <i /><span>Ești la zi cu Tribuna</span><i />
              </div>
            )}

            {visiblePosts.length === 0 && (
              <div className={styles.tribuneEmpty}>
                <Search aria-hidden="true" />
                <strong>{feedSort === 'Salvate' ? 'Nu ai salvat încă nicio postare.' : 'Nicio postare în filtrul acesta.'}</strong>
                <button type="button" onClick={() => { setFilter('Toate'); setFeedSort('Recente') }}>Înapoi la postările recente</button>
              </div>
            )}
          </AppScrollArea>
          <AnimatePresence mode="wait">
            {lastHiddenPostId ? (
              <motion.div key="post-ascuns" className={styles.tribuneFeedNotice} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                <EyeOff aria-hidden="true" /><span><strong>Postare ascunsă</strong><small>Am eliminat-o din feed.</small></span><button type="button" onClick={undoHiddenPost}><Undo2 aria-hidden="true" /> Anulează</button>
              </motion.div>
            ) : copiedPostId ? (
              <motion.div key="text-copiat" className={styles.tribuneFeedNotice} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                <Copy aria-hidden="true" /><span><strong>Text copiat</strong><small>Este gata de trimis.</small></span>
              </motion.div>
            ) : formationPublishedId ? (
              <motion.div key="formatie-publicata" className={styles.tribuneFeedNotice} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }}>
                <ShieldCheck aria-hidden="true" /><span><strong>Primul tău 11 este în Tribună</strong><small>Suporterii îl pot vedea și comenta acum.</small></span>
              </motion.div>
            ) : null}
          </AnimatePresence>
        </motion.section>

        <AnimatePresence mode="sync" initial={false}>
          {discussionPanel ?? (
            <motion.aside
              key="jucatorul-tribunei"
              className={styles.tribuneInteractiveShell}
              initial={{ opacity: 0, x: 34 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 24 }}
              transition={{ duration: .48, ease: [0.16, 1, 0.3, 1] }}
              aria-label="Experiențele interactive ale Tribunei"
            >
              <nav className={styles.tribuneInteractiveSwitcher} aria-label="Alege experiența interactivă">
                <button type="button" className={interactiveFeature === 'jucator' ? styles.tribuneInteractiveFeatureActive : ''} aria-pressed={interactiveFeature === 'jucator'} onClick={() => { setInteractiveFeature('jucator'); play('navigate') }}>
                  <Trophy aria-hidden="true" /><span><small>După meci</small><strong>Jucătorul Tribunei</strong></span><b>01</b>
                </button>
                <button type="button" className={interactiveFeature === 'primul-11' ? styles.tribuneInteractiveFeatureActive : ''} aria-pressed={interactiveFeature === 'primul-11'} onClick={() => { setInteractiveFeature('primul-11'); play('navigate') }}>
                  <ShieldCheck aria-hidden="true" /><span><small>Înainte de meci</small><strong>Alege primul 11</strong></span><b>02</b>
                </button>
              </nav>

              <AnimatePresence mode="wait" initial={false}>
                {interactiveFeature === 'jucator' ? (
                  <motion.div key="experienta-motm" className={styles.motmFeatureScene} initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 22 }} transition={{ duration: .38, ease: [0.16, 1, 0.3, 1] }}>
                    <header className={styles.motmHeader}>
                <div>
                  <span><Sparkles aria-hidden="true" /> Tribuna Interactivă <b>01</b></span>
                  <strong>Jucătorul Tribunei</strong>
                  <small>Alege omul victoriei de la Târgu Mureș.</small>
                </div>
                <div className={styles.motmVoteStatus}>
                  <span><i /> Vot deschis</span>
                  <small><Clock3 aria-hidden="true" /> încă 22 ore</small>
                </div>
              </header>

              <section className={styles.motmMatchStamp} aria-label={`${latestResult.home} ${tribuneMotmHomeScore} la ${tribuneMotmAwayScore} ${latestResult.away}`}>
                <header>
                  <span><Flag aria-hidden="true" /> Meciul precedent</span>
                  <strong><i /> Final</strong>
                </header>
                <div className={styles.motmScoreboard}>
                  <div className={styles.motmTeamHome}>
                    <span><small>Gazde</small><strong>{latestResult.home}</strong></span>
                    <img src="/echipe/asa-targu-mures.png" alt="Emblema ASA Târgu Mureș" />
                  </div>
                  <div className={styles.motmScore} aria-label={`Scor ${tribuneMotmHomeScore} la ${tribuneMotmAwayScore}`}>
                    <strong>{tribuneMotmHomeScore}</strong><i>–</i><strong>{tribuneMotmAwayScore}</strong>
                  </div>
                  <div className={styles.motmTeamAway}>
                    <img src={fanEmblem} alt="Emblema Fan Club Cetatea Suceava" />
                    <span><small>Oaspeți</small><strong>{latestResult.away}</strong></span>
                  </div>
                </div>
                <footer>
                  <span><CalendarDays aria-hidden="true" /> {latestResult.round} · {latestResult.date}</span>
                  <span><MapPin aria-hidden="true" /> {latestResult.venue}</span>
                  <strong><Trophy aria-hidden="true" /> Victorie Cetatea</strong>
                </footer>
              </section>

              <AnimatePresence mode="wait" initial={false}>
                {!motmResultsVisible ? (
                  <motion.section
                    key="motm-vot"
                    className={styles.motmVoteExperience}
                    initial={{ opacity: 0, x: -18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 18 }}
                    transition={{ duration: .36, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className={styles.motmCandidateHero} style={{ '--motm-tone': selectedMotmCandidate.tone } as CSSProperties}>
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.div
                          key={selectedMotmCandidate.playerId}
                          className={styles.motmHeroScene}
                          initial={{ opacity: 0, x: 18, scale: .985 }}
                          animate={{ opacity: 1, x: 0, scale: 1 }}
                          exit={{ opacity: 0, x: -14, scale: .99 }}
                          transition={{ duration: .32, ease: [0.16, 1, 0.3, 1] }}
                        >
                          <span className={styles.motmHeroNumber}>{selectedMotmCandidate.player.number ?? 'CS'}</span>
                          <div className={styles.motmHeroPortrait}>
                            <i /><i />
                            <SquadPortrait player={selectedMotmCandidate.player} alt={`Portret ${selectedMotmCandidate.player.name}`} />
                          </div>
                          <div className={styles.motmHeroIdentity}>
                            <small><BadgeCheck aria-hidden="true" /> Alegerea curentă</small>
                            <strong>{selectedMotmCandidate.player.name}</strong>
                            <span>{selectedMotmCandidate.matchLine}</span>
                            <p>{selectedMotmCandidate.reason}</p>
                          </div>
                        </motion.div>
                      </AnimatePresence>
                    </div>

                    <div className={styles.motmBallot}>
                      <header>
                        <span><small>Buletinul tău de vot</small><strong>Alege un singur jucător</strong></span>
                        <em>{motmCandidates.length} candidați</em>
                      </header>
                      <div className={styles.motmCandidateList} role="radiogroup" aria-label="Candidații pentru Jucătorul Tribunei">
                        {motmCandidates.map((candidate, index) => {
                          const selected = candidate.playerId === selectedMotmCandidate.playerId
                          return (
                            <button
                              type="button"
                              role="radio"
                              aria-checked={selected}
                              tabIndex={selected ? 0 : -1}
                              key={candidate.playerId}
                              className={selected ? styles.motmCandidateSelected : ''}
                              style={{ '--motm-tone': candidate.tone } as CSSProperties}
                              onClick={() => selectMotmCandidate(candidate.playerId)}
                              onKeyDown={(event) => {
                                if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) return
                                event.preventDefault()
                                const direction = event.key === 'ArrowUp' || event.key === 'ArrowLeft' ? -1 : 1
                                const nextIndex = (index + direction + motmCandidates.length) % motmCandidates.length
                                const nextButton = event.currentTarget.parentElement?.querySelectorAll('button')[nextIndex]
                                stepMotmCandidate(direction)
                                window.requestAnimationFrame(() => nextButton?.focus())
                              }}
                              aria-label={`${candidate.player.name}, ${candidate.matchLine}`}
                            >
                              <b>{String(index + 1).padStart(2, '0')}</b>
                              <span className={styles.motmCandidatePortrait}><SquadPortrait player={candidate.player} /></span>
                              <span><strong>{candidate.player.name}</strong><small>{candidate.matchLine}</small></span>
                              <i>{selected ? <BadgeCheck aria-hidden="true" /> : <ChevronRight aria-hidden="true" />}</i>
                              {selected && <motion.span className={styles.motmCandidateSelection} layoutId="motm-candidate-selection" transition={{ type: 'spring', stiffness: 430, damping: 38 }} />}
                            </button>
                          )
                        })}
                      </div>
                      <footer>
                        <span><EyeOff aria-hidden="true" /><small>Rezultatele apar după vot</small></span>
                        <button type="button" onClick={confirmMotmVote}>
                          <Trophy aria-hidden="true" /><span><small>Confirmă alegerea</small><strong>Votează {selectedMotmCandidate.player.name.split(' ').at(-1)}</strong></span><ArrowRight aria-hidden="true" />
                        </button>
                        {motmEditingVote && <button type="button" className={styles.motmCancelEdit} onClick={() => setMotmEditingVote(false)}>Păstrează votul anterior</button>}
                      </footer>
                    </div>
                  </motion.section>
                ) : (
                  <motion.section
                    key="motm-rezultate"
                    className={styles.motmResultsExperience}
                    aria-live="polite"
                    initial={{ opacity: 0, x: 18 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -18 }}
                    transition={{ duration: .42, ease: [0.16, 1, 0.3, 1] }}
                  >
                    <div className={styles.motmLeaderStage} style={{ '--motm-tone': motmLeader.tone } as CSSProperties}>
                      <span className={styles.motmLeaderOrbit} aria-hidden="true"><i /><i /><i /></span>
                      <header><span><Medal aria-hidden="true" /> Liderul Tribunei</span><em>{Math.round((motmLeader.votes / motmTotalVotes) * 100)}%</em></header>
                      <div className={styles.motmLeaderPortrait}>
                        <span>{motmLeader.player.number ?? 'CS'}</span>
                        <SquadPortrait player={motmLeader.player} alt={`Portret ${motmLeader.player.name}`} />
                      </div>
                      <div className={styles.motmLeaderIdentity}>
                        <small>Locul 1 · momentan</small>
                        <strong>{motmLeader.player.name}</strong>
                        <span>{motmLeader.matchLine}</span>
                      </div>
                      <footer><span><i /><b>{motmLeader.votes}</b> voturi</span><small>Avans de {motmLead} voturi</small></footer>
                    </div>

                    <div className={styles.motmRanking}>
                      <header>
                        <span><small>Rezultate în timp real</small><strong>Cursa pentru trofeu</strong></span>
                        <em><UsersRound aria-hidden="true" /> {motmTotalVotes.toLocaleString('ro-RO')} voturi</em>
                        <div className={styles.motmHeadToHead} style={{ '--motm-duel-share': `${motmDuelShare}%` } as CSSProperties}>
                          <span><b>01</b><strong>{motmResults[0].player.name.split(' ').at(-1)}</strong></span>
                          <i><motion.b initial={{ width: '50%' }} animate={{ width: `${motmDuelShare}%` }} transition={{ duration: .7, ease: [0.16, 1, 0.3, 1] }} /></i>
                          <span><strong>{motmResults[1].player.name.split(' ').at(-1)}</strong><b>02</b></span>
                          <small>{motmLead === 1 ? 'Un singur vot între ei' : `${motmLead} voturi între ei`}</small>
                        </div>
                      </header>
                      <div>
                        {motmResults.map((candidate, index) => {
                          const percentage = Math.round((candidate.votes / motmTotalVotes) * 100)
                          const isUserVote = candidate.playerId === motmVote
                          return (
                            <motion.article layout key={candidate.playerId} className={isUserVote ? styles.motmUserChoice : ''} style={{ '--motm-tone': candidate.tone } as CSSProperties}>
                              <b>{index + 1}</b>
                              <span className={styles.motmResultPortrait}><SquadPortrait player={candidate.player} /></span>
                              <span><strong>{candidate.player.name}</strong><small>{isUserVote ? 'Votul tău' : candidate.matchLine}</small><i><motion.b initial={{ width: 0 }} animate={{ width: `${percentage}%` }} transition={{ duration: .62, delay: index * .06, ease: [0.16, 1, 0.3, 1] }} /></i></span>
                              <em><strong>{percentage}%</strong><small>{candidate.votes} voturi</small></em>
                            </motion.article>
                          )
                        })}
                      </div>
                      <footer>
                        <span><BadgeCheck aria-hidden="true" /><i><small>Vot înregistrat</small><strong>{userMotmCandidate?.player.name}</strong></i></span>
                        <button type="button" onClick={editMotmVote}>Modifică votul</button>
                      </footer>
                    </div>
                  </motion.section>
                )}
                    </AnimatePresence>
                  </motion.div>
                ) : (
                  <motion.section key="experienta-primul-11" className={styles.supporterFormationBuilder} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -22 }} transition={{ duration: .38, ease: [0.16, 1, 0.3, 1] }}>
                    <header className={styles.supporterFormationHeader}>
                      <div><span><Sparkles aria-hidden="true" /> Laboratorul Tribunei</span><strong>Primul tău 11</strong><small>Alege, mută și publică echipa cu care ai începe.</small></div>
                      <span className={styles.supporterFormationProgress}><b>{formationCompleteCount}</b><i>/11</i><small>{formationCompleteCount === 11 ? 'Gata de publicat' : 'Completează echipa'}</small></span>
                    </header>

                    <div className={styles.supporterFormationSystems} role="group" aria-label="Alege sistemul tactic">
                      {supporterFormations.map((formation) => (
                        <button type="button" key={formation.id} className={formationSystem === formation.id ? styles.supporterFormationSystemActive : ''} aria-pressed={formationSystem === formation.id} onClick={() => selectSupporterFormation(formation.id)}>
                          <span>{formation.id}</span><small>{formation.name}</small><i />
                        </button>
                      ))}
                      <button type="button" className={styles.supporterFormationReset} onClick={resetSupporterFormation} title="Revino la selecția inițială"><RotateCcw aria-hidden="true" /><span>Resetează</span></button>
                    </div>

                    <div className={styles.supporterFormationWorkspace}>
                      <div className={styles.supporterFormationBoard}>
                        <header><span><CircleDot aria-hidden="true" /><i><small>{activeSupporterFormation.name}</small><strong>{activeSupporterFormation.id}</strong></i></span><small><Move aria-hidden="true" /> Trage sau atinge</small></header>
                        <div className={styles.supporterFormationPitch} aria-label={`Primul 11 în sistem ${activeSupporterFormation.id}`}>
                          <span className={styles.supporterPitchHalf} aria-hidden="true" /><span className={styles.supporterPitchCircle} aria-hidden="true" /><span className={styles.supporterPitchAreaTop} aria-hidden="true" /><span className={styles.supporterPitchAreaBottom} aria-hidden="true" />
                          {activeSupporterFormation.slots.map((slot) => {
                            const player = squad.find((item) => item.id === activeFormationDraft[slot.id])
                            const selected = slot.id === activeFormationSlot.id
                            return (
                              <button
                                type="button"
                                key={slot.id}
                                data-formation-slot={slot.id}
                                className={`${styles.supporterFormationSlot} ${selected ? styles.supporterFormationSlotActive : ''} ${formationDropSlot === slot.id ? styles.supporterFormationSlotDrop : ''}`}
                                style={{ '--formation-x': `${slot.x}%`, '--formation-y': `${slot.y}%`, '--formation-tone': player ? positionTone[player.position] : 'var(--tone-green)' } as CSSProperties}
                                draggable={Boolean(player)}
                                onClick={() => handleFormationSlotClick(slot.id)}
                                onDragStart={(event) => player && handleFormationDragStart(event, player.id, slot.id)}
                                onDragEnd={() => { setFormationDrag(null); setFormationDropSlot(null) }}
                                onDragOver={(event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; setFormationDropSlot(slot.id) }}
                                onDrop={(event) => handleFormationDrop(event, slot.id)}
                                onPointerDown={(event) => player && beginFormationPointerDrag(event, player.id, slot.id)}
                                onPointerMove={moveFormationPointerDrag}
                                onPointerUp={finishFormationPointerDrag}
                                onPointerCancel={() => { formationPointerRef.current = null; setFormationDrag(null); setFormationDropSlot(null) }}
                                aria-label={player ? `${slot.label}: ${player.name}. Apasă pentru selecție sau trage pentru mutare.` : `${slot.label}, necompletat`}
                                aria-pressed={selected}
                              >
                                <span>{player ? <SquadPortrait player={player} lazy /> : <Plus aria-hidden="true" />}{resolvedFormationCaptain === player?.id && <b>C</b>}<i>{slot.shortLabel}</i></span>
                                <strong>{player?.name.split(' ').at(-1) ?? slot.label}</strong>
                              </button>
                            )
                          })}
                        </div>
                        <footer><span><i /> Se salvează automat</span><strong>{activeSupporterFormation.idea}</strong></footer>
                      </div>

                      <aside className={styles.supporterFormationRoster}>
                        <header>
                          <span><small>Post selectat</small><strong>{activeFormationSlot.label}</strong></span>
                          <div role="group" aria-label="Filtrul lotului"><button type="button" className={formationRosterMode === 'potriviti' ? styles.supporterRosterFilterActive : ''} aria-pressed={formationRosterMode === 'potriviti'} onClick={() => setFormationRosterMode('potriviti')}>Potriviți</button><button type="button" className={formationRosterMode === 'tot-lotul' ? styles.supporterRosterFilterActive : ''} aria-pressed={formationRosterMode === 'tot-lotul'} onClick={() => setFormationRosterMode('tot-lotul')}>Tot lotul</button></div>
                        </header>
                        {selectedFormationPlayer && (
                          <div className={styles.supporterFormationSelection} style={{ '--formation-tone': positionTone[selectedFormationPlayer.position] } as CSSProperties}>
                            <span><SquadPortrait player={selectedFormationPlayer} /><b>{displayPlayerNumber(selectedFormationPlayer.number, true)}</b></span>
                            <i><small>Acum pe poziție</small><strong>{selectedFormationPlayer.name}</strong><em>{selectedFormationPlayer.role}</em></i>
                            <button type="button" className={resolvedFormationCaptain === selectedFormationPlayer.id ? styles.supporterCaptainActive : ''} onClick={() => { setFormationCaptain(selectedFormationPlayer.id); play('success') }} aria-label={`Alege căpitan: ${selectedFormationPlayer.name}`} aria-pressed={resolvedFormationCaptain === selectedFormationPlayer.id} title="Alege căpitanul"><Crown aria-hidden="true" /></button>
                          </div>
                        )}
                        <AppScrollArea className={styles.supporterFormationRosterScroll} contentClassName={styles.supporterFormationRosterList} horizontalScroll={false} label={`Jucători pentru ${activeFormationSlot.label}`}>
                          {formationRosterPlayers.map((player) => {
                            const assignedSlot = activeSupporterFormation.slots.find((slot) => activeFormationDraft[slot.id] === player.id)
                            const isCurrent = activeFormationDraft[activeFormationSlot.id] === player.id
                            return (
                              <button
                                type="button"
                                key={player.id}
                                className={`${isCurrent ? styles.supporterRosterPlayerActive : ''} ${assignedSlot && !isCurrent ? styles.supporterRosterPlayerUsed : ''}`}
                                style={{ '--formation-tone': positionTone[player.position] } as CSSProperties}
                                draggable
                                onClick={() => handleFormationRosterClick(player.id)}
                                onDragStart={(event) => handleFormationDragStart(event, player.id, assignedSlot?.id)}
                                onDragEnd={() => { setFormationDrag(null); setFormationDropSlot(null) }}
                                aria-pressed={isCurrent}
                              >
                                <span><SquadPortrait player={player} lazy /><b>{displayPlayerNumber(player.number, true)}</b></span>
                                <i><strong>{player.name}</strong><small>{player.role}</small></i>
                                <em>{assignedSlot ? assignedSlot.shortLabel : <Plus aria-label="Adaugă" />}</em>
                              </button>
                            )
                          })}
                        </AppScrollArea>
                      </aside>
                    </div>

                    <footer className={styles.supporterFormationActions}>
                      <span><ShieldCheck aria-hidden="true" /><i><small>Selecția ta pentru</small><strong>{nextMatch.home.name} – {nextMatch.away.name}</strong></i></span>
                      <button type="button" disabled={formationCompleteCount !== 11} onClick={openFormationShare}><Share2 aria-hidden="true" /><span><small>Arată tuturor</small><strong>Publică în Tribună</strong></span><ArrowRight aria-hidden="true" /></button>
                    </footer>
                  </motion.section>
                )}
              </AnimatePresence>
            </motion.aside>
          )}
        </AnimatePresence>

      </div>

      {createPortal(
        <AnimatePresence initial={false} mode="sync">
          {formationShareOpen && (
            <motion.div className={`${styles.tribuneOverlay} ${styles.formationShareOverlay}`} variants={panelLayerVariants} initial="closed" animate="open" exit="closed">
              <motion.button type="button" className={styles.slidingPanelBackdrop} variants={panelBackdropVariants} onClick={() => setFormationShareOpen(false)} aria-label="Închide publicarea formației" />
              <motion.aside className={styles.formationSharePanel} role="dialog" aria-modal="true" aria-labelledby="formation-share-title" variants={panelFromRightVariants}>
                <header>
                  <span><Share2 aria-hidden="true" /><i><small>Postare tactică</small><strong id="formation-share-title">Publică primul tău 11</strong></i></span>
                  <button type="button" onClick={() => setFormationShareOpen(false)} aria-label="Închide"><X aria-hidden="true" /></button>
                </header>
                <div className={styles.formationShareBody}>
                  <div className={styles.formationShareIdentity}><span>SC<i /></span><div><strong>Suporter Cetatea</strong><small><UsersRound aria-hidden="true" /> Vizibil tuturor suporterilor</small></div><em>{activeSupporterFormation.id}</em></div>
                  <label className={styles.formationShareMessage}>
                    <span><strong>Mesajul tău</strong><small>{formationShareText.length}/240</small></span>
                    <textarea {...nonSensitiveTextFieldProps} name="mesaj_primul_11" value={formationShareText} maxLength={240} onChange={(event) => setFormationShareText(event.target.value)} placeholder="Spune de ce ai ales această echipă…" />
                  </label>
                  <TribuneFormationCard formation={formationForSharing} variant="preview" />
                  <div className={styles.formationShareNote}><ShieldCheck aria-hidden="true" /><span><strong>Card interactiv în feed</strong><small>Formația, sistemul și căpitanul rămân clare pe orice ecran.</small></span></div>
                </div>
                <footer><button type="button" onClick={() => setFormationShareOpen(false)}>Mai modific</button><button type="button" onClick={publishFormationPost}><Send aria-hidden="true" /> Publică în Tribună</button></footer>
              </motion.aside>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}

      {formationDrag && createPortal((() => {
        const player = squad.find((item) => item.id === formationDrag.playerId)
        return player ? (
          <div className={styles.supporterFormationDragGhost} style={{ '--drag-x': `${formationDrag.x}px`, '--drag-y': `${formationDrag.y}px`, '--formation-tone': positionTone[player.position] } as CSSProperties} aria-hidden="true">
            <span><SquadPortrait player={player} /></span><i><strong>{player.name.split(' ').at(-1)}</strong><small>Așază pe poziție</small></i>
          </div>
        ) : null
      })(), document.body)}

      {createPortal(
        <AnimatePresence initial={false} mode="sync">
        {composerOpen && (
          <motion.div
            className={`${styles.tribuneOverlay} ${styles.tribuneComposerOverlay} ${composerViewport.keyboardOpen ? styles.tribuneComposerKeyboardOpen : ''}`}
            style={{
              '--composer-viewport-height': `${composerViewport.height}px`,
              '--composer-viewport-top': `${composerViewport.offsetTop}px`,
            } as CSSProperties}
            variants={panelLayerVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <motion.button
              type="button"
              className={styles.slidingPanelBackdrop}
              variants={panelBackdropVariants}
              onClick={() => setComposerOpen(false)}
              aria-label="Închide creatorul de postări"
            />
            <motion.div
              className={styles.tribuneComposer}
              role="dialog"
              aria-modal="true"
              aria-label="Publică în Tribună"
              variants={panelFromRightVariants}
            >
              <form className={styles.tribuneComposerForm} autoComplete="off" onSubmit={publishPost}>
                <div className={styles.tribuneComposerBody}>
                  <header className={styles.tribuneDialogHeader}>
                    <span className={styles.tribuneComposerTitle}><PencilLine /><strong>Creează o postare</strong><small>Tribuna suporterilor</small></span>
                    <button type="button" onClick={() => setComposerOpen(false)} aria-label="Închide"><X /></button>
                  </header>

                  <div className={styles.tribuneComposerIdentity}>
                    <span>SC<i /></span>
                    <div>
                      <strong>Suporter Cetatea</strong>
                      <span className={styles.tribuneComposerAudience}><UsersRound /> Toți suporterii</span>
                    </div>
                    <small>{composerText.trim() ? 'Ciornă salvată automat' : 'Postare nouă'}</small>
                  </div>

                  <div className={styles.tribuneComposerField}>
                    <textarea
                      {...nonSensitiveTextFieldProps}
                      name="continut_postare_tribuna"
                      enterKeyHint="enter"
                      aria-label="Conținutul postării"
                      value={composerText}
                      maxLength={1000}
                      onChange={(event) => setComposerText(event.target.value)}
                      placeholder={composerMode === 'sondaj' ? 'Ce vrei să întrebi suporterii?' : composerMode === 'fotografie' ? 'Spune povestea fotografiilor…' : 'Ce ai în minte, suporterule?'}
                    />
                    <span className={composerText.length > 900 ? styles.tribuneComposerCountAlert : ''}>{composerText.length}<small>/1000</small></span>
                  </div>

                  {attachMatch && (
                    <div className={styles.tribuneMatchAttachment}>
                      <span><CalendarDays /><i><small>Legată de următorul meci</small><strong>{nextMatch.home.name} – {nextMatch.away.name}</strong></i></span>
                      <em>{nextMatch.compactDateLabel} · {nextMatch.timeLabel}</em>
                      <button type="button" onClick={() => setAttachMatch(false)} aria-label="Elimină legătura cu meciul"><X /></button>
                    </div>
                  )}

                  {composerMode === 'fotografie' && composerImages.length === 0 && (
                    <label className={`${styles.tribunePhotoDrop} ${processingImages ? styles.tribunePhotoProcessing : ''}`} htmlFor="tribune-photo-input">
                      {processingImages ? <LoaderCircle aria-hidden="true" /> : <ImagePlus aria-hidden="true" />}
                      <span><strong>{processingImages ? 'Pregătim fotografiile…' : 'Alege până la patru fotografii'}</strong><small>{processingImages ? 'Redimensionăm fără să stricăm proporțiile' : 'JPG, PNG sau WEBP · optimizate automat pentru postare'}</small></span>
                    </label>
                  )}
                  {composerImages.length > 0 && (
                    <div className={styles.tribuneComposerMediaBlock}>
                      <header><span>{processingImages ? <LoaderCircle aria-hidden="true" /> : <ImagePlus aria-hidden="true" />} Previzualizare postare</span><small>{processingImages ? 'Se procesează…' : `${composerImages.length}/4`}</small></header>
                      <TribuneMediaMosaic
                        author="Suporter Cetatea"
                        images={composerImages}
                        variant="composer"
                        onOpen={(imageIndex) => openMediaViewer(composerImages, imageIndex, 'Previzualizare postare')}
                        onPromote={(imageIndex) => setComposerImages((current) => [current[imageIndex], ...current.filter((_, index) => index !== imageIndex)])}
                        onRemove={(imageIndex) => setComposerImages((current) => current.filter((_, index) => index !== imageIndex))}
                      />
                    </div>
                  )}

                  {composerMode === 'sondaj' && (
                    <div className={styles.tribunePollEditor}>
                      <header><strong>Variante de răspuns</strong><small>{composerPollOptions.length}/4</small></header>
                      {composerPollOptions.map((option, index) => (
                        <div key={index}>
                          <span>{index + 1}</span>
                          <input
                            {...nonSensitiveTextFieldProps}
                            type="text"
                            name={`varianta_sondaj_${index + 1}`}
                            enterKeyHint={index === composerPollOptions.length - 1 ? 'done' : 'next'}
                            aria-label={`Varianta ${index + 1} a sondajului`}
                            value={option}
                            maxLength={80}
                            placeholder={`Varianta ${index + 1}`}
                            onChange={(event) => setComposerPollOptions((current) => current.map((item, optionIndex) => optionIndex === index ? event.target.value : item))}
                          />
                          {composerPollOptions.length > 2 && <button type="button" onClick={() => setComposerPollOptions((current) => current.filter((_, optionIndex) => optionIndex !== index))} aria-label={`Elimină varianta ${index + 1}`}><X /></button>}
                        </div>
                      ))}
                      {composerPollOptions.length < 4 && (
                        <button type="button" onClick={() => setComposerPollOptions((current) => [...current, ''])}><Plus aria-hidden="true" /> Adaugă o variantă</button>
                      )}
                    </div>
                  )}
                  {composerError && <p className={styles.tribuneComposerError}>{composerError}</p>}

                  <input id="tribune-photo-input" className={styles.tribuneFileInput} type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={processingImages || composerImages.length >= 4} onChange={handlePhoto} />
                  <div className={styles.tribuneComposerTools}>
                    <span><strong>Adaugă</strong><small>Opțional</small></span>
                    <div>
                      <label className={composerImages.length > 0 || composerMode === 'fotografie' ? styles.tribuneComposerToolActive : ''} htmlFor={composerImages.length < 4 && !processingImages ? 'tribune-photo-input' : undefined} title={composerImages.length >= 4 ? 'Ai adăugat numărul maxim de fotografii' : 'Adaugă fotografii'} aria-disabled={processingImages || composerImages.length >= 4}>
                        {processingImages ? <LoaderCircle aria-hidden="true" /> : <ImagePlus aria-hidden="true" />}<span>{composerImages.length >= 4 ? 'Complet' : 'Fotografii'}</span>
                      </label>
                      <button type="button" className={composerMode === 'sondaj' ? styles.tribuneComposerToolActive : ''} onClick={() => { setComposerMode((current) => current === 'sondaj' ? 'mesaj' : 'sondaj'); setComposerAppearanceOpen(false); setComposerError(''); play('toggle') }} title="Adaugă un sondaj" aria-pressed={composerMode === 'sondaj'}>
                        <BarChart3 aria-hidden="true" /><span>Sondaj</span>
                      </button>
                      <button type="button" className={attachMatch ? styles.tribuneComposerToolActive : ''} onClick={() => { setAttachMatch((current) => !current); setComposerAppearanceOpen(false); play('toggle') }} title="Leagă postarea de meci" aria-pressed={attachMatch}>
                        <CalendarDays aria-hidden="true" /><span>Meci</span>
                      </button>
                      <button type="button" className={composerAppearanceOpen || composerTone !== 'verde' ? styles.tribuneComposerToolActive : ''} onClick={() => { setComposerAppearanceOpen((current) => !current); play('toggle') }} title="Alege aspectul postării" aria-expanded={composerAppearanceOpen}>
                        <Sparkles aria-hidden="true" /><span>Aspect</span>
                      </button>
                    </div>
                  </div>

                  <AnimatePresence initial={false}>
                    {composerAppearanceOpen && (
                      <motion.div className={styles.tribuneComposerAppearance} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}>
                        <span><strong>Accentul cardului</strong><small>Alege energia mesajului</small></span>
                        <div role="group" aria-label="Alege culoarea postării">
                          {composerTones.map((tone) => (
                            <button
                              type="button"
                              key={tone.id}
                              className={composerTone === tone.id ? styles.tribuneComposerToneActive : ''}
                              style={{ '--composer-tone': tone.color } as CSSProperties}
                              onClick={() => { setComposerTone(tone.id); setComposerAppearanceOpen(false); play('toggle') }}
                              aria-label={tone.label}
                              aria-pressed={composerTone === tone.id}
                            ><i /><span>{tone.label}</span></button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <footer className={styles.tribuneComposerActions}>
                    <span><i /><small>{processingImages ? 'Pregătim fotografiile' : composerMode === 'sondaj' && composerValidPollOptions < 2 ? 'Completează două variante' : composerText.trim() || composerImages.length ? 'Ciorna este salvată' : 'Vizibilă tuturor suporterilor'}</small></span>
                    <button type="submit" disabled={!composerCanPublish}>{processingImages ? <LoaderCircle /> : <Send />} {processingImages ? 'Se procesează' : 'Publică'}</button>
                  </footer>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
        </AnimatePresence>,
        document.body,
      )}

      {createPortal(
        <AnimatePresence initial={false} mode="sync">
          {mediaViewer && (
            <motion.div
              className={`${styles.tribuneOverlay} ${styles.tribuneMediaOverlay}`}
              variants={panelLayerVariants}
              initial="closed"
              animate="open"
              exit="closed"
            >
              <motion.button
                type="button"
                className={styles.slidingPanelBackdrop}
                variants={panelBackdropVariants}
                onClick={() => setMediaViewer(null)}
                aria-label="Închide galeria foto"
              />
              <motion.figure
                className={styles.tribuneMediaViewer}
                role="dialog"
                aria-modal="true"
                aria-label={`Fotografiile publicate de ${mediaViewer.author}`}
                variants={panelFromRightVariants}
              >
                <header>
                  <span><ImagePlus aria-hidden="true" /><i><small>Galerie foto</small><strong>{mediaViewer.author}</strong></i></span>
                  <small>{mediaViewer.index + 1} din {mediaViewer.images.length}</small>
                  <button type="button" onClick={() => setMediaViewer(null)} aria-label="Închide fotografia"><X /></button>
                </header>
                <div
                  className={styles.tribuneMediaStage}
                  onPointerDown={beginMediaSwipe}
                  onPointerUp={finishMediaSwipe}
                  onPointerCancel={() => { mediaSwipeStartRef.current = null }}
                >
                  <span className={styles.tribuneMediaStageBackdrop} aria-hidden="true">
                    <img src={mediaViewer.images[mediaViewer.index]} alt="" />
                  </span>
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.img
                      key={`${mediaViewer.images[mediaViewer.index].slice(0, 36)}-${mediaViewer.index}`}
                      className={styles.tribuneMediaStageImage}
                      src={mediaViewer.images[mediaViewer.index]}
                      alt={`Fotografia ${mediaViewer.index + 1} publicată de ${mediaViewer.author}`}
                      decoding="async"
                      initial={{ opacity: 0, scale: 0.992 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.992 }}
                      transition={{ duration: 0.18 }}
                    />
                  </AnimatePresence>
                  {mediaViewer.images.length > 1 && <button type="button" className={styles.tribuneMediaPrevious} onClick={() => moveMediaViewer(-1)} aria-label="Fotografia anterioară"><ChevronLeft /></button>}
                  {mediaViewer.images.length > 1 && <button type="button" className={styles.tribuneMediaNext} onClick={() => moveMediaViewer(1)} aria-label="Fotografia următoare"><ChevronRight /></button>}
                  {mediaViewer.images.length > 1 && <small className={styles.tribuneMediaSwipeHint}>Glisează pentru următoarea fotografie</small>}
                </div>
                {mediaViewer.images.length > 1 && (
                  <footer>
                    {mediaViewer.images.map((image, index) => (
                      <button type="button" key={`${image.slice(0, 28)}-${index}`} className={mediaViewer.index === index ? styles.tribuneMediaThumbActive : ''} onClick={() => setMediaViewer((current) => current ? { ...current, index } : null)} aria-label={`Vezi fotografia ${index + 1}`} aria-current={mediaViewer.index === index ? 'true' : undefined}>
                        <img src={image} alt="" decoding="async" />
                        <span>{index + 1}</span>
                      </button>
                    ))}
                  </footer>
                )}
              </motion.figure>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
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
                  <form autoComplete="off" onSubmit={saveHeritageMemory}>
                    <label htmlFor="heritage-memory">Care este prima ta amintire de pe Areni?</label>
                    <textarea {...nonSensitiveTextFieldProps} id="heritage-memory" name="amintire_areni" enterKeyHint="done" value={memoryDraft} maxLength={180} placeholder="Un meci, o voce, o persoană..." onChange={(event) => setMemoryDraft(event.target.value)} />
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
  { id: 'lot' as const, label: 'Lot & statistici', meta: `${squad.length} jucători · 2026/27`, icon: UsersRound },
  { id: 'asezare' as const, label: 'Ultimul 11', meta: 'Etapa 1 · campionat', icon: LayoutDashboard },
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
  { name: 'Alin Ciobanu', label: 'Ciobanu', x: 50, y: 89 },
  { name: 'Ilie', label: 'Ilie', x: 14, y: 69 },
  { name: 'Ciprian Perju', label: 'Perju', x: 38, y: 72 },
  { name: 'Vlăduț Cimbru', label: 'Cimbru', x: 62, y: 72 },
  { name: 'Cătălin Golofca', label: 'Golofca', x: 86, y: 69 },
  { name: 'Gabriel David', label: 'David', x: 37, y: 49 },
  { name: 'Ricardo Farcaș', label: 'Farcaș', x: 63, y: 49 },
  { name: 'Andrei Cerlincă', label: 'Cerlincă', x: 16, y: 29 },
  { name: 'Denis Bujor', label: 'Bujor', x: 50, y: 32 },
  { name: 'Stéphane Ferhaoui', label: 'Ferhaoui', x: 84, y: 29 },
  { name: 'Gabriel Răducan', label: 'Răducan', x: 50, y: 11 },
]

const displayPlayerNumber = (number: number | null, padded = false) => number === null
  ? '—'
  : padded ? String(number).padStart(2, '0') : String(number)

const playerInitials = (name: string) => name
  .split(' ')
  .map((part) => part[0])
  .join('')
  .slice(0, 2)
  .toLocaleUpperCase('ro')

function SquadPortrait({ player, alt = '', lazy = false }: { player: Player; alt?: string; lazy?: boolean }) {
  if (player.image) {
    return <img className={styles.playerPortraitAsset} src={player.image} alt={alt} loading={lazy ? 'lazy' : 'eager'} decoding="async" />
  }

  return (
    <span className={styles.playerPortraitPlaceholder} role={alt ? 'img' : undefined} aria-label={alt || undefined} aria-hidden={alt ? undefined : true}>
      <img src={fanEmblem} alt="" />
      <em>{playerInitials(player.name)}</em>
      <small>{player.number === null ? 'CSM' : `#${displayPlayerNumber(player.number, true)}`}</small>
    </span>
  )
}

export function SquadView() {
  const { play } = useSound()
  const [mode, setMode] = useState<TeamMode>('lot')
  const [position, setPosition] = useState<'Toți' | PlayerPosition>('Toți')
  const [selectedId, setSelectedId] = useState('andrei-cerlinca')
  const [query, setQuery] = useState('')
  const [comparison, setComparison] = useState<string[]>([])
  const [showComparison, setShowComparison] = useState(false)
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('cetatea-favorite-players') ?? '[]')
      return Array.isArray(stored) ? stored.filter((value): value is string => typeof value === 'string') : []
    } catch {
      return []
    }
  })

  const filteredSquad = useMemo(() => squad.filter((player) => {
    const matchesPosition = position === 'Toți' || player.position === position
    const normalizedQuery = query.trim().toLocaleLowerCase('ro')
    const matchesQuery = !normalizedQuery || player.name.toLocaleLowerCase('ro').includes(normalizedQuery) || (player.number !== null && String(player.number).includes(normalizedQuery))
    return matchesPosition && matchesQuery
  }), [position, query])

  const selectedPlayer = squad.find((player) => player.id === selectedId) ?? squad[0]
  const selectedIndex = squad.findIndex((player) => player.id === selectedPlayer.id)
  const comparisonPlayers = comparison
    .map((id) => squad.find((player) => player.id === id))
    .filter((player): player is (typeof squad)[number] => Boolean(player))
  const comparisonRows = comparisonPlayers.length === 2 ? [
    { label: 'Apariții confirmate', values: comparisonPlayers.map((player) => player.appearances ?? 0) },
    { label: 'Titularizări publicate', values: comparisonPlayers.map((player) => player.starts ?? 0) },
    { label: 'Goluri', values: comparisonPlayers.map((player) => player.goals ?? 0) },
    { label: 'Pase decisive', values: comparisonPlayers.map((player) => player.assists ?? 0) },
    { label: 'Cartonașe galbene', values: comparisonPlayers.map((player) => player.yellowCards ?? 0) },
    { label: 'Minute documentate', values: comparisonPlayers.map((player) => player.documentedMinutes ?? 0) },
  ] : []

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

  const selectPlayer = (id: string) => {
    setSelectedId(id)
    play('navigate')
  }

  const stepPlayer = (direction: number) => {
    const nextIndex = (selectedIndex + direction + squad.length) % squad.length
    selectPlayer(squad[nextIndex].id)
  }

  const toggleFavorite = (id: string) => {
    setFavorites((current) => current.includes(id)
      ? current.filter((item) => item !== id)
      : [...current, id])
    play('success')
  }

  const toggleComparison = (id: string) => {
    setComparison((current) => {
      if (current.includes(id)) return current.filter((item) => item !== id)
      if (current.length < 2) return [...current, id]
      return [current[1], id]
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
          <div className={styles.teamPulse} aria-label="Rezumatul echipei după două etape">
            <header><span><Activity aria-hidden="true" /> Forma Cetății</span><small>după etapa a II-a</small></header>
            <div><b>Î</b><b>V</b><strong>3 PCT.</strong></div>
            <dl><div><dt>Meciuri</dt><dd>2</dd></div><div><dt>Goluri</dt><dd>3–3</dd></div><div><dt>Lot</dt><dd>{squad.length}</dd></div></dl>
            <p><span>Lideri ofensivi</span><b>Răducan 2G · David 1G</b></p>
          </div>
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
                    <em><BadgeCheck aria-hidden="true" /> LOT 2026/27</em>
                  </header>

                  <div className={styles.playerHero}>
                    <span className={styles.playerWatermark}>{displayPlayerNumber(selectedPlayer.number, true)}</span>
                    <div className={styles.playerSigil}>
                      <i /><i />
                      <SquadPortrait player={selectedPlayer} alt={selectedPlayer.image ? `Portret oficial ${selectedPlayer.name}` : `Identitate vizuală ${selectedPlayer.name}`} />
                      <b>{displayPlayerNumber(selectedPlayer.number, true)}</b>
                    </div>
                    <div className={styles.playerIdentity}>
                      <small>{selectedPlayer.role} · CSM Cetatea 1932</small>
                      <h2>{selectedPlayer.name}</h2>
                      <span><BadgeCheck aria-hidden="true" /> {selectedPlayer.captain ? 'Căpitanul Cetății · ' : ''}lotul actual al primei echipe</span>
                      <div className={styles.playerIdentityFacts}>
                        <span><CalendarDays aria-hidden="true" /> {selectedPlayer.birthDate}</span>
                        <span>{selectedPlayer.height ?? 'Înălțime nepublicată'}</span>
                        <span>{selectedPlayer.foot ?? 'Picior nedeclarat'}</span>
                      </div>
                    </div>
                    <div className={styles.playerStepper}>
                      <button type="button" onClick={() => stepPlayer(-1)} aria-label="Jucătorul precedent"><ChevronLeft aria-hidden="true" /></button>
                      <span>{String(selectedIndex + 1).padStart(2, '0')} / {squad.length}</span>
                      <button type="button" onClick={() => stepPlayer(1)} aria-label="Jucătorul următor"><ChevronRight aria-hidden="true" /></button>
                    </div>
                  </div>

                  <div className={styles.playerCredentials}>
                    <div className={styles.credentialsHeading}><span><BarChart3 aria-hidden="true" /> Sezon 2026/27</span><small>Doar cifre confirmate public</small></div>
                    <span><small>Apariții</small><strong>{selectedPlayer.appearances ?? 0}</strong></span>
                    <span><small>Titular</small><strong>{selectedPlayer.starts ?? 0}</strong></span>
                    <span><small>Goluri</small><strong>{selectedPlayer.goals ?? 0}</strong></span>
                    <span><small>Pase decisive</small><strong>{selectedPlayer.assists ?? 0}</strong></span>
                  </div>

                  <footer className={styles.playerActions}>
                    <button
                      type="button"
                      className={favorites.includes(selectedPlayer.id) ? styles.playerActionActive : ''}
                      onClick={() => toggleFavorite(selectedPlayer.id)}
                      aria-pressed={favorites.includes(selectedPlayer.id)}
                    >
                      <Heart aria-hidden="true" />
                      <span><strong>{favorites.includes(selectedPlayer.id) ? 'Favorit în Cetate' : 'Adaugă la favoriți'}</strong><small>Salvat doar pentru tine</small></span>
                    </button>
                    <button
                      type="button"
                      className={comparison.includes(selectedPlayer.id) ? styles.playerActionActive : ''}
                      onClick={() => toggleComparison(selectedPlayer.id)}
                      aria-pressed={comparison.includes(selectedPlayer.id)}
                    >
                      <GitCompareArrows aria-hidden="true" />
                      <span><strong>{comparison.includes(selectedPlayer.id) ? 'Selectat pentru duel' : 'Adaugă la comparație'}</strong><small>{comparison.length} din 2 selectați</small></span>
                    </button>
                    <div className={styles.playerDataStamp}>
                      <Activity aria-hidden="true" />
                      <span><strong>{selectedPlayer.documentedMinutes ?? 0} minute documentate</strong><small>În lot din {selectedPlayer.joined}</small></span>
                    </div>
                  </footer>
                </article>

                <aside className={styles.squadDirectory}>
                  <header>
                    <div><small>Lotul actual · 2026/27</small><strong>Explorează echipa</strong></div>
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
                    <input {...nonSensitiveTextFieldProps} type="search" name="cautare_jucator" enterKeyHint="search" autoCapitalize="words" aria-label="Caută un jucător" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Caută nume sau număr" />
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
                          key={player.id}
                          className={`${selectedPlayer.id === player.id ? styles.directoryPlayerActive : ''} ${favorites.includes(player.id) ? styles.directoryPlayerFavorite : ''}`}
                          style={{ '--player-tone': positionTone[player.position] } as CSSProperties}
                          onClick={() => selectPlayer(player.id)}
                          aria-pressed={selectedPlayer.id === player.id}
                          title={`${player.name} · ${player.position}`}
                        >
                          <span className={styles.directoryPortrait}>
                            <SquadPortrait player={player} lazy />
                            <b>{displayPlayerNumber(player.number, true)}</b>
                          </span>
                          <span>
                            <strong><span className={styles.playerNameFull}>{player.name}</span><span className={styles.playerNameCompact}>{compactName}</span></strong>
                            <small>{player.appearances ?? 0} ap. · {(player.goals ?? 0) + (player.assists ?? 0)} contribuții</small>
                          </span>
                          {favorites.includes(player.id) && <Star aria-label="Favorit" />}
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
                  <header><span><CircleDot aria-hidden="true" /> Ultimul 11 publicat · 2 august 2026</span><strong>4–2–3–1 / CONCORDIA</strong></header>
                  <div className={styles.formationPitch}>
                    <span className={styles.pitchHalf} /><span className={styles.pitchCircle} /><span className={styles.pitchBoxTop} /><span className={styles.pitchBoxBottom} />
                    {formationSlots.map((slot) => {
                      const player = squad.find((item) => item.name === slot.name)
                      const initials = slot.name.split(' ').map((part) => part[0]).join('').slice(0, 2)
                      return (
                        <button
                          type="button"
                          key={slot.name}
                          className={`${player && selectedPlayer.id === player.id ? styles.formationPlayerActive : ''} ${!player ? styles.formationPlayerUnlinked : ''}`}
                          style={{ '--x': `${slot.x}%`, '--y': `${slot.y}%`, '--player-tone': player ? positionTone[player.position] : 'var(--tone-green)' } as CSSProperties}
                          onClick={() => player ? selectPlayer(player.id) : play('toggle')}
                          aria-label={player ? `Deschide profilul lui ${player.name}` : `${slot.name}, în formula oficială publicată`}
                        >
                          <i>{player ? <SquadPortrait player={player} lazy /> : <b>{initials}</b>}</i><span>{slot.label}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>

                <aside className={styles.formationIntel} style={{ '--player-tone': positionTone[selectedPlayer.position] } as CSSProperties}>
                  <span className={styles.formationBadge}><SquadPortrait player={selectedPlayer} alt={selectedPlayer.image ? `Portret oficial ${selectedPlayer.name}` : `Identitate vizuală ${selectedPlayer.name}`} /><b>{displayPlayerNumber(selectedPlayer.number)}</b></span>
                  <small>Dosar tactic</small>
                  <h2>{selectedPlayer.name}</h2>
                  <strong>{selectedPlayer.role}</strong>
                  <p>Acesta este ultimul unsprezece de start publicat integral în campionat. În etapa următoare, Cetatea a câștigat cu 2–0 la Târgu Mureș, prin dubla lui Gabriel Răducan.</p>
                  <div><span><small>Apariții</small><b>{selectedPlayer.appearances ?? 0}</b></span><span><small>G+A</small><b>{(selectedPlayer.goals ?? 0) + (selectedPlayer.assists ?? 0)}</b></span><span><small>Etapa 2</small><b>0–2</b></span></div>
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
                        <span className={styles.staffPortrait}>{member.image ? <img src={member.image} alt="" loading="lazy" decoding="async" /> : <UserRoundCog aria-hidden="true" />}</span>
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

      <AnimatePresence initial={false} mode="sync">
        {showComparison && comparisonPlayers.length === 2 && (
          <motion.div
            className={styles.sectionPanelLayer}
            variants={panelLayerVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <motion.button type="button" className={styles.sectionPanelBackdrop} variants={panelBackdropVariants} onClick={() => setShowComparison(false)} aria-label="Închide comparația" />
            <motion.div
              className={styles.teamComparison}
              role="dialog"
              aria-modal="true"
              aria-labelledby="team-comparison-title"
              variants={panelFromRightVariants}
            >
              <header>
                <div><small>Laboratorul lotului</small><strong id="team-comparison-title">Comparație directă</strong></div>
                <button type="button" onClick={() => setShowComparison(false)} aria-label="Închide comparația"><X aria-hidden="true" /></button>
              </header>
              <div className={styles.comparisonArena}>
                <div className={styles.comparisonGrid}>
                  {comparisonPlayers.map((player, playerIndex) => (
                    <article key={player.id} style={{ '--player-tone': positionTone[player.position] } as CSSProperties}>
                      <span className={styles.comparisonNumber}>{displayPlayerNumber(player.number, true)}</span>
                      <div className={styles.comparisonIdentity}><SquadPortrait player={player} alt={player.image ? `Portret oficial ${player.name}` : `Identitate vizuală ${player.name}`} /><span><small>{player.role}</small><strong>{player.name}</strong></span></div>
                      <div className={styles.comparisonBio}>
                        <span><small>Vârstă</small><strong>{player.age} ani</strong></span>
                        <span><small>Înălțime</small><strong>{player.height ?? '—'}</strong></span>
                        <span><small>Picior</small><strong>{player.foot ?? '—'}</strong></span>
                      </div>
                      <button type="button" onClick={() => { selectPlayer(player.id); setShowComparison(false) }}>Deschide profilul <ArrowRight aria-hidden="true" /></button>
                      {playerIndex === 0 && <em>VS</em>}
                    </article>
                  ))}
                </div>
                <div className={styles.comparisonBattle} aria-label="Comparația statisticilor confirmate">
                  {comparisonRows.map((row) => {
                    const maximum = Math.max(row.values[0], row.values[1], 1)
                    return (
                      <div className={styles.comparisonMetricDuel} key={row.label}>
                        <strong>{row.values[0]}</strong>
                        <span className={styles.comparisonBarLeft}><i style={{ '--metric-width': `${(row.values[0] / maximum) * 100}%` } as CSSProperties} /></span>
                        <small>{row.label}</small>
                        <span className={styles.comparisonBarRight}><i style={{ '--metric-width': `${(row.values[1] / maximum) * 100}%` } as CSSProperties} /></span>
                        <strong>{row.values[1]}</strong>
                      </div>
                    )
                  })}
                </div>
              </div>
              <footer><span>Portrete exclusiv Cetatea · statistici documentate public, fără completări inventate</span><button type="button" onClick={() => { setComparison([]); setShowComparison(false) }}>Golește selecția</button></footer>
            </motion.div>
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

      <AnimatePresence initial={false} mode="sync">
        {readerArticle && (
          <motion.div
            className={styles.sectionPanelLayer}
            variants={panelLayerVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <motion.button type="button" className={styles.sectionPanelBackdrop} variants={panelBackdropVariants} onClick={() => setReaderArticle(null)} aria-label="Închide articolul" />
            <motion.div
              className={styles.articleReader}
              role="dialog"
              aria-modal="true"
              aria-labelledby="article-reader-title"
              variants={panelFromRightVariants}
              style={{ '--news-tone': readerArticle.tone } as CSSProperties}
            >
              <header>
                <span>{readerArticle.category} / {readerArticle.date}</span>
                <button type="button" onClick={() => setReaderArticle(null)} aria-label="Închide articolul"><X aria-hidden="true" /></button>
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
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence initial={false} mode="sync">
        {conversationArticle && (
          <motion.div
            className={styles.newsConversationLayer}
            variants={panelLayerVariants}
            initial="closed"
            animate="open"
            exit="closed"
          >
            <motion.button type="button" className={styles.newsConversationBackdrop} variants={panelBackdropVariants} onClick={() => setConversationArticle(null)} aria-label="Închide conversația" />
            <motion.aside
              className={styles.newsConversation}
              role="dialog"
              aria-modal="true"
              aria-labelledby="news-conversation-title"
              style={{ '--news-tone': conversationArticle.tone } as CSSProperties}
              variants={panelFromRightVariants}
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

              <form className={styles.commentComposer} autoComplete="off" onSubmit={submitComment}>
                <span>CS</span>
                <label>
                  <input
                    {...nonSensitiveTextFieldProps}
                    type="text"
                    name="mesaj_articol_cetatea"
                    enterKeyHint="send"
                    aria-label="Mesaj pentru Cetatea"
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
