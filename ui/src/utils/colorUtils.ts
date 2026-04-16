/**
 * Haseen UI — Color Utilities
 */

import { themeNames } from '../theme';
import { ThemeMode } from '../theme/ThemeProvider';

// ─── Color Type System ──────────────────────────────────────────────────────────

const TEXT_COLORS = [
  'primary',
  'secondary',
  'tertiary',
  'disabled',
  'destructive',
  'link',
  'inverse',
  'white',
  'black',
] as const;

const ACCENT_COLORS = [
  'teal',
  'green',
  'orange',
  'red',
  'yellow',
  'pink',
  'blue',
  'indigo',
] as const;

export type AccentColor = (typeof ACCENT_COLORS)[number];
export type TextColor = (typeof TEXT_COLORS)[number];
export type Color = TextColor | AccentColor;

export const isAccentColor = (color: Color): color is AccentColor =>
  ACCENT_COLORS.includes(color as AccentColor);

export const isTextColor = (color: Color): color is TextColor =>
  TEXT_COLORS.includes(color as TextColor);

// ─── Theme-Aware Color Resolution ───────────────────────────────────────────────

/**
 * Resolves a CSS variable reference to the correct value for a given theme.
 * If forceTheme is undefined, returns the var() reference for runtime resolution.
 */
export function getThemedColor(cssVar: string, forceTheme?: ThemeMode): string {
  if (!forceTheme) return cssVar;
  const varName = cssVar.replace(/^var\(/, '').replace(/\)$/, '');
  return themeNames[forceTheme][varName] ?? cssVar;
}

// ─── Hash-Based Label Color ─────────────────────────────────────────────────────

const LABEL_COLORS: AccentColor[] = ['teal', 'green', 'orange', 'pink', 'yellow', 'blue', 'indigo', 'red'];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash);
}

/** Returns a deterministic accent color based on a string input */
export function getLabelColor(label: string): AccentColor {
  return LABEL_COLORS[hashString(label) % LABEL_COLORS.length];
}

// ─── RGB Utilities ──────────────────────────────────────────────────────────────

export interface RGBValue {
  r: number;
  g: number;
  b: number;
}

/** Parse "r, g, b" string to RGBValue */
export function parseRGB(rgb: string): RGBValue {
  const [r, g, b] = rgb.split(',').map((v) => parseInt(v.trim(), 10));
  return { r, g, b };
}

/** Convert hex color to rgb triplet string */
export function hexToRGB(hex: string): string {
  const sanitized = hex.replace('#', '');
  const r = parseInt(sanitized.substring(0, 2), 16);
  const g = parseInt(sanitized.substring(2, 4), 16);
  const b = parseInt(sanitized.substring(4, 6), 16);
  return `${r}, ${g}, ${b}`;
}

/** Get relative luminance of an RGB color (0-1) */
export function luminance({ r, g, b }: RGBValue): number {
  const [sR, sG, sB] = [r, g, b].map((c) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * sR + 0.7152 * sG + 0.0722 * sB;
}

/** Contrast ratio between two RGB colors */
export function contrastRatio(a: RGBValue, b: RGBValue): number {
  const lA = luminance(a);
  const lB = luminance(b);
  const lighter = Math.max(lA, lB);
  const darker = Math.min(lA, lB);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Returns 'light' or 'dark' text color recommendation for given background */
export function getReadableTextColor(bgRGB: string): 'light' | 'dark' {
  const bg = parseRGB(bgRGB);
  const white: RGBValue = { r: 255, g: 255, b: 255 };
  const black: RGBValue = { r: 0, g: 0, b: 0 };
  return contrastRatio(bg, white) >= contrastRatio(bg, black) ? 'light' : 'dark';
}
