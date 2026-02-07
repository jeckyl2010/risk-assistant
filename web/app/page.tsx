import Link from 'next/link'
import { buildPortfolio } from '@/lib/portfolio'
import { NewSystemForm } from '@/components/NewSystemForm'

export default async function Home() {
  const { modelVersion, rows } = await buildPortfolio('model')

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Risk Assistant</h1>
        <p className="text-sm text-zinc-600 dark:text-zinc-300">Model: {modelVersion}</p>
      </div>

      <div className="rounded-2xl border border-zinc-200/70 bg-white/80 p-5 shadow-sm backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/40">
        <NewSystemForm />
      </div>

      <div className="rounded-2xl border border-zinc-200/70 bg-white/80 shadow-sm backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/40">
        <div className="border-b border-zinc-100/70 px-5 py-4 dark:border-zinc-800/80">
          <h2 className="text-sm font-medium text-zinc-700 dark:text-zinc-200">Portfolio</h2>
        </div>

        {rows.length === 0 ? (
          <div className="px-5 py-8 text-sm text-zinc-600 dark:text-zinc-300">No systems yet. Create one above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-zinc-600 dark:text-zinc-300">
                <tr className="border-b border-zinc-100/70 dark:border-zinc-800/80">
                  <th className="px-5 py-3 font-medium">System</th>
                  <th className="px-5 py-3 font-medium">Controls</th>
                  <th className="px-5 py-3 font-medium">Missing answers</th>
                  <th className="px-5 py-3 font-medium">Activated domains</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-zinc-100/50 last:border-b-0 dark:border-zinc-900/60">
                    <td className="px-5 py-3">
                      <Link
                        className="font-medium text-zinc-900 hover:underline dark:text-zinc-50"
                        href={`/systems/${encodeURIComponent(r.id)}`}
                      >
                        {r.id}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-zinc-700 dark:text-zinc-200">{r.derivedControls}</td>
                    <td className="px-5 py-3 text-zinc-700 dark:text-zinc-200">{r.missingAnswers}</td>
                    <td className="px-5 py-3 text-zinc-700 dark:text-zinc-200">{r.activatedDomains}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
