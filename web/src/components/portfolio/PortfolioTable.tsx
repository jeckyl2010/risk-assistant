"use client";

import { ArrowRight, FolderMinus, Trash2 } from "lucide-react";
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
              Missing
            </th>
            <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Domains
            </th>
            <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {rows.map((r) => (
            <tr
              key={r.id}
              className="group cursor-pointer border-l-4 border-l-transparent transition-all hover:border-l-indigo-500 hover:bg-indigo-50/50 dark:hover:border-l-indigo-400 dark:hover:bg-indigo-950/30"
            >
              <td className="px-6 py-4">
                <Link
                  className="font-semibold text-zinc-900 hover:text-indigo-600 dark:text-zinc-50 dark:hover:text-indigo-400 transition-colors"
                  href={`/systems/${encodeURIComponent(r.id)}`}
                >
                  {r.id}
                </Link>
              </td>
              <td className="px-6 py-4">
                <Badge variant="secondary" className="font-mono">
                  {r.derivedControls}
                </Badge>
              </td>
              <td className="px-6 py-4">
                {r.missingAnswers > 0 ? (
                  <Badge variant="warning" className="font-mono">
                    {r.missingAnswers}
                  </Badge>
                ) : (
                  <Badge variant="success" className="font-mono">
                    0
                  </Badge>
                )}
              </td>
              <td className="px-6 py-4">
                {r.domains.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {r.domains.map((domain) => (
                      <Badge key={domain} variant="outline" className="text-xs">
                        {domain}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-sm text-zinc-400">—</span>
                )}
              </td>
              <td className="px-6 py-4">
                <div className="flex items-center justify-end gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    asChild
                    className="h-8 gap-1.5 text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 dark:text-indigo-400 dark:hover:bg-indigo-950/30 dark:hover:text-indigo-300"
                  >
                    <Link href={`/systems/${encodeURIComponent(r.id)}`}>
                      Open
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleRemove(r.id)}
                    disabled={removingId === r.id || deletingId === r.id}
                    className="h-8 gap-1.5 text-amber-600 hover:bg-amber-50 hover:text-amber-700 dark:text-amber-400 dark:hover:bg-amber-950/30 dark:hover:text-amber-300"
                  >
                    <FolderMinus className="h-3.5 w-3.5" />
                    {removingId === r.id ? "..." : "Remove"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDelete(r.id)}
                    disabled={deletingId === r.id || removingId === r.id}
                    className="h-8 gap-1.5 text-red-600 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:hover:bg-red-950/30 dark:hover:text-red-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    {deletingId === r.id ? "..." : "Delete"}
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
