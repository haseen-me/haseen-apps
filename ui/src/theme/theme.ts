/**
 * Haseen UI — Theme Definitions
 *
 * Privacy-First Enterprise aesthetic:
 * - Zero glassmorphism: no backdrop-blur, no translucent surfaces
 * - Solid hex backgrounds only — builds visual trust and maximises legibility
 * - Single accent point: brand teal (#2db8af) for CTAs, active states, focus rings
 * - Monochromatic neutrals (slate/zinc scale) for structure
 * - Minimal shadows — only for floating overlays (Dialog, Dropdown, Tooltip)
 */

import { palette } from '../tokens';

const c = palette;

export interface ThemeTokens {
  [key: string]: string;
}

export interface ThemeSet {
  light: ThemeTokens;
  dark: ThemeTokens;
}

// Primitive color vars — RGB triplets, available for rgba() composition in consumers
const colorVars = {
  '--hsn-white': c.white,
  '--hsn-black': c.black,
  '--hsn-grey-100': c.grey100,
  '--hsn-grey-200': c.grey200,
  '--hsn-grey-300': c.grey300,
  '--hsn-grey-400': c.grey400,
  '--hsn-grey-500': c.grey500,
  '--hsn-grey-600': c.grey600,
  '--hsn-grey-700': c.grey700,
  '--hsn-grey-800': c.grey800,
  '--hsn-grey-900': c.grey900,
  '--hsn-teal-100': c.teal100,
  '--hsn-teal-200': c.teal200,
  '--hsn-teal-300': c.teal300,
  '--hsn-teal-400': c.teal400,
  '--hsn-teal-500': c.teal500,
  '--hsn-teal-600': c.teal600,
  '--hsn-teal-700': c.teal700,
  '--hsn-teal-800': c.teal800,
  '--hsn-green-100': c.green100,
  '--hsn-green-200': c.green200,
  '--hsn-green-300': c.green300,
  '--hsn-green-400': c.green400,
  '--hsn-green-500': c.green500,
  '--hsn-green-600': c.green600,
  '--hsn-green-700': c.green700,
  '--hsn-green-800': c.green800,
  '--hsn-red-100': c.red100,
  '--hsn-red-200': c.red200,
  '--hsn-red-300': c.red300,
  '--hsn-red-400': c.red400,
  '--hsn-red-500': c.red500,
  '--hsn-red-600': c.red600,
  '--hsn-red-700': c.red700,
  '--hsn-red-800': c.red800,
  '--hsn-orange-100': c.orange100,
  '--hsn-orange-200': c.orange200,
  '--hsn-orange-300': c.orange300,
  '--hsn-orange-400': c.orange400,
  '--hsn-orange-500': c.orange500,
  '--hsn-orange-600': c.orange600,
  '--hsn-orange-700': c.orange700,
  '--hsn-orange-800': c.orange800,
  '--hsn-yellow-100': c.yellow100,
  '--hsn-yellow-200': c.yellow200,
  '--hsn-yellow-300': c.yellow300,
  '--hsn-yellow-400': c.yellow400,
  '--hsn-yellow-500': c.yellow500,
  '--hsn-yellow-600': c.yellow600,
  '--hsn-yellow-700': c.yellow700,
  '--hsn-yellow-800': c.yellow800,
  '--hsn-blue-100': c.blue100,
  '--hsn-blue-200': c.blue200,
  '--hsn-blue-300': c.blue300,
  '--hsn-blue-400': c.blue400,
  '--hsn-blue-500': c.blue500,
  '--hsn-blue-600': c.blue600,
  '--hsn-blue-700': c.blue700,
  '--hsn-blue-800': c.blue800,
  '--hsn-pink-100': c.pink100,
  '--hsn-pink-200': c.pink200,
  '--hsn-pink-300': c.pink300,
  '--hsn-pink-400': c.pink400,
  '--hsn-pink-500': c.pink500,
  '--hsn-pink-600': c.pink600,
  '--hsn-pink-700': c.pink700,
  '--hsn-pink-800': c.pink800,
  '--hsn-indigo-100': c.indigo100,
  '--hsn-indigo-200': c.indigo200,
  '--hsn-indigo-300': c.indigo300,
  '--hsn-indigo-400': c.indigo400,
  '--hsn-indigo-500': c.indigo500,
  '--hsn-indigo-600': c.indigo600,
  '--hsn-indigo-700': c.indigo700,
  '--hsn-indigo-800': c.indigo800,
};

