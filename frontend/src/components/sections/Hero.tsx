"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { useCountUp } from "@/hooks/useCountUp";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      delay: 0.3 + i * 0.12,
      ease: [0.65, 0, 0.35, 1] as const,
    },
  }),
};

// chevronBounce is applied directly via animate prop, not variants

export function Hero() {
  const statsRef = useRef(null);
  const statsInView = useInView(statsRef, { once: true });
  const projectCount = useCountUp(50, 2000, statsInView);

  return (
    <div className="relative min-h-screen flex flex-col justify-center px-8 md:px-16 lg:px-24">
      {/* Subtle radial glow behind hero */}
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        aria-hidden
      >
        <div className="absolute top-1/3 left-1/4 w-[600px] h-[600px] rounded-full bg-[var(--gold)] opacity-[0.03] blur-[160px]" />
      </div>

      <motion.div initial="hidden" animate="visible" className="relative max-w-5xl">
        <motion.div custom={0} variants={fadeUp}>
          <SectionLabel>Portfolio</SectionLabel>
        </motion.div>

        {/* Name — oversized, with gold shimmer on the dot */}
        <motion.h1
          custom={1}
          variants={fadeUp}
          className="mt-8 font-display leading-[0.9] tracking-tight"
          style={{ fontSize: "clamp(4rem, 12vw, 9rem)" }}
        >
          <span className="font-light text-[var(--text-primary)]">Tom</span>
          <br />
          <span
            className="font-bold"
            style={{
              background:
                "linear-gradient(135deg, var(--text-primary) 60%, var(--gold) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            Bariteau
            <span
              style={{
                background:
                  "linear-gradient(135deg, var(--gold) 0%, #f5d98c 50%, var(--gold) 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              .
            </span>
          </span>
          <br />
          <span className="font-light text-[var(--text-primary)]">Peter</span>
        </motion.h1>

        {/* Tagline */}
        <motion.p
          custom={2}
          variants={fadeUp}
          className="mt-8 text-h3 font-display text-text-secondary font-light tracking-wide"
        >
          UX Designer &amp; Developer
        </motion.p>

        {/* Decorative gold line */}
        <motion.div
          custom={2.5}
          variants={fadeUp}
          className="mt-5 h-px w-24"
          style={{
            background:
              "linear-gradient(90deg, var(--gold) 0%, transparent 100%)",
          }}
        />

        {/* Description */}
        <motion.p
          custom={3}
          variants={fadeUp}
          className="mt-6 text-text-secondary max-w-xl text-base leading-relaxed"
        >
          Crafting immersive digital experiences at the intersection of design
          precision and technical craft.
        </motion.p>

        {/* CTA Buttons */}
        <motion.div
          custom={4}
          variants={fadeUp}
          className="mt-10 flex gap-5 flex-wrap items-center"
        >
          <Button
            variant="gold"
            className="px-10 py-3 text-sm tracking-widest"
            onClick={() =>
              document
                .getElementById("projects")
                ?.scrollIntoView({ behavior: "smooth" })
            }
          >
            View Work
          </Button>
          <a
            href="/assets/CV_TOM BARITEAU-PETER_EN.pdf"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-ghost-gold"
          >
            Download CV &rarr;
          </a>
        </motion.div>

        {/* Stats with gold vertical dividers */}
        <motion.div
          ref={statsRef}
          custom={5}
          variants={fadeUp}
          className="mt-16 flex items-center gap-0"
        >
          {/* Stat: Projects */}
          <div className="pr-8">
            <p className="font-display font-bold text-2xl text-gold tabular-nums">
              {projectCount}+
            </p>
            <p className="hud-caption text-text-dim mt-1 uppercase tracking-widest text-[0.65rem]">
              Projects
            </p>
          </div>

          {/* Gold divider */}
          <div className="w-px h-10 bg-gradient-to-b from-transparent via-[var(--gold)] to-transparent opacity-40" />

          {/* Stat: Experience */}
          <div className="px-8">
            <p className="font-display font-bold text-2xl text-text-primary">
              5yr
            </p>
            <p className="hud-caption text-text-dim mt-1 uppercase tracking-widest text-[0.65rem]">
              Experience
            </p>
          </div>

          {/* Gold divider */}
          <div className="w-px h-10 bg-gradient-to-b from-transparent via-[var(--gold)] to-transparent opacity-40" />

          {/* Stat: Languages */}
          <div className="pl-8">
            <p className="font-display font-bold text-2xl text-text-primary">
              FR&middot;EN
            </p>
            <p className="hud-caption text-text-dim mt-1 uppercase tracking-widest text-[0.65rem]">
              Languages
            </p>
          </div>
        </motion.div>
      </motion.div>

      {/* Scroll-down indicator */}
      <motion.div
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2, duration: 1 }}
      >
        <span className="text-[0.6rem] uppercase tracking-[0.25em] text-text-dim font-display">
          Scroll
        </span>
        <motion.svg
          width="20"
          height="20"
          viewBox="0 0 20 20"
          fill="none"
          className="text-gold"
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        >
          <path
            d="M4 7L10 13L16 7"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </motion.svg>
      </motion.div>
    </div>
  );
}
