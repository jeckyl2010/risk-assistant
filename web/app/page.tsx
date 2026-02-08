import Link from 'next/link'
import { buildPortfolio } from '@/lib/portfolio'
import { NewSystemForm } from '@/components/NewSystemForm'
import { AddExistingSystemForm } from '@/components/AddExistingSystemForm'
import { PortfolioStats } from '@/components/portfolio/PortfolioStats'
import { PortfolioTable } from '@/components/portfolio/PortfolioTable'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, FileCheck, Activity, FolderPlus } from 'lucide-react'
import { NoSystemsEmpty } from '@/components/ui/empty-state'

export default async function Home() {
  const { modelVersion, rows } = await buildPortfolio('model')

  // Calculate stats
  const totalSystems = rows.length
  const totalControls = rows.reduce((sum, r) => sum + r.derivedControls, 0)
  const totalMissing = rows.reduce((sum, r) => sum + r.missingAnswers, 0)
  
  // Calculate completion rate (rough estimate based on missing answers)
  const avgQuestionsPerSystem = 15 // rough estimate
  const totalPossibleAnswers = rows.length * avgQuestionsPerSystem
  const answeredQuestions = totalPossibleAnswers - totalMissing
  const completionRate = totalPossibleAnswers > 0 ? Math.round((answeredQuestions / totalPossibleAnswers) * 100) : 0

  // System status - how many systems are complete vs need work
  const systemsComplete = rows.filter(r => r.missingAnswers === 0).length
  const systemsInProgress = rows.filter(r => r.missingAnswers > 0 && r.missingAnswers <= 5).length
  const systemsNeedWork = rows.filter(r => r.missingAnswers > 5).length

  const systemStatus = {
    'Complete': systemsComplete,
    'In Progress': systemsInProgress,
    'Need Work': systemsNeedWork,
  }

  const stats = {
    totalSystems,
    totalControls,
    totalMissing,
    completionRate,
    systemStatus,
    portfolioRows: rows, // Pass full data for heatmap
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-900 shadow-sm">
        {/* Subtle gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-500/10 dark:via-purple-500/10 dark:to-pink-500/10" />
        
        <div className="relative flex items-start justify-between gap-6 p-6">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
              <Shield className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                Risk Assistant
              </h1>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
                Smart questions. Clear controls. No scores, no guesswork.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary">Model {modelVersion}</Badge>
          </div>
        </div>
      </div>

      {/* Create New System Card */}
      <Card className="border-2 border-dashed border-indigo-200 dark:border-indigo-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold text-indigo-900 dark:text-indigo-100">
            <FileCheck className="h-6 w-6" />
            Create New System
          </CardTitle>
          <CardDescription>
            Start a new risk assessment by creating a system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <NewSystemForm />
        </CardContent>
      </Card>

      {/* Add Existing System Card */}
      <Card className="border-2 border-dashed border-purple-200 dark:border-purple-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold text-purple-900 dark:text-purple-100">
            <FolderPlus className="h-6 w-6" />
            Add Existing System
          </CardTitle>
          <CardDescription>
            Add a system file that already exists on your filesystem to the portfolio
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AddExistingSystemForm />
        </CardContent>
      </Card>

      {/* Portfolio Table */}
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <Activity className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Portfolio
          </CardTitle>
          <CardDescription>
            All risk assessment systems in your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <NoSystemsEmpty onCreateSystem={() => {}} />
          ) : (
            <PortfolioTable rows={rows} />
          )}
        </CardContent>
      </Card>

      {/* Stats Dashboard */}
      {rows.length > 0 && <PortfolioStats stats={stats} />}
    </div>
  )
}
