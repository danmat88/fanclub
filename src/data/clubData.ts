export type FormResult = 'V' | 'E' | 'Î'

export type Standing = {
  position: number
  name: string
  shortName: string
  played: number
  wins: number
  draws: number
  losses: number
  goalDifference: number
  points: number
  form: FormResult[]
  badge: string
}

export const club = {
  name: 'CSM Cetatea 1932 Suceava',
  shortName: 'Cetatea Suceava',
  founded: 1932,
  reestablished: 2024,
  colors: 'Alb-albastru',
  stadium: 'Stadionul Areni',
  city: 'Suceava',
  badge: '/echipe/cetatea-suceava.png',
}

export const nextMatch = {
  competition: 'Liga a II-a',
  round: 'Etapa a III-a',
  kickoff: '2026-08-15T11:00:00+03:00',
  dateLabel: 'Sâmbătă, 15 august',
  compactDateLabel: '15 aug.',
  timeLabel: '11:00',
  venue: 'Stadionul Areni',
  home: {
    name: 'Cetatea',
    city: 'Suceava',
    badge: '/echipe/cetatea-suceava.png',
  },
  away: {
    name: 'CSM',
    city: 'Satu Mare',
    badge: '/echipe/csm-satu-mare.png',
  },
}

export const latestResult = {
  date: '8 august 2026',
  round: 'Etapa a II-a',
  home: 'ASA Târgu Mureș',
  away: 'Cetatea Suceava',
  score: '0–2',
  venue: 'Stadionul Trans-Sil',
}

export const upcomingFixtures = [
  { date: '15 aug.', time: '11:00', home: 'Cetatea Suceava', away: 'CSM Satu Mare', venue: 'Stadionul Areni' },
  { date: '22 aug.', time: '11:00', home: 'Ștefănești', away: 'Cetatea Suceava', venue: 'Stadionul Dumitru Mătărau' },
  { date: '29 aug.', time: '11:00', home: 'Cetatea Suceava', away: 'Popești-Leordeni', venue: 'Stadionul Areni' },
  { date: '5 sept.', time: '11:00', home: 'Steaua București', away: 'Cetatea Suceava', venue: 'Stadionul Steaua' },
  { date: '12 sept.', time: '11:00', home: 'Cetatea Suceava', away: 'SCM Râmnicu Vâlcea', venue: 'Stadionul Areni' },
  { date: '19 sept.', time: '11:00', home: 'FC Bacău', away: 'Cetatea Suceava', venue: 'De confirmat' },
]

