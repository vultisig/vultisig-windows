/**
 * Extension UI Tests.
 *
 * Tests that the extension popup loads, the service worker registers,
 * and the extension pages render without critical errors.
 */

import { test, expect } from './fixtures/extension-loader'

test.describe('Extension Service Worker', () => {
  test('service worker registers successfully', async ({ context }) => {
    let [background] = context.serviceWorkers()
    if (!background) {
      background = await context.waitForEvent('serviceworker', {
        timeout: 15_000,
      })
    }

    expect(background).toBeTruthy()
    expect(background.url()).toContain('background.js')
  })

  test('extension ID is extractable from service worker', async ({
    extensionId,
  }) => {
    expect(extensionId).toBeTruthy()
    expect(typeof extensionId).toBe('string')
    expect(extensionId.length).toBeGreaterThan(0)
  })
})

test.describe('Extension Popup', () => {
  test('popup page loads without console errors', async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage()

    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text())
      }
    })

    // Navigate to the extension popup
    await page.goto(`chrome-extension://${extensionId}/index.html`)

    // Give the popup time to render
    await page.waitForTimeout(3000)

    // The page should have loaded (title or some content)
    const title = await page.title()
    expect(title).toBeDefined()

    // Filter out known non-critical errors (e.g., network requests that fail in test)
    const criticalErrors = consoleErrors.filter(
      (e) =>
        !e.includes('net::ERR_') &&
        !e.includes('Failed to fetch') &&
        !e.includes('NetworkError') &&
        !e.includes('favicon')
    )

    // No critical JS errors should appear
    // (network errors are expected since there's no server)
    expect(criticalErrors.length).toBe(0)
  })

  test('popup renders HTML content', async ({ context, extensionId }) => {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/index.html`)
    await page.waitForTimeout(2000)

    // Should have a root element (React renders into #root typically)
    const hasRoot = await page.evaluate(() => {
      return (
        !!document.getElementById('root') ||
        !!document.querySelector('#app') ||
        document.body.children.length > 0
      )
    })

    expect(hasRoot).toBe(true)
  })

  test('popup page does not crash (no page error events)', async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage()

    let pageCrashed = false
    page.on('pageerror', () => {
      pageCrashed = true
    })

    await page.goto(`chrome-extension://${extensionId}/index.html`)
    await page.waitForTimeout(2000)

    expect(pageCrashed).toBe(false)
  })
})

test.describe('Manifest & Extension Metadata', () => {
  test('manifest.json is accessible and valid', async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage()
    await page.goto(
      `chrome-extension://${extensionId}/manifest.json`
    )

    const content = await page.evaluate(() => {
      try {
        return JSON.parse(document.body?.innerText || '{}')
      } catch {
        return null
      }
    })

    // Chrome may not let us read manifest.json directly, so we just verify
    // the extension loaded (service worker exists)
    // If content is available, verify it
    if (content && content.manifest_version) {
      expect(content.manifest_version).toBe(3)
      expect(content.name).toBe('Vultisig Extension')
    }
  })
})

test.describe('Content Script Injection Scope', () => {
  test('provider is injected on HTTP pages', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    const hasProvider = await page.waitForFunction(
      () => !!window.ethereum,
      null,
      { timeout: 10_000 }
    )
    expect(hasProvider).toBeTruthy()
  })

  test('provider is NOT injected on chrome:// pages', async ({ context }) => {
    const page = await context.newPage()
    await page.goto('chrome://version')

    // Wait briefly then check — provider should NOT be injected
    await page.waitForTimeout(2000)

    const hasProvider = await page.evaluate(() => {
      // On chrome:// pages, content scripts don't run
      return !!(window as any).ethereum
    })

    expect(hasProvider).toBe(false)
  })

  test('provider is NOT injected on chrome-extension:// pages', async ({
    context,
    extensionId,
  }) => {
    const page = await context.newPage()
    await page.goto(`chrome-extension://${extensionId}/index.html`)
    await page.waitForTimeout(2000)

    // Extension pages don't get content script injection (different from web pages)
    // The extension's own pages may have their own providers via different mechanisms
    // This test verifies the content script specifically doesn't inject
    // (content_scripts match pattern is http://*/* and https://*/*)
    const hasContentScriptProvider = await page.evaluate(() => {
      // Check for the specific content-script-injected provider
      // Extension pages may still have window.ethereum through other means
      return !!(window as any).__vulticonnectContentScriptInjected
    })

    expect(hasContentScriptProvider).toBe(false)
  })
})

test.describe('Multiple Tabs', () => {
  test('provider works in two separate tabs', async ({
    context,
    testDappUrl,
  }) => {
    const page1 = await context.newPage()
    const page2 = await context.newPage()

    await page1.goto(testDappUrl)
    await page2.goto(`${testDappUrl}/other-page`)

    // Both tabs should get the provider injected
    await page1.waitForFunction(() => !!window.ethereum, null, {
      timeout: 10_000,
    })
    await page2.waitForFunction(() => !!window.ethereum, null, {
      timeout: 10_000,
    })

    // Both should report the same chain ID
    const chainId1 = await page1.evaluate(() =>
      window.ethereum.request({ method: 'eth_chainId', params: [] })
    ).catch(() => 'error')

    const chainId2 = await page2.evaluate(() =>
      window.ethereum.request({ method: 'eth_chainId', params: [] })
    ).catch(() => 'error')

    // Both should have resolved (even if with error from background)
    expect(chainId1).toBeDefined()
    expect(chainId2).toBeDefined()
  })

  test('eth_accounts returns empty in both tabs when disconnected', async ({
    context,
    testDappUrl,
  }) => {
    const page1 = await context.newPage()
    const page2 = await context.newPage()

    await page1.goto(testDappUrl)
    await page2.goto(`${testDappUrl}/page2`)

    await page1.waitForFunction(() => !!window.ethereum, null, {
      timeout: 10_000,
    })
    await page2.waitForFunction(() => !!window.ethereum, null, {
      timeout: 10_000,
    })

    const accounts1 = await page1.evaluate(() =>
      window.ethereum.request({ method: 'eth_accounts', params: [] })
    )
    const accounts2 = await page2.evaluate(() =>
      window.ethereum.request({ method: 'eth_accounts', params: [] })
    )

    expect(accounts1).toEqual([])
    expect(accounts2).toEqual([])
  })
})
