"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { FormModal, type FormField } from "@/components/admin/FormModal";
import type { Project } from "@/types";

const formFields: FormField[] = [
  { name: "title", label: "Title", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea", required: true },
  { name: "longDescription", label: "Long Description", type: "textarea" },
  { name: "imageUrl", label: "Image URL", type: "text", placeholder: "https://..." },
  { name: "liveUrl", label: "Live URL", type: "text", placeholder: "https://..." },
  { name: "githubUrl", label: "GitHub URL", type: "text", placeholder: "https://..." },
  { name: "featured", label: "Featured", type: "checkbox" },
  { name: "sortOrder", label: "Sort Order", type: "number" },
];

export default function AdminProjectsPage() {
  const [items, setItems] = useState<Project[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Project | null>(null);

  const fetchItems = async () => {
    try {
      const { data } = await api.get("/api/projects");
      setItems(data.data ?? data);
    } catch (err) {
      console.error("Failed to fetch projects", err);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleCreate = async (data: Record<string, unknown>) => {
    await api.post("/api/projects", data);
    await fetchItems();
    setIsModalOpen(false);
  };

  const handleUpdate = async (data: Record<string, unknown>) => {
    if (!editingItem) return;
    await api.patch(`/api/projects/${editingItem.id}`, data);
    await fetchItems();
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this project?")) return;
    await api.delete(`/api/projects/${id}`);
    await fetchItems();
  };

  const openCreate = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

  const openEdit = (item: Project) => {
    setEditingItem(item);
    setIsModalOpen(true);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-display text-xl text-[var(--text-primary)]">
          Projects
        </h1>
        <Button variant="gold" onClick={openCreate}>
          Add Project
        </Button>
      </div>

      <div className="void-panel overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-[var(--border)]">
              <th className="section-label px-4 py-3">Title</th>
              <th className="section-label px-4 py-3">Tags</th>
              <th className="section-label px-4 py-3">Featured</th>
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
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {item.tags?.map((tag) => (
                      <span
                        key={tag.id}
                        className="text-xs px-2 py-0.5 bg-[var(--gold-ghost)] text-[var(--gold-dim)] border border-[var(--border)] rounded-sm"
                      >
                        {tag.name}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-4 py-3">
                  {item.featured ? (
                    <span className="inline-block w-2 h-2 rounded-full bg-[var(--gold)]" />
                  ) : (
                    <span className="text-[var(--text-dim)]">&mdash;</span>
                  )}
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
                  No projects yet.
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
        title={editingItem ? "Edit Project" : "Add Project"}
        fields={formFields}
        initialValues={
          editingItem
            ? {
                title: editingItem.title,
                description: editingItem.description,
                longDescription: editingItem.longDescription ?? "",
                imageUrl: editingItem.imageUrl ?? "",
                liveUrl: editingItem.liveUrl ?? "",
                githubUrl: editingItem.githubUrl ?? "",
                featured: editingItem.featured,
                sortOrder: editingItem.sortOrder,
              }
            : undefined
        }
        onSubmit={editingItem ? handleUpdate : handleCreate}
      />
    </div>
  );
}
