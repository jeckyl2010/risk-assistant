'use client'

import { motion } from 'framer-motion'
import { CheckCircle2, AlertCircle, Shield, ArrowRight, BarChart3, PieChart as PieChartIcon } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

interface DerivedControl {
  id: string
  title: string
  description?: string
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

  // Analytics data
  const enforcementDistribution = derivedControls.reduce((acc, c) => {
    acc[c.enforcement_intent] = (acc[c.enforcement_intent] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const phaseDistribution = derivedControls.reduce((acc, c) => {
    acc[c.activation_phase] = (acc[c.activation_phase] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const evidenceDistribution = derivedControls.reduce((acc, c) => {
    c.evidence_type?.forEach(type => {
      acc[type] = (acc[type] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  const categoryDistribution = derivedControls.reduce((acc, c) => {
    const prefix = c.id.split('-')[0] // Extract prefix like SEC, DATA, AI, etc.
    acc[prefix] = (acc[prefix] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const enforcementData = Object.entries(enforcementDistribution).map(([name, value]) => ({ name, value }))
  const phaseData = Object.entries(phaseDistribution).map(([name, value]) => ({ name, value }))
  const evidenceData = Object.entries(evidenceDistribution).map(([name, value]) => ({ name, value }))
  const categoryData = Object.entries(categoryDistribution).map(([name, value]) => ({ name, value }))

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#06b6d4', '#f43f5e']

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      {/* Missing Questions */}
      {missingQuestions.length > 0 ? (
        <Card className="bg-gradient-to-br from-amber-50 to-orange-50 shadow-md dark:from-amber-950/30 dark:to-orange-950/30">
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
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 shadow-md dark:from-emerald-950/30 dark:to-teal-950/30">
          <CardContent className="flex items-center gap-3 p-4">
            <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="font-medium text-green-900 dark:text-green-100">
              All required questions are answered
            </span>
          </CardContent>
        </Card>
      )}

      {/* Control Analytics */}
      {derivedControls.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Enforcement Intent */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4" />
                  Enforcement Intent
                </CardTitle>
                <CardDescription className="text-xs">
                  How controls can be enforced
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <PieChart>
                    <Pie
                      data={enforcementData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={60}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {enforcementData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Activation Phase */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <PieChartIcon className="h-4 w-4" />
                  Activation Phase
                </CardTitle>
                <CardDescription className="text-xs">
                  When controls must be satisfied
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={phaseData}>
                    <XAxis dataKey="name" fontSize={11} angle={-45} textAnchor="end" height={80} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {phaseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Evidence Types */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Shield className="h-4 w-4" />
                  Evidence Required
                </CardTitle>
                <CardDescription className="text-xs">
                  Verification methods needed
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={evidenceData}>
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {evidenceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>

          {/* Control Categories */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="h-4 w-4" />
                  Control Categories
                </CardTitle>
                <CardDescription className="text-xs">
                  Distribution by domain
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={categoryData}>
                    <XAxis dataKey="name" fontSize={12} />
                    <YAxis fontSize={12} />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
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
            <div className="rounded-lg border border-dashed border-zinc-300/70 bg-zinc-50/50 p-8 text-center text-zinc-600 backdrop-blur dark:border-zinc-700/70 dark:bg-zinc-900/50 dark:text-zinc-400">
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
                  <Card className="shadow-md">
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
                            {control.title}
                          </h3>
                          {control.description && (
                            <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                              {control.description}
                            </p>
                          )}
                        </div>
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
                                className="rounded-lg border border-zinc-200/50 bg-zinc-50/80 p-3 font-mono text-xs shadow-sm backdrop-blur dark:border-zinc-700/50 dark:bg-zinc-900/80"
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
