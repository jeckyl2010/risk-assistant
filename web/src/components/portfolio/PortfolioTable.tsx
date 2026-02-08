"use client";

import { FolderMinus, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type PortfolioRow = {
  id: string;
  derivedControls: number;
  missingAnswers: number;
  activatedDomains: number;
  domains: string[];
};

export function PortfolioTable({ rows }: { rows: PortfolioRow[] }) {
  const router = useRouter();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [removingId, setRemovingId] = useState<string | null>(null);

  const handleRemove = async (id: string) => {
    if (!confirm(`Remove "${id}" from portfolio? The system file will not be deleted.`)) {
      return;
    }

    setRemovingId(id);
    try {
      const res = await fetch("/api/systems/remove", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        throw new Error("Failed to remove system from portfolio");
      }

      router.refresh();
    } catch (error) {
      console.error("Remove error:", error);
      alert("Failed to remove system from portfolio. Please try again.");
      setRemovingId(null);
    }
  };

  const handleDelete = async (id: string) => {
    const msg = `Delete "${id}"? This will DELETE THE FILE and remove it from the portfolio. This action cannot be undone.`;
    if (!confirm(msg)) {
      return;
    }

    setDeletingId(id);
    try {
      const res = await fetch(`/api/systems/${encodeURIComponent(id)}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete system");
      }

      router.refresh();
    } catch (error) {
      console.error("Delete error:", error);
      alert("Failed to delete system. Please try again.");
      setDeletingId(null);
    }
  };

  return (
    <div className="overflow-hidden">
      <table className="w-full">
        <thead className="border-b-2 border-zinc-200 dark:border-zinc-800">
          <tr className="bg-zinc-50/50 dark:bg-zinc-900/50">
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              System
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Controls
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Missing Answers
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Activated Domains
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {rows.map((r) => (
            <tr key={r.id} className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
              <td className="px-6 py-4">
                <Link
                  className="font-semibold text-zinc-900 hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-300"
                  href={`/systems/${encodeURIComponent(r.id)}`}
                >
                  {r.id}
                </Link>
              </td>
              <td className="px-6 py-4">
                <Badge variant="secondary">{r.derivedControls}</Badge>
              </td>
              <td className="px-6 py-4">
                {r.missingAnswers > 0 ? (
                  <Badge variant="warning">{r.missingAnswers}</Badge>
                ) : (
                  <Badge variant="success">0</Badge>
                )}
              </td>
              <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">{r.activatedDomains || "—"}</td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemove(r.id)}
                    disabled={removingId === r.id || deletingId === r.id}
                    className="h-8 gap-1.5 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/30 dark:hover:text-amber-300"
                  >
                    <FolderMinus className="h-3.5 w-3.5" />
                    {removingId === r.id ? "Removing..." : "Remove"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(r.id)}
                    disabled={deletingId === r.id || removingId === r.id}
                    className="h-8 gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {deletingId === r.id ? "Deleting..." : "Delete"}
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
