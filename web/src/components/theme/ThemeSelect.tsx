"use client";

import { motion } from "framer-motion";
import { Monitor, Moon, Sun } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { applyTheme } from "./theme";
import { THEME_STORAGE_KEY, type ThemeMode } from "./themeInit";

function safeGetStoredTheme(): ThemeMode {
  try {
    const raw = localStorage.getItem(THEME_STORAGE_KEY);
    if (raw === "light" || raw === "dark" || raw === "system") return raw;
  } catch {
    // ignore
  }
  return "system";
}

export function ThemeSelect() {
  const [mounted, setMounted] = useState(false);
  const [theme, setTheme] = useState<ThemeMode>("system");

  // Mount: read persisted theme. We don't render anything until mounted.
  useEffect(() => {
    setMounted(true);
    const stored = safeGetStoredTheme();
    setTheme(stored);
  }, []);

  // Persist & apply when user changes.
  useEffect(() => {
    if (!mounted) return;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      // ignore
    }
    applyTheme(theme);
  }, [mounted, theme]);

  // When in system mode, react to OS theme changes.
  useEffect(() => {
    if (theme !== "system") return;
    const mql = window.matchMedia?.("(prefers-color-scheme: dark)");
    if (!mql) return;

    const handler = () => applyTheme("system");
    if (mql.addEventListener) {
      mql.addEventListener("change", handler);
    } else {
      (mql as unknown as { addListener?: (fn: () => void) => void }).addListener?.(handler);
    }

    return () => {
      if (mql.removeEventListener) {
        mql.removeEventListener("change", handler);
      } else {
        (mql as unknown as { removeListener?: (fn: () => void) => void }).removeListener?.(handler);
      }
    };
  }, [theme]);

  if (!mounted) return null;

  const themes: { value: ThemeMode; icon: typeof Sun; label: string }[] = [
    { value: "light", icon: Sun, label: "Light" },
    { value: "dark", icon: Moon, label: "Dark" },
    { value: "system", icon: Monitor, label: "System" },
  ];

  const currentThemeIndex = themes.findIndex((t) => t.value === theme);
  const currentTheme = themes[currentThemeIndex];

  const cycleTheme = () => {
    const nextIndex = (currentThemeIndex + 1) % themes.length;
    setTheme(themes[nextIndex].value);
  };

  const Icon = currentTheme.icon;

  return (
    <motion.button
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onClick={cycleTheme}
      className="flex items-center gap-2 rounded-full border border-zinc-200/50 bg-white/90 px-3 py-2 shadow-lg backdrop-blur transition-all hover:scale-105 hover:shadow-xl active:scale-95 dark:border-zinc-700/50 dark:bg-zinc-900/90 opacity-70 hover:opacity-100"
      aria-label={`Current theme: ${currentTheme.label}. Click to switch.`}
      title={`Theme: ${currentTheme.label} (click to change)`}
    >
      <Icon className="h-4 w-4 text-zinc-600 dark:text-zinc-400" />
      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hidden sm:inline">
        {currentTheme.label}
      </span>
    </motion.button>
  );
}
