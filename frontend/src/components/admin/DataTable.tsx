"use client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/Button";

interface Column<T> {
  key: string;
  label: string;
  render?: (row: T) => React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
interface DataTableProps<T extends Record<string, any>> {
  columns: Column<T>[];
  data: T[];
  pagination?: { page: number; limit: number; total: number; totalPages: number };
  onPageChange?: (page: number) => void;
  onRowClick?: (row: T) => void;
  actions?: (row: T) => React.ReactNode;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function DataTable<T extends Record<string, any>>({
  columns,
  data,
  pagination,
  onPageChange,
  onRowClick,
  actions,
}: DataTableProps<T>) {
  return (
    <div className="w-full overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-[var(--void-surface)]">
            {columns.map((col) => (
              <th
                key={col.key}
                className="section-label text-left px-4 py-3 border-b border-[var(--border)]"
              >
                {col.label}
              </th>
            ))}
            {actions && (
              <th className="section-label text-right px-4 py-3 border-b border-[var(--border)]">
                Actions
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              className={cn(
                "border-b border-[var(--border)] transition-colors",
                "hover:bg-[var(--void-elevated)]",
                onRowClick && "cursor-pointer",
              )}
            >
              {columns.map((col) => (
                <td
                  key={col.key}
                  className="px-4 py-3 text-sm text-[var(--text-secondary)]"
                >
                  {col.render
                    ? col.render(row)
                    : (row[col.key] as React.ReactNode) ?? ""}
                </td>
              ))}
              {actions && (
                <td className="px-4 py-3 text-right">
                  <div
                    className="flex items-center justify-end gap-2"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {actions(row)}
                  </div>
                </td>
              )}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length + (actions ? 1 : 0)}
                className="px-4 py-8 text-center text-[var(--text-dim)] text-sm"
              >
                No data found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-4 border-t border-[var(--border)]">
          <Button
            variant="ghost-gold"
            disabled={pagination.page <= 1}
            onClick={() => onPageChange?.(pagination.page - 1)}
            className="disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Previous
          </Button>
          <span className="text-sm text-[var(--text-dim)]">
            Page {pagination.page} of {pagination.totalPages}
          </span>
          <Button
            variant="ghost-gold"
            disabled={pagination.page >= pagination.totalPages}
            onClick={() => onPageChange?.(pagination.page + 1)}
            className="disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
