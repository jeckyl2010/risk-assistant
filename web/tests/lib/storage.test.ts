/**
 * Tests for the storage layer.
 *
 * Design note: portfolioPath() is hardcoded to findRepoRoot(process.cwd()) so
 * we cannot inject a test portfolio without refactoring storage.ts. We handle
 * this in two tiers:
 *
 *   Tier 1 — Pure unit tests: sanitizeSystemId and resolveSystemPath (absolute
 *   path branch). No FS, no side effects.
 *
 *   Tier 2 — Integration CRUD tests: operate against the real portfolio.yaml but
 *   capture its state before the suite and restore it after, leaving no trace.
 *   System YAML files land in a tmp dir to keep the systems/ folder clean.
 */

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import {
  addExistingSystem,
  createSystem,
  deleteSystem,
  getSystemFacts,
  listSystems,
  removeFromPortfolio,
  sanitizeSystemId,
  saveSystemFacts,
} from "@/lib/storage";
import { findRepoRoot } from "@/lib/repoRoot";
import { loadYamlFile } from "@/lib/yaml";
import type { Facts } from "@/lib/evaluator";

// ---------------------------------------------------------------------------
// sanitizeSystemId — pure
// ---------------------------------------------------------------------------

describe("sanitizeSystemId", () => {
  it("passes through a clean alphanumeric id unchanged", () => {
    expect(sanitizeSystemId("MySystem")).toBe("MySystem");
    expect(sanitizeSystemId("system-123")).toBe("system-123");
    expect(sanitizeSystemId("system_abc")).toBe("system_abc");
  });

  it("trims leading and trailing whitespace", () => {
    expect(sanitizeSystemId("  hello  ")).toBe("hello");
  });

  it("replaces spaces with dashes", () => {
    expect(sanitizeSystemId("my system name")).toBe("my-system-name");
  });

  it("collapses multiple consecutive invalid chars into one dash", () => {
    expect(sanitizeSystemId("a  b")).toBe("a-b");
    expect(sanitizeSystemId("a!!b")).toBe("a-b");
  });

  it("strips leading and trailing dashes after replacement", () => {
    expect(sanitizeSystemId("  !!hello!!  ")).toBe("hello");
  });

  it("replaces dots and slashes (path chars) with dashes", () => {
    expect(sanitizeSystemId("some/path.yaml")).toBe("some-path-yaml");
  });

  it("falls back to 'system' when input is empty", () => {
    expect(sanitizeSystemId("")).toBe("system");
  });

  it("falls back to 'system' when input is all special chars", () => {
    expect(sanitizeSystemId("!!!")).toBe("system");
  });

  it("falls back to 'system' when input is only whitespace", () => {
    expect(sanitizeSystemId("   ")).toBe("system");
  });

  it("preserves mixed case", () => {
    expect(sanitizeSystemId("MyBigSystem")).toBe("MyBigSystem");
  });

  it("strips non-ASCII chars (they are replaced then leading dashes stripped)", () => {
    // 'Ø' is treated as invalid — replaced with '-', then leading '-' stripped
    // Result: "rsted" not "-rsted". Engine behaviour; test documents the fact.
    expect(sanitizeSystemId("Ørsted")).toBe("rsted");
  });
});

// ---------------------------------------------------------------------------
// Integration CRUD — uses real portfolio.yaml; captured + restored around suite
// ---------------------------------------------------------------------------

const REPO_ROOT = findRepoRoot(process.cwd());
const PORTFOLIO_PATH = path.join(REPO_ROOT, "portfolio.yaml");
const TEST_PREFIX = "__test__";

let tmpDir: string;
let portfolioSnapshot: string;

beforeAll(async () => {
  // Capture current portfolio.yaml so we can restore it after the suite
  try {
    portfolioSnapshot = await fs.readFile(PORTFOLIO_PATH, "utf-8");
  } catch {
    portfolioSnapshot = "";
  }

  // Scratch space for test system YAML files — never touches the real systems/
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "risk-test-storage-"));
});

afterAll(async () => {
  // Restore portfolio.yaml
  if (portfolioSnapshot !== "") {
    await fs.writeFile(PORTFOLIO_PATH, portfolioSnapshot, "utf-8");
  }

  // Remove tmp files
  try {
    await fs.rm(tmpDir, { recursive: true, force: true });
  } catch {
    // best-effort
  }
});

/** Generate a unique test system id so parallel runs don't collide */
function testId(suffix: string): string {
  return `${TEST_PREFIX}${suffix}-${Date.now()}`;
}

describe("createSystem", () => {
  it("creates a new system with default facts shape", async () => {
    const id = testId("create");
    const yamlPath = path.join(tmpDir, `${id}.yaml`);

    const result = await createSystem(id, yamlPath);

    expect(result.id).toBe(id);
    expect(result.factsPath).toBe(yamlPath);
    expect(result.facts.scope).toBe("system");
    expect(result.facts.base).toBeDefined();

    // File must exist on disk
    const raw = await fs.readFile(yamlPath, "utf-8");
    expect(raw.length).toBeGreaterThan(0);
  });

  it("sanitizes the id before writing", async () => {
    const raw = testId("with spaces here");
    const safe = sanitizeSystemId(raw);
    const yamlPath = path.join(tmpDir, `${safe}.yaml`);

    const result = await createSystem(raw, yamlPath);
    expect(result.id).toBe(safe);
  });

  it("returns existing facts if the file already exists", async () => {
    const id = testId("idempotent");
    const yamlPath = path.join(tmpDir, `${id}.yaml`);

    const first = await createSystem(id, yamlPath);
    // Mutate facts via saveSystemFacts then call createSystem again
    await saveSystemFacts(first.id, {
      ...first.facts,
      description: "idempotency test",
    });

    const second = await createSystem(id, yamlPath);
    expect(second.facts.description).toBe("idempotency test");
  });

  it("registers the system in the portfolio", async () => {
    const id = testId("portfolio-reg");
    const yamlPath = path.join(tmpDir, `${id}.yaml`);

    await createSystem(id, yamlPath);
    const listed = await listSystems();
    expect(listed).toContain(id);
  });
});

