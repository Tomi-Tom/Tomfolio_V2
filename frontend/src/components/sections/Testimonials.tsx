"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { Testimonial } from "@/types";

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

interface TestimonialsProps {
  testimonials: Testimonial[];
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function GoldStars() {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg
          key={i}
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="var(--gold)"
          className="drop-shadow-[0_0_3px_rgba(212,175,55,0.4)]"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });

  return (
    <section ref={ref} className="px-8 md:px-16 lg:px-24 py-24">
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="max-w-6xl mx-auto"
      >
        <motion.div custom={0} variants={fadeUp}>
          <SectionLabel>Testimonials</SectionLabel>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              custom={index + 1}
              variants={fadeUp}
              className="group"
            >
              <div
                className="void-panel h-full flex flex-col relative overflow-hidden transition-all duration-500 hover:border-[rgba(212,175,55,0.25)]"
                style={{
                  boxShadow: "inset 0 1px 0 rgba(212,175,55,0.1)",
                }}
              >
                {/* Subtle gold top accent */}
                <div className="h-px w-full bg-gradient-to-r from-transparent via-[var(--gold-dim)] to-transparent opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

                {/* Gold glow on hover */}
                <div className="absolute -top-20 -right-20 w-40 h-40 bg-[radial-gradient(circle,rgba(212,175,55,0.06)_0%,transparent_70%)] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

                <div className="p-7 flex flex-col h-full relative">
                  {/* Large decorative quote mark */}
                  <div
                    className="absolute top-4 right-6 font-serif text-[5rem] leading-none text-[var(--gold)] opacity-[0.07] select-none pointer-events-none"
                    aria-hidden="true"
                  >
                    &ldquo;
                  </div>

                  {/* Star rating */}
                  <div className="mb-5">
                    <GoldStars />
                  </div>

                  {/* Quote content */}
                  <p className="text-text-secondary italic leading-relaxed flex-1 relative z-10 text-[0.95rem]">
                    &ldquo;{testimonial.content}&rdquo;
                  </p>

                  {/* Separator */}
                  <div className="mt-6 mb-5 h-px bg-gradient-to-r from-[var(--gold-dim)] via-[var(--border)] to-transparent" />

                  {/* Author info */}
                  <div className="flex items-center gap-4">
                    {/* Avatar with initials */}
                    {testimonial.avatarUrl ? (
                      <img
                        src={testimonial.avatarUrl}
                        alt={testimonial.name}
                        className="w-11 h-11 rounded-full object-cover border-2 border-[var(--gold-dim)]"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-full border-2 border-[var(--gold-dim)] bg-[rgba(212,175,55,0.08)] flex items-center justify-center shrink-0">
                        <span className="font-display text-xs font-bold text-gold tracking-wider">
                          {getInitials(testimonial.name)}
                        </span>
                      </div>
                    )}

                    <div>
                      <p className="font-display font-semibold text-text-primary text-sm tracking-wide">
                        {testimonial.name}
                      </p>
                      <p className="hud-caption text-text-dim mt-0.5">
                        {testimonial.role}
                        {testimonial.company && (
                          <span className="text-[var(--gold-dim)]"> &middot; {testimonial.company}</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
