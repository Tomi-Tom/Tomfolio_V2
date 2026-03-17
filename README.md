# Tomfolio

Professional fullstack portfolio for Tom Bariteau-Peter — UX/UI Designer & Web Developer.

## Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Three.js
- **Backend**: Express, TypeScript, Prisma ORM
- **Database**: PostgreSQL 15
- **Auth**: JWT (access + refresh tokens), Google OAuth
- **Email**: Nodemailer (Mailpit for dev)

## Prerequisites

- Node.js 20+
- Docker & Docker Compose

## Getting Started

```bash
cp .env.example .env           # Configure environment variables
npm run db:up                   # Start PostgreSQL + Mailpit
npm install                     # Install all dependencies
npm run db:migrate              # Create database tables
npm run db:seed                 # Seed with portfolio data
npm run dev                     # Start frontend (3000) + backend (4000)
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start both frontend and backend |
| `npm run dev:front` | Start frontend only (port 3000) |
| `npm run dev:back` | Start backend only (port 4000) |
| `npm run db:up` | Start Docker services (PostgreSQL + Mailpit) |
| `npm run db:down` | Stop Docker services |
| `npm run db:migrate` | Run Prisma migrations |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |
| `npm run db:reset` | Reset database + re-seed |

## Project Structure

```
Tomfolio/
├── frontend/          # Next.js 14 App Router
├── backend/           # Express + Prisma API
├── docker-compose.dev.yml
├── .env.example
└── package.json       # Root with npm workspaces
```

## Services (dev)

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000
- Mailpit (email): http://localhost:8025
- Prisma Studio: `npm run db:studio`
