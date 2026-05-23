/**
 * Pure, client-safe fact utilities.
 * No fs/yaml imports — safe to use in both client and server contexts.
 */

export type Facts = Record<string, unknown>;

export function deepGet(obj: unknown, dotted: string): unknown {
  let cur: unknown = obj;
  for (const part of dotted.split(".")) {
    if (!cur || typeof cur !== "object") return null;
    const rec = cur as Record<string, unknown>;
    if (!(part in rec)) return null;
    cur = rec[part];
  }
  return cur;
}

export function matchesCondition(facts: Facts, cond: Record<string, unknown>): boolean {
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
