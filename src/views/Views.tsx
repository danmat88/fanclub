import { AnimatePresence, motion, type Variants } from 'motion/react'
import {
  ArrowLeft,
  ArrowRight,
  Bell,
  Bookmark,
  CalendarDays,
  Clock3,
  Eye,
  Newspaper,
  Pause,
  Play,
  Share2,
  Sparkles,
  X,
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
import { club, nextMatch, squad, standings, upcomingFixtures, type PlayerPosition } from '../data/clubData'
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

export function SquadView() {
  const { play } = useSound()
  const [position, setPosition] = useState<'Toți' | PlayerPosition>('Toți')
  const [selectedNumber, setSelectedNumber] = useState(10)
  const filteredSquad = position === 'Toți'
    ? squad
    : squad.filter((player) => player.position === position)
  const selectedPlayer = squad.find((player) => player.number === selectedNumber) ?? squad[0]

  return (
    <section className={styles.view}>
      <ViewIntro code="LOT–04" label="Garda Cetății / lot oficial" title="Cei care apără" accent="Cetatea." />
      <div className={styles.squadLayout}>
        <motion.div className={styles.rosterBoard} variants={reveal} initial="hidden" animate="visible" custom={0.05}>
          <HudLabel value={`${squad.length} DE JUCĂTORI`}>Lotul primei echipe</HudLabel>
          <div className={styles.rosterFilters} aria-label="Filtrează lotul după post">
            {(['Toți', 'Portar', 'Fundaș', 'Mijlocaș', 'Atacant'] as const).map((filter) => (
              <button
                key={filter}
                className={position === filter ? styles.rosterFilterActive : ''}
                onClick={() => {
                  setPosition(filter)
                  play('toggle')
                }}
                aria-pressed={position === filter}
              >
                {filter}
              </button>
            ))}
          </div>
          <div className={styles.rosterGrid}>
            {filteredSquad.map((player) => (
              <button
                key={player.number}
                className={`${styles.rosterPlayer} ${selectedPlayer.number === player.number ? styles.rosterPlayerActive : ''}`}
                onClick={() => {
                  setSelectedNumber(player.number)
                  play('navigate')
                }}
                aria-pressed={selectedPlayer.number === player.number}
                title={`Numărul ${player.number}, ${player.name}, ${player.position}`}
              >
                <b>{String(player.number).padStart(2, '0')}</b>
                <span><strong>{player.name}</strong><small>{player.position}</small></span>
              </button>
            ))}
          </div>
        </motion.div>

        <motion.aside className={styles.squadPanel} variants={reveal} initial="hidden" animate="visible" custom={0.13}>
          <div className={styles.wallHeading}><div><span>Jucător selectat</span><strong>Profilul lotului.</strong></div><em>OFICIAL</em></div>
          <div className={styles.selectedPlayerVisual}>
            <img src={club.badge} alt="Sigla Cetatea Suceava" />
            <span>{String(selectedPlayer.number).padStart(2, '0')}</span>
          </div>
          <div className={styles.playerName}><small>{selectedPlayer.position} / CSM Cetatea 1932</small><strong>{selectedPlayer.name}</strong></div>
          <div className={styles.playerMetrics}>
            <span><small>Număr</small><strong>{String(selectedPlayer.number).padStart(2, '0')}</strong></span>
            <span><small>Post</small><strong>{selectedPlayer.position}</strong></span>
            <span><small>Naționalitate</small><strong>Român</strong></span>
          </div>
        </motion.aside>
      </div>
    </section>
  )
}

export function LeagueTableView() {
  const standingColumns = [standings.slice(0, 11), standings.slice(11)]

  return (
    <section className={styles.view}>
      <ViewIntro code="L2–05" label="Liga a II-a / clasament actual" title="Drumul spre" accent="vârf." />
      <div className={styles.tableLayout}>
        <motion.div className={styles.standings} variants={reveal} initial="hidden" animate="visible" custom={0.05}>
          <div className={styles.standingsGrid}>
            {standingColumns.map((column, columnIndex) => (
              <div className={styles.standingColumn} key={columnIndex}>
                <div className={styles.tableHead}><span>Loc / club</span><span>M</span><span>P</span><span>Formă</span></div>
                {column.map((row) => (
                  <div className={`${styles.tableRow} ${row.name === club.name ? styles.ourTeam : ''}`} key={row.position} title={row.name}>
                    <span>{String(row.position).padStart(2, '0')}</span>
                    <strong><img src={row.badge} alt="" />{row.shortName}</strong>
                    <span>{row.played}</span>
                    <b>{row.points}</b>
                    <div aria-label={`Formă: ${row.form.join(', ')}`}>
                      {row.form.map((result, index) => (
                        <i
                          key={`${result}-${index}`}
                          className={result === 'V' ? styles.formWin : result === 'E' ? styles.formDraw : styles.formLoss}
                          title={result === 'V' ? 'Victorie' : result === 'E' ? 'Egal' : 'Înfrângere'}
                        >{result}</i>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        <motion.aside className={styles.seasonVector} variants={reveal} initial="hidden" animate="visible" custom={0.13}>
          <HudLabel value="DUPĂ 2 ETAPE">Cetatea în clasament</HudLabel>
          <strong className={styles.rankNumber}>10</strong>
          <span>Locul actual · 3 puncte · golaveraj 0</span>
          <div className={styles.formSummary}>
            <i className={styles.formLoss}>Î</i>
            <i className={styles.formWin}>V</i>
            <strong>Prima victorie: 2–0 la Târgu Mureș</strong>
          </div>
          <div className={styles.fixturePreview}>
            <small>Următoarele etape</small>
            {upcomingFixtures.slice(0, 3).map((fixture) => (
              <span key={`${fixture.date}-${fixture.home}`}>
                <b>{fixture.date}</b>
                <em>{fixture.home} — {fixture.away}</em>
              </span>
            ))}
          </div>
          <p>Date actualizate din clasamentul și programul publicate de club.</p>
        </motion.aside>
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
]

const newsCategories: NewsCategory[] = ['Toate', 'Meci', 'Echipă', 'Comunitate', 'Club']

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
    if (!autoplay || hovering || readerArticle || visibleArticles.length < 2) return
    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % visibleArticles.length)
    }, 7000)
    return () => window.clearInterval(timer)
  }, [autoplay, hovering, readerArticle, visibleArticles.length])

  useEffect(() => {
    if (!readerArticle) return
    const closeReader = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setReaderArticle(null)
    }
    document.addEventListener('keydown', closeReader)
    return () => document.removeEventListener('keydown', closeReader)
  }, [readerArticle])

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
                <div><small>{article.category} · {article.readTime}</small><strong>{article.title}</strong></div>
                <i />
              </button>
            ))}
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
              </div>
            </footer>
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
