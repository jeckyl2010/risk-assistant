/**
 * Tests for uiTypes.ts — parseQuestions and parseTriggers.
 *
 * Both functions are pure and defensive: they accept unknown[] and silently
 * drop malformed entries. Tests cover the happy path, every skip condition,
 * and edge cases around optional fields.
 */

import { describe, expect, it } from "bun:test";
import { parseQuestions, parseTriggers, type Question, type TriggerRule } from "@/lib/uiTypes";

function expectSingleQuestion(result: Question[]): Question {
  expect(result).toHaveLength(1);
  const [question] = result;
  if (!question) {
    throw new Error("Expected one parsed question");
  }
  return question;
}

function expectSingleTrigger(result: TriggerRule[]): TriggerRule {
  expect(result).toHaveLength(1);
  const [trigger] = result;
  if (!trigger) {
    throw new Error("Expected one parsed trigger");
  }
  return trigger;
}

// ---------------------------------------------------------------------------
// parseQuestions
// ---------------------------------------------------------------------------

describe("parseQuestions", () => {
  it("parses a minimal valid bool question", () => {
    const question = expectSingleQuestion(parseQuestions([{ id: "uses_ai", text: "Uses AI?", type: "bool" }]));
    expect(question.id).toBe("uses_ai");
    expect(question.text).toBe("Uses AI?");
    expect(question.type).toBe("bool");
  });

  it("parses a valid enum question with allowed values", () => {
    const question = expectSingleQuestion(
      parseQuestions([{ id: "user_population", text: "Who?", type: "enum", allowed: ["internal", "partners", "public"] }]),
    );
    expect(question.allowed).toEqual(["internal", "partners", "public"]);
  });

  it("parses a valid set question", () => {
    const question = expectSingleQuestion(
      parseQuestions([{ id: "signals", text: "Signals?", type: "set", allowed: ["logs", "traces"] }]),
    );
    expect(question.type).toBe("set");
  });

  it("includes description when present and non-empty", () => {
    const question = expectSingleQuestion(
      parseQuestions([{ id: "x", text: "X?", type: "bool", description: "  some detail  " }]),
    );
    expect(question.description).toBe("some detail");
  });

  it("omits description when it is an empty string", () => {
    const question = expectSingleQuestion(parseQuestions([{ id: "x", text: "X?", type: "bool", description: "" }]));
    expect(question.description).toBeUndefined();
  });

  it("omits description when it is whitespace only", () => {
    const question = expectSingleQuestion(parseQuestions([{ id: "x", text: "X?", type: "bool", description: "   " }]));
    expect(question.description).toBeUndefined();
  });

  it("omits description when the field is absent", () => {
    const question = expectSingleQuestion(parseQuestions([{ id: "x", text: "X?", type: "bool" }]));
    expect(question.description).toBeUndefined();
  });

  it("omits allowed when the field is absent", () => {
    const question = expectSingleQuestion(parseQuestions([{ id: "x", text: "X?", type: "bool" }]));
    expect(question.allowed).toBeUndefined();
  });

  it("filters non-string values out of allowed array", () => {
    const question = expectSingleQuestion(
      parseQuestions([{ id: "x", text: "X?", type: "enum", allowed: ["a", 42, null, "b"] }]),
    );
    expect(question.allowed).toEqual(["a", "b"]);
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
    const [first, second] = result;
    if (!first || !second) {
      throw new Error("Expected two parsed questions");
    }
    expect(first.id).toBe("a");
    expect(second.id).toBe("c");
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
    const trigger = expectSingleTrigger(parseTriggers([{ when: { uses_ai: true }, activate: ["ai"] }]));
    expect(trigger.when).toEqual({ uses_ai: true });
    expect(trigger.activate).toEqual(["ai"]);
  });

  it("preserves multi-condition when clause", () => {
    const trigger = expectSingleTrigger(
      parseTriggers([{ when: { handles_sensitive_data: true, external_access: true }, activate: ["security", "data"] }]),
    );
    expect(trigger.when).toEqual({ handles_sensitive_data: true, external_access: true });
    expect(trigger.activate).toEqual(["security", "data"]);
  });

  it("filters non-string values from activate array", () => {
    const trigger = expectSingleTrigger(parseTriggers([{ when: { x: true }, activate: ["ai", 99, null, "cost"] }]));
    expect(trigger.activate).toEqual(["ai", "cost"]);
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
    const [first, second] = result;
    if (!first || !second) {
      throw new Error("Expected two parsed triggers");
    }
    expect(first.activate).toEqual(["ai"]);
    expect(second.activate).toEqual(["operations"]);
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
