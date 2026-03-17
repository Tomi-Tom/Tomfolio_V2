"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { VoidPanel } from "@/components/ui/VoidPanel";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { Service } from "@/types";

interface ServicesProps {
  services: Service[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.3 + i * 0.1,
      ease: [0.65, 0, 0.35, 1] as const,
    },
  }),
};

export function Services({ services }: ServicesProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="px-8 md:px-16 lg:px-24 py-24">
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.div custom={0} variants={fadeUp}>
          <SectionLabel>Services</SectionLabel>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, i) => (
            <motion.div key={service.id} custom={i + 1} variants={fadeUp}>
              <VoidPanel className="p-6 h-full">
                <div className="text-3xl mb-4">
                  {service.icon ?? "✦"}
                </div>
                <h3 className="font-display font-semibold text-lg text-text-primary">
                  {service.title}
                </h3>
                <p className="mt-2 text-text-secondary text-sm">
                  {service.description}
                </p>
                <a
                  href="#contact"
                  className="mt-4 inline-block text-gold hover:text-text-primary transition text-sm"
                >
                  Learn more &rarr;
                </a>
              </VoidPanel>
            </motion.div>
          ))}
        </div>

        {/* ─── Pricing ─── */}
        <motion.div custom={services.length + 2} variants={fadeUp} className="mt-16">
          <SectionLabel>Pricing</SectionLabel>
          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* First engagement */}
            <VoidPanel hoverable={false} className="p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-[var(--gold)] text-black font-display text-[0.6rem] font-semibold tracking-[0.15em] uppercase">
                First project
              </div>
              <p className="hud-caption text-[var(--text-dim)] mb-4">Discovery Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-[3rem] font-bold leading-none text-gold">300</span>
                <div className="flex flex-col">
                  <span className="font-display text-lg text-[var(--text-primary)]">&euro;</span>
                  <span className="hud-caption text-[var(--text-dim)]">/ day</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-[var(--text-secondary)]">
                Preferential rate for our first collaboration. Ideal for an initial project, audit, or proof of concept.
              </p>
              <ul className="mt-4 space-y-2">
                {["First project together", "Full commitment & quality", "No hidden fees"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="w-1 h-1 rounded-full bg-gold shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className="btn-gold inline-block mt-6"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Get started
              </a>
            </VoidPanel>

            {/* Standard rate */}
            <VoidPanel hoverable={false} className="p-8 border-[var(--gold-dim)] relative overflow-hidden">
              <div className="absolute top-0 right-0 px-3 py-1 bg-[var(--gold-dim)] text-black font-display text-[0.6rem] font-semibold tracking-[0.15em] uppercase">
                Standard
              </div>
              <p className="hud-caption text-[var(--text-dim)] mb-4">Standard Rate</p>
              <div className="flex items-baseline gap-2">
                <span className="font-display text-[3rem] font-bold leading-none text-gold">450</span>
                <div className="flex flex-col">
                  <span className="font-display text-lg text-[var(--text-primary)]">&euro;</span>
                  <span className="hud-caption text-[var(--text-dim)]">/ day</span>
                </div>
              </div>
              <p className="mt-4 text-sm text-[var(--text-secondary)]">
                Standard daily rate for ongoing projects. Long-term partnerships and complex builds.
              </p>
              <ul className="mt-4 space-y-2">
                {["Ongoing collaboration", "Priority support", "Flexible engagement"].map((item) => (
                  <li key={item} className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
                    <span className="w-1 h-1 rounded-full bg-gold shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
              <a
                href="#contact"
                className="btn-ghost-gold inline-block mt-6 border border-[var(--gold-dim)]"
                onClick={(e) => {
                  e.preventDefault();
                  document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                Contact me
              </a>
            </VoidPanel>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
