import { Check, Database, LayoutDashboard, LoaderCircle, UserRound, type LucideIcon } from 'lucide-react'
import { AnimatePresence, motion, type Variants } from 'motion/react'
import { useEffect, useMemo, useState } from 'react'
import { usePerformance } from '../contexts/usePerformance'
import styles from './LoadingScreen.module.css'

type LoadingScreenProps = {
  active: boolean
  exiting: boolean
  onComplete: () => void
}

type StartupStep = {
  id: 'application' | 'data' | 'account'
  label: string
  status: string
  startsAt: number
  icon: LucideIcon
}

const startupSteps: StartupStep[] = [
  {
    id: 'application',
    label: 'Aplicație',
    status: 'Pregătim aplicația',
    startsAt: 0,
    icon: LayoutDashboard,
  },
  {
    id: 'data',
    label: 'Informații',
    status: 'Încărcăm informațiile',
    startsAt: 34,
    icon: Database,
  },
  {
    id: 'account',
    label: 'Cont',
    status: 'Pregătim accesul în Tribună',
    startsAt: 72,
    icon: UserRound,
  },
]

const loaderVariants: Variants = {
  hidden: { opacity: 1 },
  visible: { opacity: 1 },
  exit: { opacity: 1, transition: { duration: 0 } },
}

const contentVariants: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: .38, staggerChildren: .24 } },
  exit: { transition: { delayChildren: .04, staggerChildren: .15, staggerDirection: -1 } },
}

const mainVariants: Variants = {
  hidden: {},
  visible: { transition: { staggerChildren: .26, delayChildren: .14 } },
  exit: { transition: { staggerChildren: .12, staggerDirection: -1 } },
}

const reveal: Variants = {
  hidden: { opacity: 0, x: 72, filter: 'blur(7px)' },
  visible: {
    opacity: 1,
    x: 0,
    filter: 'blur(0px)',
    transition: { duration: .68, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    x: -76,
    filter: 'blur(5px)',
    transition: { duration: .46, ease: [0.7, 0, 0.84, 0] },
  },
}

const groupReveal: Variants = {
  hidden: { opacity: 0, x: 64 },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      duration: .66,
      ease: [0.16, 1, 0.3, 1],
      delayChildren: .1,
      staggerChildren: .14,
    },
  },
  exit: {
    opacity: 0,
    x: -68,
    transition: { duration: .46, staggerChildren: .08, staggerDirection: -1 },
  },
}

const stepSequence: Variants = {
  hidden: {},
  visible: { transition: { delayChildren: .1, staggerChildren: .16 } },
  exit: { transition: { staggerChildren: .09, staggerDirection: -1 } },
}

const footerReveal: Variants = {
  hidden: { opacity: 0, y: 34 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      delay: .62,
      duration: .62,
      ease: [0.16, 1, 0.3, 1],
      delayChildren: .08,
      staggerChildren: .14,
    },
  },
  exit: { opacity: 0, y: 34, transition: { duration: .4, staggerChildren: .08, staggerDirection: -1 } },
}

const emblemVariants: Variants = {
  hidden: { opacity: 0, x: -96, scale: .84, filter: 'blur(9px)' },
  visible: {
    opacity: 1,
    x: 0,
    scale: 1,
    filter: 'blur(0px)',
    transition: { duration: .72, ease: [0.16, 1, 0.3, 1] },
  },
  exit: {
    opacity: 0,
    x: -96,
    scale: .96,
    filter: 'blur(4px)',
    transition: { duration: .5, ease: [0.7, 0, 0.84, 0] },
  },
}