export const standings: Standing[] = [
  { position: 1, name: 'CSM Slatina', shortName: 'Slatina', played: 2, wins: 2, draws: 0, losses: 0, goalDifference: 5, points: 6, form: ['V', 'V'], badge: '/echipe/csm-slatina.png' },
  { position: 2, name: 'CS Concordia Chiajna', shortName: 'Concordia', played: 2, wins: 2, draws: 0, losses: 0, goalDifference: 4, points: 6, form: ['V', 'V'], badge: '/echipe/concordia-chiajna.png' },
  { position: 3, name: 'CS Gloria Bistrița', shortName: 'Gloria Bistrița', played: 2, wins: 2, draws: 0, losses: 0, goalDifference: 4, points: 6, form: ['V', 'V'], badge: '/echipe/gloria-bistrita.png' },
  { position: 4, name: 'CSM Reșița', shortName: 'CSM Reșița', played: 2, wins: 2, draws: 0, losses: 0, goalDifference: 3, points: 6, form: ['V', 'V'], badge: '/echipe/csm-resita.png' },
  { position: 5, name: 'AFC Metalul Buzău', shortName: 'Metalul Buzău', played: 2, wins: 1, draws: 1, losses: 0, goalDifference: 2, points: 4, form: ['V', 'E'], badge: '/echipe/metalul-buzau.png' },
  { position: 6, name: 'SC Popești-Leordeni', shortName: 'Popești-Leordeni', played: 2, wins: 1, draws: 1, losses: 0, goalDifference: 1, points: 4, form: ['V', 'E'], badge: '/echipe/popesti-leordeni.png' },
  { position: 7, name: 'SCM Râmnicu Vâlcea', shortName: 'Râmnicu Vâlcea', played: 2, wins: 1, draws: 1, losses: 0, goalDifference: 1, points: 4, form: ['V', 'E'], badge: '/echipe/csm-ramnicu-valcea.png' },
  { position: 8, name: 'Politehnica Timișoara', shortName: 'Poli Timișoara', played: 2, wins: 1, draws: 1, losses: 0, goalDifference: 1, points: 4, form: ['E', 'V'], badge: '/echipe/politehnica-timisoara.png' },
  { position: 9, name: 'ACS FC Bacău', shortName: 'FC Bacău', played: 2, wins: 1, draws: 0, losses: 1, goalDifference: 2, points: 3, form: ['Î', 'V'], badge: '/echipe/fc-bacau.png' },
  { position: 10, name: 'CSM Cetatea 1932 Suceava', shortName: 'Cetatea Suceava', played: 2, wins: 1, draws: 0, losses: 1, goalDifference: 0, points: 3, form: ['Î', 'V'], badge: '/echipe/cetatea-suceava.png' },
  { position: 11, name: 'CS Afumați', shortName: 'CS Afumați', played: 2, wins: 1, draws: 0, losses: 1, goalDifference: -1, points: 3, form: ['Î', 'V'], badge: '/echipe/cs-afumati.png' },
  { position: 12, name: 'CSL Ștefăneștii de Jos', shortName: 'Ștefănești', played: 2, wins: 1, draws: 0, losses: 1, goalDifference: -2, points: 3, form: ['V', 'Î'], badge: '/echipe/csl-stefanestii-de-jos.png' },
  { position: 13, name: 'FC Metaloglobus București', shortName: 'Metaloglobus', played: 1, wins: 0, draws: 1, losses: 0, goalDifference: 0, points: 1, form: ['E'], badge: '/echipe/metaloglobus.png' },
  { position: 14, name: 'CSC 1599 Șelimbăr', shortName: 'CSC Șelimbăr', played: 2, wins: 0, draws: 1, losses: 1, goalDifference: -1, points: 1, form: ['E', 'Î'], badge: '/echipe/csc-selimbar.png' },
  { position: 15, name: 'CSC Dumbrăvița', shortName: 'Dumbrăvița', played: 2, wins: 0, draws: 1, losses: 1, goalDifference: -1, points: 1, form: ['Î', 'E'], badge: '/echipe/csc-dumbravita.png' },
  { position: 16, name: 'FC Bihor Oradea', shortName: 'FC Bihor', played: 2, wins: 0, draws: 1, losses: 1, goalDifference: -2, points: 1, form: ['Î', 'E'], badge: '/echipe/fc-bihor-oradea.png' },
  { position: 17, name: 'CSM Satu Mare', shortName: 'CSM Satu Mare', played: 2, wins: 0, draws: 1, losses: 1, goalDifference: -2, points: 1, form: ['Î', 'E'], badge: '/echipe/csm-satu-mare.png' },
  { position: 18, name: 'AFC Unirea 04 Slobozia', shortName: 'Unirea Slobozia', played: 2, wins: 0, draws: 1, losses: 1, goalDifference: -3, points: 1, form: ['Î', 'E'], badge: '/echipe/unirea-slobozia.png' },
  { position: 19, name: 'AFC Chindia Târgoviște', shortName: 'Chindia', played: 1, wins: 0, draws: 0, losses: 1, goalDifference: -1, points: 0, form: ['Î'], badge: '/echipe/chindia-targoviste.png' },
  { position: 20, name: 'Steaua București', shortName: 'Steaua', played: 2, wins: 0, draws: 0, losses: 2, goalDifference: -2, points: 0, form: ['Î', 'Î'], badge: '/echipe/steaua-bucuresti.png' },
  { position: 21, name: 'AFC ASA Târgu Mureș', shortName: 'ASA Târgu Mureș', played: 2, wins: 0, draws: 0, losses: 2, goalDifference: -3, points: 0, form: ['Î', 'Î'], badge: '/echipe/asa-targu-mures.png' },
  { position: 22, name: 'CS Dinamo București', shortName: 'CS Dinamo', played: 2, wins: 0, draws: 0, losses: 2, goalDifference: -5, points: 0, form: ['Î', 'Î'], badge: '/echipe/cs-dinamo-bucuresti.png' },
]

