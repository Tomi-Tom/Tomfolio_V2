"use client";

import Link from "next/link";
import { StatusBar } from "@/components/layout/StatusBar";
import { HUDFrame } from "@/components/layout/HUDFrame";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <StatusBar />
      <HUDFrame />

      {/* Subtle background pattern */}
      <div
        className="fixed inset-0 pointer-events-none opacity-[0.015] -z-10"
        aria-hidden
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--gold) 1px, transparent 1px)",
          backgroundSize: "50px 50px",
        }}
      />

      {/* Subtle gold radial glow at top */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] pointer-events-none -z-10"
        style={{
          background: "radial-gradient(ellipse, rgba(212,175,55,0.04) 0%, transparent 70%)",
        }}
      />

      <div className="max-w-3xl mx-auto px-6 py-28">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gold hover:text-[var(--text-primary)] transition-colors group mb-10"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:-translate-x-1"
          >
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          <span className="font-display text-[0.7rem] font-semibold tracking-[0.15em] uppercase">
            Back to portfolio
          </span>
        </Link>
        {children}
      </div>
    </>
  );
}
