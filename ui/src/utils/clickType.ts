/**
 * Haseen UI — Click Type Utilities
 */

export enum ClickType {
  LEFT = 'left',
  MIDDLE = 'middle',
  RIGHT = 'right',
  META = 'meta',
  CTRL = 'ctrl',
}

/** Determine the click type from a MouseEvent */
export function getClickType(e: MouseEvent | React.MouseEvent): ClickType {
  if (e.metaKey) return ClickType.META;
  if (e.ctrlKey) return ClickType.CTRL;
  if (e.button === 1) return ClickType.MIDDLE;
  if (e.button === 2) return ClickType.RIGHT;
  return ClickType.LEFT;
}

/** Check if a MouseEvent matches a specific click type */
export function eventOfClickType(
  e: MouseEvent | React.MouseEvent,
  type: ClickType
): boolean {
  return getClickType(e) === type;
}
