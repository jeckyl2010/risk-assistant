"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Circle } from "lucide-react";
import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { MarkdownViewer } from "@/components/ui/markdown-viewer";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { SENTINEL_VALUES } from "@/lib/constants";
import { formatIdentifier } from "@/lib/formatting";
import type { Question } from "@/lib/uiTypes";

interface QuestionCardProps {
  question: Question;
  value: unknown;
  reason?: unknown;
  onChange: (value: unknown) => void;
  onReasonChange: (value: string) => void;
  index: number;
  domain?: string;
}

export function QuestionCard({ question, value, reason, onChange, onReasonChange, index, domain = "base" }: QuestionCardProps) {
  const isAnswered = value !== null;
  const [isEditingReason, setIsEditingReason] = useState(false);
  const hasReason = typeof reason === "string" && reason.trim().length > 0;

  // Domain-specific color mappings
  const domainColors = {
    base: {
      answered:
        "border-l-slate-400/50 hover:border-l-slate-500 hover:bg-slate-50/30 dark:border-l-slate-500/50 dark:hover:border-l-slate-400 dark:hover:bg-slate-900/20",
      unanswered:
        "border-l-transparent hover:border-l-slate-500 hover:bg-slate-50/30 dark:hover:border-l-slate-400 dark:hover:bg-slate-900/20",
    },
    ai: {
      answered:
        "border-l-violet-500/50 hover:border-l-violet-500 hover:bg-violet-50/30 dark:border-l-violet-400/50 dark:hover:border-l-violet-400 dark:hover:bg-violet-950/20",
      unanswered:
        "border-l-transparent hover:border-l-violet-500 hover:bg-violet-50/30 dark:hover:border-l-violet-400 dark:hover:bg-violet-950/20",
    },
    cost: {
      answered:
        "border-l-lime-500/50 hover:border-l-lime-500 hover:bg-lime-50/30 dark:border-l-lime-400/50 dark:hover:border-l-lime-400 dark:hover:bg-lime-950/20",
      unanswered:
        "border-l-transparent hover:border-l-lime-500 hover:bg-lime-50/30 dark:hover:border-l-lime-400 dark:hover:bg-lime-950/20",
    },
    criticality: {
      answered:
        "border-l-amber-500/50 hover:border-l-amber-500 hover:bg-amber-50/30 dark:border-l-amber-400/50 dark:hover:border-l-amber-400 dark:hover:bg-amber-950/20",
      unanswered:
        "border-l-transparent hover:border-l-amber-500 hover:bg-amber-50/30 dark:hover:border-l-amber-400 dark:hover:bg-amber-950/20",
    },
    data: {
      answered:
        "border-l-cyan-500/50 hover:border-l-cyan-500 hover:bg-cyan-50/30 dark:border-l-cyan-400/50 dark:hover:border-l-cyan-400 dark:hover:bg-cyan-950/20",
      unanswered:
        "border-l-transparent hover:border-l-cyan-500 hover:bg-cyan-50/30 dark:hover:border-l-cyan-400 dark:hover:bg-cyan-950/20",
    },
    integration: {
      answered:
        "border-l-sky-500/50 hover:border-l-sky-500 hover:bg-sky-50/30 dark:border-l-sky-400/50 dark:hover:border-l-sky-400 dark:hover:bg-sky-950/20",
      unanswered:
        "border-l-transparent hover:border-l-sky-500 hover:bg-sky-50/30 dark:hover:border-l-sky-400 dark:hover:bg-sky-950/20",
    },
    operations: {
      answered:
        "border-l-teal-500/50 hover:border-l-teal-500 hover:bg-teal-50/30 dark:border-l-teal-400/50 dark:hover:border-l-teal-400 dark:hover:bg-teal-950/20",
      unanswered:
        "border-l-transparent hover:border-l-teal-500 hover:bg-teal-50/30 dark:hover:border-l-teal-400 dark:hover:bg-teal-950/20",
    },
    security: {
      answered:
        "border-l-rose-500/50 hover:border-l-rose-500 hover:bg-rose-50/30 dark:border-l-rose-400/50 dark:hover:border-l-rose-400 dark:hover:bg-rose-950/20",
      unanswered:
        "border-l-transparent hover:border-l-rose-500 hover:bg-rose-50/30 dark:hover:border-l-rose-400 dark:hover:bg-rose-950/20",
    },
  };

  const colors = domainColors[domain as keyof typeof domainColors] || domainColors.base;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
      <Card
        className={`group border-l-4 transition-all hover:shadow-md ${
          isAnswered
            ? `${colors.answered} border-zinc-300 bg-zinc-50/50 shadow-sm dark:border-zinc-700 dark:bg-zinc-900/50`
            : `${colors.unanswered} border-amber-200 bg-amber-50/20 dark:border-amber-900/50 dark:bg-amber-950/10`
        }`}
      >
        <CardContent className="p-5">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 shrink-0">
              {isAnswered ? (
                <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <Circle className="h-5 w-5 text-amber-500 dark:text-amber-400" />
              )}
            </div>

            <div className="flex-1 space-y-4">
              {/* Question */}
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">{question.text}</h3>
                {question.description && (
                  <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{question.description}</p>
                )}
              </div>

              {/* Answer Input */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Answer</Label>
                {question.type === "bool" ? (
                  <Select
                    value={value === true ? "true" : value === false ? "false" : SENTINEL_VALUES.UNSET}
                    onValueChange={(v) => onChange(v === SENTINEL_VALUES.UNSET ? null : v === "true")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an answer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SENTINEL_VALUES.UNSET}>(unset)</SelectItem>
                      <SelectItem value="true">Yes</SelectItem>
                      <SelectItem value="false">No</SelectItem>
                    </SelectContent>
                  </Select>
                ) : question.type === "enum" && question.allowed ? (
                  <Select
                    value={typeof value === "string" ? value : SENTINEL_VALUES.UNSET}
                    onValueChange={(v) => onChange(v === SENTINEL_VALUES.UNSET ? null : v)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select an answer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value={SENTINEL_VALUES.UNSET}>(unset)</SelectItem>
                      {question.allowed.map((v) => (
                        <SelectItem key={v} value={v}>
                          {formatIdentifier(v)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : question.type === "set" && question.allowed ? (
                  <div className="space-y-2">
                    {question.allowed.map((option) => {
                      const arr = Array.isArray(value) ? value : [];
                      const isChecked = arr.includes(option);
                      return (
                        <label
                          key={option}
                          className="flex items-center gap-3 rounded-lg border border-zinc-200/50 bg-white/50 px-4 py-3 hover:bg-zinc-50/80 dark:border-zinc-700/50 dark:bg-zinc-900/50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={(e) => {
                              const newSet = new Set(arr);
                              if (e.target.checked) {
                                newSet.add(option);
                              } else {
                                newSet.delete(option);
                              }
                              const newArr = Array.from(newSet).sort();
                              onChange(newArr.length > 0 ? newArr : null);
                            }}
                            className="h-4 w-4 rounded border-zinc-300 bg-white text-indigo-600 focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-indigo-400 dark:focus:ring-indigo-400"
                          />
                          <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                            {formatIdentifier(option)}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                ) : null}
              </div>

              {/* Reason Field - Show when answered */}
              <AnimatePresence>
                {isAnswered && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                    className="space-y-2"
                  >
                    <Label className="text-sm font-medium">
                      Reason (optional)
                      {!isEditingReason && hasReason && (
                        <button
                          type="button"
                          onClick={() => setIsEditingReason(true)}
                          className="ml-2 text-xs text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                        >
                          Edit
                        </button>
                      )}
                    </Label>
                    {!hasReason || isEditingReason ? (
                      <div className="space-y-2">
                        <Textarea
                          value={typeof reason === "string" ? reason : ""}
                          onChange={(e) => onReasonChange(e.target.value)}
                          onBlur={() => setIsEditingReason(false)}
                          placeholder="Explain why this answer was chosen... (Markdown supported)"
                          className="min-h-[80px] resize-none text-sm"
                          autoFocus={isEditingReason}
                        />
                        <p className="text-xs text-zinc-500">Supports Markdown: **bold**, *italic*, `code`, links, lists</p>
                      </div>
                    ) : (
                      <div className="rounded-lg border border-zinc-200/50 bg-zinc-50/50 p-4 dark:border-zinc-700/50 dark:bg-zinc-900/50">
                        <MarkdownViewer content={typeof reason === "string" ? reason : ""} />
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
