"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import type { ClientProject, ClientProjectStatus, User, PaginatedResponse } from "@/types";
import { VoidPanel } from "@/components/ui/VoidPanel";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FormModal, type FormField } from "@/components/admin/FormModal";
import { cn } from "@/lib/utils";

const ALL_STATUSES: ClientProjectStatus[] = [
  "QUOTE_PENDING",
  "QUOTE_ACCEPTED",
  "QUOTE_REJECTED",
  "IN_PROGRESS",
  "REVIEW",
  "COMPLETED",
  "CANCELLED",
];

const STATUS_COLORS: Record<ClientProjectStatus, { bg: string; text: string }> = {
  QUOTE_PENDING: { bg: "bg-yellow-500/10", text: "text-yellow-400" },
  QUOTE_ACCEPTED: { bg: "bg-blue-500/10", text: "text-blue-400" },
  QUOTE_REJECTED: { bg: "bg-red-500/10", text: "text-red-400" },
  IN_PROGRESS: { bg: "bg-[var(--gold)]/10", text: "text-[var(--gold)]" },
  REVIEW: { bg: "bg-purple-500/10", text: "text-purple-400" },
  COMPLETED: { bg: "bg-emerald-500/10", text: "text-emerald-400" },
  CANCELLED: { bg: "bg-red-500/10", text: "text-red-400" },
};

function StatusBadge({ status }: { status: ClientProjectStatus }) {
  const colors = STATUS_COLORS[status] ?? { bg: "bg-white/5", text: "text-[var(--text-dim)]" };
  return (
    <span
      className={cn(
        "inline-block text-xs font-display font-semibold tracking-wider uppercase px-2.5 py-0.5 rounded-full",
        colors.bg,
        colors.text,
      )}
    >
      {status.replace(/_/g, " ")}
    </span>
  );
}