const theme: ThemeSet = {
  // ─────────────────────────────────────────────────────────────────────────────
  // LIGHT MODE — crisp white/slate foundation
  // ─────────────────────────────────────────────────────────────────────────────
  light: {
    ...colorVars,

    // ── Focus ring — universal teal, keyboard navigation ──
    '--hsn-focus-ring': `0 0 0 2px #ffffff, 0 0 0 4px rgb(${c.teal500})`,
    '--hsn-focus-ring-color': `rgb(${c.teal500})`,
    '--hsn-focus-ring-offset': '2px',

    // ── Misc utility ──
    '--hsn-code-mark-color': `rgb(${c.teal600})`,
    '--hsn-code-mark-bg': `rgba(${c.black}, 0.06)`,

    // ── Text ──
    '--hsn-text-primary': '#0f172a',
    '--hsn-text-secondary': '#475569',
    '--hsn-text-tertiary': '#94a3b8',
    '--hsn-text-disabled': '#cbd5e1',
    '--hsn-text-always-white': '#ffffff',
    '--hsn-text-always-black': '#000000',
    '--hsn-text-link': `rgb(${c.teal600})`,
    '--hsn-text-destructive': `rgb(${c.red600})`,
    '--hsn-text-inverse': '#ffffff',

    // ── Icon ──
    '--hsn-icon-primary': '#0f172a',
    '--hsn-icon-secondary': '#64748b',
    '--hsn-icon-tertiary': '#94a3b8',
    '--hsn-icon-disabled': '#cbd5e1',
    '--hsn-icon-always-white': '#ffffff',
    '--hsn-icon-always-black': '#000000',
    '--hsn-icon-link': `rgb(${c.teal600})`,
    '--hsn-icon-destructive': `rgb(${c.red600})`,
    '--hsn-icon-inverse': '#ffffff',

    // ── CTA / Button — solid states, no translucency ──
    '--hsn-cta-primary-default': `rgb(${c.teal500})`,
    '--hsn-cta-primary-hover': `rgb(${c.teal600})`,
    '--hsn-cta-primary-active': `rgb(${c.teal700})`,
    '--hsn-cta-primary-disabled': '#b2e4e1',

    // Secondary: solid white with a visible border
    '--hsn-cta-secondary-default': '#ffffff',
    '--hsn-cta-secondary-hover': '#f8fafc',
    '--hsn-cta-secondary-active': '#f1f5f9',
    '--hsn-cta-secondary-disabled': '#f8fafc',

    // Tertiary/ghost: transparent with subtle solid hover
    '--hsn-cta-tertiary-default': 'transparent',
    '--hsn-cta-tertiary-hover': '#f1f5f9',
    '--hsn-cta-tertiary-active': '#e2e8f0',
    '--hsn-cta-tertiary-disabled': 'transparent',

    // Destructive: transparent base with solid error hover
    '--hsn-cta-destructive-default': 'transparent',
    '--hsn-cta-destructive-hover': '#fef2f2',
    '--hsn-cta-destructive-active': '#fee2e2',
    '--hsn-cta-destructive-disabled': 'transparent',

    // Chip / Navigation
    '--hsn-cta-chip-default': 'transparent',
    '--hsn-cta-chip-hover': '#f1f5f9',
    '--hsn-cta-navigation-default': 'transparent',
    '--hsn-cta-navigation-hover': '#f1f5f9',
    '--hsn-cta-navigation-active': '#e2e8f0',
    '--hsn-cta-navigation-active-accent': `rgba(${c.teal500}, 0.10)`,
    '--hsn-cta-navigation-disabled': 'transparent',

    // ── Border — crisp 1px strokes, no multi-opacity blur ──
    '--hsn-border-primary': '#e2e8f0',
    '--hsn-border-secondary': '#f1f5f9',
    '--hsn-border-tertiary': '#e2e8f0',
    '--hsn-border-hover': `rgb(${c.teal500})`,
    '--hsn-border-active': `rgb(${c.teal500})`,
    '--hsn-border-destructive': `rgb(${c.red300})`,
    '--hsn-border-input': '#cbd5e1',
    '--hsn-border-input-hover': '#94a3b8',
    '--hsn-border-input-focus': `rgb(${c.teal500})`,
    '--hsn-border-input-error': `rgb(${c.red500})`,

    // ── Background — all solid, zero translucency ──
    // App shell layers
    '--hsn-bg-app': '#f8fafc',
    '--hsn-bg-main-container': '#f8fafc',
    '--hsn-bg-sidepanel': '#f1f5f9',
    '--hsn-bg-header': '#ffffff',

    // Surface elevation layers — solid hex values only
    '--hsn-bg-l0-solid': '#f8fafc',
    '--hsn-bg-l1-solid': '#ffffff',
    '--hsn-bg-l2-solid': '#ffffff',
    '--hsn-bg-l3-solid': '#ffffff',

    // Glass variants are aliased to their solid equivalents — no translucency
    '--hsn-bg-l0-glass': '#f8fafc',
    '--hsn-bg-l1-glass': '#ffffff',
    '--hsn-bg-l2-glass': '#ffffff',
    '--hsn-bg-l3-glass': '#ffffff',

    '--hsn-bg-emphasis': '#0f172a',
    '--hsn-bg-scrim': 'rgba(15, 23, 42, 0.55)',

    // Row / cell interaction states
    '--hsn-bg-cell-hover': '#f8fafc',
    '--hsn-bg-cell-active': '#f1f5f9',
    '--hsn-bg-cell-selected': `rgba(${c.teal500}, 0.08)`,
    '--hsn-bg-cell-unread': '#ffffff',

    // Form fields — solid, no translucency
    '--hsn-bg-field-default': '#ffffff',
    '--hsn-bg-field-hover': '#f8fafc',
    '--hsn-bg-field-disabled': '#f8fafc',
    '--hsn-bg-field-error': '#fff5f5',

    // ── Overlay — solid tinted backgrounds ──
    '--hsn-bg-overlay-primary': 'rgba(15, 23, 42, 0.08)',
    '--hsn-bg-overlay-secondary': 'rgba(15, 23, 42, 0.05)',
    '--hsn-bg-overlay-tertiary': 'rgba(15, 23, 42, 0.03)',
    '--hsn-bg-overlay-destructive': '#fff5f5',

    // ── Accent — teal only as the single brand accent ──
    '--hsn-accent-teal-primary': `rgb(${c.teal600})`,
    '--hsn-accent-teal-secondary': `rgba(${c.teal500}, 0.12)`,

    // Status/semantic accents kept for functional use (tags, badges, status indicators)
    '--hsn-accent-green-primary': `rgb(${c.green600})`,
    '--hsn-accent-green-secondary': '#dcfce7',
    '--hsn-accent-orange-primary': `rgb(${c.orange600})`,
    '--hsn-accent-orange-secondary': '#ffedd5',
    '--hsn-accent-pink-primary': `rgb(${c.pink600})`,
    '--hsn-accent-pink-secondary': '#fce7f3',
    '--hsn-accent-yellow-primary': `rgb(${c.yellow600})`,
    '--hsn-accent-yellow-secondary': '#fef9c3',
    '--hsn-accent-blue-primary': `rgb(${c.blue600})`,
    '--hsn-accent-blue-secondary': '#dbeafe',
    '--hsn-accent-red-primary': `rgb(${c.red600})`,
    '--hsn-accent-red-secondary': '#fee2e2',
    '--hsn-accent-indigo-primary': `rgb(${c.indigo600})`,
    '--hsn-accent-indigo-secondary': '#e0e7ff',

    // ── Shadows — only for floating overlays, not structural panes ──
    // Structural borders handle separation; shadows reserved for overlays
    '--hsn-shadow-l1': '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
    '--hsn-shadow-l2': '0 4px 12px rgba(15, 23, 42, 0.10), 0 2px 4px rgba(15, 23, 42, 0.06)',
    '--hsn-shadow-l3': '0 12px 32px rgba(15, 23, 42, 0.14), 0 4px 8px rgba(15, 23, 42, 0.08)',
    '--hsn-shadow-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.8)',
    '--hsn-shadow-secondary-button': '0 1px 2px rgba(15, 23, 42, 0.06)',
    '--hsn-shadow-destructive-button': 'inset 0 0 0 1px rgba(220, 38, 38, 0.25)',
    '--hsn-shadow-dropdown': '0 8px 24px rgba(15, 23, 42, 0.12), 0 2px 6px rgba(15, 23, 42, 0.08)',
    '--hsn-shadow-drawer': '4px 0 24px rgba(15, 23, 42, 0.10)',
    '--hsn-shadow-dialog': '0 20px 60px rgba(15, 23, 42, 0.18), 0 8px 20px rgba(15, 23, 42, 0.10)',

    // Primary button hover shadow — teal glow, not spread
    '--hsn-primary-button-hover-shadow': `0 4px 14px rgba(${c.teal500}, 0.28)`,
    '--hsn-primary-button-hover-inset-shadow': 'none',

    // ── Misc ──
    '--hsn-status-bar-color': '#ffffff',
    '--hsn-illustration-fill': '#f1f5f9',
    '--hsn-divider': '#e2e8f0',
    '--hsn-scrollbar-thumb': '#cbd5e1',
    '--hsn-scrollbar-track': '#f1f5f9',
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // DARK MODE — deep slate foundation, not pure black
  // ─────────────────────────────────────────────────────────────────────────────
  dark: {
    ...colorVars,

    // ── Focus ring — same teal, white inner offset for contrast on dark ──
    '--hsn-focus-ring': `0 0 0 2px #1e293b, 0 0 0 4px rgb(${c.teal400})`,
    '--hsn-focus-ring-color': `rgb(${c.teal400})`,
    '--hsn-focus-ring-offset': '2px',

    // ── Misc utility ──
    '--hsn-code-mark-color': `rgb(${c.teal400})`,
    '--hsn-code-mark-bg': 'rgba(255, 255, 255, 0.06)',

    // ── Text ──
    '--hsn-text-primary': '#f1f5f9',
    '--hsn-text-secondary': '#94a3b8',
    '--hsn-text-tertiary': '#64748b',
    '--hsn-text-disabled': '#334155',
    '--hsn-text-always-white': '#ffffff',
    '--hsn-text-always-black': '#000000',
    '--hsn-text-link': `rgb(${c.teal400})`,
    '--hsn-text-destructive': `rgb(${c.red400})`,
    '--hsn-text-inverse': '#0f172a',

    // ── Icon ──
    '--hsn-icon-primary': '#e2e8f0',
    '--hsn-icon-secondary': '#94a3b8',
    '--hsn-icon-tertiary': '#64748b',
    '--hsn-icon-disabled': '#334155',
    '--hsn-icon-always-white': '#ffffff',
    '--hsn-icon-always-black': '#000000',
    '--hsn-icon-link': `rgb(${c.teal400})`,
    '--hsn-icon-destructive': `rgb(${c.red400})`,
    '--hsn-icon-inverse': '#0f172a',

    // ── CTA / Button — solid dark surfaces ──
    '--hsn-cta-primary-default': `rgb(${c.teal500})`,
    '--hsn-cta-primary-hover': `rgb(${c.teal400})`,
    '--hsn-cta-primary-active': `rgb(${c.teal600})`,
    '--hsn-cta-primary-disabled': '#1a3a38',

    '--hsn-cta-secondary-default': '#1e293b',
    '--hsn-cta-secondary-hover': '#293548',
    '--hsn-cta-secondary-active': '#334155',
    '--hsn-cta-secondary-disabled': '#1e293b',

    '--hsn-cta-tertiary-default': 'transparent',
    '--hsn-cta-tertiary-hover': '#1e293b',
    '--hsn-cta-tertiary-active': '#293548',
    '--hsn-cta-tertiary-disabled': 'transparent',

    '--hsn-cta-destructive-default': 'transparent',
    '--hsn-cta-destructive-hover': '#2d1515',
    '--hsn-cta-destructive-active': '#3b1919',
    '--hsn-cta-destructive-disabled': 'transparent',

    '--hsn-cta-chip-default': 'transparent',
    '--hsn-cta-chip-hover': '#1e293b',
    '--hsn-cta-navigation-default': 'transparent',
    '--hsn-cta-navigation-hover': '#1e293b',
    '--hsn-cta-navigation-active': '#293548',
    '--hsn-cta-navigation-active-accent': `rgba(${c.teal500}, 0.14)`,
    '--hsn-cta-navigation-disabled': 'transparent',

    // ── Border — distinct 1px strokes on dark ──
    '--hsn-border-primary': '#1e293b',
    '--hsn-border-secondary': '#162032',
    '--hsn-border-tertiary': '#1e293b',
    '--hsn-border-hover': `rgb(${c.teal500})`,
    '--hsn-border-active': `rgb(${c.teal400})`,
    '--hsn-border-destructive': `rgb(${c.red800})`,
    '--hsn-border-input': '#334155',
    '--hsn-border-input-hover': '#475569',
    '--hsn-border-input-focus': `rgb(${c.teal400})`,
    '--hsn-border-input-error': `rgb(${c.red500})`,

    // ── Background — all solid, no translucency ──
    '--hsn-bg-app': '#0b1120',
    '--hsn-bg-main-container': '#0b1120',
    '--hsn-bg-sidepanel': '#0f172a',
    '--hsn-bg-header': '#0f172a',

    '--hsn-bg-l0-solid': '#0b1120',
    '--hsn-bg-l1-solid': '#0f172a',
    '--hsn-bg-l2-solid': '#1e293b',
    '--hsn-bg-l3-solid': '#293548',

    // Glass variants aliased to solid — no backdrop-blur
    '--hsn-bg-l0-glass': '#0b1120',
    '--hsn-bg-l1-glass': '#0f172a',
    '--hsn-bg-l2-glass': '#1e293b',
    '--hsn-bg-l3-glass': '#293548',

    '--hsn-bg-emphasis': '#e2e8f0',
    '--hsn-bg-scrim': 'rgba(2, 6, 23, 0.75)',

    '--hsn-bg-cell-hover': '#162032',
    '--hsn-bg-cell-active': '#1e293b',
    '--hsn-bg-cell-selected': `rgba(${c.teal500}, 0.10)`,
    '--hsn-bg-cell-unread': '#162032',

    '--hsn-bg-field-default': '#1e293b',
    '--hsn-bg-field-hover': '#293548',
    '--hsn-bg-field-disabled': '#162032',
    '--hsn-bg-field-error': '#2d1515',

    '--hsn-bg-overlay-primary': 'rgba(255, 255, 255, 0.06)',
    '--hsn-bg-overlay-secondary': 'rgba(255, 255, 255, 0.04)',
    '--hsn-bg-overlay-tertiary': 'rgba(255, 255, 255, 0.02)',
    '--hsn-bg-overlay-destructive': '#2d1515',

    // ── Accent ──
    '--hsn-accent-teal-primary': `rgb(${c.teal400})`,
    '--hsn-accent-teal-secondary': `rgba(${c.teal500}, 0.16)`,

    '--hsn-accent-green-primary': `rgb(${c.green400})`,
    '--hsn-accent-green-secondary': '#14532d',
    '--hsn-accent-orange-primary': `rgb(${c.orange400})`,
    '--hsn-accent-orange-secondary': '#431407',
    '--hsn-accent-pink-primary': `rgb(${c.pink400})`,
    '--hsn-accent-pink-secondary': '#500724',
    '--hsn-accent-yellow-primary': `rgb(${c.yellow400})`,
    '--hsn-accent-yellow-secondary': '#422006',
    '--hsn-accent-blue-primary': `rgb(${c.blue400})`,
    '--hsn-accent-blue-secondary': '#1e3a5f',
    '--hsn-accent-red-primary': `rgb(${c.red400})`,
    '--hsn-accent-red-secondary': '#450a0a',
    '--hsn-accent-indigo-primary': `rgb(${c.indigo400})`,
    '--hsn-accent-indigo-secondary': '#1e1b4b',

    // ── Shadows — floating overlays only ──
    '--hsn-shadow-l1': '0 1px 3px rgba(0, 0, 0, 0.24), 0 1px 2px rgba(0, 0, 0, 0.18)',
    '--hsn-shadow-l2': '0 4px 12px rgba(0, 0, 0, 0.36), 0 2px 4px rgba(0, 0, 0, 0.24)',
    '--hsn-shadow-l3': '0 12px 32px rgba(0, 0, 0, 0.48), 0 4px 8px rgba(0, 0, 0, 0.28)',
    '--hsn-shadow-inset': 'inset 0 1px 0 rgba(255, 255, 255, 0.04)',
    '--hsn-shadow-secondary-button': '0 1px 2px rgba(0, 0, 0, 0.20)',
    '--hsn-shadow-destructive-button': 'inset 0 0 0 1px rgba(248, 113, 113, 0.20)',
    '--hsn-shadow-dropdown': '0 8px 24px rgba(0, 0, 0, 0.40), 0 2px 6px rgba(0, 0, 0, 0.28)',
    '--hsn-shadow-drawer': '4px 0 24px rgba(0, 0, 0, 0.32)',
    '--hsn-shadow-dialog': '0 20px 60px rgba(0, 0, 0, 0.56), 0 8px 20px rgba(0, 0, 0, 0.36)',

    '--hsn-primary-button-hover-shadow': `0 4px 14px rgba(${c.teal500}, 0.32)`,
    '--hsn-primary-button-hover-inset-shadow': 'none',

    // ── Misc ──
    '--hsn-status-bar-color': '#0f172a',
    '--hsn-illustration-fill': '#1e293b',
    '--hsn-divider': '#1e293b',
    '--hsn-scrollbar-thumb': '#334155',
    '--hsn-scrollbar-track': '#1e293b',
  },
};

export const themeNames = theme;
