import { NextResponse } from "next/server";
import { evaluateFacts, type Facts, requiredQuestionIds } from "@/lib/evaluator";
import { getModelVersion, modelPaths } from "@/lib/model";
import { findRepoRoot } from "@/lib/repoRoot";
import { DiffRequestSchema } from "@/lib/schemas";

function setDiff<T>(a: Set<T>, b: Set<T>): T[] {
  return Array.from(a).filter((x) => !b.has(x));
}

function deepGet(obj: unknown, dotted: string): unknown {
  let cur: unknown = obj;
  for (const part of dotted.split(".")) {
    if (!cur || typeof cur !== "object") return undefined;
    const rec = cur as Record<string, unknown>;
    if (!(part in rec)) return undefined;
    cur = rec[part];
  }
  return cur;
}

function missingFromRequired(required: string[], facts: Facts): Set<string> {
  const missing = new Set<string>();
  for (const qpath of required) {
    const v = deepGet(facts, qpath);
    if (v === undefined || v === null) missing.add(qpath);
  }
  return missing;
}

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json().catch(() => ({}));
    const validatedData = DiffRequestSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validatedData.error.format() },
        { status: 400 },
      );
    }

    const { facts, oldModelDir, newModelDir } = validatedData.data;

    const repoRoot = findRepoRoot(process.cwd());
    const oldPaths = modelPaths(repoRoot, oldModelDir);
    const newPaths = modelPaths(repoRoot, newModelDir);

    const oldVersion = await getModelVersion(repoRoot, oldModelDir);
    const newVersion = await getModelVersion(repoRoot, newModelDir);

    const oldEval = await evaluateFacts(facts, oldPaths);
    const newEval = await evaluateFacts(facts, newPaths);

    const oldControls = new Set(oldEval.derived_controls.map((c) => c.id));
    const newControls = new Set(newEval.derived_controls.map((c) => c.id));

    const addedControls = setDiff(newControls, oldControls).sort();
    const removedControls = setDiff(oldControls, newControls).sort();

    // Missing questions deltas
    const oldReq = await requiredQuestionIds(oldPaths, oldEval.activated_domains);
    const newReq = await requiredQuestionIds(newPaths, newEval.activated_domains);

    const missingOld = missingFromRequired(oldReq, facts);
    const missingNew = missingFromRequired(newReq, facts);

    const newlyMissing = setDiff(missingNew, missingOld).sort();
    const noLongerMissing = setDiff(missingOld, missingNew).sort();

    return NextResponse.json({
      old: { modelDir: oldModelDir, modelVersion: oldVersion },
      new: { modelDir: newModelDir, modelVersion: newVersion },
      controls: { added: addedControls, removed: removedControls },
      questions: { newlyMissing, noLongerMissing },
      activatedDomains: { old: oldEval.activated_domains, new: newEval.activated_domains },
    });
  } catch (error) {
    console.error("Diff API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
