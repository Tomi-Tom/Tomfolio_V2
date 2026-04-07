import { cn } from "@/lib/utils";

interface LevelDotsProps {
  level: number;
  maxLevel?: number;
}

export function LevelDots({ level, maxLevel = 4 }: LevelDotsProps) {
  return (
    <div className="flex gap-1.5">
      {Array.from({ length: maxLevel }, (_, i) => (
        <div
          key={i}
          className={cn(
            "w-2 h-2 rounded-full border border-[var(--gold-dim)]",
            i < level ? "bg-gold" : "bg-transparent"
          )}
        />
      ))}
    </div>
  );
}
