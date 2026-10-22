import { defineConfig, devices } from '@playwright/test';
import { env } from './tests/config/env';

export default defineConfig({
  testDir: './tests',
  testMatch: '**/*.spec.ts',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  failOnFlakyTests: !!process.env.CI,
  workers: process.env.CI ? 1 : undefined,
  timeout: 30_000,
  expect: { timeout: 7_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: env.baseUrl,
    headless: env.headless,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
  },
  projects: [
    // Inicia sesión una sola vez y guarda la sesión; los proyectos de navegador la reutilizan.
    { name: 'setup', testMatch: /.*\.setup\.ts/ },
    ...[
      { name: 'chromium', use: devices['Desktop Chrome'] },
      { name: 'firefox', use: devices['Desktop Firefox'] },
      { name: 'webkit', use: devices['Desktop Safari'] },
      { name: 'chrome', use: { ...devices['Desktop Chrome'], channel: 'chrome' } },
      { name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' } },
    ].map(({ name, use }) => ({
      name,
      use: { ...use, storageState: env.authFile },
      dependencies: ['setup'],
    })),
  ],
});
