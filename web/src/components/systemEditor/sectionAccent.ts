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
        'border-indigo-200/70 bg-indigo-50/70 text-zinc-900 dark:border-indigo-900/50 dark:bg-indigo-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-indigo-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:bg-indigo-950/15',
      headerWrap: 'border-indigo-200/70 bg-indigo-50/60 dark:border-indigo-900/50 dark:bg-indigo-950/15',
      headerChip:
        'border-indigo-200/80 bg-indigo-50 text-indigo-900 dark:border-indigo-900/50 dark:bg-indigo-950/20 dark:text-indigo-100',
      cardTop: 'border-t-indigo-400/80 dark:border-t-indigo-400/70',
      cardBg: 'bg-indigo-50/25 dark:bg-indigo-950/10',
    },
    base: {
      bar: 'bg-zinc-500/70 dark:bg-zinc-300/60',
      navActive:
        'border-zinc-200/70 bg-zinc-50/90 text-zinc-900 dark:border-zinc-700/60 dark:bg-zinc-900/35 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-zinc-50/80 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:bg-zinc-900/20',
      headerWrap: 'border-zinc-200/70 bg-zinc-50/60 dark:border-zinc-800/70 dark:bg-zinc-900/20',
      headerChip:
        'border-zinc-200/80 bg-zinc-50 text-zinc-900 dark:border-zinc-800/70 dark:bg-zinc-950/20 dark:text-zinc-100',
      cardTop: 'border-t-zinc-300/80 dark:border-t-zinc-700/70',
      cardBg: 'bg-zinc-50/70 dark:bg-zinc-900/25',
    },
    ai: {
      bar: 'bg-violet-500/80 dark:bg-violet-300/80',
      navActive:
        'border-violet-200/70 bg-violet-50/70 text-zinc-900 dark:border-violet-900/50 dark:bg-violet-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-violet-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:bg-violet-950/15',
      headerWrap: 'border-violet-200/70 bg-violet-50/60 dark:border-violet-900/50 dark:bg-violet-950/15',
      headerChip:
        'border-violet-200/80 bg-violet-50 text-violet-900 dark:border-violet-900/50 dark:bg-violet-950/20 dark:text-violet-100',
      cardTop: 'border-t-violet-400/80 dark:border-t-violet-400/70',
      cardBg: 'bg-violet-50/25 dark:bg-violet-950/10',
    },
    criticality: {
      bar: 'bg-amber-500/80 dark:bg-amber-300/80',
      navActive:
        'border-amber-200/70 bg-amber-50/70 text-zinc-900 dark:border-amber-900/50 dark:bg-amber-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-amber-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:bg-amber-950/15',
      headerWrap: 'border-amber-200/70 bg-amber-50/60 dark:border-amber-900/50 dark:bg-amber-950/15',
      headerChip:
        'border-amber-200/80 bg-amber-50 text-amber-900 dark:border-amber-900/50 dark:bg-amber-950/20 dark:text-amber-100',
      cardTop: 'border-t-amber-400/80 dark:border-t-amber-400/70',
      cardBg: 'bg-amber-50/25 dark:bg-amber-950/10',
    },
    data: {
      bar: 'bg-cyan-500/80 dark:bg-cyan-300/80',
      navActive:
        'border-cyan-200/70 bg-cyan-50/70 text-zinc-900 dark:border-cyan-900/50 dark:bg-cyan-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-cyan-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:bg-cyan-950/15',
      headerWrap: 'border-cyan-200/70 bg-cyan-50/60 dark:border-cyan-900/50 dark:bg-cyan-950/15',
      headerChip:
        'border-cyan-200/80 bg-cyan-50 text-cyan-900 dark:border-cyan-900/50 dark:bg-cyan-950/20 dark:text-cyan-100',
      cardTop: 'border-t-cyan-400/80 dark:border-t-cyan-400/70',
      cardBg: 'bg-cyan-50/22 dark:bg-cyan-950/10',
    },
    integration: {
      bar: 'bg-sky-500/80 dark:bg-sky-300/80',
      navActive:
        'border-sky-200/70 bg-sky-50/70 text-zinc-900 dark:border-sky-900/50 dark:bg-sky-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-sky-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:bg-sky-950/15',
      headerWrap: 'border-sky-200/70 bg-sky-50/60 dark:border-sky-900/50 dark:bg-sky-950/15',
      headerChip:
        'border-sky-200/80 bg-sky-50 text-sky-900 dark:border-sky-900/50 dark:bg-sky-950/20 dark:text-sky-100',
      cardTop: 'border-t-sky-400/80 dark:border-t-sky-400/70',
      cardBg: 'bg-sky-50/22 dark:bg-sky-950/10',
    },
    operations: {
      bar: 'bg-emerald-500/80 dark:bg-emerald-300/80',
      navActive:
        'border-emerald-200/70 bg-emerald-50/70 text-zinc-900 dark:border-emerald-900/50 dark:bg-emerald-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-emerald-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:bg-emerald-950/15',
      headerWrap: 'border-emerald-200/70 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/15',
      headerChip:
        'border-emerald-200/80 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-100',
      cardTop: 'border-t-emerald-400/80 dark:border-t-emerald-400/70',
      cardBg: 'bg-emerald-50/22 dark:bg-emerald-950/10',
    },
    security: {
      bar: 'bg-rose-500/80 dark:bg-rose-300/80',
      navActive:
        'border-rose-200/70 bg-rose-50/70 text-zinc-900 dark:border-rose-900/50 dark:bg-rose-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-rose-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:bg-rose-950/15',
      headerWrap: 'border-rose-200/70 bg-rose-50/60 dark:border-rose-900/50 dark:bg-rose-950/15',
      headerChip:
        'border-rose-200/80 bg-rose-50 text-rose-900 dark:border-rose-900/50 dark:bg-rose-950/20 dark:text-rose-100',
      cardTop: 'border-t-rose-400/80 dark:border-t-rose-400/70',
      cardBg: 'bg-rose-50/22 dark:bg-rose-950/10',
    },
    cost: {
      bar: 'bg-orange-500/80 dark:bg-orange-300/80',
      navActive:
        'border-orange-200/70 bg-orange-50/70 text-zinc-900 dark:border-orange-900/50 dark:bg-orange-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-orange-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:bg-orange-950/15',
      headerWrap: 'border-orange-200/70 bg-orange-50/60 dark:border-orange-900/50 dark:bg-orange-950/15',
      headerChip:
        'border-orange-200/80 bg-orange-50 text-orange-900 dark:border-orange-900/50 dark:bg-orange-950/20 dark:text-orange-100',
      cardTop: 'border-t-orange-400/80 dark:border-t-orange-400/70',
      cardBg: 'bg-orange-50/22 dark:bg-orange-950/10',
    },
    results: {
      bar: 'bg-emerald-500/80 dark:bg-emerald-300/80',
      navActive:
        'border-emerald-200/70 bg-emerald-50/70 text-zinc-900 dark:border-emerald-900/50 dark:bg-emerald-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-emerald-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:bg-emerald-950/15',
      headerWrap: 'border-emerald-200/70 bg-emerald-50/60 dark:border-emerald-900/50 dark:bg-emerald-950/15',
      headerChip:
        'border-emerald-200/80 bg-emerald-50 text-emerald-900 dark:border-emerald-900/50 dark:bg-emerald-950/20 dark:text-emerald-100',
      cardTop: 'border-t-emerald-400/80 dark:border-t-emerald-400/70',
      cardBg: 'bg-emerald-50/22 dark:bg-emerald-950/10',
    },
    diff: {
      bar: 'bg-fuchsia-500/80 dark:bg-fuchsia-300/80',
      navActive:
        'border-fuchsia-200/70 bg-fuchsia-50/70 text-zinc-900 dark:border-fuchsia-900/50 dark:bg-fuchsia-950/15 dark:text-zinc-50',
      navIdle:
        'border-zinc-200/50 bg-zinc-50/40 text-zinc-700 hover:bg-fuchsia-50/40 dark:border-zinc-800/60 dark:bg-zinc-950/10 dark:text-zinc-300 dark:hover:bg-fuchsia-950/15',
      headerWrap: 'border-fuchsia-200/70 bg-fuchsia-50/60 dark:border-fuchsia-900/50 dark:bg-fuchsia-950/15',
      headerChip:
        'border-fuchsia-200/80 bg-fuchsia-50 text-fuchsia-900 dark:border-fuchsia-900/50 dark:bg-fuchsia-950/20 dark:text-fuchsia-100',
      cardTop: 'border-t-fuchsia-400/80 dark:border-t-fuchsia-400/70',
      cardBg: 'bg-fuchsia-50/22 dark:bg-fuchsia-950/10',
    },
  }

  return byKey[key] ?? byKey.base
}
