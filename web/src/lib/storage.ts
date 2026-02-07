import path from 'path'
import fs from 'fs/promises'
import { findRepoRoot } from './repoRoot'
import { loadYamlFile, dumpYaml } from './yaml'
import { normalizeFactsForDump, type Facts } from './evaluator'

export type SystemSummary = {
  id: string
  factsPath: string
  facts: Facts
}

function systemsDir(repoRoot: string): string {
  return path.join(repoRoot, 'systems')
}

export async function ensureSystemsDir(): Promise<string> {
  const repoRoot = findRepoRoot(process.cwd())
  const dir = systemsDir(repoRoot)
  await fs.mkdir(dir, { recursive: true })
  return dir
}

export function sanitizeSystemId(id: string): string {
  const trimmed = id.trim()
  // Allow letters, numbers, dashes, underscores.
  const safe = trimmed.replace(/[^a-zA-Z0-9_-]+/g, '-').replace(/^-+|-+$/g, '')
  return safe || 'system'
}

export async function listSystems(): Promise<string[]> {
  const dir = await ensureSystemsDir()
  const entries = await fs.readdir(dir)
  return entries
    .filter((e) => e.toLowerCase().endsWith('.yaml') || e.toLowerCase().endsWith('.yml'))
    .map((e) => e.replace(/\.(yaml|yml)$/i, ''))
    .sort()
}

export async function getSystemFacts(id: string): Promise<{ id: string; factsPath: string; facts: Facts } | null> {
  const dir = await ensureSystemsDir()
  const safe = sanitizeSystemId(id)
  const yamlPath = path.join(dir, `${safe}.yaml`)

  try {
    const facts = await loadYamlFile<Facts>(yamlPath)
    if (!facts || typeof facts !== 'object') return null
    return { id: safe, factsPath: yamlPath, facts }
  } catch {
    return null
  }
}

export async function createSystem(id: string): Promise<{ id: string; factsPath: string; facts: Facts }> {
  const dir = await ensureSystemsDir()
  const safe = sanitizeSystemId(id)
  const yamlPath = path.join(dir, `${safe}.yaml`)

  try {
    await fs.access(yamlPath)
    // If exists, just return it
    const existing = await loadYamlFile<Facts>(yamlPath)
    return { id: safe, factsPath: yamlPath, facts: existing }
  } catch {
    const facts: Facts = {
      scope: 'system',
      description: '',
      base: {},
    }
    await fs.writeFile(yamlPath, dumpYaml(normalizeFactsForDump(facts)), 'utf-8')
    return { id: safe, factsPath: yamlPath, facts }
  }
}

export async function saveSystemFacts(id: string, facts: Facts): Promise<void> {
  const dir = await ensureSystemsDir()
  const safe = sanitizeSystemId(id)
  const yamlPath = path.join(dir, `${safe}.yaml`)
  await fs.writeFile(yamlPath, dumpYaml(normalizeFactsForDump(facts)), 'utf-8')
}
