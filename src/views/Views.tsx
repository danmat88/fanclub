import { AnimatePresence, motion, type Variants } from 'motion/react'
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BadgeCheck,
  Bell,
  Bookmark,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Clock3,
  Eye,
  Flame,
  GitCompareArrows,
  Heart,
  LayoutDashboard,
  MessageCircle,
  Newspaper,
  Pause,
  Play,
  Search,
  Send,
  Share2,
  Shield,
  Sparkles,
  Star,
  ThumbsUp,
  Trophy,
  UserRoundCog,
  UsersRound,
  X,
  Zap,
} from 'lucide-react'
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type FormEvent,
} from 'react'
import fanEmblem from '../assets/brand/cetatea-fan-emblem.webp'
import arenaBackground from '../assets/brand/loading-cetatea-arena.webp'
import { useSound } from '../contexts/useSound'
import { club, nextMatch, squad, standings, technicalStaff, upcomingFixtures, type FormResult, type PlayerPosition } from '../data/clubData'
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

export function NextMatchView() {
  const countdown = useMatchCountdown()
  const { play } = useSound()
  const [messages, setMessages] = useState(initialMessages)
  const [message, setMessage] = useState('')
  const [prediction, setPrediction] = useState<'1' | 'X' | '2' | null>(null)
  const [matchMode, setMatchMode] = useState(false)
  const [checkedIn, setCheckedIn] = useState(false)

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

  return (
    <section className={styles.view}>
      <ViewIntro code="MEC–01" label="Următorul meci / date oficiale" title="Areni intră în" accent="stare de asediu." />

      <div className={styles.matchLayout}>
        <motion.div
          className={styles.matchCommand}
          variants={reveal}
          initial="hidden"
          animate="visible"
          custom={0.06}
        >
          <div className={styles.matchTopline}>
            <HudLabel value={`${nextMatch.dateLabel.toUpperCase()} / ${nextMatch.timeLabel}`}>{nextMatch.venue}</HudLabel>
            <span className={styles.demoSignal}><i /> Program oficial actualizat</span>
          </div>

          <div className={styles.countdown} aria-label="Timp rămas până la meci">
            {[
              [countdown.days, 'Zile'],
              [countdown.hours, 'Ore'],
              [countdown.minutes, 'Minute'],
              [countdown.seconds, 'Secunde'],
            ].map(([value, label]) => (
              <div className={styles.timeUnit} key={label}>
                <strong>{value}</strong>
                <span>{label}</span>
              </div>
            ))}
          </div>

          <div className={styles.matchup}>
            <div className={styles.clubIdentity}>
              <span className={styles.clubCrest}><img src={nextMatch.home.badge} alt="Sigla Cetatea Suceava" /></span>
              <div><small>Gazde</small><strong>{nextMatch.home.name}</strong><em>{nextMatch.home.city}</em></div>
            </div>

            <div className={styles.versusCore}>
              <span>{nextMatch.round}</span>
              <strong>CONTRA</strong>
              <i />
            </div>

            <div className={`${styles.clubIdentity} ${styles.awayClub}`}>
              <div><small>Oaspeți</small><strong>{nextMatch.away.name}</strong><em>{nextMatch.away.city}</em></div>
              <span className={styles.clubCrest}><img src={nextMatch.away.badge} alt="Sigla CSM Satu Mare" /></span>
            </div>
          </div>

          <div className={styles.matchTools}>
            <div className={styles.prediction}>
              <span>Predicția ta</span>
              <div>
                {(['1', 'X', '2'] as const).map((option) => (
                  <button
                    key={option}
                    className={prediction === option ? styles.selectedPrediction : ''}
                    onClick={() => {
                      setPrediction(option)
                      play('toggle')
                    }}
                    aria-pressed={prediction === option}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div className={styles.matchIntel}>
              <span><small>Ora startului</small><strong>{nextMatch.timeLabel}</strong></span>
              <span><small>Cod tribună</small><strong>Alb / Albastru</strong></span>
              <span><small>Formă</small><strong>Î / V</strong></span>
            </div>
          </div>

          <button
            className={`${styles.matchModeButton} ${matchMode ? styles.matchModeActive : ''}`}
            onClick={() => {
              setMatchMode((current) => !current)
              play('success')
            }}
            aria-pressed={matchMode}
          >
            <span><i /> {matchMode ? 'Modul de meci este activ' : 'Activează modul de meci'}</span>
            <small>{matchMode ? 'Suntem gata de meci' : 'Pornește experiența de tribună'}</small>
            <b>{matchMode ? 'ACTIV' : '↗'}</b>
          </button>
        </motion.div>

        <motion.aside
          className={styles.fanWall}
          variants={reveal}
          initial="hidden"
          animate="visible"
          custom={0.14}
        >
          <div className={styles.wallHeading}>
            <div><span>Zidul Cetății</span><strong>Spune-o tare.</strong></div>
            <em><i /> ÎN DIRECT</em>
          </div>

          <div className={styles.messageFeed} aria-live="polite">
            {messages.slice(-3).map((wallMessage, index) => (
              <motion.article
                className={styles.message}
                key={wallMessage.id}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.04 }}
              >
                <span>{wallMessage.author.slice(0, 2).toUpperCase()}</span>
                <div><strong>{wallMessage.author}</strong><p>{wallMessage.text}</p></div>
                <time>{wallMessage.time}</time>
              </motion.article>
            ))}
          </div>

          <div className={styles.crowdCommand}>
            <div className={styles.crowdReading}>
              <span>Puterea tribunei</span>
              <strong>{checkedIn ? '85%' : '84%'}</strong>
            </div>
            <div className={styles.crowdTrack}>
              <motion.i
                animate={{ scaleX: checkedIn ? 0.85 : 0.84 }}
                transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
              />
            </div>
            <button
              className={checkedIn ? styles.checkedIn : ''}
              onClick={() => {
                setCheckedIn((current) => !current)
                play('success')
              }}
              aria-pressed={checkedIn}
            >
              <i /> {checkedIn ? 'Check-in confirmat' : 'Check-in pentru Areni'}
            </button>
          </div>

          <div className={styles.quickMessages}>
            {['Forza Cetatea!', 'Toți la Areni', 'Alb-albastru'].map((text) => (
              <button key={text} onClick={() => quickMessage(text)}>{text}</button>
            ))}
          </div>

          <form className={styles.messageComposer} onSubmit={sendMessage}>
            <label htmlFor="fan-message">Mesajul tău pentru tribună</label>
            <div>
              <input
                id="fan-message"
                value={message}
                maxLength={72}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Scrie pe Zid..."
                autoComplete="off"
              />
              <button type="submit" aria-label="Trimite mesajul">↗</button>
            </div>
            <small>{message.length}/72 · mesaj public</small>
          </form>
        </motion.aside>
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

const chantOptions = ['Cetatea nu cade', 'Suceava, luptă!', 'Alb-albastru până la capăt']

export function CommunityView() {
  const { play } = useSound()
  const [vote, setVote] = useState(0)

  return (
    <section className={styles.view}>
      <ViewIntro code="TRI–03" label="Zidul Cetății" title="O mie de voci." accent="Un singur puls." />
      <div className={styles.communityLayout}>
        <motion.div className={styles.chantVote} variants={reveal} initial="hidden" animate="visible" custom={0.05}>
          <HudLabel value="Sondaj activ">Vocea meciului</HudLabel>
          <h2>Ce scandăm la intrarea echipei?</h2>
          <div className={styles.chantOptions}>
            {chantOptions.map((chant, index) => (
              <button
                key={chant}
                className={vote === index ? styles.chantSelected : ''}
                onClick={() => { setVote(index); play('toggle') }}
              >
                <span>0{index + 1}</span><strong>{chant}</strong><i style={{ '--vote': `${[68, 21, 11][index]}%` } as CSSProperties} />
                <small>{[68, 21, 11][index]}%</small>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.div className={styles.fanRadar} variants={reveal} initial="hidden" animate="visible" custom={0.13}>
          <div className={styles.wallHeading}><div><span>Radar suporteri</span><strong>Suceava este conectată.</strong></div><em><i /> 284</em></div>
          <div className={styles.radarVisual}>
            <span /><span /><span />
            {Array.from({ length: 18 }, (_, index) => (
              <i key={index} style={{ '--dot-angle': `${index * 47}deg`, '--dot-distance': `${24 + (index % 5) * 8}%` } as CSSProperties} />
            ))}
            <strong>SV</strong>
          </div>
          <div className={styles.radarStats}><span><b>68%</b> oraș</span><span><b>32%</b> diaspora</span></div>
        </motion.div>
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

                  <div className={styles.playerDirectoryGrid}>
                    {filteredSquad.map((player) => (
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
                        <span><strong>{player.name}</strong><small>{player.position}</small></span>
                        {favorites.includes(player.number) && <Star aria-label="Favorit" />}
                        <i />
                      </button>
                    ))}
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
                    <span><CalendarDays aria-hidden="true" /><small>Data</small><strong>{selectedFixture.date}</strong></span>
                    <span><CircleDot aria-hidden="true" /><small>Stadion</small><strong>{selectedFixture.venue}</strong></span>
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

          <div className={styles.newsQueue}>
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
