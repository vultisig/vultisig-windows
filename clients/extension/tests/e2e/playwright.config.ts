import { defineConfig, devices } from '@playwright/test'
import { config } from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load .env from e2e directory for test vault configuration
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
config({ path: path.resolve(__dirname, '.env') })

/**
 * Playwright config for VultiConnect extension E2E tests.
 *
 * 3-project structure:
 *   1. ui-isolated   — 4 workers, fully parallel, pre-seeded vaults, no network
 *   2. network       — 2 workers, vault creation + DApp tests
 *   3. fund-dependent — 1 worker, serial, real sends/swaps
 *
 * Prerequisites:
 *   1. Build the extension: `yarn build:extension`
 *   2. The built extension must be at `clients/extension/dist/`
 *
 * Usage:
 *   npx playwright test --config clients/extension/tests/e2e/playwright.config.ts
 *   npx playwright test --project=ui-isolated
 *   npx playwright test --project=network
 *   npx playwright test --project=fund-dependent
 *
 * NOTE: Chrome extension testing requires headed mode (not headless).
 */

const extensionPath = path.resolve(__dirname, '../../dist')

// Common launch args for extension loading
const extensionLaunchArgs = [
  `--disable-extensions-except=${extensionPath}`,
  `--load-extension=${extensionPath}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-default-apps',
  '--disable-popup-blocking',
]

export default defineConfig({
  testDir: __dirname,
  testMatch: '**/*.spec.ts',

  // Global setup/teardown
  globalSetup: path.resolve(__dirname, 'global-setup.ts'),
  globalTeardown: path.resolve(__dirname, 'global-teardown.ts'),

  // Default timeout
  timeout: 60_000,
  expect: {
    timeout: 10_000,
  },

  // Fail fast in CI
  forbidOnly: !!process.env.CI,

  // Retry configuration varies by project
  retries: process.env.CI ? 1 : 0,

  // Output
  outputDir: path.resolve(__dirname, 'test-results'),

  use: {
    // Chrome extensions require headed Chromium
    headless: false,
    viewport: { width: 480, height: 600 }, // Extension popup dimensions
    actionTimeout: 15_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  projects: [
    {
      name: 'ui-isolated',
      testMatch: [
        '**/onboarding.spec.ts',
        '**/vault-management.spec.ts',
        '**/vault-import-export.spec.ts',
        '**/balance-display.spec.ts',
        '**/address-book.spec.ts',
        '**/visual-regression.spec.ts',
      ],
      use: {
        launchOptions: {
          args: extensionLaunchArgs,
        },
      },
      // 4 workers, fully parallel, pre-seeded vaults, no network
      fullyParallel: true,
      retries: process.env.CI ? 1 : 0,
    },
    {
      name: 'network',
      testMatch: [
        '**/fast-vault-creation.spec.ts',
        '**/seedphrase-import.spec.ts',
        '**/dapp-provider.spec.ts',
        '**/extension.spec.ts',
        '**/extension-ui.spec.ts',
        '**/eip6963.spec.ts',
        '**/ethereum-methods.spec.ts',
        '**/events.spec.ts',
        '**/multi-provider.spec.ts',
        '**/router.spec.ts',
      ],
      use: {
        launchOptions: {
          args: extensionLaunchArgs,
        },
      },
      // 2 workers, vault creation + DApp tests
      fullyParallel: false,
      retries: process.env.CI ? 2 : 0,
      dependencies: ['ui-isolated'],
    },
    {
      name: 'fund-dependent',
      testMatch: [
        '**/send-flow.spec.ts',
        '**/swap-flow.spec.ts',
        '**/secure-vault-flows.spec.ts',
        '**/vault-operations.spec.ts',
        '**/import-export.spec.ts',
        '**/error-handling.spec.ts',
      ],
      use: {
        launchOptions: {
          args: extensionLaunchArgs,
        },
      },
      // 1 worker, serial, real sends/swaps
      fullyParallel: false,
      timeout: 120_000, // Longer timeout for real transactions
      retries: process.env.CI ? 2 : 0, // More retries for network flakiness
      dependencies: ['network'],
    },
  ],

  // Reporter for CI
  reporter: [
    ['list'],
    ['html', { open: 'never', outputFolder: path.resolve(__dirname, 'playwright-report') }],
    ['json', { outputFile: path.resolve(__dirname, 'test-results/results.json') }],
  ],
})
