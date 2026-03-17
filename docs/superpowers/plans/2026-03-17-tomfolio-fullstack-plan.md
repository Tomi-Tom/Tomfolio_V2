# Tomfolio Fullstack Portfolio — Implementation Plan

> **For agentic workers:** REQUIRED: Use superpowers:subagent-driven-development (if subagents available) or superpowers:executing-plans to implement this plan. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a fullstack professional portfolio with Next.js frontend, Express backend, and PostgreSQL database, replacing the existing React SPA while preserving its "Void & Gold" design system.

**Architecture:** Monorepo with npm workspaces — `frontend/` (Next.js 14 App Router) communicates via REST API with `backend/` (Express + Prisma). PostgreSQL + Mailpit run in Docker for dev. Auth is handled entirely by the Express backend using JWTs.

**Tech Stack:** Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Three.js, Express, Prisma, PostgreSQL, Zod, bcrypt, Passport.js, Nodemailer

**Spec:** `docs/superpowers/specs/2026-03-16-tomfolio-fullstack-design.md`

---

## Chunk 1: Infrastructure & Backend Core

### Task 1: Monorepo scaffolding & Docker

**Files:**
- Create: `package.json` (root)
- Create: `docker-compose.dev.yml`
- Create: `.env.example`
- Create: `.gitignore`
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `frontend/package.json` (via create-next-app)

- [ ] **Step 1: Create root `package.json` with workspaces**

```json
{
  "name": "tomfolio",
  "private": true,
  "workspaces": ["frontend", "backend"],
  "scripts": {
    "dev": "concurrently \"npm run dev:front\" \"npm run dev:back\"",
    "dev:front": "npm run dev -w frontend",
    "dev:back": "npm run dev -w backend",
    "db:up": "docker compose -f docker-compose.dev.yml up -d",
    "db:down": "docker compose -f docker-compose.dev.yml down",
    "db:migrate": "npm run prisma:migrate -w backend",
    "db:seed": "npm run prisma:seed -w backend",
    "db:studio": "npm run prisma:studio -w backend",
    "db:reset": "npm run prisma:reset -w backend"
  },
  "devDependencies": {
    "concurrently": "^9.1.0"
  }
}
```

- [ ] **Step 2: Create `docker-compose.dev.yml`**

```yaml
services:
  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      POSTGRES_USER: tomfolio
      POSTGRES_PASSWORD: tomfolio
      POSTGRES_DB: tomfolio
    volumes:
      - postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD", "pg_isready", "-U", "tomfolio"]
      interval: 5s
      timeout: 5s
      retries: 5

  mailpit:
    image: axllent/mailpit
    ports:
      - "1025:1025"
      - "8025:8025"

volumes:
  postgres_data:
```

- [ ] **Step 3: Create `.env.example`**

```env
DATABASE_URL=postgresql://tomfolio:tomfolio@localhost:5432/tomfolio
JWT_SECRET=change-me-to-a-random-secret-min-32-chars
JWT_REFRESH_SECRET=change-me-to-another-random-secret-min-32-chars
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
GOOGLE_CALLBACK_URL=http://localhost:4000/api/auth/google/callback
NEXT_PUBLIC_API_URL=http://localhost:4000
API_URL=http://localhost:4000
NEXT_PUBLIC_SITE_URL=http://localhost:3000
PORT=4000
SMTP_HOST=localhost
SMTP_PORT=1025
SMTP_USER=
SMTP_PASS=
ADMIN_EMAIL=contact@tomi-tom.dev
CORS_ORIGIN=http://localhost:3000
```

- [ ] **Step 4: Create `.gitignore`**

Include: `node_modules/`, `.env`, `.next/`, `dist/`, `postgres_data/`, `.vite/`, `*.log`

- [ ] **Step 5: Copy `.env.example` to `.env`**

Run: `cp .env.example .env`

- [ ] **Step 6: Start Docker services**

Run: `docker compose -f docker-compose.dev.yml up -d`
Verify: `docker compose -f docker-compose.dev.yml ps` — both `postgres` and `mailpit` are `running`

- [ ] **Step 7: Commit**

```bash
git init
git add package.json docker-compose.dev.yml .env.example .gitignore
git commit -m "chore: scaffold monorepo with Docker dev services"
```

---

### Task 2: Backend project setup

**Files:**
- Create: `backend/package.json`
- Create: `backend/tsconfig.json`
- Create: `backend/src/index.ts`
- Create: `backend/prisma/schema.prisma`

- [ ] **Step 1: Create `backend/package.json`**

```json
{
  "name": "tomfolio-backend",
  "private": true,
  "scripts": {
    "dev": "tsx watch src/index.ts",
    "build": "tsc",
    "start": "node dist/index.js",
    "prisma:migrate": "prisma migrate dev",
    "prisma:seed": "prisma db seed",
    "prisma:studio": "prisma studio",
    "prisma:reset": "prisma migrate reset"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  },
  "dependencies": {
    "@prisma/client": "^6.3.0",
    "bcrypt": "^5.1.1",
    "cookie-parser": "^1.4.7",
    "cors": "^2.8.5",
    "dotenv": "^16.4.7",
    "express": "^4.21.2",
    "express-async-errors": "^3.1.1",
    "express-rate-limit": "^7.5.0",
    "helmet": "^8.0.0",
    "jsonwebtoken": "^9.0.2",
    "nodemailer": "^6.9.16",
    "passport": "^0.7.0",
    "passport-google-oauth20": "^2.0.0",
    "zod": "^3.24.1"
  },
  "devDependencies": {
    "@types/bcrypt": "^5.0.2",
    "@types/cookie-parser": "^1.4.7",
    "@types/cors": "^2.8.17",
    "@types/express": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/nodemailer": "^6.4.17",
    "@types/passport": "^1.0.17",
    "@types/passport-google-oauth20": "^2.0.16",
    "prisma": "^6.3.0",
    "tsx": "^4.19.2",
    "typescript": "^5.7.3"
  }
}
```

- [ ] **Step 2: Create `backend/tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "dist",
    "rootDir": "src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*", "prisma/**/*"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Create Prisma schema at `backend/prisma/schema.prisma`**

Full schema from spec Section 3 — all 10 models: User, Role, Message, Project, Skill, SkillStatus, SkillCategory, Tag, Service, Testimonial, RefreshToken, UserData, PageView.

- [ ] **Step 4: Create minimal Express server at `backend/src/index.ts`**

```typescript
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});
```

- [ ] **Step 5: Install dependencies and run migration**

Run:
```bash
npm install
npm run db:migrate -- --name init
```
Verify: `backend/prisma/migrations/` directory created with SQL files

- [ ] **Step 6: Start backend and verify**

Run: `npm run dev:back`
Verify: `curl http://localhost:4000/api/health` returns `{"status":"ok"}`

