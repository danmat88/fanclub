import {
  IdCard,
  Megaphone,
  RadioTower,
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
    path: '/meci-direct',
    label: 'Meci live',
    meta: 'Fază cu fază',
    badge: 'LIVE',
    icon: RadioTower,
  },
  {
    path: '/tribuna',
    label: 'Peluza',
    meta: 'Mesaje și scandări',
    badge: '284',
    icon: Megaphone,
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
  {
    path: '/carnet',
    label: 'Contul meu',
    meta: 'Carnet și recompense',
    badge: 'NV 08',
    icon: IdCard,
  },
]
