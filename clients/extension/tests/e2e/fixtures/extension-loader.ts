import { test as base, chromium, type BrowserContext } from '@playwright/test'
import path from 'path'
import { fileURLToPath } from 'url'
import http from 'http'
import fs from 'fs'

/**
 * Playwright fixture that launches Chromium with the VultiConnect extension loaded
 * and serves the test DApp over HTTP (extensions only inject on http/https pages).
 *
 * Usage:
 *   import { test } from './fixtures/extension-loader'
 *   test('my test', async ({ context, testDappUrl }) => { ... })
 *
 * Prerequisites:
 *   The extension must be built to `clients/extension/dist/`.
 */

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const extensionPath = path.resolve(__dirname, '../../../dist')
const testDappPath = path.resolve(__dirname, 'test-dapp.html')

/**
 * Helper to wait for window.ethereum to be injected on a page.
 * Returns the page for chaining.
 */
export async function waitForProvider(
  page: import('@playwright/test').Page,
  timeout = 10_000
) {
  await page.waitForFunction(() => !!window.ethereum, null, { timeout })
  return page
}

/**
 * Helper to wait for window.vultisig to be injected on a page.
 */
export async function waitForVultisig(
  page: import('@playwright/test').Page,
  timeout = 10_000
) {
  await page.waitForFunction(() => !!window.vultisig, null, { timeout })
  return page
}

export const test = base.extend<{
  context: BrowserContext
  extensionId: string
  testDappUrl: string
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
      permissions: ['notifications'], // Grant notification permission
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

  // Serve the test DApp over HTTP so the content script can inject
  // eslint-disable-next-line no-empty-pattern
  testDappUrl: async ({}, use) => {
    const html = fs.readFileSync(testDappPath, 'utf-8')

    const server = http.createServer((req, res) => {
      // Serve the HTML for any path — useful for testing different "tabs"
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(html)
    })

    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve())
    })

    const addr = server.address()
    const port = typeof addr === 'object' && addr ? addr.port : 0
    const url = `http://127.0.0.1:${port}`

    await use(url)

    server.close()
  },
})

export const expect = test.expect
