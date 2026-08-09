import { motion, type Variants } from 'motion/react'
import {
  useState,
  type CSSProperties,
  type FormEvent,
} from 'react'
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
