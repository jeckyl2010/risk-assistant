import Link from 'next/link'
import { buildPortfolio } from '@/lib/portfolio'
import { NewSystemForm } from '@/components/NewSystemForm'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, FileCheck, AlertCircle, Activity, ArrowRight } from 'lucide-react'

export default async function Home() {
  const { modelVersion, rows } = await buildPortfolio('model')

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10">
      {/* Header */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-900 to-zinc-700 dark:from-zinc-50 dark:to-zinc-300">
            <Shield className="h-6 w-6 text-white dark:text-zinc-900" />
          </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
              Risk Assistant
            </h1>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Lightweight, deterministic, facts-based guardrail engine
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Model {modelVersion}</Badge>
          <Badge variant="outline">{rows.length} {rows.length === 1 ? 'System' : 'Systems'}</Badge>
        </div>
      </div>

      {/* Create New System Card */}
      <Card className="border-2 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
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
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-zinc-600 dark:text-zinc-400" />
            Portfolio
          </CardTitle>
          <CardDescription>
            All risk assessment systems in your portfolio
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-4 px-6 py-16 text-center">
              <div className="flex h-20 w-20 items-center justify-center rounded-full bg-zinc-100 dark:bg-zinc-800">
                <AlertCircle className="h-10 w-10 text-zinc-400 dark:text-zinc-600" />
              </div>
              <div>
                <h3 className="font-semibold text-zinc-900 dark:text-zinc-50">No systems yet</h3>
                <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
                  Get started by creating your first system above
                </p>
              </div>
            </div>
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
