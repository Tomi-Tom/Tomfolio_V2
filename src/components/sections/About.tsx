"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { VoidPanel } from "@/components/ui/VoidPanel";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      delay: 0.1 + i * 0.05,
      ease: [0.65, 0, 0.35, 1] as const,
    },
  }),
};

const stats = [
  {
    value: "Epitech Paris",
    label: "Education",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
        <path d="M6 12v5c0 1.1 2.7 3 6 3s6-1.9 6-3v-5" />
      </svg>
    ),
  },
  {
    value: "5+ Years",
    label: "Experience",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <polyline points="12 6 12 12 16 14" />
      </svg>
    ),
  },
  {
    value: "FR / EN",
    label: "Languages",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" />
      </svg>
    ),
  },
  {
    value: "Paris, FR",
    label: "Location",
    icon: (
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
    ),
  },
];

export function About() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });

  return (
    <section ref={ref} className="relative px-8 md:px-16 lg:px-24 py-32 overflow-hidden">
      {/* Decorative mesh pattern (CSS grid dots) */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.03]"
        aria-hidden
        style={{
          backgroundImage: "radial-gradient(circle, var(--gold) 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="relative max-w-5xl mx-auto"
      >
        {/* Section Label + Numbering */}
        <motion.div custom={0} variants={fadeUp} className="flex items-center gap-4">
          <span className="font-display text-[0.7rem] text-gold tracking-[0.3em] uppercase opacity-60">
            01
          </span>
          <SectionLabel>About</SectionLabel>
        </motion.div>

        {/* Quote tagline */}
        <motion.p
          custom={1}
          variants={fadeUp}
          className="mt-6 font-display text-lg md:text-xl text-text-secondary font-light italic tracking-wide"
        >
          &ldquo;Bridging the gap between what looks right and what works right.&rdquo;
        </motion.p>

        {/* Gold accent line */}
        <motion.div
          custom={1.5}
          variants={fadeUp}
          className="mt-4 h-px w-16"
          style={{
            background: "linear-gradient(90deg, var(--gold) 0%, transparent 100%)",
          }}
        />

        <div className="mt-12 flex flex-col md:flex-row gap-12 md:gap-16 items-start">
          {/* Photo area with gold bracket frame */}
          <motion.div custom={2} variants={fadeUp} className="relative shrink-0">
            {/* Gold bracket — top-left */}
            <div className="absolute -top-3 -left-3 w-8 h-8 border-t-2 border-l-2 border-gold opacity-50" />
            {/* Gold bracket — bottom-right */}
            <div className="absolute -bottom-3 -right-3 w-8 h-8 border-b-2 border-r-2 border-gold opacity-50" />

            <div className="aspect-square w-[220px] rounded-sm grayscale bg-surface-elevated overflow-hidden">
              {/* Placeholder gradient shimmer */}
              <div className="w-full h-full bg-gradient-to-br from-[var(--surface-elevated)] to-[var(--void-deep)]" />
            </div>

            {/* Floating label */}
            <div className="absolute -bottom-2 -right-2 bg-[var(--void-deep)] border border-[var(--gold-dim)] px-3 py-1">
              <span className="font-display text-[0.6rem] uppercase tracking-[0.2em] text-gold">
                UX / Dev
              </span>
            </div>
          </motion.div>

          {/* Bio content */}
          <div className="flex-1 space-y-5">
            <motion.p
              custom={3}
              variants={fadeUp}
              className="text-text-secondary leading-[1.8] text-[0.95rem]"
            >
              I&apos;m a UX/UI designer and web developer based in Paris, combining design precision
              with technical craft. I build digital experiences that feel alive — from interactive
              web apps to immersive 3D interfaces.
            </motion.p>

            <motion.p
              custom={4}
              variants={fadeUp}
              className="text-text-secondary leading-[1.8] text-[0.95rem]"
            >
              With a background at Epitech and 5+ years of experience across design systems,
              front-end development, and user research, I bridge the gap between what looks right
              and what works right.
            </motion.p>

            <motion.p
              custom={5}
              variants={fadeUp}
              className="text-text-dim text-sm leading-relaxed border-l-2 border-[var(--gold-dim)] pl-4 italic"
            >
              Currently based in Paris, working at the intersection of design thinking and modern
              web technology.
            </motion.p>
          </div>
        </div>

        {/* Stats Grid — each in a VoidPanel card */}
        <motion.div
          custom={6}
          variants={fadeUp}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4"
        >
          {stats.map((stat) => (
            <VoidPanel key={stat.label} hoverable className="p-5 flex flex-col gap-3">
              <span className="text-gold opacity-60">{stat.icon}</span>
              <p className="font-display font-bold text-base text-text-primary">{stat.value}</p>
              <p className="text-[0.65rem] uppercase tracking-[0.2em] text-text-dim">
                {stat.label}
              </p>
            </VoidPanel>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
