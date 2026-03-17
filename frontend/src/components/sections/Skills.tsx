"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { Skill } from "@/types";
import { LevelDots } from "@/components/ui/LevelDots";
import { SectionLabel } from "@/components/ui/SectionLabel";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.3 + i * 0.1,
      ease: [0.65, 0, 0.35, 1],
    },
  }),
};

const categoryMap: Record<string, string> = {
  FRONTEND: "Frontend",
  DESIGN: "Design",
  BACKEND: "Backend & Tools",
};

const categoryOrder = ["FRONTEND", "DESIGN", "BACKEND"];

interface SkillsProps {
  skills: Skill[];
}

export function Skills({ skills }: SkillsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const proficientSkills = skills.filter((s) => s.status !== "EXPLORING");
  const exploringSkills = skills.filter((s) => s.status === "EXPLORING");

  const grouped = categoryOrder.reduce<Record<string, Skill[]>>(
    (acc, cat) => {
      acc[cat] = proficientSkills
        .filter((s) => s.category === cat)
        .sort((a, b) => a.sortOrder - b.sortOrder);
      return acc;
    },
    {}
  );

  return (
    <section ref={ref} className="px-8 md:px-16 lg:px-24 py-24">
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="max-w-5xl mx-auto"
      >
        <motion.div custom={0} variants={fadeUp}>
          <SectionLabel>Skills</SectionLabel>
        </motion.div>

        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-10">
          {categoryOrder.map((cat, catIdx) => (
            <motion.div key={cat} custom={catIdx + 1} variants={fadeUp}>
              <h3 className="font-display font-bold text-lg text-text-primary mb-4">
                {categoryMap[cat]}
              </h3>
              <div className="grid gap-3">
                {(grouped[cat] ?? []).map((skill) => (
                  <div
                    key={skill.id}
                    className="flex items-center justify-between gap-3"
                  >
                    <span className="text-text-secondary text-sm">
                      {skill.name}
                    </span>
                    <LevelDots level={skill.level} />
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {exploringSkills.length > 0 && (
          <motion.div custom={5} variants={fadeUp} className="mt-12">
            <h3 className="font-display font-bold text-lg text-text-primary mb-4">
              Currently Exploring
            </h3>
            <div className="flex flex-wrap gap-2">
              {exploringSkills.map((skill) => (
                <span
                  key={skill.id}
                  className="void-panel px-3 py-1 text-xs text-text-secondary rounded-full"
                >
                  {skill.name}
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
