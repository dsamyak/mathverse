# MathVerse

A visually immersive 3D mathematics learning platform built with React, Three.js (React Three Fiber), and GSAP.

## Overview

MathVerse turns mathematics into a cinematic universe. Students navigate grade-level "realms" — each a distinct 3D world — and master skills through interactive simulations and gamified progression.

## Tech Stack

- **React 18** + **React Router v6** — SPA routing
- **Three.js / React Three Fiber v8** — All 3D rendering
- **@react-three/drei** — Three.js helpers (Text, Stars, Sparkles, Environment, etc.)
- **@react-three/postprocessing** — Bloom, Vignette post-processing effects
- **GSAP** — Complex timeline animations and scene transitions
- **Framer Motion** — UI entrance/exit animations, magnetic button effects
- **Zustand** — Global state (player progress, world navigation, settings)
- **TanStack Query** — Data fetching layer (mock backend)
- **Tailwind CSS** — Utility styling with cosmic color palette
- **Vite** — Dev server and bundler (port 5000)

## How to Run

```bash
npm run dev   # starts dev server on port 5000
npm run build # production build
```

## Project Structure

```
src/
├── components/
│   ├── three/          # Reusable 3D components (MathCore, ParticleGalaxy, etc.)
│   ├── effects/        # Post-processing pipeline (Bloom, Vignette)
│   └── ui/             # UI components (MagneticButton, etc.)
├── hooks/              # useMouseParallax, etc.
├── scenes/             # Page-level scenes (Title, Hub, Realm, Dashboard)
├── r3f/                # Raw R3F components (Avatar, CameraRig, Islands)
├── ui/                 # HUD, SkillNodePanel, Dashboard, Settings
├── store/              # Zustand stores (playerStore, worldStore)
├── api/                # TanStack Query hooks + mock data
└── index.css           # Global styles + Tailwind + design tokens
```

## Routes

| Path | Scene | Description |
|------|-------|-------------|
| `/` | TitleScene | Cinematic landing with Math Core 3D centerpiece |
| `/hub` | HubScene | World map — floating realm islands in space |
| `/realm/:id` | RealmScene | Grade-specific 3D exploration world |
| `/dashboard` | Dashboard | Student progress overview |
| `/fallback` | TextFallbackScene | Accessible 2D mode |

## Design System

- **Colors**: Cosmic deep-blue (#040714), neon cyan (#38bdf8), electric purple (#a855f7), crystal (#22d3ee)
- **Typography**: Outfit (headings) + Inter (body)
- **Glass morphism**: `.glass`, `.glass-light`, `.glass-dark` utility classes
- **Gradients**: `.text-gradient-ocean`, `.text-gradient-gold`, `.text-gradient-mystic`
- **Glow borders**: `.border-glow-ocean`, `.border-glow-mystic`, `.border-glow-gold`

## State

- **playerStore**: `studentName`, `grade`, `xpTotal`, `badges`, `streakDays`, `unlockedRealms`
- **worldStore**: `currentRealmId`, `cameraMode`, `uiMode`, `progress`, `reducedMotion`, `qualityLevel`

## User Preferences

- Keep the existing dark futuristic aesthetic — no light mode
- Maintain the existing store/API structure; do not migrate to a different state solution
- Post-processing is optional per quality level (high/medium/low in worldStore)
