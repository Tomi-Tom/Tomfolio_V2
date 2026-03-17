"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { FormModal, type FormField } from "@/components/admin/FormModal";
import type { Service } from "@/types";

const formFields: FormField[] = [
  { name: "title", label: "Title", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea", required: true },
  { name: "icon", label: "Icon", type: "text", placeholder: "e.g. Code" },
  { name: "sortOrder", label: "Sort Order", type: "number" },
];

export default function AdminServicesPage() {
  const [items, setItems] = useState<Service[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Service | null>(null);

  const fetchItems = async () => {
    try {
      const { data } = await api.get("/api/services");
      setItems(data.data ?? data);
    } catch (err) {
      console.error("Failed to fetch services", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreate = async (data: Record<string, unknown>) => {
    await api.post("/api/services", data);
    await fetchItems();
    setIsModalOpen(false);
  };

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editingItem) return;
    await api.patch(`/api/services/${editingItem.id}`, data);
    await fetchItems();
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service?")) return;
    await api.delete(`/api/services/${id}`);
    await fetchItems();
  };

  const openCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: Service) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl text-[var(--text-primary)]">
          Services
        </h1>
        <Button variant="gold" onClick={openCreate}>
          Add Service
        </Button>
      </div>

      <div className="void-panel overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="section-label px-4 py-3">Title</th>
              <th className="section-label px-4 py-3">Description</th>
              <th className="section-label px-4 py-3">Icon</th>
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
                  {item.title}
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)] max-w-[200px] truncate">
                  {item.description}
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">
                  {item.icon ?? <span className="text-[var(--text-dim)]">&mdash;</span>}
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
                  colSpan={5}
                  className="px-4 py-8 text-center text-[var(--text-dim)]"
                >
                  No services yet.
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
        title={editingItem ? "Edit Service" : "Add Service"}
        fields={formFields}
        initialValues={
          editingItem
            ? {
                title: editingItem.title,
                description: editingItem.description,
                icon: editingItem.icon ?? "",
                sortOrder: editingItem.sortOrder,
              }
            : undefined
        }
        onSubmit={editingItem ? handleUpdate : handleCreate}
      />
    </div>
  );
}
