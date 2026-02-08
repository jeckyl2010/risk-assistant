import path from "node:path";
import { loadYamlFile } from "./yaml";

export type ModelPaths = {
  modelDir: string;
  questionsDir: string;
  rulesDir: string;
  controlsDir: string;
  baseQuestionsFile: string;
  triggersFile: string;
  controlsRulesFile: string;
  controlsCatalogFile: string;
  controlsLinksFile: string;
  manifestFile: string;
};

export function modelPaths(repoRoot: string, modelDirRelative: string): ModelPaths {
  const modelDir = path.resolve(repoRoot, modelDirRelative);
  const questionsDir = path.join(modelDir, "questions");
  const rulesDir = path.join(modelDir, "rules");
  const controlsDir = path.join(modelDir, "controls");

  return {
    modelDir,
    questionsDir,
    rulesDir,
    controlsDir,
    baseQuestionsFile: path.join(questionsDir, "base.questions.yaml"),
    triggersFile: path.join(rulesDir, "triggers.rules.yaml"),
    controlsRulesFile: path.join(rulesDir, "controls.rules.yaml"),
    controlsCatalogFile: path.join(controlsDir, "controls.catalog.yaml"),
    controlsLinksFile: path.join(controlsDir, "controls.links.yaml"),
    manifestFile: path.join(modelDir, "model.manifest.yaml"),
  };
}

export async function getModelVersion(repoRoot: string, modelDirRelative: string): Promise<string> {
  const paths = modelPaths(repoRoot, modelDirRelative);
  try {
    const manifest = await loadYamlFile<Record<string, unknown>>(paths.manifestFile);
    const v = manifest?.model_version;
    return typeof v === "string" && v.trim() ? v.trim() : "(unknown)";
  } catch {
    return "(unknown)";
  }
}
