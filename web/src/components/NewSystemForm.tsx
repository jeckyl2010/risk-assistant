'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion } from 'framer-motion'
import { Plus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const formSchema = z.object({
  id: z.string()
    .min(1, 'System ID is required')
    .regex(/^[a-zA-Z0-9-_]+$/, 'Only letters, numbers, dashes, and underscores allowed')
})

type FormData = z.infer<typeof formSchema>

export function NewSystemForm() {
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  })

  async function onSubmit(data: FormData) {
    setIsCreating(true)
    try {
      const res = await fetch('/api/systems', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      })
      if (!res.ok) throw new Error(`Failed: ${res.status}`)
      const json = (await res.json()) as { id: string }
      toast.success('System created successfully!')
      router.push(`/systems/${encodeURIComponent(json.id)}`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to create system')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4 sm:flex-row sm:items-start"
    >
      <div className="flex flex-1 flex-col gap-2">
        <Label htmlFor="system-id">New system ID</Label>
        <Input
          id="system-id"
          {...register('id')}
          placeholder="e.g. shopfloor-analytics"
          disabled={isCreating}
        />
        {errors.id && (
          <motion.p
            initial={{ opacity: 0, y: -5 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-red-600 dark:text-red-400"
          >
            {errors.id.message}
          </motion.p>
        )}
      </div>
      <Button
        type="submit"
        disabled={isCreating}
        className="mt-auto"
        size="default"
      >
        {isCreating ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Creating…
          </>
        ) : (
          <>
            <Plus className="h-4 w-4" />
            Create
          </>
        )}
      </Button>
    </motion.form>
  )
}
