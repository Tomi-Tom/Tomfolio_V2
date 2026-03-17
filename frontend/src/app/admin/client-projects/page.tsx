"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import api from "@/lib/api";
import type { ClientProject, ClientProjectStatus, User, PaginatedResponse } from "@/types";
import { VoidPanel } from "@/components/ui/VoidPanel";
import { Button } from "@/components/ui/Button";
import { DataTable } from "@/components/admin/DataTable";
import { FormModal, type FormField } from "@/components/admin/FormModal";
import { cn } from "@/lib/utils";

const LIMIT = 20;

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

function formatDate(dateStr: string) {
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

export default function AdminClientProjectsPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<ClientProject>["pagination"] | undefined>();
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clients, setClients] = useState<User[]>([]);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: LIMIT };
      const { data } = await api.get<PaginatedResponse<ClientProject>>("/api/client-projects", { params });
      setProjects(data.data);
      setPagination(data.pagination);
    } catch {
      // auth interceptor handles redirect
    } finally {
      setLoading(false);
    }
  }, [page]);

  const fetchClients = useCallback(async () => {
    try {
      const { data } = await api.get<PaginatedResponse<User>>("/api/admin/users", { params: { limit: 200 } });
      setClients(data.data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  useEffect(() => {
    fetchClients();
  }, [fetchClients]);

  const formFields: FormField[] = useMemo(
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

  const handleCreate = async (data: Record<string, unknown>) => {
    const payload = {
      ...data,
      price: data.price ? Number(data.price) : null,
      startDate: data.startDate || null,
      endDate: data.endDate || null,
    };
    await api.post("/api/client-projects", payload);
    await fetchProjects();
    setIsModalOpen(false);
  };

  const columns = [
    {
      key: "title",
      label: "Title",
      render: (row: ClientProject) => (
        <span className="text-[var(--text-primary)] font-medium">{row.title}</span>
      ),
    },
    {
      key: "client",
      label: "Client",
      render: (row: ClientProject) =>
        row.client ? (
          <span>
            {row.client.firstName} {row.client.lastName}
          </span>
        ) : (
          <span className="text-[var(--text-dim)]">--</span>
        ),
    },
    {
      key: "status",
      label: "Status",
      render: (row: ClientProject) => <StatusBadge status={row.status} />,
    },
    {
      key: "price",
      label: "Price",
      render: (row: ClientProject) => (
        <span className="text-[var(--text-secondary)]">{formatPrice(row.price, row.currency)}</span>
      ),
    },
    {
      key: "createdAt",
      label: "Created",
      render: (row: ClientProject) => (
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
          Client Projects
        </h1>
        <Button variant="gold" onClick={() => setIsModalOpen(true)}>
          New Project
        </Button>
      </div>

      {/* Table */}
      <VoidPanel hoverable={false} className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="section-label gold-pulse">Loading...</span>
          </div>
        ) : (
          <DataTable<ClientProject>
            columns={columns}
            data={projects}
            pagination={pagination}
            onPageChange={setPage}
            onRowClick={(row) => router.push(`/admin/client-projects/${row.id}`)}
          />
        )}
      </VoidPanel>

      {/* New Project Modal */}
      <FormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Client Project"
        fields={formFields}
        onSubmit={handleCreate}
      />
    </motion.div>
  );
}
