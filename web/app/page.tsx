import { Activity, FolderPlus, HelpCircle, Shield } from "lucide-react";
import Link from "next/link";
import { PortfolioStats } from "@/components/portfolio/PortfolioStats";
import { PortfolioTable } from "@/components/portfolio/PortfolioTable";
import { SystemManagement } from "@/components/SystemManagement";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { NoSystemsEmpty } from "@/components/ui/empty-state";
import { buildPortfolio } from "@/lib/portfolio";

export default async function Home() {
  const { modelVersion, rows } = await buildPortfolio("model");

  // Calculate stats
  const totalSystems = rows.length;
  const totalControls = rows.reduce((sum, r) => sum + r.derivedControls, 0);
  const totalMissing = rows.reduce((sum, r) => sum + r.missingAnswers, 0);

  // Calculate completion rate (rough estimate based on missing answers)
  const avgQuestionsPerSystem = 15; // rough estimate
  const totalPossibleAnswers = rows.length * avgQuestionsPerSystem;
  const answeredQuestions = totalPossibleAnswers - totalMissing;
  const completionRate = totalPossibleAnswers > 0 ? Math.round((answeredQuestions / totalPossibleAnswers) * 100) : 0;

  // System status - how many systems are complete vs need work
  const systemsComplete = rows.filter((r) => r.missingAnswers === 0).length;
  const systemsInProgress = rows.filter((r) => r.missingAnswers > 0 && r.missingAnswers <= 5).length;
  const systemsNeedWork = rows.filter((r) => r.missingAnswers > 5).length;

  const systemStatus = {
    Complete: systemsComplete,
    "In Progress": systemsInProgress,
    "Need Work": systemsNeedWork,
  };

  const stats = {
    totalSystems,
    totalControls,
    totalMissing,
    completionRate,
    systemStatus,
    portfolioRows: rows, // Pass full data for heatmap
  };

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-6 py-10">
      {/* Header */}
      <div className="relative overflow-hidden rounded-xl border border-zinc-200/60 bg-white dark:border-zinc-800/60 dark:bg-zinc-900 shadow-sm">
        {/* Background pattern with gradient overlay */}
        <div 
          className="absolute inset-0"
          style={{
            backgroundImage: 'url(/header-pattern.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.50,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 dark:from-indigo-500/10 dark:via-purple-500/10 dark:to-pink-500/10" />

        <div className="relative p-6 pb-14">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 shadow-md">
                <Shield className="h-7 w-7 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight text-slate-950 dark:text-zinc-50" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>Risk Assistant</h1>
                <p className="text-sm text-slate-700 dark:text-zinc-400 mt-1" style={{ textShadow: '0 1px 1px rgba(0,0,0,0.05)' }}>
                  Smart questions. Clear controls. No scores, no guesswork.
                </p>
              </div>
            </div>

            {/* Documentation Link */}
            <Link
              href="/docs"
              className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50 px-4 py-2 text-sm font-medium text-indigo-700 transition-colors hover:bg-indigo-100 hover:border-indigo-300 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-300 dark:hover:bg-indigo-900 self-start"
            >
              <HelpCircle className="h-4 w-4" />
              Documentation
            </Link>
          </div>

          {/* Version Info - Bottom Right */}
          <div className="absolute bottom-4 right-6 flex flex-col items-end gap-0.5 text-xs text-slate-700 dark:text-zinc-400" style={{ textShadow: '0 1px 2px rgba(255,255,255,0.8)' }}>
            <span>Version: 0.6.7</span>
            <span>Model: {modelVersion}</span>
          </div>
        </div>
      </div>

      {/* System Management */}
      <Card className="border-2 border-dashed border-indigo-200 dark:border-indigo-900">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl font-semibold text-indigo-900 dark:text-indigo-100">
            <FolderPlus className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Add System to Portfolio
          </CardTitle>
          <CardDescription>Create a new risk assessment or add an existing system file</CardDescription>
        </CardHeader>
        <CardContent>
          <SystemManagement />
        </CardContent>
      </Card>

      {/* Portfolio Table */}
      <Card className="overflow-hidden shadow-lg">
        <CardHeader className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800">
          <CardTitle className="flex items-center gap-2 text-xl font-semibold">
            <Activity className="h-6 w-6 text-indigo-600 dark:text-indigo-400" />
            Portfolio
          </CardTitle>
          <CardDescription>All risk assessment systems in your portfolio</CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {rows.length === 0 ? <NoSystemsEmpty onCreateSystem={() => {}} /> : <PortfolioTable rows={rows} />}
        </CardContent>
      </Card>

      {/* Stats Dashboard */}
      {rows.length > 0 && <PortfolioStats stats={stats} />}
    </div>
  );
}
