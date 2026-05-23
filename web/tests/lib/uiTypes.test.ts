/**
 * Tests for uiTypes.ts — parseQuestions and parseTriggers.
 *
 * Both functions are pure and defensive: they accept unknown[] and silently
 * drop malformed entries. Tests cover the happy path, every skip condition,
 * and edge cases around optional fields.
 */

import { describe, expect, it } from "bun:test";
import { parseQuestions, parseTriggers } from "@/lib/uiTypes";

// ---------------------------------------------------------------------------
// parseQuestions
// ---------------------------------------------------------------------------

describe("parseQuestions", () => {
  it("parses a minimal valid bool question", () => {
    const result = parseQuestions([{ id: "uses_ai", text: "Uses AI?", type: "bool" }]);
    expect(result).toHaveLength(1);
    expect(result[0]!.id).toBe("uses_ai");
    expect(result[0]!.text).toBe("Uses AI?");
    expect(result[0]!.type).toBe("bool");
  });

  it("parses a valid enum question with allowed values", () => {
    const result = parseQuestions([
      { id: "user_population", text: "Who?", type: "enum", allowed: ["internal", "partners", "public"] },
    ]);
    expect(result[0]!.allowed).toEqual(["internal", "partners", "public"]);
  });

  it("parses a valid set question", () => {
    const result = parseQuestions([{ id: "signals", text: "Signals?", type: "set", allowed: ["logs", "traces"] }]);
    expect(result[0]!.type).toBe("set");
  });

  it("includes description when present and non-empty", () => {
    const result = parseQuestions([{ id: "x", text: "X?", type: "bool", description: "  some detail  " }]);
    expect(result[0]!.description).toBe("some detail");
  });

  it("omits description when it is an empty string", () => {
    const result = parseQuestions([{ id: "x", text: "X?", type: "bool", description: "" }]);
    expect(result[0]!.description).toBeUndefined();
  });

  it("omits description when it is whitespace only", () => {
    const result = parseQuestions([{ id: "x", text: "X?", type: "bool", description: "   " }]);
    expect(result[0]!.description).toBeUndefined();
  });

  it("omits description when the field is absent", () => {
    const result = parseQuestions([{ id: "x", text: "X?", type: "bool" }]);
    expect(result[0]!.description).toBeUndefined();
  });

  it("omits allowed when the field is absent", () => {
    const result = parseQuestions([{ id: "x", text: "X?", type: "bool" }]);
    expect(result[0]!.allowed).toBeUndefined();
  });

  it("filters non-string values out of allowed array", () => {
    const result = parseQuestions([{ id: "x", text: "X?", type: "enum", allowed: ["a", 42, null, "b"] }]);
    expect(result[0]!.allowed).toEqual(["a", "b"]);
  });

  it("skips entries that are not objects", () => {
    const result = parseQuestions(["string", 42, null, undefined] as unknown[]);
    expect(result).toHaveLength(0);
  });

  it("skips entries missing id", () => {
    const result = parseQuestions([{ text: "X?", type: "bool" }]);
    expect(result).toHaveLength(0);
  });

  it("skips entries missing text", () => {
    const result = parseQuestions([{ id: "x", type: "bool" }]);
    expect(result).toHaveLength(0);
  });

  it("skips entries with non-string id", () => {
    const result = parseQuestions([{ id: 99, text: "X?", type: "bool" }]);
    expect(result).toHaveLength(0);
  });

  it("skips entries with invalid type", () => {
    const result = parseQuestions([{ id: "x", text: "X?", type: "radio" }]);
    expect(result).toHaveLength(0);
  });

  it("processes multiple valid entries, skipping invalid ones", () => {
    const result = parseQuestions([
      { id: "a", text: "A?", type: "bool" },
      { id: "b" }, // missing text and type — skip
      { id: "c", text: "C?", type: "enum", allowed: ["x", "y"] },
    ]);
    expect(result).toHaveLength(2);
    expect(result[0]!.id).toBe("a");
    expect(result[1]!.id).toBe("c");
  });

  it("returns empty array for empty input", () => {
    expect(parseQuestions([])).toEqual([]);
  });
});

// ---------------------------------------------------------------------------
// parseTriggers
// ---------------------------------------------------------------------------

describe("parseTriggers", () => {
  it("parses a minimal valid trigger", () => {
    const result = parseTriggers([{ when: { uses_ai: true }, activate: ["ai"] }]);
    expect(result).toHaveLength(1);
    expect(result[0]!.when).toEqual({ uses_ai: true });
    expect(result[0]!.activate).toEqual(["ai"]);
  });

  it("preserves multi-condition when clause", () => {
    const result = parseTriggers([
      { when: { handles_sensitive_data: true, external_access: true }, activate: ["security", "data"] },
    ]);
    expect(result[0]!.when).toEqual({ handles_sensitive_data: true, external_access: true });
    expect(result[0]!.activate).toEqual(["security", "data"]);
  });

  it("filters non-string values from activate array", () => {
    const result = parseTriggers([{ when: { x: true }, activate: ["ai", 99, null, "cost"] }]);
    expect(result[0]!.activate).toEqual(["ai", "cost"]);
  });

  it("skips entries that are not objects", () => {
    const result = parseTriggers(["string", 42, null] as unknown[]);
    expect(result).toHaveLength(0);
  });

  it("skips entries missing when", () => {
    const result = parseTriggers([{ activate: ["ai"] }]);
    expect(result).toHaveLength(0);
  });

  it("skips entries where when is not an object", () => {
    const result = parseTriggers([{ when: "uses_ai", activate: ["ai"] }]);
    expect(result).toHaveLength(0);
  });

  it("skips entries where when is null", () => {
    const result = parseTriggers([{ when: null, activate: ["ai"] }]);
    expect(result).toHaveLength(0);
  });

  it("skips entries where activate is not an array", () => {
    const result = parseTriggers([{ when: { x: true }, activate: "ai" }]);
    expect(result).toHaveLength(0);
  });

  it("skips entries missing activate", () => {
    const result = parseTriggers([{ when: { x: true } }]);
    expect(result).toHaveLength(0);
  });

  it("processes multiple valid entries, skipping invalid ones", () => {
    const result = parseTriggers([
      { when: { uses_ai: true }, activate: ["ai"] },
      { activate: ["data"] }, // missing when — skip
      { when: { affects_production: true }, activate: ["operations"] },
    ]);
    expect(result).toHaveLength(2);
    expect(result[0]!.activate).toEqual(["ai"]);
    expect(result[1]!.activate).toEqual(["operations"]);
  });

  it("returns empty array for empty input", () => {
    expect(parseTriggers([])).toEqual([]);
  });

  it("parses the real triggers.rules.yaml without dropping any entries", async () => {
    // Integration check: real model data flows through parseTriggers intact
    const { loadYamlFile } = await import("@/lib/yaml");
    const path = await import("node:path");
    const REPO_ROOT = path.resolve(import.meta.dir, "../../..");
    const raw = await loadYamlFile<{ triggers: unknown[] }>(path.join(REPO_ROOT, "model/rules/triggers.rules.yaml"));
    const triggers = parseTriggers(raw.triggers);
    expect(triggers.length).toBe(raw.triggers.length);
    expect(triggers.every((t) => Array.isArray(t.activate) && t.activate.length > 0)).toBe(true);
  });
});
