# Tomfolio i18n Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add 6-locale internationalization (en/fr/es/de/zh/ko) to the Tomfolio Next.js 14 portfolio using `next-intl`, with URL prefix routing, browser detection, and a language menu in the StatusBar — all UI strings (main page, 11 playground mini-apps, love-timer, not-found, layout chrome) are translated.

**Architecture:** `next-intl` with `as-needed` locale prefix (default `en` has no prefix). All routes move under `app/[locale]/`. Translations live in `src/i18n/messages/<locale>.json` files organized by section. `LanguageMenu` component sits next to `ThemeToggle` in `StatusBar`. CJK fonts (Noto Sans SC/KR) load conditionally per-locale.

**Tech Stack:** Next.js 14 (App Router), TypeScript, Tailwind CSS, Framer Motion, `next-intl` v3+.

**Spec:** `docs/superpowers/specs/2026-04-20-i18n-design.md`

**Testing model:** This codebase has no Jest/Vitest. The "tests" for each task are: (1) `npm run build` succeeds, (2) `npm run lint` passes, (3) `tsc --noEmit` passes, and (4) manual visual smoke check on `npm run dev` for affected routes. The TDD-style "write failing test first" applies only where a test framework exists; here we substitute "verify the failure mode first" (e.g. confirm the missing key produces the expected dev-mode error before implementing).

---

## Task 1: Install dependencies

**Files:**
- Modify: `package.json`

- [ ] **Step 1: Install next-intl**

Run: `npm install next-intl@^3`

Expected: package added to `dependencies`, `package-lock.json` updated, no peer-dep warnings.

- [ ] **Step 2: Verify install**

Run: `npm ls next-intl`

Expected: shows `next-intl@3.x.x` resolved.

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: add next-intl dependency"
```

---

## Task 2: Create i18n config files

**Files:**
- Create: `src/i18n/routing.ts`
- Create: `src/i18n/request.ts`
- Create: `src/middleware.ts`
- Create: `src/i18n/messages/en.json` (empty `{}` placeholder for now)

- [ ] **Step 1: Create `src/i18n/routing.ts`**

```ts
import { defineRouting } from "next-intl/routing";
import { createNavigation } from "next-intl/navigation";

export const routing = defineRouting({
  locales: ["en", "fr", "es", "de", "zh", "ko"],
  defaultLocale: "en",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];

export const { Link, redirect, usePathname, useRouter, getPathname } =
  createNavigation(routing);
```

- [ ] **Step 2: Create `src/i18n/request.ts`**

```ts
import { getRequestConfig } from "next-intl/server";
import { hasLocale } from "next-intl";
import { routing } from "./routing";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = await requestLocale;
  const locale = hasLocale(routing.locales, requested)
    ? requested
    : routing.defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default,
  };
});
```

- [ ] **Step 3: Create `src/middleware.ts`**

```ts
import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

export default createMiddleware(routing);

export const config = {
  matcher: [
    "/((?!api|_next|_vercel|assets|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|pdf)).*)",
  ],
};
```

- [ ] **Step 4: Create empty `src/i18n/messages/en.json`**

```json
{}
```

- [ ] **Step 5: Update `next.config.mjs` to wire next-intl plugin**

Read the current file. Wrap the existing config with `createNextIntlPlugin`:

```js
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./src/i18n/request.ts");

/** @type {import('next').NextConfig} */
const nextConfig = {
  // existing config preserved as-is
};

export default withNextIntl(nextConfig);
```

- [ ] **Step 6: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

Expected: no errors. (Build will still fail until we move routes; that's Task 3.)

- [ ] **Step 7: Commit**

```bash
git add src/i18n/ src/middleware.ts next.config.mjs
git commit -m "feat(i18n): scaffold next-intl routing, request config, and middleware"
```

---

## Task 3: Move all routes under `app/[locale]/`

**Goal:** Restructure routes without changing any rendered output. The site must still build and render in English exactly as before.

**Files:**
- Move: `src/app/(public)/` → `src/app/[locale]/(public)/`
- Move: `src/app/playground/` → `src/app/[locale]/playground/`
- Move: `src/app/love-timer/` → `src/app/[locale]/love-timer/`
- Move: `src/app/not-found.tsx` → `src/app/[locale]/not-found.tsx`
- Move + transform: `src/app/layout.tsx` → `src/app/[locale]/layout.tsx`
- Keep: `src/app/globals.css`, `src/app/sitemap.ts`, `src/app/robots.ts` (if any) at the root

- [ ] **Step 1: Confirm current build succeeds (baseline)**

Run: `npm run build`

Expected: build completes successfully. Note any warnings to compare against post-move.

- [ ] **Step 2: Create the `[locale]` directory and move routes**

```bash
mkdir -p src/app/[locale]
git mv "src/app/(public)" "src/app/[locale]/(public)"
git mv src/app/playground "src/app/[locale]/playground"
git mv src/app/love-timer "src/app/[locale]/love-timer"
git mv src/app/not-found.tsx "src/app/[locale]/not-found.tsx"
git mv src/app/layout.tsx "src/app/[locale]/layout.tsx"
```

- [ ] **Step 3: Transform `src/app/[locale]/layout.tsx` into a locale-aware Server Component**

Replace the file contents with:

```tsx
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import "../globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { routing } from "@/i18n/routing";

