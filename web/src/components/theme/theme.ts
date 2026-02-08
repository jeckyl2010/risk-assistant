import type { ThemeMode } from "./themeInit";

export { THEME_STORAGE_KEY, type ThemeMode } from "./themeInit";

export function resolveIsDark(theme: ThemeMode): boolean {
  if (theme === "dark") return true;
  if (theme === "light") return false;
  return window.matchMedia?.("(prefers-color-scheme: dark)")?.matches ?? false;
}

export function applyTheme(theme: ThemeMode) {
  const root = document.documentElement;
  const isDark = resolveIsDark(theme);
  root.classList.toggle("dark", isDark);
}

// NOTE: `getThemeInitScript()` lives in themeInit.ts so server components can import it.
