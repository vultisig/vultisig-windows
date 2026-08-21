import { installEip1193Delegates } from '@clients/extension/src/inpage/utils/eip1193Delegates'
import EventEmitter from 'events'
import { describe, expect, it, vi } from 'vitest'

const delegatedMethods = [
  'request',
  'on',
  'removeListener',
  'isConnected',
] as const

class FakeEvmProvider extends EventEmitter {
  connected = false
  handled: string[] = []

  isConnected() {
    return this.connected
  }

  async request({ method }: { method: string }) {
    // Relies on `this`, so an unbound delegate would throw here
    this.handled.push(method)
    return `result:${method}`
  }
}

const setup = () => {
  const evmProvider = new FakeEvmProvider()
  const container = {
    ethereum: evmProvider,
    solana: { isSolana: true },
    xrpl: { isXrpl: true },
    getVaults: async () => [],
  }
  installEip1193Delegates({ container, evmProvider })
  return { container, evmProvider }
}

describe('installEip1193Delegates', () => {
  it('forwards request to the EVM provider with a bound this', async () => {
    const { container, evmProvider } = setup()

    const request = Reflect.get(container, 'request')
    await expect(request({ method: 'eth_chainId' })).resolves.toBe(
      'result:eth_chainId'
    )
    expect(evmProvider.handled).toEqual(['eth_chainId'])
  })

  it('reflects the provider connection state through isConnected', () => {
    const { container, evmProvider } = setup()

    const isConnected = Reflect.get(container, 'isConnected')
    expect(isConnected()).toBe(false)
    evmProvider.connected = true
    expect(isConnected()).toBe(true)
  })

  it('wires on/removeListener to the provider event emitter', () => {
    const { container, evmProvider } = setup()
    const listener = vi.fn()

    Reflect.get(container, 'on')('accountsChanged', listener)
    evmProvider.emit('accountsChanged', ['0xabc'])
    expect(listener).toHaveBeenCalledWith(['0xabc'])

    Reflect.get(container, 'removeListener')('accountsChanged', listener)
    evmProvider.emit('accountsChanged', [])
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('keeps the delegates out of key enumeration and spreads', () => {
    const { container } = setup()
    const expectedKeys = ['ethereum', 'solana', 'xrpl', 'getVaults']

    expect(Object.keys(container)).toEqual(expectedKeys)
    expect(Object.keys({ ...container })).toEqual(expectedKeys)
  })

  it('remains feature-detectable by direct property access', () => {
    const { container } = setup()

    for (const method of delegatedMethods) {
      expect(typeof Reflect.get(container, method)).toBe('function')
    }
  })

  it('defines the delegates as non-writable and non-configurable', () => {
    const { container } = setup()

    for (const method of delegatedMethods) {
      expect(Object.getOwnPropertyDescriptor(container, method)).toMatchObject({
        enumerable: false,
        writable: false,
        configurable: false,
      })
    }
  })

  it('leaves existing container members untouched', () => {
    const { container, evmProvider } = setup()

    expect(container.ethereum).toBe(evmProvider)
    expect(container.solana).toEqual({ isSolana: true })
    expect(container.xrpl).toEqual({ isXrpl: true })
  })
})
