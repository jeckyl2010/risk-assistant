import Link from 'next/link'
import { buildPortfolio } from '@/lib/portfolio'
import { NewSystemForm } from '@/components/NewSystemForm'
import { PortfolioStats } from '@/components/portfolio/PortfolioStats'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, FileCheck, Activity, ArrowRight } from 'lucide-react'
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
  }

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10">
      {/* Header with gradient background */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-8 shadow-2xl">
        <div className="absolute inset-0 bg-grid-white/10 [mask-image:linear-gradient(0deg,transparent,rgba(255,255,255,0.6))]" />
        <div className="relative flex flex-col gap-4">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm shadow-xl">
              <Shield className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md">
                Risk Assistant
              </h1>
              <p className="text-indigo-100 drop-shadow">
                Lightweight, deterministic, facts-based guardrail engine
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-white/20 text-white border-white/30 backdrop-blur-sm">
              Model {modelVersion}
            </Badge>
            <Badge variant="outline" className="bg-white/10 text-white border-white/30 backdrop-blur-sm">
              {rows.length} {rows.length === 1 ? 'System' : 'Systems'}
            </Badge>
          </div>
        </div>
      </div>

      {/* Stats Dashboard */}
      {rows.length > 0 && <PortfolioStats stats={stats} />}

      {/* Create New System Card */}
      <Card className="border-2 border-dashed border-indigo-200 dark:border-indigo-900 bg-gradient-to-br from-indigo-50/50 to-purple-50/50 dark:from-indigo-950/20 dark:to-purple-950/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-indigo-900 dark:text-indigo-100">
            <FileCheck className="h-5 w-5" />
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

      {/* Portfolio Table */}
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
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
            <div className="overflow-hidden">
              <table className="w-full">
                <thead className="border-b-2 border-zinc-200 dark:border-zinc-800">
                  <tr className="bg-zinc-50/50 dark:bg-zinc-900/50">
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                      System
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                      Controls
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                      Missing Answers
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                      Activated Domains
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {rows.map((r) => (
                    <tr
                      key={r.id}
                      className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50"
                    >
                      <td className="px-6 py-4">
                        <Link
                          className="font-semibold text-zinc-900 hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-300"
                          href={`/systems/${encodeURIComponent(r.id)}`}
                        >
                          {r.id}
                        </Link>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary">{r.derivedControls}</Badge>
                      </td>
                      <td className="px-6 py-4">
                        {r.missingAnswers > 0 ? (
                          <Badge variant="warning">{r.missingAnswers}</Badge>
                        ) : (
                          <Badge variant="success">0</Badge>
                        )}
                      </td>
                      <td className="px-6 py-4 text-sm text-zinc-700 dark:text-zinc-300">
                        {r.activatedDomains || '—'}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <Link
                          href={`/systems/${encodeURIComponent(r.id)}`}
                          className="inline-flex items-center gap-1 text-sm font-medium text-zinc-600 opacity-0 transition-all group-hover:opacity-100 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                        >
                          Open
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
