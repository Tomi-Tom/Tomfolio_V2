"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { FormModal, type FormField } from "@/components/admin/FormModal";
import type { Testimonial } from "@/types";

const formFields: FormField[] = [
  { name: "name", label: "Name", type: "text", required: true },
  { name: "role", label: "Role", type: "text", required: true },
  { name: "company", label: "Company", type: "text" },
  { name: "content", label: "Content", type: "textarea", required: true },
  { name: "avatarUrl", label: "Avatar URL", type: "text", placeholder: "https://..." },
  { name: "sortOrder", label: "Sort Order", type: "number" },
];

export default function AdminTestimonialsPage() {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);

  const fetchItems = async () => {
    try {
      const { data } = await api.get("/api/testimonials");
      setItems(data.data ?? data);
    } catch (err) {
      console.error("Failed to fetch testimonials", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreate = async (data: Record<string, unknown>) => {
    await api.post("/api/testimonials", data);
    await fetchItems();
    setIsModalOpen(false);
  };

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editingItem) return;
    await api.patch(`/api/testimonials/${editingItem.id}`, data);
    await fetchItems();
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this testimonial?")) return;
    await api.delete(`/api/testimonials/${id}`);
    await fetchItems();
  };

  const openCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: Testimonial) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl text-[var(--text-primary)]">
          Testimonials
        </h1>
        <Button variant="gold" onClick={openCreate}>
          Add Testimonial
        </Button>
      </div>

      <div className="void-panel overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="section-label px-4 py-3">Name</th>
              <th className="section-label px-4 py-3">Role</th>
              <th className="section-label px-4 py-3">Company</th>
              <th className="section-label px-4 py-3">Content</th>
              <th className="section-label px-4 py-3">Sort Order</th>
              <th className="section-label px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr
                key={item.id}
                className="border-b border-[var(--border)] last:border-0 hover:bg-[var(--gold-ghost)] transition-colors"
              >
                <td className="px-4 py-3 text-[var(--text-primary)]">
                  {item.name}
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">
                  {item.role}
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">
                  {item.company ?? <span className="text-[var(--text-dim)]">&mdash;</span>}
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)] max-w-[200px] truncate">
                  {item.content}
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">
                  {item.sortOrder}
                </td>
                <td className="px-4 py-3 text-right space-x-2">
                  <button
                    onClick={() => openEdit(item)}
                    className="btn-ghost-gold text-xs"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
                    className="text-xs text-red-400 hover:text-red-300 font-display uppercase tracking-widest transition-colors"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-[var(--text-dim)]"
                >
                  No testimonials yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <FormModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        title={editingItem ? "Edit Testimonial" : "Add Testimonial"}
        fields={formFields}
        initialValues={
          editingItem
            ? {
                name: editingItem.name,
                role: editingItem.role,
                company: editingItem.company ?? "",
                content: editingItem.content,
                avatarUrl: editingItem.avatarUrl ?? "",
                sortOrder: editingItem.sortOrder,
              }
            : undefined
        }
        onSubmit={editingItem ? handleUpdate : handleCreate}
      />
    </div>
  );
}
