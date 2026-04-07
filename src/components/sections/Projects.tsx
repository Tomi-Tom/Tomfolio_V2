"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ProjectCard } from "@/components/ui/ProjectCard";
import type { Project } from "@/types";

const PROJECTS: Project[] = [
  {
    id: "1",
    title: "Personal Portfolio — tombp.fr",
    description:
      "Modern portfolio with horizontal scroll, Three.js wireframe gears, and Void & Gold aesthetic.",
    longDescription:
      "Modern portfolio website showcasing design and development work. Built with React and Framer Motion, featuring smooth animations, interactive elements, and a clean, minimalist aesthetic.",
    imageUrl:
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80",
    liveUrl: "https://www.tombp.fr/",
    githubUrl: null,
    tags: [
      { id: "react", name: "React" },
      { id: "typescript", name: "TypeScript" },
      { id: "threejs", name: "Three.js" },
      { id: "tailwind", name: "Tailwind CSS" },
    ],
    featured: true,
    sortOrder: 0,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "2",
    title: "IsoMaker — 3D Pixel Art Creator",
    description:
      "Interactive isometric pixel art creator with real-time preview, color picker, and export.",
    longDescription:
      "Interactive web application for creating isometric pixel art. Features intuitive controls, real-time preview, color picker, and export functionality.",
    imageUrl:
      "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80",
    liveUrl: "https://www.isomaker.fr/",
    githubUrl: null,
    tags: [
      { id: "javascript", name: "JavaScript" },
      { id: "canvas", name: "Canvas" },
      { id: "pixelart", name: "Pixel Art" },
    ],
    featured: true,
    sortOrder: 1,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "3",
    title: "LibertAI — AI Platform",
    description:
      "Corporate website redesign for an AI company — modern brand presence, responsive, accessible.",
    longDescription:
      "Corporate website redesign for an AI technology company. Focused on creating a modern, trustworthy brand presence with clear communication of complex AI concepts.",
    imageUrl:
      "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80",
    liveUrl: "https://libertai.io/",
    githubUrl: null,
    tags: [
      { id: "react2", name: "React" },
      { id: "uiux", name: "UI/UX" },
      { id: "a11y", name: "Accessibility" },
    ],
    featured: true,
    sortOrder: 2,
    createdAt: "",
    updatedAt: "",
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

export function Projects() {
  const projects = PROJECTS;
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });
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
        <motion.div custom={1} variants={fadeUp} className="mt-10 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTag(null)}
            className={`text-xs px-4 py-1.5 rounded-full border font-medium tracking-wide transition-all duration-300 ${
              activeTag === null
                ? "bg-gold text-black border-gold shadow-[0_0_12px_rgba(212,175,55,0.3)]"
                : "border-[var(--border)] text-text-dim hover:text-gold hover:border-[var(--gold-dim)]"
            }`}
          >
            All
          </button>
          {allTags.map((tag) => (
            <button
              key={tag.id}
              onClick={() => setActiveTag(tag.id)}
              className={`text-xs px-4 py-1.5 rounded-full border font-medium tracking-wide transition-all duration-300 ${
                activeTag === tag.id
                  ? "bg-gold text-black border-gold shadow-[0_0_12px_rgba(212,175,55,0.3)]"
                  : "border-[var(--border)] text-text-dim hover:text-gold hover:border-[var(--gold-dim)]"
              }`}
            >
              {tag.name}
            </button>
          ))}
        </motion.div>

        {/* Project grid */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <AnimatePresence mode="popLayout">
            {filteredProjects.map((project, i) => (
              <motion.div
                key={project.id}
                custom={i + 2}
                variants={fadeUp}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                layout
              >
                <ProjectCard project={project} index={i} />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </motion.div>
    </section>
  );
}
