"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

const sectionIds = [
  "intro",
  "about",
  "skills",
  "services",
  "projects",
  "testimonials",
  "playground",
  "contact",
] as const;

export function ChapterBar() {
  const t = useTranslations("chapterBar");
  const sections = sectionIds.map((id) => ({ id, label: t(id) }));
  const [activeSection, setActiveSection] = useState<string>("intro");

  useEffect(() => {
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
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
            "hud-caption px-1.5 py-1 sm:px-3 transition-colors cursor-pointer",
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
