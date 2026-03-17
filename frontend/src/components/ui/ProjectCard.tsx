"use client";

import Image from "next/image";
import { VoidPanel } from "@/components/ui/VoidPanel";
import type { Project } from "@/types";

interface ProjectCardProps {
  project: Project;
}

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <VoidPanel className="overflow-hidden">
      {/* Image area */}
      <div className="relative aspect-video w-full">
        {project.imageUrl ? (
          <Image
            src={project.imageUrl}
            alt={project.title}
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full void-elevated" />
        )}
      </div>

      {/* Content area */}
      <div className="p-4">
        <h3 className="font-display font-semibold text-text-primary">
          {project.title}
        </h3>
        <p className="mt-1 text-sm text-text-secondary line-clamp-2">
          {project.description}
        </p>

        {/* Tags */}
        {project.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {project.tags.map((tag) => (
              <span
                key={tag.id}
                className="border border-[var(--border)] text-text-dim text-xs px-2 py-0.5 rounded"
              >
                {tag.name}
              </span>
            ))}
          </div>
        )}

        {/* Links */}
        {(project.liveUrl || project.githubUrl) && (
          <div className="mt-3 flex gap-4">
            {project.liveUrl && (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-text-primary transition text-sm"
              >
                Live &rarr;
              </a>
            )}
            {project.githubUrl && (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gold hover:text-text-primary transition text-sm"
              >
                GitHub
              </a>
            )}
          </div>
        )}
      </div>
    </VoidPanel>
  );
}
