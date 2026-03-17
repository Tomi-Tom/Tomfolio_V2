"use client";

import { type HTMLAttributes } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface VoidPanelProps extends HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
}

export function VoidPanel({ className, hoverable = true, children, ...props }: VoidPanelProps) {
  if (!hoverable) {
    return (
      <div className={cn("void-panel", className)} {...props}>
        {children}
      </div>
    );
  }

  return (
    <motion.div
      className={cn("void-panel", className)}
      whileHover={{ y: -4, borderColor: "rgba(212,175,55,0.35)" }}
      transition={{ duration: 0.2 }}
      {...props}
    >
      {children}
    </motion.div>
  );
}
