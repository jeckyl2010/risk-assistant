'use client'

import { useEffect, useMemo, useState } from 'react'
import { toast } from 'sonner'
import { FileText, GitCompare, BarChart3 } from 'lucide-react'
import type { Question, TriggerRule } from '@/lib/uiTypes'
import { deepDelete, deepGet, deepSet, type Facts } from './facts'
import { domainTitle } from './sectionAccent'
import { SystemHeader } from '../system/SystemHeader'
import { ErrorAlert } from '../system/ErrorAlert'
import { SystemSidebar } from '../system/SystemSidebar'
import { DescriptionSection } from '../system/DescriptionSection'
import { QuestionsList } from '../system/QuestionsList'
import { ResultsSection } from '../system/ResultsSection'
import { DiffSection } from '../system/DiffSection'

type EvaluateResponse = {
  modelDir: string
  modelVersion: string
  result: {
    activated_domains: string[]
    required_questions: { id: string; answered: boolean }[]
    derived_controls: Array<{
      id: string
      title: string
      scope: string
      enforcement_intent: string
      activation_phase: string
      evidence_type: string[]
      because: Record<string, unknown>[]
    }>
  }
}

type DiffResponse = {
  old: { modelDir: string; modelVersion: string }
  new: { modelDir: string; modelVersion: string }
  controls: { added: string[]; removed: string[] }
  questions: { newlyMissing: string[]; noLongerMissing: string[] }
  activatedDomains: { old: string[]; new: string[] }
}

function matchesCondition(facts: Facts, cond: Record<string, unknown>): boolean {
  for (const [k, expected] of Object.entries(cond)) {
    const actual = k.includes('.') ? deepGet(facts, k) : deepGet(facts, `base.${k}`)
    if (Array.isArray(actual) && !Array.isArray(expected)) {
      if (!actual.includes(expected)) return false
    } else {
      if (actual !== expected) return false
    }
  }
  return true
}

function deriveActivatedDomainsFromTriggers(facts: Facts, triggers: TriggerRule[]): string[] {
  const activated = new Set<string>()
  for (const t of triggers ?? []) {
    const cond = t.when ?? {}
    if (matchesCondition(facts, cond)) {
      for (const d of t.activate ?? []) activated.add(d)
    }
  }
  return Array.from(activated).sort()
}