function formatDate(dateStr: string | null) {
  if (!dateStr) return "--";
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatPrice(price: number | null, currency: string) {
  if (price == null) return "--";
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(price);
}

function formatDateTime(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminClientProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = params.id as string;

  const [project, setProject] = useState<ClientProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<ClientProjectStatus | "">("");
  const [statusSaving, setStatusSaving] = useState(false);

  // Add update form
  const [updateContent, setUpdateContent] = useState("");
  const [updateImages, setUpdateImages] = useState("");
  const [updateLinks, setUpdateLinks] = useState("");
  const [updateSaving, setUpdateSaving] = useState(false);

  // Edit modal
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [clients, setClients] = useState<User[]>([]);

  const fetchProject = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<ClientProject>(`/api/client-projects/${projectId}`);
      setProject(data);
      setSelectedStatus(data.status);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [projectId]);

  const fetchClients = useCallback(async () => {
    try {
      const { data } = await api.get<PaginatedResponse<User>>("/api/admin/users", { params: { limit: 200 } });
      setClients(data.data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchProject();
    fetchClients();
  }, [fetchProject, fetchClients]);

  const handleStatusUpdate = async () => {
    if (!selectedStatus || selectedStatus === project?.status) return;
    setStatusSaving(true);
    try {
      await api.patch(`/api/client-projects/${projectId}`, { status: selectedStatus });
      await fetchProject();
    } catch {
      // ignore
    } finally {
      setStatusSaving(false);
    }
  };

  const handleAddUpdate = async () => {
    if (!updateContent.trim()) return;
    setUpdateSaving(true);
    try {
      const imageUrls = updateImages
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
      const links = updateLinks
        .split(/[,\n]/)
        .map((s) => s.trim())
        .filter(Boolean);
      await api.post(`/api/client-projects/${projectId}/updates`, {
        content: updateContent,
        imageUrls,
        links,
      });
      setUpdateContent("");
      setUpdateImages("");
      setUpdateLinks("");
      await fetchProject();
    } catch {
      // ignore
    } finally {
      setUpdateSaving(false);
    }
  };

  const handleDeleteUpdate = async (updateId: string) => {
    if (!window.confirm("Delete this update?")) return;
    try {
      await api.delete(`/api/client-projects/${projectId}/updates/${updateId}`);
      await fetchProject();
    } catch {
      // ignore
    }
  };

  const handleDeleteProject = async () => {
    if (!window.confirm("Are you sure you want to delete this project? This cannot be undone.")) return;
    try {
      await api.delete(`/api/client-projects/${projectId}`);
      router.push("/admin/client-projects");
    } catch {
      // ignore
    }
  };

  const editFields: FormField[] = useMemo(
    () => [
      { name: "title", label: "Title", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea", required: true },
      {
        name: "clientId",
        label: "Client",
        type: "select",
        required: true,
        options: clients.map((c) => ({
          value: c.id,
          label: `${c.firstName} ${c.lastName} (${c.email})`,
        })),
      },
      { name: "price", label: "Price", type: "number", placeholder: "0" },
      { name: "startDate", label: "Start Date", type: "text", placeholder: "YYYY-MM-DD" },
      { name: "endDate", label: "End Date", type: "text", placeholder: "YYYY-MM-DD" },
    ],
    [clients],
  );

  const handleEditSubmit = async (data: Record<string, unknown>) => {
    const payload = {
      ...data,
      price: data.price ? Number(data.price) : null,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
    };
    await api.patch(`/api/client-projects/${projectId}`, payload);
    await fetchProject();
    setIsEditOpen(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="section-label gold-pulse">Loading...</span>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--text-dim)] mb-4">Project not found</p>
        <Link href="/admin/client-projects" className="text-[var(--gold)] hover:underline text-sm">
          Back to Client Projects
        </Link>
      </div>
    );
  }

  const updates = project.updates ?? [];

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Back link */}
      <Link
        href="/admin/client-projects"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-dim)] hover:text-[var(--gold)] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Client Projects
      </Link>

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-semibold text-[var(--text-primary)] mb-1">
            {project.title}
          </h1>
          {project.client && (
            <p className="text-sm text-[var(--text-secondary)]">
              {project.client.firstName} {project.client.lastName}
              <span className="text-[var(--text-dim)] ml-2">{project.client.email}</span>
            </p>
          )}
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value as ClientProjectStatus)}
            className="input-void bg-[var(--void-surface)] text-sm cursor-pointer py-1.5 px-3"
          >
            {ALL_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s.replace(/_/g, " ")}
              </option>
            ))}
          </select>
          <Button
            variant="gold"
            onClick={handleStatusUpdate}
            disabled={statusSaving || selectedStatus === project.status}
          >
            {statusSaving ? "Saving..." : "Update Status"}
          </Button>
          <StatusBadge status={project.status} />
        </div>
      </div>

      {/* Info Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Price", value: formatPrice(project.price, project.currency) },
          { label: "Start Date", value: formatDate(project.startDate) },
          { label: "End Date", value: formatDate(project.endDate) },
          { label: "Created", value: formatDate(project.createdAt) },
        ].map((card) => (
          <VoidPanel key={card.label} hoverable={false} className="p-4">
            <p className="section-label mb-1">{card.label}</p>
            <p className="text-lg font-display text-[var(--text-primary)]">{card.value}</p>
          </VoidPanel>
        ))}
      </div>

      {/* Description */}
      <VoidPanel hoverable={false} className="p-6">
        <p className="section-label mb-2">Description</p>
        <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
          {project.description}
        </p>
      </VoidPanel>

      {/* Action buttons */}
      <div className="flex gap-3">
        <Button variant="ghost-gold" onClick={() => setIsEditOpen(true)}>
          Edit Project
        </Button>
        <button
          onClick={handleDeleteProject}
          className="text-xs text-red-400 hover:text-red-300 font-display uppercase tracking-widest transition-colors cursor-pointer px-4 py-2"
        >
          Delete Project
        </button>
      </div>

      {/* Add Update */}
      <VoidPanel hoverable={false} className="p-6 space-y-4">
        <h2 className="font-display text-lg text-[var(--text-primary)]">Add Update</h2>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="section-label">Content</label>
            <textarea
              className="input-void min-h-[100px] block resize-y"
              value={updateContent}
              onChange={(e) => setUpdateContent(e.target.value)}
              placeholder="Describe the update..."
            />
          </div>
          <Input
            label="Image URLs"
            value={updateImages}
            onChange={(e) => setUpdateImages(e.target.value)}
            placeholder="Comma-separated or one per line"
          />
          <Input
            label="Links"
            value={updateLinks}
            onChange={(e) => setUpdateLinks(e.target.value)}
            placeholder="Comma-separated or one per line"
          />
          <Button variant="gold" onClick={handleAddUpdate} disabled={updateSaving || !updateContent.trim()}>
            {updateSaving ? "Posting..." : "Post Update"}
          </Button>
        </div>
      </VoidPanel>

      {/* Updates Timeline */}
      <div>
        <h2 className="font-display text-lg text-[var(--text-primary)] mb-6">
          Updates Timeline
        </h2>
        {updates.length === 0 ? (
          <p className="text-sm text-[var(--text-dim)]">No updates yet.</p>
        ) : (
          <div className="relative pl-8">
            {/* Gold vertical line */}
            <div className="absolute left-3 top-0 bottom-0 w-px bg-[var(--gold)]/30" />

            <AnimatePresence>
              {updates.map((update, i) => (
                <motion.div
                  key={update.id}
                  className="relative mb-6 last:mb-0"
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                >
                  {/* Dot on timeline */}
                  <div className="absolute -left-8 top-3 w-2.5 h-2.5 rounded-full bg-[var(--gold)] border-2 border-[var(--void-base)]" />

                  <VoidPanel hoverable={false} className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <span className="text-xs text-[var(--text-dim)]">
                        {formatDateTime(update.createdAt)}
                      </span>
                      <button
                        onClick={() => handleDeleteUpdate(update.id)}
                        className="p-1 rounded hover:bg-red-500/10 transition-colors text-[var(--text-dim)] hover:text-red-400 cursor-pointer"
                        title="Delete update"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="14"
                          height="14"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <polyline points="3 6 5 6 21 6" />
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </button>
                    </div>
                    <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap mb-3">
                      {update.content}
                    </p>

                    {/* Images */}
                    {update.imageUrls.length > 0 && (
                      <div className="mb-3">
                        <p className="section-label mb-2">Images</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                          {update.imageUrls.map((url, idx) => (
                            <a key={idx} href={url} target="_blank" rel="noopener noreferrer" className="group">
                              <div className="aspect-video rounded-sm overflow-hidden border border-[var(--border)] group-hover:border-[var(--gold-dim)] transition-colors">
                                <img src={url} alt={`Image ${idx + 1}`} className="w-full h-full object-cover" />
                              </div>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Links */}
                    {update.links.length > 0 && (
                      <div>
                        <p className="section-label mb-2">Links</p>
                        <div className="flex flex-wrap gap-2">
                          {update.links.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--gold-ghost)] border border-[var(--gold-dim)] text-xs text-gold hover:bg-[var(--gold)]/15 transition-colors"
                            >
                              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" /><polyline points="15 3 21 3 21 9" /><line x1="10" y1="14" x2="21" y2="3" /></svg>
                              {url.length > 40 ? `${url.slice(0, 40)}...` : url}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </VoidPanel>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <FormModal
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        title="Edit Project"
        fields={editFields}
        initialValues={{
          title: project.title,
          description: project.description,
          clientId: project.clientId,
          price: project.price ?? "",
          startDate: project.startDate?.split("T")[0] ?? "",
          endDate: project.endDate?.split("T")[0] ?? "",
        }}
        onSubmit={handleEditSubmit}
      />
    </motion.div>
  );
}
