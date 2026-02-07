'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, AlertCircle, Shield, ArrowRight, BarChart3, PieChart as PieChartIcon, ChevronDown, Filter, X, GitBranch } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tooltip as InfoTooltip } from '@/components/ui/tooltip'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { 
  formatPhase, 
  formatReferenceType, 
  formatScope, 
  formatEnforcementIntent, 
  formatEvidenceType 
} from '@/lib/formatting'

interface DerivedControl {
  id: string
  title: string
  description?: string
  scope: string
  enforcement_intent: string
  activation_phase: string
  evidence_type: string[]
  because: Record<string, unknown>[]
  references?: Array<{
    type: string
    ref: string
    description?: string
  }>
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
  const [activePhase, setActivePhase] = useState<string>('all')
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [expandedControls, setExpandedControls] = useState<string[]>([])

  const missingQuestions = requiredQuestions.filter(q => !q.answered)

  // Analytics data
  const enforcementDistribution = derivedControls.reduce((acc, c) => {
    acc[c.enforcement_intent] = (acc[c.enforcement_intent] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const phaseDistribution = derivedControls.reduce((acc, c) => {
    const formattedPhase = formatPhase(c.activation_phase)
    acc[formattedPhase] = (acc[formattedPhase] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const evidenceDistribution = derivedControls.reduce((acc, c) => {
    c.evidence_type?.forEach(type => {
      acc[type] = (acc[type] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)

  const categoryDistribution = derivedControls.reduce((acc, c) => {
    const prefix = c.id.split('-')[0]
    acc[prefix] = (acc[prefix] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const enforcementData = Object.entries(enforcementDistribution).map(([name, value]) => ({ name, value }))
  const phaseData = Object.entries(phaseDistribution).map(([name, value]) => ({ name, value }))
  const evidenceData = Object.entries(evidenceDistribution).map(([name, value]) => ({ name, value }))
  const categoryData = Object.entries(categoryDistribution).map(([name, value]) => ({ name, value }))

  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#06b6d4', '#f43f5e']

  // Get unique categories
  const categories = Array.from(new Set(derivedControls.map(c => c.id.split('-')[0]))).sort()

  // Filter controls
  const filteredControls = derivedControls.filter(control => {
    const controlCategory = control.id.split('-')[0]
    const matchesPhase = activePhase === 'all' || control.activation_phase === activePhase
    const matchesCategory = selectedCategories.length === 0 || selectedCategories.includes(controlCategory)
    return matchesPhase && matchesCategory
  })

  // Group by phase for counts
  const phases = ['plan', 'build', 'deploy', 'run', 'operate']
  const phaseCounts = phases.reduce((acc, phase) => {
    acc[phase] = derivedControls.filter(c => c.activation_phase === phase).length
    return acc
  }, {} as Record<string, number>)

  const toggleCategory = (category: string) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter(c => c !== category))
    } else {
      setSelectedCategories([...selectedCategories, category])
    }
  }

  const toggleExpanded = (controlId: string) => {
    if (expandedControls.includes(controlId)) {
      setExpandedControls(expandedControls.filter(id => id !== controlId))
    } else {
      setExpandedControls([...expandedControls, controlId])
    }
  }

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
                  <InfoTooltip content="How you can enforce this control: manual (human process), semi-automated (tools assist), or automated (fully automated enforcement)." />
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
                  <InfoTooltip content="When in your development lifecycle this control must be satisfied: Plan (design), Build (development), Deploy (release), Run (runtime), or Operate (ongoing)." />
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
                  <InfoTooltip content="What type of proof is needed to demonstrate this control is working: logs, configurations, attestations, test results, documentation, or audit trails." />
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
            <InfoTooltip content="Security and compliance controls automatically determined based on your system's characteristics and answers. These help you understand what safeguards are needed." />
          </CardTitle>
          <CardDescription>
            {derivedControls.length} {derivedControls.length === 1 ? 'control has' : 'controls have'} been derived from your answers
            {filteredControls.length < derivedControls.length && (
              <span className="ml-1 text-zinc-500">
                ({filteredControls.length} shown)
              </span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {derivedControls.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-300/70 bg-zinc-50/50 p-8 text-center text-zinc-600 backdrop-blur dark:border-zinc-700/70 dark:bg-zinc-900/50 dark:text-zinc-400">
              No controls have been derived yet
            </div>
          ) : (
            <>
              {/* Phase Tabs */}
              <div className="flex flex-wrap items-center gap-2 border-b border-zinc-200 pb-3 dark:border-zinc-700">
                <Button
                  size="sm"
                  variant={activePhase === 'all' ? 'default' : 'ghost'}
                  onClick={() => setActivePhase('all')}
                  className="h-8"
                >
                  All ({derivedControls.length})
                </Button>
                {phases.map(phase => (
                  <Button
                    key={phase}
                    size="sm"
                    variant={activePhase === phase ? 'default' : 'ghost'}
                    onClick={() => setActivePhase(phase)}
                    className="h-8"
                  >
                    {formatPhase(phase)} ({phaseCounts[phase] || 0})
                  </Button>
                ))}
              </div>

              {/* Category Filters */}
              {categories.length > 1 && (
                <div className="flex flex-wrap items-center gap-2">
                  <Filter className="h-4 w-4 text-zinc-500" />
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                    Filter by category:
                  </span>
                  {categories.map(category => (
                    <Badge
                      key={category}
                      variant={selectedCategories.includes(category) ? 'default' : 'outline'}
                      className="cursor-pointer transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800"
                      onClick={() => toggleCategory(category)}
                    >
                      {category}
                      {selectedCategories.includes(category) && (
                        <X className="ml-1 h-3 w-3" />
                      )}
                    </Badge>
                  ))}
                  {selectedCategories.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setSelectedCategories([])}
                      className="h-6 text-xs"
                    >
                      Clear filters
                    </Button>
                  )}
                </div>
              )}

              {/* Controls List */}
              <AnimatePresence mode="popLayout">
                {filteredControls.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="rounded-lg border border-dashed border-zinc-300/70 bg-zinc-50/50 p-8 text-center text-zinc-600 backdrop-blur dark:border-zinc-700/70 dark:bg-zinc-900/50 dark:text-zinc-400"
                  >
                    No controls match the selected filters
                  </motion.div>
                ) : (
                  <div className="space-y-2">
                    {filteredControls.map((control, index) => {
                      const isExpanded = expandedControls.includes(control.id)
                      return (
                        <motion.div
                          key={control.id}
                          layout
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ delay: Math.min(index * 0.03, 0.3) }}
                        >
                          <Card
                            className="cursor-pointer shadow-sm transition-all hover:shadow-md"
                            onClick={() => toggleExpanded(control.id)}
                          >
                            <CardContent className="p-4">
                              {/* Compact Header */}
                              <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                  <div className="flex items-center gap-2">
                                    <Badge variant="outline" className="shrink-0 font-mono text-xs">
                                      {control.id}
                                    </Badge>
                                    <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">
                                      {control.title}
                                    </h3>
                                  </div>
                                  {!isExpanded && (
                                    <div className="mt-2 flex flex-wrap gap-2">
                                      <Badge variant="secondary" className="text-xs">
                                        {formatPhase(control.activation_phase)}
                                      </Badge>
                                      <Badge variant="secondary" className="text-xs">
                                        {control.enforcement_intent}
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                                <ChevronDown
                                  className={`h-5 w-5 shrink-0 text-zinc-500 transition-transform ${
                                    isExpanded ? 'rotate-180' : ''
                                  }`}
                                />
                              </div>

                              {/* Expanded Details */}
                              <AnimatePresence>
                                {isExpanded && (
                                  <motion.div
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: 'auto', opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="overflow-hidden"
                                  >
                                    <div className="mt-3 space-y-3 border-t border-zinc-200 pt-3 dark:border-zinc-700">
                                      {control.description && (
                                        <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                          {control.description}
                                        </p>
                                      )}

                                      <div className="flex flex-wrap gap-2">
                                        <Badge variant="secondary">scope: {formatScope(control.scope)}</Badge>
                                        <Badge variant="secondary">
                                          intent: {formatEnforcementIntent(control.enforcement_intent)}
                                        </Badge>
                                        <Badge variant="secondary">
                                          phase: {formatPhase(control.activation_phase)}
                                        </Badge>
                                        {control.evidence_type?.length > 0 && (
                                          <Badge variant="secondary">
                                            evidence: {control.evidence_type.map(formatEvidenceType).join(', ')}
                                          </Badge>
                                        )}
                                      </div>

                                      {control.because && control.because.length > 0 && (
                                        <div>
                                          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                                            <GitBranch className="h-3 w-3" />
                                            Derivation Path
                                          </div>
                                          
                                          {/* Visual Flow Diagram */}
                                          <div className="mt-3 overflow-x-auto pb-2">
                                            <div className="flex items-center gap-2 min-w-max">
                                              {/* Facts Nodes */}
                                              {control.because.map((fact, i) => (
                                                <div key={i} className="flex items-center">
                                                  <div className="group relative">
                                                    <div className="rounded-lg border-2 border-indigo-200 bg-gradient-to-br from-indigo-50 to-blue-50 px-3 py-2 shadow-sm dark:border-indigo-700 dark:from-indigo-950/50 dark:to-blue-950/50">
                                                      {Object.entries(fact).map(([key, val], idx) => (
                                                        <div key={idx} className="flex items-center gap-1.5 text-xs">
                                                          <span className="font-semibold text-indigo-700 dark:text-indigo-300">
                                                            {key}:
                                                          </span>
                                                          <span className="font-mono text-indigo-900 dark:text-indigo-100">
                                                            {JSON.stringify(val)}
                                                          </span>
                                                        </div>
                                                      ))}
                                                    </div>
                                                  </div>
                                                  {i < control.because.length - 1 && (
                                                    <div className="flex items-center px-2">
                                                      <div className="h-0.5 w-6 bg-gradient-to-r from-indigo-300 to-purple-300 dark:from-indigo-600 dark:to-purple-600" />
                                                      <div className="h-0 w-0 border-y-4 border-l-4 border-y-transparent border-l-purple-300 dark:border-l-purple-600" />
                                                    </div>
                                                  )}
                                                </div>
                                              ))}
                                              
                                              {/* Arrow to Control */}
                                              <div className="flex items-center px-2">
                                                <div className="h-0.5 w-8 bg-gradient-to-r from-purple-300 to-emerald-300 dark:from-purple-600 dark:to-emerald-600" />
                                                <div className="h-0 w-0 border-y-4 border-l-4 border-y-transparent border-l-emerald-300 dark:border-l-emerald-600" />
                                              </div>
                                              
                                              {/* Control Node */}
                                              <div className="rounded-lg border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50 px-4 py-2 shadow-md dark:border-emerald-700 dark:from-emerald-950/50 dark:to-teal-950/50">
                                                <div className="flex items-center gap-2">
                                                  <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                                                  <span className="font-semibold text-sm text-emerald-900 dark:text-emerald-100">
                                                    {control.id}
                                                  </span>
                                                </div>
                                              </div>
                                            </div>
                                          </div>
                                        </div>
                                      )}

                                      {/* Implementation References */}
                                      {control.references && control.references.length > 0 && (
                                        <div>
                                          <div className="text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-2">
                                            Implementation
                                          </div>
                                          <div className="space-y-1.5">
                                            {control.references.map((ref, i) => {
                                              const isUrl = ref.ref.startsWith('http://') || ref.ref.startsWith('https://')
                                              const isFilePath = !isUrl
                                              
                                              // Subtle color coding by type
                                              const typeColors: Record<string, string> = {
                                                requirement: 'border-violet-200 bg-violet-50/50 dark:border-violet-800 dark:bg-violet-950/30',
                                                work_item: 'border-blue-200 bg-blue-50/50 dark:border-blue-800 dark:bg-blue-950/30',
                                                test: 'border-emerald-200 bg-emerald-50/50 dark:border-emerald-800 dark:bg-emerald-950/30',
                                                documentation: 'border-amber-200 bg-amber-50/50 dark:border-amber-800 dark:bg-amber-950/30',
                                              }
                                              
                                              const typeBadgeColors: Record<string, string> = {
                                                requirement: 'border-violet-300 text-violet-700 dark:border-violet-600 dark:text-violet-300',
                                                work_item: 'border-blue-300 text-blue-700 dark:border-blue-600 dark:text-blue-300',
                                                test: 'border-emerald-300 text-emerald-700 dark:border-emerald-600 dark:text-emerald-300',
                                                documentation: 'border-amber-300 text-amber-700 dark:border-amber-600 dark:text-amber-300',
                                              }
                                              
                                              const containerColor = typeColors[ref.type] || 'border-zinc-200 bg-zinc-50/50 dark:border-zinc-700 dark:bg-zinc-800/50'
                                              const badgeColor = typeBadgeColors[ref.type] || 'border-zinc-300 text-zinc-700 dark:border-zinc-600 dark:text-zinc-300'
                                              
                                              return (
                                                <div
                                                  key={i}
                                                  className={`flex items-start gap-2 rounded-md border px-2.5 py-1.5 text-xs ${containerColor}`}
                                                >
                                                  <Badge variant="outline" className={`mt-0.5 text-[10px] ${badgeColor}`}>
                                                    {formatReferenceType(ref.type)}
                                                  </Badge>
                                                  <div className="flex-1 min-w-0">
                                                    {isUrl ? (
                                                      <a
                                                        href={ref.ref}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="text-blue-600 hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300 break-all"
                                                      >
                                                        {ref.description || ref.ref}
                                                      </a>
                                                    ) : (
                                                      <span className="font-mono text-zinc-700 dark:text-zinc-300">
                                                        {ref.ref}
                                                      </span>
                                                    )}
                                                    {ref.description && isUrl && (
                                                      <div className="mt-0.5 text-[11px] text-zinc-500 dark:text-zinc-400 break-all">
                                                        {ref.ref}
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              )
                                            })}
                                          </div>
                                        </div>
                                      )}
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </CardContent>
                          </Card>
                        </motion.div>
                      )
                    })}
                  </div>
                )}
              </AnimatePresence>
            </>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
