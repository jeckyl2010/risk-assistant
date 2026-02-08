import { NextResponse } from 'next/server'
import { addExistingSystem } from '@/lib/storage'

export async function POST(request: Request) {
  try {
    const body = (await request.json().catch(() => ({}))) as { path?: string }
    
    if (!body.path) {
      return NextResponse.json(
        { error: 'System file path is required' },
        { status: 400 }
      )
    }
    
    const added = await addExistingSystem(body.path)
    return NextResponse.json({ id: added.id, path: added.factsPath })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to add system'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
