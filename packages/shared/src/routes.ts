export const ROUTES = {
  home: '/',
  login: '/login',
  register: '/register',
  mail: {
    inbox: '/mail',
    compose: '/mail/compose',
    message: (id: string) => `/mail/${id}`,
  },
  drive: {
    root: '/drive',
    folder: (id: string) => `/drive/folder/${id}`,
    file: (id: string) => `/drive/file/${id}`,
  },
  accounts: {
    settings: '/accounts',
    security: '/accounts/security',
    keys: '/accounts/keys',
  },
} as const;
