export type ThemeMode = 'system' | 'light' | 'dark'

export const THEME_STORAGE_KEY = 'risk-assistant.theme'

export function getThemeInitScript() {
  // Runs before React hydration to avoid a flash.
  return `(() => {
  try {
    const key = ${JSON.stringify(THEME_STORAGE_KEY)};
    const theme = (localStorage.getItem(key) || 'system');
    const mql = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
    const isDark = theme === 'dark' || (theme === 'system' && !!(mql && mql.matches));
    const root = document.documentElement;
    if (isDark) root.classList.add('dark'); else root.classList.remove('dark');
  } catch (e) {}
})();`
}
