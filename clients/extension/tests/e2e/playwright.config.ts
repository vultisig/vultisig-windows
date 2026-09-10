import { defineConfig } from '@playwright/test'
import { config } from 'dotenv'
import module from 'module'
import path from 'path'
import { fileURLToPath } from 'url'

import { extensionPath } from './extension-path'

// Playwright prefers Node's synchronous module hooks (`module.registerHooks`,
// Node >= 22.15). Under those hooks a CJS dependency that reaches an ESM-only
// package mid-graph fails to link, and the whole project dies at collection
// with `ERR_VM_MODULE_LINK_FAILURE` before a single test runs. Several
// dependencies do exactly that: @solana/web3.js -> rpc-websockets,
// @cosmjs/crypto -> @noble/hashes v2, web-push.
//
// PLAYWRIGHT_FORCE_ASYNC_LOADER is Playwright's own escape hatch: it falls back
// to the async loader, which links the graph correctly. It has to be set before
// Playwright boots, so setting it here would be too late - `yarn test:e2e` sets
// it instead, and this guard explains the fix rather than letting the run die
// with a stack trace pointing into node_modules.
// Scoped to the Playwright CLI: other tools (knip, editors) import this config
// for analysis without registering the hooks, and must not be made to fail.
const isPlaywrightRunner = /[\\/]playwright(\.js)?$/.test(process.argv[1] ?? '')

if (
  isPlaywrightRunner &&
  typeof module.registerHooks === 'function' &&
  !process.env.PLAYWRIGHT_FORCE_ASYNC_LOADER &&
  !process.env.PW_DISABLE_TS_ESM
) {
  throw new Error(
    [
      "Playwright is running with Node's synchronous module hooks, which cannot",
      'link the ESM-only packages this suite depends on. Every spec would fail to',
      'collect.',
      '',
      'Run the suite through the workspace script, which sets the flag for you:',
      '  yarn workspace @clients/extension test:e2e --project=network',
      '',
      'Or set it yourself:',
      '  PLAYWRIGHT_FORCE_ASYNC_LOADER=1 npx playwright test --config tests/e2e/playwright.config.ts',
    ].join('\n')
  )
}

// Load .env from e2e directory for test vault configuration
const currentFilename = fileURLToPath(import.meta.url)
const currentDirectory = path.dirname(currentFilename)
config({ path: path.resolve(currentDirectory, '.env') })

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
 *   2. Select `dist` (default) or `dist-station` with
 *      `VULTISIG_EXTENSION_ARTIFACT`
 *
 * Usage (always via the workspace script - it sets
 * PLAYWRIGHT_FORCE_ASYNC_LOADER, without which nothing collects):
 *   yarn workspace @clients/extension test:e2e
 *   yarn workspace @clients/extension test:e2e --project=ui-isolated
 *   yarn workspace @clients/extension test:e2e --project=network
 *   yarn workspace @clients/extension test:e2e --project=fund-dependent
 *
 * NOTE: Chrome extension testing requires headed mode (not headless).
 */

// Common launch args for extension loading
// PLAYWRIGHT_OFFSCREEN=1 pushes Chrome windows off-screen so local runs don't
// steal focus while you work. Extension tests can't run headless, so this is
// the closest equivalent. CI keeps default positioning.
const offscreenArgs =
  process.env.PLAYWRIGHT_OFFSCREEN === '1'
    ? ['--window-position=-3000,-3000', '--window-size=480,600']
    : []

const extensionLaunchArgs = [
  `--disable-extensions-except=${extensionPath}`,
  `--load-extension=${extensionPath}`,
  '--no-first-run',
  '--no-default-browser-check',
  '--disable-default-apps',
  '--disable-popup-blocking',
  ...offscreenArgs,
]

export default defineConfig({
  testDir: currentDirectory,
  testMatch: '**/*.spec.ts',

  // Global setup/teardown
  globalSetup: path.resolve(currentDirectory, 'global-setup.ts'),
  globalTeardown: path.resolve(currentDirectory, 'global-teardown.ts'),

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
  outputDir: path.resolve(currentDirectory, 'test-results'),

  use: {
    // Chrome extensions require headed Chromium
    headless: false,
    viewport: { width: 360, height: 600 }, // Extension popup dimensions
    actionTimeout: 15_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'on-first-retry',
  },

  projects: [
    {
      name: 'artifact-brand',
      testMatch: ['**/artifact-brand.spec.ts'],
      use: {
        launchOptions: {
          args: extensionLaunchArgs,
        },
      },
    },
    {
      name: 'ui-isolated',
      testMatch: [
        '**/onboarding.spec.ts',
        '**/vault-management.spec.ts',
        '**/vault-import-export.spec.ts',
        '**/transaction-history.spec.ts',
        '**/address-book.spec.ts',
        '**/passcode-lock-layering.spec.ts',
        '**/visual-regression.spec.ts',
        '**/station-migration.spec.ts',
        '**/storage-preservation.spec.ts',
        '**/search-field.spec.ts',
        '**/navigation-design.spec.ts',
        '**/viewport-fit.spec.ts',
        '**/ton-w5-toggle.spec.ts',
        '**/undecryptable-vault.spec.ts',
        '**/swap-custom-token-empty-state.spec.ts',
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
        '**/keysign-stability.spec.ts',
        '**/extension.spec.ts',
        '**/extension-ui.spec.ts',
        '**/eip6963.spec.ts',
        '**/ethereum-methods.spec.ts',
        '**/events.spec.ts',
        '**/multi-provider.spec.ts',
        '**/router.spec.ts',
        '**/push-notifications.spec.ts',
        '**/push-notifications-integration.spec.ts',
        '**/station-migration.spec.ts',
        '**/xrp-destination-tag.spec.ts',
        '**/send-coin-selection.spec.ts',
        '**/signed-transaction-decoder.spec.ts',
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
        '**/signed-transaction-decoder-live.spec.ts',
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
      // Keysign (≤180s) + inclusion (≤300s) + THORChain settlement (≤300s)
      timeout: 900_000,
      retries: process.env.CI ? 2 : 0, // More retries for network flakiness
      dependencies: ['network'],
    },
  ],

  // Reporter for CI
  reporter: [
    ['list'],
    [
      'html',
      {
        open: 'never',
        outputFolder: path.resolve(currentDirectory, 'playwright-report'),
      },
    ],
    [
      'json',
      {
        outputFile: path.resolve(currentDirectory, 'test-results/results.json'),
      },
    ],
  ],
})
