import Link from 'next/link'
import { buildPortfolio } from '@/lib/portfolio'
import { NewSystemForm } from '@/components/NewSystemForm'

export default async function Home() {
  const { modelVersion, rows } = await buildPortfolio('model')

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-10">
      <div className="flex flex-col gap-2">
        <h1 className="text-2xl font-semibold tracking-tight">Risk Assistant</h1>
        <p className="text-sm text-zinc-600">Model: {modelVersion}</p>
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
        <NewSystemForm />
      </div>

      <div className="rounded-2xl border border-zinc-200 bg-white shadow-sm">
        <div className="border-b border-zinc-100 px-5 py-4">
          <h2 className="text-sm font-medium text-zinc-700">Portfolio</h2>
        </div>

        {rows.length === 0 ? (
          <div className="px-5 py-8 text-sm text-zinc-600">No systems yet. Create one above.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-zinc-600">
                <tr className="border-b border-zinc-100">
                  <th className="px-5 py-3 font-medium">System</th>
                  <th className="px-5 py-3 font-medium">Controls</th>
                  <th className="px-5 py-3 font-medium">Missing answers</th>
                  <th className="px-5 py-3 font-medium">Activated domains</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-b border-zinc-50 last:border-b-0">
                    <td className="px-5 py-3">
                      <Link className="font-medium text-zinc-900 hover:underline" href={`/systems/${encodeURIComponent(r.id)}`}>
                        {r.id}
                      </Link>
                    </td>
                    <td className="px-5 py-3 text-zinc-700">{r.derivedControls}</td>
                    <td className="px-5 py-3 text-zinc-700">{r.missingAnswers}</td>
                    <td className="px-5 py-3 text-zinc-700">{r.activatedDomains}</td>
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
