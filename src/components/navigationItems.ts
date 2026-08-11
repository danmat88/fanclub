import {
  Megaphone,
  Newspaper,
  Trophy,
  UsersRound,
  type LucideIcon,
} from 'lucide-react'

export type NavigationItem = {
  path: string
  label: string
  meta: string
  badge: string
  icon: LucideIcon
}

export const navigationItems: NavigationItem[] = [
  {
    path: '/',
    label: 'Tribuna',
    meta: 'Comunitatea Cetății',
    badge: 'ACTIV',
    icon: Megaphone,
  },
  {
    path: '/stiri',
    label: 'Știri',
    meta: 'Noutăți și povești',
    badge: 'NOU',
    icon: Newspaper,
  },
  {
    path: '/lot',
    label: 'Echipa',
    meta: 'Jucători și staff',
    badge: '26',
    icon: UsersRound,
  },
  {
    path: '/clasament',
    label: 'Sezonul',
    meta: 'Clasament și rezultate',
    badge: 'LOC 10',
    icon: Trophy,
  },
]