export const metadata: Metadata = {
  title: "Tom Bariteau-Peter — UX Designer & Developer",
  description:
    "Portfolio of Tom Bariteau-Peter, UX/UI designer and web developer based in Seoul. Crafting immersive digital experiences.",
  icons: {
    icon: { url: "/favicon.svg", type: "image/svg+xml" },
  },
  openGraph: {
    title: "Tom Bariteau-Peter — UX Designer & Developer",
    description:
      "Portfolio of Tom Bariteau-Peter, UX/UI designer and web developer based in Seoul.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Tom Bariteau-Peter — UX Designer & Developer",
    description:
      "Portfolio of Tom Bariteau-Peter, UX/UI designer and web developer based in Seoul.",
  },
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  setRequestLocale(locale);

  return (
    <html lang={locale} data-theme="dark" suppressHydrationWarning>
      <body>
        <NextIntlClientProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </NextIntlClientProvider>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Person",
              name: "Tom Bariteau-Peter",
              jobTitle: "UX Designer & Web Developer",
              url: "https://tombp.fr",
              sameAs: ["https://github.com/Tomi-Tom", "https://linkedin.com/in/tom-bariteau-peter"],
              knowsAbout: [
                "UX Design",
                "UI Design",
                "Web Development",
                "React",
                "TypeScript",
                "Three.js",
              ],
            }),
          }}
        />
      </body>
    </html>
  );
}
```

Note the `import "../globals.css"` (one level up since the file is now nested deeper).

- [ ] **Step 4: Run the build**

Run: `npm run build`

Expected: build succeeds. The middleware should now route `/` to `app/[locale]/(public)/page.tsx` with `locale=en`.

If the build complains about missing pages or duplicate routes, double-check that nothing was left in `src/app/` other than `globals.css`, `sitemap.ts`, `favicon.svg` if any, and the new `[locale]/` dir.

- [ ] **Step 5: Smoke check in dev**

Run: `npm run dev`

Visit:
- `http://localhost:3000/` → main portfolio renders (English, no visual change)
- `http://localhost:3000/playground/snake` → snake game renders
- `http://localhost:3000/love-timer` → love timer renders
- `http://localhost:3000/fr/` → URL stays `/fr/`. **Note:** `next-intl` v3 throws in dev when keys are missing. Since `fr.json` doesn't exist yet, `/fr/` will error in dev until Task 15 fills it in. To unblock dev smoke checks earlier, you can temporarily duplicate `en.json` content into the other locale files (or set `getMessageFallback` in `request.ts` to return the key string). Either way is acceptable; the production build is unaffected because no component yet calls `useTranslations`.
- `http://localhost:3000/jp/` → 404 (unsupported locale)

Stop the dev server.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "refactor(i18n): move all routes under app/[locale]/ and wire NextIntlClientProvider"
```

---

## Task 4: Create the `LanguageMenu` component

**Files:**
- Create: `src/components/ui/LanguageMenu.tsx`

- [ ] **Step 1: Create `LanguageMenu.tsx`**

```tsx
"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname } from "@/i18n/routing";
import { routing, type Locale } from "@/i18n/routing";

const LOCALE_META: Record<Locale, { native: string; flag: string; code: string }> = {
  en: { native: "English", flag: "🇬🇧", code: "EN" },
  fr: { native: "Français", flag: "🇫🇷", code: "FR" },
  es: { native: "Español", flag: "🇪🇸", code: "ES" },
  de: { native: "Deutsch", flag: "🇩🇪", code: "DE" },
  zh: { native: "中文", flag: "🇨🇳", code: "ZH" },
  ko: { native: "한국어", flag: "🇰🇷", code: "KO" },
};

