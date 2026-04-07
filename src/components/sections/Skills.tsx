"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import type { Skill } from "@/types";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { VoidPanel } from "@/components/ui/VoidPanel";

const SKILLS: Skill[] = [
  // Frontend
  { id: "1", name: "React", level: 4, icon: null, category: "FRONTEND", status: "PROFICIENT", sortOrder: 0 },
  { id: "2", name: "TypeScript", level: 4, icon: null, category: "FRONTEND", status: "PROFICIENT", sortOrder: 1 },
  { id: "3", name: "Tailwind CSS", level: 4, icon: null, category: "FRONTEND", status: "PROFICIENT", sortOrder: 2 },
  { id: "4", name: "Three.js", level: 3, icon: null, category: "FRONTEND", status: "PROFICIENT", sortOrder: 3 },
  { id: "5", name: "Framer Motion", level: 4, icon: null, category: "FRONTEND", status: "PROFICIENT", sortOrder: 4 },
  { id: "6", name: "HTML/CSS", level: 4, icon: null, category: "FRONTEND", status: "PROFICIENT", sortOrder: 5 },
  { id: "7", name: "Next.js", level: 4, icon: null, category: "FRONTEND", status: "PROFICIENT", sortOrder: 18 },
  // Design
  { id: "8", name: "UI/UX", level: 4, icon: null, category: "DESIGN", status: "PROFICIENT", sortOrder: 6 },
  { id: "9", name: "Figma", level: 4, icon: null, category: "DESIGN", status: "PROFICIENT", sortOrder: 7 },
  { id: "10", name: "Design Systems", level: 4, icon: null, category: "DESIGN", status: "PROFICIENT", sortOrder: 8 },
  { id: "11", name: "Adobe XD", level: 3, icon: null, category: "DESIGN", status: "PROFICIENT", sortOrder: 9 },
  { id: "12", name: "Photoshop", level: 3, icon: null, category: "DESIGN", status: "PROFICIENT", sortOrder: 10 },
  { id: "13", name: "Prototyping", level: 4, icon: null, category: "DESIGN", status: "PROFICIENT", sortOrder: 11 },
  // Backend & Tools
  { id: "14", name: "Node.js", level: 3, icon: null, category: "BACKEND", status: "PROFICIENT", sortOrder: 12 },
  { id: "15", name: "Express", level: 3, icon: null, category: "BACKEND", status: "PROFICIENT", sortOrder: 13 },
  { id: "16", name: "MongoDB", level: 3, icon: null, category: "BACKEND", status: "PROFICIENT", sortOrder: 14 },
  { id: "17", name: "Git", level: 4, icon: null, category: "BACKEND", status: "PROFICIENT", sortOrder: 15 },
  { id: "18", name: "REST APIs", level: 4, icon: null, category: "BACKEND", status: "PROFICIENT", sortOrder: 16 },
  { id: "19", name: "CI/CD", level: 2, icon: null, category: "BACKEND", status: "PROFICIENT", sortOrder: 17 },
  { id: "20", name: "Docker", level: 3, icon: null, category: "BACKEND", status: "PROFICIENT", sortOrder: 19 },
  { id: "24", name: "Claude Agent", level: 3, icon: null, category: "BACKEND", status: "PROFICIENT", sortOrder: 20 },
  // Exploring
  { id: "21", name: "Rust", level: 1, icon: null, category: "OTHER", status: "EXPLORING", sortOrder: 20 },
  { id: "22", name: "WebGL", level: 1, icon: null, category: "OTHER", status: "EXPLORING", sortOrder: 21 },
  { id: "23", name: "AI Integration", level: 1, icon: null, category: "OTHER", status: "EXPLORING", sortOrder: 22 },
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

const categoryMeta: Record<string, { label: string; number: string; description: string }> = {
  FRONTEND: {
    label: "Frontend",
    number: "01",
    description: "Building responsive, performant, and interactive user interfaces.",
  },
  DESIGN: {
    label: "Design",
    number: "02",
    description: "Crafting intuitive experiences and cohesive visual systems.",
  },
  BACKEND: {
    label: "Backend & Tools",
    number: "03",
    description: "APIs, databases, infrastructure, and developer tooling.",
  },
};

const categoryOrder = ["FRONTEND", "DESIGN", "BACKEND"];


function SkillChip({
  skill,
  index,
  isInView,
}: {
  skill: Skill;
  index: number;
  isInView: boolean;
}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <motion.div
      className="relative group cursor-default"
      initial={{ opacity: 0, scale: 0.8 }}
      animate={
        isInView
          ? { opacity: 1, scale: 1, transition: { delay: 0.15 + index * 0.03, duration: 0.3 } }
          : { opacity: 0, scale: 0.8 }
      }
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="px-4 py-2.5 border border-[var(--border)] bg-[var(--void-surface)] font-display text-sm tracking-wide text-[var(--text-primary)] transition-colors duration-300"
        animate={
          isHovered
            ? {
                borderColor: "rgba(212,175,55,0.5)",
                boxShadow: "0 0 20px rgba(212,175,55,0.1), inset 0 0 20px rgba(212,175,55,0.03)",
              }
            : {
                borderColor: "rgba(212,175,55,0.12)",
                boxShadow: "none",
              }
        }
        transition={{ duration: 0.3 }}
      >
        {skill.name}
      </motion.div>

      {/* Gold dot indicator on hover */}
      <motion.div
        className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-gold"
        initial={{ scale: 0 }}
        animate={isHovered ? { scale: 1 } : { scale: 0 }}
        transition={{ duration: 0.2 }}
      />
    </motion.div>
  );
}

