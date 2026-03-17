"use client";

import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const sections = [
  { label: "Intro", id: "intro" },
  { label: "About", id: "about" },
  { label: "Skills", id: "skills" },
  { label: "Services", id: "services" },
  { label: "Projects", id: "projects" },
  { label: "Testimonials", id: "testimonials" },
  { label: "Contact", id: "contact" },
];

export function ChapterBar() {
  const [activeSection, setActiveSection] = useState<string>("intro");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sections.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) {
            setActiveSection(id);
          }
        },
        { threshold: 0.3 }
      );

      observer.observe(el);
      observers.push(observer);
    });

    return () => {
      observers.forEach((obs) => obs.disconnect());
    };
  }, []);

  const scrollToSection = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50 flex items-center justify-center gap-1",
        "bg-[var(--void-surface)] border-t border-[var(--border)]"
      )}
      style={{ height: 40 }}
    >
      {sections.map(({ label, id }) => (
        <button
          key={id}
          onClick={() => scrollToSection(id)}
          className={cn(
            "hud-caption px-3 py-1 transition-colors cursor-pointer",
            activeSection === id
              ? "text-[var(--gold)]"
              : "text-[var(--text-dim)] hover:text-[var(--text-secondary)]"
          )}
        >
          {label}
        </button>
      ))}
    </nav>
  );
}
