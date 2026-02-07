'use client'

import Link from 'next/link'
import { useMemo, useState } from 'react'
import type { Question, TriggerRule } from '@/lib/uiTypes'

type Facts = Record<string, unknown>

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

function deepGet(obj: unknown, dotted: string): unknown {
  let cur: unknown = obj
  for (const part of dotted.split('.')) {
    if (!cur || typeof cur !== 'object') return null
    const rec = cur as Record<string, unknown>
    if (!(part in rec)) return null
    cur = rec[part]
  }
  return cur
}

function deepSet(obj: unknown, dotted: string, value: unknown): Facts {
  const parts = dotted.split('.')
  const out: Facts = { ...((obj && typeof obj === 'object') ? (obj as Facts) : {}) }
  let cur: Record<string, unknown> = out
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i]
    const next = cur[p]
    const nextObj = typeof next === 'object' && next !== null ? { ...(next as Record<string, unknown>) } : {}
    cur[p] = nextObj
    cur = nextObj
  }
  cur[parts[parts.length - 1]] = value
  return out
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

function QuestionField({
  path,
  q,
  value,
  onChange,
}: {
  path: string
  q: Question
  value: unknown
  onChange: (next: unknown) => void
}) {
  return (
    <div className="rounded-xl border border-zinc-200 bg-white p-4 shadow-sm">
      <div className="text-sm font-medium text-zinc-900">{q.text}</div>
      <div className="mt-2">
        {q.type === 'bool' ? (
          <label className="flex items-center gap-2 text-sm text-zinc-700">
            <input
              type="checkbox"
              checked={value === true}
              onChange={(e) => onChange(e.target.checked)}
              className="h-4 w-4"
            />
            <span>{path}</span>
          </label>
        ) : null}

        {q.type === 'enum' ? (
          <div className="flex flex-col gap-2">
            <div className="text-xs text-zinc-500">{path}</div>
            <select
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(e.target.value || null)}
              className="h-10 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400"
            >
              <option value="">(unset)</option>
              {(q.allowed ?? []).map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        ) : null}

        {q.type === 'set' ? (
          <div className="flex flex-col gap-2">
            <div className="text-xs text-zinc-500">{path}</div>
            <div className="flex flex-wrap gap-3">
              {(q.allowed ?? []).map((a) => {
                const arr = Array.isArray(value) ? value : []
                const checked = arr.includes(a)
                return (
                  <label key={a} className="flex items-center gap-2 text-sm text-zinc-700">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = new Set(arr)
                        if (e.target.checked) next.add(a)
                        else next.delete(a)
                        onChange(Array.from(next).sort())
                      }}
                      className="h-4 w-4"
                    />
                    {a}
                  </label>
                )
              })}
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
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

  const allQuestionBlocks: Array<{ title: string; questions: Question[]; prefix: string }> = [
    { title: 'Base facts', questions: baseQuestions, prefix: 'base' },
    ...activatedDomains.map((d) => ({ title: d, questions: domainQuestions[d] ?? [], prefix: d })),
  ]

  const requiredMissingCount = evaluateResult
    ? evaluateResult.result.required_questions.filter((q) => !q.answered).length
    : null

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Link href="/" className="text-sm text-zinc-600 hover:underline">
            ← Portfolio
          </Link>
          <h1 className="text-2xl font-semibold tracking-tight">{id}</h1>
          <div className="text-sm text-zinc-600">
            Model: {model.modelVersion} · Activated domains: {activatedDomains.join(', ') || '(none)'}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={save}
            className="h-10 rounded-lg border border-zinc-200 bg-white px-4 text-sm font-medium shadow-sm hover:bg-zinc-50"
          >
            {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : 'Save'}
          </button>
          <button
            onClick={runEvaluate}
            className="h-10 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm hover:bg-zinc-800"
          >
            {evalState === 'running' ? 'Evaluating…' : 'Evaluate'}
          </button>
        </div>
      </div>

      {error ? <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">{error}</div> : null}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          {allQuestionBlocks.map((b) => (
            <div key={b.title} className="flex flex-col gap-3">
              <div className="text-sm font-medium text-zinc-700">{b.title}</div>
              <div className="flex flex-col gap-3">
                {b.questions.length === 0 ? (
                  <div className="rounded-xl border border-zinc-200 bg-white p-4 text-sm text-zinc-600 shadow-sm">
                    No questions.
                  </div>
                ) : (
                  b.questions.map((q) => {
                    const path = `${b.prefix}.${q.id}`
                    const value = deepGet(facts, path)
                    return (
                      <QuestionField
                        key={path}
                        path={path}
                        q={q}
                        value={value}
                        onChange={(next) => setFacts((prev) => deepSet(prev, path, next))}
                      />
                    )
                  })
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium text-zinc-700">Results</div>
              {requiredMissingCount !== null ? (
                <div className="text-sm text-zinc-600">Missing answers: {requiredMissingCount}</div>
              ) : (
                <div className="text-sm text-zinc-500">Run Evaluate to see results</div>
              )}
            </div>

            {evaluateResult ? (
              <div className="mt-4 flex flex-col gap-3">
                <div className="text-sm text-zinc-600">Derived controls: {evaluateResult.result.derived_controls.length}</div>
                <div className="flex flex-col gap-3">
                  {evaluateResult.result.derived_controls.map((c) => (
                    <div key={c.id} className="rounded-xl border border-zinc-200 p-4">
                      <div className="flex flex-col gap-1">
                        <div className="text-sm font-semibold text-zinc-900">
                          {c.id} · {c.title}
                        </div>
                        <div className="text-xs text-zinc-600">
                          scope: {c.scope} · intent: {c.enforcement_intent} · phase: {c.activation_phase}
                        </div>
                        {c.evidence_type?.length ? (
                          <div className="text-xs text-zinc-600">evidence: {c.evidence_type.join(', ')}</div>
                        ) : null}
                      </div>
                      <div className="mt-3">
                        <div className="text-xs font-medium text-zinc-700">Because</div>
                        <ul className="mt-1 list-disc pl-5 text-xs text-zinc-600">
                          {c.because.map((b, i) => (
                            <li key={i}>{JSON.stringify(b)}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <div className="text-sm font-medium text-zinc-700">Diff models</div>
              <button
                onClick={runDiff}
                className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm font-medium shadow-sm hover:bg-zinc-50"
              >
                {diffState === 'running' ? 'Diffing…' : 'Diff'}
              </button>
            </div>

            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-zinc-600">Old model dir</label>
                <input
                  value={oldModelDir}
                  onChange={(e) => setOldModelDir(e.target.value)}
                  className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400"
                />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-xs font-medium text-zinc-600">New model dir</label>
                <input
                  value={newModelDir}
                  onChange={(e) => setNewModelDir(e.target.value)}
                  className="h-9 rounded-lg border border-zinc-200 bg-white px-3 text-sm outline-none focus:border-zinc-400"
                />
              </div>
            </div>

            {diffResult ? (
              <div className="mt-4 flex flex-col gap-3 text-sm">
                <div className="text-zinc-700">
                  {diffResult.old.modelDir} ({diffResult.old.modelVersion}) → {diffResult.new.modelDir} ({diffResult.new.modelVersion})
                </div>

                <div className="rounded-xl border border-zinc-200 p-4">
                  <div className="text-xs font-medium text-zinc-700">Controls</div>
                  <div className="mt-1 text-xs text-zinc-600">Added: {diffResult.controls.added.join(', ') || '(none)'}</div>
                  <div className="mt-1 text-xs text-zinc-600">Removed: {diffResult.controls.removed.join(', ') || '(none)'}</div>
                </div>

                <div className="rounded-xl border border-zinc-200 p-4">
                  <div className="text-xs font-medium text-zinc-700">Missing required questions</div>
                  <div className="mt-1 text-xs text-zinc-600">
                    Newly missing: {diffResult.questions.newlyMissing.join(', ') || '(none)'}
                  </div>
                  <div className="mt-1 text-xs text-zinc-600">
                    No longer missing: {diffResult.questions.noLongerMissing.join(', ') || '(none)'}
                  </div>
                </div>

                <div className="rounded-xl border border-zinc-200 p-4">
                  <div className="text-xs font-medium text-zinc-700">Activated domains</div>
                  <div className="mt-1 text-xs text-zinc-600">Old: {diffResult.activatedDomains.old.join(', ') || '(none)'}</div>
                  <div className="mt-1 text-xs text-zinc-600">New: {diffResult.activatedDomains.new.join(', ') || '(none)'}</div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  )
}
