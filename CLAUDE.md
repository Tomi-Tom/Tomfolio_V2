# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Tomfolio is a fullstack monorepo portfolio for Tom Bariteau-Peter, a UX/UI designer and web developer. The frontend is a Next.js 14 App Router application with the "Void & Gold" design system, while the backend is an Express API with Prisma ORM and PostgreSQL.

### Key Features
- Responsive single-page portfolio with scroll-based sections
- "Void & Gold" design system: dark theme with gold (#D4AF37) accents
- Three.js gear scene in the hero section
- Admin dashboard for managing projects, skills, services, testimonials, and messages
- JWT authentication (access + refresh tokens) with Google OAuth
- Contact form with email notifications (Nodemailer / Mailpit for dev)
- Analytics: page view tracking and stats dashboard

## Tech Stack

### Frontend
- Next.js 14 (App Router) with TypeScript
- Tailwind CSS with custom Void & Gold design tokens
- Framer Motion for animations
- Three.js / React Three Fiber for 3D scenes

### Backend
- Express with TypeScript
- Prisma ORM with PostgreSQL 15
- JWT authentication (access + refresh tokens)
- Nodemailer for transactional email
- Zod for request validation

### Infrastructure
- Docker Compose for local PostgreSQL + Mailpit
- npm workspaces for monorepo management

## Directory Structure
```
Tomfolio/
├── frontend/                  # Next.js 14 App Router
│   └── src/
│       ├── app/               # App Router pages & layouts
│       │   ├── (public)/      # Public-facing portfolio page
│       │   ├── (auth)/        # Login & register pages
│       │   ├── admin/         # Admin dashboard (projects, skills, services, testimonials, messages)
│       │   └── dashboard/     # User dashboard
│       ├── components/
│       │   ├── ui/            # Shared UI (Button, Input, VoidPanel, ThemeToggle, etc.)
│       │   ├── layout/        # Layout shells (HUDFrame, StatusBar, ChapterBar, Footer)
│       │   ├── sections/      # Homepage sections (Hero, About, Skills, Services, Projects, Testimonials, Contact)
│       │   ├── three/         # Three.js scenes (GearScene)
│       │   └── admin/         # Admin components (Sidebar, DataTable, FormModal, StatCard, StatsChart)
│       ├── context/           # React contexts (AuthContext, ThemeContext)
│       ├── lib/               # API client, utilities
│       └── hooks/             # Custom React hooks
├── backend/                   # Express + Prisma API
│   ├── src/
│   │   ├── routes/            # Express route handlers
│   │   ├── services/          # Business logic (auth, contact, CRUD, stats)
│   │   ├── middleware/        # Auth, validation, rate limiting, admin guard
│   │   ├── lib/               # Prisma client
│   │   └── utils/             # Tokens, email, pagination, errors, IP
│   └── prisma/                # Schema & seed
├── docker-compose.dev.yml
├── .env.example
└── package.json               # Root with npm workspaces
```

## Build Commands
- `npm run dev` — Start both frontend (3000) and backend (4000)
- `npm run dev:front` — Start frontend only
- `npm run dev:back` — Start backend only
- `npm run db:up` — Start Docker services (PostgreSQL + Mailpit)
- `npm run db:down` — Stop Docker services
- `npm run db:migrate` — Run Prisma migrations
- `npm run db:seed` — Seed database with portfolio data
- `npm run db:studio` — Open Prisma Studio
- `npm run db:reset` — Reset database and re-seed

## Code Style Guidelines
- Use TypeScript for type safety across both workspaces
- Component files use `.tsx` extension; utilities use `.ts`
- Use the `cn()` utility for Tailwind class merging
- Follow React functional component pattern with named exports
- Use the Void & Gold design system classes:
  - Colors: `bg-void-deep`, `bg-void`, `text-gold`, `text-text-primary`, `text-text-secondary`
  - Typography: `text-display`, `font-display`
  - Components: `btn-gold`, `VoidPanel`
  - Layout: `HUDFrame`, `StatusBar`, `ChapterBar`
- Backend routes follow RESTful conventions with Zod validation
- Prisma models are the single source of truth for database schema

## Animation Guidelines
- Use Framer Motion for scroll-triggered and layout animations
- Keep animations subtle and purposeful
- Use spring physics for natural movement
- Stagger animations for groups of elements
- Three.js scenes should be isolated in dedicated components under `components/three/`

## Page Structure (App Router)
- `(public)/page.tsx` — Main portfolio (Hero, About, Skills, Services, Projects, Testimonials, Contact)
- `(auth)/login` and `(auth)/register` — Authentication pages
- `admin/` — Protected admin dashboard with sub-pages for projects, skills, services, testimonials, messages
- `dashboard/` — Authenticated user dashboard
- `not-found.tsx` — Custom 404 page
