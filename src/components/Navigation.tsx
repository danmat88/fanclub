import { NavLink, useNavigate } from 'react-router-dom'
import styles from './Navigation.module.css'
import { navigationItems } from './navigationItems'

type NavigationProps = {
  activePath: string
  onNavigate: (path: string) => void
}

export function Navigation({ activePath, onNavigate }: NavigationProps) {
  const navigate = useNavigate()

  const handleKeyboardNavigation = (event: React.KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'ArrowDown' && event.key !== 'ArrowUp') return

    event.preventDefault()
    const direction = event.key === 'ArrowDown' ? 1 : -1
    const activeIndex = navigationItems.findIndex((item) => item.path === activePath)
    const nextIndex = (activeIndex + direction + navigationItems.length) % navigationItems.length
    onNavigate(navigationItems[nextIndex].path)
    void navigate(navigationItems[nextIndex].path)
  }

  return (
    <nav
      className={styles.navigation}
      aria-label="Navigația principală a clubului suporterilor"
      onKeyDown={handleKeyboardNavigation}
    >
      <div className={styles.navHub} aria-hidden="true">
        <span>Comandamentul Cetății</span>
        <strong><i /> 05 secțiuni</strong>
      </div>
      {navigationItems.map((item, index) => (
        <NavLink
          key={item.path}
          to={item.path}
          className={`${styles.item} ${item.path === activePath ? styles.active : ''}`}
          onClick={() => onNavigate(item.path)}
        >
          <span className={styles.number}>0{index + 1}</span>
          <span className={styles.line} />
          <span className={styles.copy}>
            <strong>{item.label}</strong>
            <small>{item.meta}</small>
          </span>
          <span className={styles.badge}>{item.badge}</span>
        </NavLink>
      ))}
      <div className={styles.navHint} aria-hidden="true">
        <span>↑ ↓</span>
        <i />
        Alege secțiunea
      </div>
    </nav>
  )
}
