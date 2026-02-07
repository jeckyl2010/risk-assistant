import { NextResponse } from 'next/server'
import { findRepoRoot } from '@/lib/repoRoot'
import { modelPaths, getModelVersion } from '@/lib/model'
import { evaluateFacts, type Facts } from '@/lib/evaluator'

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { facts?: Facts; modelDir?: string }
  const facts = body.facts
  if (!facts || typeof facts !== 'object') {
    return NextResponse.json({ error: 'Invalid facts' }, { status: 400 })
  }

  const modelDir = body.modelDir ?? 'model'
  const repoRoot = findRepoRoot(process.cwd())
  const paths = modelPaths(repoRoot, modelDir)
  const modelVersion = await getModelVersion(repoRoot, modelDir)

  const result = await evaluateFacts(facts, paths)
  return NextResponse.json({ modelDir, modelVersion, result })
}
