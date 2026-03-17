"use client";

import { VoidPanel } from "@/components/ui/VoidPanel";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  className?: string;
}

export function StatCard({ title, value, className }: StatCardProps) {
  return (
    <VoidPanel hoverable={false} className={cn("p-6", className)}>
      <p className="text-h2 font-display text-gold">{value}</p>
      <p className="hud-caption text-[var(--text-dim)] mt-2">{title}</p>
    </VoidPanel>
  );
}
