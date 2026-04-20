"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
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
    key: "lifeGame",
    href: "/playground/life-game",
    image: "/assets/GameOfLife.png",
  },
  {
    key: "memory",
    href: "/playground/memory",
    image: "/assets/MemoryGame.png",
  },
  {
    key: "weather",
    href: "/playground/weather",
    image: "/assets/WeatherApp.png",
  },
  {
    key: "pomodoro",
    href: "/playground/pomodoro",
    image: "/assets/PomodoroTimer.png",
  },
  {
    key: "taskBreaker",
    href: "/playground/task-breaker",
    image: "/assets/TaskBreaker.png",
  },
  {
    key: "moodTracker",
    href: "/playground/mood-tracker",
    image: "/assets/MoodTracker.png",
  },
  {
    key: "typingTest",
    href: "/playground/typing-test",
    image: "/assets/TypingTest.png",
  },
  {
    key: "colorPalette",
    href: "/playground/color-palette",
    image: "/assets/ColorPalette.png",
  },
  {
    key: "snake",
    href: "/playground/snake",
    image: "/assets/Snake.png",
  },
  {
    key: "whiteNoise",
    href: "/playground/white-noise",
    image: "/assets/AmbientSounds.png",
  },
  {
    key: "pixelArt",
    href: "/playground/pixel-art",
    image: "/assets/PixelArt.png",
  },
] as const;

export function Playground() {
  const t = useTranslations("playground.intro");
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
        <SectionLabel>
          {t("numbering")} — {t("label")}
        </SectionLabel>
        <h2 className="font-display text-h2 mt-4 mb-4">
          <span className="font-light">{t("headingLight")}</span>{" "}
          <span className="font-bold">{t("headingBold")}</span>
        </h2>
        <p className="text-sm text-[var(--text-secondary)] max-w-lg leading-relaxed">
          {t("description")}
        </p>
      </motion.div>

      {/* Grid of cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {miniApps.map((app, i) => {
          const title = t(`miniApps.${app.key}.title`);
          const description = t(`miniApps.${app.key}.description`);
          const badge = t(`miniApps.${app.key}.badge`);

          return (
            <motion.div
              key={app.key}
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
                      alt={title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[var(--void-surface)] via-transparent to-transparent opacity-60" />
                    <span className="absolute top-3 left-3 inline-block font-display text-[0.55rem] font-semibold tracking-[0.12em] uppercase px-2.5 py-1 bg-black/60 backdrop-blur-sm border border-[var(--border)] text-[var(--gold)]">
                      {badge}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-display text-[1rem] font-semibold text-[var(--text-primary)] group-hover:text-[var(--gold)] transition-colors">
                        {title}
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
                      {description}
                    </p>
                  </div>
                </div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
