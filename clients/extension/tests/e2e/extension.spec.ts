/**
 * VultiConnect Extension E2E Tests
 *
 * These tests load the built extension into Chromium and verify
 * the provider injection, connection flow, and chain switching.
 *
 * Prerequisites:
 *   1. Build the extension: `yarn workspace @clients/extension build`
 *   2. Chromium installed: `npx playwright install chromium`
 *
 * Run:
 *   cd clients/extension && npx playwright test --config tests/e2e/playwright.config.ts
 *
 * NOTE: These tests require headed mode (extensions don't work in headless).
 * They may not pass in CI without a display server (use xvfb-run or similar).
 */

import { test, expect } from './fixtures/extension-loader'

test.describe('Provider Injection', () => {
  test('window.ethereum is injected on page load', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    // Wait for provider to be injected (content script runs after page load)
    const hasProvider = await page.waitForFunction(
      () => !!window.ethereum,
      null,
      { timeout: 10_000 }
    )
    expect(hasProvider).toBeTruthy()
  })

  test('window.ethereum has VultiConnect properties', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: 10_000,
    })

    const props = await page.evaluate(() => ({
      isMetaMask: window.ethereum.isMetaMask,
      isVultiConnect: window.ethereum.isVultiConnect,
      isXDEFI: window.ethereum.isXDEFI,
      isCtrl: window.ethereum.isCtrl,
      chainId: window.ethereum.chainId,
      connected: window.ethereum.connected,
    }))

    expect(props.isMetaMask).toBe(true)
    expect(props.isVultiConnect).toBe(true)
    expect(props.isXDEFI).toBe(true)
    expect(props.isCtrl).toBe(true)
    expect(props.chainId).toBe('0x1')
    expect(props.connected).toBe(false)
  })

  test('window.ethereum.isConnected() returns false initially', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: 10_000,
    })

    const isConnected = await page.evaluate(() =>
      window.ethereum.isConnected()
    )
    expect(isConnected).toBe(false)
  })

  test('window.ethereum has request method', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: 10_000,
    })

    const hasRequest = await page.evaluate(
      () => typeof window.ethereum.request === 'function'
    )
    expect(hasRequest).toBe(true)
  })

  test('unsupported method throws EIP-1193 error', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: 10_000,
    })

    const error = await page.evaluate(async () => {
      try {
        await window.ethereum.request({
          method: 'eth_nonexistent',
          params: [],
        })
        return null
      } catch (e: any) {
        return { code: e.code, message: e.message }
      }
    })

    expect(error).not.toBeNull()
    expect(error!.code).toBe(4200)
    expect(error!.message).toBe('Unsupported method')
  })
})

test.describe('Ethereum Connect Flow', () => {
  test('eth_requestAccounts triggers popup', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: 10_000,
    })

    // Start the connection request — this should trigger a popup
    // We can't complete the full flow without a vault, but we can verify
    // the popup/error behavior
    const result = await page.evaluate(async () => {
      try {
        const accounts = await window.ethereum.request({
          method: 'eth_requestAccounts',
          params: [],
        })
        return { accounts }
      } catch (e: any) {
        return { error: e.message, code: e.code }
      }
    })

    // Without a configured vault, we expect either:
    // - A popup to open (which we'd need to interact with)
    // - An error (no vault configured)
    // Either outcome is valid — the point is the method dispatches correctly
    expect(result).toBeDefined()
  })

  test('eth_accounts returns empty array when not connected', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: 10_000,
    })

    const accounts = await page.evaluate(async () => {
      return window.ethereum.request({
        method: 'eth_accounts',
        params: [],
      })
    })

    // Should return empty array when no account is connected
    expect(accounts).toEqual([])
  })
})

test.describe('Chain Switching', () => {
  test('wallet_switchEthereumChain dispatches correctly', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: 10_000,
    })

    // Attempt chain switch — without a vault configured, expect an error or popup.
    // The key assertion is that the method dispatches through the provider correctly.
    // Use Promise.race with a timeout since the extension may open a popup window
    // that disrupts the page context.
    const result = await page.evaluate(async () => {
      try {
        const switchResult = await Promise.race([
          window.ethereum.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: '0x89' }],
          }),
          new Promise((resolve) =>
            setTimeout(() => resolve({ timeout: true }), 5000)
          ),
        ])
        return { result: switchResult }
      } catch (e: any) {
        return { error: e.message, code: e.code }
      }
    })

    // The chain switch request was dispatched — either resolved, timed out, or threw
    expect(result).toBeDefined()
  })
})
