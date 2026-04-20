"use client";

import type { ReactNode } from "react";
import { StatusBar } from "@/components/layout/StatusBar";
import { ChapterBar } from "@/components/layout/ChapterBar";
import { HUDFrame } from "@/components/layout/HUDFrame";
import { Footer } from "@/components/layout/Footer";
import { GearScene } from "@/components/three";
import { useScrollProgress } from "@/hooks/useScrollProgress";

export default function PublicLayout({ children }: { children: ReactNode }) {
  const { progress } = useScrollProgress();

  return (
    <>
      <GearScene progress={progress} />
      <StatusBar />
      <HUDFrame />
      <main className="pt-[36px] pb-[40px]">
        {children}
        <Footer />
      </main>
      <ChapterBar />
    </>
  );
}
