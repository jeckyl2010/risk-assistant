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

export function deepSet(obj: unknown, dotted: string, value: unknown): Facts {
  const parts = dotted.split(".");
  const out: Facts = { ...(obj && typeof obj === "object" ? (obj as Facts) : {}) };
  let cur: Record<string, unknown> = out;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    const next = cur[p];
    const nextObj = typeof next === "object" && next !== null ? { ...(next as Record<string, unknown>) } : {};
    cur[p] = nextObj;
    cur = nextObj;
  }
  cur[parts[parts.length - 1]] = value;
  return out;
}

export function deepDelete(obj: unknown, dotted: string): Facts {
  const parts = dotted.split(".");
  const out: Facts = { ...(obj && typeof obj === "object" ? (obj as Facts) : {}) };
  let cur: Record<string, unknown> = out;
  for (let i = 0; i < parts.length - 1; i++) {
    const p = parts[i];
    const next = cur[p];
    if (typeof next !== "object" || next === null) {
      return out;
    }
    const nextObj = { ...(next as Record<string, unknown>) };
    cur[p] = nextObj;
    cur = nextObj;
  }
  delete cur[parts[parts.length - 1]];
  return out;
}
