// Haseen UI — Design System
// https://haseen.me/ui

// ─── Theme ──────────────────────────────────────────────────────────────────────
export {
  HaseenThemeProvider,
  useTheme,
  ThemeMode,
  StorageOnlyThemeMode,
  THEME_LOCAL_STORAGE_KEY,
  themeNames,
} from './theme';
export type { HaseenThemeProviderProps, LocalStorageThemeMode, ThemeTokens, ThemeSet } from './theme';

// ─── Tokens ─────────────────────────────────────────────────────────────────────
export {
  palette,
  opacities,
  spacing,
  radii,
  fontSizes,
  fontWeights,
  lineHeights,
  sizeHeight,
  zIndex,
  transitions,
} from './tokens';

// ─── Types ──────────────────────────────────────────────────────────────────────
export {
  Alignment,
  FilledVariant,
  KeyboardEvents,
  Layout,
  MouseEvents,
  Size,
  TouchEvents,
  Type,
} from './types';
export type { MouseClickEvents, RequireAtLeastOne, RequireOnlyOne } from './types';

// ─── Constants ──────────────────────────────────────────────────────────────────
export { FONT_FAMILY_MONO, FONT_FAMILY_SANS, SIZE_HEIGHT } from './constants';

// ─── Components ─────────────────────────────────────────────────────────────────
export {
  AppShell,
  AppShellHeader,
  AppShellSidebar,
  AppShellMain,
  AppShellDetailPane,
  AppShellToolbar,
} from './components/AppShell';
export type {
  AppShellProps,
  AppShellHeaderProps,
  AppShellSidebarProps,
  AppShellMainProps,
  AppShellDetailPaneProps,
  AppShellToolbarProps,
} from './components/AppShell';

export { Avatar, getAvatarIconOrLabel } from './components/Avatar';
export type { AvatarProps } from './components/Avatar';

export { Banner, BANNER_HEIGHT } from './components/Banner';
export type { BannerProps } from './components/Banner';

export { Button, IconButton } from './components/Button';
export type { ButtonProps, IconButtonProps } from './components/Button';

export { ButtonGroup } from './components/ButtonGroup';
export type { ButtonGroupProps } from './components/ButtonGroup';

export { Chip, ChipSize, CHIP_END_ICON_DATA_TEST } from './components/Chip';
export type { ChipProps } from './components/Chip';

export {
  CircularProgress,
  CircularProgressSize,
  PROGRESS_SIZE,
  AbsolutelyCentered,
  RelativelyCentered,
} from './components/CircularProgress';
export type { CircularProgressProps } from './components/CircularProgress';

export { CodeInput, CodeInputType } from './components/CodeInput';
export type { CodeInputProps } from './components/CodeInput';

export { Dialog, DialogTypes } from './components/Dialog';
export type { DialogProps } from './components/Dialog';

export { Divider, DividerType } from './components/Divider';
export type { DividerProps } from './components/Divider';

export { Dropdown, DROPDOWN_CALLER_ID } from './components/Dropdown';
export type { DropdownProps } from './components/Dropdown';

export { DropdownItem, DropdownItemColor } from './components/DropdownItem';
export type { DropdownItemProps } from './components/DropdownItem';

export { DropdownSubmenu } from './components/DropdownSubmenu';
export type { DropdownSubmenuProps } from './components/DropdownSubmenu';

export { Facepile } from './components/Facepile';
export type { FacepileProps } from './components/Facepile';

export { IconText, IconTextSize } from './components/IconText';
export type { IconTextProps } from './components/IconText';

export {
  InputField,
  Input,
  InputFieldSize,
  InputType,
  TextArea,
  SubText,
} from './components/InputField';
export type { InputFieldProps, InputProps, TextAreaProps, SubTextProps } from './components/InputField';

export { KeyCodeSequence } from './components/KeyCodeSequence';
export type { KeyCodeSequenceProps } from './components/KeyCodeSequence';

export { MonoTag } from './components/MonoTag';
export type { MonoTagProps } from './components/MonoTag';

export { Portal } from './components/Portal';
export type { PortalProps } from './components/Portal';

export { Select } from './components/Select';
export type { SelectProps, SelectOption } from './components/Select';

export { Skeleton } from './components/Skeleton';
export type { SkeletonProps } from './components/Skeleton';

export {
  Surface,
  SURFACE_CLASSNAME,
  MODAL_CLASSNAME,
  DRAWER_CLASSNAME,
  DROPDOWN_CALLER_CLASSNAME,
  SCRIM_CLASSNAME,
  ENABLE_OUTSIDE_CLICKS_CLASSNAME,
  MODAL_AND_DROPDOWN_SELECTOR,
} from './components/Surface';
export type { SurfaceProps, SurfaceLevel, SurfaceVariant } from './components/Surface';

export { Tabs, TabsSize } from './components/Tabs';
export type { TabsProps, Tab } from './components/Tabs';

export { Toast, TOAST_DEFAULT_DURATION } from './components/Toast';
export type { ToastProps } from './components/Toast';

export { Toggle } from './components/Toggle';
export type { ToggleProps } from './components/Toggle';

export { Tooltip, TooltipPlacement } from './components/Tooltip';
export type { TooltipProps } from './components/Tooltip';

export { Typography, TypographyOverflow, TypographySize, TypographyWeight } from './components/Typography';
export type { TypographyProps } from './components/Typography';

// ─── Hooks ──────────────────────────────────────────────────────────────────────
export { useOnClickOutside, useKeyboardNavigation, useMousePosition, useOnEscapePress } from './hooks';
export type { UseOnClickOutsideOptions, UseKeyboardNavigationOptions, MousePosition } from './hooks';

// ─── Utils ──────────────────────────────────────────────────────────────────────
export { BackgroundBlocker, ClickType, eventOfClickType, getClickType } from './utils';
export type { BackgroundBlockerProps } from './utils';
export {
  isAccentColor,
  isTextColor,
  getThemedColor,
  getLabelColor,
  parseRGB,
  hexToRGB,
  luminance,
  contrastRatio,
  getReadableTextColor,
} from './utils/colorUtils';
export type { AccentColor, TextColor, Color, RGBValue } from './utils/colorUtils';
