export type AppName = 'web' | 'mail' | 'drive' | 'accounts' | 'calendar';

export const APP_CONFIG: Record<AppName, { port: number; title: string }> = {
  web: { port: 3000, title: 'Haseen' },
  mail: { port: 3001, title: 'Haseen Mail' },
  drive: { port: 3002, title: 'Haseen Drive' },
  accounts: { port: 3003, title: 'Haseen Accounts' },
  calendar: { port: 3004, title: 'Haseen Calendar' },
};
