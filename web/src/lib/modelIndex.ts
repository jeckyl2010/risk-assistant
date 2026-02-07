import fs from 'fs/promises'
import path from 'path'
import { loadYamlFile } from './yaml'
import type { ModelPaths } from './model'
import { parseQuestions, parseTriggers, type Question, type TriggerRule } from './uiTypes'

export async function listDomainNames(paths: ModelPaths): Promise<string[]> {
  try {
    const entries = await fs.readdir(paths.questionsDir)
    return entries
      .filter((e) => e.endsWith('.questions.yaml') && e !== 'base.questions.yaml')
      .map((e) => e.replace(/\.questions\.yaml$/, ''))
      .sort()
  } catch {
    return []
  }
}

export async function loadModelForUI(paths: ModelPaths): Promise<{
  baseQuestions: Question[]
  domainQuestions: Record<string, Question[]>
  triggers: TriggerRule[]
}> {
  const baseDoc = await loadYamlFile<unknown>(paths.baseQuestionsFile)
  const triggersDoc = await loadYamlFile<unknown>(paths.triggersFile)

  const domains = await listDomainNames(paths)
  const domainQuestions: Record<string, Question[]> = {}

  for (const d of domains) {
    const fp = path.join(paths.questionsDir, `${d}.questions.yaml`)
    try {
      const doc = await loadYamlFile<unknown>(fp)
      if (doc && typeof doc === 'object' && 'questions' in (doc as Record<string, unknown>)) {
        const qs = (doc as Record<string, unknown>).questions
        domainQuestions[d] = parseQuestions(Array.isArray(qs) ? (qs as unknown[]) : [])
      } else {
        domainQuestions[d] = []
      }
    } catch {
      domainQuestions[d] = []
    }
  }

  const baseRaw =
    baseDoc && typeof baseDoc === 'object' && 'questions' in (baseDoc as Record<string, unknown>)
      ? (Array.isArray((baseDoc as Record<string, unknown>).questions)
          ? ((baseDoc as Record<string, unknown>).questions as unknown[])
          : [])
      : []

  const triggersRaw =
    triggersDoc && typeof triggersDoc === 'object' && 'triggers' in (triggersDoc as Record<string, unknown>)
      ? (Array.isArray((triggersDoc as Record<string, unknown>).triggers)
          ? ((triggersDoc as Record<string, unknown>).triggers as unknown[])
          : [])
      : []

  return {
    baseQuestions: parseQuestions(baseRaw),
    domainQuestions,
    triggers: parseTriggers(triggersRaw),
  }
}
