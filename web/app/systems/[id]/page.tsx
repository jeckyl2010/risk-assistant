import { ChevronRight, Home } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SystemEditor } from "@/components/SystemEditor";
import { getModelVersion, modelPaths } from "@/lib/model";
import { loadModelForUI } from "@/lib/modelIndex";
import { findRepoRoot } from "@/lib/repoRoot";
import { getSystemFacts } from "@/lib/storage";

export default async function SystemPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const sys = await getSystemFacts(id);
  if (!sys) return notFound();

  const repoRoot = findRepoRoot(process.cwd());
  const paths = modelPaths(repoRoot, "model");
  const modelVersion = await getModelVersion(repoRoot, "model");
  const ui = await loadModelForUI(paths);

  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-6 py-10">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-2 text-sm text-zinc-600 dark:text-zinc-400">
        <Link href="/" className="flex items-center gap-1 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
          <Home className="h-4 w-4" />
          Portfolio
        </Link>
        <ChevronRight className="h-4 w-4" />
        <span className="text-zinc-900 dark:text-zinc-100 font-medium">{sys.id}</span>
      </nav>

      <SystemEditor
        id={sys.id}
        initialFacts={sys.facts}
        model={{ modelDir: "model", modelVersion }}
        baseQuestions={ui.baseQuestions}
        baseDescription={ui.baseDescription}
        domainQuestions={ui.domainQuestions}
        domainDescriptions={ui.domainDescriptions}
        triggers={ui.triggers}
      />
    </div>
  );
}
