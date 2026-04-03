export interface Product {
  id: string;
  name: string;
  description: string;
  path: string;
  port: number;
}

export type ProductRoute = 'mail' | 'drive' | 'calendar' | 'accounts';

export const PRODUCTS: Record<ProductRoute, Product> = {
  mail: {
    id: 'mail',
    name: 'Haseen Mail',
    description: 'Private, end-to-end encrypted email',
    path: '/mail',
    port: 3001,
  },
  drive: {
    id: 'drive',
    name: 'Haseen Drive',
    description: 'Encrypted cloud storage',
    path: '/drive',
    port: 3002,
  },
  calendar: {
    id: 'calendar',
    name: 'Haseen Calendar',
    description: 'Private calendar',
    path: '/calendar',
    port: 3004,
  },
  accounts: {
    id: 'accounts',
    name: 'Haseen Accounts',
    description: 'Account settings and security',
    path: '/accounts',
    port: 3003,
  },
};