export function LoadingScreen({ active, exiting, onComplete }: LoadingScreenProps) {
  const [progress, setProgress] = useState(0)
  const { isEconomy } = usePerformance()
  const activeStepIndex = progress >= 100
    ? startupSteps.length
    : startupSteps.findLastIndex((step) => progress >= step.startsAt)
  const status = progress >= 100
    ? 'Totul este gata'
    : startupSteps[Math.max(0, activeStepIndex)].status

  const stepStates = useMemo(() => startupSteps.map((step, index) => ({
    ...step,
    state: progress >= 100 || index < activeStepIndex
      ? 'done'
      : index === activeStepIndex
        ? 'active'
        : 'pending',
  } as const)), [activeStepIndex, progress])

  useEffect(() => {
    if (!active) return

    const introDelay = 1850
    const duration = 3900
    const startedAt = performance.now() + introDelay
    let frame = 0
    let completionTimer = 0

    const updateProgress = (now: number) => {
      const elapsed = Math.max(0, now - startedAt)
      const linearProgress = Math.min(elapsed / duration, 1)
      const easedProgress = linearProgress < .86
        ? linearProgress
        : .86 + ((linearProgress - .86) / .14) * .14
      setProgress(Math.round(easedProgress * 100))

      if (linearProgress < 1) {
        frame = requestAnimationFrame(updateProgress)
      } else {
        completionTimer = window.setTimeout(onComplete, 360)
      }
    }

    frame = requestAnimationFrame(updateProgress)
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(completionTimer)
    }
  }, [active, isEconomy, onComplete])

  const sequence = contentVariants
  const item = reveal

  return (
    <motion.div
      className={`${styles.loader} ${active || exiting ? styles.loaderVisible : ''} ${progress >= 100 ? styles.loaderReady : ''}`}
      variants={loaderVariants}
      initial="hidden"
      animate={exiting ? 'exit' : active ? 'visible' : 'hidden'}
      exit="exit"
      role="progressbar"
      aria-label={`${status}. Se încarcă aplicația.`}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={progress}
      aria-valuetext={status}
    >
      <motion.div className={styles.content} variants={sequence}>
        <motion.header className={styles.topbar} variants={groupReveal}>
          <motion.span className={styles.topbarBrand} variants={item}><i /> Fan Club Cetatea Suceava</motion.span>
          <motion.span className={styles.topbarMeta} variants={item}>Aplicație neoficială pentru suporteri</motion.span>
        </motion.header>

        <motion.main className={styles.main} variants={mainVariants}>
          <motion.div className={styles.emblemStage} variants={emblemVariants}>
            <span className={styles.emblemGlow} aria-hidden="true" />
            <span className={styles.emblemFrame} aria-hidden="true"><i /><i /><i /><i /></span>
            <span className={styles.emblemAnchor} data-startup-logo-source aria-hidden="true" />
          </motion.div>

          <motion.section className={styles.identity} variants={groupReveal}>
            <motion.span className={styles.eyebrow} variants={item}>Fan Club</motion.span>
            <motion.h1 variants={item}>Cetatea <em>Suceava</em></motion.h1>
            <motion.p variants={item}>Comunitatea suporterilor Cetății.</motion.p>
          </motion.section>

          <motion.section
            className={styles.loadingPanel}
            variants={groupReveal}
            aria-label="Starea încărcării"
          >
            <motion.div className={styles.currentStatus} variants={item}>
              <span className={`${styles.statusIcon} ${progress >= 100 ? styles.statusIconReady : ''}`} aria-hidden="true">
                {progress >= 100 ? <Check /> : <LoaderCircle />}
              </span>
              <AnimatePresence mode="wait" initial={false}>
                <motion.span
                  className={styles.statusCopy}
                  key={status}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -5 }}
                  transition={{ duration: isEconomy ? .1 : .2 }}
                >
                  <small>{progress >= 100 ? 'Gata' : 'În curs'}</small>
                  <strong>{status}</strong>
                </motion.span>
              </AnimatePresence>
            </motion.div>

            <motion.div className={styles.progressTrack} variants={item} aria-hidden="true">
              <motion.span
                className={styles.progressFill}
                animate={{ scaleX: progress / 100 }}
                transition={{ duration: .08, ease: 'linear' }}
              />
            </motion.div>

            <motion.div className={styles.steps} variants={stepSequence}>
              {stepStates.map((step) => {
                const StepIcon = step.icon
                return (
                  <motion.div
                    className={`${styles.step} ${styles[`step${step.state[0].toUpperCase()}${step.state.slice(1)}`]}`}
                    key={step.id}
                    variants={item}
                  >
                    <span className={styles.stepIcon} aria-hidden="true">
                      {step.state === 'done' ? <Check /> : <StepIcon />}
                    </span>
                    <span><small>{step.state === 'done' ? 'Finalizat' : step.state === 'active' ? 'Se încarcă' : 'În așteptare'}</small><strong>{step.label}</strong></span>
                  </motion.div>
                )
              })}
            </motion.div>
          </motion.section>
        </motion.main>

        <motion.footer className={styles.footer} variants={footerReveal}>
          <motion.span variants={item}>Suceava</motion.span>
          <motion.span variants={item}>Creat pentru suporterii Cetății</motion.span>
        </motion.footer>
      </motion.div>
    </motion.div>
  )
}
