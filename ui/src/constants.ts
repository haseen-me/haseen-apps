import { Size } from './types';

/** Sans stack that reads well without shipping webfonts */
export const FONT_FAMILY_SANS =
  'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif';

/** Monospace stack aligned with modern OS fonts */
export const FONT_FAMILY_MONO =
  'ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, "Liberation Mono", monospace';

/** Maps sizes to their corresponding height values in pixels */
export const SIZE_HEIGHT: Record<Size.SMALL | Size.MEDIUM | Size.LARGE, number> = {
  [Size.SMALL]: 32,
  [Size.MEDIUM]: 36,
  [Size.LARGE]: 42,
};