- [ ] **Step 7: Commit**

```bash
git add backend/
git commit -m "feat: backend project setup with Express, Prisma schema, and health endpoint"
```

---

### Task 3: Backend utilities & middleware

**Files:**
- Create: `backend/src/utils/errors.ts`
- Create: `backend/src/utils/tokens.ts`
- Create: `backend/src/utils/email.ts`
- Create: `backend/src/utils/ip.ts`
- Create: `backend/src/utils/pagination.ts`
- Create: `backend/src/middleware/validate.ts`
- Create: `backend/src/middleware/authenticate.ts`
- Create: `backend/src/middleware/requireAdmin.ts`
- Create: `backend/src/middleware/rateLimiter.ts`
- Create: `backend/src/middleware/trackPageView.ts`

- [ ] **Step 1: Create `backend/src/utils/errors.ts`**

AppError class and error response helper following the API error contract from the spec:

```typescript
export class AppError extends Error {
  constructor(
    public statusCode: number,
    public code: string,
    message: string,
    public details: { field: string; message: string }[] = []
  ) {
    super(message);
  }
}

// Error handler middleware for Express
export function errorHandler(err, req, res, next) {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      error: { code: err.code, message: err.message, details: err.details }
    });
  }
  console.error(err);
  res.status(500).json({
    error: { code: 'INTERNAL_ERROR', message: 'Internal server error', details: [] }
  });
}
```

- [ ] **Step 2: Create `backend/src/utils/tokens.ts`**

Functions: `generateAccessToken(userId, role)`, `generateRefreshToken(userId)`, `verifyAccessToken(token)`, `verifyRefreshToken(token)`, `hashToken(token)`. Access token: 15min, refresh: 7d. Uses `jsonwebtoken` and `crypto.createHash('sha256')` for hashing refresh tokens.

- [ ] **Step 3: Create `backend/src/utils/email.ts`**

Nodemailer transporter configured from env vars. Function `sendContactNotification(message)` sends an email to `ADMIN_EMAIL` with the message details.

- [ ] **Step 4: Create `backend/src/utils/ip.ts`**

Function `anonymizeIp(ip: string): string` — zeroes the last octet for IPv4 (`192.168.1.42` → `192.168.1.0`), truncates last group for IPv6.

- [ ] **Step 5: Create `backend/src/utils/pagination.ts`**

Function `parsePagination(query)` extracts `page` (default 1) and `limit` (default 20, max 100). Function `paginatedResponse(data, total, page, limit)` returns the standard envelope from spec.

- [ ] **Step 6: Create `backend/src/middleware/validate.ts`**

Generic Zod validation middleware factory:

```typescript
import { ZodSchema } from 'zod';
import { AppError } from '../utils/errors.js';

export const validate = (schema: ZodSchema) => (req, res, next) => {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    const details = result.error.issues.map(i => ({
      field: i.path.join('.'),
      message: i.message,
    }));
    return next(new AppError(422, 'VALIDATION_ERROR', 'Validation failed', details));
  }
  req.body = result.data;
  next();
};
```

Note: all route handlers must be wrapped with an async error catcher. Add `express-async-errors` to `backend/package.json` dependencies (import it at the top of `index.ts` before any routes), which patches Express to catch rejected promises and forward them to the error handler automatically.

- [ ] **Step 7: Create `backend/src/middleware/authenticate.ts`**

Decodes JWT from `Authorization: Bearer <token>` header, attaches `req.user = { id, role }`. Throws 401 if missing/invalid.

- [ ] **Step 8: Create `backend/src/middleware/requireAdmin.ts`**

Checks `req.user.role === 'ADMIN'`, throws 403 if not.

- [ ] **Step 9: Create `backend/src/middleware/rateLimiter.ts`**

Export three rate limiters using `express-rate-limit`:
- `authLimiter`: 10 requests/min per IP
- `contactLimiter`: 5 requests/min per IP
- `generalLimiter`: 100 requests/min per IP

- [ ] **Step 10: Create `backend/src/middleware/trackPageView.ts`**

Middleware that logs `path`, `referrer`, `userAgent`, anonymized `ip` to the `PageView` table. Non-blocking (fire-and-forget with `.catch(console.error)`).

- [ ] **Step 11: Wire error handler into Express app in `backend/src/index.ts`**

Add `app.use(errorHandler)` after all routes. Wrap route handlers to catch async errors.

- [ ] **Step 12: Commit**

```bash
git add backend/src/utils/ backend/src/middleware/ backend/src/index.ts
git commit -m "feat: add backend utilities (errors, tokens, email, pagination) and middleware (auth, validation, rate limiting)"
```

---

### Task 4: Auth routes

**Files:**
- Create: `backend/src/routes/auth.ts`
- Create: `backend/src/services/auth.service.ts`
- Modify: `backend/src/index.ts` (mount routes)

- [ ] **Step 1: Create `backend/src/services/auth.service.ts`**

Service functions:
- `register(data)` — validate email uniqueness, hash password, create user, generate tokens, store refresh token hash in DB, return { user, accessToken, refreshToken }
- `login(email, password)` — find user, verify bcrypt, generate tokens, store refresh token
- `refreshTokens(oldRefreshToken)` — verify JWT, find hashed token in DB, check not revoked/expired, revoke old, generate new pair
- `logout(refreshToken)` — find and revoke token in DB
- `getOrCreateGoogleUser(profile)` — findOrCreate user with provider "google"

- [ ] **Step 2: Create Zod schemas for auth**

In `backend/src/routes/auth.ts`:
- `registerSchema`: firstName, lastName, email (email format), password (min 8 chars), phone (optional)
- `loginSchema`: email, password

- [ ] **Step 3: Create auth routes in `backend/src/routes/auth.ts`**

```
POST /api/auth/register — validate(registerSchema) → authService.register → set refresh cookie → return { user, accessToken }
POST /api/auth/login — validate(loginSchema) → authService.login → set refresh cookie → return { user, accessToken }
POST /api/auth/logout — authenticate → authService.logout(cookie) → clear cookie → 200
POST /api/auth/refresh — read cookie → authService.refreshTokens → set new cookie → return { accessToken }
GET /api/auth/me — authenticate → return req.user profile from DB
GET /api/auth/google — passport.authenticate('google', { scope: ['profile', 'email'] })
GET /api/auth/google/callback — passport callback → generate tokens → redirect to frontend with cookie set
```

Cookie settings: `httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'lax', maxAge: 7 * 24 * 60 * 60 * 1000, path: '/'`

- [ ] **Step 4: Configure Passport Google OAuth in `backend/src/services/auth.service.ts`**

Setup `passport-google-oauth20` strategy. Callback calls `getOrCreateGoogleUser`. Only active if `GOOGLE_CLIENT_ID` is set (graceful skip otherwise).

