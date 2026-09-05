const KEY = 'studyhub_theme';
const media = () => window.matchMedia('(prefers-color-scheme: dark)');

/** 'light' | 'dark' | 'system' */
export const readTheme = () => localStorage.getItem(KEY) || 'system';

export const resolveTheme = (pref) =>
  pref === 'system' ? (media().matches ? 'dark' : 'light') : pref;

// data-theme drives the token block in styles.js, and color-scheme with it, so
// native controls (selects, date pickers, scrollbars) follow the theme too.
export function applyTheme(pref) {
  document.documentElement.setAttribute('data-theme', resolveTheme(pref));
}

export function setTheme(pref) {
  if (pref === 'system') localStorage.removeItem(KEY);
  else localStorage.setItem(KEY, pref);
  applyTheme(pref);
}

/** Re-applies on OS theme changes, but only while the user is on 'system'. */
export function watchSystemTheme() {
  const mq = media();
  const onChange = () => { if (readTheme() === 'system') applyTheme('system'); };
  mq.addEventListener('change', onChange);
  return () => mq.removeEventListener('change', onChange);
}
