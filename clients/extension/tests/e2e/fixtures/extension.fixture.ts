/**
 * Extension Fixture for Playwright E2E Tests
 *
 * Custom Playwright fixture using test.extend():
 * - Launches chromium.launchPersistentContext() with extension loaded
 * - Derives extension ID from service worker URL
 * - Opens popup at chrome-extension://<id>/index.html
 * - Exposes: extensionPage, extensionId, context
 */

import { test as base, chromium, type BrowserContext, type Page } from '@playwright/test'
import fs from 'fs'
import http from 'http'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const extensionPath = path.resolve(__dirname, '../../../../dist')
const testDappPath = path.resolve(__dirname, 'test-dapp.html')

/**
 * Extension test fixtures
 */
export type ExtensionFixtures = {
  /** Browser context with extension loaded */
  context: BrowserContext
  /** Extension ID derived from service worker */
  extensionId: string
  /** Page for the extension popup */
  extensionPage: Page
  /** URL for the test DApp server */
  testDappUrl: string
}

/**
 * Helper to wait for window.ethereum to be injected on a page.
 */
export async function waitForProvider(
  page: Page,
  timeout = 10_000
): Promise<Page> {
  await page.waitForFunction(() => !!window.ethereum, null, { timeout })
  return page
}

/**
 * Helper to wait for window.vultisig to be injected on a page.
 */
export async function waitForVultisig(
  page: Page,
  timeout = 10_000
): Promise<Page> {
  await page.waitForFunction(() => !!window.vultisig, null, { timeout })
  return page
}

/**
 * Helper to get extension URL for a given path
 */
export function getExtensionUrl(extensionId: string, path = 'index.html'): string {
  return `chrome-extension://${extensionId}/${path}`
}

/**
 * Extended test with extension fixtures
 */
export const test = base.extend<ExtensionFixtures>({
  // Browser context with extension loaded
  // eslint-disable-next-line no-empty-pattern
  context: async ({}, use) => {
    // Create a temporary user data directory for clean state
    const userDataDir = path.join(__dirname, '..', '.test-profile-' + Date.now())

    const context = await chromium.launchPersistentContext(userDataDir, {
      headless: false,
      args: [
        `--disable-extensions-except=${extensionPath}`,
        `--load-extension=${extensionPath}`,
        '--no-first-run',
        '--no-default-browser-check',
        '--disable-default-apps',
        '--disable-popup-blocking',
      ],
    })

    await use(context)

    // Cleanup
    await context.close()

    // Try to remove temp profile
    try {
      fs.rmSync(userDataDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }
  },

  // Extension ID derived from service worker
  extensionId: async ({ context }, use) => {
    // Wait for the service worker to be registered
    let [background] = context.serviceWorkers()
    if (!background) {
      background = await context.waitForEvent('serviceworker', { timeout: 30_000 })
    }

    // Extract extension ID from the service worker URL
    // e.g. chrome-extension://abcdef1234567890/background.js
    const extensionId = background.url().split('/')[2]

    if (!extensionId) {
      throw new Error('Failed to extract extension ID from service worker URL')
    }

    await use(extensionId)
  },

  // Extension popup page
  extensionPage: async ({ context, extensionId }, use) => {
    const extensionUrl = getExtensionUrl(extensionId)
    const page = await context.newPage()
    await page.goto(extensionUrl)
    await page.waitForLoadState('domcontentloaded')

    await use(page)
  },

  // Test DApp server URL
  // eslint-disable-next-line no-empty-pattern
  testDappUrl: async ({}, use) => {
    // Read the test DApp HTML
    let html = '<!DOCTYPE html><html><body><h1>Test DApp</h1></body></html>'
    if (fs.existsSync(testDappPath)) {
      html = fs.readFileSync(testDappPath, 'utf-8')
    }

    // Create HTTP server
    const server = http.createServer((req, res) => {
      res.writeHead(200, { 'Content-Type': 'text/html' })
      res.end(html)
    })

    // Start server on random port
    await new Promise<void>((resolve) => {
      server.listen(0, '127.0.0.1', () => resolve())
    })

    const addr = server.address()
    const port = typeof addr === 'object' && addr ? addr.port : 0
    const url = `http://127.0.0.1:${port}`

    await use(url)

    // Cleanup
    server.close()
  },
})

export const expect = test.expect

/**
 * Re-export for backwards compatibility with extension-loader.ts
 */
export { test as extensionTest }
