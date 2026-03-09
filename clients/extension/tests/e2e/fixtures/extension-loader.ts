import { test as base, chromium, type BrowserContext } from '@playwright/test'
import path from 'path'

/**
 * Playwright fixture that launches Chromium with the VultiConnect extension loaded.
 *
 * Usage:
 *   import { test } from './fixtures/extension-loader'
 *   test('my test', async ({ context, extensionId }) => { ... })
 *
 * Prerequisites:
 *   The extension must be built to `clients/extension/dist/`.
 */

const extensionPath = path.resolve(__dirname, '../../../dist')

export const test = base.extend<{
  context: BrowserContext
  extensionId: string
}>({
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    const context = await chromium.launchPersistentContext('', {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-default-apps',
      ],
    })
    await use(context)
    await context.close()
  },

  extensionId: async ({ context }, use) => {
    // Wait for the service worker to be registered
    let [background] = context.serviceWorkers()
    if (!background) {
      background = await context.waitForEvent('serviceworker')
    }

    // Extract extension ID from the service worker URL
    // e.g. chrome-extension://abcdef1234567890/background.js
    const extensionId = background.url().split('/')[2]
    await use(extensionId)
  },
})

export const expect = test.expect
