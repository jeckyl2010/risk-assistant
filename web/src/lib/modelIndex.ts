import fs from "node:fs/promises";
import path from "node:path";
import type { ModelPaths } from "./model";
import { parseQuestions, parseTriggers, type Question, type TriggerRule } from "./uiTypes";
import { loadYamlFile } from "./yaml";

export async function listDomainNames(paths: ModelPaths): Promise<string[]> {
  try {
    const entries = await fs.readdir(paths.questionsDir);
    return entries
      .filter((e) => e.endsWith(".questions.yaml") && e !== "base.questions.yaml")
      .map((e) => e.replace(/\.questions\.yaml$/, ""))
      .sort();
  } catch {
    return [];
  }
}

export async function loadModelForUI(paths: ModelPaths): Promise<{
  baseQuestions: Question[];
  baseDescription?: string;
  domainQuestions: Record<string, Question[]>;
  domainDescriptions: Record<string, string>;
  triggers: TriggerRule[];
}> {
  const baseDoc = await loadYamlFile<unknown>(paths.baseQuestionsFile);
  const triggersDoc = await loadYamlFile<unknown>(paths.triggersFile);

  const domains = await listDomainNames(paths);
  const domainQuestions: Record<string, Question[]> = {};
  const domainDescriptions: Record<string, string> = {};

  for (const d of domains) {
    const fp = path.join(paths.questionsDir, `${d}.questions.yaml`);
    try {
      const doc = await loadYamlFile<unknown>(fp);
      if (doc && typeof doc === "object") {
        const docRec = doc as Record<string, unknown>;

        // Extract description
        if ("description" in docRec && typeof docRec.description === "string") {
          domainDescriptions[d] = docRec.description.trim();
        }

        // Extract questions
        if ("questions" in docRec) {
          const qs = docRec.questions;
          domainQuestions[d] = parseQuestions(Array.isArray(qs) ? (qs as unknown[]) : []);
        } else {
          domainQuestions[d] = [];
        }
      } else {
        domainQuestions[d] = [];
      }
    } catch {
      domainQuestions[d] = [];
    }
  }

  const baseRaw =
    baseDoc && typeof baseDoc === "object" && "questions" in (baseDoc as Record<string, unknown>)
      ? Array.isArray((baseDoc as Record<string, unknown>).questions)
        ? ((baseDoc as Record<string, unknown>).questions as unknown[])
        : []
      : [];

  const baseDescription =
    baseDoc &&
    typeof baseDoc === "object" &&
    "description" in (baseDoc as Record<string, unknown>) &&
    typeof (baseDoc as Record<string, unknown>).description === "string"
      ? ((baseDoc as Record<string, unknown>).description as string).trim()
      : undefined;

  const triggersRaw =
    triggersDoc && typeof triggersDoc === "object" && "triggers" in (triggersDoc as Record<string, unknown>)
      ? Array.isArray((triggersDoc as Record<string, unknown>).triggers)
        ? ((triggersDoc as Record<string, unknown>).triggers as unknown[])
        : []
      : [];

  return {
    baseQuestions: parseQuestions(baseRaw),
    baseDescription,
    domainQuestions,
    domainDescriptions,
    triggers: parseTriggers(triggersRaw),
  };
}
