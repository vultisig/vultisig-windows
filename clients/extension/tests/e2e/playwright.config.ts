import { defineConfig } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'

/**
 * Playwright config for VultiConnect extension E2E tests.
 *
 * Prerequisites:
 *   1. Build the extension: `yarn build:extension`
 *   2. The built extension must be at `clients/extension/dist/`
 *
 * Usage:
 *   npx playwright test --config clients/extension/tests/e2e/playwright.config.ts
 *
 * NOTE: Chrome extension testing requires headed mode (not headless).
 * The extension is loaded via --load-extension flag.
 */

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const extensionPath = path.resolve(__dirname, '../../dist')

export default defineConfig({
  testDir: __dirname,
  testMatch: '**/*.spec.ts',
  timeout: 60_000,
  retries: 0,
  workers: 1, // Extensions can conflict if loaded in parallel

  use: {
    // Chrome extensions require headed Chromium
    headless: false,
    viewport: { width: 1280, height: 720 },
    actionTimeout: 15_000,
  },

  projects: [
    {
      name: 'chromium-extension',
      use: {
        // Launch Chromium with the extension loaded
        launchOptions: {
          args: [
            `--disable-extensions-except=${extensionPath}`,
            `--load-extension=${extensionPath}`,
            '--no-first-run',
            '--no-default-browser-check',
            '--disable-default-apps',
          ],
        },
      },
    },
  ],

  // Reporter for CI
  reporter: [['list'], ['html', { open: 'never' }]],
})
