"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { useAuth } from "@/hooks/useAuth";
import api from "@/lib/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { VoidPanel } from "@/components/ui/VoidPanel";
import { SectionLabel } from "@/components/ui/SectionLabel";
import type { UserData, ClientProject, ProjectUpdate, ClientProjectStatus } from "@/types";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: [0.65, 0, 0.35, 1] as const },
  }),
};

function SectionHeader({ accent = "gold", number, title }: { accent?: string; number: string; title: string }) {
  const colorClass = accent === "red" ? "bg-red-500/50" : "bg-gold";
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className={`w-1 h-8 ${colorClass} rounded-full`} />
      <div>
        <span className="font-display text-[0.6rem] text-gold tracking-[0.3em] uppercase opacity-40">
          {number}
        </span>
        <h2 className="font-display text-h3 -mt-0.5">{title}</h2>
      </div>
    </div>
  );
}

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

export default function DashboardPage() {
  const { user, isLoading, logout } = useAuth();
  const router = useRouter();

  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [userData, setUserData] = useState<UserData[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [expandedProject, setExpandedProject] = useState<string | null>(null);

  const [message, setMessage] = useState("");
  const [subject, setSubject] = useState("");
  const [sendingMsg, setSendingMsg] = useState(false);
  const [msgStatus, setMsgStatus] = useState<"idle" | "success" | "error">("idle");

  const profileRef = useRef(null);
  const projectsRef = useRef(null);
  const messageRef = useRef(null);
  const dataRef = useRef(null);
  const profileInView = useInView(profileRef, { once: true });
  const projectsInView = useInView(projectsRef, { once: true });
  const messageInView = useInView(messageRef, { once: true });
  const dataInView = useInView(dataRef, { once: true });

  useEffect(() => {
    if (!isLoading && !user) router.push("/login");
  }, [isLoading, user, router]);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName);
      setLastName(user.lastName);
      setPhone(user.phone || "");
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchData = async () => {
      try {
        const { data } = await api.get("/api/users/me/data");
        setUserData(Array.isArray(data) ? data : data.data ?? []);
      } catch {
        // No data
      } finally {
        setLoadingData(false);
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const fetchProjects = async () => {
      try {
        const { data } = await api.get("/api/client-projects/me");
        setProjects(Array.isArray(data) ? data : data.data ?? []);
      } catch {
        // No projects
      } finally {
        setLoadingProjects(false);
      }
    };
    fetchProjects();
  }, [user]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="relative">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-[var(--border)] border-t-[var(--gold)]" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-2 h-2 rounded-full bg-gold gold-pulse" />
          </div>
        </div>
        <span className="hud-caption text-[var(--text-dim)] tracking-[0.2em]">Initializing...</span>
      </div>
    );
  }

  if (!user) return null;

  const handleSave = async () => {
    setSaving(true);
    setSaveSuccess(false);
    try {
      await api.patch("/api/users/me", { firstName, lastName, phone: phone || null });
      setSaveSuccess(true);
      setTimeout(() => {
        setIsEditing(false);
        setSaveSuccess(false);
        window.location.reload();
      }, 1500);
    } catch {
      // Handle error
    } finally {
      setSaving(false);
    }
  };

  const handleSendMessage = async () => {
    if (!message.trim() || message.length < 10) return;
    setSendingMsg(true);
    setMsgStatus("idle");
    try {
      await api.post("/api/contact", {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone || undefined,
        content: subject ? `[${subject}] ${message}` : message,
      });
      setMsgStatus("success");
      setMessage("");
      setSubject("");
      setTimeout(() => setMsgStatus("idle"), 4000);
    } catch {
      setMsgStatus("error");
      setTimeout(() => setMsgStatus("idle"), 4000);
    } finally {
      setSendingMsg(false);
    }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action is irreversible.",
    );
    if (!confirmed) return;
    try {
      await api.delete("/api/users/me");
      await logout();
      router.push("/");
    } catch {
      // Handle error
    }
  };

  const accountType = user.provider === "google" ? "Google" : "Email";
  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  return (
    <div className="space-y-20">
      {/* ═══ Welcome Header ═══ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="flex items-start justify-between">
          <SectionLabel>Dashboard</SectionLabel>
          <button
            onClick={logout}
            className="flex items-center gap-2 text-[var(--text-dim)] hover:text-red-400 transition-colors group"
          >
            <span className="hud-caption tracking-[0.15em]">Logout</span>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform group-hover:translate-x-0.5">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
          </button>
        </div>
        <h1 className="font-display text-h1 mt-3 leading-tight">
          Welcome back,
          <br />
          <span
            className="text-gold"
            style={{
              background: "linear-gradient(135deg, var(--gold) 0%, #ffd700 50%, var(--gold) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            {user.firstName}
          </span>
        </h1>
        <div className="flex items-center gap-4 mt-3">
          <span className="hud-caption text-[var(--text-dim)] tracking-[0.15em]">
            Member since {memberSince}
          </span>
          <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
          <span className="hud-caption text-[var(--text-dim)] tracking-[0.15em]">
            {accountType} account
          </span>
          <span className="w-1 h-1 rounded-full bg-[var(--border)]" />
          <span className="relative flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-50" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-400" />
            </span>
            <span className="hud-caption text-green-400 tracking-[0.15em]">Active</span>
          </span>
        </div>
      </motion.div>

      {/* ═══ Profile Card ═══ */}
      <motion.section
        ref={profileRef}
        initial="hidden"
        animate={profileInView ? "visible" : "hidden"}
      >
        <SectionHeader number="01" title="Profile" />

        <VoidPanel hoverable={false} className="p-0 overflow-hidden">
          {/* Gold gradient top accent */}
          <div className="h-1 w-full bg-gradient-to-r from-[var(--gold-dim)] via-[var(--gold)] to-[var(--gold-dim)]" />

          <div className="p-8">
            <div className="flex items-start gap-6">
              {/* Avatar */}
              <div className="relative shrink-0">
                <div className="w-24 h-24 rounded-full bg-[var(--gold-ghost)] border-2 border-[var(--gold-dim)] flex items-center justify-center text-gold text-3xl font-display uppercase">
                  {user.firstName[0]}
                  {user.lastName[0]}
                </div>
                {/* Status dot */}
                <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[var(--void-deep)]" />
              </div>

              {/* Info grid */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-2xl text-[var(--text-primary)] font-bold">
                    {user.firstName} {user.lastName}
                  </h3>
                  <Button variant="ghost-gold" onClick={() => setIsEditing(!isEditing)}>
                    {isEditing ? "Cancel" : "Edit"}
                  </Button>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-x-8 gap-y-4">
                  {[
                    {
                      label: "Email",
                      value: user.email,
                      icon: (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <rect x="2" y="4" width="20" height="16" rx="2" />
                          <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                        </svg>
                      ),
                    },
                    {
                      label: "Phone",
                      value: user.phone || "Not set",
                      icon: (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                      ),
                    },
                    {
                      label: "Role",
                      value: user.role,
                      icon: (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                        </svg>
                      ),
                    },
                    {
                      label: "Provider",
                      value: accountType,
                      icon: (
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" />
                        </svg>
                      ),
                    },
                  ].map((field) => (
                    <div key={field.label} className="flex items-start gap-2.5">
                      <span className="text-gold opacity-50 mt-0.5">{field.icon}</span>
                      <div>
                        <span className="hud-caption text-[var(--text-dim)] block tracking-[0.15em]">
                          {field.label}
                        </span>
                        <span className="text-sm text-[var(--text-secondary)] mt-0.5 block">
                          {field.value}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Edit form */}
            <AnimatePresence>
              {isEditing && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] as const }}
                  className="overflow-hidden"
                >
                  <div className="space-y-4 border-t border-[var(--border)] pt-6 mt-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input label="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                      <Input label="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                    <Input label="Phone" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+33 6 12 34 56 78" />
                    <div className="flex items-center gap-3 pt-2">
                      <Button variant="gold" onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : saveSuccess ? "Saved" : "Save Changes"}
                      </Button>
                      {saveSuccess && <span className="text-green-400 text-sm">Profile updated!</span>}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </VoidPanel>
      </motion.section>

      {/* ═══ My Projects ═══ */}
      <motion.section
        ref={projectsRef}
        initial="hidden"
        animate={projectsInView ? "visible" : "hidden"}
      >
        <SectionHeader number="02" title="My Projects" />

        {loadingProjects ? (
          <VoidPanel hoverable={false} className="p-8">
            <div className="flex items-center justify-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border border-[var(--border)] border-t-[var(--gold)]" />
              <span className="hud-caption text-[var(--text-dim)] tracking-[0.15em]">Loading projects...</span>
            </div>
          </VoidPanel>
        ) : projects.length === 0 ? (
          <VoidPanel hoverable={false} className="p-8">
            <p className="text-sm text-[var(--text-dim)] text-center">
              No projects yet. When you start working with Tom, your projects will appear here.
            </p>
          </VoidPanel>
        ) : (
          <div className="space-y-4">
            {projects.map((project, i) => (
              <motion.div key={project.id} custom={i} variants={fadeUp}>
                <VoidPanel hoverable={false} className="p-0 overflow-hidden">
                  {/* Gold gradient top bar */}
                  <div className="h-1 w-full bg-gradient-to-r from-[var(--gold-dim)] via-[var(--gold)] to-[var(--gold-dim)]" />

                  <div className="p-6">
                    {/* Header row */}
                    <div className="flex items-center justify-between gap-4 mb-3">
                      <h3 className="font-display text-lg font-semibold text-[var(--text-primary)]">
                        {project.title}
                      </h3>
                      <StatusBadge status={project.status} />
                    </div>

                    {/* Description */}
                    {project.description && (
                      <p className="text-sm text-[var(--text-secondary)] mb-4">{project.description}</p>
                    )}

                    {/* Info row */}
                    <div className="flex items-center gap-5 text-xs text-[var(--text-dim)]">
                      {project.price != null && (
                        <span className="flex items-center gap-1.5">
                          <span className="text-gold opacity-60">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>
                          </span>
                          <span className="font-display font-semibold text-[var(--text-secondary)]">
                            {project.currency === "EUR" ? "€" : project.currency}{project.price}
                          </span>
                        </span>
                      )}
                      {project.startDate && (
                        <span className="flex items-center gap-1.5">
                          <span className="text-gold opacity-60">
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>
                          </span>
                          Started {new Date(project.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                        </span>
                      )}
                      <span className="flex items-center gap-1.5">
                        <span className="text-gold opacity-60">
                          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                        </span>
                        Updated {new Date(project.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </span>
                    </div>

                    {/* Expandable updates timeline */}
                    {project.updates && project.updates.length > 0 && (
                      <div className="mt-5 border-t border-[var(--border)] pt-4">
                        <button
                          onClick={() => setExpandedProject(expandedProject === project.id ? null : project.id)}
                          className="flex items-center gap-2 text-xs font-display text-gold hover:text-[var(--text-primary)] transition-colors cursor-pointer"
                        >
                          <motion.svg
                            width="12"
                            height="12"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            animate={{ rotate: expandedProject === project.id ? 90 : 0 }}
                            transition={{ duration: 0.2 }}
                          >
                            <polyline points="9 18 15 12 9 6" />
                          </motion.svg>
                          <span className="tracking-[0.15em] uppercase">
                            Updates ({project.updates.length})
                          </span>
                        </button>

                        <AnimatePresence>
                          {expandedProject === project.id && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3, ease: [0.65, 0, 0.35, 1] as const }}
                              className="overflow-hidden"
                            >
                              <div className="mt-4 ml-1 relative">
                                {/* Gold vertical line */}
                                <div className="absolute left-[5px] top-2 bottom-2 w-px bg-gradient-to-b from-[var(--gold)] via-[var(--gold-dim)] to-transparent" />

                                <div className="space-y-5">
                                  {[...project.updates]
                                    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
                                    .map((update: ProjectUpdate) => (
                                      <div key={update.id} className="flex gap-4 pl-0">
                                        {/* Timeline dot */}
                                        <div className="relative shrink-0">
                                          <div className="w-[11px] h-[11px] rounded-full bg-[var(--void-deep)] border-2 border-[var(--gold)] mt-1" />
                                        </div>

                                        <div className="flex-1 min-w-0">
                                          <span className="hud-caption text-[var(--text-dim)] tracking-[0.1em] text-[0.65rem]">
                                            {new Date(update.createdAt).toLocaleDateString("en-US", {
                                              month: "short",
                                              day: "numeric",
                                              year: "numeric",
                                            })}
                                          </span>
                                          <p className="text-sm text-[var(--text-secondary)] mt-1">
                                            {update.content}
                                          </p>
                                          {update.imageUrls && update.imageUrls.length > 0 && (
                                            <div className="flex gap-2 mt-2 flex-wrap">
                                              {update.imageUrls.map((url, idx) => (
                                                <a
                                                  key={idx}
                                                  href={url}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-xs text-gold hover:underline flex items-center gap-1"
                                                >
                                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><polyline points="21 15 16 10 5 21" /></svg>
                                                  Image {idx + 1}
                                                </a>
                                              ))}
                                            </div>
                                          )}
                                          {update.links && update.links.length > 0 && (
                                            <div className="flex gap-3 mt-2 flex-wrap">
                                              {update.links.map((link, idx) => (
                                                <a
                                                  key={idx}
                                                  href={link}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-xs text-gold hover:underline flex items-center gap-1"
                                                >
                                                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                                                  {new URL(link).hostname}
                                                </a>
                                              ))}
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </VoidPanel>
              </motion.div>
            ))}
          </div>
        )}
      </motion.section>

      {/* ═══ Send Message ═══ */}
      <motion.section
        ref={messageRef}
        initial="hidden"
        animate={messageInView ? "visible" : "hidden"}
      >
        <SectionHeader number="03" title="Send a Message" />

        <VoidPanel hoverable={false} className="p-0 overflow-hidden">
          <div className="h-1 w-full bg-gradient-to-r from-transparent via-[var(--border)] to-transparent" />

          <div className="p-8">
            {/* Sender info */}
            <div className="flex items-center gap-3 pb-5 mb-6 border-b border-[var(--border)]">
              <div className="w-10 h-10 rounded-full bg-[var(--gold-ghost)] border border-[var(--gold-dim)] flex items-center justify-center text-gold text-sm font-display uppercase">
                {user.firstName[0]}{user.lastName[0]}
              </div>
              <div className="flex-1">
                <p className="text-sm text-[var(--text-primary)] font-display font-semibold">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-xs text-[var(--text-dim)]">{user.email}</p>
              </div>
              <span className="hud-caption text-[var(--text-dim)] tracking-[0.15em]">
                From your account
              </span>
            </div>

            <div className="space-y-5">
              <Input
                label="Subject (optional)"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Project inquiry, collaboration, feedback..."
              />

              <div className="space-y-1.5">
                <label className="section-label">Message</label>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message here..."
                  rows={6}
                  className="input-void !border-b-0 border border-[var(--border)] rounded-sm p-4 resize-none focus:border-[var(--gold)] transition-colors"
                />
                <div className="flex justify-between items-center px-1">
                  <span className={`text-xs ${message.length >= 10 ? "text-green-400/60" : "text-[var(--text-dim)]"}`}>
                    {message.length} / 10 min
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-4 pt-2">
                <Button
                  variant="gold"
                  onClick={handleSendMessage}
                  disabled={sendingMsg || message.length < 10}
                >
                  {sendingMsg ? "Sending..." : "Send Message"}
                </Button>

                <AnimatePresence>
                  {msgStatus === "success" && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-green-400 text-sm flex items-center gap-1.5"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                      Sent successfully!
                    </motion.span>
                  )}
                  {msgStatus === "error" && (
                    <motion.span
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-red-400 text-sm"
                    >
                      Failed to send. Try again.
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </VoidPanel>
      </motion.section>

      {/* ═══ Stored Data ═══ */}
      {!loadingData && userData.length > 0 && (
        <motion.section
          ref={dataRef}
          initial="hidden"
          animate={dataInView ? "visible" : "hidden"}
        >
          <SectionHeader number="04" title="Stored Data" />
          <div className="space-y-3">
            {userData.map((item, i) => (
              <motion.div key={item.id} custom={i} variants={fadeUp}>
                <VoidPanel hoverable={false} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-gold opacity-50" />
                        <p className="text-sm font-display text-gold font-semibold">{item.key}</p>
                      </div>
                      <p className="text-xs text-[var(--text-dim)] break-all mt-2 font-mono bg-[var(--void)] p-2 rounded-sm border border-[var(--border)]">
                        {JSON.stringify(item.value, null, 2)}
                      </p>
                    </div>
                    <span className="hud-caption text-[var(--text-dim)] shrink-0">
                      {new Date(item.updatedAt).toLocaleDateString()}
                    </span>
                  </div>
                </VoidPanel>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}

      {/* ═══ Danger Zone ═══ */}
      <section className="pb-8">
        <SectionHeader accent="red" number="05" title="Danger Zone" />

        <VoidPanel hoverable={false} className="p-0 overflow-hidden border-red-500/15">
          <div className="h-px w-full bg-gradient-to-r from-transparent via-red-500/30 to-transparent" />
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-lg border border-red-500/20 bg-red-500/5 flex items-center justify-center shrink-0">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="rgb(239 68 68 / 0.7)" strokeWidth="1.5">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              </div>
              <div>
                <h3 className="font-display text-sm text-red-400 font-semibold">Delete Account</h3>
                <p className="text-xs text-[var(--text-dim)] mt-1 max-w-sm">
                  Permanently delete your account and all associated data. This action cannot be undone.
                </p>
              </div>
            </div>
            <button
              onClick={handleDeleteAccount}
              className="px-5 py-2 border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:border-red-500/50 text-xs font-display uppercase tracking-[0.15em] transition-all cursor-pointer shrink-0"
            >
              Delete
            </button>
          </div>
        </VoidPanel>
      </section>
    </div>
  );
}
