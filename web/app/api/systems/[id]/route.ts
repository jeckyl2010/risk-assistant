import { NextResponse } from 'next/server'
import { getSystemFacts, saveSystemFacts } from '@/lib/storage'

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const sys = await getSystemFacts(id)
  if (!sys) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ id: sys.id, facts: sys.facts })
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params
  const body = (await request.json().catch(() => ({}))) as { facts?: unknown }
  if (!body.facts || typeof body.facts !== 'object') {
    return NextResponse.json({ error: 'Invalid facts' }, { status: 400 })
  }
  await saveSystemFacts(id, body.facts as Record<string, unknown>)
  return NextResponse.json({ ok: true })
}
