import { NextResponse } from "next/server";
import { z } from "zod";
import { evaluateFacts } from "@/lib/evaluator";
import { getModelVersion, modelPaths } from "@/lib/model";
import { findRepoRoot } from "@/lib/repoRoot";
import { EvaluateRequestSchema } from "@/lib/schemas";

export async function POST(request: Request) {
  try {
    // Parse and validate request body
    const body = await request.json().catch(() => ({}));
    const validatedData = EvaluateRequestSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid request body", details: validatedData.error.format() },
        { status: 400 },
      );
    }

    const { facts, modelDir } = validatedData.data;

    const repoRoot = findRepoRoot(process.cwd());
    const paths = modelPaths(repoRoot, modelDir);
    const modelVersion = await getModelVersion(repoRoot, modelDir);

    const result = await evaluateFacts(facts, paths);
    return NextResponse.json({ modelDir, modelVersion, result });
  } catch (error) {
    console.error("Evaluate API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 },
    );
  }
}
