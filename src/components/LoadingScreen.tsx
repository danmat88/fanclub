import { motion, type Variants } from 'motion/react'
import { useEffect, useState } from 'react'
import fanEmblem from '../assets/brand/cetatea-fan-emblem.webp'
import { usePerformance } from '../contexts/usePerformance'
import styles from './LoadingScreen.module.css'

type LoadingScreenProps = {
  isSceneReady: boolean
  onComplete: () => void
}

const loaderSequence: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
  exit: {
    opacity: 0,
    scale: 1.025,
    transition: { delay: 0.62, duration: 0.5, ease: [0.76, 0, 0.24, 1] },
  },
}

const loaderEconomySequence: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
  exit: {
    opacity: 0,
    transition: { delay: 0.12, duration: 0.2, ease: 'easeOut' },
  },
}

const interfaceSequence: Variants = {
  hidden: {},
  visible: {
    transition: { delayChildren: 0.86, staggerChildren: 0.13 },
  },
  exit: {
    transition: { staggerChildren: 0.065, staggerDirection: -1 },
  },
}

const interfaceEconomySequence: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: 0.24, staggerChildren: 0.055 } },
  exit: { transition: { staggerChildren: 0.025, staggerDirection: -1 } },
}

const revealItem: Variants = {
  hidden: { opacity: 0, y: 22, filter: 'blur(9px)' },
  visible: {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.58, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: -18,
    filter: 'blur(7px)',
    transition: { duration: 0.32, ease: [0.7, 0, 0.84, 0] },
  },
}

const revealEconomyItem: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.2, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.14 } },
}

const identitySequence: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.14 } },
  exit: { transition: { staggerChildren: 0.05, staggerDirection: -1 } },
}

const emblemSequence: Variants = {
  hidden: { opacity: 0, scale: 0.68, rotate: -7, filter: 'blur(10px)' },
  visible: {
    opacity: 1,
    scale: 1,
    rotate: 0,
    filter: 'blur(0px)',
    transition: { duration: 0.82, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    scale: 1.16,
    rotate: 4,
    filter: 'blur(8px)',
    transition: { duration: 0.38 },
  },
}

const emblemEconomySequence: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.24, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.14 } },
}

const titleSequence: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.11, delayChildren: 0.08 } },
  exit: { transition: { staggerChildren: 0.045, staggerDirection: -1 } },
}

const titleItem: Variants = {
  hidden: { opacity: 0, y: '110%' },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.68, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    y: '-80%',
    transition: { duration: 0.3, ease: [0.7, 0, 0.84, 0] },
  },
}

const titleEconomyItem: Variants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.22, ease: 'easeOut' } },
  exit: { opacity: 0, transition: { duration: 0.14 } },
}

export function LoadingScreen({ isSceneReady, onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const { isEconomy } = usePerformance()

  useEffect(() => {
    if (!isSceneReady) return

    const startedAt = performance.now() + (isEconomy ? 240 : 720)
    const duration = isEconomy ? 1250 : 2350
    let frame = 0
    let completionTimer = 0

    const updateProgress = (now: number) => {
      const nextProgress = Math.max(0, Math.min((now - startedAt) / duration, 1))
      setProgress(Math.round(nextProgress * 100))

      if (nextProgress < 1) {
        frame = requestAnimationFrame(updateProgress)
      } else {
        completionTimer = window.setTimeout(onComplete, isEconomy ? 100 : 260)
      }
    }

    frame = requestAnimationFrame(updateProgress)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(completionTimer)
    }
  }, [isEconomy, isSceneReady, onComplete])

  return (
    <motion.div
      className={styles.loader}
      variants={isEconomy ? loaderEconomySequence : loaderSequence}
      initial="hidden"
      animate={isSceneReady ? 'visible' : 'hidden'}
      exit="exit"
    >
      <div className={styles.cinematicShade} />
      <div className={styles.noise} />

      <motion.div className={styles.interface} variants={isEconomy ? interfaceEconomySequence : interfaceSequence}>
        <motion.div className={styles.frame} variants={isEconomy ? revealEconomyItem : revealItem}>
          <span><i /> 47.6514° N · STADIONUL ARENI</span>
          <span>CLUBUL SUPORTERILOR · SUCEAVA · 1932</span>
        </motion.div>

        <motion.div className={styles.identity} variants={identitySequence}>
          <motion.div className={styles.emblemStage} variants={isEconomy ? emblemEconomySequence : emblemSequence}>
            <motion.span animate={isEconomy ? undefined : { rotate: 360 }} transition={{ duration: 18, repeat: Infinity, ease: 'linear' }} />
            <motion.span animate={isEconomy ? undefined : { rotate: -360 }} transition={{ duration: 24, repeat: Infinity, ease: 'linear' }} />
            <img src={fanEmblem} alt="Emblema Clubului Suporterilor Cetatea Suceava" />
          </motion.div>

          <motion.div className={styles.title} variants={titleSequence} aria-label="Cetatea se trezește">
            <motion.small variants={isEconomy ? titleEconomyItem : titleItem}>Din oraș. Pentru oraș.</motion.small>
            <span className={styles.titleMask}>
              <motion.strong variants={isEconomy ? titleEconomyItem : titleItem}>CETATEA</motion.strong>
            </span>
            <span className={styles.titleMask}>
              <motion.strong variants={isEconomy ? titleEconomyItem : titleItem}>SE TREZEȘTE</motion.strong>
            </span>
            <motion.em variants={isEconomy ? titleEconomyItem : titleItem}>O cetate. O tribună. O singură voce.</motion.em>
          </motion.div>
        </motion.div>

        <motion.div className={styles.coordinates} variants={isEconomy ? revealEconomyItem : revealItem} aria-hidden="true">
          <span>SV</span>
          <i />
          <strong>BUCOVINA</strong>
        </motion.div>

        <motion.div className={styles.progressArea} variants={isEconomy ? revealEconomyItem : revealItem}>
          <div className={styles.progressMeta}>
            <span><i /> {progress < 36 ? 'Aprindem nocturna' : progress < 72 ? 'Ridicăm tribuna' : 'Deschidem porțile'}</span>
            <strong>{progress.toString().padStart(2, '0')}<small>%</small></strong>
          </div>
          <div className={styles.track}>
            <motion.div
              className={styles.fill}
              animate={{ scaleX: progress / 100 }}
              transition={{ duration: 0.08, ease: 'linear' }}
            />
          </div>
          <div className={styles.progressSteps} aria-hidden="true">
            <span>Identitate</span><span>Areni</span><span>Tribună</span><span>Gata de meci</span>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}