export function SystemEditor({
  id,
  initialFacts,
  model,
  baseQuestions,
  domainQuestions,
  triggers,
}: {
  id: string
  initialFacts: Facts
  model: { modelDir: string; modelVersion: string }
  baseQuestions: Question[]
  domainQuestions: Record<string, Question[]>
  triggers: TriggerRule[]
}) {
  const [facts, setFacts] = useState<Facts>(() => ({ scope: 'system', base: {}, ...initialFacts }))
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle')
  const [evalState, setEvalState] = useState<'idle' | 'running' | 'error'>('idle')
  const [diffState, setDiffState] = useState<'idle' | 'running' | 'error'>('idle')
  const [evaluateResult, setEvaluateResult] = useState<EvaluateResponse | null>(null)
  const [diffResult, setDiffResult] = useState<DiffResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [activeSection, setActiveSection] = useState<string>('description')

  const activatedDomains = useMemo(() => deriveActivatedDomainsFromTriggers(facts, triggers), [facts, triggers])

  async function save() {
    setError(null)
    setSaveState('saving')
    try {
      const res = await fetch(`/api/systems/${encodeURIComponent(id)}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ facts }),
      })
      if (!res.ok) throw new Error(`Save failed: ${res.status}`)
      setSaveState('saved')
      toast.success('System saved successfully')
      setTimeout(() => setSaveState('idle'), 2000)
    } catch (e: unknown) {
      setSaveState('error')
      const message = e instanceof Error ? e.message : 'Save failed'
      setError(message)
      toast.error(message)
    }
  }

  async function runEvaluate() {
    setError(null)
    setEvalState('running')
    try {
      const res = await fetch('/api/evaluate', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ facts, modelDir: model.modelDir }),
      })
      if (!res.ok) throw new Error(`Evaluate failed: ${res.status}`)
      const json = (await res.json()) as EvaluateResponse
      setEvaluateResult(json)
      setEvalState('idle')
      toast.success('Evaluation completed')
      setActiveSection('results')
    } catch (e: unknown) {
      setEvalState('error')
      const message = e instanceof Error ? e.message : 'Evaluate failed'
      setError(message)
      toast.error(message)
    }
  }

  async function runDiff(oldModelDir: string, newModelDir: string) {
    setError(null)
    setDiffState('running')
    try {
      const res = await fetch('/api/diff', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ facts, oldModelDir, newModelDir }),
      })
      if (!res.ok) throw new Error(`Diff failed: ${res.status}`)
      const json = (await res.json()) as DiffResponse
      setDiffResult(json)
      setDiffState('idle')
      toast.success('Diff completed')
    } catch (e: unknown) {
      setDiffState('error')
      const message = e instanceof Error ? e.message : 'Diff failed'
      setError(message)
      toast.error(message)
    }
  }

  const questionSections: Array<{ key: string; title: string; questions: Question[]; prefix: string }> = useMemo(() => {
    return [
      { key: 'base', title: domainTitle('base'), questions: baseQuestions, prefix: 'base' },
      ...activatedDomains.map((d) => ({ 
        key: d, 
        title: domainTitle(d), 
        questions: domainQuestions[d] ?? [], 
        prefix: d 
      })),
    ]
  }, [activatedDomains, baseQuestions, domainQuestions])

  const questionProgress = useMemo(() => {
    const out: Record<string, { answered: number; total: number }> = {}
    for (const s of questionSections) {
      let answered = 0
      for (const q of s.questions) {
        const v = deepGet(facts, `${s.prefix}.${q.id}`)
        if (v !== null) answered++
      }
      out[s.key] = { answered, total: s.questions.length }
    }
    return out
  }, [facts, questionSections])

  const questionMetaByFullId = useMemo(() => {
    const m = new Map<string, { sectionKey: string; sectionTitle: string; text: string }>()
    for (const s of questionSections) {
      for (const q of s.questions) {
        m.set(`${s.prefix}.${q.id}`, { sectionKey: s.key, sectionTitle: s.title, text: q.text })
      }
    }
    return m
  }, [questionSections])

  const sidebarItems = useMemo(() => {
    const items: Array<{
      id: string
      label: string
      icon?: React.ReactNode
      badge?: string | number
      variant?: 'default' | 'success' | 'warning'
    }> = [
      {
        id: 'description',
        label: 'Overview',
        icon: <FileText className="h-4 w-4" />,
      },
    ]

    questionSections.forEach((s) => {
      const progress = questionProgress[s.key]
      items.push({
        id: s.key,
        label: s.title,
        badge: progress ? `${progress.answered}/${progress.total}` : undefined,
        variant: progress && progress.answered === progress.total ? 'success' as const : progress && progress.answered > 0 ? 'warning' as const : 'default' as const,
      })
    })

    items.push(
      {
        id: 'results',
        label: 'Results',
        icon: <BarChart3 className="h-4 w-4" />,
        badge: evaluateResult ? evaluateResult.result.derived_controls.length : undefined,
      },
      {
        id: 'diff',
        label: 'Diff',
        icon: <GitCompare className="h-4 w-4" />,
      }
    )

    return items
  }, [questionSections, questionProgress, evaluateResult])

  useEffect(() => {
    if (activeSection === 'description' || activeSection === 'base' || activeSection === 'results' || activeSection === 'diff') return
    const stillValid = questionSections.some((s) => s.key === activeSection)
    if (!stillValid) setActiveSection('base')
  }, [activeSection, questionSections])

  const getValue = (sectionKey: string, questionId: string) => {
    const section = questionSections.find(s => s.key === sectionKey)
    if (!section) return null
    return deepGet(facts, `${section.prefix}.${questionId}`)
  }

  const getReason = (sectionKey: string, questionId: string) => {
    const section = questionSections.find(s => s.key === sectionKey)
    if (!section) return null
    return deepGet(facts, `${section.prefix}._reasons.${questionId}`)
  }

  const handleQuestionChange = (sectionKey: string, questionId: string, value: unknown) => {
    const section = questionSections.find(s => s.key === sectionKey)
    if (!section) return
    const path = `${section.prefix}.${questionId}`
    setFacts(prev => deepSet(prev, path, value))
  }

  const handleReasonChange = (sectionKey: string, questionId: string, value: string) => {
    const section = questionSections.find(s => s.key === sectionKey)
    if (!section) return
    const path = `${section.prefix}._reasons.${questionId}`
    const trimmed = value.trim()
    setFacts(prev => trimmed ? deepSet(prev, path, value) : deepDelete(prev, path))
  }

  const currentSection = questionSections.find(s => s.key === activeSection)

  return (
    <div className="flex flex-col gap-6">
      <SystemHeader
        id={id}
        modelVersion={model.modelVersion}
        activatedDomains={activatedDomains}
        onSave={save}
        onEvaluate={runEvaluate}
        saveState={saveState}
        evalState={evalState}
        derivedControls={evaluateResult?.result.derived_controls.length}
        missingAnswers={evaluateResult?.result.required_questions.filter(q => !q.answered).length}
      />

      {error && <ErrorAlert message={error} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="lg:sticky lg:top-6 lg:self-start">
          <SystemSidebar
            items={sidebarItems}
            activeId={activeSection}
            onNavigate={setActiveSection}
          />
        </aside>

        <main>
          {activeSection === 'description' && (
            <DescriptionSection
              description={typeof facts.description === 'string' ? facts.description : ''}
              onChange={(value) => setFacts(prev => deepSet(prev, 'description', value))}
            />
          )}

          {currentSection && (
            <QuestionsList
              title={currentSection.title}
              questions={currentSection.questions}
              prefix={currentSection.prefix}
              getValue={(qid) => getValue(currentSection.key, qid)}
              getReason={(qid) => getReason(currentSection.key, qid)}
              onChange={(qid, value) => handleQuestionChange(currentSection.key, qid, value)}
              onReasonChange={(qid, value) => handleReasonChange(currentSection.key, qid, value)}
            />
          )}

          {activeSection === 'results' && evaluateResult && (
            <ResultsSection
              derivedControls={evaluateResult.result.derived_controls}
              requiredQuestions={evaluateResult.result.required_questions}
              questionMetaByFullId={questionMetaByFullId}
              onNavigateToSection={setActiveSection}
            />
          )}

          {activeSection === 'diff' && (
            <DiffSection
              onRunDiff={runDiff}
              diffResult={diffResult}
              isRunning={diffState === 'running'}
            />
          )}
        </main>
      </div>
    </div>
  )
}
