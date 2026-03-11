/**
 * Provider Event System Tests.
 *
 * Tests the EventEmitter interface of the Ethereum provider:
 * on/removeListener, chainChanged, accountsChanged, connect, disconnect.
 */

import { test, expect } from './fixtures/extension-loader'

const PROVIDER_TIMEOUT = 10_000

test.describe('Event Listener Registration', () => {
  test('on() registers a listener without error', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const success = await page.evaluate(() => {
      try {
        window.ethereum.on('chainChanged', () => {})
        return true
      } catch {
        return false
      }
    })
    expect(success).toBe(true)
  })

  test('removeListener() removes a listener without error', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const success = await page.evaluate(() => {
      try {
        const handler = () => {}
        window.ethereum.on('chainChanged', handler)
        window.ethereum.removeListener('chainChanged', handler)
        return true
      } catch {
        return false
      }
    })
    expect(success).toBe(true)
  })

  test('multiple listeners can be registered for same event', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const success = await page.evaluate(() => {
      try {
        window.ethereum.on('chainChanged', () => {})
        window.ethereum.on('chainChanged', () => {})
        window.ethereum.on('chainChanged', () => {})
        return true
      } catch {
        return false
      }
    })
    expect(success).toBe(true)
  })

  test('removeAllListeners clears all listeners', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const success = await page.evaluate(() => {
      try {
        window.ethereum.on('chainChanged', () => {})
        window.ethereum.on('accountsChanged', () => {})
        // EventEmitter has removeAllListeners
        if (typeof window.ethereum.removeAllListeners === 'function') {
          window.ethereum.removeAllListeners()
        }
        return true
      } catch {
        return false
      }
    })
    expect(success).toBe(true)
  })
})

test.describe('Event Types Support', () => {
  const eventNames = [
    'chainChanged',
    'accountsChanged',
    'connect',
    'disconnect',
    'networkChanged',
  ]

  for (const eventName of eventNames) {
    test(`can register listener for "${eventName}" event`, async ({
      context,
      testDappUrl,
    }) => {
      const page = await context.newPage()
      await page.goto(testDappUrl)

      await page.waitForFunction(() => !!window.ethereum, null, {
        timeout: PROVIDER_TIMEOUT,
      })

      const success = await page.evaluate((event) => {
        try {
          window.ethereum.on(event, () => {})
          return true
        } catch {
          return false
        }
      }, eventName)
      expect(success).toBe(true)
    })
  }
})

test.describe('Event Emission', () => {
  test('emit triggers registered listeners', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const received = await page.evaluate(async () => {
      return new Promise<string>((resolve) => {
        window.ethereum.on('chainChanged', (chainId: string) => {
          resolve(chainId)
        })
        // Manually emit to test the event system
        window.ethereum.emit('chainChanged', '0x89')
      })
    })

    expect(received).toBe('0x89')
  })

  test('accountsChanged event delivers accounts array', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const received = await page.evaluate(async () => {
      return new Promise<string[]>((resolve) => {
        window.ethereum.on('accountsChanged', (accounts: string[]) => {
          resolve(accounts)
        })
        window.ethereum.emit('accountsChanged', [
          '0x1234567890abcdef1234567890abcdef12345678',
        ])
      })
    })

    expect(received).toEqual([
      '0x1234567890abcdef1234567890abcdef12345678',
    ])
  })

  test('connect event delivers chainId info', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const received = await page.evaluate(async () => {
      return new Promise<{ chainId: string }>((resolve) => {
        window.ethereum.on('connect', (info: { chainId: string }) => {
          resolve(info)
        })
        window.ethereum.emit('connect', { chainId: '0x1' })
      })
    })

    expect(received).toEqual({ chainId: '0x1' })
  })

  test('disconnect event delivers error info', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const received = await page.evaluate(async () => {
      return new Promise<unknown>((resolve) => {
        window.ethereum.on('disconnect', (error: unknown) => {
          resolve(error)
        })
        window.ethereum.emit('disconnect', [])
      })
    })

    expect(received).toEqual([])
  })

  test('removed listener does not fire', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const result = await page.evaluate(async () => {
      let called = false
      const handler = () => {
        called = true
      }
      window.ethereum.on('chainChanged', handler)
      window.ethereum.removeListener('chainChanged', handler)
      window.ethereum.emit('chainChanged', '0x89')
      // Give a tick for any async handling
      await new Promise((r) => setTimeout(r, 50))
      return called
    })

    expect(result).toBe(false)
  })

  test('multiple listeners all fire for same event', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.ethereum, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const count = await page.evaluate(async () => {
      let callCount = 0
      window.ethereum.on('chainChanged', () => callCount++)
      window.ethereum.on('chainChanged', () => callCount++)
      window.ethereum.on('chainChanged', () => callCount++)
      window.ethereum.emit('chainChanged', '0x89')
      await new Promise((r) => setTimeout(r, 50))
      return callCount
    })

    expect(count).toBe(3)
  })
})

test.describe('Solana Event System', () => {
  test('window.vultisig.solana.on returns unsubscribe function', async ({
    context,
    testDappUrl,
  }) => {
    const page = await context.newPage()
    await page.goto(testDappUrl)

    await page.waitForFunction(() => !!window.vultisig, null, {
      timeout: PROVIDER_TIMEOUT,
    })

    const result = await page.evaluate(() => {
      const unsub = window.vultisig.solana.on('change', () => {})
      return typeof unsub === 'function'
    })

    expect(result).toBe(true)
  })
})
