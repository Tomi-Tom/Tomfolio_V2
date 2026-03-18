"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import type { ClientProject, ClientProjectStatus, User } from "@/types";
import { VoidPanel } from "@/components/ui/VoidPanel";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

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

type UserWithProjects = User & {
  clientProjects: (ClientProject & { _count: { updates: number } })[];
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const userId = params.id as string;

  const [user, setUser] = useState<UserWithProjects | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRole, setSelectedRole] = useState<"USER" | "ADMIN">("USER");
  const [roleSaving, setRoleSaving] = useState(false);
  const [roleError, setRoleError] = useState("");
  const [deleting, setDeleting] = useState(false);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/api/admin/users/${userId}`);
      setUser(data.data);
      setSelectedRole(data.data.role);
    } catch {
      // auth interceptor will redirect if needed
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const handleRoleUpdate = async () => {
    if (!user || selectedRole === user.role) return;
    setRoleSaving(true);
    setRoleError("");
    try {
      await api.patch(`/api/admin/users/${userId}`, { role: selectedRole });
      await fetchUser();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: { message?: string } } } };
      setRoleError(error.response?.data?.error?.message ?? "Failed to update role");
    } finally {
      setRoleSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this user? This cannot be undone.")) return;
    setDeleting(true);
    try {
      await api.delete(`/api/admin/users/${userId}`);
      router.push("/admin/users");
    } catch {
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="section-label gold-pulse">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="text-center py-20">
        <p className="text-[var(--text-dim)] mb-4">User not found</p>
        <Link href="/admin/users" className="text-[var(--gold)] hover:underline text-sm">
          Back to Users
        </Link>
      </div>
    );
  }

  const initials = `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
  const projects = user.clientProjects ?? [];

  return (
    <motion.div
      className="space-y-8"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Back link */}
      <Link
        href="/admin/users"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--text-dim)] hover:text-[var(--gold)] transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        Back to Users
      </Link>

      {/* User Profile */}
      <VoidPanel hoverable={false} className="overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-[var(--gold-dim)] via-[var(--gold)] to-[var(--gold-dim)]" />
        <div className="p-6 space-y-6">
          {/* Avatar + Name */}
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-[var(--gold-ghost)] border-2 border-[var(--gold-dim)] flex items-center justify-center">
              <span className="text-xl font-display font-semibold text-[var(--gold)]">
                {initials}
              </span>
            </div>
            <div>
              <h1 className="font-display text-2xl text-[var(--text-primary)]">
                {user.firstName} {user.lastName}
              </h1>
              <span
                className={cn(
                  "inline-block text-xs font-display font-semibold tracking-wider uppercase px-2 py-0.5 rounded mt-1",
                  user.role === "ADMIN"
                    ? "bg-[var(--gold)]/10 text-[var(--gold)]"
                    : "bg-white/5 text-[var(--text-dim)]",
                )}
              >
                {user.role}
              </span>
            </div>
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Email */}
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 text-[var(--text-dim)] mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="M22 4l-10 8L2 4" />
              </svg>
              <div>
                <p className="section-label">Email</p>
                <p className="text-sm text-[var(--text-primary)]">{user.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 text-[var(--text-dim)] mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
              </svg>
              <div>
                <p className="section-label">Phone</p>
                <p className="text-sm text-[var(--text-primary)]">{user.phone ?? "--"}</p>
              </div>
            </div>

            {/* Provider */}
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 text-[var(--text-dim)] mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              </svg>
              <div>
                <p className="section-label">Provider</p>
                <p className="text-sm text-[var(--text-primary)] uppercase tracking-wider">
                  {user.provider ?? "email"}
                </p>
              </div>
            </div>

            {/* Member Since */}
            <div className="flex items-start gap-3">
              <svg className="w-4 h-4 text-[var(--text-dim)] mt-0.5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                <line x1="16" y1="2" x2="16" y2="6" />
                <line x1="8" y1="2" x2="8" y2="6" />
                <line x1="3" y1="10" x2="21" y2="10" />
              </svg>
              <div>
                <p className="section-label">Member Since</p>
                <p className="text-sm text-[var(--text-primary)]">{formatDate(user.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </VoidPanel>

      {/* Role Management */}
      <VoidPanel hoverable={false} className="p-6 space-y-4">
        <h2 className="font-display text-lg text-[var(--text-primary)]">Role Management</h2>
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <div className="flex items-center gap-3">
            <label className="section-label whitespace-nowrap">Change Role</label>
            <select
              value={selectedRole}
              onChange={(e) => {
                setSelectedRole(e.target.value as "USER" | "ADMIN");
                setRoleError("");
              }}
              className="input-void bg-[var(--void-surface)] text-sm cursor-pointer py-1.5 px-3"
            >
              <option value="USER">USER</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <Button
            variant="gold"
            onClick={handleRoleUpdate}
            disabled={roleSaving || selectedRole === user.role}
          >
            {roleSaving ? "Saving..." : "Update Role"}
          </Button>
        </div>
        {roleError && (
          <p className="text-sm text-red-400">{roleError}</p>
        )}
      </VoidPanel>

      {/* Client Projects */}
      <div className="space-y-4">
        <h2 className="font-display text-lg text-[var(--text-primary)]">
          Client Projects
          <span className="text-[var(--text-dim)] text-sm ml-2">({projects.length})</span>
        </h2>

        {projects.length === 0 ? (
          <VoidPanel hoverable={false} className="p-6">
            <p className="text-sm text-[var(--text-dim)] text-center">No projects assigned</p>
          </VoidPanel>
        ) : (
          <div className="space-y-3">
            {projects.map((project) => (
              <Link key={project.id} href={`/admin/client-projects/${project.id}`}>
                <VoidPanel className="p-4 hover:border-[var(--gold-dim)] transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <h3 className="text-sm font-display font-semibold text-[var(--text-primary)]">
                        {project.title}
                      </h3>
                      <StatusBadge status={project.status} />
                    </div>
                    <div className="flex items-center gap-4 text-xs text-[var(--text-dim)]">
                      {project.price != null && (
                        <span className="text-[var(--text-secondary)]">
                          {formatPrice(project.price, project.currency)}
                        </span>
                      )}
                      <span>{formatDate(project.createdAt)}</span>
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                        </svg>
                        {project._count.updates} update{project._count.updates !== 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </VoidPanel>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Danger Zone */}
      <VoidPanel hoverable={false} className="border-red-500/30 overflow-hidden">
        <div className="h-1 w-full bg-gradient-to-r from-red-500/30 via-red-500 to-red-500/30" />
        <div className="p-6 space-y-4">
          <h2 className="font-display text-lg text-red-400">Danger Zone</h2>
          <p className="text-sm text-[var(--text-dim)]">
            Permanently delete this user and all associated data. This action cannot be undone.
          </p>
          <Button
            variant="gold"
            onClick={handleDelete}
            disabled={deleting}
            className="!bg-red-500/10 !text-red-400 !border-red-500/30 hover:!bg-red-500/20"
          >
            {deleting ? "Deleting..." : "Delete User"}
          </Button>
        </div>
      </VoidPanel>
    </motion.div>
  );
}
