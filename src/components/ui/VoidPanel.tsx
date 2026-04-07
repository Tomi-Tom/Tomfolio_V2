"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface VoidPanelProps {
  className?: string;
  hoverable?: boolean;
  children: ReactNode;
  onClick?: () => void;
}

export function VoidPanel({ className, hoverable = true, children, onClick }: VoidPanelProps) {
  if (!hoverable) {
    return (
      <div className={cn("void-panel", className)} onClick={onClick}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={cn("void-panel", className)}
      whileHover={{ y: -4, borderColor: "rgba(212,175,55,0.35)" }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      {children}
    </motion.div>
  );
}
