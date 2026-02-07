export type QuestionType = 'bool' | 'enum' | 'set'

export type Question = {
  id: string
  text: string
  description?: string
  type: QuestionType
  allowed?: string[]
}

export type TriggerRule = {
  when: Record<string, unknown>
  activate: string[]
}

export function parseQuestions(raw: unknown[]): Question[] {
  const out: Question[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const rec = item as Record<string, unknown>
    const id = rec.id
    const text = rec.text
    const description = rec.description
    const type = rec.type
    if (typeof id !== 'string' || typeof text !== 'string') continue
    if (type !== 'bool' && type !== 'enum' && type !== 'set') continue

    const allowedRaw = rec.allowed
    const allowed = Array.isArray(allowedRaw) ? allowedRaw.filter((x): x is string => typeof x === 'string') : undefined

    out.push({
      id,
      text,
      type,
      ...(typeof description === 'string' && description.trim() ? { description: description.trim() } : {}),
      ...(allowed ? { allowed } : {}),
    })
  }
  return out
}

export function parseTriggers(raw: unknown[]): TriggerRule[] {
  const out: TriggerRule[] = []
  for (const item of raw) {
    if (!item || typeof item !== 'object') continue
    const rec = item as Record<string, unknown>
    const when = rec.when
    const activate = rec.activate
    if (!when || typeof when !== 'object') continue
    if (!Array.isArray(activate)) continue
    const act = activate.filter((x): x is string => typeof x === 'string')
    out.push({ when: when as Record<string, unknown>, activate: act })
  }
  return out
}
