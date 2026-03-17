"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";

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

const stats = [
  { value: "Epitech Seoul", label: "Education" },
  { value: "5+ Years", label: "Experience" },
  { value: "FR · EN", label: "Languages" },
  { value: "Seoul, KR", label: "Location" },
];

export function About() {
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
          <SectionLabel>About</SectionLabel>
        </motion.div>

        <div className="mt-10 flex flex-col md:flex-row gap-10 md:gap-16 items-start">
          <motion.div
            custom={1}
            variants={fadeUp}
            className="aspect-square max-w-[200px] w-full shrink-0 rounded-sm grayscale outline outline-2 outline-gold bg-surface-elevated"
          />

          <div className="flex-1">
            <motion.p
              custom={2}
              variants={fadeUp}
              className="text-text-secondary leading-relaxed"
            >
              I&apos;m a UX/UI designer and web developer based in Seoul,
              combining design precision with technical craft. I build digital
              experiences that feel alive — from interactive web apps to
              immersive 3D interfaces.
            </motion.p>

            <motion.p
              custom={3}
              variants={fadeUp}
              className="mt-4 text-text-secondary leading-relaxed"
            >
              With a background at Epitech and 5+ years of experience across
              design systems, front-end development, and user research, I bridge
              the gap between what looks right and what works right.
            </motion.p>
          </div>
        </div>

        <motion.div
          custom={4}
          variants={fadeUp}
          className="mt-12 grid grid-cols-2 md:grid-cols-4 gap-6"
        >
          {stats.map((stat) => (
            <div key={stat.label}>
              <p className="font-display font-bold text-lg text-text-primary">
                {stat.value}
              </p>
              <p className="hud-caption text-text-dim">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </section>
  );
}
