import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';

import { themeNames } from './theme';

// ─── Types ──────────────────────────────────────────────────────────────────────

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark',
}

export enum StorageOnlyThemeMode {
  SYSTEM = 'system',
}

export type LocalStorageThemeMode = ThemeMode | StorageOnlyThemeMode;

function isThemeMode(value: LocalStorageThemeMode): value is ThemeMode {
  return value === ThemeMode.LIGHT || value === ThemeMode.DARK;
}

// ─── Context ────────────────────────────────────────────────────────────────────

interface ThemeContextType {
  theme: ThemeMode;
  storedTheme: LocalStorageThemeMode;
  setStoredTheme: (mode: LocalStorageThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: ThemeMode.LIGHT,
  storedTheme: StorageOnlyThemeMode.SYSTEM,
  setStoredTheme: () => {},
});

export const useTheme = () => useContext(ThemeContext);

// ─── Constants ──────────────────────────────────────────────────────────────────

export const THEME_LOCAL_STORAGE_KEY = 'HASEEN_THEME_MODE';
const DARK_MEDIA_QUERY = '(prefers-color-scheme: dark)';
const GLOBAL_STYLE_ID = 'hsn-global-styles';

// ─── Global CSS Injection ────────────────────────────────────────────────────────
// Injects the universal focus ring and base interaction resets.
// These cannot live in inline styles — they require :focus-visible and ::-webkit-scrollbar.

const GLOBAL_CSS = `
/* ── Haseen UI — Global Interaction Styles ── */

/* Reset browser default outlines; we control focus entirely */
*:focus {
  outline: none;
}

/* Universal focus ring: teal brand color, keyboard-navigation only.
   Applies to every interactive element: buttons, inputs, selects, links, [tabindex]. */
*:focus-visible {
  outline: none;
  box-shadow: var(--hsn-focus-ring, 0 0 0 2px #ffffff, 0 0 0 4px rgb(45, 184, 175)) !important;
}

/* Inputs and textareas get border-based focus via component logic,
   so we suppress the box-shadow duplicate for them specifically.
   The component handles --hsn-border-input-focus directly. */
input:focus-visible,
textarea:focus-visible,
select:focus-visible {
  box-shadow: none !important;
}

/* Anchor tags */
a:focus-visible {
  border-radius: 2px;
}

/* ── Scrollbar styling — matches the surface theme ── */
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}
::-webkit-scrollbar-track {
  background: var(--hsn-scrollbar-track, #f1f5f9);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb {
  background: var(--hsn-scrollbar-thumb, #cbd5e1);
  border-radius: 3px;
}
::-webkit-scrollbar-thumb:hover {
  background: var(--hsn-border-input-hover, #94a3b8);
}

/* ── Text selection ── */
::selection {
  background: rgba(45, 184, 175, 0.20);
  color: inherit;
}

/* ── Disabled state cursor reset ── */
[disabled],
[aria-disabled="true"] {
  cursor: not-allowed;
  pointer-events: none;
}

/* ── Keyframe animations for overlay entry ── */
@keyframes hsnFadeIn {
  from { opacity: 0; }
  to   { opacity: 1; }
}

@keyframes hsnDropdownIn {
  from { opacity: 0; transform: translateY(-4px) scale(0.98); }
  to   { opacity: 1; transform: translateY(0) scale(1); }
}

@keyframes hsnSlideInRight {
  from { opacity: 0; transform: translateX(8px); }
  to   { opacity: 1; transform: translateX(0); }
}

@keyframes hsnSlideUp {
  from { opacity: 0; transform: translateY(8px); }
  to   { opacity: 1; transform: translateY(0); }
}
`;

function injectGlobalStyles() {
  if (typeof document === 'undefined') return;
  if (document.getElementById(GLOBAL_STYLE_ID)) return;
  const style = document.createElement('style');
  style.id = GLOBAL_STYLE_ID;
  style.textContent = GLOBAL_CSS;
  document.head.appendChild(style);
}

// ─── Utility ────────────────────────────────────────────────────────────────────

function applyThemeTokens(mode: ThemeMode) {
  const tokens = themeNames[mode];
  const body = document.body;
  for (const key in tokens) {
    body.style.setProperty(key, tokens[key]);
  }
  body.setAttribute('data-haseen-theme', mode);
}

// ─── Provider ───────────────────────────────────────────────────────────────────

export interface HaseenThemeProviderProps {
  defaultTheme?: LocalStorageThemeMode;
  children: React.ReactNode;
}

export const HaseenThemeProvider: React.FC<HaseenThemeProviderProps> = ({
  defaultTheme = StorageOnlyThemeMode.SYSTEM,
  children,
}) => {
  const [themeName, setThemeName] = useState<ThemeMode>(ThemeMode.DARK);
  const [storedThemeState, setStoredThemeState] = useState<LocalStorageThemeMode>(defaultTheme);

  const darkMediaQuery =
    typeof window !== 'undefined' ? window.matchMedia(DARK_MEDIA_QUERY) : undefined;

  const resolveAndApply = useCallback(
    (mode: LocalStorageThemeMode, mq?: MediaQueryList) => {
      setStoredThemeState(mode);
      if (isThemeMode(mode)) {
        setThemeName(mode);
        applyThemeTokens(mode);
      } else if (mq !== undefined) {
        const resolved = mq.matches ? ThemeMode.DARK : ThemeMode.LIGHT;
        setThemeName(resolved);
        applyThemeTokens(resolved);
      }
    },
    []
  );

  const setStoredTheme = useCallback(
    (mode: LocalStorageThemeMode) => {
      localStorage.setItem(THEME_LOCAL_STORAGE_KEY, mode);
      resolveAndApply(mode, darkMediaQuery);
    },
    [darkMediaQuery, resolveAndApply]
  );

  // Inject global styles once on mount
  useEffect(() => {
    injectGlobalStyles();
  }, []);

  // Initialize from localStorage
  useEffect(() => {
    const stored =
      (localStorage.getItem(THEME_LOCAL_STORAGE_KEY) as LocalStorageThemeMode) || defaultTheme;
    resolveAndApply(stored, darkMediaQuery);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    if (storedThemeState !== StorageOnlyThemeMode.SYSTEM || !darkMediaQuery) return;
    const handler = () => resolveAndApply(StorageOnlyThemeMode.SYSTEM, darkMediaQuery);
    darkMediaQuery.addEventListener('change', handler);
    return () => darkMediaQuery.removeEventListener('change', handler);
  }, [storedThemeState, darkMediaQuery, resolveAndApply]);

  return (
    <ThemeContext.Provider value={{ theme: themeName, storedTheme: storedThemeState, setStoredTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
