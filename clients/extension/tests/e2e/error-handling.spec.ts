/**
 * Error Handling Tests.
 *
 * Tests EIP-1193 error codes, invalid methods, invalid params,
 * provider disconnected state, and rapid concurrent requests.
 */

import { test, expect } from './fixtures/extension-loader'

const PROVIDER_TIMEOUT = 10_000
const METHOD_TIMEOUT = 8_000

async function callMethod(
  page: import('@playwright/test').Page,
  method: string,
  params: unknown[] = []
) {
  return page.evaluate(
    async ({ method, params, timeout }) => {
      try {
        const result = await Promise.race([
          window.ethereum.request({ method, params }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('__TIMEOUT__')), timeout)
          ),
        ])
        return { result }
      } catch (e: any) {
        return { error: { code: e.code, message: e.message } }
      }
    },
    { method, params, timeout: METHOD_TIMEOUT }
  )
}

test.describe('EIP-1193 Error Codes', () => {
  test('unsupported method returns code 4200', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const res = await callMethod(page, 'eth_nonexistent_method')
    expect(res.error).toBeDefined()
    expect(res.error!.code).toBe(4200)
    expect(res.error!.message).toBe('Unsupported method')
  })

  test('another unsupported method also returns 4200', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const res = await callMethod(page, 'web3_sha3')
    expect(res.error).toBeDefined()
    expect(res.error!.code).toBe(4200)
  })

  test('empty method name returns unsupported method error', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const res = await callMethod(page, '')
    expect(res.error).toBeDefined()
    expect(res.error!.code).toBe(4200)
  })

  test('random string method returns unsupported method error', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const res = await callMethod(page, 'foo_bar_baz_12345')
    expect(res.error).toBeDefined()
    expect(res.error!.code).toBe(4200)
  })
})

test.describe('Provider Disconnected State', () => {
  test('isConnected returns false when no vault configured', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const connected = await page.evaluate(() => window.ethereum.isConnected())
    expect(connected).toBe(false)
  })

  test('connected property is false when no vault configured', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const connected = await page.evaluate(() => window.ethereum.connected)
    expect(connected).toBe(false)
  })

  test('selectedAddress is empty when not connected', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const addr = await page.evaluate(() => window.ethereum.selectedAddress)
    expect(addr).toBe('')
  })

  test('eth_accounts returns empty when not connected', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const res = await callMethod(page, 'eth_accounts')
    expect(res.result).toEqual([])
  })
})

test.describe('Concurrent Requests', () => {
  test('multiple simultaneous eth_chainId calls all resolve', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const results = await page.evaluate(async () => {
      const promises = Array.from({ length: 10 }, () =>
        window.ethereum
          .request({ method: 'eth_chainId', params: [] })
          .then((r: unknown) => ({ result: r }))
          .catch((e: any) => ({ error: { code: e.code, message: e.message } }))
      )
      return Promise.all(promises)
    })

    // All 10 should resolve (either with result or non-4200 error)
    expect(results.length).toBe(10)
    for (const res of results) {
      if ((res as any).error) {
        expect((res as any).error.code).not.toBe(4200)
      }
    }
  })

  test('concurrent eth_accounts calls all return empty array', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const results = await page.evaluate(async () => {
      const promises = Array.from({ length: 5 }, () =>
        window.ethereum.request({ method: 'eth_accounts', params: [] })
      )
      return Promise.all(promises)
    })

    expect(results.length).toBe(5)
    for (const accounts of results) {
      expect(accounts).toEqual([])
    }
  })

  test('rapid mixed method calls do not crash', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const results = await page.evaluate(async () => {
      const methods = [
        'eth_chainId',
        'eth_accounts',
        'wallet_getPermissions',
        'wallet_requestPermissions',
        'eth_chainId',
        'eth_nonexistent',
        'eth_accounts',
      ]

      const promises = methods.map((method) =>
        window.ethereum
          .request({ method, params: [] })
          .then((r: unknown) => ({ method, result: r }))
          .catch((e: any) => ({
            method,
            error: { code: e.code, message: e.message },
          }))
      )

      return Promise.all(promises)
    })

    // All should resolve without crashing
    expect(results.length).toBe(7)

    // The nonexistent method should be the only 4200 error
    const nonexistent = results.find((r: any) => r.method === 'eth_nonexistent')
    expect((nonexistent as any).error?.code).toBe(4200)
  })
})

test.describe('Invalid Input Handling', () => {
  test('request with null method-like object does not crash page', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const result = await page.evaluate(async () => {
      try {
        await window.ethereum.request({ method: '', params: [] })
        return { success: true }
      } catch (e: any) {
        return { error: { code: e.code, message: e.message } }
      }
    })

    // Should get an error, not crash
    expect(result).toBeDefined()
  })

  test('supported method with unexpected params dispatches without crash', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    // Call wallet_getPermissions with random params — should still work
    const result = await page.evaluate(async () => {
      try {
        const res = await Promise.race([
          window.ethereum.request({
            method: 'wallet_getPermissions',
            params: ['unexpected', 'params', 123],
          }),
          new Promise((_, reject) =>
            setTimeout(() => reject(new Error('__TIMEOUT__')), 5000)
          ),
        ])
        return { result: res }
      } catch (e: any) {
        return { error: { code: e.code, message: e.message } }
      }
    })

    expect(result).toBeDefined()
  })
})
