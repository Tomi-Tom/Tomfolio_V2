"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/lib/utils";

const navLinks = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/messages", label: "Messages" },
  { href: "/admin/client-projects", label: "Client Projects" },
  { href: "/admin/projects", label: "Projects" },
  { href: "/admin/skills", label: "Skills" },
  { href: "/admin/services", label: "Services" },
  { href: "/admin/testimonials", label: "Testimonials" },
];

export function AdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/admin" ? pathname === "/admin" : pathname.startsWith(href);

  const sidebar = (
    <div className="flex flex-col h-full bg-[var(--void-surface)] border-r border-[var(--border)]">
      {/* Logo */}
      <div className="flex items-center gap-2 px-6 py-5 border-b border-[var(--border)]">
        <Link href="/admin" className="font-display text-h4 text-text-primary tracking-tight">
          TBP<span className="text-gold">.</span>DEV
        </Link>
        <span className="text-[0.6rem] font-semibold uppercase tracking-widest bg-gold/10 text-gold px-2 py-0.5 rounded">
          Admin
        </span>
      </div>

      {/* Nav links */}
      <nav className="flex-1 py-4">
        {navLinks.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "block px-6 py-2.5 text-sm transition-colors border-l-2",
              isActive(link.href)
                ? "text-gold border-gold bg-gold/5"
                : "text-[var(--text-dim)] border-transparent hover:text-text-primary hover:bg-white/5",
            )}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Logout */}
      <div className="border-t border-[var(--border)] p-4">
        <button
          onClick={() => logout()}
          className="w-full text-left px-2 py-2 text-sm text-[var(--text-dim)] hover:text-red-400 transition-colors"
        >
          Logout
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-12 left-4 z-50 md:hidden p-2 rounded bg-[var(--void-surface)] border border-[var(--border)]"
        aria-label="Toggle sidebar"
      >
        <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor" className="text-text-primary">
          {mobileOpen ? (
            <path d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" />
          ) : (
            <path d="M3 5h14a1 1 0 100-2H3a1 1 0 000 2zm0 6h14a1 1 0 100-2H3a1 1 0 000 2zm0 6h14a1 1 0 100-2H3a1 1 0 000 2z" />
          )}
        </svg>
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transition-transform md:hidden",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {sidebar}
      </aside>

      {/* Desktop sidebar */}
      <aside className="hidden md:block w-64 shrink-0">
        {sidebar}
      </aside>
    </>
  );
}
