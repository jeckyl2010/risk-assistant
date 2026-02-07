'use client'

import { cn } from '@/lib/utils'
import { motion } from 'framer-motion'
import { CheckCircle2, Circle } from 'lucide-react'

export interface NavItem {
  id: string
  label: string
  icon?: React.ReactNode
  badge?: string | number
  variant?: 'default' | 'success' | 'warning'
}

interface SystemSidebarProps {
  items: NavItem[]
  activeId: string
  onNavigate: (id: string) => void
}

export function SystemSidebar({ items, activeId, onNavigate }: SystemSidebarProps) {
  return (
    <nav className="sticky top-6 flex flex-col gap-2">
      {items.map((item, index) => {
        const isActive = activeId === item.id
        
        return (
          <motion.button
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            onClick={() => onNavigate(item.id)}
            className={cn(
              "group relative flex items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium transition-all",
              isActive
                ? "bg-zinc-900 text-zinc-50 shadow-md dark:bg-zinc-50 dark:text-zinc-900"
                : "text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
            )}
          >
            {isActive && (
              <motion.div
                layoutId="sidebar-indicator"
                className="absolute left-0 top-0 h-full w-1 rounded-r-full bg-zinc-50 dark:bg-zinc-900"
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            
            <div className="flex flex-1 items-center gap-3">
              {item.icon}
              <span>{item.label}</span>
            </div>

            {item.badge !== undefined && (
              <span
                className={cn(
                  "rounded-full px-2 py-0.5 text-xs font-semibold",
                  isActive
                    ? "bg-zinc-800 text-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                    : item.variant === 'success'
                    ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300"
                    : item.variant === 'warning'
                    ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300"
                    : "bg-zinc-200 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                )}
              >
                {item.badge}
              </span>
            )}
          </motion.button>
        )
      })}
    </nav>
  )
}
