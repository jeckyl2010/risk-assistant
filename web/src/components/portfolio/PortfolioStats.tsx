'use client'

import { motion } from 'framer-motion'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Shield, CheckCircle2, AlertCircle, TrendingUp, Network } from 'lucide-react'
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend } from 'recharts'

interface PortfolioStats {
  totalSystems: number
  totalControls: number
  totalMissing: number
  completionRate: number
  domainDistribution: Record<string, number>
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
  const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6']

  const domainData = Object.entries(stats.domainDistribution).map(([name, value]) => ({
    name: name.charAt(0).toUpperCase() + name.slice(1),
    value,
  }))

  const completionData = [
    { name: 'Complete', value: stats.totalSystems - stats.totalMissing, fill: '#10b981' },
    { name: 'Incomplete', value: stats.totalMissing, fill: '#f59e0b' },
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
          title="Active Domains"
          value={Object.keys(stats.domainDistribution).length}
          description="Across portfolio"
          icon={<Network className="h-5 w-5" />}
          delay={0.3}
        />
      </div>

      {/* Charts */}
      {stats.totalSystems > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Domain Distribution */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <Card className="overflow-hidden">
              <CardHeader>
                <CardTitle className="text-base">Domain Distribution</CardTitle>
                <CardDescription>Active domains across systems</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <PieChart>
                    <Pie
                      data={domainData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {domainData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
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
                <CardTitle className="text-base">Completion Status</CardTitle>
                <CardDescription>Question coverage</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={completionData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                      {completionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      )}
    </div>
  )
}
