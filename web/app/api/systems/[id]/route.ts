import { NextResponse } from 'next/server'
import { getSystemFacts, saveSystemFacts, deleteSystem } from '@/lib/storage'
import { SaveSystemRequestSchema } from '@/lib/schemas'

export async function GET(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const sys = await getSystemFacts(id)
    
    if (!sys) {
      return NextResponse.json({ error: 'System not found' }, { status: 404 })
    }
    
    return NextResponse.json({ id: sys.id, facts: sys.facts })
  } catch (error) {
    console.error('Get system error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    
    // Parse and validate request body
    const body = await request.json().catch(() => ({}))
    const validatedData = SaveSystemRequestSchema.safeParse(body)

    if (!validatedData.success) {
      return NextResponse.json(
        { error: 'Invalid request body', details: validatedData.error.format() },
        { status: 400 }
      )
    }

    await saveSystemFacts(id, validatedData.data.facts as Record<string, unknown>)
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Save system error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params
    const deleted = await deleteSystem(id)
    
    if (!deleted) {
      return NextResponse.json({ error: 'System not found' }, { status: 404 })
    }
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error('Delete system error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal server error' },
      { status: 500 }
    )
  }
}
