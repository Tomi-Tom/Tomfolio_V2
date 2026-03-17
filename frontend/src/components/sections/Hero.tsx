"use client";

import { motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
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

export function Hero() {
  return (
    <div className="min-h-screen flex flex-col justify-center px-8 md:px-16 lg:px-24">
      <motion.div initial="hidden" animate="visible" className="max-w-4xl">
        <motion.div custom={0} variants={fadeUp}>
          <SectionLabel>Portfolio</SectionLabel>
        </motion.div>

        <motion.h1
          custom={1}
          variants={fadeUp}
          className="mt-6 font-display text-display leading-[0.92]"
        >
          <span className="font-light">Tom</span>
          <br />
          <span className="font-bold">
            Bariteau<span className="text-gold">.</span>
          </span>
          <br />
          <span className="font-light">Peter</span>
        </motion.h1>

        <motion.p
          custom={2}
          variants={fadeUp}
          className="mt-6 text-h3 font-display text-text-secondary font-light"
        >
          UX Designer &amp; Developer
        </motion.p>

        <motion.p
          custom={3}
          variants={fadeUp}
          className="mt-4 text-text-secondary max-w-xl"
        >
          Crafting immersive digital experiences at the intersection of design
          precision and technical craft.
        </motion.p>

        <motion.div
          custom={4}
          variants={fadeUp}
          className="mt-8 flex gap-4 flex-wrap"
        >
          <Button
            variant="gold"
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

        <motion.div
          custom={5}
          variants={fadeUp}
          className="mt-12 flex gap-8"
        >
          {[
            { value: "50+", label: "Projects" },
            { value: "5yr", label: "Experience" },
            { value: "FR\u00B7EN", label: "Languages" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="font-display font-bold text-lg text-text-primary">
                {stat.value}
              </p>
              <p className="hud-caption text-text-dim">{stat.label}</p>
            </div>
          ))}
        </motion.div>
      </motion.div>
    </div>
  );
}
