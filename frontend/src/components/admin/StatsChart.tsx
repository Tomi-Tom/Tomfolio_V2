"use client";

import { VoidPanel } from "@/components/ui/VoidPanel";
import type { StatsPeriod } from "@/types";

interface StatsChartProps {
  data: StatsPeriod[];
  title: string;
}

export function StatsChart({ data, title }: StatsChartProps) {
  const maxCount = Math.max(...data.map((d) => d.count), 1);

  return (
    <VoidPanel hoverable={false} className="p-6">
      <h3 className="font-display text-text-primary mb-4">{title}</h3>
      <div className="flex flex-row items-end gap-1" style={{ height: 200 }}>
        {data.map((item) => (
          <div
            key={item.date}
            className="flex-1 flex flex-col items-center justify-end h-full"
          >
            <div
              className="w-full bg-gold rounded-t"
              style={{
                height: `${(item.count / maxCount) * 100}%`,
                minHeight: item.count > 0 ? 4 : 0,
              }}
            />
          </div>
        ))}
      </div>
      <div className="flex flex-row gap-1 mt-2">
        {data.map((item, i) => {
          // Show label every ~5th bar to avoid crowding
          const showLabel = data.length <= 10 || i % Math.ceil(data.length / 7) === 0;
          return (
            <div key={item.date} className="flex-1 text-center">
              {showLabel && (
                <span className="hud-caption text-[var(--text-dim)] text-[0.55rem]">
                  {item.date.slice(5)}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </VoidPanel>
  );
}
