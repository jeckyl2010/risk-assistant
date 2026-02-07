'use client'

import { motion } from 'framer-motion'
import type { Question } from '@/lib/uiTypes'
import { QuestionCard } from './QuestionCard'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface QuestionsListProps {
  title: string
  description?: string
  questions: Question[]
  prefix: string
  getValue: (questionId: string) => unknown
  getReason: (questionId: string) => unknown
  onChange: (questionId: string, value: unknown) => void
  onReasonChange: (questionId: string, value: string) => void
}

export function QuestionsList({
  title,
  description,
  questions,
  prefix,
  getValue,
  getReason,
  onChange,
  onReasonChange
}: QuestionsListProps) {
  const answeredCount = questions.filter(q => getValue(q.id) !== null).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card className="border-2">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>{title}</CardTitle>
            <Badge variant="secondary">
              {answeredCount}/{questions.length} answered
            </Badge>
          </div>
          {description && <CardDescription>{description}</CardDescription>}
        </CardHeader>
      </Card>

      {questions.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-zinc-600 dark:text-zinc-400">
            No questions in this section
          </CardContent>
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
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
