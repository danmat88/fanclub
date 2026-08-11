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
  id: string
  number: number | null
  name: string
  position: PlayerPosition
  role: string
  age: number
  birthDate: string
  height?: string
  foot?: 'Dreptul' | 'Stângul' | 'Ambele'
  joined: string
  marketValue?: string
  image?: string
  captain?: boolean
  appearances?: number
  starts?: number
  documentedMinutes?: number
  goals?: number
  assists?: number
  yellowCards?: number
}

export const squad: Player[] = [
  { id: 'alexandru-dohotariu', number: 75, name: 'Alexandru Dohotariu', position: 'Portar', role: 'Portar', age: 24, birthDate: '13 iunie 2002', joined: '1 iulie 2026' },
  { id: 'mihai-afrim', number: null, name: 'Mihai Afrim', position: 'Portar', role: 'Portar', age: 22, birthDate: '1 ianuarie 2004', joined: '1 iulie 2024' },
  { id: 'alexandru-micu', number: 1, name: 'Alexandru Micu', position: 'Portar', role: 'Portar', age: 19, birthDate: '3 iulie 2007', joined: '1 iulie 2026' },
  { id: 'alin-ciobanu', number: 13, name: 'Alin Ciobanu', position: 'Portar', role: 'Portar', age: 18, birthDate: '16 februarie 2008', joined: '1 iulie 2026', appearances: 1, starts: 1, documentedMinutes: 90 },

  { id: 'ricardo-farcas', number: 16, name: 'Ricardo Farcaș', position: 'Fundaș', role: 'Fundaș central', age: 26, birthDate: '24 iunie 2000', height: '1,83 m', foot: 'Stângul', joined: '17 iulie 2026', marketValue: '200 mii €', appearances: 1, starts: 1, documentedMinutes: 45 },
  { id: 'vladut-cimbru', number: 3, name: 'Vlăduț Cimbru', position: 'Fundaș', role: 'Fundaș central', age: 23, birthDate: '6 decembrie 2002', joined: '1 iulie 2026', marketValue: '175 mii €', appearances: 1, starts: 1, documentedMinutes: 90 },
  { id: 'stejarel-visinar', number: 4, name: 'Stejărel Vișinar', position: 'Fundaș', role: 'Fundaș central', age: 27, birthDate: '4 martie 1999', height: '1,91 m', foot: 'Dreptul', joined: '1 iulie 2026', marketValue: '150 mii €', appearances: 1, documentedMinutes: 12 },
  { id: 'alin-burdet', number: 29, name: 'Alin Burdeț', position: 'Fundaș', role: 'Fundaș central', age: 28, birthDate: '7 aprilie 1998', height: '1,84 m', foot: 'Dreptul', joined: '1 iulie 2026', marketValue: '150 mii €' },
  { id: 'matei-manolache', number: 6, name: 'Matei Manolache', position: 'Fundaș', role: 'Fundaș central', age: 19, birthDate: '1 ianuarie 2007', height: '1,87 m', foot: 'Stângul', joined: '1 iulie 2026', marketValue: '50 mii €' },
  { id: 'ruslan-chelari', number: 8, name: 'Ruslan Chelari', position: 'Fundaș', role: 'Fundaș central', age: 27, birthDate: '27 februarie 1999', height: '1,81 m', foot: 'Stângul', joined: '13 ianuarie 2025', image: '/jucatori/8-ruslan-chelari.png' },
  { id: 'ciprian-perju', number: 23, name: 'Ciprian Perju', position: 'Fundaș', role: 'Fundaș stânga', age: 30, birthDate: '18 martie 1996', height: '1,76 m', foot: 'Stângul', joined: '17 iulie 2025', image: '/jucatori/3-ciprian-perju.png', appearances: 1, starts: 1, documentedMinutes: 90 },
  { id: 'eduard-ciobanu', number: null, name: 'Eduard Ciobanu', position: 'Fundaș', role: 'Fundaș dreapta', age: 24, birthDate: '11 aprilie 2002', joined: '4 iulie 2025', image: '/jucatori/24-eduard-ciobanu.png' },
  { id: 'andrei-mihai', number: 77, name: 'Andrei Mihai', position: 'Fundaș', role: 'Fundaș dreapta', age: 24, birthDate: '7 decembrie 2001', joined: '1 iulie 2026', appearances: 1, documentedMinutes: 29 },

  { id: 'mihai-nistor', number: null, name: 'Mihai Nistor', position: 'Mijlocaș', role: 'Mijlocaș defensiv', age: 23, birthDate: '9 martie 2003', joined: '8 iulie 2024' },
  { id: 'mario-bai', number: 14, name: 'Mario Bai', position: 'Mijlocaș', role: 'Mijlocaș central', age: 19, birthDate: '21 decembrie 2006', joined: '1 iulie 2024', image: '/jucatori/14-mario-bai.png', appearances: 2, documentedMinutes: 29, assists: 1 },
  { id: 'gabriel-david', number: 33, name: 'Gabriel David', position: 'Mijlocaș', role: 'Mijlocaș central', age: 23, birthDate: '11 februarie 2003', joined: '1 iulie 2026', marketValue: '250 mii €', appearances: 1, starts: 1, documentedMinutes: 78, goals: 1 },
  { id: 'ilie-marian', number: 10, name: 'Ilie Marian', position: 'Mijlocaș', role: 'Mijlocaș central', age: 22, birthDate: '22 august 2003', joined: '5 iulie 2024', image: '/jucatori/10-ilie-marian.png' },
  { id: 'lorand-fulop', number: 80, name: 'Lóránd Fülöp', position: 'Mijlocaș', role: 'Mijlocaș central', age: 29, birthDate: '24 iulie 1997', height: '1,80 m', foot: 'Ambele', joined: '1 iulie 2026', appearances: 1, documentedMinutes: 45 },
  { id: 'vlad-ilie', number: 21, name: 'Vlad Ilie', position: 'Mijlocaș', role: 'Mijlocaș central', age: 18, birthDate: '17 aprilie 2008', joined: '29 iulie 2026', appearances: 1, starts: 1, documentedMinutes: 61 },
  { id: 'andrei-cerlinca', number: 7, name: 'Andrei Cerlincă', position: 'Mijlocaș', role: 'Mijlocaș dreapta', age: 31, birthDate: '6 august 1995', height: '1,78 m', joined: '14 iulie 2024', image: '/jucatori/7-andrei-cerlinca.png', captain: true, appearances: 1, starts: 1, documentedMinutes: 61 },
  { id: 'george-danaila', number: null, name: 'George Dănăilă', position: 'Mijlocaș', role: 'Mijlocaș ofensiv', age: 27, birthDate: '6 octombrie 1998', joined: '11 ianuarie 2026' },
  { id: 'cosmin-tucaliuc', number: 20, name: 'Cosmin Tucaliuc', position: 'Mijlocaș', role: 'Mijlocaș ofensiv', age: 26, birthDate: '13 mai 2000', height: '1,74 m', foot: 'Dreptul', joined: '9 iulie 2025', image: '/jucatori/20-cosmin-tucaliuc.png' },
  { id: 'ruben-sumanariu', number: 99, name: 'Ruben Sumanariu', position: 'Mijlocaș', role: 'Mijlocaș ofensiv', age: 27, birthDate: '26 mai 1999', height: '1,86 m', foot: 'Ambele', joined: '20 ianuarie 2025', image: '/jucatori/26-ruben-sumanariu.png' },

  { id: 'alexandru-aftanache', number: 11, name: 'Alexandru Aftanache', position: 'Atacant', role: 'Extremă stânga', age: 24, birthDate: '4 octombrie 2001', joined: '1 iulie 2026', marketValue: '150 mii €', appearances: 2, documentedMinutes: 29 },
  { id: 'stephane-ferhaoui', number: 94, name: 'Stéphane Ferhaoui', position: 'Atacant', role: 'Extremă stânga', age: 29, birthDate: '15 noiembrie 1996', height: '1,80 m', foot: 'Stângul', joined: '9 ianuarie 2026', appearances: 2, starts: 1, documentedMinutes: 90, assists: 1 },
  { id: 'catalin-golofca', number: 27, name: 'Cătălin Golofca', position: 'Atacant', role: 'Extremă dreapta', age: 36, birthDate: '21 aprilie 1990', height: '1,69 m', foot: 'Dreptul', joined: '1 iulie 2026', appearances: 1, starts: 1, documentedMinutes: 90, yellowCards: 1 },
  { id: 'denis-bujor', number: 30, name: 'Denis Bujor', position: 'Atacant', role: 'Extremă dreapta', age: 21, birthDate: '26 septembrie 2004', height: '1,67 m', foot: 'Stângul', joined: '1 iulie 2026', appearances: 1, starts: 1, documentedMinutes: 61 },
  { id: 'aleksandru-longher', number: 70, name: 'Aleksandru Longher', position: 'Atacant', role: 'Extremă dreapta', age: 26, birthDate: '8 iunie 2000', height: '1,77 m', foot: 'Dreptul', joined: '8 iulie 2026' },
  { id: 'gabriel-raducan', number: 15, name: 'Gabriel Răducan', position: 'Atacant', role: 'Atacant central', age: 25, birthDate: '7 noiembrie 2000', height: '1,76 m', foot: 'Dreptul', joined: '10 ianuarie 2026', appearances: 2, starts: 1, documentedMinutes: 90, goals: 2 },
  { id: 'mahadi-kayondo', number: 17, name: 'Mahadi Kayondo', position: 'Atacant', role: 'Atacant central', age: 29, birthDate: '3 ianuarie 1997', height: '1,80 m', joined: '1 iulie 2026' },
  { id: 'bogdan-grosu', number: 18, name: 'Bogdan Grosu', position: 'Atacant', role: 'Atacant central', age: 20, birthDate: '1 mai 2006', joined: '28 iulie 2026' },
]