export type PlayerPosition = 'Portar' | 'Fundaș' | 'Mijlocaș' | 'Atacant'

export type Player = {
  number: number
  name: string
  position: PlayerPosition
}

export const squad: Player[] = [
  { number: 1, name: 'Alex Apetrei', position: 'Portar' },
  { number: 12, name: 'David Feșteu', position: 'Portar' },
  { number: 24, name: 'Eduard Ciobanu', position: 'Fundaș' },
  { number: 5, name: 'Robert David', position: 'Fundaș' },
  { number: 21, name: 'Cătălin Grosu', position: 'Fundaș' },
  { number: 6, name: 'Codrin Nica', position: 'Fundaș' },
  { number: 30, name: 'Șerban Nițu', position: 'Fundaș' },
  { number: 2, name: 'Juan Pătrașcu', position: 'Fundaș' },
  { number: 3, name: 'Ciprian Perju', position: 'Fundaș' },
  { number: 26, name: 'Ruben Sumanariu', position: 'Fundaș' },
  { number: 14, name: 'Mario Bai', position: 'Mijlocaș' },
  { number: 73, name: 'Cristian Balgiu', position: 'Mijlocaș' },
  { number: 17, name: 'Andrei Bugeac', position: 'Mijlocaș' },
  { number: 7, name: 'Andrei Cerlincă', position: 'Mijlocaș' },
  { number: 8, name: 'Ruslan Chelari', position: 'Mijlocaș' },
  { number: 98, name: 'Marius Codreanu', position: 'Mijlocaș' },
  { number: 47, name: 'Alexandru Anton', position: 'Mijlocaș' },
  { number: 22, name: 'Cristian Ghedrouțan', position: 'Mijlocaș' },
  { number: 10, name: 'Ilie Marian', position: 'Mijlocaș' },
  { number: 77, name: 'Iosif Netbai', position: 'Mijlocaș' },
  { number: 23, name: 'Ștefan Petraru', position: 'Mijlocaș' },
  { number: 20, name: 'Cosmin Tucaliuc', position: 'Mijlocaș' },
  { number: 11, name: 'Radu Ungurianu', position: 'Mijlocaș' },
  { number: 25, name: 'Răzvan Gorovei', position: 'Atacant' },
  { number: 29, name: 'Alexandru Savin', position: 'Atacant' },
  { number: 9, name: 'Alexandru Zaharia', position: 'Atacant' },
]

export const technicalStaff = [
  { name: 'Petre Grigoraș', role: 'Antrenor principal' },
  { name: 'Eduard Paul Luca', role: 'Antrenor secund' },
  { name: 'Ionuț Plămadă', role: 'Preparator fizic' },
  { name: 'Andrei Ițco', role: 'Delegat' },
  { name: 'Maria Vaidner', role: 'Kinetoterapeut' },
  { name: 'Adrian Negru', role: 'Ofițer de presă' },
]

export const dataSources = [
  { label: 'Site-ul oficial al clubului · program', url: 'https://cetateasuceava.com/program/' },
  { label: 'Site-ul oficial al clubului · clasament', url: 'https://cetateasuceava.com/clasament/' },
  { label: 'Site-ul oficial al clubului · lot', url: 'https://cetateasuceava.com/categorie-de-jucatori/fotbalisti/' },
  { label: 'Federația Română de Fotbal · Liga a II-a 2026/2027', url: 'https://www.frf.ro/competitii/competitii-masculin/liga-2-casa-pariurilor/miercuri-22-iulie-tragerea-la-sorti-pentru-stabilirea-programului-sezonului-2026-2027-din-liga-2-casa-pariurilor/' },
] as const
