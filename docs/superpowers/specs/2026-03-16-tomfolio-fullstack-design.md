# Tomfolio Fullstack Portfolio — Design Specification

**Date:** 2026-03-16
**Author:** Tom Bariteau-Peter + Claude
**Status:** Approved

---

## 1. Overview

Tomfolio is a professional fullstack portfolio for Tom Bariteau-Peter (UX/UI Designer & Web Developer). It replaces the existing `tomfolio-frontend/` React SPA with a monorepo containing a Next.js frontend, Express backend, and PostgreSQL database.

The existing `tomfolio-frontend/` serves as the visual reference — its "Void & Gold" design system (dark cyberpunk aesthetic, gold accents, Space Grotesk + DM Sans typography, Three.js wireframe gears) is preserved and enhanced with dark/light mode support.

### Goals

- Professional portfolio with SSR for SEO
- Admin panel to manage all content (projects, skills, services, testimonials, messages)
- User authentication with profile and extensible data storage
- 3D animated background (wireframe gears) progressing with scroll
- Production-ready fullstack architecture

### Non-Goals (V1)

- Mini-apps migration (deferred to V2)
- Mobile app
- Blog section
- i18n

---

## 2. Architecture

### Monorepo Structure

```
Tomfolio/
├── tomfolio-frontend/           # Existing front (visual reference only)
├── frontend/                    # Next.js 14 App Router + TypeScript + Tailwind
│   ├── src/
│   │   ├── app/                 # App Router pages & layouts
│   │   │   ├── (public)/        # Route group: public pages (SSR)
│   │   │   ├── (auth)/          # Route group: /login, /register
│   │   │   ├── admin/           # Admin pages (protected)
│   │   │   ├── dashboard/       # User space (protected)
│   │   │   └── api/auth/        # Auth helper routes (token refresh proxy)
│   │   ├── components/
│   │   │   ├── layout/          # StatusBar, ChapterBar, HUDFrame, Footer
│   │   │   ├── sections/        # Hero, About, Skills, Services, Projects, Testimonials, Contact
│   │   │   ├── three/           # GearScene, 3D components
│   │   │   ├── ui/              # Button, Card, Input, LevelDots, ThemeToggle
│   │   │   └── admin/           # Admin-specific components (tables, forms, stats)
│   │   ├── lib/                 # API client (Axios), utils, cn(), constants
│   │   ├── hooks/               # useScrollProgress, useTheme, useAuth, etc.
│   │   ├── context/             # ThemeContext, AuthContext
│   │   ├── styles/              # Design tokens CSS, variables, animations
│   │   └── types/               # Shared TypeScript types
│   ├── public/                  # Static assets (images, fonts, favicon)
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── package.json
│
├── backend/                     # Express + TypeScript + Prisma
│   ├── src/
│   │   ├── routes/              # auth, contact, projects, skills, services, testimonials, stats, users, tags
│   │   ├── middleware/          # auth (JWT), admin, rateLimiter, validation
│   │   ├── services/            # Business logic per domain
│   │   ├── utils/               # Helpers (email, tokens)
│   │   └── index.ts             # Express entry point
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── migrations/
│   │   └── seed.ts              # Real data from tomfolio-frontend
│   ├── tsconfig.json
│   └── package.json
│
├── docker-compose.dev.yml       # PostgreSQL + Mailpit
├── .env.example
├── package.json                 # Root scripts (concurrently)
└── README.md
```

### Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, Three.js |
| Backend | Node.js, Express, TypeScript |
| ORM | Prisma |
| Database | PostgreSQL 15 (Docker) |
| Auth (backend) | JWT (access + refresh), bcrypt, Passport.js (Google OAuth) |
| Email | Nodemailer → Mailpit (dev), real SMTP (prod) |
| Validation | Zod (both frontend and backend) |
| Dev infra | Docker Compose (PostgreSQL + Mailpit only) |

### Monorepo Install Strategy

The root `package.json` uses npm workspaces:

```json
{
  "workspaces": ["frontend", "backend"]
}
```

`npm install` at the root installs dependencies for both `frontend/` and `backend/`. `concurrently` is a root devDependency.

### Communication

