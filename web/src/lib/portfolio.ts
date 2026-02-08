import { evaluateFacts } from "./evaluator";
import { getModelVersion, modelPaths } from "./model";
import { findRepoRoot } from "./repoRoot";
import { getSystemFacts, listSystems } from "./storage";

export type PortfolioRow = {
  id: string;
  derivedControls: number;
  missingAnswers: number;
  activatedDomains: number;
  domains: string[]; // List of activated domain names
};

export async function buildPortfolio(
  modelDir: string = "model",
): Promise<{ modelVersion: string; rows: PortfolioRow[] }> {
  const repoRoot = findRepoRoot(process.cwd());
  const paths = modelPaths(repoRoot, modelDir);
  const modelVersion = await getModelVersion(repoRoot, modelDir);

  const systems = await listSystems();
  const rows: PortfolioRow[] = [];

  for (const id of systems) {
    const sys = await getSystemFacts(id);
    if (!sys) continue;
    const res = await evaluateFacts(sys.facts, paths);
    const missing = res.required_questions.filter((q) => !q.answered).length;
    rows.push({
      id,
      derivedControls: res.derived_controls.length,
      missingAnswers: missing,
      activatedDomains: res.activated_domains.length,
      domains: res.activated_domains,
    });
  }

  return { modelVersion, rows };
}
