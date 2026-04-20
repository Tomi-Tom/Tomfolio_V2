"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { useRouter, usePathname, routing, type Locale } from "@/i18n/routing";

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
