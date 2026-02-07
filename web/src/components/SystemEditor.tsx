'use client'

import Link from 'next/link'
import { useEffect, useMemo, useRef, useState } from 'react'
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

function fmtValue(v: unknown): string {
  if (v === null) return 'null'
  if (v === undefined) return 'unset'
  if (typeof v === 'string') return v
  if (typeof v === 'number' || typeof v === 'boolean') return String(v)
  if (Array.isArray(v)) return `[${v.map((x) => fmtValue(x)).join(', ')}]`
  try {
    return JSON.stringify(v)
  } catch {
    return String(v)
  }
}

function AutoGrowTextArea({
  value,
  onChange,
  placeholder,
  minRows,
  className,
}: {
  value: string
  onChange: (next: string) => void
  placeholder?: string
  minRows: number
  className?: string
}) {
  const ref = useRef<HTMLTextAreaElement | null>(null)

  const resize = () => {
    const el = ref.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = `${el.scrollHeight}px`
  }

  useEffect(() => {
    resize()
  }, [value])

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onInput={resize}
      placeholder={placeholder}
      rows={minRows}
      className={className}
    />
  )
}

function ConditionLines({ because }: { because: Record<string, unknown> }) {
  const entries = Object.entries(because)
  if (entries.length === 0) return <div className="text-xs text-zinc-500 dark:text-zinc-400">(no details)</div>
  return (
    <ul className="mt-1 flex flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-300">
      {entries.map(([k, v]) => (
        <li key={k} className="flex items-start gap-2">
          <span className="shrink-0 rounded-md border border-zinc-200/70 bg-white/70 px-2 py-0.5 font-mono text-[11px] text-zinc-700 dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:text-zinc-200">
            {k}
          </span>
          <span className="font-mono text-[11px] text-zinc-600 dark:text-zinc-300">{fmtValue(v)}</span>
        </li>
      ))}
    </ul>
  )
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

function deepDelete(obj: unknown, dotted: string): Facts {
  const parts = dotted.split('.')
  const out: Facts = { ...((obj && typeof obj === 'object') ? (obj as Facts) : {}) }
  let cur: Record<string, unknown> = out
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i]
    const next = cur[p]
    if (typeof next !== 'object' || next === null) {
      return out
    }
    const nextObj = { ...(next as Record<string, unknown>) }
    cur[p] = nextObj
    cur = nextObj
  }
  delete cur[parts[parts.length - 1]]
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
  q,
  value,
  reason,
  onChange,
  onReasonChange,
  accent,
}: {
  q: Question
  value: unknown
  reason: unknown
  onChange: (next: unknown) => void
  onReasonChange: (next: string) => void
  accent?: SectionAccent
}) {
  const isUnset = value === null
  const a = accent ?? sectionAccent('base')
  return (
    <div
      className={
        'rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-5 shadow-sm backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-900/25 border-t-4 ' +
        a.cardTop
      }
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-50">{q.text}</div>
          {q.description ? (
            <div className="mt-1 text-sm text-zinc-600 dark:text-zinc-300">{q.description}</div>
          ) : null}
        </div>
      </div>

      <div
        className={
          'mt-4 rounded-xl border p-3 ' +
          (isUnset
            ? 'border-dashed border-amber-200/80 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/15'
            : 'border-sky-200/80 bg-sky-50/60 dark:border-sky-900/50 dark:bg-sky-950/15')
        }
      >
        <div className="flex items-center justify-between gap-2">
          <div
            className={
              'inline-flex items-center gap-2 rounded-full border px-2 py-0.5 text-xs font-medium ' +
              (isUnset
                ? 'border-amber-200/80 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100'
                : 'border-sky-200/80 bg-sky-50 text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/20 dark:text-sky-100')
            }
          >
            <span
              className={
                'h-1.5 w-1.5 rounded-full ' +
                (isUnset ? 'bg-amber-500 dark:bg-amber-300' : 'bg-sky-600 dark:bg-sky-300')
              }
            />
            Answer
          </div>
          {isUnset ? (
            <div className="text-xs text-amber-800 dark:text-amber-200">Not answered yet</div>
          ) : (
            <div className="text-xs text-sky-800 dark:text-sky-200">Answered</div>
          )}
        </div>

        <div className="mt-2">
        {q.type === 'bool' ? (
          <select
            value={value === true ? 'true' : value === false ? 'false' : ''}
            onChange={(e) => {
              const v = e.target.value
              onChange(v === '' ? null : v === 'true')
            }}
            className="h-11 w-full rounded-lg border border-zinc-200/70 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200/40 dark:border-zinc-800/80 dark:bg-zinc-950/60 dark:text-zinc-50 dark:focus:border-sky-500 dark:focus:ring-sky-900/30"
          >
            <option value="">(unset)</option>
            <option value="true">true</option>
            <option value="false">false</option>
          </select>
        ) : null}

        {q.type === 'enum' ? (
          <div className="flex flex-col gap-2">
            <select
              value={typeof value === 'string' ? value : ''}
              onChange={(e) => onChange(e.target.value || null)}
              className="h-11 rounded-lg border border-zinc-200/70 bg-white px-3 text-sm text-zinc-900 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-200/40 dark:border-zinc-800/80 dark:bg-zinc-950/60 dark:text-zinc-50 dark:focus:border-sky-500 dark:focus:ring-sky-900/30"
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
            <div className="flex flex-wrap gap-3 rounded-lg border border-zinc-200/70 bg-white/80 p-3 dark:border-zinc-800/80 dark:bg-zinc-950/40">
              {(q.allowed ?? []).map((a) => {
                const arr = Array.isArray(value) ? value : []
                const checked = arr.includes(a)
                return (
                  <label key={a} className="flex items-center gap-2 text-sm text-zinc-700 dark:text-zinc-200">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(e) => {
                        const next = new Set(arr)
                        if (e.target.checked) next.add(a)
                        else next.delete(a)
                        onChange(Array.from(next).sort())
                      }}
                      className="h-4 w-4 accent-zinc-900 dark:accent-zinc-50"
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

      <div className="mt-3">
        <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Reason (optional)</label>
        <AutoGrowTextArea
          value={typeof reason === 'string' ? reason : ''}
          onChange={onReasonChange}
          placeholder="Why did you choose this answer? Link to docs, context, constraints, …"
          minRows={2}
          className="mt-1 w-full resize-none rounded-lg border border-zinc-200/70 bg-white px-3 py-2 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-sky-400 focus:ring-2 focus:ring-sky-200/40 dark:border-zinc-800/80 dark:bg-zinc-950/60 dark:text-zinc-50 dark:placeholder:text-zinc-500 dark:focus:border-sky-500 dark:focus:ring-sky-900/30"
        />
      </div>
    </div>
  )
}

function domainTitle(domain: string): string {
  const map: Record<string, string> = {
    base: 'System facts',
    security: 'Security',
    data: 'Data',
    ai: 'AI',
    integration: 'Integration',
    operations: 'Operations',
    cost: 'Cost',
    criticality: 'Criticality',
    exceptions: 'Exceptions',
  }
  return map[domain] ?? domain
}
type SectionAccent = {
  bar: string
  navActive: string
  navIdle: string
  headerWrap: string
  headerChip: string
  cardTop: string
}

function sectionAccent(key: string): SectionAccent {
  const byKey: Record<string, SectionAccent> = {
    overview: {
      bar: 'bg-indigo-500/80 dark:bg-indigo-300/80',
      navActive:
        'border-indigo-200/70 bg-indigo-50/70 text-zinc-900 dark:border-indigo-900/50 dark:bg-indigo-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-indigo-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:bg-indigo-950/15',
      headerWrap:
        'border-indigo-200/70 bg-indigo-50/60 dark:border-indigo-900/50 dark:bg-indigo-950/15',
      headerChip:
        'border-indigo-200/80 bg-indigo-50 text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-950/20 dark:text-indigo-100',
      cardTop: 'border-t-indigo-400/80 dark:border-t-indigo-400/70',
    },
    base: {
      bar: 'bg-zinc-500/70 dark:bg-zinc-300/60',
      navActive:
        'border-zinc-200/70 bg-zinc-50/90 text-zinc-900 dark:border-zinc-700/60 dark:bg-zinc-900/35 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-zinc-50/80 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:bg-zinc-900/20',
      headerWrap:
        'border-zinc-200/70 bg-zinc-50/60 dark:border-zinc-800/70 dark:bg-zinc-900/20',
      headerChip:
        'border-zinc-200/80 bg-zinc-50 text-zinc-900 dark:border-zinc-800/70 dark:bg-zinc-950/20 dark:text-zinc-100',
      cardTop: 'border-t-zinc-300/80 dark:border-t-zinc-700/70',
    },
    ai: {
      bar: 'bg-violet-500/80 dark:bg-violet-300/80',
      navActive:
        'border-violet-200/70 bg-violet-50/70 text-zinc-900 dark:border-violet-900/50 dark:bg-violet-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-violet-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:bg-violet-950/15',
      headerWrap:
        'border-violet-200/70 bg-violet-50/60 dark:border-violet-900/50 dark:bg-violet-950/15',
      headerChip:
        'border-violet-200/80 bg-violet-50 text-violet-900 dark:border-violet-900/50 dark:bg-violet-950/20 dark:text-violet-100',
      cardTop: 'border-t-violet-400/80 dark:border-t-violet-400/70',
    },
    criticality: {
      bar: 'bg-amber-500/80 dark:bg-amber-300/80',
      navActive:
        'border-amber-200/70 bg-amber-50/70 text-zinc-900 dark:border-amber-900/50 dark:bg-amber-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-amber-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:bg-amber-950/15',
      headerWrap:
        'border-amber-200/70 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/15',
      headerChip:
        'border-amber-200/80 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100',
      cardTop: 'border-t-amber-400/80 dark:border-t-amber-400/70',
    },
    data: {
      bar: 'bg-cyan-500/80 dark:bg-cyan-300/80',
      navActive:
        'border-cyan-200/70 bg-cyan-50/70 text-zinc-900 dark:border-cyan-900/50 dark:bg-cyan-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-cyan-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:bg-cyan-950/15',
      headerWrap:
        'border-cyan-200/70 bg-cyan-50/60 dark:border-cyan-900/50 dark:bg-cyan-950/15',
      headerChip:
        'border-cyan-200/80 bg-cyan-50 text-cyan-900 dark:border-cyan-900/50 dark:bg-cyan-950/20 dark:text-cyan-100',
      cardTop: 'border-t-cyan-400/80 dark:border-t-cyan-400/70',
    },
    integration: {
      bar: 'bg-sky-500/80 dark:bg-sky-300/80',
      navActive:
        'border-sky-200/70 bg-sky-50/70 text-zinc-900 dark:border-sky-900/50 dark:bg-sky-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-sky-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:bg-sky-950/15',
      headerWrap:
        'border-sky-200/70 bg-sky-50/60 dark:border-sky-900/50 dark:bg-sky-950/15',
      headerChip:
        'border-sky-200/80 bg-sky-50 text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/20 dark:text-sky-100',
      cardTop: 'border-t-sky-400/80 dark:border-t-sky-400/70',
    },
    operations: {
      bar: 'bg-emerald-500/80 dark:bg-emerald-300/80',
      navActive:
        'border-emerald-200/70 bg-emerald-50/70 text-zinc-900 dark:border-emerald-900/50 dark:bg-emerald-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-emerald-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:bg-emerald-950/15',
      headerWrap:
        'border-emerald-200/70 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/15',
      headerChip:
        'border-emerald-200/80 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-100',
      cardTop: 'border-t-emerald-400/80 dark:border-t-emerald-400/70',
    },
    security: {
      bar: 'bg-rose-500/80 dark:bg-rose-300/80',
      navActive:
        'border-rose-200/70 bg-rose-50/70 text-zinc-900 dark:border-rose-900/50 dark:bg-rose-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-rose-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:bg-rose-950/15',
      headerWrap:
        'border-rose-200/70 bg-rose-50/60 dark:border-rose-900/50 dark:bg-rose-950/15',
      headerChip:
        'border-rose-200/80 bg-rose-50 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-100',
      cardTop: 'border-t-rose-400/80 dark:border-t-rose-400/70',
    },
    cost: {
      bar: 'bg-orange-500/80 dark:bg-orange-300/80',
      navActive:
        'border-orange-200/70 bg-orange-50/70 text-zinc-900 dark:border-orange-900/50 dark:bg-orange-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-orange-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:bg-orange-950/15',
      headerWrap:
        'border-orange-200/70 bg-orange-50/60 dark:border-orange-900/50 dark:bg-orange-950/15',
      headerChip:
        'border-orange-200/80 bg-orange-50 text-orange-900 dark:border-orange-900/50 dark:bg-orange-950/20 dark:text-orange-100',
      cardTop: 'border-t-orange-400/80 dark:border-t-orange-400/70',
    },
    results: {
      bar: 'bg-emerald-500/80 dark:bg-emerald-300/80',
      navActive:
        'border-emerald-200/70 bg-emerald-50/70 text-zinc-900 dark:border-emerald-900/50 dark:bg-emerald-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-emerald-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:bg-emerald-950/15',
      headerWrap:
        'border-emerald-200/70 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/15',
      headerChip:
        'border-emerald-200/80 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-100',
      cardTop: 'border-t-emerald-400/80 dark:border-t-emerald-400/70',
    },
    diff: {
      bar: 'bg-fuchsia-500/80 dark:bg-fuchsia-300/80',
      navActive:
        'border-fuchsia-200/70 bg-fuchsia-50/70 text-zinc-900 dark:border-fuchsia-900/50 dark:bg-fuchsia-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-fuchsia-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:bg-fuchsia-950/15',
      headerWrap:
        'border-fuchsia-200/70 bg-fuchsia-50/60 dark:border-fuchsia-900/50 dark:bg-fuchsia-950/15',
      headerChip:
        'border-fuchsia-200/80 bg-fuchsia-50 text-fuchsia-900 dark:border-fuchsia-900/50 dark:bg-fuchsia-950/20 dark:text-fuchsia-100',
      cardTop: 'border-t-fuchsia-400/80 dark:border-t-fuchsia-400/70',
    },
  }

  return byKey[key] ?? byKey.base
}

function SectionButton({
  active,
  title,
  subtitle,
  onClick,
  accent,
}: {
  active: boolean
  title: string
  subtitle?: string
  onClick: () => void
  accent: SectionAccent
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'relative w-full overflow-hidden rounded-xl border py-2 pl-5 pr-3 text-left text-sm shadow-sm transition-colors ' +
        (active ? accent.navActive : accent.navIdle)
      }
    >
      <span className={'absolute left-0 top-0 h-full w-1 ' + accent.bar} />
      <div className="font-medium">{title}</div>
      {subtitle ? <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</div> : null}
    </button>
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

  const requiredMissingCount = evaluateResult
    ? evaluateResult.result.required_questions.filter((q) => !q.answered).length
    : null

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
  if (activeSection !== 'description' && activeSection !== 'base' && activeSection !== 'results' && activeSection !== 'diff') {
    const stillValid = questionSections.some((s) => s.key === activeSection)
    if (!stillValid) setActiveSection('base')
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1">
            <Link href="/" className="text-sm text-zinc-600 hover:underline dark:text-zinc-300">
              ← Portfolio
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight">{id}</h1>
            <div className="text-sm text-zinc-600 dark:text-zinc-300">
              Model: {model.modelVersion} · Activated domains: {activatedDomains.join(', ') || '(none)'}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={save}
              className="h-10 rounded-lg border border-zinc-200/70 bg-white/80 px-4 text-sm font-medium shadow-sm hover:bg-white dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:text-zinc-50 dark:hover:bg-zinc-900/60"
            >
              {saveState === 'saving' ? 'Saving…' : saveState === 'saved' ? 'Saved' : 'Save'}
            </button>
            <button
              onClick={runEvaluate}
              className="h-10 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white"
            >
              {evalState === 'running' ? 'Evaluating…' : 'Evaluate'}
            </button>

            {evaluateResult ? (
              <div className="hidden h-10 items-center rounded-lg border border-zinc-200/70 bg-white/70 px-3 text-sm text-zinc-700 shadow-sm dark:border-zinc-800/80 dark:bg-zinc-950/30 dark:text-zinc-200 sm:flex">
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
          <div className="rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-4 shadow-sm backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-900/20">
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
            <div className="rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-5 shadow-sm backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-900/25">
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
                className="mt-4 w-full resize-none rounded-xl border border-zinc-200/70 bg-white px-4 py-3 text-sm text-zinc-900 outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800/80 dark:bg-zinc-950/60 dark:text-zinc-50 dark:placeholder:text-zinc-500"
              />
            </div>
          ) : null}

          {isQuestionSection ? (
            <div className="flex flex-col gap-3">
              <div className={'flex items-center justify-between gap-3 rounded-2xl border px-4 py-3 ' + activeAccent.headerWrap}>
                <div className="flex items-center gap-3">
                  <div className={'inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium ' + activeAccent.headerChip}>
                    {activeQuestionSection.title}
                  </div>
                  <div className="text-sm text-zinc-700 dark:text-zinc-200">
                    {questionProgress[activeQuestionSection.key]?.answered ?? 0}/{questionProgress[activeQuestionSection.key]?.total ?? activeQuestionSection.questions.length}{' '}
                    answered
                  </div>
                </div>
              </div>
              {activeQuestionSection.questions.length === 0 ? (
                <div className="rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-4 text-sm text-zinc-600 shadow-sm backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-900/25 dark:text-zinc-300">
                  No questions.
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
            <div className="rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-5 shadow-sm backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-900/25">
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
                              <button
                                type="button"
                                onClick={() => setActiveSection(group.sectionKey)}
                                className="h-8 rounded-lg border border-zinc-200/70 bg-white/70 px-3 text-xs font-medium text-zinc-700 shadow-sm hover:bg-white dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:text-zinc-200 dark:hover:bg-zinc-900/60"
                              >
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
            <div className="rounded-2xl border border-zinc-200/70 bg-zinc-50/70 p-5 shadow-sm backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-900/25">
              <div className="flex items-center justify-between gap-3">
                <div className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Diff models</div>
                <button
                  onClick={runDiff}
                  className="h-9 rounded-lg border border-zinc-200/70 bg-white/80 px-3 text-sm font-medium shadow-sm hover:bg-white dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:text-zinc-50 dark:hover:bg-zinc-900/60"
                >
                  {diffState === 'running' ? 'Diffing…' : 'Diff'}
                </button>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">Old model dir</label>
                  <input
                    value={oldModelDir}
                    onChange={(e) => setOldModelDir(e.target.value)}
                    className="h-9 rounded-lg border border-zinc-200/70 bg-white/80 px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:text-zinc-50"
                  />
                </div>
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-medium text-zinc-600 dark:text-zinc-300">New model dir</label>
                  <input
                    value={newModelDir}
                    onChange={(e) => setNewModelDir(e.target.value)}
                    className="h-9 rounded-lg border border-zinc-200/70 bg-white/80 px-3 text-sm outline-none focus:border-zinc-400 dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:text-zinc-50"
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
