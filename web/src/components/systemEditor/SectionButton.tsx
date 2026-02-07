'use client'

import type { SectionAccent } from './sectionAccent'

export function SectionButton({
  active,
  title,
  subtitle,
  onClick,
  accent,
}: {
  active: boolean
  title: string
  subtitle?: string
  onClick: () => void
  accent: SectionAccent
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'relative w-full overflow-hidden rounded-xl border py-2 pl-5 pr-3 text-left text-sm shadow-sm transition-colors ' +
        (active ? accent.navActive : accent.navIdle)
      }
    >
      <span className={'absolute left-0 top-0 h-full w-1 ' + accent.bar} />
      <div className="font-medium">{title}</div>
      {subtitle ? <div className="mt-0.5 text-xs text-zinc-500 dark:text-zinc-400">{subtitle}</div> : null}
    </button>
  )
}
