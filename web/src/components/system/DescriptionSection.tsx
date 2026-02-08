"use client";

import { motion } from "framer-motion";
import { BarChart3, CheckCircle2, FileText, HelpCircle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";

interface DescriptionSectionProps {
  description: string;
  onChange: (value: string) => void;
  stats?: {
    totalQuestions: number;
    answeredQuestions: number;
    derivedControls?: number;
    domainProgress?: Array<{ domain: string; answered: number; total: number }>;
  };
}

export function DescriptionSection({ description, onChange, stats }: DescriptionSectionProps) {
  const completionRate = stats ? Math.round((stats.answeredQuestions / stats.totalQuestions) * 100) : 0;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="relative overflow-hidden">
        {/* Gradient background accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-500/10 dark:via-purple-500/10 dark:to-pink-500/10" />

        <CardHeader className="relative">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 shadow-sm">
              <FileText className="h-5 w-5 text-white" />
            </div>
            Overview
          </CardTitle>
          <CardDescription>Add context about what this risk assessment covers, assumptions, scope, and links</CardDescription>
        </CardHeader>

        <CardContent className="relative space-y-4">
          {/* Stats Grid */}
          {stats && (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {/* Total Questions */}
              <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <HelpCircle className="h-3.5 w-3.5" />
                  Questions
                </div>
                <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.totalQuestions}</div>
              </div>

              {/* Answered Questions */}
              <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Answered
                </div>
                <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{stats.answeredQuestions}</div>
              </div>

              {/* Completion Rate */}
              <div className="rounded-lg border border-zinc-200 bg-white p-3 dark:border-zinc-800 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Complete
                </div>
                <div className="mt-1 text-2xl font-bold text-zinc-900 dark:text-zinc-100">{completionRate}%</div>
              </div>

              {/* Derived Controls */}
              <div className="rounded-lg border border-indigo-200 bg-gradient-to-br from-indigo-50 to-purple-50 p-3 dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-purple-950/30">
                <div className="flex items-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
                  <BarChart3 className="h-3.5 w-3.5" />
                  Controls
                </div>
                <div className="mt-1 text-2xl font-bold text-indigo-900 dark:text-indigo-100">
                  {stats.derivedControls ?? "—"}
                </div>
              </div>
            </div>
          )}

          {/* Description Textarea */}
          <Textarea
            value={description}
            onChange={(e) => onChange(e.target.value)}
            placeholder="e.g. Risk assessment for the Shopfloor Analytics data pipeline handling production telemetry..."
            className="min-h-[150px] resize-none bg-white dark:bg-zinc-900/50"
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}
