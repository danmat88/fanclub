import { ChevronRight } from 'lucide-react'
import { NavLink, useNavigate } from 'react-router-dom'
import styles from './Navigation.module.css'
import { navigationItems } from './navigationItems'

type NavigationProps = {
  activePath: string
  collapsed: boolean
  onNavigate: (path: string) => void
}

export function Navigation({ activePath, collapsed, onNavigate }: NavigationProps) {
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
    <nav
      id="navigatie-principala"
      className={`${styles.navigation} ${collapsed ? styles.collapsed : ''}`}
      aria-label="Navigația principală a clubului suporterilor"
      onKeyDown={handleKeyboardNavigation}
    >
      <div className={styles.navHub} aria-hidden="true">
        <span>Explorează Cetatea</span>
        <strong><i /> 5 destinații</strong>
      </div>
      <div className={styles.items}>
        {navigationItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.path}
              to={item.path}
              aria-label={collapsed ? `${item.label} — ${item.meta}` : undefined}
              title={collapsed ? item.label : undefined}
              className={`${styles.item} ${item.path === activePath ? styles.active : ''}`}
              onClick={() => onNavigate(item.path)}
            >
              <span className={styles.iconFrame} aria-hidden="true">
                <Icon strokeWidth={1.9} />
              </span>
              <span className={styles.copy}>
                <strong>{item.label}</strong>
                <small>{item.meta}</small>
              </span>
              <span className={styles.badge}>{item.badge}</span>
              <ChevronRight className={styles.arrow} strokeWidth={2} aria-hidden="true" />
            </NavLink>
          )
        })}
      </div>
      <div className={styles.navHint} aria-hidden="true">
        <span>Folosește</span>
        <kbd>↑</kbd><kbd>↓</kbd>
        <strong>pentru navigare</strong>
      </div>
    </nav>
  )
}