describe("getSystemFacts", () => {
  it("returns null for a system not in portfolio", async () => {
    const result = await getSystemFacts("__definitely_not_a_real_system__");
    expect(result).toBeNull();
  });

  it("returns the saved facts for a known system", async () => {
    const id = testId("get-facts");
    const yamlPath = path.join(tmpDir, `${id}.yaml`);
    await createSystem(id, yamlPath);

    const result = await getSystemFacts(id);
    expect(result).not.toBeNull();
    expect(result!.id).toBe(id);
    expect(result!.factsPath).toBe(yamlPath);
    expect(result!.facts.scope).toBe("system");
  });
});

describe("saveSystemFacts", () => {
  it("persists fact changes to disk", async () => {
    const id = testId("save");
    const yamlPath = path.join(tmpDir, `${id}.yaml`);
    const created = await createSystem(id, yamlPath);

    const updated: Facts = {
      ...created.facts,
      description: "updated description",
      base: { uses_ai: true },
    };
    await saveSystemFacts(id, updated);

    const loaded = await getSystemFacts(id);
    expect(loaded!.facts.description).toBe("updated description");
    expect((loaded!.facts.base as Record<string, unknown>).uses_ai).toBe(true);
  });

  it("throws when the system is not in the portfolio", async () => {
    const facts: Facts = { scope: "system", base: {} };
    expect(saveSystemFacts("__ghost_system__", facts)).rejects.toThrow();
  });
});

describe("deleteSystem", () => {
  it("removes the YAML file and portfolio entry", async () => {
    const id = testId("delete");
    const yamlPath = path.join(tmpDir, `${id}.yaml`);
    await createSystem(id, yamlPath);

    const deleted = await deleteSystem(id);
    expect(deleted).toBe(true);

    // File gone
    await expect(fs.access(yamlPath)).rejects.toThrow();

    // No longer in portfolio
    const listed = await listSystems();
    expect(listed).not.toContain(id);
  });

  it("returns false for a system not in portfolio", async () => {
    const result = await deleteSystem("__no_such_system__");
    expect(result).toBe(false);
  });
});

describe("addExistingSystem", () => {
  it("registers a pre-existing YAML file in the portfolio", async () => {
    const id = testId("add-existing");
    const yamlPath = path.join(tmpDir, `${id}.yaml`);

    // Write a minimal valid system YAML manually
    const facts: Facts = { scope: "system", base: { uses_ai: false } };
    const { dumpYaml } = await import("@/lib/yaml");
    await fs.writeFile(yamlPath, dumpYaml(facts), "utf-8");

    const result = await addExistingSystem(yamlPath);
    expect(result.id).toBe(id);
    expect(result.facts.scope).toBe("system");

    const listed = await listSystems();
    expect(listed).toContain(id);
  });

  it("throws when the system is already in the portfolio", async () => {
    const id = testId("add-dup");
    const yamlPath = path.join(tmpDir, `${id}.yaml`);
    await createSystem(id, yamlPath);

    expect(addExistingSystem(yamlPath)).rejects.toThrow(/already in the portfolio/);
  });

  it("throws when the path points to a YAML list (not a valid system object)", async () => {
    const badPath = path.join(tmpDir, "not-a-valid-system.yaml");
    await fs.writeFile(badPath, "- just\n- a\n- list\n", "utf-8");

    await expect(addExistingSystem(badPath)).rejects.toThrow(/Invalid system file/);
  });
});

describe("removeFromPortfolio", () => {
  it("removes portfolio entry but leaves the file on disk", async () => {
    const id = testId("remove-from-portfolio");
    const yamlPath = path.join(tmpDir, `${id}.yaml`);
    await createSystem(id, yamlPath);

    const removed = await removeFromPortfolio(id);
    expect(removed).toBe(true);

    // File still exists — fs.access() resolves to null in Bun (not undefined)
    await expect(fs.access(yamlPath)).resolves.toBeNull();

    // Not in portfolio
    const listed = await listSystems();
    expect(listed).not.toContain(id);
  });

  it("returns false when the system is not in the portfolio", async () => {
    const result = await removeFromPortfolio("__ghost__");
    expect(result).toBe(false);
  });
});

describe("listSystems", () => {
  it("returns a sorted list", async () => {
    // Create two systems and verify list is sorted
    const idA = testId("list-b");
    const idB = testId("list-a");
    await createSystem(idA, path.join(tmpDir, `${idA}.yaml`));
    await createSystem(idB, path.join(tmpDir, `${idB}.yaml`));

    const listed = await listSystems();
    const testOnes = listed.filter((id) => id.startsWith(TEST_PREFIX));
    expect(testOnes).toEqual([...testOnes].sort());
  });
});