export function LanguageMenu() {
  const locale = useLocale() as Locale;
  const pathname = usePathname();
  const router = useRouter();
  const [, startTransition] = useTransition();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const t = useTranslations("common.languageMenu");

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  function switchTo(next: Locale) {
    setOpen(false);
    if (next === locale) return;
    startTransition(() => {
      router.replace(pathname, { locale: next });
    });
  }

  const current = LOCALE_META[locale];

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={t("label")}
        className="p-2 flex items-center gap-1.5 text-[var(--text-secondary)] hover:text-[var(--gold)] transition-colors cursor-pointer"
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
        </svg>
        <span className="font-display text-[0.65rem] tracking-[0.15em]">{current.code}</span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            role="menu"
            initial={{ opacity: 0, scale: 0.95, y: -4 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -4 }}
            transition={{ duration: 0.15, ease: [0.65, 0, 0.35, 1] as const }}
            className="absolute right-0 top-full mt-2 min-w-[180px] bg-[var(--void-deep)] border border-[var(--gold-dim)] shadow-lg overflow-hidden"
          >
            {routing.locales.map((loc) => {
              const meta = LOCALE_META[loc as Locale];
              const isActive = loc === locale;
              return (
                <button
                  key={loc}
                  role="menuitem"
                  type="button"
                  onClick={() => switchTo(loc as Locale)}
                  aria-current={isActive ? "true" : undefined}
                  className={`w-full flex items-center justify-between px-3 py-2 text-left text-xs hover:bg-[var(--surface-elevated)] transition-colors ${
                    isActive ? "text-[var(--gold)]" : "text-[var(--text-secondary)]"
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base leading-none">{meta.flag}</span>
                    <span className="font-display tracking-wide">{meta.native}</span>
                  </span>
                  {isActive && (
                    <span aria-hidden className="text-[var(--gold)]">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

- [ ] **Step 2: Verify TypeScript compiles**

Run: `npx tsc --noEmit`

Expected: passes. (The `useTranslations("common.languageMenu")` call refers to a key that doesn't exist yet — that's a runtime concern, not a compile-time one.)

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/LanguageMenu.tsx
git commit -m "feat(i18n): add LanguageMenu component with dropdown switcher"
```

---

## Task 5: Add LanguageMenu to StatusBar

**Files:**
- Modify: `src/components/layout/StatusBar.tsx`

- [ ] **Step 1: Modify StatusBar to include LanguageMenu**

Replace the right-side block (around lines 40-43):

```tsx
{/* Right: Theme toggle + Language menu */}
<div className="flex items-center gap-1">
  <LanguageMenu />
  <ThemeToggle />
</div>
```

Add the import at the top:

```tsx
import { LanguageMenu } from "@/components/ui/LanguageMenu";
```

- [ ] **Step 2: Smoke check in dev**

Run: `npm run dev`

Visit `http://localhost:3000/`. Confirm:
- The globe + "EN" badge appears next to the theme toggle
- Clicking it opens a dropdown listing all 6 languages (texts may be missing → just keys for now, that's fine)
- Clicking "Français" navigates to `/fr/` (URL updates, page re-renders)
- The active locale shows the gold ✓
- Clicking outside closes the menu
- Escape closes the menu

Stop dev server.

- [ ] **Step 3: Commit**

```bash
git add src/components/layout/StatusBar.tsx
git commit -m "feat(i18n): wire LanguageMenu into StatusBar next to ThemeToggle"
```

---

## Task 6: Populate `en.json` with the FULL key tree (all sections, empty values OK to start)

This task front-loads the schema so subsequent extraction tasks only fill values, never invent keys.

**Files:**
- Modify: `src/i18n/messages/en.json`

- [ ] **Step 1: Write the complete EN message tree**

Open `src/i18n/messages/en.json` and write the full structure with the actual English values for every UI string in the codebase. Read each source file as needed:

- `src/components/layout/StatusBar.tsx` → `statusBar.brandShort`, `statusBar.availability`
- `src/components/layout/ChapterBar.tsx` → `chapterBar.intro`, `.about`, `.skills`, `.services`, `.projects`, `.playground`, `.contact`
- `src/components/layout/Footer.tsx` → all visible text
- `src/components/layout/HUDFrame.tsx` → all visible text
- `src/components/sections/Hero.tsx` → `hero.label`, `.tagline`, `.description`, `.viewWork`, `.downloadCV`, `.scroll`, `.stats.technologies`, `.stats.experience`, `.stats.languages`, `.stats.experienceValue` (`5yr`), `.stats.languagesValue` (`FR·EN`)
- `src/components/sections/About.tsx` → `about.label`, `.numbering` (`01`), `.quote`, `.bio1`, `.bio2`, `.currentLocation`, `.role` (`UX / Dev`), `.stats.education`, `.stats.experience`, `.stats.languages`, `.stats.location`, `.stats.educationValue`, `.stats.experienceValue`, `.stats.languagesValue`, `.stats.locationValue`
- `src/components/sections/Skills.tsx` → all section headings, category names, level captions
- `src/components/sections/Services.tsx` → all service titles + descriptions
- `src/components/sections/Projects.tsx` → all project titles, descriptions, status labels, "View project", "Visit", etc.
- `src/components/sections/Contact.tsx` → form labels, placeholders, button text, success/error messages, social links labels
- `src/components/sections/Playground.tsx` → intro section text
- `src/app/[locale]/playground/<each>/page.tsx` → app titles, button labels, status messages, instructions
- `src/app/[locale]/love-timer/page.tsx` → all visible text
- `src/app/[locale]/not-found.tsx` → all visible text

Use this top-level shape:

```json
{
  "common": {
    "languageMenu": {
      "label": "Language",
      "current": "Current language"
    }
  },
  "statusBar": { },
  "chapterBar": { },
  "hudFrame": { },
  "footer": { },
  "hero": { },
  "about": { "stats": { } },
  "skills": { },
  "services": { },
  "projects": { },
  "contact": { },
  "playground": {
    "intro": { },
    "snake": { },
    "pomodoro": { },
    "memory": { },
    "lifeGame": { },
    "colorPalette": { },
    "moodTracker": { },
    "pixelArt": { },
    "taskBreaker": { },
    "typingTest": { },
    "weather": { },
    "whiteNoise": { }
  },
  "loveTimer": { },
  "notFound": { },
  "metadata": {
    "home": {
      "title": "Tom Bariteau-Peter — UX Designer & Developer",
      "description": "Portfolio of Tom Bariteau-Peter, UX/UI designer and web developer based in Seoul. Crafting immersive digital experiences."
    },
    "playground": {
      "title": "Playground — Tom Bariteau-Peter",
      "description": "Interactive mini-apps and experiments by Tom Bariteau-Peter."
    },
    "loveTimer": {
      "title": "Love Timer",
      "description": "A small love timer."
    }
  }
}
```

Fill every nested object completely with the actual EN strings copied verbatim from each source file.

- [ ] **Step 2: Validate JSON**

Run: `node -e "JSON.parse(require('fs').readFileSync('src/i18n/messages/en.json','utf8'))"`

Expected: no output (valid JSON).

- [ ] **Step 3: Commit**

```bash
git add src/i18n/messages/en.json
git commit -m "feat(i18n): populate en.json with complete UI string tree"
```

---

## Task 7: Wire EN translations into layout chrome (StatusBar, ChapterBar, Footer, HUDFrame, Playground layout)

**Files:**
- Modify: `src/components/layout/StatusBar.tsx`
- Modify: `src/components/layout/ChapterBar.tsx`
- Modify: `src/components/layout/Footer.tsx`
- Modify: `src/components/layout/HUDFrame.tsx`
- Modify: `src/app/[locale]/playground/layout.tsx` (contains the hardcoded "Back to Playground" link — translate via `useTranslations("playground.intro")` using key `backToPlayground`; add the key to `en.json` if missing)

For each file:

- [ ] **Step 1: Add `useTranslations` import**

```tsx
import { useTranslations } from "next-intl";
```

- [ ] **Step 2: Replace hardcoded strings with `t('key')` calls**

Example (StatusBar):
```tsx
const t = useTranslations("statusBar");
// ...
<Link ...>{t("brandShort")}</Link>
<span ...>{t("availability")}</span>
```

Apply the same pattern in `ChapterBar`, `Footer`, `HUDFrame`. Use the keys defined in `en.json` from Task 6.

- [ ] **Step 3: Verify build + smoke check**

Run: `npm run build`
Expected: passes.

Run: `npm run dev`. Visit `/`. Confirm visual output unchanged (still English).
Visit `/fr/`. Confirm strings still appear (still English text since fr.json is empty — keys will show as fallback).

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add src/components/layout/
git commit -m "feat(i18n): replace hardcoded strings in layout components with useTranslations"
```

---

## Task 8: Wire EN translations into Hero section

**Files:**
- Modify: `src/components/sections/Hero.tsx`

- [ ] **Step 1: Add `useTranslations` and replace strings**

At the top of the function:
```tsx
const t = useTranslations("hero");
```

Replace each visible English string. Examples:
- `<SectionLabel>Portfolio</SectionLabel>` → `<SectionLabel>{t("label")}</SectionLabel>`
- `UX Designer &amp; Developer` → `{t("tagline")}`
- The description paragraph → `{t("description")}`
- `View Work` button text → `{t("viewWork")}`
- `Download CV →` → `{t("downloadCV")}` (note: keep the arrow as part of the JSX, not the string, OR include it in the translation if you want localized arrows)
- The three stat captions (`Technologies`, `Experience`, `Languages`) → `t("stats.technologies")`, etc.
- `Scroll` indicator → `t("scroll")`
- The `5yr` value → `t("stats.experienceValue")` (kept untranslated for `en` but can be `5 ans` in `fr`)

The split name spans (`Tom`, `Bariteau`, `.`, `Peter`) stay hardcoded — they are proper nouns per spec.

- [ ] **Step 2: Verify build + dev smoke check on `/`**

Run: `npm run build` then `npm run dev`. Visit `/`. Confirm Hero looks exactly as before.

- [ ] **Step 3: Commit**

```bash
git add src/components/sections/Hero.tsx
git commit -m "feat(i18n): translate Hero section strings"
```

---

## Task 9: Wire EN translations into About, Skills, Services, Projects, Contact, Playground intro sections

**Files:**
- Modify: `src/components/sections/About.tsx`
- Modify: `src/components/sections/Skills.tsx`
- Modify: `src/components/sections/Services.tsx`
- Modify: `src/components/sections/Projects.tsx`
- Modify: `src/components/sections/Contact.tsx`
- Modify: `src/components/sections/Playground.tsx`

For each section file:

- [ ] **Step 1: Apply the same pattern as Hero**

- Add `const t = useTranslations("<sectionName>");`
- Replace every English UI string (excluding tech badges, project names that are proper nouns, brand names) with `t("key")`
- For arrays of objects (like `stats`, `services`, `projects`), use either:
  - A typed array of keys: `["webDev", "uxDesign", ...].map(k => t(`services.${k}.title`))`
  - Or `t.rich()` if HTML markup is needed
- For form validation messages in Contact, use `useTranslations("contact.errors")` and inject into Zod schema

- [ ] **Step 2: After each file, verify build**

Run: `npm run build`
Expected: passes.

- [ ] **Step 3: Smoke check the section in dev**

Run: `npm run dev`. Scroll to the section. Confirm visual unchanged.

- [ ] **Step 4: Commit per section (6 commits total)**

```bash
git add src/components/sections/About.tsx
git commit -m "feat(i18n): translate About section strings"
# repeat for Skills, Services, Projects, Contact, Playground
```

---

## Task 10: Wire EN translations into the 11 playground mini-apps

For each of the 11 mini-apps under `src/app/[locale]/playground/`, repeat the same extraction pattern using namespace `playground.<appName>`.

The 11 apps:
1. `color-palette` → namespace `playground.colorPalette`
2. `life-game` → `playground.lifeGame`
3. `memory` → `playground.memory`
4. `mood-tracker` → `playground.moodTracker`
5. `pixel-art` → `playground.pixelArt`
6. `pomodoro` → `playground.pomodoro`
7. `snake` → `playground.snake`
8. `task-breaker` → `playground.taskBreaker`
9. `typing-test` → `playground.typingTest`
10. `weather` → `playground.weather`
11. `white-noise` → `playground.whiteNoise`

For **each** mini-app:

**Files:**
- Modify: `src/app/[locale]/playground/<app>/page.tsx`

- [ ] **Step 1: Add `useTranslations(<namespace>)` and replace strings**

Hardcoded strings include: app title, button labels (Start/Stop/Reset/Pause/Restart), status messages (Game Over, Win, Loading), instruction text, score/timer captions, units (`min`, `sec`, `°C`).

Numeric values, emojis, color hex codes, and game-state variables stay as-is.

- [ ] **Step 2: Verify build**

Run: `npm run build`

- [ ] **Step 3: Smoke check**

Run: `npm run dev`. Visit `/playground/<app>`. Confirm visual unchanged.

- [ ] **Step 4: Commit per mini-app**

```bash
git add src/app/[locale]/playground/<app>/
git commit -m "feat(i18n): translate <app> mini-app strings"
```

(Total: 11 commits in this task — keep them small.)

---

## Task 11: Wire EN translations into love-timer and not-found

**Files:**
- Modify: `src/app/[locale]/love-timer/page.tsx`
- Modify: `src/app/[locale]/not-found.tsx`

- [ ] **Step 1: Apply the extraction pattern (`useTranslations("loveTimer")` and `useTranslations("notFound")`)**

- [ ] **Step 2: Build + smoke check**

Run: `npm run build`. Visit `/love-timer` and an unknown URL like `/nope` to confirm the 404 page.

- [ ] **Step 3: Commit**

```bash
git add src/app/[locale]/love-timer/ src/app/[locale]/not-found.tsx
git commit -m "feat(i18n): translate love-timer and not-found pages"
```

---

## Task 12: Add localized metadata + hreflang

**Files:**
- Modify: `src/app/[locale]/layout.tsx` (replace static `metadata` with `generateMetadata`)
- Modify: `src/app/[locale]/playground/layout.tsx` if it has metadata (check first)
- Modify: `src/app/[locale]/love-timer/page.tsx` (add `generateMetadata` if it has metadata today)

- [ ] **Step 1: Replace static metadata in `[locale]/layout.tsx`**

Remove the `export const metadata` block. Add:

```tsx
import { getTranslations } from "next-intl/server";

const OG_LOCALE: Record<string, string> = {
  en: "en_US",
  fr: "fr_FR",
  es: "es_ES",
  de: "de_DE",
  zh: "zh_CN",
  ko: "ko_KR",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.home" });

  return {
    title: t("title"),
    description: t("description"),
    icons: { icon: { url: "/favicon.svg", type: "image/svg+xml" } },
    alternates: {
      canonical: locale === "en" ? "/" : `/${locale}`,
      languages: {
        en: "/",
        fr: "/fr",
        es: "/es",
        de: "/de",
        zh: "/zh",
        ko: "/ko",
        "x-default": "/",
      },
    },
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      locale: OG_LOCALE[locale] ?? "en_US",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
  };
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`

- [ ] **Step 3: Smoke check**

Run: `npm run dev`. Visit `/` → view source → confirm `<html lang="en">`, English title, hreflang link tags present. Visit `/fr/` → confirm `<html lang="fr">`, FR title (still EN text until Task 14), hreflang tags present.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/layout.tsx
git commit -m "feat(i18n): add localized metadata and hreflang alternates"
```

---

## Task 13: Update sitemap to emit per-locale URLs

**Files:**
- Modify: `src/app/sitemap.ts`

- [ ] **Step 1: Replace sitemap with locale-aware version**

```ts
import type { MetadataRoute } from "next";
import { routing } from "@/i18n/routing";

const ROUTES = ["", "/playground", "/love-timer"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://tombp.fr";
  const now = new Date();

  return ROUTES.flatMap((route) =>
    routing.locales.map((locale) => {
      const path = locale === routing.defaultLocale ? route : `/${locale}${route}`;
      return {
        url: `${baseUrl}${path || "/"}`,
        lastModified: now,
        changeFrequency: "weekly" as const,
        priority: route === "" ? 1 : 0.7,
        alternates: {
          languages: Object.fromEntries(
            routing.locales.map((l) => [
              l,
              `${baseUrl}${l === routing.defaultLocale ? route : `/${l}${route}`}` || `${baseUrl}/`,
            ])
          ),
        },
      };
    })
  );
}
```

- [ ] **Step 2: Verify build + check sitemap output**

Run: `npm run build && npm run start`

In another shell: `curl -s http://localhost:3000/sitemap.xml | head -60`

Expected: each route × locale combo present, with `<xhtml:link rel="alternate" hreflang="..."/>` entries.

Stop server.

- [ ] **Step 3: Commit**

```bash
git add src/app/sitemap.ts
git commit -m "feat(i18n): emit per-locale sitemap entries with hreflang alternates"
```

---

## Task 14: Add CJK font loading per-locale

**Files:**
- Modify: `src/app/[locale]/layout.tsx`
- Modify: `src/app/globals.css` (only if needed for font-family swap)

- [ ] **Step 1: Add conditional CJK font imports**

In `[locale]/layout.tsx`, above the component:

```tsx
import { Noto_Sans_SC, Noto_Sans_KR } from "next/font/google";

const notoSC = Noto_Sans_SC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-cjk",
  display: "swap",
});
const notoKR = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-cjk",
  display: "swap",
});
```

In the layout body, conditionally apply the font className:

```tsx
const cjkFontClass = locale === "zh" ? notoSC.variable : locale === "ko" ? notoKR.variable : "";

return (
  <html lang={locale} data-theme="dark" suppressHydrationWarning className={cjkFontClass}>
    <body>
      ...
    </body>
  </html>
);
```

- [ ] **Step 2: Update `globals.css` to use `--font-cjk` when available**

Find the `body` font-family rule and adjust:

```css
body {
  font-family: var(--font-cjk, /* existing font stack */);
}
```

(If your existing setup uses Tailwind config for `font-sans`/`font-display`, instead update `tailwind.config.ts` to chain `var(--font-cjk)` first in those families.)

- [ ] **Step 3: Verify build + smoke check**

Run: `npm run build && npm run dev`. Visit `/zh/` and `/ko/`. Open DevTools Network tab — confirm Noto Sans SC loads on `/zh/` only, Noto Sans KR loads on `/ko/` only, and neither loads on `/`, `/fr/`, etc.

Stop dev server.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/layout.tsx src/app/globals.css
git commit -m "feat(i18n): conditionally load Noto Sans SC/KR for zh/ko locales"
```

---

## Task 15: Write `fr.json`, `es.json`, `de.json`, `zh.json`, `ko.json` (full translations)

**Files:**
- Create: `src/i18n/messages/fr.json`
- Create: `src/i18n/messages/es.json`
- Create: `src/i18n/messages/de.json`
- Create: `src/i18n/messages/zh.json`
- Create: `src/i18n/messages/ko.json`

For **each** locale:

- [ ] **Step 1: Copy `en.json` and translate every string**

Translate each value in the `en.json` tree to the target language. Preserve every key path exactly. Do NOT translate:
- Proper nouns: "Tom Bariteau-Peter" (full name including the three Hero spans), "Epitech", "Formspree", "Paris", "Seoul", project brand names
- Tech identifiers: "React", "TypeScript", "Three.js", "Next.js", etc.
- The "FR·EN" and "FR / EN" language stat values (these describe TOM'S spoken languages, not the UI locale)
- File paths in CV download URLs (but the visible "Download CV" label IS translated)
- Email addresses, social handles

Tone calibration: technical, sober, premium. Match the EN tone — concise, slightly formal, no marketing fluff. For ZH and KO, use formal/polite register (敬語 / 존댓말).

Example for `fr.json`:
```json
{
  "common": {
    "languageMenu": { "label": "Langue", "current": "Langue actuelle" }
  },
  "hero": {
    "label": "Portfolio",
    "tagline": "Designer UX & Développeur",
    "description": "Conception d'expériences numériques immersives à l'intersection de la précision du design et de la maîtrise technique.",
    "viewWork": "Voir le travail",
    "downloadCV": "Télécharger CV",
    "scroll": "Défiler",
    "stats": {
      "technologies": "Technologies",
      "experience": "Expérience",
      "languages": "Langues",
      "experienceValue": "5 ans",
      "languagesValue": "FR·EN"
    }
  }
}
```

- [ ] **Step 2: Validate JSON**

Run: `node -e "['fr','es','de','zh','ko'].forEach(l => JSON.parse(require('fs').readFileSync(\`src/i18n/messages/\${l}.json\`,'utf8')))"`

Expected: no errors.

- [ ] **Step 3: Verify build**

Run: `npm run build`

- [ ] **Step 4: Smoke check each locale in dev**

Run: `npm run dev`. Visit each locale URL (`/`, `/fr/`, `/es/`, `/de/`, `/zh/`, `/ko/`). Confirm the homepage renders in the target language (Hero + sections). Look for layout overflow on DE (longest strings) and verify CJK characters render with the correct fonts on `/zh/` and `/ko/`.

Stop dev server.

- [ ] **Step 5: Commit per locale**

```bash
git add src/i18n/messages/fr.json
git commit -m "feat(i18n): add French translations"

git add src/i18n/messages/es.json
git commit -m "feat(i18n): add Spanish translations"

git add src/i18n/messages/de.json
git commit -m "feat(i18n): add German translations"

git add src/i18n/messages/zh.json
git commit -m "feat(i18n): add Simplified Chinese translations"

git add src/i18n/messages/ko.json
git commit -m "feat(i18n): add Korean translations"
```

---

## Task 16: Add key-parity check script

**Files:**
- Create: `scripts/check-i18n-parity.ts`
- Modify: `package.json` (add npm script)

- [ ] **Step 1: Create the script**

```ts
import * as fs from "fs";
import * as path from "path";

const LOCALES = ["en", "fr", "es", "de", "zh", "ko"] as const;
const MESSAGES_DIR = path.join(__dirname, "..", "src", "i18n", "messages");

function flattenKeys(obj: Record<string, unknown>, prefix = ""): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const full = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) {
      keys.push(...flattenKeys(v as Record<string, unknown>, full));
    } else {
      keys.push(full);
    }
  }
  return keys;
}

const en = JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, "en.json"), "utf8"));
const enKeys = new Set(flattenKeys(en));

let hasError = false;
for (const locale of LOCALES) {
  if (locale === "en") continue;
  const data = JSON.parse(fs.readFileSync(path.join(MESSAGES_DIR, `${locale}.json`), "utf8"));
  const keys = new Set(flattenKeys(data));

  const missing = [...enKeys].filter((k) => !keys.has(k));
  const extra = [...keys].filter((k) => !enKeys.has(k));

  if (missing.length || extra.length) {
    hasError = true;
    console.error(`\n[${locale}.json]`);
    if (missing.length) console.error(`  MISSING (${missing.length}):`, missing.slice(0, 20));
    if (extra.length) console.error(`  EXTRA (${extra.length}):`, extra.slice(0, 20));
  }
}

if (hasError) {
  console.error("\nKey parity check failed.");
  process.exit(1);
}
console.log("All locale files match en.json key set.");
```

- [ ] **Step 2: Add npm script to `package.json`**

In `scripts`:
```json
"check:i18n": "tsx scripts/check-i18n-parity.ts"
```

Install `tsx` as a dev dependency:

Run: `npm install -D tsx`

- [ ] **Step 3: Run the check**

Run: `npm run check:i18n`

Expected: "All locale files match en.json key set." If keys are out of sync, fix them and re-run until clean.

- [ ] **Step 4: Commit**

```bash
git add scripts/check-i18n-parity.ts package.json package-lock.json
git commit -m "chore(i18n): add key-parity check script"
```

---

## Task 17: Final smoke check, lint, build

- [ ] **Step 1: Lint**

Run: `npm run lint`
Expected: passes.

- [ ] **Step 2: TypeScript check**

Run: `npx tsc --noEmit`
Expected: passes.

- [ ] **Step 3: Production build**

Run: `npm run build`
Expected: passes, all 6 locales × all routes statically generated.

- [ ] **Step 4: Manual smoke checklist**

Run: `npm run start` (production server).

For each locale (`/`, `/fr/`, `/es/`, `/de/`, `/zh/`, `/ko/`):
- [ ] Homepage renders in correct language (Hero, About, Skills, Services, Projects, Playground intro, Contact)
- [ ] No untranslated EN strings visible (other than proper nouns)
- [ ] Theme toggle works
- [ ] Language menu cycles correctly
- [ ] Switching language while on `/playground/snake` lands on `/<locale>/playground/snake` (path preserved)
- [ ] Visit `/playground/snake`, `/playground/pomodoro`, etc. — translated
- [ ] Visit `/love-timer/` — translated
- [ ] Visit `/<locale>/nope` (unknown route) — 404 page in that locale
- [ ] On `/zh/` and `/ko/`, confirm CJK font is loaded (DevTools → Network → Font)
- [ ] On `/de/`, scan Hero stats and CTA buttons for layout overflow; fix with tighter Tailwind classes if needed
- [ ] View source on `/`: confirm `<html lang="en">`, English `<title>`, hreflang `<link>` tags for all 6 locales
- [ ] Same on `/fr/` etc.

Stop server.

- [ ] **Step 5: Final cleanup commit (only if needed)**

If the smoke check surfaced any layout or wording fixes, group them into a single follow-up commit:

```bash
git add -A
git commit -m "fix(i18n): smoke-test follow-ups (layout/wording)"
```

---

## Done

The site is now fully internationalized in 6 languages. The release-ready work is committed in atomic, reviewable steps.