- [ ] **Step 5: Mount auth routes and apply rate limiter in `backend/src/index.ts`**

```typescript
import authRoutes from './routes/auth.js';
app.use('/api/auth', authLimiter, authRoutes);
```

- [ ] **Step 6: Verify auth flow manually**

Run backend, then:
```bash
# Register
curl -X POST http://localhost:4000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"firstName":"Tom","lastName":"BP","email":"test@test.com","password":"password123"}'
# Expected: 201 with { user, accessToken }

# Login
curl -X POST http://localhost:4000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@test.com","password":"password123"}'
# Expected: 200 with { user, accessToken }
```

- [ ] **Step 7: Commit**

```bash
git add backend/src/routes/auth.ts backend/src/services/auth.service.ts backend/src/index.ts
git commit -m "feat: auth system with register, login, logout, refresh, Google OAuth"
```

---

### Task 5: Contact routes

**Files:**
- Create: `backend/src/routes/contact.ts`
- Create: `backend/src/services/contact.service.ts`
- Modify: `backend/src/index.ts`

- [ ] **Step 1: Create `backend/src/services/contact.service.ts`**

- `createMessage(data, userId?)` — create Message in DB, send email notification via `sendContactNotification`
- `listMessages(page, limit, filter)` — paginated query with optional `isRead` filter
- `toggleRead(id)` — flip `isRead` boolean
- `deleteMessage(id)` — delete from DB

- [ ] **Step 2: Create Zod schema and routes in `backend/src/routes/contact.ts`**

Schema: firstName, lastName, email (valid), phone (optional), content (min 10 chars)

```
POST /api/contact — contactLimiter, validate(schema), optionally authenticate → createMessage
GET /api/contact — authenticate, requireAdmin → listMessages (query: page, limit, filter)
PATCH /api/contact/:id/read — authenticate, requireAdmin → toggleRead
DELETE /api/contact/:id — authenticate, requireAdmin → deleteMessage
```

- [ ] **Step 3: Mount in `backend/src/index.ts`**

- [ ] **Step 4: Verify**

Send a contact message via curl, check Mailpit at `http://localhost:8025`.

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/contact.ts backend/src/services/contact.service.ts backend/src/index.ts
git commit -m "feat: contact routes with email notification and admin management"
```

---

### Task 6: Portfolio content CRUD routes (Projects, Skills, Services, Testimonials, Tags)

**Files:**
- Create: `backend/src/routes/projects.ts`
- Create: `backend/src/routes/skills.ts`
- Create: `backend/src/routes/services.ts`
- Create: `backend/src/routes/testimonials.ts`
- Create: `backend/src/routes/tags.ts`
- Create: `backend/src/services/crud.service.ts`
- Modify: `backend/src/index.ts`

- [ ] **Step 1: Create `backend/src/services/crud.service.ts`**

Generic CRUD service factory that works for any Prisma model. Takes the model delegate and returns `{ list, getById, create, update, remove }`. Handles `sortOrder` ordering, pagination for admin list views.

For Projects specifically: include `tags` relation in queries, handle tag connect/disconnect on create/update.

- [ ] **Step 2: Create route files for each resource**

Each file follows the same pattern:
- Zod schema for create/update validation
- `GET /` — public, list all sorted by `sortOrder` (no pagination by default, available via query)
- `POST /` — admin, validate, create
- `PATCH /:id` — admin, validate, update
- `DELETE /:id` — admin, delete

Projects route includes tag management (connect existing tags by id, create new tags inline).
Tags route: only GET (list), POST (create), DELETE (delete). No PATCH.

- [ ] **Step 3: Mount all routes with `trackPageView` on GET endpoints**

```typescript
import projectRoutes from './routes/projects.js';
import skillRoutes from './routes/skills.js';
import serviceRoutes from './routes/services.js';
import testimonialRoutes from './routes/testimonials.js';
import tagRoutes from './routes/tags.js';

