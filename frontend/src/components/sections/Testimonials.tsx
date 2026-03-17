"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { VoidPanel } from "@/components/ui/VoidPanel";
import type { Testimonial } from "@/types";

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

interface TestimonialsProps {
  testimonials: Testimonial[];
}

export function Testimonials({ testimonials }: TestimonialsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="px-8 md:px-16 lg:px-24 py-24">
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="max-w-5xl mx-auto"
      >
        <motion.div custom={0} variants={fadeUp}>
          <SectionLabel>Testimonials</SectionLabel>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <motion.div
              key={testimonial.id}
              custom={index + 1}
              variants={fadeUp}
            >
              <VoidPanel className="p-6 h-full flex flex-col">
                <span className="text-gold text-3xl opacity-30 leading-none">
                  ❝
                </span>

                <p className="mt-3 text-text-secondary italic leading-relaxed flex-1">
                  {testimonial.content}
                </p>

                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                  <p className="font-display font-semibold text-text-primary">
                    {testimonial.name}
                  </p>
                  <p className="hud-caption text-text-dim">
                    {testimonial.role}
                    {testimonial.company && ` · ${testimonial.company}`}
                  </p>
                </div>
              </VoidPanel>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
