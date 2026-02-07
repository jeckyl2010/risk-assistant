'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Command, X } from 'lucide-react'

export function KeyboardShortcutHint() {
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Check if user has dismissed before
    const wasDismissed = localStorage.getItem('keyboard-hint-dismissed')
    if (wasDismissed) {
      setDismissed(true)
      return
    }

    // Show after 2 seconds
    const timer = setTimeout(() => {
      setShow(true)
    }, 2000)

    // Auto-hide after 8 seconds
    const hideTimer = setTimeout(() => {
      setShow(false)
    }, 10000)

    return () => {
      clearTimeout(timer)
      clearTimeout(hideTimer)
    }
  }, [])

  const handleDismiss = () => {
    setShow(false)
    setDismissed(true)
    localStorage.setItem('keyboard-hint-dismissed', 'true')
  }

  if (dismissed) return null

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.9 }}
          className="fixed bottom-6 right-6 z-40"
        >
          <div className="relative overflow-hidden rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-500 to-purple-600 p-4 shadow-2xl dark:border-indigo-900">
            <div className="absolute inset-0 bg-grid-white/10" />
            
            <button
              onClick={handleDismiss}
              className="absolute top-2 right-2 rounded-full p-1 text-white/70 hover:bg-white/20 hover:text-white transition-colors"
            >
              <X className="h-3 w-3" />
            </button>

            <div className="relative flex items-center gap-3 text-white">
              <div className="rounded-lg bg-white/20 p-2 backdrop-blur">
                <Command className="h-5 w-5" />
              </div>
              <div>
                <div className="font-semibold text-sm">Pro tip!</div>
                <div className="text-xs text-indigo-100">
                  Press{' '}
                  <kbd className="mx-1 rounded bg-white/20 px-1.5 py-0.5 font-mono text-xs backdrop-blur">
                    ⌘K
                  </kbd>{' '}
                  for quick actions
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
