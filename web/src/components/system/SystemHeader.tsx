"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Loader2, Save } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

type SaveState = "idle" | "saving" | "saved" | "error";
type EvalState = "idle" | "running" | "error";

interface SystemHeaderProps {
  id: string;
  modelVersion: string;
  activatedDomains: string[];
  onSave: () => void;
  saveState: SaveState;
  evalState: EvalState;
  derivedControls?: number;
  missingAnswers?: number;
}

export function SystemHeader({
  id,
  modelVersion,
  activatedDomains,
  onSave,
  saveState,
  evalState,
  derivedControls,
  missingAnswers,
}: SystemHeaderProps) {
  return (
    <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
      <div className="rounded-xl border border-zinc-200/60 bg-white p-6 shadow-sm dark:border-zinc-800/60 dark:bg-zinc-900">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-col gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">{id}</h1>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                Model {modelVersion}
              </Badge>
              {activatedDomains.length > 0 ? (
                activatedDomains.map((domain) => (
                  <Badge key={domain} variant="outline" className="text-xs">
                    {domain}
                  </Badge>
                ))
              ) : (
                <Badge variant="outline" className="text-xs">
                  No domains activated
                </Badge>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-3">
            <div className="flex items-center gap-2">
              <Button onClick={onSave} size="sm" disabled={saveState === "saving" || evalState === "running"}>
                {saveState === "saving" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving…
                  </>
                ) : evalState === "running" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Evaluating…
                  </>
                ) : saveState === "saved" ? (
                  <>
                    <CheckCircle2 className="h-4 w-4 text-green-600" />
                    Saved
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>

            {derivedControls !== undefined && missingAnswers !== undefined && (
              <div className="flex items-center gap-3 text-sm">
                <div className="flex items-center gap-1.5">
                  <span className="font-semibold text-zinc-900 dark:text-zinc-50">{derivedControls}</span>
                  <span className="text-zinc-600 dark:text-zinc-400">controls</span>
                </div>
                <div className="h-3 w-px bg-zinc-300 dark:bg-zinc-700" />
                <div className="flex items-center gap-1.5">
                  <span
                    className={`font-semibold ${missingAnswers > 0 ? "text-amber-600 dark:text-amber-400" : "text-green-600 dark:text-green-400"}`}
                  >
                    {missingAnswers}
                  </span>
                  <span className="text-zinc-600 dark:text-zinc-400">missing</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
