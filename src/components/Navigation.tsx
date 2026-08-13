import { MoveUpRight } from 'lucide-react'
import { motion } from 'motion/react'
import { NavLink, useNavigate } from 'react-router-dom'
import styles from './Navigation.module.css'
import { navigationItems } from './navigationItems'

type NavigationProps = {
  activePath: string
  collapsed: boolean
  onNavigate: (path: string) => void
  startupVisible?: boolean
}

const MotionNavLink = motion.create(NavLink)

const startupNavigation = {
  hidden: {},
  visible: { transition: { delayChildren: .16, staggerChildren: .11 } },
}

const startupNavigationItem = {
  hidden: { opacity: 0, x: -52 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: .58, ease: [0.16, 1, 0.3, 1] as const },
  },
}

export function Navigation({ activePath, collapsed, onNavigate, startupVisible = true }: NavigationProps) {
  const navigate = useNavigate()

  const handleKeyboardNavigation = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return

    event.preventDefault()
    const direction = event.key === 'ArrowDown' ? 1 : -1
    const activeIndex = navigationItems.findIndex((item) => item.path === activePath)
    const startIndex = activeIndex === -1 ? (direction > 0 ? -1 : 0) : activeIndex
    const nextIndex = (startIndex + direction + navigationItems.length) % navigationItems.length
    onNavigate(navigationItems[nextIndex].path)
    void navigate(navigationItems[nextIndex].path)
  }

  return (
    <motion.nav
      id="navigatie-principala"
      className={`${styles.navigation} ${collapsed ? styles.collapsed : ''}`}
      aria-label="Navigația principală a clubului suporterilor"
      onKeyDown={handleKeyboardNavigation}
      variants={startupNavigation}
      initial={false}
      animate={startupVisible ? 'visible' : 'hidden'}
    >
      <motion.div className={styles.navHub} variants={startupNavigationItem} aria-hidden="true">
        <span>Explorează Cetatea</span>
        <strong><i /> {navigationItems.length} destinații</strong>
      </motion.div>
      <motion.div className={styles.items} variants={startupNavigation}>
        {navigationItems.map((item, index) => {
          const Icon = item.icon

          return (
            <MotionNavLink
              key={item.path}
              to={item.path}
              aria-label={collapsed ? `${item.label} — ${item.meta}` : undefined}
              title={collapsed ? item.label : undefined}
              className={`${styles.item} ${item.path === activePath ? styles.active : ''}`}
              onClick={() => onNavigate(item.path)}
              variants={startupNavigationItem}
            >
              <span className={styles.itemIndex} aria-hidden="true">0{index + 1}</span>
              <span className={styles.iconFrame} aria-hidden="true">
                <Icon strokeWidth={1.9} />
              </span>
              <span className={styles.copy}>
                <strong>{item.label}</strong>
                <small>{item.meta}</small>
              </span>
              <span className={styles.badge}>{item.badge}</span>
              <MoveUpRight className={styles.arrow} strokeWidth={2} aria-hidden="true" />
              <span className={styles.energyRail} aria-hidden="true">
                <i /><i /><i />
              </span>
              <span className={styles.frameMarks} aria-hidden="true"><i /><i /></span>
            </MotionNavLink>
          )
        })}
      </motion.div>
      <motion.div className={styles.navHint} variants={startupNavigationItem} aria-hidden="true">
        <span>Folosește</span>
        <kbd>↑</kbd><kbd>↓</kbd>
        <strong>pentru navigare</strong>
      </motion.div>
    </motion.nav>
  )
}
