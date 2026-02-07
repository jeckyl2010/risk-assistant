'use client'

import { useEffect, useMemo, useState } from 'react'
import { applyTheme } from './theme'
import { THEME_STORAGE_KEY, type ThemeMode } from './themeInit'

/* eslint-disable react-hooks/set-state-in-effect */

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

  const label = useMemo(() => {
    if (theme === 'system') return 'System'
    if (theme === 'light') return 'Light'
    return 'Dark'
  }, [theme])

  if (!mounted) return null

  return (
    <div className="flex items-center gap-2 rounded-xl border border-zinc-200/70 bg-white/80 px-3 py-2 text-sm shadow-sm backdrop-blur dark:border-zinc-800/80 dark:bg-zinc-950/40">
      <div className="text-xs font-medium text-zinc-800 dark:text-zinc-200">Theme</div>
      <select
        aria-label="Theme"
        value={theme}
        onChange={(e) => setTheme(e.target.value as ThemeMode)}
        className="h-8 rounded-lg border border-zinc-200/70 bg-white px-2 text-sm text-zinc-900 outline-none [color-scheme:light] dark:[color-scheme:dark] focus:border-zinc-400 dark:border-zinc-800/80 dark:bg-zinc-950/60 dark:text-zinc-50"
      >
        <option value="system">System</option>
        <option value="light">Light</option>
        <option value="dark">Dark</option>
      </select>
      <div className="text-xs text-zinc-500 dark:text-zinc-400">{label}</div>
    </div>
  )
}

