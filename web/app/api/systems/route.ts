import { NextResponse } from 'next/server'
import { listSystems, createSystem, sanitizeSystemId } from '@/lib/storage'

export async function GET() {
  const systems = await listSystems()
  return NextResponse.json({ systems })
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => ({}))) as { id?: string }
  const id = sanitizeSystemId(body.id ?? 'system')
  const created = await createSystem(id)
  return NextResponse.json({ id: created.id })
}
