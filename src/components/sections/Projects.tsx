"use client";

import { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "framer-motion";
import { SectionLabel } from "@/components/ui/SectionLabel";
import { ProjectCard } from "@/components/ui/ProjectCard";
import type { Project } from "@/types";

const PROJECTS: Project[] = [
  {
    id: "tomcraft",
    title: "TomCraft",
    description:
      "Minecraft-inspired voxel sandbox built from scratch. Infinite procedural worlds, 9 biomes, 20+ mobs with AI, crafting, and survival gameplay.",
    longDescription: null,
    imageUrl: "/projects/tomcraft.png",
    liveUrl: "https://tomcraft.tombp.fr",
    githubUrl: null,
    tags: [
      { id: "typescript", name: "TypeScript" },
      { id: "threejs", name: "Three.js" },
      { id: "vite", name: "Vite" },
      { id: "webgl", name: "WebGL" },
    ],
    featured: true,
    sortOrder: 0,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "wolfenstom",
    title: "Wolfenstom 3D",
    description:
      "Steampunk FPS inspired by Wolfenstein 3D. Ray-casting engine in the browser with procedural maps and steampunk weapons.",
    longDescription: null,
    imageUrl: "/projects/wolfenstom.png",
    liveUrl: "https://wolfenstom.tombp.fr",
    githubUrl: null,
    tags: [
      { id: "typescript", name: "TypeScript" },
      { id: "threejs", name: "Three.js" },
      { id: "vite", name: "Vite" },
    ],
    featured: true,
    sortOrder: 1,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "defidecon",
    title: "Défi de Con",
    description:
      "Daily challenge platform with streak tracking, leaderboards, and admin dashboard. Built with Next.js and Supabase.",
    longDescription: null,
    imageUrl: "/projects/defidecon.png",
    liveUrl: "https://defidecon.tombp.fr",
    githubUrl: null,
    tags: [
      { id: "nextjs", name: "Next.js" },
      { id: "supabase", name: "Supabase" },
      { id: "tailwind", name: "Tailwind CSS" },
    ],
    featured: true,
    sortOrder: 2,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "neverstopdating",
    title: "Never Stop Dating Your Partner",
    description:
      "Relationship app helping couples maintain their connection with date ideas, feature lists, and a playful pink-themed UI.",
    longDescription: null,
    imageUrl: "/projects/neverstopdating.png",
    liveUrl: "https://neverstopdatingyourpartner.tombp.fr",
    githubUrl: null,
    tags: [
      { id: "nextjs", name: "Next.js" },
      { id: "supabase", name: "Supabase" },
      { id: "framer", name: "Framer Motion" },
      { id: "tailwind", name: "Tailwind CSS" },
    ],
    featured: true,
    sortOrder: 3,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "codearena",
    title: "Code Arena",
    description:
      "Competitive coding platform with challenges across multiple difficulty tiers, score tracking, streaks, and leaderboards.",
    longDescription: null,
    imageUrl: null,
    liveUrl: "https://codearena.tombp.fr",
    githubUrl: null,
    tags: [
      { id: "nextjs", name: "Next.js" },
      { id: "typescript", name: "TypeScript" },
      { id: "tailwind", name: "Tailwind CSS" },
    ],
    featured: false,
    sortOrder: 4,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "tomuiplayground",
    title: "Tom UI Playground",
    description:
      "Browser-based UI dev environment with Monaco code editor, live preview, file explorer, and console.",
    longDescription: null,
    imageUrl: "/projects/tomuiplayground.png",
    liveUrl: "https://tomuiplayground.tombp.fr",
    githubUrl: null,
    tags: [
      { id: "react", name: "React" },
      { id: "typescript", name: "TypeScript" },
      { id: "vite", name: "Vite" },
      { id: "tailwind", name: "Tailwind CSS" },
    ],
    featured: true,
    sortOrder: 5,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "portfolio",
    title: "Personal Portfolio — tombp.fr",
    description:
      "Modern portfolio with Three.js wireframe gears, scroll animations, and Void & Gold aesthetic.",
    longDescription: null,
    imageUrl: "/projects/tombp.png",
    liveUrl: "https://www.tombp.fr/",
    githubUrl: null,
    tags: [
      { id: "nextjs", name: "Next.js" },
      { id: "typescript", name: "TypeScript" },
      { id: "threejs", name: "Three.js" },
      { id: "tailwind", name: "Tailwind CSS" },
    ],
    featured: true,
    sortOrder: 6,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "isomaker",
    title: "IsoMaker — 3D Pixel Art Creator",
    description:
      "Interactive isometric pixel art creator with real-time preview, color picker, and export.",
    longDescription: null,
    imageUrl: "/projects/isomaker.png",
    liveUrl: "https://www.isomaker.fr/",
    githubUrl: null,
    tags: [
      { id: "javascript", name: "JavaScript" },
      { id: "canvas", name: "Canvas" },
    ],
    featured: true,
    sortOrder: 7,
    createdAt: "",
    updatedAt: "",
  },
  {
    id: "libertai",
    title: "LibertAI — AI Platform",
    description:
      "Corporate website redesign for an AI company — modern brand presence, responsive, accessible.",
    longDescription: null,
    imageUrl: "/projects/libertai.png",
    liveUrl: "https://libertai.io/",
    githubUrl: null,
    tags: [
      { id: "react", name: "React" },
      { id: "uiux", name: "UI/UX" },
    ],
    featured: true,
    sortOrder: 8,
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
