export type SectionAccent = {
  bar: string;
  navActive: string;
  navIdle: string;
  headerWrap: string;
  headerChip: string;
  cardTop: string;
  cardBg: string;
};

export function domainTitle(domain: string): string {
  const map: Record<string, string> = {
    base: "System facts",
    security: "Security",
    data: "Data",
    ai: "AI",
    integration: "Integration",
    operations: "Operations",
    cost: "Cost",
    criticality: "Criticality",
    exceptions: "Exceptions",
  };
  return map[domain] ?? domain;
}

export function sectionAccent(key: string): SectionAccent {
  const byKey: Record<string, SectionAccent> = {
    overview: {
      bar: "bg-indigo-600 dark:bg-indigo-400",
      navActive:
        "border-indigo-300 bg-gradient-to-br from-indigo-100 to-purple-100 text-zinc-900 dark:border-indigo-700 dark:from-indigo-900/60 dark:to-purple-900/60 dark:text-zinc-50",
      navIdle:
        "border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-gradient-to-br hover:from-indigo-50 hover:to-purple-50 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:from-indigo-950/40 dark:hover:to-purple-950/40",
      headerWrap:
        "border-indigo-300 bg-gradient-to-br from-indigo-100 to-purple-100 dark:border-indigo-700 dark:from-indigo-900/50 dark:to-purple-900/50",
      headerChip:
        "border-indigo-400 bg-gradient-to-br from-indigo-200 to-purple-200 text-indigo-900 dark:border-indigo-600 dark:from-indigo-800/80 dark:to-purple-800/80 dark:text-indigo-100",
      cardTop: "border-t-indigo-500 dark:border-t-indigo-400",
      cardBg:
        "bg-gradient-to-br from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30",
    },
    base: {
      bar: "bg-slate-500/70 dark:bg-slate-300/60",
      navActive:
        "border-slate-200/70 bg-gradient-to-br from-slate-50/90 to-zinc-50/90 text-zinc-900 dark:border-slate-700/60 dark:from-slate-900/35 dark:to-zinc-900/35 dark:text-zinc-50",
      navIdle:
        "border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-gradient-to-br hover:from-slate-50/80 hover:to-zinc-50/80 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:from-slate-900/20 dark:hover:to-zinc-900/20",
      headerWrap:
        "border-slate-200/70 bg-gradient-to-br from-slate-50/60 to-zinc-50/60 dark:border-slate-800/70 dark:from-slate-900/20 dark:to-zinc-900/20",
      headerChip:
        "border-slate-200/80 bg-gradient-to-br from-slate-100 to-zinc-100 text-slate-900 dark:border-slate-800/70 dark:from-slate-950/30 dark:to-zinc-950/30 dark:text-slate-100",
      cardTop: "border-t-slate-300/80 dark:border-t-slate-700/70",
      cardBg:
        "bg-gradient-to-br from-slate-50/70 to-zinc-50/70 dark:from-slate-900/25 dark:to-zinc-900/25",
    },
    ai: {
      bar: "bg-violet-600 dark:bg-violet-400",
      navActive:
        "border-violet-300 bg-gradient-to-br from-violet-100 to-purple-100 text-zinc-900 dark:border-violet-700 dark:from-violet-900/60 dark:to-purple-900/60 dark:text-zinc-50",
      navIdle:
        "border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-gradient-to-br hover:from-violet-50 hover:to-purple-50 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:from-violet-950/40 dark:hover:to-purple-950/40",
      headerWrap:
        "border-violet-300 bg-gradient-to-br from-violet-100 to-purple-100 dark:border-violet-700 dark:from-violet-900/50 dark:to-purple-900/50",
      headerChip:
        "border-violet-400 bg-gradient-to-br from-violet-200 to-purple-200 text-violet-900 dark:border-violet-600 dark:from-violet-800/80 dark:to-purple-800/80 dark:text-violet-100",
      cardTop: "border-t-violet-500 dark:border-t-violet-400",
      cardBg:
        "bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30",
    },
    criticality: {
      bar: "bg-amber-600 dark:bg-amber-400",
      navActive:
        "border-amber-300 bg-gradient-to-br from-amber-100 to-orange-100 text-zinc-900 dark:border-amber-700 dark:from-amber-900/60 dark:to-orange-900/60 dark:text-zinc-50",
      navIdle:
        "border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-gradient-to-br hover:from-amber-50 hover:to-orange-50 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:from-amber-950/40 dark:hover:to-orange-950/40",
      headerWrap:
        "border-amber-300 bg-gradient-to-br from-amber-100 to-orange-100 dark:border-amber-700 dark:from-amber-900/50 dark:to-orange-900/50",
      headerChip:
        "border-amber-400 bg-gradient-to-br from-amber-200 to-orange-200 text-amber-900 dark:border-amber-600 dark:from-amber-800/80 dark:to-orange-800/80 dark:text-amber-100",
      cardTop: "border-t-amber-500 dark:border-t-amber-400",
      cardBg:
        "bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-950/30 dark:to-orange-950/30",
    },
    data: {
      bar: "bg-cyan-600 dark:bg-cyan-400",
      navActive:
        "border-cyan-300 bg-gradient-to-br from-cyan-100 to-blue-100 text-zinc-900 dark:border-cyan-700 dark:from-cyan-900/60 dark:to-blue-900/60 dark:text-zinc-50",
      navIdle:
        "border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-gradient-to-br hover:from-cyan-50 hover:to-blue-50 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:from-cyan-950/40 dark:hover:to-blue-950/40",
      headerWrap:
        "border-cyan-300 bg-gradient-to-br from-cyan-100 to-blue-100 dark:border-cyan-700 dark:from-cyan-900/50 dark:to-blue-900/50",
      headerChip:
        "border-cyan-400 bg-gradient-to-br from-cyan-200 to-blue-200 text-cyan-900 dark:border-cyan-600 dark:from-cyan-800/80 dark:to-blue-800/80 dark:text-cyan-100",
      cardTop: "border-t-cyan-500 dark:border-t-cyan-400",
      cardBg: "bg-gradient-to-br from-cyan-50 to-blue-50 dark:from-cyan-950/30 dark:to-blue-950/30",
    },
    integration: {
      bar: "bg-sky-600 dark:bg-sky-400",
      navActive:
        "border-sky-300 bg-gradient-to-br from-sky-100 to-blue-100 text-zinc-900 dark:border-sky-700 dark:from-sky-900/60 dark:to-blue-900/60 dark:text-zinc-50",
      navIdle:
        "border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-gradient-to-br hover:from-sky-50 hover:to-blue-50 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:from-sky-950/40 dark:hover:to-blue-950/40",
      headerWrap:
        "border-sky-300 bg-gradient-to-br from-sky-100 to-blue-100 dark:border-sky-700 dark:from-sky-900/50 dark:to-blue-900/50",
      headerChip:
        "border-sky-400 bg-gradient-to-br from-sky-200 to-blue-200 text-sky-900 dark:border-sky-600 dark:from-sky-800/80 dark:to-blue-800/80 dark:text-sky-100",
      cardTop: "border-t-sky-500 dark:border-t-sky-400",
      cardBg: "bg-gradient-to-br from-sky-50 to-blue-50 dark:from-sky-950/30 dark:to-blue-950/30",
    },
    operations: {
      bar: "bg-teal-600 dark:bg-teal-400",
      navActive:
        "border-teal-300 bg-gradient-to-br from-teal-100 to-cyan-100 text-zinc-900 dark:border-teal-700 dark:from-teal-900/60 dark:to-cyan-900/60 dark:text-zinc-50",
      navIdle:
        "border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-gradient-to-br hover:from-teal-50 hover:to-cyan-50 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:from-teal-950/40 dark:hover:to-cyan-950/40",
      headerWrap:
        "border-teal-300 bg-gradient-to-br from-teal-100 to-cyan-100 dark:border-teal-700 dark:from-teal-900/50 dark:to-cyan-900/50",
      headerChip:
        "border-teal-400 bg-gradient-to-br from-teal-200 to-cyan-200 text-teal-900 dark:border-teal-600 dark:from-teal-800/80 dark:to-cyan-800/80 dark:text-teal-100",
      cardTop: "border-t-teal-500 dark:border-t-teal-400",
      cardBg: "bg-gradient-to-br from-teal-50 to-cyan-50 dark:from-teal-950/30 dark:to-cyan-950/30",
    },
    security: {
      bar: "bg-rose-600 dark:bg-rose-400",
      navActive:
        "border-rose-300 bg-gradient-to-br from-rose-100 to-pink-100 text-zinc-900 dark:border-rose-700 dark:from-rose-900/60 dark:to-pink-900/60 dark:text-zinc-50",
      navIdle:
        "border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-gradient-to-br hover:from-rose-50 hover:to-pink-50 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:from-rose-950/40 dark:hover:to-pink-950/40",
      headerWrap:
        "border-rose-300 bg-gradient-to-br from-rose-100 to-pink-100 dark:border-rose-700 dark:from-rose-900/50 dark:to-pink-900/50",
      headerChip:
        "border-rose-400 bg-gradient-to-br from-rose-200 to-pink-200 text-rose-900 dark:border-rose-600 dark:from-rose-800/80 dark:to-pink-800/80 dark:text-rose-100",
      cardTop: "border-t-rose-500 dark:border-t-rose-400",
      cardBg: "bg-gradient-to-br from-rose-50 to-pink-50 dark:from-rose-950/30 dark:to-pink-950/30",
    },
    cost: {
      bar: "bg-lime-600 dark:bg-lime-400",
      navActive:
        "border-lime-300 bg-gradient-to-br from-lime-100 to-green-100 text-zinc-900 dark:border-lime-700 dark:from-lime-900/60 dark:to-green-900/60 dark:text-zinc-50",
      navIdle:
        "border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-gradient-to-br hover:from-lime-50 hover:to-green-50 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:from-lime-950/40 dark:hover:to-green-950/40",
      headerWrap:
        "border-lime-300 bg-gradient-to-br from-lime-100 to-green-100 dark:border-lime-700 dark:from-lime-900/50 dark:to-green-900/50",
      headerChip:
        "border-lime-400 bg-gradient-to-br from-lime-200 to-green-200 text-lime-900 dark:border-lime-600 dark:from-lime-800/80 dark:to-green-800/80 dark:text-lime-100",
      cardTop: "border-t-lime-500 dark:border-t-lime-400",
      cardBg:
        "bg-gradient-to-br from-lime-50 to-green-50 dark:from-lime-950/30 dark:to-green-950/30",
    },
    results: {
      bar: "bg-emerald-600 dark:bg-emerald-400",
      navActive:
        "border-emerald-300 bg-gradient-to-br from-emerald-100 to-teal-100 text-zinc-900 dark:border-emerald-700 dark:from-emerald-900/60 dark:to-teal-900/60 dark:text-zinc-50",
      navIdle:
        "border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-gradient-to-br hover:from-emerald-50 hover:to-teal-50 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:from-emerald-950/40 dark:hover:to-teal-950/40",
      headerWrap:
        "border-emerald-300 bg-gradient-to-br from-emerald-100 to-teal-100 dark:border-emerald-700 dark:from-emerald-900/50 dark:to-teal-900/50",
      headerChip:
        "border-emerald-400 bg-gradient-to-br from-emerald-200 to-teal-200 text-emerald-900 dark:border-emerald-600 dark:from-emerald-800/80 dark:to-teal-800/80 dark:text-emerald-100",
      cardTop: "border-t-emerald-500 dark:border-t-emerald-400",
      cardBg:
        "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
    },
    diff: {
      bar: "bg-fuchsia-600 dark:bg-fuchsia-400",
      navActive:
        "border-fuchsia-300 bg-gradient-to-br from-fuchsia-100 to-pink-100 text-zinc-900 dark:border-fuchsia-700 dark:from-fuchsia-900/60 dark:to-pink-900/60 dark:text-zinc-50",
      navIdle:
        "border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-gradient-to-br hover:from-fuchsia-50 hover:to-pink-50 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:from-fuchsia-950/40 dark:hover:to-pink-950/40",
      headerWrap:
        "border-fuchsia-300 bg-gradient-to-br from-fuchsia-100 to-pink-100 dark:border-fuchsia-700 dark:from-fuchsia-900/50 dark:to-pink-900/50",
      headerChip:
        "border-fuchsia-400 bg-gradient-to-br from-fuchsia-200 to-pink-200 text-fuchsia-900 dark:border-fuchsia-600 dark:from-fuchsia-800/80 dark:to-pink-800/80 dark:text-fuchsia-100",
      cardTop: "border-t-fuchsia-500 dark:border-t-fuchsia-400",
      cardBg:
        "bg-gradient-to-br from-fuchsia-50 to-pink-50 dark:from-fuchsia-950/30 dark:to-pink-950/30",
    },
  };

  return byKey[key] ?? byKey.base;
}
