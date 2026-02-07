'use client'

import Link from 'next/link'
import { useEffect, useMemo, useState } from 'react'
import type { Question, TriggerRule } from '@/lib/uiTypes'
import { AutoGrowTextArea } from './AutoGrowTextArea'
import { ConditionLines } from './ConditionLines'
import { QuestionField } from './QuestionField'
import { SectionButton } from './SectionButton'
import { deepDelete, deepGet, deepSet, type Facts } from './facts'
import { domainTitle, sectionAccent } from './sectionAccent'
import styles from './systemEditorStyles.module.css'

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
  const [oldModelDir, setOldModelDir] = useState('model')
  const [newModelDir, setNewModelDir] = useState('model')
  const [error, setError] = useState<string | null>(null)

  const [activeSection, setActiveSection] = useState<string>('description')

  const activatedDomains = useMemo(() => deriveActivatedDomainsFromTriggers(facts, triggers), [facts, triggers])

  const activeAccent = useMemo(() => {
    if (activeSection === 'description') return sectionAccent('overview')
    if (activeSection === 'results') return sectionAccent('results')
    if (activeSection === 'diff') return sectionAccent('diff')
    return sectionAccent(activeSection)
  }, [activeSection])

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
      setTimeout(() => setSaveState('idle'), 900)
    } catch (e: unknown) {
      setSaveState('error')
      setError(e instanceof Error ? e.message : 'Save failed')
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
    } catch (e: unknown) {
      setEvalState('error')
      setError(e instanceof Error ? e.message : 'Evaluate failed')
    }
  }

  async function runDiff() {
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
    } catch (e: unknown) {
      setDiffState('error')
      setError(e instanceof Error ? e.message : 'Diff failed')
    }
  }

  const questionSections: Array<{ key: string; title: string; questions: Question[]; prefix: string }> = useMemo(() => {
    return [
      { key: 'base', title: domainTitle('base'), questions: baseQuestions, prefix: 'base' },
      ...activatedDomains.map((d) => ({ key: d, title: domainTitle(d), questions: domainQuestions[d] ?? [], prefix: d })),
    ]
  }, [activatedDomains, baseQuestions, domainQuestions])

  const activeQuestionSection = questionSections.find((s) => s.key === activeSection) ?? questionSections[0]

  const isQuestionSection = questionSections.some((s) => s.key === activeSection)

  const requiredMissingCount = evaluateResult ? evaluateResult.result.required_questions.filter((q) => !q.answered).length : null

  const derivedControlsCount = evaluateResult ? evaluateResult.result.derived_controls.length : null

  const questionMetaByFullId = useMemo(() => {
    const m = new Map<string, { sectionKey: string; sectionTitle: string; text: string }>()
    for (const s of questionSections) {
      for (const q of s.questions) {
        m.set(`${s.prefix}.${q.id}`, { sectionKey: s.key, sectionTitle: s.title, text: q.text })
      }
    }
    return m
  }, [questionSections])

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

  // If active section is a domain that becomes deactivated, fall back to base.
  useEffect(() => {
    if (activeSection === 'description' || activeSection === 'base' || activeSection === 'results' || activeSection === 'diff') return
    const stillValid = questionSections.some((s) => s.key === activeSection)
    if (!stillValid) setActiveSection('base')
  }, [activeSection, questionSections])

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Link href="/" className={styles.topLink}>
              ← Portfolio
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">{id}</h1>
            <div className="text-sm text-zinc-600 dark:text-zinc-300">
              Model: {model.modelVersion} · Activated domains: {activatedDomains.join(', ') || '(none)'}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button onClick={save} className={styles.secondaryButton}>
              {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : 'Save'}
            </button>
            <button onClick={runEvaluate} className={styles.primaryButton}>
              {evalState === 'running' ? 'Evaluating…' : 'Evaluate'}
            </button>

            {evaluateResult ? (
              <div className={styles.kpiPill}>
                Controls: <span className="ml-1 font-medium">{evaluateResult.result.derived_controls.length}</span>
                <span className="mx-2 text-zinc-300 dark:text-zinc-700">•</span>
                Missing: <span className="ml-1 font-medium">{requiredMissingCount ?? 0}</span>
              </div>
            ) : null}
          </div>
        </div>

        {error ? (
          <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800 dark:border-red-900/60 dark:bg-red-950/30 dark:text-red-200">
            {error}
          </div>
        ) : null}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="flex flex-col gap-3">
          <div className={`${styles.sidebarCard} bg-zinc-50/70 dark:bg-zinc-900/20`}>
            <div className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Sections</div>
            <div className="mt-3 flex flex-col gap-2">
              <SectionButton
                active={activeSection === 'description'}
                title="Overview"
                subtitle="Context, scope, assumptions"
                onClick={() => setActiveSection('description')}
                accent={sectionAccent('overview')}
              />

              <div className="my-1 border-t border-zinc-200/70 dark:border-zinc-800/80" />

              {questionSections.map((s) => (
                <SectionButton
                  key={s.key}
                  active={activeSection === s.key}
                  title={s.title}
                  subtitle={
                    s.questions.length
                      ? `${questionProgress[s.key]?.answered ?? 0}/${questionProgress[s.key]?.total ?? s.questions.length} answered`
                      : 'No questions'
                  }
                  onClick={() => setActiveSection(s.key)}
                  accent={sectionAccent(s.key)}
                />
              ))}

              <div className="my-1 border-t border-zinc-200/70 dark:border-zinc-800/80" />

              <SectionButton
                active={activeSection === 'results'}
                title="Results"
                subtitle={
                  requiredMissingCount === null
                    ? 'Run Evaluate'
                    : `Controls: ${derivedControlsCount ?? 0} · Missing: ${requiredMissingCount}`
                }
                onClick={() => setActiveSection('results')}
                accent={sectionAccent('results')}
              />
              <SectionButton
                active={activeSection === 'diff'}
                title="Diff"
                subtitle={diffResult ? 'Diff available' : 'Compare models'}
                onClick={() => setActiveSection('diff')}
                accent={sectionAccent('diff')}
              />
            </div>
          </div>
        </aside>

        <main className="flex flex-col gap-4">
          {activeSection === 'description' ? (
            <div className={`${styles.card} ${sectionAccent('overview').headerWrap}`}>
              <div className="flex items-center gap-3">
                <div className={'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ' + sectionAccent('overview').headerChip}>
                  Overview
                </div>
                <div className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Context</div>
              </div>
              <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">
                Add context about what this risk assessment covers, assumptions, scope, and links.
              </div>

              <AutoGrowTextArea
                value={typeof facts.description === 'string' ? (facts.description as string) : ''}
                onChange={(next) => setFacts((prev) => deepSet(prev, 'description', next))}
                placeholder="e.g. Risk assessment for the Shopfloor Analytics data pipeline handling production telemetry..."
                minRows={6}
                className="mt-4 w-full resize-none rounded-xl border border-zinc-200/70 bg-white px-4 py-3 text-sm text-zinc-900 outline-none [color-scheme:light] dark:[color-scheme:dark] placeholder:text-zinc-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-200/40 dark:border-zinc-800/80 dark:bg-zinc-950/60 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-indigo-500 dark:focus:ring-indigo-900/30"
              />
            </div>
          ) : null}

          {isQuestionSection ? (
            <div className="flex flex-col gap-3">
              <div className={`${styles.sectionHeader} ${activeAccent.headerWrap}`}>
                <div className="flex items-center gap-3">
                  <div className={'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ' + activeAccent.headerChip}>
                    {activeQuestionSection.title}
                  </div>
                  <div className="text-sm text-zinc-700 dark:text-zinc-200">
                    {questionProgress[activeQuestionSection.key]?.answered ?? 0}/
                    {questionProgress[activeQuestionSection.key]?.total ?? activeQuestionSection.questions.length} answered
                  </div>
                </div>
              </div>

              {activeQuestionSection.questions.length === 0 ? (
                <div className={`${styles.card} ${activeAccent.cardBg}`}>
                  <div className="text-sm text-zinc-600 dark:text-zinc-300">No questions.</div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  {activeQuestionSection.questions.map((q) => {
                    const path = `${activeQuestionSection.prefix}.${q.id}`
                    const value = deepGet(facts, path)
                    const reasonPath = `${activeQuestionSection.prefix}._reasons.${q.id}`
                    const reason = deepGet(facts, reasonPath)
                    return (
                      <QuestionField
                        key={path}
                        q={q}
                        value={value}
                        reason={reason}
                        accent={activeAccent}
                        onChange={(next) => setFacts((prev) => deepSet(prev, path, next))}
                        onReasonChange={(next) => {
                          const trimmed = next.trim()
                          setFacts((prev) => (trimmed ? deepSet(prev, reasonPath, next) : deepDelete(prev, reasonPath)))
                        }}
                      />
                    )
                  })}
                </div>
              )}
            </div>
          ) : null}

          {activeSection === 'results' ? (
            <div className={`${styles.card} ${sectionAccent('results').headerWrap}`}>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Results</div>
                {requiredMissingCount !== null ? (
                  <div className="text-sm text-zinc-600 dark:text-zinc-300">Missing answers: {requiredMissingCount}</div>
                ) : (
                  <div className="text-sm text-zinc-500 dark:text-zinc-400">Run Evaluate to see results</div>
                )}
              </div>

              {evaluateResult ? (
                <div className="mt-4 flex flex-col gap-4">
                  {evaluateResult.result.required_questions.filter((q) => !q.answered).length ? (
                    <div className="rounded-2xl border border-zinc-200/70 bg-white/60 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/30">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="text-sm font-medium text-zinc-900 dark:text-zinc-50">Missing answers</div>
                        <div className="text-sm text-zinc-600 dark:text-zinc-300">
                          {evaluateResult.result.required_questions.filter((q) => !q.answered).length}
                        </div>
                      </div>

                      <div className="mt-3 flex flex-col gap-3">
                        {Array.from(
                          evaluateResult.result.required_questions
                            .filter((q) => !q.answered)
                            .reduce(
                              (acc, q) => {
                                const meta = questionMetaByFullId.get(q.id)
                                const sectionKey = meta?.sectionKey ?? 'base'
                                const sectionTitle = meta?.sectionTitle ?? 'System facts'
                                const text = meta?.text ?? q.id
                                const existing = acc.get(sectionKey) ?? { sectionKey, sectionTitle, items: [] as string[] }
                                existing.items.push(text)
                                acc.set(sectionKey, existing)
                                return acc
                              },
                              new Map<string, { sectionKey: string; sectionTitle: string; items: string[] }>(),
                            ),
                        ).map(([key, group]) => (
                          <div
                            key={key}
                            className="rounded-xl border border-zinc-200/70 bg-white/60 px-4 py-3 dark:border-zinc-800/80 dark:bg-zinc-950/20"
                          >
                            <div className="flex items-center justify-between gap-2">
                              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">{group.sectionTitle}</div>
                              <button type="button" onClick={() => setActiveSection(group.sectionKey)} className={styles.smallButton}>
                                Open
                              </button>
                            </div>
                            <ul className="mt-2 list-disc pl-5 text-sm text-zinc-700 dark:text-zinc-200">
                              {group.items.map((t) => (
                                <li key={t} className="mt-1">
                                  {t}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-2xl border border-zinc-200/70 bg-white/60 p-4 text-sm text-zinc-700 dark:border-zinc-800/80 dark:bg-zinc-950/30 dark:text-zinc-200">
                      All required questions are answered.
                    </div>
                  )}

                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-zinc-600 dark:text-zinc-300">
                      Derived controls: {evaluateResult.result.derived_controls.length}
                    </div>
                    {evaluateResult.result.derived_controls.length === 0 ? (
                      <div className="rounded-2xl border border-zinc-200/70 bg-white/60 p-4 text-sm text-zinc-600 dark:border-zinc-800/80 dark:bg-zinc-950/30 dark:text-zinc-300">
                        No controls are currently derived from the provided answers.
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {evaluateResult.result.derived_controls.map((c) => (
                          <div key={c.id} className="rounded-2xl border border-zinc-200/70 bg-white/60 p-5 dark:border-zinc-800/80 dark:bg-zinc-950/30">
                            <div className="flex flex-col gap-2">
                              <div className="flex flex-wrap items-start justify-between gap-2">
                                <div className="min-w-0">
                                  <div className="text-base font-semibold text-zinc-900 dark:text-zinc-50">{c.title}</div>
                                </div>
                                <div className="shrink-0 rounded-lg border border-zinc-200/70 bg-white/70 px-2 py-1 font-mono text-[11px] text-zinc-700 dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:text-zinc-200">
                                  {c.id}
                                </div>
                              </div>

                              <div className="flex flex-wrap gap-2 text-xs text-zinc-600 dark:text-zinc-300">
                                <span className="rounded-full border border-zinc-200/70 bg-white/70 px-2 py-0.5 dark:border-zinc-800/80 dark:bg-zinc-950/40">
                                  scope: {c.scope}
                                </span>
                                <span className="rounded-full border border-zinc-200/70 bg-white/70 px-2 py-0.5 dark:border-zinc-800/80 dark:bg-zinc-950/40">
                                  intent: {c.enforcement_intent}
                                </span>
                                <span className="rounded-full border border-zinc-200/70 bg-white/70 px-2 py-0.5 dark:border-zinc-800/80 dark:bg-zinc-950/40">
                                  phase: {c.activation_phase}
                                </span>
                                {c.evidence_type?.length ? (
                                  <span className="rounded-full border border-zinc-200/70 bg-white/70 px-2 py-0.5 dark:border-zinc-800/80 dark:bg-zinc-950/40">
                                    evidence: {c.evidence_type.join(', ')}
                                  </span>
                                ) : null}
                              </div>
                            </div>

                            <div className="mt-4">
                              <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Because</div>
                              <div className="mt-2 flex flex-col gap-2">
                                {c.because.map((b, i) => (
                                  <div
                                    key={i}
                                    className="rounded-xl border border-zinc-200/70 bg-white/60 px-4 py-3 dark:border-zinc-800/80 dark:bg-zinc-950/20"
                                  >
                                    <ConditionLines because={b} />
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}

          {activeSection === 'diff' ? (
            <div className={`${styles.card} ${sectionAccent('diff').headerWrap}`}>
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Diff models</div>
                <button onClick={runDiff} className="h-9 rounded-lg border border-zinc-200/70 bg-white/80 px-3 text-sm font-medium shadow-sm hover:bg-white dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:text-zinc-50 dark:hover:bg-zinc-900/60">
                  {diffState === 'running' ? 'Diffing…' : 'Diff'}
                </button>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Old model dir</label>
                  <input
                    value={oldModelDir}
                    onChange={(e) => setOldModelDir(e.target.value)}
                    className="h-9 rounded-lg border border-zinc-200/70 bg-white/80 px-3 text-sm outline-none [color-scheme:light] dark:[color-scheme:dark] focus:border-zinc-400 dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:text-zinc-50"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">New model dir</label>
                  <input
                    value={newModelDir}
                    onChange={(e) => setNewModelDir(e.target.value)}
                    className="h-9 rounded-lg border border-zinc-200/70 bg-white/80 px-3 text-sm outline-none [color-scheme:light] dark:[color-scheme:dark] focus:border-zinc-400 dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:text-zinc-50"
                  />
                </div>
              </div>

              {diffResult ? (
                <div className="mt-4 flex flex-col gap-3 text-sm">
                  <div className="text-zinc-700 dark:text-zinc-200">
                    {diffResult.old.modelDir} ({diffResult.old.modelVersion}) → {diffResult.new.modelDir} ({diffResult.new.modelVersion})
                  </div>

                  <div className="rounded-2xl border border-zinc-200/70 bg-white/60 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/30">
                    <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Controls</div>
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">Added: {diffResult.controls.added.join(', ') || '(none)'}</div>
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">Removed: {diffResult.controls.removed.join(', ') || '(none)'}</div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200/70 bg-white/60 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/30">
                    <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Missing required questions</div>
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                      Newly missing: {diffResult.questions.newlyMissing.join(', ') || '(none)'}
                    </div>
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">
                      No longer missing: {diffResult.questions.noLongerMissing.join(', ') || '(none)'}
                    </div>
                  </div>

                  <div className="rounded-2xl border border-zinc-200/70 bg-white/60 p-4 dark:border-zinc-800/80 dark:bg-zinc-950/30">
                    <div className="text-xs font-medium text-zinc-700 dark:text-zinc-200">Activated domains</div>
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">Old: {diffResult.activatedDomains.old.join(', ') || '(none)'}</div>
                    <div className="mt-1 text-xs text-zinc-600 dark:text-zinc-300">New: {diffResult.activatedDomains.new.join(', ') || '(none)'}</div>
                  </div>
                </div>
              ) : null}
            </div>
          ) : null}
        </main>
      </div>
    </div>
  )
}
