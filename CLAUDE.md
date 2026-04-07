# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tomfolio is a static portfolio site for Tom Bariteau-Peter, a UX/UI designer and web developer. Built with Next.js 14 App Router and the "Void & Gold" design system. No backend — contact form uses Formspree.

### Key Features

- Responsive single-page portfolio with scroll-based sections
- "Void & Gold" design system: dark theme with gold (#D4AF37) accents
- Three.js gear scene in the hero section
- Interactive playground with 11 mini-apps
- Contact form via Formspree

## Tech Stack

- Next.js 14 (App Router) with TypeScript
- Tailwind CSS with custom Void & Gold design tokens
- Framer Motion for animations
- Three.js for 3D scenes
- Formspree for contact form

## Directory Structure

```
Tomfolio/
├── src/
│   ├── app/               # App Router pages & layouts
│   │   ├── (public)/      # Main portfolio page
│   │   ├── love-timer/    # Standalone love timer page
│   │   └── playground/    # Mini-apps (11 interactive tools)
│   ├── components/
│   │   ├── ui/            # Shared UI (Button, Input, VoidPanel, ThemeToggle, etc.)
│   │   ├── layout/        # Layout shells (HUDFrame, StatusBar, Footer)
│   │   ├── sections/      # Homepage sections (Hero, About, Skills, Services, Projects, Contact, Playground)
│   │   └── three/         # Three.js scenes (GearScene)
│   ├── context/           # React contexts (ThemeContext)
│   ├── lib/               # Utilities (cn)
│   ├── hooks/             # Custom React hooks
│   └── types/             # TypeScript interfaces
├── public/                # Static assets
├── package.json
├── tailwind.config.ts
└── next.config.mjs
```

## Build Commands

- `npm run dev` — Start dev server (port 3000)
- `npm run build` — Production build
- `npm run start` — Start production server
- `npm run lint` — Run ESLint

## Code Style Guidelines

- Use TypeScript for type safety
- Component files use `.tsx` extension; utilities use `.ts`
- Use the `cn()` utility for Tailwind class merging
- Follow React functional component pattern with named exports
- Use the Void & Gold design system classes:
  - Colors: `bg-void-deep`, `bg-void`, `text-gold`, `text-text-primary`, `text-text-secondary`
  - Typography: `text-display`, `font-display`
  - Components: `btn-gold`, `VoidPanel`
  - Layout: `HUDFrame`, `StatusBar`

## Animation Guidelines

- Use Framer Motion for scroll-triggered and layout animations
- Keep animations subtle and purposeful
- Use spring physics for natural movement
- Stagger animations for groups of elements
- Three.js scenes should be isolated in dedicated components under `components/three/`

## Page Structure (App Router)

- `(public)/page.tsx` — Main portfolio (Hero, About, Skills, Services, Projects, Playground, Contact)
- `playground/*` — 11 interactive mini-apps
- `love-timer/` — Standalone love timer
- `not-found.tsx` — Custom 404 page