export const technicalStaff = [
  { name: 'Petre Grigoraș', role: 'Antrenor principal', image: '/staff/petre-grigoras.jpg' },
  { name: 'Eduard Paul Luca', role: 'Antrenor secund', image: '/staff/eduard-paul-luca.png' },
  { name: 'Ionuț Plămadă', role: 'Preparator fizic', image: '/staff/ionut-plamada.png' },
  { name: 'Andrei Ițco', role: 'Delegat', image: '/staff/andrei-itco.png' },
  { name: 'Maria Vaidner', role: 'Kinetoterapeut', image: '/staff/maria-vaidner.png' },
  { name: 'Adrian Negru', role: 'Ofițer de presă' },
]

export const dataSources = [
  { label: 'Site-ul oficial al clubului · program', url: 'https://cetateasuceava.com/program/' },
  { label: 'Site-ul oficial al clubului · clasament', url: 'https://cetateasuceava.com/clasament/' },
  { label: 'Site-ul oficial al clubului · lot', url: 'https://cetateasuceava.com/categorie-de-jucatori/fotbalisti/' },
  { label: 'Federația Română de Fotbal · Liga a II-a 2026/2027', url: 'https://www.frf.ro/competitii/competitii-masculin/liga-2-casa-pariurilor/miercuri-22-iulie-tragerea-la-sorti-pentru-stabilirea-programului-sezonului-2026-2027-din-liga-2-casa-pariurilor/' },
] as const
