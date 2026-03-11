import EventEmitter from 'events'
import { describe, expect, it, vi } from 'vitest'

import { BaseCosmosChain } from '@clients/extension/src/inpage/providers/baseCosmos'

// Create a concrete implementation for testing the abstract class
class TestCosmosChain extends BaseCosmosChain {
  constructor(chainId: string) {
    super(chainId)
  }
}

describe('BaseCosmosChain', () => {
  describe('constructor', () => {
    it('sets chainId correctly', () => {
      const chain = new TestCosmosChain('cosmoshub-4')
      expect(chain.chainId).toBe('cosmoshub-4')
    })

    it('works with different chainId values', () => {
      const osmosis = new TestCosmosChain('osmosis-1')
      const terra = new TestCosmosChain('phoenix-1')
      const akash = new TestCosmosChain('akashnet-2')

      expect(osmosis.chainId).toBe('osmosis-1')
      expect(terra.chainId).toBe('phoenix-1')
      expect(akash.chainId).toBe('akashnet-2')
    })

    it('accepts empty chainId', () => {
      const chain = new TestCosmosChain('')
      expect(chain.chainId).toBe('')
    })
  })

  describe('isVultiConnect', () => {
    it('is true by default', () => {
      const chain = new TestCosmosChain('cosmoshub-4')
      expect(chain.isVultiConnect).toBe(true)
    })

    it('is true for all instances', () => {
      const chain1 = new TestCosmosChain('osmosis-1')
      const chain2 = new TestCosmosChain('akashnet-2')
      expect(chain1.isVultiConnect).toBe(true)
      expect(chain2.isVultiConnect).toBe(true)
    })
  })

  describe('EventEmitter', () => {
    it('extends EventEmitter', () => {
      const chain = new TestCosmosChain('cosmoshub-4')
      expect(chain).toBeInstanceOf(EventEmitter)
    })

    it('can emit and listen to events', () => {
      const chain = new TestCosmosChain('cosmoshub-4')
      const listener = vi.fn()

      chain.on('accountsChanged', listener)
      chain.emit('accountsChanged', ['cosmos1abc...'])

      expect(listener).toHaveBeenCalledWith(['cosmos1abc...'])
    })

    it('can register multiple listeners', () => {
      const chain = new TestCosmosChain('cosmoshub-4')
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      chain.on('chainChanged', listener1)
      chain.on('chainChanged', listener2)
      chain.emit('chainChanged', 'new-chain-id')

      expect(listener1).toHaveBeenCalledWith('new-chain-id')
      expect(listener2).toHaveBeenCalledWith('new-chain-id')
    })

    it('can remove listeners', () => {
      const chain = new TestCosmosChain('cosmoshub-4')
      const listener = vi.fn()

      chain.on('disconnect', listener)
      chain.off('disconnect', listener)
      chain.emit('disconnect')

      expect(listener).not.toHaveBeenCalled()
    })

    it('supports once listeners', () => {
      const chain = new TestCosmosChain('cosmoshub-4')
      const listener = vi.fn()

      chain.once('connect', listener)
      chain.emit('connect', { chainId: 'cosmoshub-4' })
      chain.emit('connect', { chainId: 'cosmoshub-4' })

      expect(listener).toHaveBeenCalledTimes(1)
    })
  })

  describe('property mutability', () => {
    it('allows chainId to be modified after construction', () => {
      const chain = new TestCosmosChain('cosmoshub-4')
      chain.chainId = 'osmosis-1'
      expect(chain.chainId).toBe('osmosis-1')
    })

    it('allows isVultiConnect to be modified', () => {
      const chain = new TestCosmosChain('cosmoshub-4')
      chain.isVultiConnect = false
      expect(chain.isVultiConnect).toBe(false)
    })
  })
})
