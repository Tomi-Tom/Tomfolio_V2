"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import type { Skill } from "@/types";
import { LevelDots } from "@/components/ui/LevelDots";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { VoidPanel } from "@/components/ui/VoidPanel";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.3 + i * 0.12,
      ease: [0.65, 0, 0.35, 1] as const,
    },
  }),
};

const barFill = {
  hidden: { scaleX: 0 },
  visible: (delay: number) => ({
    scaleX: 1,
    transition: {
      duration: 0.8,
      delay,
      ease: [0.65, 0, 0.35, 1] as const,
    },
  }),
};

const categoryMeta: Record<string, { label: string; number: string }> = {
  FRONTEND: { label: "Frontend", number: "01" },
  DESIGN: { label: "Design", number: "02" },
  BACKEND: { label: "Backend & Tools", number: "03" },
};

const categoryOrder = ["FRONTEND", "DESIGN", "BACKEND"];

interface SkillsProps {
  skills: Skill[];
}

function SkillBar({
  skill,
  index,
  isInView,
}: {
  skill: Skill;
  index: number;
  isInView: boolean;
}) {
  const percentage = (skill.level / 4) * 100;
  const delay = 0.6 + index * 0.06;

  return (
    <div className="group flex items-center gap-4">
      <span className="text-text-secondary text-sm w-28 shrink-0 truncate">
        {skill.name}
      </span>

      {/* Progress bar */}
      <div className="flex-1 h-[3px] bg-[var(--border)] rounded-full overflow-hidden relative">
        <motion.div
          className="absolute inset-y-0 left-0 rounded-full origin-left"
          style={{
            width: `${percentage}%`,
            background:
              "linear-gradient(90deg, var(--gold-dim) 0%, var(--gold) 100%)",
          }}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          custom={delay}
          variants={barFill}
        />
      </div>

      {/* Level dots (kept for detail) */}
      <div className="shrink-0 opacity-50 group-hover:opacity-100 transition-opacity">
        <LevelDots level={skill.level} />
      </div>
    </div>
  );
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
    <section ref={ref} className="relative px-8 md:px-16 lg:px-24 py-32 overflow-hidden">
      {/* Subtle background mesh */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.02]"
        aria-hidden
        style={{
          backgroundImage:
            "linear-gradient(var(--gold) 1px, transparent 1px), linear-gradient(90deg, var(--gold) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        className="relative max-w-5xl mx-auto"
      >
        {/* Section Label with numbering */}
        <motion.div custom={0} variants={fadeUp} className="flex items-center gap-4">
          <span className="font-display text-[0.7rem] text-gold tracking-[0.3em] uppercase opacity-60">
            02
          </span>
          <SectionLabel>Skills</SectionLabel>
        </motion.div>

        {/* Category Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          {categoryOrder.map((cat, catIdx) => {
            const meta = categoryMeta[cat];
            return (
              <motion.div key={cat} custom={catIdx + 1} variants={fadeUp}>
                <VoidPanel hoverable={false} className="p-6 h-full">
                  {/* Category header with decorative number */}
                  <div className="flex items-baseline gap-3 mb-6">
                    <span className="font-display text-2xl font-bold text-gold opacity-30">
                      {meta.number}
                    </span>
                    <h3 className="font-display font-bold text-base text-text-primary tracking-wide uppercase">
                      {meta.label}
                    </h3>
                  </div>

                  {/* Gold accent line under header */}
                  <div
                    className="h-px w-full mb-5"
                    style={{
                      background:
                        "linear-gradient(90deg, var(--gold) 0%, transparent 60%)",
                      opacity: 0.25,
                    }}
                  />

                  {/* Skills list with bars */}
                  <div className="grid gap-4">
                    {(grouped[cat] ?? []).map((skill, skillIdx) => (
                      <SkillBar
                        key={skill.id}
                        skill={skill}
                        index={catIdx * 5 + skillIdx}
                        isInView={isInView}
                      />
                    ))}
                  </div>
                </VoidPanel>
              </motion.div>
            );
          })}
        </div>

        {/* Currently Exploring — glowing tags */}
        {exploringSkills.length > 0 && (
          <motion.div custom={5} variants={fadeUp} className="mt-14">
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-2xl font-bold text-gold opacity-30">
                04
              </span>
              <h3 className="font-display font-bold text-base text-text-primary tracking-wide uppercase">
                Currently Exploring
              </h3>
            </div>

            <div className="flex flex-wrap gap-3">
              {exploringSkills.map((skill) => (
                <motion.span
                  key={skill.id}
                  className="relative px-4 py-1.5 text-xs font-display tracking-wider text-gold border border-[var(--gold-dim)] rounded-full bg-[var(--gold)]/[0.04] uppercase"
                  whileHover={{
                    borderColor: "rgba(212,175,55,0.6)",
                    boxShadow: "0 0 20px rgba(212,175,55,0.15)",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  {/* Subtle glow behind each tag */}
                  <span
                    className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
                    style={{
                      background:
                        "radial-gradient(ellipse, rgba(212,175,55,0.08), transparent 70%)",
                    }}
                  />
                  <span className="relative">{skill.name}</span>
                </motion.span>
              ))}
            </div>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
