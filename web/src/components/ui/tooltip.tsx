'use client'

import { ReactNode, useState } from 'react'
import { HelpCircle } from 'lucide-react'

interface TooltipProps {
  content: string
  children?: ReactNode
  icon?: boolean
}

export function Tooltip({ content, children, icon = false }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false)

  return (
    <span className="relative inline-flex items-center">
      <span
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        className="cursor-help"
      >
        {children || (
          <HelpCircle className="h-4 w-4 text-zinc-400 hover:text-zinc-600 dark:text-zinc-500 dark:hover:text-zinc-300" />
        )}
      </span>
      {isVisible && (
        <span className="absolute left-1/2 bottom-full mb-2 -translate-x-1/2 z-50 w-64 rounded-md bg-zinc-900 dark:bg-zinc-100 px-3 py-2 text-xs text-zinc-50 dark:text-zinc-900 shadow-lg border border-zinc-700 dark:border-zinc-300">
          {content}
          <span className="absolute left-1/2 top-full -translate-x-1/2 -translate-y-px border-4 border-transparent border-t-zinc-900 dark:border-t-zinc-100"></span>
        </span>
      )}
    </span>
  )
}
