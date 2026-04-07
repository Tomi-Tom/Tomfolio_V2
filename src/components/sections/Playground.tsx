"use client";

import Link from "next/link";
import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { SectionLabel } from "@/components/ui/SectionLabel";

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

const miniApps = [
  {
    title: "Game of Life",
    desc: "Conway's cellular automaton — watch patterns evolve",
    badge: "Game",
    href: "/playground/life-game",
    image: "/assets/GameOfLife.png",
  },
  {
    title: "Memory Game",
    desc: "Card-matching challenge with 3 difficulty levels",
    badge: "Game",
    href: "/playground/memory",
    image: "/assets/MemoryGame.png",
  },
  {
    title: "Weather App",
    desc: "Live weather conditions around the world",
    badge: "Utility",
    href: "/playground/weather",
    image: "/assets/WeatherApp.png",
  },
  {
    title: "Pomodoro Timer",
    desc: "Focus time management with circular progress",
    badge: "Utility",
    href: "/playground/pomodoro",
    image: "/assets/PomodoroTimer.png",
  },
  {
    title: "Task Breaker",
    desc: "Break overwhelming tasks into small steps",
    badge: "ADHD Tool",
    href: "/playground/task-breaker",
    image: "/assets/TaskBreaker.png",
  },
  {
    title: "Mood Tracker",
    desc: "Track mood, energy & focus with insights",
    badge: "ADHD Tool",
    href: "/playground/mood-tracker",
    image: "/assets/MoodTracker.png",
  },
  {
    title: "Typing Speed Test",
    desc: "Test your WPM with real-time accuracy tracking",
    badge: "Game",
    href: "/playground/typing-test",
    image: "/assets/TypingTest.png",
  },
  {
    title: "Color Palette",
    desc: "Generate harmonious palettes with 5 modes",
    badge: "Design Tool",
    href: "/playground/color-palette",
    image: "/assets/ColorPalette.png",
  },
  {
    title: "Snake",
    desc: "Classic arcade game with gold aesthetics",
    badge: "Game",
    href: "/playground/snake",
    image: "/assets/Snake.png",
  },
  {
    title: "Ambient Sounds",
    desc: "8-channel white noise mixer for deep focus",
    badge: "Focus Tool",
    href: "/playground/white-noise",
    image: "/assets/AmbientSounds.png",
  },
  {
    title: "Pixel Art Editor",
    desc: "Draw, fill, undo & export pixel artwork",
    badge: "Creative",
    href: "/playground/pixel-art",
    image: "/assets/PixelArt.png",
  },
];

export function Playground() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-20px" });

  return (
    <div ref={ref} className="max-w-7xl mx-auto">
      {/* Section header */}
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate={inView ? "visible" : "hidden"}
        className="mb-12"
      >
        <SectionLabel>06 — Playground</SectionLabel>
        <h2 className="font-display text-h2 mt-4 mb-4">
          <span className="font-light">Interactive</span>{" "}
          <span className="font-bold">Experiments</span>
        </h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-lg leading-relaxed">
          Mini-applications exploring UI patterns, game logic, and productivity tools — built with
          React, Canvas, and Framer Motion.
        </p>
      </motion.div>

      {/* Grid of cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {miniApps.map((app, i) => (
          <motion.div
            key={app.title}
            custom={i + 1}
            variants={fadeUp}
            initial="hidden"
            animate={inView ? "visible" : "hidden"}
          >
            <Link href={app.href} className="group block">
              <div className="void-panel overflow-hidden transition-all duration-300 group-hover:border-[var(--border-active)]">
                {/* Image preview */}
                <div className="relative aspect-video overflow-hidden bg-[var(--void-deep)]">
                  <img
                    src={app.image}
                    alt={app.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[var(--void-surface)] via-transparent to-transparent opacity-60" />
                  <span className="absolute top-3 left-3 inline-block font-display text-[0.55rem] font-semibold tracking-[0.12em] uppercase px-2.5 py-1 bg-black/60 backdrop-blur-sm border border-[var(--border)] text-[var(--gold)]">
                    {app.badge}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-display text-[1rem] font-semibold text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors">
                      {app.title}
                    </h3>
                    <motion.svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="text-[var(--text-dim)] group-hover:text-[var(--gold)] transition-colors"
                    >
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </motion.svg>
                  </div>
                  <p className="text-[0.8rem] text-[var(--text-secondary)] leading-relaxed">
                    {app.desc}
                  </p>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
