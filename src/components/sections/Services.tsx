"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { VoidPanel } from "@/components/ui/VoidPanel";
import { SectionLabel } from "@/components/ui/SectionLabel";

interface Service {
  id: string;
  title: string;
  description: string;
  icon: string;
}

const services: Service[] = [
  {
    id: "ux-design",
    title: "UX / UI Design",
    description:
      "User-centred interfaces crafted through research, wireframing, and iterative prototyping. From design systems to polished, production-ready mockups.",
    icon: "🎨",
  },
  {
    id: "web-dev",
    title: "Web Development",
    description:
      "Performant, accessible web applications built with modern frameworks — React, Next.js, TypeScript — and best-practice architecture.",
    icon: "⚡",
  },
  {
    id: "3d-interactive",
    title: "3D & Interactive",
    description:
      "Immersive experiences with Three.js and WebGL. From subtle ambient scenes to full interactive 3D visualisations.",
    icon: "🌐",
  },
  {
    id: "consulting",
    title: "Consulting & Audit",
    description:
      "Technical audits, UX reviews, and strategic advice to improve your existing product's performance, accessibility, and user experience.",
    icon: "🔍",
  },
];

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

export function Services() {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });

  return (
    <section ref={ref} className="px-8 md:px-16 lg:px-24 py-24">
      <motion.div initial="hidden" animate={isInView ? "visible" : "hidden"}>
        <motion.div custom={0} variants={fadeUp}>
          <SectionLabel>Services</SectionLabel>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, i) => (
            <motion.div key={service.id} custom={i + 1} variants={fadeUp}>
              <VoidPanel className="p-0 h-full overflow-hidden group">
                {/* Gold gradient top border */}
                <div className="h-1 w-full bg-gradient-to-r from-[var(--gold-dim)] via-[var(--gold)] to-[var(--gold-dim)]" />

                <div className="p-8">
                  {/* Icon circle */}
                  <div className="w-14 h-14 rounded-full border-2 border-[var(--gold-dim)] flex items-center justify-center text-2xl mb-6 group-hover:border-[var(--gold)] transition-colors duration-300 bg-[rgba(212,175,55,0.05)]">
                    {service.icon}
                  </div>

                  <h3 className="font-display font-semibold text-lg text-text-primary tracking-wide">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-text-secondary text-sm leading-relaxed">
                    {service.description}
                  </p>
                  <a
                    href="#contact"
                    className="mt-6 inline-flex items-center gap-2 text-gold hover:text-text-primary transition-colors duration-300 text-sm font-medium group/link"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    Learn more
                    <span className="inline-block transition-transform duration-300 group-hover/link:translate-x-1">
                      &rarr;
                    </span>
                  </a>
                </div>
              </VoidPanel>
            </motion.div>
          ))}
        </div>

        {/* --- Pricing --- */}
        <motion.div custom={services.length + 2} variants={fadeUp} className="mt-20">
          <SectionLabel>Pricing</SectionLabel>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* First engagement — Recommended */}
            <VoidPanel
              hoverable={false}
              className="p-0 relative overflow-hidden border-[var(--gold-dim)]"
            >
              <div className="h-1 w-full bg-gradient-to-r from-[var(--gold-dim)] via-[var(--gold)] to-[var(--gold-dim)]" />

              <div className="absolute top-3 right-0">
                <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[var(--gold)] to-[#c9a027] text-black font-display text-[0.65rem] font-bold tracking-[0.15em] uppercase rounded-l-full shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  Recommended
                </div>
              </div>

              <div className="p-10 pt-8">
                <p className="hud-caption text-[var(--text-dim)] mb-6 tracking-[0.2em]">
                  Discovery Rate
                </p>
                <div className="flex items-baseline gap-3">
                  <span
                    className="font-display text-[3.5rem] font-bold leading-none text-gold"
                    style={{
                      textShadow: "0 0 30px rgba(212,175,55,0.4), 0 0 60px rgba(212,175,55,0.15)",
                    }}
                  >
                    300
                  </span>
                  <div className="flex flex-col">
                    <span className="font-display text-xl text-[var(--gold)]">&euro;</span>
                    <span className="hud-caption text-[var(--text-dim)]">/ day</span>
                  </div>
                </div>
                <p className="mt-6 text-sm text-[var(--text-secondary)] leading-relaxed">
                  Preferential rate for our first collaboration. Ideal for an initial project,
                  audit, or proof of concept.
                </p>
                <ul className="mt-6 space-y-3">
                  {["First project together", "Full commitment & quality", "No hidden fees"].map(
                    (item) => (
                      <li
                        key={item}
                        className="flex items-center gap-3 text-sm text-[var(--text-secondary)]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 shadow-[0_0_6px_rgba(212,175,55,0.5)]" />
                        {item}
                      </li>
                    )
                  )}
                </ul>
                <a
                  href="#contact"
                  className="btn-gold inline-block mt-8"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Get started
                </a>
              </div>
            </VoidPanel>

            {/* Standard rate */}
            <VoidPanel hoverable={false} className="p-0 relative overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />

              <div className="absolute top-3 right-0">
                <div className="px-4 py-1.5 bg-[var(--void-elevated)] text-[var(--text-dim)] font-display text-[0.65rem] font-semibold tracking-[0.15em] uppercase rounded-l-full border border-r-0 border-[var(--border)]">
                  Standard
                </div>
              </div>

              <div className="p-10 pt-8">
                <p className="hud-caption text-[var(--text-dim)] mb-6 tracking-[0.2em]">
                  Standard Rate
                </p>
                <div className="flex items-baseline gap-3">
                  <span
                    className="font-display text-[3.5rem] font-bold leading-none text-gold"
                    style={{
                      textShadow: "0 0 20px rgba(212,175,55,0.2)",
                    }}
                  >
                    450
                  </span>
                  <div className="flex flex-col">
                    <span className="font-display text-xl text-[var(--gold-dim)]">&euro;</span>
                    <span className="hud-caption text-[var(--text-dim)]">/ day</span>
                  </div>
                </div>
                <p className="mt-6 text-sm text-[var(--text-secondary)] leading-relaxed">
                  Standard daily rate for ongoing projects. Long-term partnerships and complex
                  builds.
                </p>
                <ul className="mt-6 space-y-3">
                  {["Ongoing collaboration", "Priority support", "Flexible engagement"].map(
                    (item) => (
                      <li
                        key={item}
                        className="flex items-center gap-3 text-sm text-[var(--text-secondary)]"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold-dim)] shrink-0" />
                        {item}
                      </li>
                    )
                  )}
                </ul>
                <a
                  href="#contact"
                  className="btn-ghost-gold inline-block mt-8 border border-[var(--gold-dim)]"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  Contact me
                </a>
              </div>
            </VoidPanel>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
