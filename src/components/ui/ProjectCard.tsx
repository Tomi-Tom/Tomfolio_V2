"use client";

import Image from "next/image";
import { VoidPanel } from "@/components/ui/VoidPanel";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
  index?: number;
}

export function ProjectCard({ project, index = 0 }: ProjectCardProps) {
  const projectNumber = String(index + 1).padStart(2, "0");

  const Wrapper = project.liveUrl ? "a" : "div";
  const wrapperProps = project.liveUrl
    ? { href: project.liveUrl, target: "_blank" as const, rel: "noopener noreferrer" }
    : {};

  return (
    <VoidPanel className="overflow-hidden group h-full">
      <Wrapper {...wrapperProps} className="block cursor-pointer">
        {/* Image area with hover overlay */}
        <div className="relative aspect-video w-full overflow-hidden">
          {project.imageUrl ? (
            <Image
              src={project.imageUrl}
              alt={project.title}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="w-full h-full void-elevated" />
          )}

          {/* Gold border glow on hover */}
          <div className="absolute inset-0 border-2 border-transparent group-hover:border-[rgba(212,175,55,0.3)] transition-all duration-500 pointer-events-none" />

          {/* Project number indicator */}
          <div className="absolute top-4 left-4 font-display text-[0.65rem] font-bold tracking-[0.2em] text-[var(--gold-dim)] bg-[rgba(0,0,0,0.6)] backdrop-blur-sm px-2.5 py-1 rounded border border-[var(--border)]">
            {projectNumber}
          </div>

          {/* Hover overlay with description */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out flex flex-col justify-end p-5">
            <p className="text-sm text-white/90 leading-relaxed line-clamp-3">
              {project.description}
            </p>

            {/* Arrow link icon */}
            <div className="mt-3 flex items-center gap-2">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-gold text-sm font-medium hover:text-white transition-colors"
                >
                  View project
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17L17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-gold text-sm font-medium hover:text-white transition-colors"
                >
                  GitHub
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M7 17L17 7" />
                    <path d="M7 7h10v10" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Content area */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <h3 className="font-display font-semibold text-text-primary text-lg tracking-wide">
              {project.title}
            </h3>

            {/* Arrow icon on hover */}
            <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 shrink-0 mt-1">
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="var(--gold)"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M7 17L17 7" />
                <path d="M7 7h10v10" />
              </svg>
            </div>
          </div>

          <p className="mt-2 text-sm text-text-secondary line-clamp-2 leading-relaxed">
            {project.description}
          </p>

          {/* Tags — gold outline pills */}
          {project.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {project.tags.map((tag) => (
                <span
                  key={tag.id}
                  className="border border-[var(--gold-dim)] text-[var(--gold-dim)] text-xs px-2.5 py-0.5 rounded-full transition-all duration-300 hover:bg-[var(--gold)] hover:text-black hover:border-[var(--gold)] cursor-default"
                >
                  {tag.name}
                </span>
              ))}
            </div>
          )}

          {/* Links row — visible on mobile, hidden on hover-capable devices (shown in overlay instead) */}
          {(project.liveUrl || project.githubUrl) && (
            <div className="mt-4 flex gap-4 md:hidden">
              {project.liveUrl && (
                <a
                  href={project.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:text-text-primary transition text-sm font-medium"
                >
                  Live &rarr;
                </a>
              )}
              {project.githubUrl && (
                <a
                  href={project.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gold hover:text-text-primary transition text-sm font-medium"
                >
                  GitHub
                </a>
              )}
            </div>
          )}
        </div>
      </Wrapper>
    </VoidPanel>
  );
}
