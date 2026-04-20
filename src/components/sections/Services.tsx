"use client";

import { useRef } from "react";
import { useTranslations } from "next-intl";
import { motion, useInView } from "framer-motion";
import { VoidPanel } from "@/components/ui/VoidPanel";
import { SectionLabel } from "@/components/ui/SectionLabel";

const serviceItemKeys = ["uxDesign", "webDev", "threeDInteractive", "consulting"] as const;

const serviceIcons: Record<(typeof serviceItemKeys)[number], string> = {
  uxDesign: "🎨",
  webDev: "⚡",
  threeDInteractive: "🌐",
  consulting: "🔍",
};

const discoveryFeatureKeys = ["first", "commitment", "noFees"] as const;
const standardFeatureKeys = ["ongoing", "support", "flexible"] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.35,
      delay: 0.1 + i * 0.05,
      ease: [0.65, 0, 0.35, 1] as const,
    },
  }),
};

export function Services() {
  const t = useTranslations("services");
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-20px" });

  return (
    <section ref={ref} className="px-8 md:px-16 lg:px-24 py-24">
      <motion.div initial="hidden" animate={isInView ? "visible" : "hidden"}>
        <motion.div custom={0} variants={fadeUp}>
          <SectionLabel>{t("label")}</SectionLabel>
        </motion.div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          {serviceItemKeys.map((key, i) => (
            <motion.div key={key} custom={i + 1} variants={fadeUp}>
              <VoidPanel className="p-0 h-full overflow-hidden group">
                {/* Gold gradient top border */}
                <div className="h-1 w-full bg-gradient-to-r from-[var(--gold-dim)] via-[var(--gold)] to-[var(--gold-dim)]" />

                <div className="p-8">
                  {/* Icon circle */}
                  <div className="w-14 h-14 rounded-full border-2 border-[var(--gold-dim)] flex items-center justify-center text-2xl mb-6 group-hover:border-[var(--gold)] transition-colors duration-300 bg-[rgba(212,175,55,0.05)]">
                    {serviceIcons[key]}
                  </div>

                  <h3 className="font-display font-semibold text-lg text-text-primary tracking-wide">
                    {t(`items.${key}.title`)}
                  </h3>
                  <p className="mt-3 text-text-secondary text-sm leading-relaxed">
                    {t(`items.${key}.description`)}
                  </p>
                  <a
                    href="#contact"
                    className="mt-6 inline-flex items-center gap-2 text-gold hover:text-text-primary transition-colors duration-300 text-sm font-medium group/link"
                    onClick={(e) => {
                      e.preventDefault();
                      document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                    }}
                  >
                    {t("learnMore")}
                    <span className="inline-block transition-transform duration-300 group-hover/link:translate-x-1">
                      &rarr;
                    </span>
                  </a>
                </div>
              </VoidPanel>
            </motion.div>
          ))}
        </div>

        {/* --- Pricing --- */}
        <motion.div custom={serviceItemKeys.length + 2} variants={fadeUp} className="mt-20">
          <SectionLabel>{t("pricing.label")}</SectionLabel>
          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* First engagement — Recommended */}
            <VoidPanel
              hoverable={false}
              className="p-0 relative overflow-hidden border-[var(--gold-dim)]"
            >
              <div className="h-1 w-full bg-gradient-to-r from-[var(--gold-dim)] via-[var(--gold)] to-[var(--gold-dim)]" />

              <div className="absolute top-3 right-0">
                <div className="flex items-center gap-1.5 px-4 py-1.5 bg-gradient-to-r from-[var(--gold)] to-[#c9a027] text-black font-display text-[0.65rem] font-bold tracking-[0.15em] uppercase rounded-l-full shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                  </svg>
                  {t("pricing.discovery.badge")}
                </div>
              </div>

              <div className="p-10 pt-8">
                <p className="hud-caption text-[var(--text-dim)] mb-6 tracking-[0.2em]">
                  {t("pricing.discovery.caption")}
                </p>
                <div className="flex items-baseline gap-3">
                  <span
                    className="font-display text-[3.5rem] font-bold leading-none text-gold"
                    style={{
                      textShadow: "0 0 30px rgba(212,175,55,0.4), 0 0 60px rgba(212,175,55,0.15)",
                    }}
                  >
                    {t("pricing.discovery.amount")}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-display text-xl text-[var(--gold)]">
                      {t("pricing.discovery.currency")}
                    </span>
                    <span className="hud-caption text-[var(--text-dim)]">
                      {t("pricing.discovery.period")}
                    </span>
                  </div>
                </div>
                <p className="mt-6 text-sm text-[var(--text-secondary)] leading-relaxed">
                  {t("pricing.discovery.description")}
                </p>
                <ul className="mt-6 space-y-3">
                  {discoveryFeatureKeys.map((featureKey) => (
                    <li
                      key={featureKey}
                      className="flex items-center gap-3 text-sm text-[var(--text-secondary)]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0 shadow-[0_0_6px_rgba(212,175,55,0.5)]" />
                      {t(`pricing.discovery.features.${featureKey}`)}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className="btn-gold inline-block mt-8"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {t("pricing.discovery.cta")}
                </a>
              </div>
            </VoidPanel>

            {/* Standard rate */}
            <VoidPanel hoverable={false} className="p-0 relative overflow-hidden">
              <div className="h-1 w-full bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />

              <div className="absolute top-3 right-0">
                <div className="px-4 py-1.5 bg-[var(--void-elevated)] text-[var(--text-dim)] font-display text-[0.65rem] font-semibold tracking-[0.15em] uppercase rounded-l-full border border-r-0 border-[var(--border)]">
                  {t("pricing.standard.badge")}
                </div>
              </div>

              <div className="p-10 pt-8">
                <p className="hud-caption text-[var(--text-dim)] mb-6 tracking-[0.2em]">
                  {t("pricing.standard.caption")}
                </p>
                <div className="flex items-baseline gap-3">
                  <span
                    className="font-display text-[3.5rem] font-bold leading-none text-gold"
                    style={{
                      textShadow: "0 0 20px rgba(212,175,55,0.2)",
                    }}
                  >
                    {t("pricing.standard.amount")}
                  </span>
                  <div className="flex flex-col">
                    <span className="font-display text-xl text-[var(--gold-dim)]">
                      {t("pricing.standard.currency")}
                    </span>
                    <span className="hud-caption text-[var(--text-dim)]">
                      {t("pricing.standard.period")}
                    </span>
                  </div>
                </div>
                <p className="mt-6 text-sm text-[var(--text-secondary)] leading-relaxed">
                  {t("pricing.standard.description")}
                </p>
                <ul className="mt-6 space-y-3">
                  {standardFeatureKeys.map((featureKey) => (
                    <li
                      key={featureKey}
                      className="flex items-center gap-3 text-sm text-[var(--text-secondary)]"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-[var(--gold-dim)] shrink-0" />
                      {t(`pricing.standard.features.${featureKey}`)}
                    </li>
                  ))}
                </ul>
                <a
                  href="#contact"
                  className="btn-ghost-gold inline-block mt-8 border border-[var(--gold-dim)]"
                  onClick={(e) => {
                    e.preventDefault();
                    document.getElementById("contact")?.scrollIntoView({ behavior: "smooth" });
                  }}
                >
                  {t("pricing.standard.cta")}
                </a>
              </div>
            </VoidPanel>
          </div>
        </motion.div>
      </motion.div>
    </section>
  );
}
