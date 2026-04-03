export interface NavItem {
  label: string;
  path: string;
  children?: NavItem[];
}

export const NAV_SECTIONS: { title: string; items: NavItem[] }[] = [
  {
    title: 'Getting started',
    items: [
      {
        label: 'Introduction',
        path: '/',
        children: [
          { label: 'Overview', path: '/' },
          { label: 'Resources', path: '/resources' },
          { label: 'Quickstart', path: '/quickstart' },
        ],
      },
    ],
  },
  {
    title: 'Components',
    items: [
      { label: 'Avatar', path: '/avatar' },
      { label: 'Banner', path: '/banner' },
      { label: 'Button', path: '/button' },
      { label: 'ButtonGroup', path: '/button-group' },
      { label: 'Chip', path: '/chip' },
      { label: 'CircularProgress', path: '/circular-progress' },
      { label: 'CodeInput', path: '/code-input' },
      { label: 'Dialog', path: '/dialog' },
      { label: 'Divider', path: '/divider' },
      { label: 'Dropdown', path: '/dropdown' },
      { label: 'Facepile', path: '/facepile' },
      { label: 'IconText', path: '/icon-text' },
      { label: 'InputField', path: '/input-field' },
      { label: 'KeyCodeSequence', path: '/key-code-sequence' },
      { label: 'MonoTag', path: '/mono-tag' },
      { label: 'Select', path: '/select' },
      { label: 'Skeleton', path: '/skeleton' },
      { label: 'Surface', path: '/surface' },
      { label: 'Tabs', path: '/tabs' },
      { label: 'Toast', path: '/toast' },
      { label: 'Toggle', path: '/toggle' },
      { label: 'Tooltip', path: '/tooltip' },
      { label: 'Typography', path: '/typography' },
    ],
  },
  {
    title: 'Hooks',
    items: [
      { label: 'useOnClickOutside', path: '/use-on-click-outside' },
      { label: 'useKeyboardNavigation', path: '/use-keyboard-navigation' },
      { label: 'useMousePosition', path: '/use-mouse-position' },
      { label: 'useOnEscapePress', path: '/use-on-escape-press' },
    ],
  },
  {
    title: 'Theme',
    items: [
      { label: 'Color', path: '/color' },
      { label: 'Tokens', path: '/tokens' },
    ],
  },
];
