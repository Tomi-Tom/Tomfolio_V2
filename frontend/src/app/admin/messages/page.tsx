"use client";

import { useCallback, useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "@/lib/api";
import type { Message, PaginatedResponse } from "@/types";
import { VoidPanel } from "@/components/ui/VoidPanel";
import { DataTable } from "@/components/admin/DataTable";
import { cn } from "@/lib/utils";

type Filter = "all" | "unread" | "read";

const FILTERS: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Unread", value: "unread" },
  { label: "Read", value: "read" },
];

const LIMIT = 20;

export default function AdminMessagesPage() {
  const [filter, setFilter] = useState<Filter>("all");
  const [page, setPage] = useState(1);
  const [messages, setMessages] = useState<Message[]>([]);
  const [pagination, setPagination] = useState<PaginatedResponse<Message>["pagination"] | undefined>();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string | number> = { page, limit: LIMIT };
      if (filter !== "all") params.filter = filter;
      const { data } = await api.get<PaginatedResponse<Message>>("/api/contact", { params });
      setMessages(data.data);
      setPagination(data.pagination);
    } catch {
      // silently handle — auth interceptor will redirect if needed
    } finally {
      setLoading(false);
    }
  }, [page, filter]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  const handleFilterChange = (f: Filter) => {
    setFilter(f);
    setPage(1);
    setExpandedId(null);
  };

  const toggleRead = async (msg: Message) => {
    try {
      await api.patch(`/api/contact/${msg.id}/read`);
      fetchMessages();
    } catch {
      // ignore
    }
  };

  const deleteMessage = async (msg: Message) => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;
    try {
      await api.delete(`/api/contact/${msg.id}`);
      fetchMessages();
    } catch {
      // ignore
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const columns = [
    {
      key: "createdAt",
      label: "Date",
      render: (row: Message) => (
        <span className="whitespace-nowrap">{formatDate(row.createdAt)}</span>
      ),
    },
    {
      key: "name",
      label: "Name",
      render: (row: Message) => (
        <span className="text-[var(--text-primary)] font-medium">
          {row.firstName} {row.lastName}
        </span>
      ),
    },
    {
      key: "email",
      label: "Email",
      render: (row: Message) => <span>{row.email}</span>,
    },
    {
      key: "phone",
      label: "Phone",
      render: (row: Message) => <span>{row.phone ?? "-"}</span>,
    },
    {
      key: "content",
      label: "Message",
      render: (row: Message) => (
        <span className="text-[var(--text-dim)]">
          {row.content.length > 50 ? `${row.content.slice(0, 50)}...` : row.content}
        </span>
      ),
    },
    {
      key: "isRead",
      label: "Status",
      render: (row: Message) => (
        <span className="flex items-center gap-2">
          <span
            className={cn(
              "inline-block w-2 h-2 rounded-full",
              row.isRead ? "bg-[var(--text-dim)]" : "bg-[var(--gold)]",
            )}
          />
          <span className={cn("text-xs", row.isRead ? "text-[var(--text-dim)]" : "text-[var(--gold)]")}>
            {row.isRead ? "Read" : "Unread"}
          </span>
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-display font-semibold text-[var(--text-primary)]">
        Messages
      </h1>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => handleFilterChange(f.value)}
            className={cn(
              "px-4 py-1.5 rounded-full text-xs font-display font-semibold tracking-wider uppercase transition-colors cursor-pointer",
              filter === f.value
                ? "bg-[var(--gold)] text-black"
                : "bg-[var(--void-elevated)] text-[var(--text-dim)] hover:text-[var(--text-secondary)]",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <VoidPanel hoverable={false} className="overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <span className="section-label gold-pulse">Loading...</span>
          </div>
        ) : (
          <>
            <DataTable<Message>
              columns={columns}
              data={messages}
              pagination={pagination}
              onPageChange={setPage}
              onRowClick={(row) => toggleExpand(row.id)}
              actions={(row) => (
                <>
                  <button
                    onClick={() => toggleRead(row)}
                    className="p-1.5 rounded hover:bg-[var(--gold-ghost)] transition-colors text-[var(--text-dim)] hover:text-[var(--gold)] cursor-pointer"
                    title={row.isRead ? "Mark as unread" : "Mark as read"}
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
                      {row.isRead ? (
                        <>
                          <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                          <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                          <line x1="1" y1="1" x2="23" y2="23" />
                        </>
                      ) : (
                        <>
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                          <circle cx="12" cy="12" r="3" />
                        </>
                      )}
                    </svg>
                  </button>
                  <button
                    onClick={() => deleteMessage(row)}
                    className="p-1.5 rounded hover:bg-red-500/10 transition-colors text-[var(--text-dim)] hover:text-red-400 cursor-pointer"
                    title="Delete message"
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

            {/* Expanded message rows */}
            {messages.map((msg) => (
              <AnimatePresence key={msg.id}>
                {expandedId === msg.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden border-b border-[var(--border)] bg-[var(--void-elevated)]"
                  >
                    <div className="px-6 py-4">
                      <p className="section-label mb-2">Full Message</p>
                      <p className="text-sm text-[var(--text-secondary)] leading-relaxed whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            ))}
          </>
        )}
      </VoidPanel>
    </div>
  );
}
