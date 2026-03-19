"use client";

import { useEffect, useState, useCallback, type FormEvent } from "react";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export interface FormField {
  name: string;
  label: string;
  type: "text" | "textarea" | "number" | "select" | "checkbox";
  options?: { value: string; label: string }[];
  required?: boolean;
  placeholder?: string;
}

export interface FormModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: FormField[];
  initialValues?: Record<string, unknown>;
  onSubmit: (data: Record<string, unknown>) => Promise<void>;
}

export function FormModal({
  isOpen,
  onClose,
  title,
  fields,
  initialValues,
  onSubmit,
}: FormModalProps) {
  const [values, setValues] = useState<Record<string, unknown>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const defaults: Record<string, unknown> = {};
      fields.forEach((f) => {
        defaults[f.name] =
          initialValues?.[f.name] ?? (f.type === "checkbox" ? false : "");
      });
      setValues(defaults);
    }
  }, [isOpen, initialValues, fields]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose],
  );

  useEffect(() => {
    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      return () => document.removeEventListener("keydown", handleKeyDown);
    }
  }, [isOpen, handleKeyDown]);

  if (!isOpen) return null;

  const handleChange = (name: string, value: unknown) => {
    setValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(values);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="bg-[var(--void-elevated)] max-w-lg w-full p-4 sm:p-6 max-h-[80vh] overflow-y-auto border border-[var(--border)]"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="font-display text-h3 text-[var(--text-primary)] mb-6">
          {title}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field) => {
            if (field.type === "checkbox") {
              return (
                <label
                  key={field.name}
                  className="flex items-center gap-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={!!values[field.name]}
                    onChange={(e) =>
                      handleChange(field.name, e.target.checked)
                    }
                    className="w-4 h-4 accent-[var(--gold)] bg-transparent border border-[var(--border)]"
                  />
                  <span className="section-label">{field.label}</span>
                </label>
              );
            }

            if (field.type === "textarea") {
              return (
                <div key={field.name} className="space-y-1">
                  <label className="section-label">{field.label}</label>
                  <textarea
                    className="input-void min-h-[100px] block resize-y"
                    value={(values[field.name] as string) ?? ""}
                    onChange={(e) =>
                      handleChange(field.name, e.target.value)
                    }
                    required={field.required}
                    placeholder={field.placeholder}
                  />
                </div>
              );
            }

            if (field.type === "select") {
              return (
                <div key={field.name} className="space-y-1">
                  <label className="section-label">{field.label}</label>
                  <select
                    className="input-void bg-[var(--void-surface)] block w-full cursor-pointer"
                    value={(values[field.name] as string) ?? ""}
                    onChange={(e) =>
                      handleChange(field.name, e.target.value)
                    }
                    required={field.required}
                  >
                    <option value="">Select...</option>
                    {field.options?.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              );
            }

            return (
              <Input
                key={field.name}
                label={field.label}
                type={field.type}
                value={(values[field.name] as string | number) ?? ""}
                onChange={(e) =>
                  handleChange(
                    field.name,
                    field.type === "number"
                      ? Number(e.target.value)
                      : e.target.value,
                  )
                }
                required={field.required}
                placeholder={field.placeholder}
              />
            );
          })}

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="ghost-gold"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button type="submit" variant="gold" disabled={loading}>
              {loading ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