- Frontend Server Components → Backend: `fetch()` with Next.js cache directives (`next: { revalidate: 60 }`) for SSR/ISR
- Frontend Client Components → Backend: Axios for auth flows, mutations, and interactive data
- Auth: JWT access token in memory (frontend), refresh token in httpOnly cookie
- CORS: configured via `CORS_ORIGIN` env variable — `localhost:3000` in dev, production domain in prod

---

## 3. Data Model (Prisma)

```prisma
model User {
  id            String    @id @default(uuid())
  email         String    @unique
  password      String?                        // null if Google OAuth
  firstName     String
  lastName      String
  phone         String?
  role          Role      @default(USER)
  provider      String?                        // "google" | null
  avatarUrl     String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  messages      Message[]
  userData      UserData[]
  refreshTokens RefreshToken[]
}

enum Role {
  USER
  ADMIN
}

model Message {
  id        String   @id @default(uuid())
  firstName String
  lastName  String
  email     String
  phone     String?
  content   String
  isRead    Boolean  @default(false)
  userId    String?
  user      User?    @relation(fields: [userId], references: [id])
  createdAt DateTime @default(now())
}

model Project {
  id              String   @id @default(uuid())
  title           String
  description     String
  longDescription String?
  imageUrl        String?
  liveUrl         String?
  githubUrl       String?
  tags            Tag[]
  featured        Boolean  @default(false)
  sortOrder       Int      @default(0)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}

model Skill {
  id        String        @id @default(uuid())
  name      String
  level     Int           // 1-4 (matches existing level-dots system)
  icon      String?
  category  SkillCategory
  status    SkillStatus   @default(PROFICIENT)
  sortOrder Int           @default(0)
}

enum SkillStatus {
  PROFICIENT
  EXPLORING
}

enum SkillCategory {
  FRONTEND
  BACKEND
  DEVOPS
  DESIGN
  OTHER
}

model Tag {
  id       String    @id @default(uuid())
  name     String    @unique
  projects Project[]
}

model Service {
  id          String @id @default(uuid())
  title       String
  description String
  icon        String?
  sortOrder   Int    @default(0)
}

model Testimonial {
  id        String   @id @default(uuid())
  name      String
  role      String
  company   String?
  content   String
  avatarUrl String?
  sortOrder Int      @default(0)
}

model RefreshToken {
  id        String   @id @default(uuid())
  token     String   @unique                    // hashed refresh token
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expiresAt DateTime
  revoked   Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([userId])
}

model UserData {
  id        String   @id @default(uuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  key       String                             // e.g. "miniapp.memory.progress"
  value     Json                               // flexible storage
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@unique([userId, key])
}

model PageView {
  id        String   @id @default(uuid())
  path      String
  referrer  String?
  userAgent String?
  ip        String?                            // anonymized: last octet zeroed
  createdAt DateTime @default(now())

  @@index([path, createdAt])
}
// Note: PageView IPs are anonymized (last octet set to 0) before storage.
// PageView records older than 90 days are auto-deleted via a scheduled cleanup.
```

---

## 4. API Routes

### Auth

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | /api/auth/register | Public | Register with email/password |
| POST | /api/auth/login | Public | Login → access + refresh tokens |
| POST | /api/auth/logout | Auth | Invalidate refresh token |
| POST | /api/auth/refresh | Public | Renew access token via httpOnly cookie |
| GET | /api/auth/google | Public | Redirect to Google OAuth |
| GET | /api/auth/google/callback | Public | Google callback → JWT |
| GET | /api/auth/me | Auth | Get current user profile |

### Users

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| PATCH | /api/users/me | Auth | Update own profile |
| GET | /api/users/me/data | Auth | List own UserData entries |
| PUT | /api/users/me/data/:key | Auth | Upsert a UserData key |
| DELETE | /api/users/me/data/:key | Auth | Delete a UserData key |

### Contact

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| POST | /api/contact | Public | Send a message (rate limited) |
| GET | /api/contact | Admin | List messages (paginated, filterable) |
| PATCH | /api/contact/:id/read | Admin | Toggle read/unread |
| DELETE | /api/contact/:id | Admin | Delete a message |

### Portfolio Content (CRUD)

Projects, Skills, Services, Testimonials, Tags all follow the same pattern:

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | /api/{resource} | Public | List all (sorted by sortOrder) |
| POST | /api/{resource} | Admin | Create |
| PATCH | /api/{resource}/:id | Admin | Update |
| DELETE | /api/{resource}/:id | Admin | Delete |

