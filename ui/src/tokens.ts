/**
 * Haseen UI — Design Tokens
 *
 * Complete token system: colors, spacing, radii, typography, shadows, opacities.
 * Brand primary: #2db8af → rgb(45, 184, 175)
 */

// ─── Opacities ──────────────────────────────────────────────────────────────────

export const opacities = {
  2: '0.02',
  4: '0.04',
  6: '0.06',
  8: '0.08',
  10: '0.10',
  12: '0.12',
  14: '0.14',
  16: '0.16',
  20: '0.20',
  24: '0.24',
  28: '0.28',
  32: '0.32',
  36: '0.36',
  42: '0.42',
  48: '0.48',
  54: '0.54',
  56: '0.56',
  60: '0.60',
  64: '0.64',
  72: '0.72',
  80: '0.80',
  88: '0.88',
} as const;

// ─── Color Primitives (RGB triplets) ────────────────────────────────────────────

export const palette = {
  // Neutrals
  white: '255, 255, 255',
  grey100: '243, 244, 246',
  grey200: '229, 231, 235',
  grey300: '209, 213, 219',
  grey400: '156, 163, 175',
  grey500: '107, 114, 128',
  grey600: '75, 85, 99',
  grey700: '55, 65, 81',
  grey800: '31, 41, 55',
  grey900: '17, 24, 39',
  black: '0, 0, 0',

  // Primary — Teal (#2db8af)
  teal100: '209, 245, 242',
  teal200: '163, 235, 230',
  teal300: '115, 220, 214',
  teal400: '69, 200, 193',
  teal500: '45, 184, 175',   // Brand primary
  teal600: '35, 153, 146',
  teal700: '26, 118, 113',
  teal800: '18, 82, 78',

  // Green
  green100: '209, 250, 229',
  green200: '167, 243, 208',
  green300: '110, 231, 183',
  green400: '52, 211, 153',
  green500: '16, 185, 129',
  green600: '5, 150, 105',
  green700: '4, 120, 87',
  green800: '6, 95, 70',

  // Red
  red100: '254, 226, 226',
  red200: '254, 202, 202',
  red300: '252, 165, 165',
  red400: '248, 113, 113',
  red500: '239, 68, 68',
  red600: '220, 38, 38',
  red700: '185, 28, 28',
  red800: '153, 27, 27',

  // Orange
  orange100: '255, 237, 213',
  orange200: '254, 215, 170',
  orange300: '253, 186, 116',
  orange400: '251, 146, 60',
  orange500: '249, 115, 22',
  orange600: '234, 88, 12',
  orange700: '194, 65, 12',
  orange800: '154, 52, 18',

  // Yellow
  yellow100: '254, 249, 195',
  yellow200: '254, 240, 138',
  yellow300: '253, 224, 71',
  yellow400: '250, 204, 21',
  yellow500: '234, 179, 8',
  yellow600: '202, 138, 4',
  yellow700: '161, 98, 7',
  yellow800: '133, 77, 14',

  // Blue
  blue100: '219, 234, 254',
  blue200: '191, 219, 254',
  blue300: '147, 197, 253',
  blue400: '96, 165, 250',
  blue500: '59, 130, 246',
  blue600: '37, 99, 235',
  blue700: '29, 78, 216',
  blue800: '30, 64, 175',

  // Pink
  pink100: '252, 231, 243',
  pink200: '251, 207, 232',
  pink300: '249, 168, 212',
  pink400: '244, 114, 182',
  pink500: '236, 72, 153',
  pink600: '219, 39, 119',
  pink700: '190, 24, 93',
  pink800: '157, 23, 77',

  // Indigo
  indigo100: '224, 231, 255',
  indigo200: '199, 210, 254',
  indigo300: '165, 180, 252',
  indigo400: '129, 140, 248',
  indigo500: '99, 102, 241',
  indigo600: '79, 70, 229',
  indigo700: '67, 56, 202',
  indigo800: '55, 48, 163',
} as const;

// ─── Spacing Scale ──────────────────────────────────────────────────────────────

export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
} as const;

// ─── Border Radii ───────────────────────────────────────────────────────────────

export const radii = {
  none: '0px',
  sm: '8px',
  md: '12px',
  lg: '18px',
  xl: '24px',
  '2xl': '32px',
  full: '9999px',
} as const;

// ─── Typography Scale ───────────────────────────────────────────────────────────

export const fontSizes = {
  xs: '0.75rem',    // 12px
  sm: '0.8125rem',  // 13px
  base: '0.875rem', // 14px
  md: '1rem',       // 16px
  lg: '1.125rem',   // 18px
  xl: '1.25rem',    // 20px
  '2xl': '1.5rem',  // 24px
  '3xl': '1.875rem',// 30px
  '4xl': '2.25rem', // 36px
} as const;

export const fontWeights = {
  regular: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
} as const;

export const lineHeights = {
  tight: '1.25',
  normal: '1.5',
  relaxed: '1.625',
} as const;

// ─── Size Heights (Component sizing) ────────────────────────────────────────────

export const sizeHeight = {
  xsmall: 28,
  small: 32,
  medium: 36,
  large: 42,
  xlarge: 48,
} as const;

// ─── Z-Index Scale ──────────────────────────────────────────────────────────────

export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1100,
  overlay: 1200,
  modal: 1300,
  popover: 1400,
  toast: 1500,
} as const;

// ─── Transition Durations ───────────────────────────────────────────────────────

export const transitions = {
  fast: '100ms',
  normal: '200ms',
  slow: '300ms',
  easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
} as const;
