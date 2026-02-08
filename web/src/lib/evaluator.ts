import type { ModelPaths } from "./model";
import { loadYamlFile } from "./yaml";

export type Facts = Record<string, unknown>;

export type ControlReference = {
  type: string;
  ref: string;
  description?: string;
};

export type ControlCatalogEntry = {
  id: string;
  title?: string;
  description?: string;
  scope?: string;
  enforcement_intent?: string;
  activation_phase?: string;
  evidence_type?: string[];
};

export type DerivedControls = Record<string, { because: Record<string, unknown>[]; control: ControlCatalogEntry | null }>;

export type EvaluateResult = {
  activated_domains: string[];
  required_questions: { id: string; answered: boolean }[];
  derived_controls: Array<{
    id: string;
    title: string;
    scope: string;
    enforcement_intent: string;
    activation_phase: string;
    evidence_type: string[];
    because: Record<string, unknown>[];
    references?: ControlReference[];
  }>;
};

function deepGet(obj: unknown, dotted: string): unknown {
  let cur: unknown = obj;
  for (const part of dotted.split(".")) {
    if (!cur || typeof cur !== "object") return null;
    const rec = cur as Record<string, unknown>;
    if (!(part in rec)) return null;
    cur = rec[part];
  }
  return cur;
}

function matchesCondition(facts: Facts, cond: Record<string, unknown>): boolean {
  for (const [k, expected] of Object.entries(cond)) {
    const actual = k.includes(".") ? deepGet(facts, k) : deepGet(facts, `base.${k}`);

    // membership: actual list contains expected scalar
    if (Array.isArray(actual) && !Array.isArray(expected)) {
      if (!actual.includes(expected)) return false;
    } else {
      if (actual !== expected) return false;
    }
  }
  return true;
}

export async function deriveActivatedDomains(facts: Facts, paths: ModelPaths): Promise<string[]> {
  const triggersDoc = await loadYamlFile<unknown>(paths.triggersFile);
  const activated = new Set<string>();

  const triggers =
    triggersDoc && typeof triggersDoc === "object" && "triggers" in (triggersDoc as Record<string, unknown>)
      ? ((triggersDoc as Record<string, unknown>).triggers as unknown)
      : [];

  if (Array.isArray(triggers)) {
    for (const t of triggers) {
      const tt = (t ?? {}) as Record<string, unknown>;
      const cond = (tt.when ?? {}) as Record<string, unknown>;
      if (matchesCondition(facts, cond)) {
        const activate = tt.activate;
        if (Array.isArray(activate)) {
          for (const d of activate) {
            if (typeof d === "string") activated.add(d);
          }
        }
      }
    }
  }

  return Array.from(activated).sort();
}

export async function listDomainQuestions(paths: ModelPaths, domain: string): Promise<unknown[]> {
  try {
    const doc = await loadYamlFile<unknown>(`${paths.questionsDir}/${domain}.questions.yaml`);
    if (doc && typeof doc === "object" && "questions" in (doc as Record<string, unknown>)) {
      const qs = (doc as Record<string, unknown>).questions;
      return Array.isArray(qs) ? (qs as unknown[]) : [];
    }
    return [];
  } catch {
    return [];
  }
}

export async function deriveControls(facts: Facts, paths: ModelPaths): Promise<DerivedControls> {
  const rulesDoc = await loadYamlFile<unknown>(paths.controlsRulesFile);
  const catalogDoc = await loadYamlFile<unknown>(paths.controlsCatalogFile);
  const catalog = new Map<string, ControlCatalogEntry>();

  if (catalogDoc && typeof catalogDoc === "object" && "controls" in (catalogDoc as Record<string, unknown>)) {
    const controls = (catalogDoc as Record<string, unknown>).controls;
    if (Array.isArray(controls)) {
      for (const c of controls) {
        const cc = (c ?? {}) as Record<string, unknown>;
        const id = cc.id;
        if (typeof id === "string") catalog.set(id, cc as unknown as ControlCatalogEntry);
      }
    }
  }

  const derived: DerivedControls = {};

  const rules =
    rulesDoc && typeof rulesDoc === "object" && "rules" in (rulesDoc as Record<string, unknown>)
      ? ((rulesDoc as Record<string, unknown>).rules as unknown)
      : [];

  if (Array.isArray(rules)) {
    for (const rule of rules) {
      const rr = (rule ?? {}) as Record<string, unknown>;
      const cond = (rr.when ?? {}) as Record<string, unknown>;
      if (matchesCondition(facts, cond)) {
        const req = rr.require;
        if (Array.isArray(req)) {
          for (const cid of req) {
            if (typeof cid !== "string") continue;
            if (!derived[cid]) derived[cid] = { because: [], control: catalog.get(cid) ?? null };
            derived[cid].because.push(cond as Record<string, unknown>);
          }
        }
      }
    }
  }

  return derived;
}

