import { Castle, RadioTower, ShieldCheck, UsersRound, type LucideIcon } from 'lucide-react'
import { motion, type Variants } from 'motion/react'
import { useEffect, useState } from 'react'
import fanEmblem from '../assets/brand/cetatea-fan-emblem.webp'
import { usePerformance } from '../contexts/usePerformance'
import styles from './LoadingScreen.module.css'

type LoadingScreenProps = {
  isSceneReady: boolean
  onComplete: () => void
}

type LoadingPhase = {
  label: string
  meta: string
  icon: LucideIcon
}

const loadingPhases: LoadingPhase[] = [
  { label: 'Aprindem cetatea', meta: 'Identitate', icon: Castle },
  { label: 'Chemăm tribuna', meta: 'Comunitate', icon: UsersRound },
  { label: 'Deschidem porțile', meta: 'Zi de meci', icon: ShieldCheck },
]

const loaderSequence: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
  exit: {
    opacity: 0,
    transition: { delay: .34, duration: .44, ease: [0.76, 0, 0.24, 1] },
  },
}

const loaderEconomySequence: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
  exit: { opacity: 0, transition: { delay: .08, duration: .18, ease: 'easeOut' } },
}

const interfaceSequence: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: .28, staggerChildren: .12 } },
  exit: { transition: { staggerChildren: .045, staggerDirection: -1 } },
}

const interfaceEconomySequence: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: .1, staggerChildren: .04 } },
  exit: { transition: { staggerChildren: .02, staggerDirection: -1 } },
}

const revealItem: Variants = {
  hidden: { opacity: 0, y: 18, filter: 'blur(8px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: .55, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -14,
    filter: 'blur(6px)',
    transition: { duration: .25, ease: [0.7, 0, 0.84, 0] },
  },
}

const revealEconomyItem: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: .16, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: .1 } },
}

const identitySequence: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: .14, delayChildren: .08 } },
  exit: { transition: { staggerChildren: .04, staggerDirection: -1 } },
}

const emblemSequence: Variants = {
  hidden: { opacity: 0, scale: .74, rotate: -5, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    filter: 'blur(0px)',
    transition: { duration: .78, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { opacity: 0, scale: 1.12, filter: 'blur(7px)', transition: { duration: .3 } },
}

const titleItem: Variants = {
  hidden: { opacity: 0, y: '105%' },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: .62, ease: [0.16, 1, 0.3, 1] },
  },
  exit: { opacity: 0, y: '-70%', transition: { duration: .24, ease: [0.7, 0, 0.84, 0] } },
}

const economyTitleItem: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: .16, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: .1 } },
}

