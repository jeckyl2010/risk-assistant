'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { motion } from 'framer-motion'
import { FolderPlus, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const formSchema = z.object({
  path: z.string().min(1, 'File path is required')
})

type FormData = z.infer<typeof formSchema>

export function AddExistingSystemForm() {
  const [isAdding, setIsAdding] = useState(false)
  const router = useRouter()

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(formSchema)
  })

  async function onSubmit(data: FormData) {
    setIsAdding(true)
    try {
      const res = await fetch('/api/systems/add', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(data),
      })
      
      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.error || `Failed: ${res.status}`)
      }
      
      const json = (await res.json()) as { id: string }
      toast.success('System added to portfolio!')
      router.refresh()
      router.push(`/systems/${encodeURIComponent(json.id)}`)
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to add system')
    } finally {
      setIsAdding(false)
    }
  }

  return (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        <div className="flex flex-1 flex-col gap-2">
          <Label htmlFor="system-path">
            Existing System File Path
          </Label>
          <Input
            id="system-path"
            {...register('path')}
            placeholder="./systems/MySystem.yaml or C:\Repos\team-systems\MySystem.yaml"
            disabled={isAdding}
          />
          {errors.path && (
            <motion.p
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-sm text-red-600 dark:text-red-400"
            >
              {errors.path.message}
            </motion.p>
          )}
          <p className="text-xs text-gray-600 dark:text-gray-400">
            Path to an existing system YAML file. Relative or absolute paths supported.
          </p>
        </div>
      </div>
      
      <Button
        type="submit"
        disabled={isAdding}
        variant="outline"
        className="self-start"
        size="default"
      >
        {isAdding ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Adding…
          </>
        ) : (
          <>
            <FolderPlus className="h-4 w-4" />
            Add to Portfolio
          </>
        )}
      </Button>
    </motion.form>
  )
}
