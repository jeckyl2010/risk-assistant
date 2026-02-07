'use client'

import { motion } from 'framer-motion'
import { Save, Play, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

type SaveState = 'idle' | 'saving' | 'saved' | 'error'
type EvalState = 'idle' | 'running' | 'error'

interface SystemHeaderProps {
  id: string
  modelVersion: string
  activatedDomains: string[]
  onSave: () => void
  onEvaluate: () => void
  saveState: SaveState
  evalState: EvalState
  derivedControls?: number
  missingAnswers?: number
}

export function SystemHeader({
  id,
  modelVersion,
  activatedDomains,
  onSave,
  onEvaluate,
  saveState,
  evalState,
  derivedControls,
  missingAnswers
}: SystemHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col gap-4"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
            {id}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant="secondary">Model {modelVersion}</Badge>
            {activatedDomains.length > 0 ? (
              activatedDomains.map((domain) => (
                <Badge key={domain} variant="outline">
                  {domain}
                </Badge>
              ))
            ) : (
              <Badge variant="outline">No domains activated</Badge>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button
            onClick={onSave}
            variant="outline"
            disabled={saveState === 'saving'}
          >
            {saveState === 'saving' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving…
              </>
            ) : saveState === 'saved' ? (
              <>
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Saved
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                Save
              </>
            )}
          </Button>

          <Button
            onClick={onEvaluate}
            disabled={evalState === 'running'}
          >
            {evalState === 'running' ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Evaluating…
              </>
            ) : (
              <>
                <Play className="h-4 w-4" />
                Evaluate
              </>
            )}
          </Button>

          {derivedControls !== undefined && missingAnswers !== undefined && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 rounded-lg border border-zinc-200/50 bg-white/90 px-4 py-2 text-sm shadow-md backdrop-blur dark:border-zinc-700/50 dark:bg-zinc-900/90"
            >
              <div className="flex items-center gap-1.5">
                <span className="font-medium text-zinc-900 dark:text-zinc-50">
                  {derivedControls}
                </span>
                <span className="text-zinc-600 dark:text-zinc-400">controls</span>
              </div>
              <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
              <div className="flex items-center gap-1.5">
                <span className={`font-medium ${missingAnswers > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-green-600 dark:text-green-400'}`}>
                  {missingAnswers}
                </span>
                <span className="text-zinc-600 dark:text-zinc-400">missing</span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
