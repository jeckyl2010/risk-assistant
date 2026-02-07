'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { GitCompare, Loader2, Play } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface DiffResult {
  old: { modelDir: string; modelVersion: string }
  new: { modelDir: string; modelVersion: string }
  controls: { added: string[]; removed: string[] }
  questions: { newlyMissing: string[]; noLongerMissing: string[] }
  activatedDomains: { old: string[]; new: string[] }
}

interface DiffSectionProps {
  onRunDiff: (oldModelDir: string, newModelDir: string) => Promise<void>
  diffResult: DiffResult | null
  isRunning: boolean
}

export function DiffSection({ onRunDiff, diffResult, isRunning }: DiffSectionProps) {
  const [oldModelDir, setOldModelDir] = useState('model')
  const [newModelDir, setNewModelDir] = useState('model')

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <GitCompare className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
                Compare Model Versions
              </CardTitle>
              <CardDescription className="mt-1">
                Compare how different model versions affect controls and questions
              </CardDescription>
            </div>
            <Button
              onClick={() => onRunDiff(oldModelDir, newModelDir)}
              disabled={isRunning}
              size="sm"
            >
              {isRunning ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Running…
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Run Diff
                </>
              )}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="old-model">Old model directory</Label>
            <Input
              id="old-model"
              value={oldModelDir}
              onChange={(e) => setOldModelDir(e.target.value)}
              placeholder="model"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="new-model">New model directory</Label>
            <Input
              id="new-model"
              value={newModelDir}
              onChange={(e) => setNewModelDir(e.target.value)}
              placeholder="model"
            />
          </div>
        </CardContent>
      </Card>

      {diffResult && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <Card className="shadow-md">
            <CardHeader>
              <CardTitle className="text-base">Version Comparison</CardTitle>
              <CardDescription>
                {diffResult.old.modelDir} ({diffResult.old.modelVersion}) → {diffResult.new.modelDir} ({diffResult.new.modelVersion})
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Controls Changes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Added Controls
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {diffResult.controls.added.length > 0 ? (
                    diffResult.controls.added.map((id) => (
                      <Badge key={id} variant="success">
                        + {id}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">(none)</span>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Removed Controls
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {diffResult.controls.removed.length > 0 ? (
                    diffResult.controls.removed.map((id) => (
                      <Badge key={id} variant="destructive">
                        - {id}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">(none)</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Questions Changes</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Newly Missing
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {diffResult.questions.newlyMissing.length > 0 ? (
                    diffResult.questions.newlyMissing.map((id, i) => (
                      <Badge key={i} variant="warning">
                        {id}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">(none)</span>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  No Longer Missing
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {diffResult.questions.noLongerMissing.length > 0 ? (
                    diffResult.questions.noLongerMissing.map((id, i) => (
                      <Badge key={i} variant="success">
                        {id}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">(none)</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Activated Domains</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <Label className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  Old
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {diffResult.activatedDomains.old.length > 0 ? (
                    diffResult.activatedDomains.old.map((d) => (
                      <Badge key={d} variant="outline">
                        {d}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">(none)</span>
                  )}
                </div>
              </div>
              <div>
                <Label className="text-xs uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                  New
                </Label>
                <div className="mt-2 flex flex-wrap gap-2">
                  {diffResult.activatedDomains.new.length > 0 ? (
                    diffResult.activatedDomains.new.map((d) => (
                      <Badge key={d} variant="outline">
                        {d}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">(none)</span>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  )
}