app.use('/api/projects', projectRoutes);
app.use('/api/skills', skillRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/tags', tagRoutes);
```

- [ ] **Step 4: Verify with curl**

```bash
# List projects (empty initially)
curl http://localhost:4000/api/projects
# Expected: { "data": [], "pagination": { ... } }
```

- [ ] **Step 5: Commit**

```bash
git add backend/src/routes/ backend/src/services/crud.service.ts backend/src/index.ts
git commit -m "feat: CRUD routes for projects, skills, services, testimonials, tags"
```

---

### Task 7: User routes & Stats routes

**Files:**
- Create: `backend/src/routes/users.ts`
- Create: `backend/src/routes/stats.ts`
- Create: `backend/src/services/stats.service.ts`
- Modify: `backend/src/index.ts`

- [ ] **Step 1: Create `backend/src/routes/users.ts`**

```
PATCH /api/users/me — authenticate → update own profile (firstName, lastName, phone, avatarUrl)
DELETE /api/users/me — authenticate → delete own account (cascades to UserData, Messages, RefreshTokens via Prisma onDelete)
GET /api/users/me/data — authenticate → list all UserData for current user
PUT /api/users/me/data/:key — authenticate → upsert UserData (key from param, value from body as JSON)
DELETE /api/users/me/data/:key — authenticate → delete UserData entry
```

- [ ] **Step 2: Create `backend/src/services/stats.service.ts`**

- `getOverview()` — count: unread messages, total messages this month, page views this month, total registered users
- `getViewsByPeriod(days)` — group PageView by day for the last N days
- `getMessagesByPeriod(days)` — group Message by day/week for the last N days

- [ ] **Step 3: Create `backend/src/routes/stats.ts`**

```
GET /api/stats/overview — authenticate, requireAdmin → getOverview
GET /api/stats/views — authenticate, requireAdmin → getViewsByPeriod(query.days || 30)
GET /api/stats/messages — authenticate, requireAdmin → getMessagesByPeriod(query.days || 30)
```

- [ ] **Step 4: Add PageView cleanup job**

In `backend/src/index.ts`, add a `setInterval` that runs once per day (86400000ms) and deletes PageView records older than 90 days:

```typescript
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Cleanup old page views every 24 hours
setInterval(async () => {
  const cutoff = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
  await prisma.pageView.deleteMany({ where: { createdAt: { lt: cutoff } } });
}, 86_400_000);
```

- [ ] **Step 5: Mount routes in `backend/src/index.ts`**

- [ ] **Step 6: Commit**

```bash
git add backend/src/routes/users.ts backend/src/routes/stats.ts backend/src/services/stats.service.ts backend/src/index.ts
git commit -m "feat: user profile/data routes, admin stats endpoints, and PageView cleanup"
```

---

### Task 8: Seed data

**Files:**
- Create: `backend/prisma/seed.ts`

- [ ] **Step 1: Create `backend/prisma/seed.ts`**

Extracts all data from spec Section 12:

1. Create admin user (email: `contact@tomi-tom.dev`, role: ADMIN, password: bcrypt hash of `admin123`)
2. Create 10 tags: React, TypeScript, Three.js, Tailwind CSS, JavaScript, Canvas, Pixel Art, UI/UX, Accessibility, Framer Motion
3. Create 18 skills across 3 categories with levels (from spec)
4. Create 5 "exploring" skills (Next.js, Rust, WebGL, AI Integration, Docker) with `status: EXPLORING`, level 1, category OTHER
5. Create 3 projects with tag relations and `featured: true` (from spec)
6. Create 4 services (from spec)
7. Create 3 placeholder testimonials with `[PLACEHOLDER]` comment
8. Use `upsert` operations to make seed idempotent

- [ ] **Step 2: Run seed**

Run: `npm run db:seed`
Verify: `npm run db:studio` — check data in all tables

- [ ] **Step 3: Verify API returns seeded data**

```bash
curl http://localhost:4000/api/skills | jq
curl http://localhost:4000/api/projects | jq
```

- [ ] **Step 4: Commit**

```bash
git add backend/prisma/seed.ts
git commit -m "feat: seed database with real data from existing portfolio"
```

---

## Chunk 2: Frontend Setup & Design System

### Task 9: Next.js project setup

**Files:**
- Create: `frontend/` (entire Next.js project)
- Create: `frontend/src/styles/globals.css`
- Create: `frontend/src/styles/design-tokens.css`
- Create: `frontend/tailwind.config.ts`
- Create: `frontend/src/lib/utils.ts`

- [ ] **Step 1: Scaffold Next.js project**

Run from project root:
```bash
npx create-next-app@14 frontend --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

- [ ] **Step 2: Configure `next.config.js` for external images**

Add `images.remotePatterns` for Unsplash and any other external image domains:

```javascript
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '*.tombp.fr' },
    ],
  },
};
```

- [ ] **Step 3: Clean up default boilerplate**

Remove default page content, global CSS overrides, default favicon. Keep the structure clean.

- [ ] **Step 3: Create `frontend/src/styles/design-tokens.css`**

All CSS custom properties from spec Section 7 — both dark and light themes:

```css
:root,
[data-theme="dark"] {
  --void: #000000;
  --void-deep: #030303;
  --void-surface: #080808;
  --void-elevated: #0d0d0d;
  --gold: #d4af37;
  --gold-dim: rgba(212,175,55,0.55);
  --gold-ghost: rgba(212,175,55,0.08);
  --text-primary: #ffffff;
  --text-secondary: rgba(232,228,217,0.7);
  --text-dim: rgba(232,228,217,0.35);
  --border: rgba(212,175,55,0.12);
  --border-active: rgba(212,175,55,0.35);
}

[data-theme="light"] {
  --void: #ffffff;
  --void-deep: #f5f3ef;
  --void-surface: #ffffff;
  --void-elevated: #fafaf8;
  --gold: #b8960c;
  --gold-dim: rgba(184,150,12,0.55);
  --gold-ghost: rgba(184,150,12,0.06);
  --text-primary: #1a1a1a;
  --text-secondary: rgba(30,30,30,0.7);
  --text-dim: rgba(30,30,30,0.4);
  --border: rgba(184,150,12,0.15);
  --border-active: rgba(184,150,12,0.4);
}
```

Plus all component classes: `.void-panel`, `.btn-gold`, `.btn-ghost-gold`, `.input-void`, `.section-label`, `.hud-caption`, `.gold-pulse` animation, typography classes.

- [ ] **Step 4: Configure `frontend/tailwind.config.ts`**

Extend theme with design tokens mapped to CSS variables:

```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: 'var(--void)',
          deep: 'var(--void-deep)',
          surface: 'var(--void-surface)',
          elevated: 'var(--void-elevated)',
        },
        gold: {
          DEFAULT: 'var(--gold)',
          dim: 'var(--gold-dim)',
          ghost: 'var(--gold-ghost)',
        },
      },
      fontFamily: {
        display: ['Space Grotesk', 'sans-serif'],
        body: ['DM Sans', 'sans-serif'],
      },
      // ... typography scale, border colors, etc.
    },
  },
};
export default config;
```

- [ ] **Step 5: Create `frontend/src/lib/utils.ts`**

```typescript
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

Install: `npm install clsx tailwind-merge -w frontend`

- [ ] **Step 6: Update `frontend/src/styles/globals.css`**

Import design tokens, set base styles (body background, font, color), import Google Fonts (Space Grotesk, DM Sans).

- [ ] **Step 7: Verify frontend starts**

Run: `npm run dev:front`
Verify: `http://localhost:3000` shows a styled dark page with Void background.

- [ ] **Step 8: Commit**

```bash
git add frontend/
git commit -m "feat: Next.js project setup with Void & Gold design system tokens"
```

---

### Task 10: UI components

**Files:**
- Create: `frontend/src/components/ui/Button.tsx`
- Create: `frontend/src/components/ui/VoidPanel.tsx`
- Create: `frontend/src/components/ui/Input.tsx`
- Create: `frontend/src/components/ui/LevelDots.tsx`
- Create: `frontend/src/components/ui/ThemeToggle.tsx`
- Create: `frontend/src/components/ui/SectionLabel.tsx`

- [ ] **Step 1: Create `Button` component**

Props: `variant` ('gold' | 'ghost-gold' | 'outline'), `size`, `children`, extends `ButtonHTMLAttributes`. Uses Framer Motion for hover scale animation. Applies `.btn-gold` / `.btn-ghost-gold` classes.

- [ ] **Step 2: Create `VoidPanel` component**

Wrapper div with `.void-panel` class. Props: `children`, `className`, `as` (HTML tag). Framer Motion `whileHover` for lift + border brighten.

- [ ] **Step 3: Create `Input` component**

Styled input with `.input-void` class. Supports `label`, `error` message display, all standard input props. Uses `forwardRef` for form library compatibility.

- [ ] **Step 4: Create `LevelDots` component**

Props: `level` (1-4), `maxLevel` (default 4). Renders circles, filled up to `level`.

- [ ] **Step 5: Create `ThemeContext` and `useTheme` hook**

Create `frontend/src/context/ThemeContext.tsx` and `frontend/src/hooks/useTheme.ts` now (not deferred to Task 25):
- ThemeContext provides `theme` ('dark' | 'light') and `toggleTheme()`
- Reads initial theme from localStorage or `prefers-color-scheme`
- Sets `data-theme` attribute on `<html>` and persists to localStorage

- [ ] **Step 6: Create `ThemeToggle` component**

Client component using `useTheme()` hook. Sun/moon icon with Framer Motion rotation transition.

- [ ] **Step 7: Create `SectionLabel` component**

Simple component rendering `.section-label` styled text. Props: `children`.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/components/ui/ frontend/src/context/ThemeContext.tsx frontend/src/hooks/useTheme.ts
git commit -m "feat: UI components — Button, VoidPanel, Input, LevelDots, ThemeToggle, SectionLabel + ThemeContext"
```

---

### Task 11: Layout components

**Files:**
- Create: `frontend/src/components/layout/StatusBar.tsx`
- Create: `frontend/src/components/layout/ChapterBar.tsx`
- Create: `frontend/src/components/layout/HUDFrame.tsx`
- Create: `frontend/src/components/layout/Footer.tsx`
- Create: `frontend/src/hooks/useScrollProgress.ts`

- [ ] **Step 1: Create `useScrollProgress` hook**

Returns `progress` (0 to 1) based on `scrollY / (documentHeight - viewportHeight)`. Uses `requestAnimationFrame` for smooth updates. Also returns `scrollY` for StatusBar opacity.

- [ ] **Step 2: Create `StatusBar` component**

Fixed top bar (36px height). Contains:
- Logo "TBP.DEV" (left)
- Gold pulse indicator + "Available for work" text (center)
- ThemeToggle + nav links (right)
- Background: `rgba(var(--void-deep), opacity)` where opacity increases from 0 to 0.95 based on scroll progress.
- Backdrop blur.

- [ ] **Step 3: Create `ChapterBar` component**

Fixed bottom bar (40px). Section navigation buttons:
- Sections: Intro, About, Skills, Services, Projects, Testimonials, Contact
- Active section highlighted with gold underline
- Scroll-to-section on click using `element.scrollIntoView({ behavior: 'smooth' })`
- Active section detected via Intersection Observer.

- [ ] **Step 4: Create `HUDFrame` component**

4 fixed gold corner brackets at viewport corners. Pure CSS positioning. Each corner is 22px with gold border lines.

- [ ] **Step 5: Create `Footer` component**

Social links (GitHub, LinkedIn), email (contact@tomi-tom.dev), copyright, CTA "Let's Create." with link to contact section.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/layout/ frontend/src/hooks/
git commit -m "feat: layout components — StatusBar, ChapterBar, HUDFrame, Footer with scroll tracking"
```

---

### Task 12: Three.js GearScene

**Files:**
- Create: `frontend/src/components/three/GearScene.tsx`
- Create: `frontend/src/components/three/createGears.ts`

- [ ] **Step 1: Install Three.js**

Run: `npm install three @types/three -w frontend`

- [ ] **Step 2: Create `frontend/src/components/three/createGears.ts`**

Function that creates wireframe gear geometries using Three.js:
- Gold wireframe material (`0xd4af37`)
- Multiple interlocking gears at different sizes
- Simplified geometry on mobile (fewer teeth)
- Returns a Three.js Group

Reference: port the logic from `tomfolio-frontend/src/components/Three/GearUniverse.tsx`.

- [ ] **Step 3: Create `frontend/src/components/three/GearScene.tsx`**

Client component (`'use client'`). Lazy loaded via `next/dynamic` with `ssr: false`.

- Creates a Three.js scene, camera, renderer
- Uses `useScrollProgress` to rotate gears: `rotation = scrollProgress * Math.PI * 2`
- `position: fixed`, `z-index: -1`, full viewport
- `devicePixelRatio` capped at 2
- Pauses render when tab is not visible (`document.hidden`)
- Uses `ResizeObserver` for responsive canvas
- Cleanup on unmount

- [ ] **Step 4: Export lazy-loaded wrapper**

```typescript
// frontend/src/components/three/index.ts
import dynamic from 'next/dynamic';
export const GearScene = dynamic(() => import('./GearScene'), { ssr: false });
```

- [ ] **Step 5: Verify in browser**

Add GearScene to a test page, verify gold wireframe gears render and rotate on scroll.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/components/three/
git commit -m "feat: Three.js GearScene with scroll-driven rotation and performance optimizations"
```

---

## Chunk 3: Frontend Auth & API Integration

### Task 13: API client & auth context

**Files:**
- Create: `frontend/src/lib/api.ts`
- Create: `frontend/src/context/AuthContext.tsx`
- Create: `frontend/src/hooks/useAuth.ts`
- Create: `frontend/src/types/index.ts`

- [ ] **Step 1: Create `frontend/src/types/index.ts`**

TypeScript types matching the Prisma models: `User`, `Message`, `Project`, `Skill`, `Service`, `Testimonial`, `Tag`, `UserData`, `PaginatedResponse<T>`, `ApiError`.

- [ ] **Step 2: Create `frontend/src/lib/api.ts`**

Axios instance with:
- `baseURL`: `process.env.NEXT_PUBLIC_API_URL`
- `withCredentials: true` (for httpOnly cookies)
- Response interceptor: on 401, attempt `/api/auth/refresh`, retry original request. On refresh failure, clear auth state and redirect to `/login`.
- Request interceptor: attach access token from memory to `Authorization` header.

Export typed API functions:
- `api.auth.register(data)`, `api.auth.login(data)`, `api.auth.logout()`, `api.auth.refresh()`, `api.auth.me()`
- `api.contact.send(data)`
- `api.projects.list()`, `api.skills.list()`, `api.services.list()`, `api.testimonials.list()`
- Admin functions for CRUD operations
- `api.stats.overview()`, `api.stats.views(days)`, `api.stats.messages(days)`

- [ ] **Step 3: Create `frontend/src/context/AuthContext.tsx`**

Client component providing:
- `user` state (User | null)
- `accessToken` in a `useRef` (not in state to avoid re-renders)
- `login(email, password)`, `register(data)`, `logout()` functions
- `isAuthenticated`, `isAdmin` computed booleans
- On mount: try `api.auth.refresh()` to restore session (silent refresh)

- [ ] **Step 4: Create `frontend/src/hooks/useAuth.ts`**

Simple hook wrapping `useContext(AuthContext)` with a meaningful error if used outside provider.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/lib/api.ts frontend/src/context/ frontend/src/hooks/useAuth.ts frontend/src/types/
git commit -m "feat: API client with auth interceptor and AuthContext provider"
```

---

### Task 14: Auth pages (Login & Register)

**Files:**
- Create: `frontend/src/app/(auth)/login/page.tsx`
- Create: `frontend/src/app/(auth)/register/page.tsx`
- Create: `frontend/src/app/(auth)/layout.tsx`

- [ ] **Step 1: Create auth layout at `frontend/src/app/(auth)/layout.tsx`**

Centered layout with Void background. No StatusBar/ChapterBar. Logo link back to home. Minimal HUD corners.

- [ ] **Step 2: Create login page**

Form with:
- Email input (`.input-void`)
- Password input (`.input-void`)
- "Sign in" button (`.btn-gold`)
- "Continue with Google" button (`.btn-ghost-gold`) — links to `/api/auth/google`
- Link to register page
- Zod validation with `react-hook-form`
- Error display for invalid credentials
- On success: redirect to `/` or previous page

Install: `npm install react-hook-form @hookform/resolvers -w frontend`

- [ ] **Step 3: Create register page**

Form with:
- firstName, lastName, email, password, phone (optional)
- All using `.input-void` components
- "Create account" button (`.btn-gold`)
- "Continue with Google" button
- Link to login page
- Zod validation
- On success: redirect to `/`

- [ ] **Step 4: Verify auth flow in browser**

Register a new user, verify redirect. Log out, log back in. Check that refresh works after page reload.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/app/\(auth\)/
git commit -m "feat: login and register pages with form validation"
```

---

### Task 15: Next.js middleware & route protection

**Files:**
- Create: `frontend/src/middleware.ts`

- [ ] **Step 1: Create `frontend/src/middleware.ts`**

```typescript
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const refreshToken = request.cookies.get('refreshToken');
  const { pathname } = request.nextUrl;

  const protectedPaths = ['/dashboard', '/admin'];
  const isProtected = protectedPaths.some(p => pathname.startsWith(p));

  if (isProtected && !refreshToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*'],
};
```

- [ ] **Step 2: Verify protected routes redirect to login**

Navigate to `/admin` without being logged in → redirected to `/login?redirect=/admin`.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/middleware.ts
git commit -m "feat: Next.js middleware for route protection"
```

---

## Chunk 4: Homepage Sections

### Task 16: Homepage layout & Hero section

**Prerequisites:** Tasks 8 (seed data), 11 (layout components), 12 (Three.js), and 13 (API client/auth context) must all be complete before starting this task.

**Files:**
- Create: `frontend/src/app/(public)/page.tsx`
- Create: `frontend/src/app/(public)/layout.tsx`
- Create: `frontend/src/components/sections/Hero.tsx`
- Modify: `frontend/src/app/layout.tsx` (root layout with AuthProvider, fonts, metadata)

- [ ] **Step 1: Set up root layout `frontend/src/app/layout.tsx`**

- Import Google Fonts (Space Grotesk, DM Sans) via `next/font/google`
- Import globals.css + design-tokens.css
- Wrap children in `AuthProvider`
- Add default metadata: title, description, Open Graph, Twitter card
- Set `data-theme` based on cookie or default to "dark"
- Add JSON-LD Person schema

- [ ] **Step 2: Create public layout `frontend/src/app/(public)/layout.tsx`**

Wraps children with StatusBar, ChapterBar, HUDFrame, GearScene, Footer.

- [ ] **Step 3: Create homepage `frontend/src/app/(public)/page.tsx`**

Server component that fetches data from backend using `fetch()` with ISR:

```typescript
// Use server-only API_URL (not NEXT_PUBLIC_) for server component fetches
const API_URL = process.env.API_URL || 'http://localhost:4000';

async function getHomeData() {
  const [skills, projects, services, testimonials] = await Promise.all([
    fetch(`${API_URL}/api/skills`, { next: { revalidate: 60 } }).then(r => r.json()),
    fetch(`${API_URL}/api/projects`, { next: { revalidate: 60 } }).then(r => r.json()),
    fetch(`${API_URL}/api/services`, { next: { revalidate: 60 } }).then(r => r.json()),
    fetch(`${API_URL}/api/testimonials`, { next: { revalidate: 60 } }).then(r => r.json()),
  ]);
  return { skills, projects, services, testimonials };
}
```

Renders all section components in order with `scroll-snap-type: y proximity` on the container.

- [ ] **Step 4: Create Hero section**

Client component with Framer Motion animations:
- Display text: "Tom" (light) / "Bariteau." (bold, gold period) / "Peter" (light)
- Tagline: "UX Designer & Developer"
- Subtitle: "Crafting immersive digital experiences..."
- 2 CTAs: "View Work" (btn-gold, scrolls to Projects), "Download CV →" (btn-ghost-gold, link to PDF)
- Stats row: 50+ Projects, 5yr Experience, FR·EN
- fadeUp stagger animation on mount

- [ ] **Step 5: Verify in browser**

Homepage loads with Hero section, GearScene behind, StatusBar on top, ChapterBar on bottom.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/ frontend/src/components/sections/Hero.tsx
git commit -m "feat: homepage layout with Hero section, ISR data fetching, and SEO metadata"
```

---

### Task 17: About & Skills sections

**Files:**
- Create: `frontend/src/components/sections/About.tsx`
- Create: `frontend/src/components/sections/Skills.tsx`

- [ ] **Step 1: Create About section**

- Section label "About"
- Photo placeholder (grayscale with gold border — 2px gold outline, `mix-blend-mode: luminosity`)
- 2 paragraphs (from spec/seed data)
- Stats row: Education (Epitech Seoul), Experience (5+ Years), Languages (FR · EN), Location (Seoul, KR)
- fadeUp stagger animation triggered by `useInView`

- [ ] **Step 2: Create Skills section**

Props: `skills: Skill[]` (passed from server component)

- Section label "Skills"
- Grid layout with 3 categories: Frontend, Design, Backend & Tools
- Each skill: name + LevelDots component
- "Currently Exploring" subsection below: skills with `status === 'EXPLORING'` displayed as tags/pills
- fadeUp stagger per category group

- [ ] **Step 3: Verify both sections render with data**

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/sections/About.tsx frontend/src/components/sections/Skills.tsx
git commit -m "feat: About and Skills homepage sections"
```

---

### Task 18: Services & Projects sections

**Files:**
- Create: `frontend/src/components/sections/Services.tsx`
- Create: `frontend/src/components/sections/Projects.tsx`
- Create: `frontend/src/components/ui/ProjectCard.tsx`

- [ ] **Step 1: Create Services section**

Props: `services: Service[]`

- Section label "Services"
- Grid of VoidPanel cards (2x2 or responsive)
- Each card: icon (placeholder or emoji initially), title, description, CTA button "Learn more"
- cardHover animation on each

- [ ] **Step 2: Create `ProjectCard` component**

Props: `project: Project`

- VoidPanel with image (next/image, aspect ratio), title, description, tags as pills, links (live + github)
- Hover: lift + border brighten
- Tags displayed as small gold-outlined pills

- [ ] **Step 3: Create Projects section**

Props: `projects: Project[]`

- Section label "Projects"
- Tag filter bar at top (all tags from projects, clickable to filter)
- Grid of ProjectCards
- "Featured" filter option
- fadeUp stagger animation

- [ ] **Step 4: Commit**

```bash
git add frontend/src/components/sections/Services.tsx frontend/src/components/sections/Projects.tsx frontend/src/components/ui/ProjectCard.tsx
git commit -m "feat: Services and Projects homepage sections with tag filtering"
```

---

### Task 19: Testimonials & Contact sections

**Files:**
- Create: `frontend/src/components/sections/Testimonials.tsx`
- Create: `frontend/src/components/sections/Contact.tsx`

- [ ] **Step 1: Create Testimonials section**

Props: `testimonials: Testimonial[]`

- Section label "Testimonials"
- Grid of VoidPanel cards
- Each: quote content, name, role, company, avatar placeholder
- Subtle gold quote marks decorative element

- [ ] **Step 2: Create Contact section**

Client component (needs form state + auth context):

- Section label "Contact"
- Heading "Let's Build Something"
- Subtitle "Open to new projects, collaborations, and interesting conversations."
- Form: firstName, lastName, email, phone, message
- If authenticated: pre-fill from `useAuth()` user data
- Zod validation with react-hook-form
- Submit to `api.contact.send(data)`
- Success state: "Message Sent — I'll get back to you soon."
- Error state: "Something went wrong. Please try again."
- Contact info sidebar: email, location, social links
- Status: "Open to new projects" with gold pulse indicator

- [ ] **Step 3: Wire sections into homepage**

Add Testimonials and Contact to the homepage `page.tsx`, passing data from server fetch.

- [ ] **Step 4: Verify complete homepage**

All 7 sections render correctly. Contact form submits. Email appears in Mailpit.

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/sections/Testimonials.tsx frontend/src/components/sections/Contact.tsx frontend/src/app/\(public\)/page.tsx
git commit -m "feat: Testimonials and Contact homepage sections with form submission"
```

---

## Chunk 5: Admin Panel

### Task 20: Admin layout & dashboard

**Files:**
- Create: `frontend/src/app/admin/layout.tsx`
- Create: `frontend/src/app/admin/page.tsx`
- Create: `frontend/src/components/admin/AdminSidebar.tsx`
- Create: `frontend/src/components/admin/StatCard.tsx`
- Create: `frontend/src/components/admin/StatsChart.tsx`

- [ ] **Step 1: Create `AdminSidebar` component**

Left sidebar navigation:
- Logo "TBP.DEV Admin"
- Links: Dashboard, Messages, Projects, Skills, Services, Testimonials
- Active link highlighted with gold
- Void-surface background

- [ ] **Step 2: Create admin layout**

Client component with role check:
- Fetch `/api/auth/me`, verify `role === ADMIN`
- If not admin: redirect to `/`
- Sidebar left, content right
- No StatusBar/ChapterBar/HUDFrame — clean admin layout
- Void & Gold aesthetic but functional

- [ ] **Step 3: Create `StatCard` component**

Props: `title`, `value`, `trend` (optional). VoidPanel with large value display, gold accent.

- [ ] **Step 4: Create `StatsChart` component**

Simple bar/line chart. Can use a lightweight chart library or pure SVG/CSS bars for V1. Props: `data: { label: string, value: number }[]`, `type: 'bar' | 'line'`.

Install (if needed): `npm install recharts -w frontend` (lightweight, React-native)

- [ ] **Step 5: Create admin dashboard page**

Fetches `/api/stats/overview`, `/api/stats/views`, `/api/stats/messages` via Axios (client-side, needs auth).

- 4 StatCards in a row
- Views chart (30 days)
- Messages chart
- 5 most recent unread messages (quick links to /admin/messages)

- [ ] **Step 6: Commit**

```bash
git add frontend/src/app/admin/ frontend/src/components/admin/
git commit -m "feat: admin layout with dashboard, stats, and charts"
```

---

### Task 21: Admin messages page

**Files:**
- Create: `frontend/src/app/admin/messages/page.tsx`
- Create: `frontend/src/components/admin/DataTable.tsx`

- [ ] **Step 1: Create reusable `DataTable` component**

Props:
- `columns: { key, label, render? }[]`
- `data: any[]`
- `pagination: PaginationInfo`
- `onPageChange(page)`
- `onRowClick?(row)`
- `actions?: (row) => ReactNode`

Renders a styled table with:
- Void-surface header row
- Gold border-bottom on rows
- Hover highlight
- Pagination controls at bottom

- [ ] **Step 2: Create messages admin page**

- Filter tabs: All / Unread / Read
- DataTable with columns: date (formatted), name, email, phone, excerpt (first 50 chars), status (dot indicator)
- Click row → expand to show full message content (accordion animation)
- Row actions: toggle read/unread button, delete button (with confirmation)
- Pagination (20 per page)
- Fetches from `/api/contact` with query params

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/admin/messages/ frontend/src/components/admin/DataTable.tsx
git commit -m "feat: admin messages page with DataTable, filters, and pagination"
```

---

### Task 22: Admin CRUD pages (Projects, Skills, Services, Testimonials)

**Files:**
- Create: `frontend/src/app/admin/projects/page.tsx`
- Create: `frontend/src/app/admin/skills/page.tsx`
- Create: `frontend/src/app/admin/services/page.tsx`
- Create: `frontend/src/app/admin/testimonials/page.tsx`
- Create: `frontend/src/components/admin/FormModal.tsx`

- [ ] **Step 1: Create reusable `FormModal` component**

Props:
- `isOpen`, `onClose`
- `title` (string)
- `fields: { name, label, type, options?, required?, validation? }[]`
- `initialValues?` (for edit mode)
- `onSubmit(data)`

Renders a modal overlay with:
- Void-elevated background
- Form with Input components (`.input-void`)
- Zod validation via react-hook-form
- Submit (`.btn-gold`) and Cancel (`.btn-ghost-gold`) buttons
- Close on Escape and overlay click

- [ ] **Step 2: Create Projects admin page**

- DataTable: image thumbnail, title, tags (pills), featured (gold dot), sortOrder
- "Add Project" button → FormModal with: title, description, longDescription, imageUrl, liveUrl, githubUrl, tags (multi-input), featured toggle, sortOrder
- Row edit → same FormModal pre-filled
- Row delete → confirmation dialog
- CRUD operations via `api.projects.*`

- [ ] **Step 3: Create Skills admin page**

- DataTable: name, level (LevelDots), category, status, sortOrder
- FormModal: name, level (1-4 slider/select), icon, category (dropdown: FRONTEND/BACKEND/DEVOPS/DESIGN/OTHER), status (PROFICIENT/EXPLORING), sortOrder

- [ ] **Step 4: Create Services admin page**

- DataTable: title, description (truncated), icon, sortOrder
- FormModal: title, description, icon, sortOrder

- [ ] **Step 5: Create Testimonials admin page**

- DataTable: name, role, company, content (truncated), sortOrder
- FormModal: name, role, company, content, avatarUrl, sortOrder

- [ ] **Step 6: Verify all CRUD operations**

Create, edit, and delete an item in each admin page. Verify changes reflect on the public homepage (after ISR revalidation or hard refresh).

- [ ] **Step 7: Commit**

```bash
git add frontend/src/app/admin/ frontend/src/components/admin/FormModal.tsx
git commit -m "feat: admin CRUD pages for projects, skills, services, testimonials"
```

---

## Chunk 6: User Dashboard, SEO & Polish

### Task 23: User dashboard

**Files:**
- Create: `frontend/src/app/dashboard/page.tsx`
- Create: `frontend/src/app/dashboard/layout.tsx`

- [ ] **Step 1: Create dashboard layout**

Simple layout with StatusBar (no ChapterBar). Centered content area. Back to home link.

- [ ] **Step 2: Create dashboard page**

Client component, uses `useAuth()`:

- Profile section: display user info (name, email, phone, avatar)
- Edit profile form (inline editing or modal)
- UserData section: list of stored key-value pairs (if any)
- "Delete my account" button (with confirmation) — calls API to delete user

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/dashboard/
git commit -m "feat: user dashboard with profile editing"
```

---

### Task 24: SEO — sitemap, robots, metadata

**Files:**
- Create: `frontend/src/app/sitemap.ts`
- Create: `frontend/src/app/robots.ts`
- Modify: `frontend/src/app/layout.tsx` (enhance metadata)

- [ ] **Step 1: Create `frontend/src/app/sitemap.ts`**

```typescript
import { MetadataRoute } from 'next';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://tombp.fr';

  // Fetch projects for dynamic URLs
  const res = await fetch(`${process.env.API_URL || 'http://localhost:4000'}/api/projects`);
  const { data: projects } = await res.json();

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: 'weekly', priority: 1 },
    { url: `${baseUrl}/login`, changeFrequency: 'monthly', priority: 0.3 },
    { url: `${baseUrl}/register`, changeFrequency: 'monthly', priority: 0.3 },
  ];
}
```

- [ ] **Step 2: Create `frontend/src/app/robots.ts`**

```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/dashboard/'],
    },
    sitemap: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://tombp.fr'}/sitemap.xml`,
  };
}
```

- [ ] **Step 3: Enhance root layout metadata**

Add comprehensive Open Graph, Twitter Card, and JSON-LD Person schema to the root layout. Also add JSON-LD CreativeWork schema to the Projects section component (each project gets structured data for SEO).

- [ ] **Step 4: Commit**

```bash
git add frontend/src/app/sitemap.ts frontend/src/app/robots.ts frontend/src/app/layout.tsx
git commit -m "feat: SEO — sitemap, robots.txt, enhanced metadata with JSON-LD"
```

---

### Task 25: Dark/Light mode integration into root layout

**Files:**
- Modify: `frontend/src/app/layout.tsx`

Note: ThemeContext, useTheme hook, and ThemeToggle were already created in Task 10.

- [ ] **Step 1: Add ThemeProvider to root layout**

Wrap children in `ThemeProvider` (inside `AuthProvider`). Ensure the root `<html>` element gets the `data-theme` attribute.

- [ ] **Step 2: Verify theme toggle end-to-end**

Click toggle in StatusBar → entire site switches between dark and light including all sections, admin, and auth pages. Refresh → preference persisted.

- [ ] **Step 3: Commit**

```bash
git add frontend/src/app/layout.tsx
git commit -m "feat: wire dark/light mode ThemeProvider into root layout"
```

---

### Task 26: 404 page & final polish

**Files:**
- Create: `frontend/src/app/not-found.tsx`
- Modify: various files for final polish

- [ ] **Step 1: Create 404 page**

Void & Gold styled "Page Not Found" with:
- Large "404" display text
- Subtitle "This page doesn't exist"
- CTA to go home

- [ ] **Step 2: Responsive pass**

Check all pages at mobile breakpoints (375px, 768px, 1024px):
- StatusBar collapses to hamburger on mobile
- ChapterBar hides labels, shows dots on mobile
- Admin sidebar becomes a top drawer on mobile
- Contact form stacks vertically
- Skills grid goes to single column

- [ ] **Step 3: Accessibility pass**

- Add `aria-label` to icon-only buttons
- Ensure form labels are associated with inputs
- Check color contrast (gold on dark should pass WCAG AA)
- Add `role="navigation"` to StatusBar and ChapterBar
- Ensure keyboard navigation works for modals

- [ ] **Step 4: Commit**

```bash
git add .
git commit -m "feat: 404 page, responsive design, and accessibility improvements"
```

---

### Task 27: Update CLAUDE.md & README

**Files:**
- Modify: `CLAUDE.md`
- Create: `README.md`

- [ ] **Step 1: Update `CLAUDE.md`**

Replace content with updated project structure reflecting the new monorepo:
- New directory structure (frontend/, backend/, docker-compose)
- Updated build commands (npm workspaces)
- Updated tech stack
- Keep design system guidelines relevant to new tokens

- [ ] **Step 2: Create `README.md`**

- Project description
- Tech stack overview
- Prerequisites (Node.js 20+, Docker)
- First launch workflow (from spec)
- Available scripts
- Project structure

- [ ] **Step 3: Commit**

```bash
git add CLAUDE.md README.md
git commit -m "docs: update CLAUDE.md and add README for new monorepo structure"
```

---

## Task Dependency Graph

```
Task 1 (monorepo) → Task 2 (backend setup) → Task 3 (utils/middleware) → Task 4 (auth) → Task 5 (contact) → Task 6 (CRUD) → Task 7 (users/stats) → Task 8 (seed)
                                                                                                                                                              ↓
