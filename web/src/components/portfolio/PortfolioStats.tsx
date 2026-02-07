'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, CheckCircle2, AlertCircle, TrendingUp, Network, CircleCheckBig, CircleAlert } from 'lucide-react'
import { Tooltip as InfoTooltip } from '@/components/ui/tooltip'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, RadialBarChart, RadialBar } from 'recharts'

interface PortfolioStats {
  totalSystems: number
  totalControls: number
  totalMissing: number
  completionRate: number
  systemStatus: Record<string, number>
  portfolioRows: Array<{
    id: string
    domains: string[]
    derivedControls: number
  }>
}

interface StatsCardProps {
  title: string
  value: string | number
  description: string
  icon: React.ReactNode
  trend?: {
    value: string
    positive: boolean
  }
  delay: number
}

function StatsCard({ title, value, description, icon, trend, delay }: StatsCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <Card className="overflow-hidden border-zinc-200/60 bg-gradient-to-br from-white to-zinc-50 dark:border-zinc-800/60 dark:from-zinc-900 dark:to-zinc-950 shadow-md hover:shadow-xl transition-shadow duration-300">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{title}</p>
              <div className="mt-2 flex items-baseline gap-2">
                <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">{value}</p>
                {trend && (
                  <span className={`text-sm font-medium ${trend.positive ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {trend.value}
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">{description}</p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 p-3 shadow-inner">
              <div className="text-zinc-600 dark:text-zinc-400">
                {icon}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export function PortfolioStats({ stats }: { stats: PortfolioStats }) {
  const COLORS = ['#10b981', '#f59e0b', '#ef4444'] // Green, Amber, Red

  const statusData = Object.entries(stats.systemStatus)
    .filter(([_, value]) => value > 0) // Only show categories with systems
    .map(([name, value], index) => ({
      name,
      value,
      fill: COLORS[index % COLORS.length]
    }))

  // Calculate question breakdown
  const avgQuestionsPerSystem = 15
  const totalPossibleQuestions = stats.totalSystems * avgQuestionsPerSystem
  const answeredQuestions = totalPossibleQuestions - stats.totalMissing
  
  const questionData = [
    { name: 'Answered', value: answeredQuestions, fill: '#10b981' },
    { name: 'Missing', value: stats.totalMissing, fill: '#f59e0b' },
  ]

  const radialData = [
    {
      name: 'Completion',
      value: stats.completionRate,
      fill: stats.completionRate >= 80 ? '#10b981' : stats.completionRate >= 50 ? '#f59e0b' : '#ef4444'
    }
  ]

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Systems"
          value={stats.totalSystems}
          description="Active risk assessments"
          icon={<Shield className="h-5 w-5" />}
          delay={0}
        />
        <StatsCard
          title="Derived Controls"
          value={stats.totalControls}
          description="Across all systems"
          icon={<CheckCircle2 className="h-5 w-5" />}
          delay={0.1}
        />
        <StatsCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          description="Questions answered"
          icon={<TrendingUp className="h-5 w-5" />}
          trend={{ value: '+12%', positive: true }}
          delay={0.2}
        />
        <StatsCard
          title="Systems Complete"
          value={stats.systemStatus['Complete'] || 0}
          description="Fully assessed systems"
          icon={<CheckCircle2 className="h-5 w-5" />}
          delay={0.3}
        />
      </div>

      {/* Charts */}
      {stats.totalSystems > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* System Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base">System Status</CardTitle>
                <CardDescription>Assessment completion by system</CardDescription>
              </CardHeader>
              <CardContent>
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value, percent }) => 
                          `${name}: ${value} (${((percent ?? 0) * 100).toFixed(0)}%)`
                        }
                        outerRadius={80}
                        dataKey="value"
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex h-60 items-center justify-center text-sm text-zinc-500">
                    No systems yet
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Completion Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base">Question Coverage</CardTitle>
                <CardDescription>Portfolio-wide assessment progress</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Overall Progress Bar */}
                <div className="space-y-3">
                  <div className="flex items-end justify-between">
                    <div>
                      <div className="text-xs font-medium uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                        Overall Progress
                      </div>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-4xl font-bold text-zinc-900 dark:text-zinc-50">
                          {answeredQuestions}
                        </span>
                        <span className="text-lg text-zinc-500 dark:text-zinc-400">
                          / {totalPossibleQuestions}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
                        {stats.completionRate}%
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        complete
                      </div>
                    </div>
                  </div>
                  
                  {/* Large Progress Bar */}
                  <div className="h-6 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500"
                      style={{ width: `${stats.completionRate}%` }}
                    />
                  </div>
                </div>

                {/* Breakdown */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t border-zinc-200 dark:border-zinc-700">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-gradient-to-br from-green-500 to-emerald-500" />
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Answered
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      {answeredQuestions}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {stats.completionRate}% of total
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-gradient-to-br from-amber-500 to-orange-500" />
                      <span className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                        Missing
                      </span>
                    </div>
                    <div className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">
                      {stats.totalMissing}
                    </div>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {Math.round((stats.totalMissing / totalPossibleQuestions) * 100)}% remaining
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}

      {/* Domain Coverage Heatmap */}
      {stats.portfolioRows.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card className="overflow-hidden shadow-lg">
            <CardHeader className="bg-gradient-to-r from-zinc-50 to-zinc-100 dark:from-zinc-900 dark:to-zinc-950">
              <CardTitle className="flex items-center gap-2 text-base">
                <Network className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Domain Coverage Matrix
                <InfoTooltip content="Shows which risk domains (Security, Data, Integration, etc.) are relevant for each system. Domains are automatically activated based on your answers." />
              </CardTitle>
              <CardDescription>Which domains are activated across your systems</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {(() => {
                // Get all unique domains across all systems
                const allDomains = Array.from(
                  new Set(stats.portfolioRows.flatMap(r => r.domains))
                ).sort()
                
                if (allDomains.length === 0) {
                  return (
                    <div className="flex h-40 items-center justify-center text-sm text-zinc-500">
                      No domains activated yet
                    </div>
                  )
                }

                return (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b-2 border-zinc-200 dark:border-zinc-800">
                        <tr className="bg-zinc-50/50 dark:bg-zinc-900/50">
                          <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 sticky left-0 bg-zinc-50/50 dark:bg-zinc-900/50">
                            System
                          </th>
                          {allDomains.map(domain => (
                            <th
                              key={domain}
                              className="px-6 py-3 text-center text-xs font-semibold uppercase tracking-wider text-zinc-600 dark:text-zinc-400"
                            >
                              {domain}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                        {stats.portfolioRows.map((row) => (
                          <tr key={row.id} className="group transition-colors hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                            <td className="px-6 py-4 sticky left-0 bg-white dark:bg-zinc-950 group-hover:bg-zinc-50 dark:group-hover:bg-zinc-900/50">
                              <Link
                                className="font-semibold text-zinc-900 hover:text-zinc-700 dark:text-zinc-50 dark:hover:text-zinc-300"
                                href={`/systems/${encodeURIComponent(row.id)}`}
                              >
                                {row.id}
                              </Link>
                            </td>
                            {allDomains.map((domain) => {
                              const isActivated = row.domains.includes(domain)
                              return (
                                <td
                                  key={`${row.id}-${domain}`}
                                  className="px-6 py-4 text-center"
                                >
                                  <div className="flex justify-center">
                                    <div
                                      className={`
                                        inline-flex h-8 w-8 items-center justify-center rounded-md transition-all
                                        ${isActivated 
                                          ? 'bg-gradient-to-br from-green-500 to-emerald-500 shadow-md' 
                                          : 'bg-zinc-100 dark:bg-zinc-800'
                                        }
                                      `}
                                      title={isActivated ? `${domain} activated` : `${domain} not activated`}
                                    >
                                      {isActivated && (
                                        <CheckCircle2 className="h-4 w-4 text-white" />
                                      )}
                                    </div>
                                  </div>
                                </td>
                              )
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              })()}
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  )
}
