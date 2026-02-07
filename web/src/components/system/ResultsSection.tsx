'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Shield, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface DerivedControl {
  id: string
  title: string
  scope: string
  enforcement_intent: string
  activation_phase: string
  evidence_type: string[]
  because: Record<string, unknown>[]
}

interface RequiredQuestion {
  id: string
  answered: boolean
}

interface ResultsSectionProps {
  derivedControls: DerivedControl[]
  requiredQuestions: RequiredQuestion[]
  questionMetaByFullId: Map<string, { sectionKey: string; sectionTitle: string; text: string }>
  onNavigateToSection: (sectionKey: string) => void
}

export function ResultsSection({
  derivedControls,
  requiredQuestions,
  questionMetaByFullId,
  onNavigateToSection
}: ResultsSectionProps) {
  const missingQuestions = requiredQuestions.filter(q => !q.answered)

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Missing Questions */}
      {missingQuestions.length > 0 ? (
        <Card className="border-2 border-amber-200 dark:border-amber-900/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-amber-900 dark:text-amber-100">
              <AlertCircle className="h-5 w-5" />
              Missing Answers
            </CardTitle>
            <CardDescription>
              {missingQuestions.length} required {missingQuestions.length === 1 ? 'question needs' : 'questions need'} to be answered
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {Array.from(
              missingQuestions.reduce((acc, q) => {
                const meta = questionMetaByFullId.get(q.id)
                const sectionKey = meta?.sectionKey ?? 'base'
                const sectionTitle = meta?.sectionTitle ?? 'System facts'
                const text = meta?.text ?? q.id
                const existing = acc.get(sectionKey) ?? {
                  sectionKey,
                  sectionTitle,
                  items: [] as string[]
                }
                existing.items.push(text)
                acc.set(sectionKey, existing)
                return acc
              }, new Map<string, { sectionKey: string; sectionTitle: string; items: string[] }>())
            ).map(([key, group]) => (
              <Card key={key} className="border-amber-200 bg-amber-50/50 dark:border-amber-900/50 dark:bg-amber-950/20">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-medium text-amber-900 dark:text-amber-100">
                      {group.sectionTitle}
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onNavigateToSection(group.sectionKey)}
                    >
                      Open
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm">
                    {group.items.map((text, i) => (
                      <li key={i} className="flex items-start gap-2 text-amber-800 dark:text-amber-200">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-amber-500" />
                        {text}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 border-green-200 dark:border-green-900/50">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="font-medium text-green-900 dark:text-green-100">
              All required questions are answered
            </span>
          </CardContent>
        </Card>
      )}

      {/* Derived Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            Derived Controls
          </CardTitle>
          <CardDescription>
            {derivedControls.length} {derivedControls.length === 1 ? 'control has' : 'controls have'} been derived from your answers
          </CardDescription>
        </CardHeader>
        <CardContent>
          {derivedControls.length === 0 ? (
            <div className="rounded-lg border-2 border-dashed border-zinc-200 p-8 text-center text-zinc-600 dark:border-zinc-800 dark:text-zinc-400">
              No controls have been derived yet
            </div>
          ) : (
            <div className="space-y-4">
              {derivedControls.map((control, index) => (
                <motion.div
                  key={control.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card className="border-2">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                          {control.title}
                        </h3>
                        <Badge variant="outline" className="shrink-0 font-mono text-xs">
                          {control.id}
                        </Badge>
                      </div>

                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="secondary">scope: {control.scope}</Badge>
                        <Badge variant="secondary">intent: {control.enforcement_intent}</Badge>
                        <Badge variant="secondary">phase: {control.activation_phase}</Badge>
                        {control.evidence_type?.length > 0 && (
                          <Badge variant="secondary">
                            evidence: {control.evidence_type.join(', ')}
                          </Badge>
                        )}
                      </div>

                      {control.because && control.because.length > 0 && (
                        <div className="mt-4">
                          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                            Because
                          </div>
                          <div className="mt-2 space-y-2">
                            {control.because.map((b, i) => (
                              <div
                                key={i}
                                className="rounded-lg border border-zinc-200 bg-zinc-50 p-3 font-mono text-xs dark:border-zinc-800 dark:bg-zinc-900"
                              >
                                {Object.entries(b).map(([key, val]) => (
                                  <div key={key} className="text-zinc-700 dark:text-zinc-300">
                                    {key}: {JSON.stringify(val)}
                                  </div>
                                ))}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
