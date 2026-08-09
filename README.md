# Clubul suporterilor Cetatea Suceava

Aplicație într-un singur ecran pentru comunitatea alb-albastră. Interfața funcționează ca un comandament de zi de meci: fără derularea documentului, cu navigație diagonală inspirată din jocuri și tranziții animate între secțiuni.

## Tehnologii

- React 19, TypeScript și Vite
- Module CSS
- Motion pentru tranziții
- React Router pentru adrese fără reîncărcare
- Firebase Authentication, Firestore și Storage
- Web Audio API pentru sunetele interfeței
- Orbitron, Rajdhani și Space Grotesk, incluse local

## Secțiuni

- Următorul meci — numărătoare inversă, predicție, mod de meci și Zidul Cetății
- Centru de meci — scor, hartă tactică și flux de evenimente
- Zidul Cetății — vot pentru scandări și radarul comunității
- Garda Cetății — lotul oficial complet și filtrare după post
- Liga a II-a — clasamentul actual cu siglele celor 22 de echipe
- Carnet suporter — identitate digitală, reputație și misiuni

## Date sportive

Datele curente sunt centralizate în `src/data/clubData.ts`. Siglele sunt păstrate local în `public/echipe`, iar proveniența lor este documentată în `public/echipe/SURSA.md`.

Identitatea originală a aplicației și fundalul cinematic al ecranului de încărcare se află în `src/assets/brand`. Prompturile și rolul fiecărui activ sunt documentate în acel director.

## Pornire locală

```bash
npm install
npm run dev
```

Generarea versiunii de producție:

```bash
npm run build
```

## Configurare Firebase

1. Copiază `.env.example` în `.env.local`.
2. Completează valorile aplicației web din consola Firebase.
3. Pentru găzduire și reguli, autentifică utilitarul Firebase și rulează `firebase deploy`.

Până la completarea variabilelor, aplicația rulează normal în modul local.

## Structură

```text
src/
├── components/     ecran de încărcare și navigație
├── contexts/       temă și sunet
├── data/           datele clubului și ale campionatului
├── hooks/          logica numărătorii inverse
├── lib/            configurare Firebase
├── views/          cele șase secțiuni ale aplicației
├── App.tsx         structura generală și tranzițiile
└── index.css       teme și stiluri globale
```
