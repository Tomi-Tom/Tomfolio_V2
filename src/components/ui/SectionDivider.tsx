"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";

export function SectionDivider() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <div ref={ref} className="flex justify-center py-12">
      <motion.div
        className="h-[1px] bg-[var(--gold-dim)]"
        initial={{ width: 0, opacity: 0 }}
        animate={
          isInView
            ? { width: "60%", opacity: 1 }
            : { width: 0, opacity: 0 }
        }
        transition={{ duration: 1.2, ease: [0.65, 0, 0.35, 1] }}
      />
    </div>
  );
}
