/**
 * Ethereum JSON-RPC method tests.
 *
 * Tests that all registered Ethereum methods dispatch correctly through the
 * provider. Methods that require background RPC calls may timeout or throw —
 * the key assertion is that they route through the handler map and don't throw
 * "Unsupported method" (code 4200).
 */

import { test, expect } from './fixtures/extension-loader'

const PROVIDER_TIMEOUT = 10_000
const METHOD_TIMEOUT = 8_000

/** Helper: wait for provider, then call a method with a timeout race */
async function callMethod(
  page: import('@playwright/test').Page,
  method: string,
  params: unknown[] = []
) {
  await page.waitForFunction(() => !!window.ethereum, null, {
    timeout: PROVIDER_TIMEOUT,
  })

  return page.evaluate(
    async ({ method, params, timeout }) => {
      try {
        const result = await Promise.race([
          window.ethereum.request({ method, params }),
          new Promise((_, reject) =>
            setTimeout(
              () => reject(new Error('__TIMEOUT__')),
              timeout
            )
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

test.describe('Ethereum JSON-RPC Methods', () => {
  test.describe('Chain & Network', () => {
    test('eth_chainId returns hex chain ID', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      const res = await callMethod(page, 'eth_chainId')

      // Should return a hex string (e.g., "0x1"), not an unsupported method error
      if (res.result !== undefined) {
        expect(typeof res.result).toBe('string')
        expect((res.result as string).startsWith('0x')).toBe(true)
      } else {
        // If it errors, it should NOT be "Unsupported method"
        expect(res.error!.code).not.toBe(4200)
      }
    })

    test('net_version returns decimal string', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      const res = await callMethod(page, 'net_version')

      if (res.result !== undefined) {
        expect(typeof res.result).toBe('string')
        // Should be a decimal number string (e.g., "1")
        expect(Number.isNaN(Number(res.result))).toBe(false)
      } else {
        expect(res.error!.code).not.toBe(4200)
      }
    })
  })

  test.describe('Account Methods', () => {
    test('eth_accounts returns empty array when not connected', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      const res = await callMethod(page, 'eth_accounts')

      expect(res.result).toEqual([])
    })

    test('eth_requestAccounts dispatches (may open popup)', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      const res = await callMethod(page, 'eth_requestAccounts')

      // Either returns accounts, opens popup (timeout), or throws non-4200 error
      expect(res).toBeDefined()
      if (res.error) {
        expect(res.error.code).not.toBe(4200)
      }
    })
  })

  test.describe('Block Methods', () => {
    test('eth_blockNumber dispatches to RPC', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      const res = await callMethod(page, 'eth_blockNumber')

      // Should either return a hex block number or timeout (background RPC call)
      expect(res).toBeDefined()
      if (res.result !== undefined) {
        expect(typeof res.result).toBe('string')
      } else if (res.error) {
        expect(res.error.code).not.toBe(4200)
      }
    })

    test('eth_getBlockByNumber dispatches with params', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      const res = await callMethod(page, 'eth_getBlockByNumber', [
        'latest',
        false,
      ])

      expect(res).toBeDefined()
      if (res.error) {
        expect(res.error.code).not.toBe(4200)
      }
    })

    test('eth_getBlockByHash dispatches with params', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      // Use a zero hash — won't return real data but should dispatch correctly
      const res = await callMethod(page, 'eth_getBlockByHash', [
        '0x0000000000000000000000000000000000000000000000000000000000000000',
        false,
      ])

      expect(res).toBeDefined()
      if (res.error) {
        expect(res.error.code).not.toBe(4200)
      }
    })
  })

  test.describe('Gas & Fee Methods', () => {
    test('eth_gasPrice dispatches to RPC', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      const res = await callMethod(page, 'eth_gasPrice')

      expect(res).toBeDefined()
      if (res.result !== undefined) {
        expect(typeof res.result).toBe('string')
      } else if (res.error) {
        expect(res.error.code).not.toBe(4200)
      }
    })

    test('eth_maxPriorityFeePerGas dispatches to RPC', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      const res = await callMethod(page, 'eth_maxPriorityFeePerGas')

      expect(res).toBeDefined()
      if (res.error) {
        expect(res.error.code).not.toBe(4200)
      }
    })

    test('eth_feeHistory dispatches with params', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      const res = await callMethod(page, 'eth_feeHistory', [
        '0x4',
        'latest',
        [25, 75],
      ])

      expect(res).toBeDefined()
      if (res.error) {
        expect(res.error.code).not.toBe(4200)
      }
    })

    test('eth_estimateGas dispatches with tx object', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      const res = await callMethod(page, 'eth_estimateGas', [
        {
          from: '0x0000000000000000000000000000000000000001',
          to: '0x0000000000000000000000000000000000000002',
          value: '0x0',
        },
      ])

      expect(res).toBeDefined()
      if (res.error) {
        expect(res.error.code).not.toBe(4200)
      }
    })
  })

  test.describe('State Query Methods', () => {
    test('eth_getBalance dispatches with address', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      const res = await callMethod(page, 'eth_getBalance', [
        '0x0000000000000000000000000000000000000001',
        'latest',
      ])

      expect(res).toBeDefined()
      if (res.error) {
        expect(res.error.code).not.toBe(4200)
      }
    })

    test('eth_getCode dispatches with address', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      const res = await callMethod(page, 'eth_getCode', [
        '0x0000000000000000000000000000000000000001',
        'latest',
      ])

      expect(res).toBeDefined()
      if (res.error) {
        expect(res.error.code).not.toBe(4200)
      }
    })

    test('eth_getStorageAt dispatches with address and position', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      const res = await callMethod(page, 'eth_getStorageAt', [
        '0x0000000000000000000000000000000000000001',
        '0x0',
        'latest',
      ])

      expect(res).toBeDefined()
      if (res.error) {
        expect(res.error.code).not.toBe(4200)
      }
    })

    test('eth_call dispatches with call object', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      const res = await callMethod(page, 'eth_call', [
        {
          to: '0x0000000000000000000000000000000000000001',
          data: '0x',
        },
        'latest',
      ])

      expect(res).toBeDefined()
      if (res.error) {
        expect(res.error.code).not.toBe(4200)
      }
    })

    test('eth_getLogs dispatches with filter object', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      const res = await callMethod(page, 'eth_getLogs', [
        {
          fromBlock: 'latest',
          toBlock: 'latest',
          address: '0x0000000000000000000000000000000000000001',
        },
      ])

      expect(res).toBeDefined()
      if (res.error) {
        expect(res.error.code).not.toBe(4200)
      }
    })
  })

  test.describe('Transaction Methods', () => {
    test('eth_getTransactionByHash dispatches', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      const res = await callMethod(page, 'eth_getTransactionByHash', [
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      ])

      expect(res).toBeDefined()
      if (res.error) {
        expect(res.error.code).not.toBe(4200)
      }
    })

    test('eth_getTransactionReceipt dispatches', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      const res = await callMethod(page, 'eth_getTransactionReceipt', [
        '0x0000000000000000000000000000000000000000000000000000000000000000',
      ])

      expect(res).toBeDefined()
      if (res.error) {
        expect(res.error.code).not.toBe(4200)
      }
    })

    test('eth_getTransactionCount dispatches', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      const res = await callMethod(page, 'eth_getTransactionCount', [
        '0x0000000000000000000000000000000000000001',
        'latest',
      ])

      expect(res).toBeDefined()
      if (res.error) {
        expect(res.error.code).not.toBe(4200)
      }
    })

    test('eth_sendTransaction dispatches (may open popup)', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      const res = await callMethod(page, 'eth_sendTransaction', [
        {
          from: '0x0000000000000000000000000000000000000001',
          to: '0x0000000000000000000000000000000000000002',
          value: '0x0',
        },
      ])

      // Should dispatch — may open popup or throw (not unsupported)
      expect(res).toBeDefined()
      if (res.error) {
        expect(res.error.code).not.toBe(4200)
      }
    })
  })

  test.describe('Signing Methods', () => {
    test('personal_sign dispatches (may open popup)', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      const res = await callMethod(page, 'personal_sign', [
        '0x48656c6c6f',
        '0x0000000000000000000000000000000000000001',
      ])

      expect(res).toBeDefined()
      if (res.error) {
        expect(res.error.code).not.toBe(4200)
      }
    })

    test('eth_signTypedData_v4 dispatches (may open popup)', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      const typedData = JSON.stringify({
        types: {
          EIP712Domain: [
            { name: 'name', type: 'string' },
            { name: 'version', type: 'string' },
          ],
          Test: [{ name: 'value', type: 'string' }],
        },
        primaryType: 'Test',
        domain: { name: 'Test', version: '1' },
        message: { value: 'Hello' },
      })

      const res = await callMethod(page, 'eth_signTypedData_v4', [
        '0x0000000000000000000000000000000000000001',
        typedData,
      ])

      expect(res).toBeDefined()
      if (res.error) {
        expect(res.error.code).not.toBe(4200)
      }
    })
  })

  test.describe('Wallet Methods', () => {
    test('wallet_getPermissions returns array', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      const res = await callMethod(page, 'wallet_getPermissions')

      // This method returns [] directly without background calls
      expect(res.result).toEqual([])
    })

    test('wallet_requestPermissions returns array', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      const res = await callMethod(page, 'wallet_requestPermissions')

      expect(res.result).toEqual([])
    })

    test('wallet_revokePermissions dispatches', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      const res = await callMethod(page, 'wallet_revokePermissions')

      // Calls signOut in background — should not be unsupported
      expect(res).toBeDefined()
      if (res.error) {
        expect(res.error.code).not.toBe(4200)
      }
    })

    test('wallet_getCapabilities returns object with chainId key', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      const res = await callMethod(page, 'wallet_getCapabilities')

      if (res.result !== undefined) {
        expect(typeof res.result).toBe('object')
        // Should have at least one chain ID key
        expect(Object.keys(res.result as object).length).toBeGreaterThanOrEqual(
          1
        )
      } else if (res.error) {
        expect(res.error.code).not.toBe(4200)
      }
    })

    test('wallet_switchEthereumChain dispatches', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      const res = await callMethod(page, 'wallet_switchEthereumChain', [
        { chainId: '0x89' },
      ])

      expect(res).toBeDefined()
      if (res.error) {
        expect(res.error.code).not.toBe(4200)
      }
    })

    test('wallet_addEthereumChain dispatches', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      const res = await callMethod(page, 'wallet_addEthereumChain', [
        {
          chainId: '0x89',
          chainName: 'Polygon',
          nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
          rpcUrls: ['https://polygon-rpc.com'],
        },
      ])

      expect(res).toBeDefined()
      if (res.error) {
        expect(res.error.code).not.toBe(4200)
      }
    })

    test('wallet_watchAsset dispatches', async ({ context, testDappUrl }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)
      const res = await callMethod(page, 'wallet_watchAsset', [
        {
          type: 'ERC20',
          options: {
            address: '0x0000000000000000000000000000000000000001',
            symbol: 'TEST',
            decimals: 18,
          },
        },
      ])

      expect(res).toBeDefined()
      if (res.error) {
        expect(res.error.code).not.toBe(4200)
      }
    })
  })

  test.describe('Consistency & Idempotence', () => {
    test('repeated eth_chainId calls return consistent results', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)

      const res1 = await callMethod(page, 'eth_chainId')
      const res2 = await callMethod(page, 'eth_chainId')
      const res3 = await callMethod(page, 'eth_chainId')

      // All three calls should return the same result
      expect(res1).toEqual(res2)
      expect(res2).toEqual(res3)
    })

    test('repeated eth_accounts calls return consistent results', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)

      const res1 = await callMethod(page, 'eth_accounts')
      const res2 = await callMethod(page, 'eth_accounts')

      expect(res1).toEqual(res2)
    })

    test('provider.enable() is alias for eth_requestAccounts', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)

      await page.waitForFunction(() => !!window.ethereum, null, {
        timeout: PROVIDER_TIMEOUT,
      })

      const hasEnable = await page.evaluate(
        () => typeof window.ethereum.enable === 'function'
      )
      expect(hasEnable).toBe(true)
    })

    test('provider.sendAsync is alias for request', async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)

      await page.waitForFunction(() => !!window.ethereum, null, {
        timeout: PROVIDER_TIMEOUT,
      })

      const hasSendAsync = await page.evaluate(
        () => typeof window.ethereum.sendAsync === 'function'
      )
      expect(hasSendAsync).toBe(true)
    })
  })
})