export function Skills() {
  const skills = SKILLS;
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });

  const proficientSkills = skills.filter((s) => s.status !== "EXPLORING");
  const exploringSkills = skills.filter((s) => s.status === "EXPLORING");

  const grouped = categoryOrder.reduce<Record<string, Skill[]>>((acc, cat) => {
    acc[cat] = proficientSkills
      .filter((s) => s.category === cat)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    return acc;
  }, {});

  // Count total skills per category for the counter
  const totalSkills = proficientSkills.length + exploringSkills.length;

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
        {/* Header */}
        <motion.div custom={0} variants={fadeUp} className="flex items-center gap-4">
          <span className="font-display text-[0.7rem] text-gold tracking-[0.3em] uppercase opacity-60">
            02
          </span>
          <SectionLabel>Skills</SectionLabel>
        </motion.div>

        <motion.p custom={0.5} variants={fadeUp} className="mt-4 text-[var(--text-dim)] text-sm max-w-md">
          {totalSkills} technologies and tools I work with daily.
        </motion.p>

        {/* Category Cards */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
          {categoryOrder.map((cat, catIdx) => {
            const meta = categoryMeta[cat];
            const catSkills = grouped[cat] ?? [];

            return (
              <motion.div key={cat} custom={catIdx + 1} variants={fadeUp}>
                <VoidPanel hoverable={false} className="p-6 h-full">
                  {/* Category header */}
                  <div className="flex items-baseline gap-3 mb-2">
                    <span className="font-display text-2xl font-bold text-gold opacity-30">
                      {meta.number}
                    </span>
                    <h3 className="font-display font-bold text-base text-[var(--text-primary)] tracking-wide uppercase">
                      {meta.label}
                    </h3>
                  </div>

                  <p className="text-[var(--text-dim)] text-xs mb-5">{meta.description}</p>

                  {/* Gold accent line */}
                  <div
                    className="h-px w-full mb-5"
                    style={{
                      background: "linear-gradient(90deg, var(--gold) 0%, transparent 60%)",
                      opacity: 0.25,
                    }}
                  />

                  {/* Skill chips */}
                  <div className="flex flex-wrap gap-2">
                    {catSkills.map((skill, skillIdx) => (
                      <SkillChip
                        key={skill.id}
                        skill={skill}
                        index={catIdx * 6 + skillIdx}
                        isInView={isInView}
                      />
                    ))}
                  </div>

                  {/* Skill count */}
                  <div className="mt-5 pt-4 border-t border-[var(--border)]">
                    <span className="hud-caption text-[var(--text-dim)]">
                      {catSkills.length} {catSkills.length === 1 ? "skill" : "skills"}
                    </span>
                  </div>
                </VoidPanel>
              </motion.div>
            );
          })}
        </div>

        {/* Currently Exploring */}
        {exploringSkills.length > 0 && (
          <motion.div custom={5} variants={fadeUp} className="mt-14">
            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-display text-2xl font-bold text-gold opacity-30">04</span>
              <h3 className="font-display font-bold text-base text-[var(--text-primary)] tracking-wide uppercase">
                Currently Exploring
              </h3>
            </div>

            <div className="flex flex-wrap gap-3">
              {exploringSkills.map((skill) => (
                <motion.span
                  key={skill.id}
                  className="relative px-4 py-1.5 text-xs font-display tracking-wider text-gold border border-[var(--gold-dim)] rounded-full bg-[rgba(212,175,55,0.04)] uppercase"
                  whileHover={{
                    borderColor: "rgba(212,175,55,0.6)",
                    boxShadow: "0 0 20px rgba(212,175,55,0.15)",
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <span
                    className="absolute inset-0 rounded-full opacity-0 hover:opacity-100 transition-opacity pointer-events-none"
                    style={{
                      background: "radial-gradient(ellipse, rgba(212,175,55,0.08), transparent 70%)",
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
