import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { NextResponse } from "next/server";
import { findRepoRoot } from "@/lib/repoRoot";

// Paths the browser is allowed to serve — repo root and user home only.
function allowedRoots(): string[] {
  const repoRoot = findRepoRoot(process.cwd());
  const home = os.homedir();
  // Normalise and deduplicate in case they overlap
  return [...new Set([path.resolve(repoRoot), path.resolve(home)])];
}

function isPathAllowed(targetPath: string, roots: string[]): boolean {
  const resolved = path.resolve(targetPath);
  return roots.some((root) => resolved === root || resolved.startsWith(root + path.sep));
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const requestedPath = searchParams.get("path");

  const roots = allowedRoots();
  // Default start: repo root (more useful than bare homedir for this tool)
  const startPath = requestedPath ? path.resolve(requestedPath) : roots[0]!;

  if (!isPathAllowed(startPath, roots)) {
    return NextResponse.json(
      { error: "Path is outside the allowed directories", currentPath: startPath },
      { status: 403 },
    );
  }

  try {
    const entries = await fs.readdir(startPath, { withFileTypes: true });

    const items = await Promise.all(
      entries.map(async (entry) => {
        const fullPath = path.join(startPath, entry.name);
        const isDirectory = entry.isDirectory();
        const isYaml = !isDirectory && (entry.name.endsWith(".yaml") || entry.name.endsWith(".yml"));

        if (!isDirectory && !isYaml) return null;

        return { name: entry.name, path: fullPath, isDirectory, isYaml };
      }),
    );

    type Item = { name: string; path: string; isDirectory: boolean; isYaml: boolean };
    const filtered = (items.filter(Boolean) as Item[]).sort((a, b) => {
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });

    const parent = path.dirname(startPath);
    const canGoUp = startPath !== parent && isPathAllowed(parent, roots);

    return NextResponse.json({
      currentPath: startPath,
      parent: canGoUp ? parent : null,
      items: filtered,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Failed to read directory";
    return NextResponse.json({ error: message, currentPath: startPath }, { status: 400 });
  }
}
