"use client";

import { motion } from "framer-motion";
import { CheckCircle2, FileText, Shield, Target } from "lucide-react";
import { Bar, BarChart, Cell, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface PortfolioStats {
  totalSystems: number;
  totalControls: number;
  totalMissing: number;
  completionRate: number;
  systemStatus: Record<string, number>;
  portfolioRows: Array<{
    id: string;
    domains: string[];
    derivedControls: number;
  }>;
}

interface StatsCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ReactNode;
  delay: number;
}

function StatsCard({ title, value, description, icon, delay }: StatsCardProps) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <Card className="overflow-hidden border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-900 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-sm font-medium text-zinc-600 dark:text-zinc-400">{title}</p>
              <p className="mt-2 text-3xl font-bold text-zinc-900 dark:text-zinc-50">{value}</p>
              <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-500">{description}</p>
            </div>
            <div className="rounded-lg bg-gradient-to-br from-indigo-500/10 to-purple-500/10 p-3">
              <div className="text-indigo-600 dark:text-indigo-400">{icon}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

export function PortfolioStats({ stats }: { stats: PortfolioStats }) {
  // Calculate domain activation frequency
  const domainFrequency = stats.portfolioRows.reduce(
    (acc, row) => {
      row.domains.forEach((domain) => {
        acc[domain] = (acc[domain] || 0) + 1;
      });
      return acc;
    },
    {} as Record<string, number>,
  );

  const domainData = Object.entries(domainFrequency)
    .map(([name, count]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      count,
      percentage: Math.round((count / stats.totalSystems) * 100),
    }))
    .sort((a, b) => b.count - a.count);

  // Controls distribution - show systems grouped by control count ranges
  const controlRanges = [
    { range: "0-10", min: 0, max: 10, count: 0 },
    { range: "11-20", min: 11, max: 20, count: 0 },
    { range: "21-30", min: 21, max: 30, count: 0 },
    { range: "31+", min: 31, max: 999, count: 0 },
  ];

  stats.portfolioRows.forEach((row) => {
    const range = controlRanges.find((r) => row.derivedControls >= r.min && row.derivedControls <= r.max);
    if (range) range.count++;
  });

  const controlDistribution = controlRanges.filter((r) => r.count > 0);

  const DOMAIN_COLORS = [
    "#6366f1", // indigo
    "#8b5cf6", // purple
    "#ec4899", // pink
    "#f59e0b", // amber
    "#10b981", // emerald
    "#06b6d4", // cyan
    "#ef4444", // red
  ];

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
          icon={<Target className="h-5 w-5" />}
          delay={0.1}
        />
        <StatsCard
          title="Completion Rate"
          value={`${stats.completionRate}%`}
          description="Questions answered"
          icon={<FileText className="h-5 w-5" />}
          delay={0.2}
        />
        <StatsCard
          title="Systems Complete"
          value={stats.systemStatus.Complete || 0}
          description={`${stats.totalSystems - (stats.systemStatus.Complete || 0)} need work`}
          icon={<CheckCircle2 className="h-5 w-5" />}
          delay={0.3}
        />
      </div>

      {/* Charts - Only show when there's data */}
      {stats.totalSystems > 0 && (
        <div className="grid gap-4 md:grid-cols-2">
          {/* Domain Activation Frequency */}
          {domainData.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Domain Activation</CardTitle>
                  <CardDescription>How often each domain is activated across systems</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <BarChart data={domainData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload?.[0]) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                                <p className="font-semibold text-zinc-900 dark:text-zinc-50">{data.name}</p>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                                  {data.count} of {stats.totalSystems} systems ({data.percentage}%)
                                </p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                        {domainData.map((entry, index) => (
                          <Cell key={entry.name} fill={DOMAIN_COLORS[index % DOMAIN_COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Controls Distribution */}
          {controlDistribution.length > 0 && (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
              <Card className="overflow-hidden">
                <CardHeader>
                  <CardTitle className="text-lg font-semibold">Controls Distribution</CardTitle>
                  <CardDescription>Systems grouped by number of derived controls</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={280}>
                    <PieChart>
                      <Pie
                        data={controlDistribution}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ range, count }) => `${range}: ${count}`}
                        outerRadius={90}
                        dataKey="count"
                      >
                        {controlDistribution.map((entry, index) => (
                          <Cell key={entry.range} fill={DOMAIN_COLORS[index]} />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload?.[0]) {
                            const data = payload[0].payload;
                            return (
                              <div className="rounded-lg border border-zinc-200 bg-white p-3 shadow-lg dark:border-zinc-700 dark:bg-zinc-800">
                                <p className="font-semibold text-zinc-900 dark:text-zinc-50">{data.range} controls</p>
                                <p className="text-sm text-zinc-600 dark:text-zinc-400">{data.count} systems</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
