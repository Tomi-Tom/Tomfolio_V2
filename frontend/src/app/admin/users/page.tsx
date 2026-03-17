"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import api from "@/lib/api";
import type { User, PaginatedResponse } from "@/types";
import { VoidPanel } from "@/components/ui/VoidPanel";
import { Input } from "@/components/ui/Input";
import { DataTable } from "@/components/admin/DataTable";
import { cn } from "@/lib/utils";

const LIMIT = 20;

function getInitials(user: User) {
  return `${user.firstName?.[0] ?? ""}${user.lastName?.[0] ?? ""}`.toUpperCase();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function AdminUsersPage() {
  const [page, setPage] = useState(1);
  const [users, setUsers] = useState<(User & { _count?: { clientProjects?: number } })[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<User>["pagination"] | undefined>();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: LIMIT };
      if (debouncedSearch) params.search = debouncedSearch;
      const { data } = await api.get<PaginatedResponse<User>>("/api/admin/users", { params });
      setUsers(data.data);
      setPagination(data.pagination);
    } catch {
      // auth interceptor will redirect if needed
    } finally {
      setLoading(false);
    }
  }, [page, debouncedSearch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleDelete = async (user: User) => {
    if (!window.confirm(`Are you sure you want to delete ${user.firstName} ${user.lastName}?`)) return;
    try {
      await api.delete(`/api/admin/users/${user.id}`);
      fetchUsers();
    } catch {
      // ignore
    }
  };

  const columns = [
    {
      key: "avatar",
      label: "Avatar",
      render: (row: User) => (
        <div className="w-8 h-8 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/30 flex items-center justify-center">
          <span className="text-xs font-display font-semibold text-[var(--gold)]">
            {getInitials(row)}
          </span>
        </div>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (row: User) => (
        <span className="text-[var(--text-primary)] font-medium">
          {row.firstName} {row.lastName}
        </span>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (row: User) => <span>{row.email}</span>,
    },
    {
      key: "role",
      label: "Role",
      render: (row: User) => (
        <span
          className={cn(
            "inline-block text-xs font-display font-semibold tracking-wider uppercase px-2 py-0.5 rounded",
            row.role === "ADMIN"
              ? "bg-[var(--gold)]/10 text-[var(--gold)]"
              : "bg-white/5 text-[var(--text-dim)]",
          )}
        >
          {row.role}
        </span>
      ),
    },
    {
      key: "provider",
      label: "Provider",
      render: (row: User) => (
        <span className="text-[var(--text-dim)] text-xs uppercase tracking-wider">
          {row.provider ?? "email"}
        </span>
      ),
    },
    {
      key: "projects",
      label: "Projects",
      render: (row: User & { _count?: { clientProjects?: number } }) => (
        <span className="text-[var(--text-secondary)]">
          {row._count?.clientProjects ?? 0}
        </span>
      ),
    },
    {
      key: "createdAt",
      label: "Joined",
      render: (row: User) => (
        <span className="whitespace-nowrap">{formatDate(row.createdAt)}</span>
      ),
    },
  ];

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-display font-semibold text-[var(--text-primary)]">
          Users
        </h1>
      </div>

      {/* Search */}
      <div className="max-w-sm">
        <Input
          placeholder="Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <VoidPanel hoverable={false} className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="section-label gold-pulse">Loading...</span>
          </div>
        ) : (
          <DataTable<User>
            columns={columns}
            data={users}
            pagination={pagination}
            onPageChange={setPage}
            actions={(row) => (
              <>
                <Link
                  href={`/admin/users/${row.id}`}
                  className="p-1.5 rounded hover:bg-[var(--gold-ghost)] transition-colors text-[var(--text-dim)] hover:text-[var(--gold)]"
                  title="View user"
                >
                  {/* Eye icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                </Link>
                <button
                  onClick={() => handleDelete(row)}
                  className="p-1.5 rounded hover:bg-red-500/10 transition-colors text-[var(--text-dim)] hover:text-red-400 cursor-pointer"
                  title="Delete user"
                >
                  {/* Trash icon */}
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <polyline points="3 6 5 6 21 6" />
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </button>
              </>
            )}
          />
        )}
      </VoidPanel>
    </motion.div>
  );
}
