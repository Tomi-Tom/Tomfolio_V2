"use client";

import { useMemo, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ProjectCard } from "@/components/ui/ProjectCard";
import type { Project } from "@/types";

interface ProjectsProps {
  projects: Project[];
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

export function Projects({ projects }: ProjectsProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [activeTag, setActiveTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tagMap = new Map<string, string>();
    for (const project of projects) {
      for (const tag of project.tags) {
        tagMap.set(tag.id, tag.name);
      }
    }
    return Array.from(tagMap, ([id, name]) => ({ id, name }));
  }, [projects]);

  const filteredProjects = useMemo(() => {
    if (!activeTag) return projects;
    return projects.filter((p) => p.tags.some((t) => t.id === activeTag));
  }, [projects, activeTag]);

  return (
    <section id="projects" ref={ref} className="px-8 md:px-16 lg:px-24 py-24">
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.div custom={0} variants={fadeUp}>
          <SectionLabel>Projects</SectionLabel>
        </motion.div>

        {/* Tag filter bar */}
        <motion.div custom={1} variants={fadeUp} className="mt-8 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`text-xs px-3 py-1 rounded-full border transition ${
              activeTag === null
                ? "bg-gold text-black border-gold"
                : "border-[var(--border)] text-text-dim hover:text-text-secondary"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setActiveTag(tag.id)}
              className={`text-xs px-3 py-1 rounded-full border transition ${
                activeTag === tag.id
                  ? "bg-gold text-black border-gold"
                  : "border-[var(--border)] text-text-dim hover:text-text-secondary"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </motion.div>

        {/* Project grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredProjects.map((project, i) => (
            <motion.div key={project.id} custom={i + 2} variants={fadeUp}>
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
