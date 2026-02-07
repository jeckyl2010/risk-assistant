'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, Eye, Edit3, CheckCircle2, Circle, Sparkles } from 'lucide-react'
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
import { formatBoolean, formatIdentifier } from '@/lib/formatting'
import { SENTINEL_VALUES } from '@/lib/constants'

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
  const [justAnswered, setJustAnswered] = useState(false)
  const hasReason = typeof reason === 'string' && reason.trim().length > 0
  const accent = sectionAccent(domain)

  const handleChange = (newValue: unknown) => {
    const wasUnanswered = value === null
    onChange(newValue)
    if (wasUnanswered && newValue !== null) {
      setJustAnswered(true)
      setTimeout(() => setJustAnswered(false), 1000)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      layout
    >
      <motion.div
        whileHover={{ scale: 1.01, y: -2 }}
        whileTap={{ scale: 0.99 }}
        transition={{ type: "spring", stiffness: 400, damping: 25 }}
      >
        <Card className={`group relative overflow-hidden transition-all duration-300 ${
          isAnswered 
            ? `${accent.cardBg} shadow-lg ring-1 ring-offset-2 ring-zinc-200 dark:ring-zinc-700 ring-offset-white dark:ring-offset-zinc-950` 
            : 'border-zinc-200/40 bg-white/70 dark:border-zinc-700/40 dark:bg-zinc-900/70 shadow-sm hover:shadow-md'
        }`}>
          {/* Answered celebration effect */}
          <AnimatePresence>
            {justAnswered && (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                className="absolute top-4 right-4 z-10"
              >
                <Sparkles className="h-6 w-6 text-yellow-500" />
              </motion.div>
            )}
          </AnimatePresence>

          {/* Progress indicator bar */}
          {isAnswered && (
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              className={`absolute top-0 left-0 right-0 h-1 ${accent.bar} origin-left`}
            />
          )}

          <CardContent className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-start gap-2">
                  <motion.div
                    animate={{
                      scale: isAnswered ? [1, 1.2, 1] : 1,
                      rotate: isAnswered ? [0, 5, -5, 0] : 0,
                    }}
                    transition={{ duration: 0.5 }}
                  >
                    {isAnswered ? (
                      <CheckCircle2 className="h-5 w-5 mt-0.5 shrink-0 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5 mt-0.5 shrink-0 text-zinc-400 dark:text-zinc-600" />
                    )}
                  </motion.div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-zinc-950 dark:group-hover:text-zinc-100 transition-colors">
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
              <motion.div
                animate={{
                  scale: isAnswered ? 1 : 0.95,
                }}
              >
                <Badge variant={isAnswered ? 'success' : 'warning'} className="shadow-sm">
                  {isAnswered ? 'Answered' : 'Pending'}
                </Badge>
              </motion.div>
            </div>

          <div className="mt-4 space-y-3">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Answer</Label>
              {question.type === 'bool' ? (
                <Select
                  value={value === true ? 'true' : value === false ? 'false' : SENTINEL_VALUES.UNSET}
                  onValueChange={(v) => handleChange(v === SENTINEL_VALUES.UNSET ? null : v === 'true')}
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
              ) : question.type === 'enum' && question.allowed ? (
                <Select
                  value={typeof value === 'string' ? value : SENTINEL_VALUES.UNSET}
                  onValueChange={(v) => handleChange(v === SENTINEL_VALUES.UNSET ? null : v)}
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
              ) : question.type === 'set' && question.allowed ? (
                <div className="space-y-2">
                  {question.allowed.map((option) => {
                    const arr = Array.isArray(value) ? value : []
                    const isChecked = arr.includes(option)
                    return (
                      <label
                        key={option}
                        className="flex items-center gap-3 rounded-lg border border-zinc-200/50 bg-white/50 px-4 py-3 hover:bg-zinc-50/80 dark:border-zinc-700/50 dark:bg-zinc-900/50 dark:hover:bg-zinc-800/50 transition-colors cursor-pointer"
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            const newSet = new Set(arr)
                            if (e.target.checked) {
                              newSet.add(option)
                            } else {
                              newSet.delete(option)
                            }
                            const newArr = Array.from(newSet).sort()
                            handleChange(newArr.length > 0 ? newArr : null)
                          }}
                          className="h-4 w-4 rounded border-zinc-300 bg-white text-zinc-900 focus:ring-2 focus:ring-zinc-900 focus:ring-offset-2 dark:border-zinc-600 dark:bg-zinc-800 dark:text-zinc-50 dark:focus:ring-zinc-50"
                        />
                        <span className="text-sm font-medium text-zinc-900 dark:text-zinc-50">
                          {formatIdentifier(option)}
                        </span>
                      </label>
                    )
                  })}
                </div>
              ) : null}
            </div>

            <AnimatePresence mode="wait">
              {isAnswered && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
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
            </AnimatePresence>
          </div>
        </CardContent>
      </Card>
      </motion.div>
    </motion.div>
  )
}
