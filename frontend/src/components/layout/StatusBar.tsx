"use client";

import Link from "next/link";
import { useScrollProgress } from "@/hooks/useScrollProgress";
import { useAuth } from "@/hooks/useAuth";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { cn } from "@/lib/utils";

export function StatusBar() {
  const { progress } = useScrollProgress();
  const { user, isAuthenticated, isAdmin, isLoading } = useAuth();

  const bgOpacity = Math.min(progress * 5, 0.95);
  const blurAmount = Math.min(progress * 50, 10);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6",
        "transition-[backdrop-filter] duration-300"
      )}
      style={{
        height: 36,
        background: `rgba(3, 3, 3, ${bgOpacity})`,
        backdropFilter: blurAmount > 0 ? `blur(${blurAmount}px)` : "none",
      }}
    >
      {/* Left: Logo */}
      <Link
        href="/"
        className="font-display text-[0.7rem] font-semibold tracking-[0.18em] uppercase text-[var(--text-primary)] hover:text-[var(--gold)] transition-colors"
      >
        TBP.DEV
      </Link>

      {/* Center: Availability */}
      <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
        <span className="w-[6px] h-[6px] rounded-full bg-[var(--gold)] gold-pulse" />
        <span className="hud-caption text-[var(--gold-dim)]">
          Available for work
        </span>
      </div>

      {/* Right: Theme toggle + Auth */}
      <div className="flex items-center gap-2">
        {!isLoading && (
          isAuthenticated ? (
            <Link
              href={isAdmin ? "/admin" : "/dashboard"}
              className="font-display text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-[var(--gold)] hover:text-[var(--text-primary)] transition-colors"
            >
              {user?.firstName}
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="font-display text-[0.65rem] font-semibold tracking-[0.12em] uppercase text-[var(--gold)] hover:text-[var(--text-primary)] transition-colors"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                className="font-display text-[0.65rem] font-semibold tracking-[0.12em] uppercase px-3 py-1 border border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-black transition-all"
              >
                Register
              </Link>
            </>
          )
        )}
        <ThemeToggle />
      </div>
    </header>
  );
}
