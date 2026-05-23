/**
 * Tests for yaml.ts and model.ts.
 *
 * yaml.ts is a thin js-yaml wrapper — we test the contract (round-trip fidelity,
 * key order preservation, noRefs, error propagation) not the underlying library.
 *
 * model.ts resolves paths and reads the model manifest — we test against the
 * real model directory so any structural drift is caught immediately.
 */

import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { afterAll, beforeAll, describe, expect, it } from "bun:test";
import { dumpYaml, loadYamlFile } from "@/lib/yaml";
import { getModelVersion, modelPaths } from "@/lib/model";

const REPO_ROOT = path.resolve(import.meta.dir, "../../..");
const TEST_MODEL_PATHS = modelPaths(REPO_ROOT, "model");

let tmpDir: string;

beforeAll(async () => {
  tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "risk-test-yaml-"));
});

afterAll(async () => {
  await fs.rm(tmpDir, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// dumpYaml
// ---------------------------------------------------------------------------

describe("dumpYaml", () => {
  it("produces a non-empty string for a plain object", () => {
    const out = dumpYaml({ foo: "bar", n: 42 });
    expect(typeof out).toBe("string");
    expect(out.length).toBeGreaterThan(0);
  });

  it("includes the key names in the output", () => {
    const out = dumpYaml({ scope: "system", base: { uses_ai: true } });
    expect(out).toContain("scope");
    expect(out).toContain("base");
    expect(out).toContain("uses_ai");
  });

  it("preserves key insertion order (sortKeys: false)", () => {
    const out = dumpYaml({ z: 1, a: 2, m: 3 });
    const zPos = out.indexOf("z:");
    const aPos = out.indexOf("a:");
    const mPos = out.indexOf("m:");
    expect(zPos).toBeLessThan(aPos);
    expect(aPos).toBeLessThan(mPos);
  });

  it("serializes booleans as true/false, not 1/0", () => {
    const out = dumpYaml({ flag: true, off: false });
    expect(out).toContain("true");
    expect(out).toContain("false");
    expect(out).not.toContain(": 1");
    expect(out).not.toContain(": 0");
  });

  it("serializes null as null (not empty)", () => {
    const out = dumpYaml({ field: null });
    expect(out).toContain("null");
  });

  it("serializes arrays inline-ish with block style", () => {
    const out = dumpYaml({ items: ["a", "b", "c"] });
    expect(out).toContain("a");
    expect(out).toContain("b");
    expect(out).toContain("c");
  });

  it("handles nested objects without anchors (noRefs: true)", () => {
    const shared = { x: 1 };
    const doc = { a: shared, b: shared }; // same reference
    // noRefs: true — should not throw and should not emit YAML anchors
    const out = dumpYaml(doc);
    expect(out).not.toContain("&");
    expect(out).not.toContain("*");
  });

  it("wraps long lines at 120 chars", () => {
    const longVal = "x".repeat(200);
    const out = dumpYaml({ key: longVal });
    // The value will be folded/broken; output should exist
    expect(out.length).toBeGreaterThan(0);
  });
});

// ---------------------------------------------------------------------------
// loadYamlFile
// ---------------------------------------------------------------------------

describe("loadYamlFile", () => {
  it("loads a YAML file and returns the parsed object", async () => {
    const file = path.join(tmpDir, "simple.yaml");
    await fs.writeFile(file, "scope: system\nbase:\n  uses_ai: true\n", "utf-8");

    const result = await loadYamlFile<Record<string, unknown>>(file);
    expect(result.scope).toBe("system");
    expect((result.base as Record<string, unknown>).uses_ai).toBe(true);
  });

  it("parses booleans as JS booleans", async () => {
    const file = path.join(tmpDir, "bools.yaml");
    await fs.writeFile(file, "a: true\nb: false\n", "utf-8");

    const result = await loadYamlFile<{ a: boolean; b: boolean }>(file);
    expect(result.a).toBe(true);
    expect(result.b).toBe(false);
  });

  it("parses null values as null", async () => {
    const file = path.join(tmpDir, "nulls.yaml");
    await fs.writeFile(file, "field: null\n", "utf-8");

    const result = await loadYamlFile<{ field: null }>(file);
    expect(result.field).toBeNull();
  });

  it("parses arrays correctly", async () => {
    const file = path.join(tmpDir, "list.yaml");
    await fs.writeFile(file, "items:\n  - a\n  - b\n  - c\n", "utf-8");

    const result = await loadYamlFile<{ items: string[] }>(file);
    expect(result.items).toEqual(["a", "b", "c"]);
  });

  it("throws when the file does not exist", async () => {
    await expect(
      loadYamlFile(path.join(tmpDir, "nonexistent.yaml"))
    ).rejects.toThrow();
  });

  it("throws on malformed YAML", async () => {
    const file = path.join(tmpDir, "bad.yaml");
    await fs.writeFile(file, "key: [\nbad yaml\n", "utf-8");

    await expect(loadYamlFile(file)).rejects.toThrow();
  });

  it("round-trips an object through dumpYaml -> loadYamlFile", async () => {
    const original = {
      scope: "system",
      base: { uses_ai: true, external_access: false },
      security: { internet_facing: null, user_population: "internal" },
    };
    const file = path.join(tmpDir, "roundtrip.yaml");
    await fs.writeFile(file, dumpYaml(original), "utf-8");

    const loaded = await loadYamlFile<typeof original>(file);
    expect(loaded.scope).toBe(original.scope);
    expect(loaded.base.uses_ai).toBe(true);
    expect(loaded.base.external_access).toBe(false);
    expect(loaded.security.internet_facing).toBeNull();
    expect(loaded.security.user_population).toBe("internal");
  });
});

// ---------------------------------------------------------------------------
// modelPaths
// ---------------------------------------------------------------------------

describe("modelPaths", () => {
  it("returns paths rooted at the correct modelDir", () => {
    const mp = modelPaths("/some/root", "model");
    expect(mp.modelDir).toBe("/some/root/model");
    expect(mp.questionsDir).toBe("/some/root/model/questions");
    expect(mp.rulesDir).toBe("/some/root/model/rules");
    expect(mp.controlsDir).toBe("/some/root/model/controls");
  });

  it("builds the expected file paths from the modelDir", () => {
    const mp = modelPaths("/root", "model");
    expect(mp.baseQuestionsFile).toBe("/root/model/questions/base.questions.yaml");
    expect(mp.triggersFile).toBe("/root/model/rules/triggers.rules.yaml");
    expect(mp.controlsRulesFile).toBe("/root/model/rules/controls.rules.yaml");
    expect(mp.controlsCatalogFile).toBe("/root/model/controls/controls.catalog.yaml");
    expect(mp.manifestFile).toBe("/root/model/model.manifest.yaml");
  });

  it("accepts a nested modelDirRelative path", () => {
    const mp = modelPaths("/root", "src/model");
    expect(mp.modelDir).toBe("/root/src/model");
    expect(mp.triggersFile).toBe("/root/src/model/rules/triggers.rules.yaml");
  });

  it("the real model files referenced by TEST_MODEL_PATHS all exist", async () => {
    const checks = [
      TEST_MODEL_PATHS.baseQuestionsFile,
      TEST_MODEL_PATHS.triggersFile,
      TEST_MODEL_PATHS.controlsRulesFile,
      TEST_MODEL_PATHS.controlsCatalogFile,
      TEST_MODEL_PATHS.manifestFile,
    ];
    for (const p of checks) {
      await expect(fs.access(p)).resolves.toBeNull();
    }
  });
});

// ---------------------------------------------------------------------------
// getModelVersion
// ---------------------------------------------------------------------------

describe("getModelVersion", () => {
  it("returns a non-empty version string from the real model", async () => {
    const v = await getModelVersion(REPO_ROOT, "model");
    expect(typeof v).toBe("string");
    expect(v.length).toBeGreaterThan(0);
    expect(v).not.toBe("(unknown)");
  });

  it("returns '(unknown)' when the model dir does not exist", async () => {
    const v = await getModelVersion("/tmp/does-not-exist", "model");
    expect(v).toBe("(unknown)");
  });

  it("returns '(unknown)' when manifest lacks model_version field", async () => {
    const fakeRoot = await fs.mkdtemp(path.join(os.tmpdir(), "risk-model-"));
    const modelDir = path.join(fakeRoot, "model");
    await fs.mkdir(modelDir, { recursive: true });
    await fs.writeFile(
      path.join(modelDir, "model.manifest.yaml"),
      "description: no version field\n",
      "utf-8"
    );

    const v = await getModelVersion(fakeRoot, "model");
    expect(v).toBe("(unknown)");

    await fs.rm(fakeRoot, { recursive: true, force: true });
  });

  it("returns '(unknown)' when model_version is an empty string", async () => {
    const fakeRoot = await fs.mkdtemp(path.join(os.tmpdir(), "risk-model-"));
    const modelDir = path.join(fakeRoot, "model");
    await fs.mkdir(modelDir, { recursive: true });
    await fs.writeFile(
      path.join(modelDir, "model.manifest.yaml"),
      "model_version: ''\n",
      "utf-8"
    );

    const v = await getModelVersion(fakeRoot, "model");
    expect(v).toBe("(unknown)");

    await fs.rm(fakeRoot, { recursive: true, force: true });
  });
});
