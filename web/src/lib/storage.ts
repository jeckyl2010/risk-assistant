import fs from "fs/promises";
import path from "path";
import { type Facts, normalizeFactsForDump } from "./evaluator";
import { findRepoRoot } from "./repoRoot";
import { dumpYaml, loadYamlFile } from "./yaml";

export type SystemSummary = {
  id: string;
  factsPath: string;
  facts: Facts;
};

export type PortfolioManifest = {
  systems: Array<{
    name: string;
    path: string;
  }>;
};

function portfolioPath(): string {
  const repoRoot = findRepoRoot(process.cwd());
  return path.join(repoRoot, "portfolio.yaml");
}

async function readPortfolio(): Promise<PortfolioManifest> {
  try {
    const manifest = await loadYamlFile<PortfolioManifest>(portfolioPath());
    if (!manifest || !Array.isArray(manifest.systems)) {
      return { systems: [] };
    }
    return manifest;
  } catch {
    return { systems: [] };
  }
}

async function writePortfolio(manifest: PortfolioManifest): Promise<void> {
  await fs.writeFile(portfolioPath(), dumpYaml(manifest), "utf-8");
}

function resolveSystemPath(systemPath: string): string {
  if (path.isAbsolute(systemPath)) {
    return systemPath;
  }
  const repoRoot = findRepoRoot(process.cwd());
  return path.resolve(repoRoot, systemPath);
}

function systemsDir(repoRoot: string): string {
  return path.join(repoRoot, "systems");
}

export async function ensureSystemsDir(): Promise<string> {
  const repoRoot = findRepoRoot(process.cwd());
  const dir = systemsDir(repoRoot);
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

export function sanitizeSystemId(id: string): string {
  const trimmed = id.trim();
  // Allow letters, numbers, dashes, underscores.
  const safe = trimmed.replace(/[^a-zA-Z0-9_-]+/g, "-").replace(/^-+|-+$/g, "");
  return safe || "system";
}

export async function listSystems(): Promise<string[]> {
  const manifest = await readPortfolio();
  return manifest.systems.map((s) => s.name).sort();
}

export async function getSystemFacts(
  id: string,
): Promise<{ id: string; factsPath: string; facts: Facts } | null> {
  const manifest = await readPortfolio();
  const entry = manifest.systems.find((s) => s.name === id);

  if (!entry) return null;

  const yamlPath = resolveSystemPath(entry.path);

  try {
    const facts = await loadYamlFile<Facts>(yamlPath);
    if (!facts || typeof facts !== "object") return null;
    return { id, factsPath: yamlPath, facts };
  } catch {
    return null;
  }
}

export async function createSystem(
  id: string,
  systemPath?: string,
): Promise<{ id: string; factsPath: string; facts: Facts }> {
  const safe = sanitizeSystemId(id);

  // Default path: ./systems/[SystemName].yaml
  const defaultPath = `./systems/${safe}.yaml`;
  const targetPath = systemPath || defaultPath;
  const yamlPath = resolveSystemPath(targetPath);

  // Ensure directory exists
  const dir = path.dirname(yamlPath);
  await fs.mkdir(dir, { recursive: true });

  try {
    await fs.access(yamlPath);
    // If exists, just return it
    const existing = await loadYamlFile<Facts>(yamlPath);

    // Ensure it's in portfolio
    const manifest = await readPortfolio();
    const entry = manifest.systems.find((s) => s.name === safe);
    if (!entry) {
      manifest.systems.push({ name: safe, path: targetPath });
      await writePortfolio(manifest);
    }

    return { id: safe, factsPath: yamlPath, facts: existing };
  } catch {
    const facts: Facts = {
      scope: "system",
      description: "",
      base: {},
    };
    await fs.writeFile(yamlPath, dumpYaml(normalizeFactsForDump(facts)), "utf-8");

    // Add to portfolio
    const manifest = await readPortfolio();
    manifest.systems.push({ name: safe, path: targetPath });
    await writePortfolio(manifest);

    return { id: safe, factsPath: yamlPath, facts };
  }
}

export async function saveSystemFacts(id: string, facts: Facts): Promise<void> {
  const manifest = await readPortfolio();
  const entry = manifest.systems.find((s) => s.name === id);

  if (!entry) {
    throw new Error(`System "${id}" not found in portfolio`);
  }

  const yamlPath = resolveSystemPath(entry.path);
  await fs.writeFile(yamlPath, dumpYaml(normalizeFactsForDump(facts)), "utf-8");
}

export async function deleteSystem(id: string): Promise<boolean> {
  const manifest = await readPortfolio();
  const entry = manifest.systems.find((s) => s.name === id);

  if (!entry) return false;

  const yamlPath = resolveSystemPath(entry.path);

  try {
    // Delete file
    await fs.unlink(yamlPath);

    // Remove from portfolio
    manifest.systems = manifest.systems.filter((s) => s.name !== id);
    await writePortfolio(manifest);

    return true;
  } catch {
    return false;
  }
}

export async function addExistingSystem(
  systemPath: string,
): Promise<{ id: string; factsPath: string; facts: Facts }> {
  const yamlPath = resolveSystemPath(systemPath);

  // Load the facts to verify it's a valid system file and get the name
  const facts = await loadYamlFile<Facts>(yamlPath);
  if (!facts || typeof facts !== "object") {
    throw new Error("Invalid system file");
  }

  // Use the filename (without extension) as the system ID
  const fileName = path.basename(yamlPath, path.extname(yamlPath));
  const id = sanitizeSystemId(fileName);

  // Add to portfolio
  const manifest = await readPortfolio();

  // Check if already in portfolio
  const existing = manifest.systems.find((s) => s.name === id);
  if (existing) {
    throw new Error(`System "${id}" is already in the portfolio`);
  }

  manifest.systems.push({ name: id, path: systemPath });
  await writePortfolio(manifest);

  return { id, factsPath: yamlPath, facts };
}

export async function removeFromPortfolio(id: string): Promise<boolean> {
  const manifest = await readPortfolio();
  const entry = manifest.systems.find((s) => s.name === id);

  if (!entry) return false;

  // Remove from portfolio without deleting the file
  manifest.systems = manifest.systems.filter((s) => s.name !== id);
  await writePortfolio(manifest);

  return true;
}
