import type { ReactElement } from "react";

function fmtValue(v: unknown): string {
  if (v === null) return "null";
  if (v === undefined) return "unset";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (Array.isArray(v)) return `[${v.map((x) => fmtValue(x)).join(", ")}]`;
  try {
    return JSON.stringify(v);
  } catch {
    return String(v);
  }
}

export function ConditionLines({ because }: { because: Record<string, unknown> }): ReactElement {
  const entries = Object.entries(because);
  if (entries.length === 0) return <div className="text-xs text-zinc-500 dark:text-zinc-400">(no details)</div>;
  return (
    <ul className="mt-1 flex flex-col gap-1 text-xs text-zinc-600 dark:text-zinc-300">
      {entries.map(([k, v]) => (
        <li key={k} className="flex items-start gap-2">
          <span className="shrink-0 rounded-md border border-zinc-200/70 bg-white/70 px-2 py-0.5 font-mono text-[11px] text-zinc-700 dark:border-zinc-800/80 dark:bg-zinc-950/40 dark:text-zinc-200">
            {k}
          </span>
          <span className="font-mono text-[11px] text-zinc-600 dark:text-zinc-300">{fmtValue(v)}</span>
        </li>
      ))}
    </ul>
  );
}
