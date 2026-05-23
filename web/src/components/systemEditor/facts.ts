import type { Facts } from "@/lib/facts";

export type { Facts } from "@/lib/facts";
export { deepGet } from "@/lib/facts";

export function deepSet(obj: unknown, dotted: string, value: unknown): Facts {
  const parts = dotted.split(".");
  const out: Facts = { ...(obj && typeof obj === "object" ? (obj as Facts) : {}) };
  let cur: Record<string, unknown> = out;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i]!;
    const next = cur[p];
    const nextObj = typeof next === "object" && next !== null ? { ...(next as Record<string, unknown>) } : {};
    cur[p] = nextObj;
    cur = nextObj;
  }
  cur[parts[parts.length - 1]!] = value;
  return out;
}

export function deepDelete(obj: unknown, dotted: string): Facts {
  const parts = dotted.split(".");
  const out: Facts = { ...(obj && typeof obj === "object" ? (obj as Facts) : {}) };
  let cur: Record<string, unknown> = out;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i]!;
    const next = cur[p];
    if (typeof next !== "object" || next === null) {
      return out;
    }
    const nextObj = { ...(next as Record<string, unknown>) };
    cur[p] = nextObj;
    cur = nextObj;
  }
  delete cur[parts[parts.length - 1]!];
  return out;
}
