import { notFound } from 'next/navigation'
import { findRepoRoot } from '@/lib/repoRoot'
import { modelPaths, getModelVersion } from '@/lib/model'
import { getSystemFacts } from '@/lib/storage'
import { loadModelForUI } from '@/lib/modelIndex'
import { SystemEditor } from '@/components/SystemEditor'

export default async function SystemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const sys = await getSystemFacts(id)
  if (!sys) return notFound()

  const repoRoot = findRepoRoot(process.cwd())
  const paths = modelPaths(repoRoot, 'model')
  const modelVersion = await getModelVersion(repoRoot, 'model')
  const ui = await loadModelForUI(paths)

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10">
      <SystemEditor
        id={sys.id}
        initialFacts={sys.facts}
        model={{ modelDir: 'model', modelVersion }}
        baseQuestions={ui.baseQuestions}
        domainQuestions={ui.domainQuestions}
        triggers={ui.triggers}
      />
    </div>
  )
}