Task 9 (Next.js setup) → Task 10 (UI components) → Task 11 (layout) → Task 12 (Three.js)                                                              Task 8
        ↓                                                    ↓                                                                                              ↓
Task 13 (API client/auth) → Task 14 (auth pages) → Task 15 (middleware)                                                                          Task 16 (homepage)
                                                                                                                                                     ↓
                                                                                                                            Task 17 → Task 18 → Task 19 (sections)
                                                                                                                                                     ↓
                                                                                                                            Task 20 → Task 21 → Task 22 (admin)
                                                                                                                                                     ↓
                                                                                                                            Task 23 → Task 24 → Task 25 → Task 26 → Task 27
```

**Parallelizable groups:**
- Tasks 1-8 (backend) can be done sequentially as a block
- Tasks 9-12 (frontend setup) can start after Task 1 (need monorepo) but are independent of backend tasks 3-8
- Tasks 13-15 (frontend auth) need Task 4 (backend auth) to be working
- Tasks 16-19 (homepage sections) need Tasks 8 (seed data) + 11 (layout components) + 12 (Three.js)
- Tasks 20-22 (admin) need Task 7 (stats routes) + Task 13 (API client)
- Tasks 23-27 (polish) are sequential and come last

**Critical path:** 1 → 2 → 3 → 4 → 8 → 16 → 19 → 22 → 27
