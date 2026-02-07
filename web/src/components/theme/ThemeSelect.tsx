'use client'

import { useEffect, useMemo, useState } from 'react'
import { Moon, Sun, Monitor } from 'lucide-react'
import { motion } from 'framer-motion'
import { applyTheme } from './theme'
import { THEME_STORAGE_KEY, type ThemeMode } from './themeInit'

function safeGetStoredTheme(): ThemeMode {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY)
    if (raw === 'light' || raw === 'dark' || raw === 'system') return raw
  } catch {
    // ignore
  }
  return 'system'
}

export function ThemeSelect() {
  const [mounted, setMounted] = useState(false)
  const [theme, setTheme] = useState<ThemeMode>('system')

  // Mount: read persisted theme. We don't render anything until mounted.
  useEffect(() => {
    setMounted(true)
    const stored = safeGetStoredTheme()
    setTheme(stored)
  }, [])

  // Persist & apply when user changes.
  useEffect(() => {
    if (!mounted) return
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme)
    } catch {
      // ignore
    }
    applyTheme(theme)
  }, [mounted, theme])

  // When in system mode, react to OS theme changes.
  useEffect(() => {
    if (theme !== 'system') return
    const mql = window.matchMedia?.('(prefers-color-scheme: dark)')
    if (!mql) return

    const handler = () => applyTheme('system')
    if (mql.addEventListener) {
      mql.addEventListener('change', handler)
    } else {
      ;(mql as unknown as { addListener?: (fn: () => void) => void }).addListener?.(handler)
    }

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener('change', handler)
      } else {
        ;(mql as unknown as { removeListener?: (fn: () => void) => void }).removeListener?.(handler)
      }
    }
  }, [theme])

  if (!mounted) return null

  const themes: { value: ThemeMode; icon: typeof Sun; label: string }[] = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Monitor, label: 'System' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex items-center gap-1 rounded-xl border-2 border-zinc-200/80 bg-white/80 p-1 shadow-sm backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/40"
    >
      {themes.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          onClick={() => setTheme(value)}
          className="relative rounded-lg p-2 text-zinc-600 transition-colors hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50"
          aria-label={label}
          title={label}
        >
          {theme === value && (
            <motion.div
              layoutId="theme-indicator"
              className="absolute inset-0 rounded-lg bg-zinc-100 dark:bg-zinc-800"
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
            />
          )}
          <Icon className="relative h-4 w-4" />
        </button>
      ))}
    </motion.div>
  )
}

