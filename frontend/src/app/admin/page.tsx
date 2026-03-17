"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import type { StatsOverview, StatsPeriod, Message } from "@/types";
import { StatCard } from "@/components/admin/StatCard";
import { StatsChart } from "@/components/admin/StatsChart";
import { VoidPanel } from "@/components/ui/VoidPanel";

export default function AdminDashboardPage() {
  const [overview, setOverview] = useState<StatsOverview | null>(null);
  const [viewsData, setViewsData] = useState<StatsPeriod[]>([]);
  const [messagesData, setMessagesData] = useState<StatsPeriod[]>([]);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [overviewRes, viewsRes, messagesRes, recentRes] = await Promise.all([
          api.get<StatsOverview>("/api/stats/overview"),
          api.get<StatsPeriod[]>("/api/stats/views", { params: { days: 30 } }),
          api.get<StatsPeriod[]>("/api/stats/messages", { params: { days: 30 } }),
          api.get<{ data: Message[] }>("/api/contact", { params: { limit: 5, filter: "unread" } }),
        ]);
        setOverview(overviewRes.data);
        setViewsData(viewsRes.data);
        setMessagesData(messagesRes.data);
        setRecentMessages(recentRes.data.data ?? recentRes.data as unknown as Message[]);
      } catch (err) {
        console.error("Failed to fetch dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="hud-caption text-[var(--text-dim)]">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <h1 className="font-display text-h2 text-text-primary">Dashboard</h1>

      {/* Stat cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard title="Unread Messages" value={overview?.unreadMessages ?? 0} />
        <StatCard title="Messages This Month" value={overview?.totalMessagesThisMonth ?? 0} />
        <StatCard title="Page Views This Month" value={overview?.pageViewsThisMonth ?? 0} />
        <StatCard title="Registered Users" value={overview?.totalUsers ?? 0} />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <StatsChart data={viewsData} title="Page Views (30 days)" />
        <StatsChart data={messagesData} title="Messages (30 days)" />
      </div>

      {/* Recent Messages */}
      <div>
        <h2 className="font-display text-h3 text-text-primary mb-4">Recent Messages</h2>
        {recentMessages.length === 0 ? (
          <p className="hud-caption text-[var(--text-dim)]">No unread messages.</p>
        ) : (
          <div className="space-y-3">
            {recentMessages.map((msg) => (
              <VoidPanel key={msg.id} hoverable={false} className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-display font-semibold text-text-primary truncate">
                      {msg.firstName} {msg.lastName}
                    </p>
                    <p className="hud-caption text-[var(--text-dim)]">{msg.email}</p>
                    <p className="text-sm text-[var(--text-secondary)] mt-1 line-clamp-2">
                      {msg.content}
                    </p>
                  </div>
                  <span className="hud-caption text-[var(--text-dim)] whitespace-nowrap">
                    {new Date(msg.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </VoidPanel>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
