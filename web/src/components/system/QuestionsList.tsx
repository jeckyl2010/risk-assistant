"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import type { Question } from "@/lib/uiTypes";
import { QuestionCard } from "./QuestionCard";

interface QuestionsListProps {
  title: string;
  description?: string;
  questions: Question[];
  prefix: string;
  domain?: string;
  getValue: (questionId: string) => unknown;
  getReason: (questionId: string) => unknown;
  onChange: (questionId: string, value: unknown) => void;
  onReasonChange: (questionId: string, value: string) => void;
}

export function QuestionsList({
  title,
  description,
  questions,
  prefix: _prefix,
  domain,
  getValue,
  getReason,
  onChange,
  onReasonChange,
}: QuestionsListProps) {
  const answeredCount = questions.filter((q) => getValue(q.id) !== null).length;

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      {/* Section Header */}
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">{title}</h2>
          {description && <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">{description}</p>}
        </div>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {answeredCount}/{questions.length} answered
        </span>
      </div>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-zinc-600 dark:text-zinc-400">No questions in this section</CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {questions.map((q, index) => (
            <QuestionCard
              key={q.id}
              question={q}
              value={getValue(q.id)}
              reason={getReason(q.id)}
              onChange={(v) => onChange(q.id, v)}
              onReasonChange={(v) => onReasonChange(q.id, v)}
              index={index}
              domain={domain}
            />
          ))}
        </div>
      )}
    </motion.div>
  );
}
