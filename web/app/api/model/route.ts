import { NextResponse } from "next/server";
import { getModelVersion, modelPaths } from "@/lib/model";
import { loadModelForUI } from "@/lib/modelIndex";
import { findRepoRoot } from "@/lib/repoRoot";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const modelDir = url.searchParams.get("modelDir") ?? "model";

  const repoRoot = findRepoRoot(process.cwd());
  const paths = modelPaths(repoRoot, modelDir);

  const version = await getModelVersion(repoRoot, modelDir);
  const ui = await loadModelForUI(paths);

  return NextResponse.json({ modelDir, modelVersion: version, ...ui });
}
