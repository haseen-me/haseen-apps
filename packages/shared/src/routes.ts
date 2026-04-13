export const ROUTES = {
  home: '/',
  login: '/sign-in',
  register: '/sign-up',
  mail: {
    inbox: '/mail',
    compose: '/mail/compose',
    message: (id: string) => `/mail/${id}`,
  },
  console: {
    root: '/console',
    domains: '/console/domains',
    users: '/console/users',
    audit: '/console/audit',
  },
  drive: {
    root: '/drive',
    folder: (id: string) => `/drive/folder/${id}`,
    file: (id: string) => `/drive/file/${id}`,
  },
  calendar: {
    root: '/calendar',
    event: (id: string) => `/calendar/event/${id}`,
  },
  accounts: {
    settings: '/settings',
    security: '/settings/security',
    recovery: '/settings/recovery',
    keys: '/settings/keys',
  },
} as const;