export function LoadingScreen({ isSceneReady, onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const { isEconomy } = usePerformance()
  const activePhase = progress < 34 ? 0 : progress < 72 ? 1 : 2
  const status = loadingPhases[activePhase].label

  useEffect(() => {
    if (!isSceneReady) return

    const startedAt = performance.now() + (isEconomy ? 180 : 480)
    const duration = isEconomy ? 1800 : 4200
    let frame = 0
    let completionTimer = 0

    const updateProgress = (now: number) => {
      const nextProgress = Math.max(0, Math.min((now - startedAt) / duration, 1))
      setProgress(Math.round(nextProgress * 100))

      if (nextProgress < 1) {
        frame = requestAnimationFrame(updateProgress)
      } else {
        completionTimer = window.setTimeout(onComplete, isEconomy ? 120 : 280)
      }
    }

    frame = requestAnimationFrame(updateProgress)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(completionTimer)
    }
  }, [isEconomy, isSceneReady, onComplete])

  const itemVariant = isEconomy ? revealEconomyItem : revealItem
  const headingVariant = isEconomy ? economyTitleItem : titleItem

  return (
    <motion.div
      className={styles.loader}
      variants={isEconomy ? loaderEconomySequence : loaderSequence}
      initial="hidden"
      animate={isSceneReady ? 'visible' : 'hidden'}
      exit="exit"
      role="progressbar"
      aria-label={`${status}. Se încarcă aplicația.`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
    >
      <div className={styles.cinematicShade} />
      <div className={styles.noise} />
      <div className={styles.lightSweep} />

      <motion.div className={styles.interface} variants={isEconomy ? interfaceEconomySequence : interfaceSequence}>
        <motion.header className={styles.signalBar} variants={itemVariant}>
          <span className={styles.citySignal}><i /> Cetatea / Suceava</span>
          <span className={styles.networkSignal}><RadioTower strokeWidth={1.8} aria-hidden="true" /> Semnalul tribunei <b>activ</b></span>
          <span className={styles.locationSignal}>47.6514° N · Stadionul Areni</span>
        </motion.header>

        <motion.aside className={styles.phaseRail} variants={itemVariant} aria-label="Etapele încărcării">
          <span className={styles.phaseAxis} aria-hidden="true" />
          {loadingPhases.map((phase, index) => {
            const PhaseIcon = phase.icon
            const phaseClass = index < activePhase
              ? styles.phaseDone
              : index === activePhase
                ? styles.phaseActive
                : ''

            return (
              <div className={`${styles.phase} ${phaseClass}`} key={phase.meta}>
                <span className={styles.phaseIndex}>0{index + 1}</span>
                <PhaseIcon strokeWidth={1.7} aria-hidden="true" />
                <span className={styles.phaseCopy}>
                  <small>{phase.meta}</small>
                  <strong>{phase.label}</strong>
                </span>
              </div>
            )
          })}
        </motion.aside>

        <motion.main className={styles.identity} variants={identitySequence}>
          <motion.div className={styles.emblemStage} variants={isEconomy ? revealEconomyItem : emblemSequence}>
            <motion.span className={styles.orbitPrimary} animate={isEconomy ? undefined : { rotate: 360 }} transition={{ duration: 16, repeat: Infinity, ease: 'linear' }} />
            <motion.span className={styles.orbitSecondary} animate={isEconomy ? undefined : { rotate: -360 }} transition={{ duration: 23, repeat: Infinity, ease: 'linear' }} />
            <span className={styles.emblemCode}>CSM · 1932</span>
            <img src={fanEmblem} alt="Emblema Clubului Suporterilor Cetatea Suceava" />
          </motion.div>

          <motion.div className={styles.title} variants={identitySequence} aria-label="Cetatea se ridică">
            <motion.small variants={headingVariant}>Din oraș. Pentru oraș.</motion.small>
            <span className={styles.titleMask}><motion.strong variants={headingVariant}>CETATEA</motion.strong></span>
            <span className={styles.titleMask}><motion.strong variants={headingVariant}>SE RIDICĂ</motion.strong></span>
            <motion.em variants={headingVariant}>O cetate. O tribună. O singură voce.</motion.em>
          </motion.div>
        </motion.main>

        <motion.div className={styles.fanPulse} variants={itemVariant} aria-hidden="true">
          <span className={styles.pulseOrbit}><i /><i /><i /></span>
          <strong>1932</strong>
          <small>Puls alb-albastru</small>
          <span className={styles.equalizer}><i /><i /><i /><i /><i /><i /><i /></span>
        </motion.div>

        <motion.footer className={styles.progressArea} variants={itemVariant}>
          <div className={styles.progressMeta}>
            <span><i /> {status}</span>
            <small>Ține aproape. Intrăm împreună.</small>
            <strong>{progress.toString().padStart(2, '0')}<em>%</em></strong>
          </div>
          <div className={styles.track}>
            <motion.div className={styles.fill} animate={{ scaleX: progress / 100 }} transition={{ duration: .07, ease: 'linear' }} />
            <span className={styles.progressHead} style={{ left: `${progress}%` }} />
          </div>
          <div className={styles.progressCoordinates} aria-hidden="true">
            <span>SV / BUCOVINA</span><span>CLUBUL SUPORTERILOR</span><span>GATA DE MECI</span>
          </div>
        </motion.footer>
      </motion.div>
    </motion.div>
  )
}
