'use client'

import { motion } from 'framer-motion'
import { FileQuestion, Inbox, Sparkles, TrendingUp, AlertCircle } from 'lucide-react'
import { Button } from './button'

interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export function EmptyState({ icon, title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center py-16 px-4 text-center"
    >
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
        className="mb-6 rounded-full bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 p-6 shadow-lg"
      >
        <div className="text-zinc-600 dark:text-zinc-400">
          {icon || <Inbox className="h-12 w-12" />}
        </div>
      </motion.div>

      <motion.h3
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="text-xl font-semibold text-zinc-900 dark:text-zinc-50 mb-2"
      >
        {title}
      </motion.h3>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="text-sm text-zinc-600 dark:text-zinc-400 max-w-md mb-6"
      >
        {description}
      </motion.p>

      {action && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button onClick={action.onClick} size="lg" className="shadow-lg">
            {action.label}
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}

export function NoSystemsEmpty({ onCreateSystem }: { onCreateSystem: () => void }) {
  return (
    <EmptyState
      icon={<FileQuestion className="h-12 w-12" />}
      title="No systems yet"
      description="Start building your risk portfolio by creating your first system. Answer questions to derive controls and manage compliance."
      action={{
        label: 'Create First System',
        onClick: onCreateSystem,
      }}
    />
  )
}

export function NoResultsEmpty({ onEvaluate }: { onEvaluate: () => void }) {
  return (
    <EmptyState
      icon={<Sparkles className="h-12 w-12" />}
      title="Ready to evaluate"
      description="Run the evaluation to analyze your system against the risk model and derive applicable controls."
      action={{
        label: 'Run Evaluation',
        onClick: onEvaluate,
      }}
    />
  )
}

export function NoQuestionsAnswered() {
  return (
    <EmptyState
      icon={<AlertCircle className="h-12 w-12" />}
      title="Answer questions to activate domains"
      description="Start by answering the base questions. As you provide answers, additional domain-specific questions will be activated based on your system's characteristics."
    />
  )
}

export function AllQuestionsAnswered() {
  return (
    <EmptyState
      icon={<TrendingUp className="h-12 w-12" />}
      title="All questions answered!"
      description="Great job! You've completed all required questions. Run the evaluation to see what controls apply to your system."
    />
  )
}