export async function requiredQuestionIds(paths: ModelPaths, activatedDomains: string[]): Promise<string[]> {
  const baseDoc = await loadYamlFile<unknown>(paths.baseQuestionsFile);
  const qs =
    baseDoc && typeof baseDoc === "object" && "questions" in (baseDoc as Record<string, unknown>)
      ? ((baseDoc as Record<string, unknown>).questions as unknown)
      : [];
  const baseIds: string[] = [];
  if (Array.isArray(qs)) {
    for (const q of qs) {
      if (q && typeof q === "object" && "id" in (q as Record<string, unknown>)) {
        const id = (q as Record<string, unknown>).id;
        if (typeof id === "string") baseIds.push(id);
      }
    }
  }
  const out: string[] = baseIds.map((id) => `base.${id}`);

  for (const domain of activatedDomains) {
    const qs = await listDomainQuestions(paths, domain);
    for (const q of qs) {
      if (q && typeof q === "object" && "id" in (q as Record<string, unknown>)) {
        const id = (q as Record<string, unknown>).id;
        if (typeof id === "string") out.push(`${domain}.${id}`);
      }
    }
  }
  return out;
}

export function normalizeFactsForDump(facts: Facts): Facts {
  // stable-ish ordering for diffs
  const order = [
    "scope",
    "model_version",
    "description",
    "base",
    "criticality",
    "security",
    "data",
    "ai",
    "integration",
    "operations",
    "cost",
    "exceptions",
  ];
  const out: Facts = {};
  for (const k of order) {
    if (k in facts) out[k] = facts[k];
  }
  for (const k of Object.keys(facts)) {
    if (!(k in out)) out[k] = facts[k];
  }
  return out;
}

async function loadControlLinks(paths: ModelPaths): Promise<Map<string, ControlReference[]>> {
  const linksMap = new Map<string, ControlReference[]>();
  try {
    const linksDoc = await loadYamlFile<unknown>(paths.controlsLinksFile);
    if (linksDoc && typeof linksDoc === "object" && "links" in (linksDoc as Record<string, unknown>)) {
      const links = (linksDoc as Record<string, unknown>).links;
      if (Array.isArray(links)) {
        for (const link of links) {
          if (!link || typeof link !== "object") continue;
          const ll = link as Record<string, unknown>;
          const controlId = ll.control_id;
          const refs = ll.references;
          if (typeof controlId !== "string" || !Array.isArray(refs)) continue;

          const controlRefs: ControlReference[] = [];
          for (const ref of refs) {
            if (!ref || typeof ref !== "object") continue;
            const rr = ref as Record<string, unknown>;
            const type = rr.type;
            const refVal = rr.ref;
            if (typeof type !== "string" || typeof refVal !== "string") continue;

            controlRefs.push({
              type,
              ref: refVal,
              ...(typeof rr.description === "string" ? { description: rr.description } : {}),
            });
          }
          if (controlRefs.length > 0) {
            linksMap.set(controlId, controlRefs);
          }
        }
      }
    }
  } catch {
    // Links file is optional - if it doesn't exist or fails to parse, just return empty map
  }
  return linksMap;
}

export async function evaluateFacts(facts: Facts, paths: ModelPaths): Promise<EvaluateResult> {
  const activated = await deriveActivatedDomains(facts, paths);
  const req = await requiredQuestionIds(paths, activated);
  const required = req.map((id) => ({ id, answered: deepGet(facts, id) !== null }));

  const derived = await deriveControls(facts, paths);
  const linksMap = await loadControlLinks(paths);

  const derived_controls = Object.keys(derived)
    .sort()
    .map((id) => {
      const c = derived[id].control;
      const references = linksMap.get(id);
      return {
        id,
        title: c?.title ?? "(missing from catalog)",
        description: c?.description,
        scope: c?.scope ?? "unknown",
        enforcement_intent: c?.enforcement_intent ?? "unknown",
        activation_phase: c?.activation_phase ?? "unknown",
        evidence_type: c?.evidence_type ?? [],
        because: derived[id].because,
        ...(references && references.length > 0 ? { references } : {}),
      };
    });

  return {
    activated_domains: activated,
    required_questions: required,
    derived_controls,
  };
}
