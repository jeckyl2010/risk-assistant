'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { HelpCircle, Eye, Edit3 } from 'lucide-react'
import type { Question } from '@/lib/uiTypes'
import { Card, CardContent } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { MarkdownViewer } from '@/components/ui/markdown-viewer'
import { sectionAccent } from '../systemEditor/sectionAccent'

interface QuestionCardProps {
  question: Question
  value: unknown
  reason?: unknown
  onChange: (value: unknown) => void
  onReasonChange: (value: string) => void
  index: number
  domain?: string
}

export function QuestionCard({
  question,
  value,
  reason,
  onChange,
  onReasonChange,
  index,
  domain = 'base'
}: QuestionCardProps) {
  const isAnswered = value !== null
  const [isEditingReason, setIsEditingReason] = useState(false)
  const hasReason = typeof reason === 'string' && reason.trim().length > 0
  const accent = sectionAccent(domain)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className={`group transition-all duration-300 hover:shadow-xl hover:scale-[1.01] ${isAnswered ? `${accent.cardBg} shadow-md` : 'border-zinc-200/30 bg-white/60 dark:border-zinc-700/30 dark:bg-zinc-900/60'}`}>
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
              >
                <div className="flex items-center justify-between">
                  <Label>
                    Reason (optional)
                    <span className="text-xs text-zinc-500 ml-1">• Markdown supported</span>
                  </Label>
                  {hasReason && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsEditingReason(!isEditingReason)}
                      className="h-7 px-2 gap-1.5"
                    >
                      {isEditingReason ? (
                        <>
                          <Eye className="h-3.5 w-3.5" />
                          Preview
                        </>
                      ) : (
                        <>
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit
                        </>
                      )}
                    </Button>
                  )}
                </div>
                {!hasReason || isEditingReason ? (
                  <Textarea
                    value={typeof reason === 'string' ? reason : ''}
                    onChange={(e) => onReasonChange(e.target.value)}
                    placeholder="Explain why this answer was chosen... (Markdown supported: **bold**, *italic*, `code`, lists, links, etc.)"
                    className="min-h-[100px] resize-none font-mono text-xs"
                  />
                ) : (
                  <div className="rounded-lg border border-zinc-200/50 bg-gradient-to-br from-zinc-50/70 to-white p-4 shadow-sm backdrop-blur dark:border-zinc-700/50 dark:from-zinc-900/70 dark:to-zinc-950">
                    <MarkdownViewer content={typeof reason === 'string' ? reason : ''} />
                  </div>
                )}
              </motion.div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
