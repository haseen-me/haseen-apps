import { defineConfig, type UserConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { APP_CONFIG, type AppName } from './app';

export function createViteConfig(appName: AppName, overrides: Partial<UserConfig> = {}): UserConfig {
  const config = APP_CONFIG[appName];

  return defineConfig({
    plugins: [react()],
    resolve: {
      alias: {
        '@': resolve(process.cwd(), 'src'),
      },
    },
    server: {
      port: config.port,
      proxy: {
        '/api': {
          target: 'http://localhost:8080',
          changeOrigin: true,
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: false,
    },
    ...overrides,
  }) as UserConfig;
}
