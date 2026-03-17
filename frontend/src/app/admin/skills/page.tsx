"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { FormModal, type FormField } from "@/components/admin/FormModal";
import type { Skill } from "@/types";

const formFields: FormField[] = [
  { name: "name", label: "Name", type: "text", required: true },
  {
    name: "level",
    label: "Level",
    type: "select",
    required: true,
    options: [
      { value: "1", label: "1" },
      { value: "2", label: "2" },
      { value: "3", label: "3" },
      { value: "4", label: "4" },
    ],
  },
  { name: "icon", label: "Icon", type: "text", placeholder: "e.g. SiReact" },
  {
    name: "category",
    label: "Category",
    type: "select",
    required: true,
    options: [
      { value: "FRONTEND", label: "Frontend" },
      { value: "BACKEND", label: "Backend" },
      { value: "DEVOPS", label: "DevOps" },
      { value: "DESIGN", label: "Design" },
      { value: "OTHER", label: "Other" },
    ],
  },
  {
    name: "status",
    label: "Status",
    type: "select",
    required: true,
    options: [
      { value: "PROFICIENT", label: "Proficient" },
      { value: "EXPLORING", label: "Exploring" },
    ],
  },
  { name: "sortOrder", label: "Sort Order", type: "number" },
];

export default function AdminSkillsPage() {
  const [items, setItems] = useState<Skill[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Skill | null>(null);

  const fetchItems = async () => {
    try {
      const { data } = await api.get("/api/skills");
      setItems(data.data ?? data);
    } catch (err) {
      console.error("Failed to fetch skills", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreate = async (data: Record<string, unknown>) => {
    await api.post("/api/skills", { ...data, level: Number(data.level) });
    await fetchItems();
    setIsModalOpen(false);
  };

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editingItem) return;
    await api.patch(`/api/skills/${editingItem.id}`, {
      ...data,
      level: Number(data.level),
    });
    await fetchItems();
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this skill?")) return;
    await api.delete(`/api/skills/${id}`);
    await fetchItems();
  };

  const openCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: Skill) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl text-[var(--text-primary)]">
          Skills
        </h1>
        <Button variant="gold" onClick={openCreate}>
          Add Skill
        </Button>
      </div>

      <div className="void-panel overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="section-label px-4 py-3">Name</th>
              <th className="section-label px-4 py-3">Level</th>
              <th className="section-label px-4 py-3">Category</th>
              <th className="section-label px-4 py-3">Status</th>
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
                  {item.level}
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">
                  {item.category}
                </td>
                <td className="px-4 py-3 text-[var(--text-secondary)]">
                  {item.status}
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
                  No skills yet.
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
        title={editingItem ? "Edit Skill" : "Add Skill"}
        fields={formFields}
        initialValues={
          editingItem
            ? {
                name: editingItem.name,
                level: String(editingItem.level),
                icon: editingItem.icon ?? "",
                category: editingItem.category,
                status: editingItem.status,
                sortOrder: editingItem.sortOrder,
              }
            : undefined
        }
        onSubmit={editingItem ? handleUpdate : handleCreate}
      />
    </div>
  );
}
