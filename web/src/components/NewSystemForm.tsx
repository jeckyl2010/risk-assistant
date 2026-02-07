'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export function NewSystemForm() {
  const [id, setId] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  async function onCreate(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setIsCreating(true)
    try {
      const res = await fetch('/api/systems', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (!res.ok) throw new Error(`Failed: ${res.status}`)
      const json = (await res.json()) as { id: string }
      router.push(`/systems/${encodeURIComponent(json.id)}`)
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to create system')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <form onSubmit={onCreate} className="flex flex-col gap-2 sm:flex-row sm:items-end">
      <div className="flex flex-1 flex-col gap-1">
        <label className="text-sm font-medium text-zinc-700 dark:text-zinc-200">New system ID</label>
        <input
          value={id}
          onChange={(e) => setId(e.target.value)}
          placeholder="e.g. shopfloor-analytics"
          className="h-10 rounded-lg border border-zinc-200/70 bg-white/80 px-3 text-sm shadow-sm outline-none placeholder:text-zinc-400 focus:border-zinc-400 dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:text-zinc-50 dark:placeholder:text-zinc-500"
        />
      </div>
      <button
        type="submit"
        disabled={isCreating}
        className="h-10 rounded-lg bg-zinc-900 px-4 text-sm font-medium text-white shadow-sm hover:bg-zinc-800 disabled:opacity-60 dark:bg-zinc-50 dark:text-zinc-950 dark:hover:bg-white"
      >
        {isCreating ? 'Creating…' : 'Create'}
      </button>
      {error ? <div className="text-sm text-red-600">{error}</div> : null}
    </form>
  )
}
