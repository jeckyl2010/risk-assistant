'use client'

import { motion } from 'framer-motion'
import { HelpCircle } from 'lucide-react'
import type { Question } from '@/lib/uiTypes'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'

interface QuestionCardProps {
  question: Question
  value: unknown
  reason?: unknown
  onChange: (value: unknown) => void
  onReasonChange: (value: string) => void
  index: number
}

export function QuestionCard({
  question,
  value,
  reason,
  onChange,
  onReasonChange,
  index
}: QuestionCardProps) {
  const isAnswered = value !== null

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={`transition-all ${isAnswered ? 'border-green-200 dark:border-green-900/50' : 'border-amber-200 dark:border-amber-900/50'}`}>
        <CardContent className="p-6">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-1">
              <div className="flex items-start gap-2">
                <HelpCircle className="h-5 w-5 mt-0.5 shrink-0 text-zinc-500 dark:text-zinc-400" />
                <div className="flex-1">
                  <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                    {question.text}
                  </h3>
                  {question.description && (
                    <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                      {question.description}
                    </p>
                  )}
                </div>
              </div>
            </div>
            <Badge variant={isAnswered ? 'success' : 'warning'}>
              {isAnswered ? 'Answered' : 'Pending'}
            </Badge>
          </div>

          <div className="mt-4 space-y-3">
            <div className="space-y-2">
              <Label>Answer</Label>
              {question.type === 'bool' ? (
                <Select
                  value={value === true ? 'true' : value === false ? 'false' : '__unset__'}
                  onValueChange={(v) => onChange(v === '__unset__' ? null : v === 'true')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an answer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__unset__">(unset)</SelectItem>
                    <SelectItem value="true">true</SelectItem>
                    <SelectItem value="false">false</SelectItem>
                  </SelectContent>
                </Select>
              ) : question.type === 'enum' && question.allowed ? (
                <Select
                  value={typeof value === 'string' ? value : '__unset__'}
                  onValueChange={(v) => onChange(v === '__unset__' ? null : v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select an answer" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="__unset__">(unset)</SelectItem>
                    {question.allowed.map((v) => (
                      <SelectItem key={v} value={v}>
                        {v}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : question.type === 'set' ? (
                <Input
                  value={Array.isArray(value) ? value.join(', ') : ''}
                  onChange={(e) => {
                    const arr = e.target.value
                      .split(',')
                      .map((s) => s.trim())
                      .filter(Boolean)
                    onChange(arr.length ? arr : null)
                  }}
                  placeholder="Enter comma-separated values"
                />
              ) : null}
            </div>

            {isAnswered && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="space-y-2"
              >
                <Label>Reason (optional)</Label>
                <Textarea
                  value={typeof reason === 'string' ? reason : ''}
                  onChange={(e) => onReasonChange(e.target.value)}
                  placeholder="Explain why this answer was chosen..."
                  className="min-h-[80px] resize-none"
                />
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