Tags have no PATCH (immutable name, just create/delete).

### Stats

| Method | Route | Access | Description |
|--------|-------|--------|-------------|
| GET | /api/stats/overview | Admin | KPIs: unread messages, total messages (month), views (month), registered users |
| GET | /api/stats/views | Admin | Page views by period (query: ?days=30) |
| GET | /api/stats/messages | Admin | Messages by period (query: ?days=30) |

### Middleware Stack

- `rateLimiter` — auth routes: 10 req/min, contact: 5 req/min, general: 100 req/min
- `authenticate` — decodes JWT, attaches `req.user`
- `requireAdmin` — checks `role === ADMIN`
- `validate(zodSchema)` — validates request body/params
- `trackPageView` — logs page views on public GET routes

### Token Strategy

- Access token: JWT, 15 min TTL, returned in response body
- Refresh token: JWT, 7 days TTL, httpOnly secure cookie, stored hashed in `RefreshToken` table
- On logout: refresh token is revoked in DB (set `revoked: true`)
- On refresh: old token is revoked, new token issued and stored
- Frontend: Axios interceptor auto-refreshes on 401

### API Error Response Contract

All error responses follow a consistent shape:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable error message",
    "details": []
  }
}
```

**HTTP status codes used:**
- `400` — Bad request / validation error
- `401` — Not authenticated
- `403` — Forbidden (insufficient role)
- `404` — Resource not found
- `409` — Conflict (e.g., email already registered)
- `422` — Unprocessable entity (Zod validation failures — `details` contains field-level errors)
- `429` — Rate limited
- `500` — Internal server error

**Zod validation errors** are serialized in `details` as:
```json
[{ "field": "email", "message": "Invalid email address" }]
```

### Pagination Contract

All list endpoints support offset-based pagination:

**Query parameters:** `?page=1&limit=20`
- `page` defaults to 1
- `limit` defaults to 20, max 100

**Response envelope:**
```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 142,
    "totalPages": 8
  }
}
```

Public content endpoints (projects, skills, services, testimonials) return all items without pagination by default (small datasets). Pagination is available via query params if needed.

### Image Upload Strategy

V1 uses **external URLs only**. Admin forms accept a URL string for `imageUrl` and `avatarUrl` fields. No file upload endpoint.

Images are hosted externally (Unsplash for placeholders, self-hosted or CDN for production). A file upload endpoint with cloud storage (S3/Cloudinary) is deferred to V2.

---

## 5. Frontend Pages

### Public Pages

| Route | Component | Rendering | Description |
|-------|-----------|-----------|-------------|
| / | HomePage | ISR (60s) | All sections: Hero, About, Skills, Services, Projects, Testimonials, Contact, Footer |
| /login | LoginPage | CSR | Email/password + Google OAuth button |
| /register | RegisterPage | CSR | Registration form |

### Protected Pages

| Route | Component | Access | Description |
|-------|-----------|--------|-------------|
| /dashboard | DashboardPage | Auth | User profile, UserData overview |
| /admin | AdminDashboard | Admin | Stats overview, recent unread messages |
| /admin/messages | AdminMessages | Admin | Messages table with filters, pagination |
| /admin/projects | AdminProjects | Admin | CRUD projects table + form modal |
| /admin/skills | AdminSkills | Admin | CRUD skills table + form modal |
| /admin/services | AdminServices | Admin | CRUD services table + form modal |
| /admin/testimonials | AdminTestimonials | Admin | CRUD testimonials table + form modal |

### Route Protection

- Next.js `middleware.ts`: redirects unauthenticated users from `/dashboard/*` and `/admin/*` to `/login`
- Client-side `ProtectedRoute` component verifies role for admin pages
- Backend middleware enforces auth/admin on API routes

---

## 6. Frontend Components

### Layout Components

- **StatusBar** — Fixed top bar (36px). Logo "TBP.DEV", gold pulse indicator, dark/light toggle. Background opacity increases on scroll.
- **ChapterBar** — Fixed bottom bar (40px). Section navigation buttons, active section highlighted with gold. Scroll-to on click.
- **HUDFrame** — 4 fixed gold corner brackets (22px) positioned at viewport corners.
- **Footer** — Social links (GitHub, LinkedIn), email, copyright, final CTA.

### Section Components (Homepage)

- **Hero** — Display text "Tom Bariteau. Peter", tagline, subtitle, 2 CTAs (Contact + View Work), stats (50+ Projects, 5yr Experience, FR·EN). GearScene renders behind.
- **About** — Photo (grayscale with gold border), 2 paragraphs, stats row (Education, Experience, Languages, Location).
- **Skills** — Grid by category (Frontend, Design, Backend & Tools), each skill with LevelDots (1-4). "Currently Exploring" subsection. Data from API.
- **Services** — 3-4 cards with icon, title, description, CTA. Data from API.
- **Projects** — Filterable grid by tags. ProjectCard: image, title, description, tags, links. Data from API.
- **Testimonials** — Grid or carousel. Name, role, company, quote. Data from API.
- **Contact** — Form: firstName, lastName, email, phone, message. Pre-filled if authenticated. Zod validation. Success/error states.

### Three.js Components

- **GearScene** — Wireframe gold gears (`0xd4af37`), position fixed behind content (z-index -1).
- Gear rotation tied to `useScrollProgress` hook: `scrollY / documentHeight`.
- Lazy loaded via `next/dynamic` with `ssr: false`.
- Performance: `devicePixelRatio` capped at 2, simplified geometry on mobile, paused when tab not visible.
- GPU detection: fallback to static background on weak GPUs.

### UI Components

- **Button** — Variants: `gold` (filled), `ghost-gold` (transparent), `outline`. Space Grotesk, uppercase, 0.18em letter-spacing.
- **VoidPanel / Card** — Background void-surface, border gold subtle (0.12 opacity), hover: lift -4px + border brightens.
- **Input** — Transparent, border-bottom only, focus state gold.
- **LevelDots** — 4 circles (8px), filled up to skill level.
- **ThemeToggle** — Dark/light switch with smooth animation.

### Admin Components

- **AdminSidebar** — Left navigation: Dashboard, Messages, Projects, Skills, Services, Testimonials.
- **DataTable** — Reusable table component with sorting, pagination.
- **FormModal** — Modal for create/edit operations with Zod-validated forms.
- **StatCard** — KPI display card with value, label, trend.
- **StatsChart** — Simple bar/line chart for views and messages over time.

---

## 7. Design System

### Color Tokens (CSS Variables)

**Dark Theme (default):**

| Token | Value | Usage |
|-------|-------|-------|
| --void | #000000 | Base black |
| --void-deep | #030303 | Page background |
| --void-surface | #080808 | Cards, panels |
| --void-elevated | #0d0d0d | Modals, dropdowns |
| --gold | #d4af37 | Primary accent |
| --gold-dim | rgba(212,175,55,0.55) | Muted gold |
| --gold-ghost | rgba(212,175,55,0.08) | Subtle gold tint |
| --text-primary | #ffffff | Main text |
| --text-secondary | rgba(232,228,217,0.7) | Body text |
| --text-dim | rgba(232,228,217,0.35) | Captions |
| --border | rgba(212,175,55,0.12) | Default borders |
| --border-active | rgba(212,175,55,0.35) | Hover/active borders |

**Light Theme:**

| Token | Value | Usage |
|-------|-------|-------|
| --void | #ffffff | Base white |
| --void-deep | #f5f3ef | Page background (warm white) |
| --void-surface | #ffffff | Cards, panels |
| --void-elevated | #fafaf8 | Modals, dropdowns |
| --gold | #b8960c | Primary accent (darker for contrast) |
| --gold-dim | rgba(184,150,12,0.55) | Muted gold |
| --gold-ghost | rgba(184,150,12,0.06) | Subtle gold tint |
| --text-primary | #1a1a1a | Main text |
| --text-secondary | rgba(30,30,30,0.7) | Body text |
| --text-dim | rgba(30,30,30,0.4) | Captions |
| --border | rgba(184,150,12,0.15) | Default borders |
| --border-active | rgba(184,150,12,0.4) | Hover/active borders |

Theme applied via `data-theme` attribute on `<html>`. Persisted in localStorage, respects `prefers-color-scheme`.

### Typography

| Role | Font | Weight | Size | Extra |
|------|------|--------|------|-------|
| Display (hero) | Space Grotesk | 700 | clamp(3.5rem, 8vw, 7rem) | -0.04em, line-height 0.92 |
| H1 | Space Grotesk | 700 | clamp(2.8rem, 5vw, 5rem) | -0.03em |
| H2 | Space Grotesk | 700 | clamp(2rem, 3.5vw, 3.5rem) | -0.03em |
| H3 | Space Grotesk | 600 | clamp(1.3rem, 2vw, 1.8rem) | -0.02em, line-height 1.2 |
| Body | DM Sans | 300 | 0.95rem | line-height 1.7, 0.02em |
| Section label | Space Grotesk | 600 | 0.65rem | uppercase, 0.2em spacing, gold-dim |
| HUD caption | Space Grotesk | 500 | 0.6rem | uppercase, 0.12em spacing |
| Button | Space Grotesk | 600 | 0.7rem | uppercase, 0.18em spacing |

### CSS Component Classes

- `.void-panel` — bg: void-surface, border: 1px solid border, hover: border-active, radius: 2px
- `.btn-gold` — bg: gold, text: black, hover: glow + scale(1.02)
- `.btn-ghost-gold` — transparent, text: gold-dim, hover: text white
- `.input-void` — transparent, border-bottom only, focus: gold
- `.section-label` — micro uppercase gold label
- `.hud-caption` — micro uppercase HUD text
- `.gold-pulse` — animation: opacity 1→0.3, 2s ease-in-out infinite

### Animation Constants (Framer Motion)

```typescript
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1, y: 0,
    transition: { duration: 0.6, delay: 0.3 + i * 0.1, ease: [0.65, 0, 0.35, 1] }
  })
}

const cardHover = { y: -4, borderColor: 'rgba(212,175,55,0.35)' }

const accordion = {
  collapsed: { height: 0, opacity: 0 },
  expanded: { height: 'auto', opacity: 1, transition: { duration: 0.3, ease: [0.65, 0, 0.35, 1] } }
}
```

### Scroll Behavior

- Scroll vertical with `scroll-snap-type: y proximity` (soft snap)
- Each section triggers entrance animation via `useInView` (Framer Motion)
- Stagger pattern: 300ms base + 100ms per element
- GearScene: rotation = `scrollY / documentHeight`
- StatusBar: background opacity increases on scroll
- ChapterBar: active indicator follows visible section (Intersection Observer)

---

## 8. Authentication & Security

### Auth Architecture

**Single auth system: Express backend is the sole auth authority.** No NextAuth.js. The Express backend issues JWTs, manages refresh tokens in the database, and handles Google OAuth via Passport.js. The Next.js frontend is a pure consumer — it stores the access token in memory and the refresh token in an httpOnly cookie set by the backend.

The Next.js `middleware.ts` checks for the presence of a refresh token cookie to gate access to protected routes. Actual token validation always happens on the backend.

### Registration Flow

1. User submits: firstName, lastName, email, password, phone (optional)
2. Zod validation client-side (real-time) + server-side
3. Backend: bcrypt hash (12 rounds), create User, generate tokens
4. Refresh token hashed and stored in `RefreshToken` table
5. Refresh token → httpOnly cookie, access token → response body
6. Frontend stores access token in memory (not localStorage)

### Google OAuth Flow

1. Click "Continue with Google" → redirect `/api/auth/google`
2. Passport.js redirects to Google consent screen
3. Callback: Google returns profile (email, name, avatar)
4. Backend: findOrCreate User with `provider: "google"`, password null
5. Generate tokens, store refresh token in DB
6. Redirect to frontend with refresh token cookie set, frontend fetches access token via `/api/auth/refresh`

### Token Management

- Access token: JWT, 15 min TTL, stored in memory (React state/context)
- Refresh token: JWT, 7 days TTL, httpOnly secure cookie, hashed in DB
- Axios interceptor: on 401, auto-call `/api/auth/refresh`
- On refresh: old token revoked in DB, new token issued
- On logout: refresh token revoked in DB, cookie cleared
- If refresh fails → logout, redirect `/login`

### Route Protection

- **Backend middleware:** `authenticate` (decode JWT) → `requireAdmin` (check role)
- **Frontend middleware.ts:** checks for refresh token cookie presence → redirect to `/login` if missing (for `/dashboard/*`, `/admin/*`)
- **Client ProtectedRoute:** verify role for admin pages after fetching `/api/auth/me`

### Security Measures

- **Rate limiting** (express-rate-limit): auth 10/min, contact 5/min, general 100/min
- **Helmet.js**: secure HTTP headers
- **CORS**: `CORS_ORIGIN` env variable — `localhost:3000` in dev, production domain in prod
- **Input sanitization**: no HTML in messages
- **JWT payload**: userId + role only (no sensitive data)
- **bcrypt**: 12 salt rounds

---

## 9. SEO & Performance

### SEO (Next.js)

- Root layout: default title, description, Open Graph image, Twitter card
- Per-page `generateMetadata()` overrides
- JSON-LD: `Person` schema on homepage, `CreativeWork` on projects
- `sitemap.ts`: dynamic, includes projects from API
- `robots.ts`: allow all except `/admin/*`, `/dashboard/*`

### Performance

- **Three.js**: lazy loaded (`next/dynamic`, `ssr: false`), GPU detection, paused when hidden
- **Images**: `next/image` everywhere, WebP/AVIF, blur placeholders
- **Code splitting**: admin lazy loaded, Three.js separate chunk, Framer Motion tree-shaken
- **Caching**: public API routes with `stale-while-revalidate`, ISR 60s for homepage
- **Device optimization**: `devicePixelRatio` capped at 2, simplified 3D on mobile

---

## 10. Admin Panel

### Dashboard (/admin)

- 4 KPI cards: Unread messages, Total messages (month), Page views (month), Registered users
- Bar chart: views last 30 days
- Line chart: messages per week
- Quick access: 5 most recent unread messages

### Messages (/admin/messages)

- Table: date, name, email, phone, message excerpt, read status
- Click row → expand with full message
- Actions: toggle read/unread, delete
- Filters: all / unread / read
- Pagination: 20 per page

### CRUD Pages (/admin/projects, /admin/skills, /admin/services, /admin/testimonials)

Common pattern for all:
- Table with key fields, sortable
- "Add" button → form modal
- Row actions: edit (modal), delete (with confirmation)
- sortOrder field for display ordering

**Projects form**: title, description, longDescription, imageUrl, liveUrl, githubUrl, tags (multi-select + create), featured toggle, sortOrder

**Skills form**: name, level (1-4 selector), icon, category (enum select), sortOrder

**Services form**: title, description, icon, sortOrder

**Testimonials form**: name, role, company, content, avatarUrl, sortOrder

### Admin Layout

- Sidebar navigation (left): links to each admin section
- Main content (right): tables, forms, stats
- Void & Gold aesthetic but functional: no Three.js, no HUD frame
- Void panels for stat cards, gold subtle borders on tables

---

## 11. Infrastructure

### Docker Compose (dev)

```yaml
# docker-compose.dev.yml
services:
  postgres:
    image: postgres:15
    ports: ["5432:5432"]
    environment:
      POSTGRES_USER: tomfolio
      POSTGRES_PASSWORD: tomfolio
      POSTGRES_DB: tomfolio
    volumes:
      - postgres_data:/var/lib/postgresql/data

  mailpit:
    image: axllent/mailpit
    ports:
      - "1025:1025"   # SMTP
      - "8025:8025"   # Web UI

volumes:
  postgres_data:
```

### Environment Variables

```env
DATABASE_URL=postgresql://tomfolio:tomfolio@localhost:5432/tomfolio
JWT_SECRET=<random>
JWT_REFRESH_SECRET=<random>
GOOGLE_CLIENT_ID=<optional>
GOOGLE_CLIENT_SECRET=<optional>
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
NEXT_PUBLIC_API_URL=http://localhost:4000
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
ADMIN_EMAIL=contact@tomi-tom.dev
CORS_ORIGIN=http://localhost:3000
```

### Root Scripts

```json
{
  "scripts": {
    "dev": "concurrently \"npm run dev:front\" \"npm run dev:back\"",
    "dev:front": "cd frontend && npm run dev",
    "dev:back": "cd backend && npm run dev",
    "db:up": "docker compose -f docker-compose.dev.yml up -d",
    "db:down": "docker compose -f docker-compose.dev.yml down",
    "db:migrate": "cd backend && npx prisma migrate dev",
    "db:seed": "cd backend && npx prisma db seed",
    "db:studio": "cd backend && npx prisma studio",
    "db:reset": "cd backend && npx prisma migrate reset"
  }
}
```

### First Launch Workflow

```bash
cp .env.example .env           # adjust secrets
npm run db:up                   # start PostgreSQL + Mailpit
npm install                     # install all deps (root + frontend + backend via workspaces)
npm run db:migrate              # create tables
npm run db:seed                 # inject data from tomfolio-frontend
npm run dev                     # start front (3000) + back (4000)
```

---

## 12. Seed Data

Data extracted from `tomfolio-frontend/` source code.

### Admin User

- email: contact@tomi-tom.dev
- role: ADMIN
- password: hashed default (to be changed)

### Skills (18)

**Frontend:** React (4), TypeScript (4), Tailwind CSS (4), Three.js (3), Framer Motion (4), HTML/CSS (4)
**Design:** UI/UX (4), Figma (4), Design Systems (4), Adobe XD (3), Photoshop (3), Prototyping (4)
**Backend & Tools:** Node.js (3), Express (3), MongoDB (3), Git (4), REST APIs (4), CI/CD (2)

### Projects (3)

1. **Personal Portfolio — tombp.fr** — React, TypeScript, Three.js, Tailwind CSS — Live: tombp.fr — Featured
2. **IsoMaker — 3D Pixel Art Creator** — JavaScript, Canvas, Pixel Art — Live: isomaker.fr — Featured
3. **LibertAI — AI Platform** — React, UI/UX, Accessibility — Live: libertai.io — Featured

### Services (4)

1. Développement Web — Fullstack web development with modern frameworks
2. Design UI/UX — User interface design and user experience optimization
3. Consulting Technique — Technical consulting and architecture guidance
4. Applications Interactives — Interactive web applications and creative experiences

### Testimonials (3 — placeholder)

Fictional but realistic testimonials to populate the section.

### Tags

React, TypeScript, Three.js, Tailwind CSS, JavaScript, Canvas, Pixel Art, UI/UX, Accessibility, Framer Motion

---

## 13. Privacy & Data Retention

- **PageView IPs** are anonymized before storage (last octet set to 0, e.g., `192.168.1.42` → `192.168.1.0`)
- **PageView records** older than 90 days are automatically deleted (backend cron job or Prisma middleware)
- **No cookies for tracking** — PageView is server-side only, no consent banner needed for analytics
- **Auth cookies** (refresh token) are functional, not tracking — exempt from consent requirements
- **User data deletion** — users can delete their account, which cascades to all UserData and Messages via Prisma `onDelete: Cascade`

---

## 14. Testing Strategy

Testing is deferred to post-V1 core implementation but planned as follows:

- **Backend**: Jest + Supertest for API integration tests (auth flows, CRUD operations, middleware)
- **Frontend**: Vitest + React Testing Library for component tests
- **E2E**: Playwright for critical user flows (registration, login, contact form, admin CRUD)
- **Priority**: auth flows > contact form > admin CRUD > public page rendering

---

## 15. Migration Notes

- The new project uses Next.js App Router — React Router (used in `tomfolio-frontend/`) is dropped
- The CLAUDE.md file should be updated once the new project structure is adopted
- The existing design system class names (`text-display-1`, `card`, `link`, `container-wide`) are replaced by the Void & Gold system (`.void-panel`, `.btn-gold`, `.section-label`, etc.)
- Seed data testimonials are fictional/placeholder — marked as such in the seed script with a `[PLACEHOLDER]` comment

---

## 16. Summary of Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Architecture | Next.js + Express separate | Separation of concerns, backend reusable for future clients |
| Database | PostgreSQL | Relational, strong ecosystem, Prisma support |
| Auth strategy | JWT access + refresh | Stateless, scalable, secure with httpOnly cookies |
| User data storage | Key/value JSON (UserData) | Flexible, extensible without schema changes |
| Layout | Vertical scroll + HUD | SEO-friendly, accessible, retains cyberpunk identity |
| 3D integration | Three.js gears tied to scroll | Preserves visual signature from existing site |
| Theme | Dark/Light via CSS variables | Accessible, simple implementation, user preference respected |
| Dev infra | Docker for DB only | Best DX with native hot reload |
| Content management | DB + admin CRUD | No hardcoding, full control without code changes |
| Static content | Hero/About/CTA hardcoded | Rarely changes, benefits from SSR |
