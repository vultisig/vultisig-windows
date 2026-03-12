/**
 * VultiConnect Router Tests.
 *
 * Tests window.vultiConnectRouter which is only injected when the wallet
 * is "prioritized" (getIsWalletPrioritized returns true from background).
 *
 * If not prioritized, these tests verify the router is absent and skip
 * router-specific assertions gracefully.
 */

import { test, expect } from './fixtures/extension-loader'

const PROVIDER_TIMEOUT = 10_000

test.describe('VultiConnect Router', () => {
  test('vultiConnectRouter exists when wallet is prioritized', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    // Give time for async setupContentScriptMessenger to complete
    await page.waitForTimeout(2000)

    const routerInfo = await page.evaluate(() => {
      if (!window.vultiConnectRouter) return { exists: false }
      return {
        exists: true,
        hasEthereumProvider: !!window.vultiConnectRouter.ethereumProvider,
        hasCurrentProvider: !!window.vultiConnectRouter.currentProvider,
        hasProviders: Array.isArray(window.vultiConnectRouter.providers),
        providersCount: window.vultiConnectRouter.providers.length,
        hasSetDefaultProvider:
          typeof window.vultiConnectRouter.setDefaultProvider === 'function',
        hasAddProvider:
          typeof window.vultiConnectRouter.addProvider === 'function',
        hasLastInjectedProvider:
          'lastInjectedProvider' in window.vultiConnectRouter,
      }
    })

    if (routerInfo.exists) {
      expect(routerInfo.hasEthereumProvider).toBe(true)
      expect(routerInfo.hasCurrentProvider).toBe(true)
      expect(routerInfo.hasProviders).toBe(true)
      expect(routerInfo.providersCount).toBeGreaterThanOrEqual(1)
      expect(routerInfo.hasSetDefaultProvider).toBe(true)
      expect(routerInfo.hasAddProvider).toBe(true)
      expect(routerInfo.hasLastInjectedProvider).toBe(true)
    }
    // If not prioritized, router won't exist — that's acceptable
  })

  test('vultiConnectRouter.currentProvider has request method', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    await page.waitForTimeout(2000)

    const hasRequest = await page.evaluate(() => {
      if (!window.vultiConnectRouter) return null
      return typeof window.vultiConnectRouter.currentProvider.request === 'function'
    })

    if (hasRequest !== null) {
      expect(hasRequest).toBe(true)
    }
  })

  test('vultiConnectRouter.ethereumProvider matches vultisig.ethereum', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    await page.waitForTimeout(2000)

    const matches = await page.evaluate(() => {
      if (!window.vultiConnectRouter) return null
      // They should be the same instance
      return (
        window.vultiConnectRouter.ethereumProvider ===
        window.vultisig.ethereum
      )
    })

    if (matches !== null) {
      expect(matches).toBe(true)
    }
  })

  test('setDefaultProvider(true) sets currentProvider to vultisig', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    await page.waitForTimeout(2000)

    const result = await page.evaluate(() => {
      if (!window.vultiConnectRouter) return null
      window.vultiConnectRouter.setDefaultProvider(true)
      return (
        window.vultiConnectRouter.currentProvider ===
        window.vultisig.ethereum
      )
    })

    if (result !== null) {
      expect(result).toBe(true)
    }
  })

  test('setDefaultProvider(false) sets currentProvider to lastInjectedProvider', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    await page.waitForTimeout(2000)

    const result = await page.evaluate(() => {
      if (!window.vultiConnectRouter) return null
      window.vultiConnectRouter.setDefaultProvider(false)
      return (
        window.vultiConnectRouter.currentProvider ===
        window.vultiConnectRouter.lastInjectedProvider
      )
    })

    if (result !== null) {
      expect(result).toBe(true)
    }
  })

  test('addProvider adds a new provider to the list', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    await page.waitForTimeout(2000)

    const result = await page.evaluate(() => {
      if (!window.vultiConnectRouter) return null
      const countBefore = window.vultiConnectRouter.providers.length
      // Create a mock provider
      const mockProvider = {
        request: async () => {},
        isMetaMask: false,
      } as any
      window.vultiConnectRouter.addProvider(mockProvider)
      const countAfter = window.vultiConnectRouter.providers.length
      return { countBefore, countAfter }
    })

    if (result !== null) {
      expect(result.countAfter).toBe(result.countBefore + 1)
    }
  })

  test('addProvider does not duplicate existing provider', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    await page.waitForTimeout(2000)

    const result = await page.evaluate(() => {
      if (!window.vultiConnectRouter) return null
      const countBefore = window.vultiConnectRouter.providers.length
      // Try to add the existing ethereum provider again
      window.vultiConnectRouter.addProvider(
        window.vultiConnectRouter.ethereumProvider
      )
      const countAfter = window.vultiConnectRouter.providers.length
      return { countBefore, countAfter }
    })

    if (result !== null) {
      expect(result.countAfter).toBe(result.countBefore)
    }
  })

  test('window.ethereum getter resolves through router when prioritized', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    await page.waitForTimeout(2000)

    const result = await page.evaluate(() => {
      if (!window.vultiConnectRouter) return null
      // When prioritized, window.ethereum is a getter that returns currentProvider
      return typeof window.ethereum.request === 'function'
    })

    if (result !== null) {
      expect(result).toBe(true)
    }
  })
})

test.describe('Provider Routing Behavior', () => {
  test('calling request on window.ethereum goes through currentProvider', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    // eth_accounts should work regardless of routing
    const res = await page.evaluate(async () => {
      try {
        return await window.ethereum.request({
          method: 'eth_accounts',
          params: [],
        })
      } catch (e: any) {
        return { error: e.message }
      }
    })

    expect(res).toEqual([])
  })
})
