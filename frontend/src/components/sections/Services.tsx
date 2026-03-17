"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import { VoidPanel } from "@/components/ui/VoidPanel";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { Service } from "@/types";

interface ServicesProps {
  services: Service[];
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.6,
      delay: 0.3 + i * 0.1,
      ease: [0.65, 0, 0.35, 1] as const,
    },
  }),
};

export function Services({ services }: ServicesProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="px-8 md:px-16 lg:px-24 py-24">
      <motion.div
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
      >
        <motion.div custom={0} variants={fadeUp}>
          <SectionLabel>Services</SectionLabel>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {services.map((service, i) => (
            <motion.div key={service.id} custom={i + 1} variants={fadeUp}>
              <VoidPanel className="p-6 h-full">
                <div className="text-3xl mb-4">
                  {service.icon ?? "✦"}
                </div>
                <h3 className="font-display font-semibold text-lg text-text-primary">
                  {service.title}
                </h3>
                <p className="mt-2 text-text-secondary text-sm">
                  {service.description}
                </p>
                <a
                  href="#"
                  className="mt-4 inline-block text-gold hover:text-text-primary transition text-sm"
                >
                  Learn more &rarr;
                </a>
              </VoidPanel>
            </motion.div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
