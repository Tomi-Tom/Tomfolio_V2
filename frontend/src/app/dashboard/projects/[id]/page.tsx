"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import { VoidPanel } from "@/components/ui/VoidPanel";
import { cn } from "@/lib/utils";
import type { ClientProject, ClientProjectStatus, ProjectUpdate } from "@/types";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.65, 0, 0.35, 1] as const },
  }),
};

function StatusBadge({ status }: { status: ClientProjectStatus }) {
  const config: Record<ClientProjectStatus, { label: string; color: string }> = {
    QUOTE_PENDING: { label: "Quote Pending", color: "amber" },
    QUOTE_ACCEPTED: { label: "Quote Accepted", color: "blue" },
    QUOTE_REJECTED: { label: "Rejected", color: "red" },
    IN_PROGRESS: { label: "In Progress", color: "gold" },
    REVIEW: { label: "Under Review", color: "purple" },
    COMPLETED: { label: "Completed", color: "green" },
    CANCELLED: { label: "Cancelled", color: "red" },
  };
  const { label, color } = config[status] ?? { label: status, color: "gray" };
  const colorClasses: Record<string, string> = {
    amber: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    blue: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    red: "bg-red-500/15 text-red-400 border-red-500/30",
    gold: "bg-[var(--gold-ghost)] text-gold border-[var(--gold-dim)]",
    purple: "bg-purple-500/15 text-purple-400 border-purple-500/30",
    green: "bg-green-500/15 text-green-400 border-green-500/30",
    gray: "bg-white/5 text-[var(--text-dim)] border-[var(--border)]",
  };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[0.65rem] font-display font-semibold tracking-wide border ${colorClasses[color]}`}
    >
      {label}
    </span>
  );
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCurrency(price: number, currency: string) {
  const symbols: Record<string, string> = { EUR: "\u20AC", USD: "$", GBP: "\u00A3", KRW: "\u20A9" };
  const symbol = symbols[currency] ?? currency;
  return `${symbol}${price.toLocaleString()}`;
}

export default function ProjectDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [project, setProject] = useState<ClientProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const fetchProject = useCallback(async () => {
    try {
      const { data } = await api.get(`/api/client-projects/me/${id}`);
      setProject(data.data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    if (id) fetchProject();
  }, [id, fetchProject]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[var(--border)] border-t-[var(--gold)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-gold gold-pulse" />
          </div>
        </div>
        <span className="hud-caption text-[var(--text-dim)] tracking-[0.2em]">Loading project...</span>
      </div>
    );
  }

  if (notFound || !project) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
        <div className="text-center space-y-3">
          <h1 className="font-display text-h2 text-[var(--text-primary)]">Project Not Found</h1>
          <p className="text-sm text-[var(--text-dim)]">
            This project doesn&apos;t exist or you don&apos;t have access to it.
          </p>
        </div>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gold hover:text-[var(--text-primary)] transition-colors group"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:-translate-x-0.5"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span className="text-sm font-display tracking-wide">Back to Dashboard</span>
        </Link>
      </div>
    );
  }

  const updates = project.updates
    ? [...project.updates].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      )
    : [];

  return (
    <div className="space-y-12">
      {/* ═══ Back Link ═══ */}
      <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
        <Link
          href="/dashboard"
          className="inline-flex items-center gap-2 text-gold hover:text-[var(--text-primary)] transition-colors group"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="transition-transform group-hover:-translate-x-0.5"
          >
            <line x1="19" y1="12" x2="5" y2="12" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
          <span className="text-sm font-display tracking-wide">Back to Dashboard</span>
        </Link>
      </motion.div>

      {/* ═══ Project Header ═══ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0.65, 0, 0.35, 1] }}
      >
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="font-display text-h1">{project.title}</h1>
          <StatusBadge status={project.status} />
        </div>
        {project.description && (
          <p className="text-sm text-[var(--text-secondary)] mt-3 max-w-2xl leading-relaxed">
            {project.description}
          </p>
        )}
      </motion.div>

      {/* ═══ Info Cards ═══ */}
      <motion.div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        initial="hidden"
        animate="visible"
      >
        {[
          {
            label: "Price",
            value: project.price != null ? formatCurrency(project.price, project.currency) : "TBD",
          },
          {
            label: "Start Date",
            value: project.startDate ? formatDate(project.startDate) : "Not set",
          },
          {
            label: "End Date",
            value: project.endDate ? formatDate(project.endDate) : "Ongoing",
          },
          {
            label: "Last Updated",
            value: formatDate(project.updatedAt),
          },
        ].map((card, i) => (
          <motion.div key={card.label} custom={i} variants={fadeUp}>
            <VoidPanel hoverable={false} className="p-5">
              <span className="section-label text-[0.6rem] text-[var(--text-dim)] tracking-[0.2em] uppercase block">
                {card.label}
              </span>
              <span className="text-sm font-display font-semibold text-[var(--text-primary)] mt-1.5 block">
                {card.value}
              </span>
            </VoidPanel>
          </motion.div>
        ))}
      </motion.div>

      {/* ═══ Updates Timeline ═══ */}
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0.65, 0, 0.35, 1] }}
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-1 h-8 bg-gold rounded-full" />
          <div>
            <span className="font-display text-[0.6rem] text-gold tracking-[0.3em] uppercase opacity-40">
              UPDATES
            </span>
            <h2 className="font-display text-h3 -mt-0.5">Project Timeline</h2>
          </div>
        </div>

        {updates.length === 0 ? (
          <VoidPanel hoverable={false} className="p-8">
            <p className="text-sm text-[var(--text-dim)] text-center">No updates yet.</p>
          </VoidPanel>
        ) : (
          <div className="relative ml-1">
            {/* Gold vertical line */}
            <div className="absolute left-[5px] top-2 bottom-2 w-px bg-gradient-to-b from-[var(--gold)] via-[var(--gold-dim)] to-transparent" />

            <div className="space-y-6">
              {updates.map((update, i) => (
                <motion.div
                  key={update.id}
                  custom={i}
                  initial="hidden"
                  animate="visible"
                  variants={fadeUp}
                  className="flex gap-4 pl-0"
                >
                  {/* Timeline dot */}
                  <div className="relative shrink-0">
                    <div className="w-[11px] h-[11px] rounded-full bg-[var(--void-deep)] border-2 border-[var(--gold)] mt-1" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <VoidPanel hoverable={false} className="p-5">
                      <span className="hud-caption text-[var(--text-dim)] tracking-[0.1em] text-[0.65rem]">
                        {new Date(update.createdAt).toLocaleDateString("en-US", {
                          weekday: "short",
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })}
                      </span>

                      <p className="text-sm text-[var(--text-secondary)] mt-2 whitespace-pre-wrap leading-relaxed">
                        {update.content}
                      </p>

                      {update.imageUrls.length > 0 && (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                          {update.imageUrls.map((url, idx) => (
                            <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="group">
                              <div className="aspect-video rounded-sm overflow-hidden border border-[var(--border)] group-hover:border-[var(--gold-dim)] transition-colors">
                                <img
                                  src={url}
                                  alt={`Update image ${idx + 1}`}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </a>
                          ))}
                        </div>
                      )}

                      {update.links.length > 0 && (
                        <div className="flex flex-wrap gap-2 mt-3">
                          {update.links.map((link, idx) => (
                            <a
                              key={idx}
                              href={link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--gold-ghost)] border border-[var(--gold-dim)] text-xs text-gold hover:bg-[var(--gold)]/15 transition-colors"
                            >
                              <svg
                                width="10"
                                height="10"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                              >
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                              </svg>
                              {(() => {
                                try {
                                  return new URL(link).hostname;
                                } catch {
                                  return link;
                                }
                              })()}
                            </a>
                          ))}
                        </div>
                      )}
                    </VoidPanel>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </motion.section>
    </div>
  );
}
