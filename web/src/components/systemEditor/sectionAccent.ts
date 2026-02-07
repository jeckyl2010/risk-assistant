export type SectionAccent = {
  bar: string
  navActive: string
  navIdle: string
  headerWrap: string
  headerChip: string
  cardTop: string
  cardBg: string
}

export function domainTitle(domain: string): string {
  const map: Record<string, string> = {
    base: 'System facts',
    security: 'Security',
    data: 'Data',
    ai: 'AI',
    integration: 'Integration',
    operations: 'Operations',
    cost: 'Cost',
    criticality: 'Criticality',
    exceptions: 'Exceptions',
  }
  return map[domain] ?? domain
}

export function sectionAccent(key: string): SectionAccent {
  const byKey: Record<string, SectionAccent> = {
    overview: {
      bar: 'bg-indigo-500/80 dark:bg-indigo-300/80',
      navActive:
        'border-indigo-200/70 bg-gradient-to-br from-indigo-50/70 to-purple-50/70 text-zinc-900 dark:border-indigo-900/50 dark:from-indigo-950/15 dark:to-purple-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-gradient-to-br hover:from-indigo-50/40 hover:to-purple-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:from-indigo-950/15 dark:hover:to-purple-950/15',
      headerWrap: 'border-indigo-200/70 bg-gradient-to-br from-indigo-50/60 to-purple-50/60 dark:border-indigo-900/50 dark:from-indigo-950/15 dark:to-purple-950/15',
      headerChip:
        'border-indigo-200/80 bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-900 dark:border-indigo-900/50 dark:from-indigo-950/30 dark:to-purple-950/30 dark:text-indigo-100',
      cardTop: 'border-t-indigo-400/80 dark:border-t-indigo-400/70',
      cardBg: 'bg-gradient-to-br from-indigo-50/25 to-purple-50/25 dark:from-indigo-950/10 dark:to-purple-950/10',
    },
    base: {
      bar: 'bg-slate-500/70 dark:bg-slate-300/60',
      navActive:
        'border-slate-200/70 bg-gradient-to-br from-slate-50/90 to-zinc-50/90 text-zinc-900 dark:border-slate-700/60 dark:from-slate-900/35 dark:to-zinc-900/35 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-gradient-to-br hover:from-slate-50/80 hover:to-zinc-50/80 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:from-slate-900/20 dark:hover:to-zinc-900/20',
      headerWrap: 'border-slate-200/70 bg-gradient-to-br from-slate-50/60 to-zinc-50/60 dark:border-slate-800/70 dark:from-slate-900/20 dark:to-zinc-900/20',
      headerChip:
        'border-slate-200/80 bg-gradient-to-br from-slate-100 to-zinc-100 text-slate-900 dark:border-slate-800/70 dark:from-slate-950/30 dark:to-zinc-950/30 dark:text-slate-100',
      cardTop: 'border-t-slate-300/80 dark:border-t-slate-700/70',
      cardBg: 'bg-gradient-to-br from-slate-50/70 to-zinc-50/70 dark:from-slate-900/25 dark:to-zinc-900/25',
    },
    ai: {
      bar: 'bg-violet-500/80 dark:bg-violet-300/80',
      navActive:
        'border-violet-200/70 bg-gradient-to-br from-violet-50/70 to-purple-50/70 text-zinc-900 dark:border-violet-900/50 dark:from-violet-950/15 dark:to-purple-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-gradient-to-br hover:from-violet-50/40 hover:to-purple-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:from-violet-950/15 dark:hover:to-purple-950/15',
      headerWrap: 'border-violet-200/70 bg-gradient-to-br from-violet-50/60 to-purple-50/60 dark:border-violet-900/50 dark:from-violet-950/15 dark:to-purple-950/15',
      headerChip:
        'border-violet-200/80 bg-gradient-to-br from-violet-100 to-purple-100 text-violet-900 dark:border-violet-900/50 dark:from-violet-950/30 dark:to-purple-950/30 dark:text-violet-100',
      cardTop: 'border-t-violet-400/80 dark:border-t-violet-400/70',
      cardBg: 'bg-gradient-to-br from-violet-50/22 to-purple-50/22 dark:from-violet-950/10 dark:to-purple-950/10',
    },
    criticality: {
      bar: 'bg-amber-500/80 dark:bg-amber-300/80',
      navActive:
        'border-amber-200/70 bg-gradient-to-br from-amber-50/70 to-orange-50/70 text-zinc-900 dark:border-amber-900/50 dark:from-amber-950/15 dark:to-orange-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-gradient-to-br hover:from-amber-50/40 hover:to-orange-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:from-amber-950/15 dark:hover:to-orange-950/15',
      headerWrap: 'border-amber-200/70 bg-gradient-to-br from-amber-50/60 to-orange-50/60 dark:border-amber-900/50 dark:from-amber-950/15 dark:to-orange-950/15',
      headerChip:
        'border-amber-200/80 bg-gradient-to-br from-amber-100 to-orange-100 text-amber-900 dark:border-amber-900/50 dark:from-amber-950/30 dark:to-orange-950/30 dark:text-amber-100',
      cardTop: 'border-t-amber-400/80 dark:border-t-amber-400/70',
      cardBg: 'bg-gradient-to-br from-amber-50/22 to-orange-50/22 dark:from-amber-950/10 dark:to-orange-950/10',
    },
    data: {
      bar: 'bg-cyan-500/80 dark:bg-cyan-300/80',
      navActive:
        'border-cyan-200/70 bg-gradient-to-br from-cyan-50/70 to-blue-50/70 text-zinc-900 dark:border-cyan-900/50 dark:from-cyan-950/15 dark:to-blue-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-gradient-to-br hover:from-cyan-50/40 hover:to-blue-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:from-cyan-950/15 dark:hover:to-blue-950/15',
      headerWrap: 'border-cyan-200/70 bg-gradient-to-br from-cyan-50/60 to-blue-50/60 dark:border-cyan-900/50 dark:from-cyan-950/15 dark:to-blue-950/15',
      headerChip:
        'border-cyan-200/80 bg-gradient-to-br from-cyan-100 to-blue-100 text-cyan-900 dark:border-cyan-900/50 dark:from-cyan-950/30 dark:to-blue-950/30 dark:text-cyan-100',
      cardTop: 'border-t-cyan-400/80 dark:border-t-cyan-400/70',
      cardBg: 'bg-gradient-to-br from-cyan-50/22 to-blue-50/22 dark:from-cyan-950/10 dark:to-blue-950/10',
    },
    integration: {
      bar: 'bg-sky-500/80 dark:bg-sky-300/80',
      navActive:
        'border-sky-200/70 bg-gradient-to-br from-sky-50/70 to-blue-50/70 text-zinc-900 dark:border-sky-900/50 dark:from-sky-950/15 dark:to-blue-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-gradient-to-br hover:from-sky-50/40 hover:to-blue-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:from-sky-950/15 dark:hover:to-blue-950/15',
      headerWrap: 'border-sky-200/70 bg-gradient-to-br from-sky-50/60 to-blue-50/60 dark:border-sky-900/50 dark:from-sky-950/15 dark:to-blue-950/15',
      headerChip:
        'border-sky-200/80 bg-gradient-to-br from-sky-100 to-blue-100 text-sky-900 dark:border-sky-900/50 dark:from-sky-950/30 dark:to-blue-950/30 dark:text-sky-100',
      cardTop: 'border-t-sky-400/80 dark:border-t-sky-400/70',
      cardBg: 'bg-gradient-to-br from-sky-50/22 to-blue-50/22 dark:from-sky-950/10 dark:to-blue-950/10',
    },
    operations: {
      bar: 'bg-teal-500/80 dark:bg-teal-300/80',
      navActive:
        'border-teal-200/70 bg-gradient-to-br from-teal-50/70 to-cyan-50/70 text-zinc-900 dark:border-teal-900/50 dark:from-teal-950/15 dark:to-cyan-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-gradient-to-br hover:from-teal-50/40 hover:to-cyan-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:from-teal-950/15 dark:hover:to-cyan-950/15',
      headerWrap: 'border-teal-200/70 bg-gradient-to-br from-teal-50/60 to-cyan-50/60 dark:border-teal-900/50 dark:from-teal-950/15 dark:to-cyan-950/15',
      headerChip:
        'border-teal-200/80 bg-gradient-to-br from-teal-100 to-cyan-100 text-teal-900 dark:border-teal-900/50 dark:from-teal-950/30 dark:to-cyan-950/30 dark:text-teal-100',
      cardTop: 'border-t-teal-400/80 dark:border-t-teal-400/70',
      cardBg: 'bg-gradient-to-br from-teal-50/22 to-cyan-50/22 dark:from-teal-950/10 dark:to-cyan-950/10',
    },
    security: {
      bar: 'bg-rose-500/80 dark:bg-rose-300/80',
      navActive:
        'border-rose-200/70 bg-gradient-to-br from-rose-50/70 to-pink-50/70 text-zinc-900 dark:border-rose-900/50 dark:from-rose-950/15 dark:to-pink-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-gradient-to-br hover:from-rose-50/40 hover:to-pink-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:from-rose-950/15 dark:hover:to-pink-950/15',
      headerWrap: 'border-rose-200/70 bg-gradient-to-br from-rose-50/60 to-pink-50/60 dark:border-rose-900/50 dark:from-rose-950/15 dark:to-pink-950/15',
      headerChip:
        'border-rose-200/80 bg-gradient-to-br from-rose-100 to-pink-100 text-rose-900 dark:border-rose-900/50 dark:from-rose-950/30 dark:to-pink-950/30 dark:text-rose-100',
      cardTop: 'border-t-rose-400/80 dark:border-t-rose-400/70',
      cardBg: 'bg-gradient-to-br from-rose-50/22 to-pink-50/22 dark:from-rose-950/10 dark:to-pink-950/10',
    },
    cost: {
      bar: 'bg-lime-500/80 dark:bg-lime-300/80',
      navActive:
        'border-lime-200/70 bg-gradient-to-br from-lime-50/70 to-green-50/70 text-zinc-900 dark:border-lime-900/50 dark:from-lime-950/15 dark:to-green-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-gradient-to-br hover:from-lime-50/40 hover:to-green-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:from-lime-950/15 dark:hover:to-green-950/15',
      headerWrap: 'border-lime-200/70 bg-gradient-to-br from-lime-50/60 to-green-50/60 dark:border-lime-900/50 dark:from-lime-950/15 dark:to-green-950/15',
      headerChip:
        'border-lime-200/80 bg-gradient-to-br from-lime-100 to-green-100 text-lime-900 dark:border-lime-900/50 dark:from-lime-950/30 dark:to-green-950/30 dark:text-lime-100',
      cardTop: 'border-t-lime-400/80 dark:border-t-lime-400/70',
      cardBg: 'bg-gradient-to-br from-lime-50/22 to-green-50/22 dark:from-lime-950/10 dark:to-green-950/10',
    },
    results: {
      bar: 'bg-emerald-500/80 dark:bg-emerald-300/80',
      navActive:
        'border-emerald-200/70 bg-gradient-to-br from-emerald-50/70 to-teal-50/70 text-zinc-900 dark:border-emerald-900/50 dark:from-emerald-950/15 dark:to-teal-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-gradient-to-br hover:from-emerald-50/40 hover:to-teal-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:from-emerald-950/15 dark:hover:to-teal-950/15',
      headerWrap: 'border-emerald-200/70 bg-gradient-to-br from-emerald-50/60 to-teal-50/60 dark:border-emerald-900/50 dark:from-emerald-950/15 dark:to-teal-950/15',
      headerChip:
        'border-emerald-200/80 bg-gradient-to-br from-emerald-100 to-teal-100 text-emerald-900 dark:border-emerald-900/50 dark:from-emerald-950/30 dark:to-teal-950/30 dark:text-emerald-100',
      cardTop: 'border-t-emerald-400/80 dark:border-t-emerald-400/70',
      cardBg: 'bg-gradient-to-br from-emerald-50/22 to-teal-50/22 dark:from-emerald-950/10 dark:to-teal-950/10',
    },
    diff: {
      bar: 'bg-fuchsia-500/80 dark:bg-fuchsia-300/80',
      navActive:
        'border-fuchsia-200/70 bg-gradient-to-br from-fuchsia-50/70 to-pink-50/70 text-zinc-900 dark:border-fuchsia-900/50 dark:from-fuchsia-950/15 dark:to-pink-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-gradient-to-br hover:from-fuchsia-50/40 hover:to-pink-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:from-fuchsia-950/15 dark:hover:to-pink-950/15',
      headerWrap: 'border-fuchsia-200/70 bg-gradient-to-br from-fuchsia-50/60 to-pink-50/60 dark:border-fuchsia-900/50 dark:from-fuchsia-950/15 dark:to-pink-950/15',
      headerChip:
        'border-fuchsia-200/80 bg-gradient-to-br from-fuchsia-100 to-pink-100 text-fuchsia-900 dark:border-fuchsia-900/50 dark:from-fuchsia-950/30 dark:to-pink-950/30 dark:text-fuchsia-100',
      cardTop: 'border-t-fuchsia-400/80 dark:border-t-fuchsia-400/70',
      cardBg: 'bg-gradient-to-br from-fuchsia-50/22 to-pink-50/22 dark:from-fuchsia-950/10 dark:to-pink-950/10',
    },
  }

  return byKey[key] ?? byKey.base
}
