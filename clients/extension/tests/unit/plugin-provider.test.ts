import EventEmitter from 'events'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { EIP1193Error } from '@clients/extension/src/background/handlers/errorHandler'
import { Plugin } from '@clients/extension/src/inpage/providers/plugin'
import { NotImplementedError } from '@lib/utils/error/NotImplementedError'

import {
  mockPopupResponse,
  resetBridgeMocks,
} from './mocks/bridge'

// Mock the popup module
vi.mock('@core/inpage-provider/popup', () => ({
  callPopup: vi.fn(async (call: Record<string, unknown>) => {
    const method = Object.keys(call)[0]
    if (method === 'signMessage') {
      return '0xmocksignature1234567890'
    }
    if (method === 'pluginReshare') {
      return { success: true, sessionId: 'mock-session-id' }
    }
    throw new Error(`No mock for popup method: ${method}`)
  }),
}))

// Mock the ethereum processSignature
vi.mock('@clients/extension/src/inpage/providers/ethereum', () => ({
  processSignature: vi.fn((sig: string) => `processed:${sig}`),
}))

describe('Plugin', () => {
  let plugin: Plugin

  beforeEach(() => {
    resetBridgeMocks()
    vi.clearAllMocks()
    plugin = new Plugin()
  })

  describe('constructor', () => {
    it('extends EventEmitter', () => {
      expect(plugin).toBeInstanceOf(EventEmitter)
    })

    it('can emit and listen to events', () => {
      const listener = vi.fn()
      plugin.on('test', listener)
      plugin.emit('test', 'data')
      expect(listener).toHaveBeenCalledWith('data')
    })
  })

  describe('personal_sign', () => {
    it('calls callPopup with signMessage and returns processed signature for default type', async () => {
      const result = await plugin.request({
        method: 'personal_sign',
        params: ['Hello world', '0x1234567890abcdef', 'default', undefined],
      })

      expect(result).toBe('processed:0xmocksignature1234567890')
    })

    it('succeeds with type=policy and valid pluginId', async () => {
      const result = await plugin.request({
        method: 'personal_sign',
        params: ['Hello world', '0x1234567890abcdef', 'policy', 'valid-plugin-id'],
      })

      expect(result).toBe('processed:0xmocksignature1234567890')
    })

    it('throws EIP1193Error with InvalidParams when type=policy and empty pluginId', async () => {
      await expect(
        plugin.request({
          method: 'personal_sign',
          params: ['Hello world', '0x1234567890abcdef', 'policy', ''],
        })
      ).rejects.toThrow(EIP1193Error)

      try {
        await plugin.request({
          method: 'personal_sign',
          params: ['Hello world', '0x1234567890abcdef', 'policy', ''],
        })
      } catch (error) {
        expect(error).toBeInstanceOf(EIP1193Error)
        expect((error as EIP1193Error).code).toBe(-32602) // InvalidParams code
        expect((error as EIP1193Error).message).toContain('pluginId is required')
      }
    })

    it('throws EIP1193Error with InvalidParams when type=policy and missing pluginId', async () => {
      await expect(
        plugin.request({
          method: 'personal_sign',
          params: ['Hello world', '0x1234567890abcdef', 'policy', undefined],
        })
      ).rejects.toThrow(EIP1193Error)
    })

    it('throws EIP1193Error when type=policy and pluginId is whitespace only', async () => {
      await expect(
        plugin.request({
          method: 'personal_sign',
          params: ['Hello world', '0x1234567890abcdef', 'policy', '   '],
        })
      ).rejects.toThrow(EIP1193Error)
    })
  })

  describe('reshare_sign', () => {
    it('calls callPopup with pluginReshare params', async () => {
      const params = {
        id: 'plugin-123',
        dAppSessionId: 'session-456',
        encryptionKeyHex: 'abc123hex',
      }

      const result = await plugin.request({
        method: 'reshare_sign',
        params: [params],
      })

      expect(result).toEqual({ success: true, sessionId: 'mock-session-id' })
    })
  })

  describe('unknown method', () => {
    it('throws NotImplementedError with method name in message', async () => {
      await expect(
        plugin.request({
          method: 'unknown_method',
          params: [],
        })
      ).rejects.toThrow(NotImplementedError)

      try {
        await plugin.request({
          method: 'unknown_method',
          params: [],
        })
      } catch (error) {
        expect(error).toBeInstanceOf(NotImplementedError)
        expect((error as NotImplementedError).message).toContain('unknown_method')
      }
    })

    it('throws NotImplementedError for eth_sendTransaction', async () => {
      await expect(
        plugin.request({
          method: 'eth_sendTransaction',
          params: [],
        })
      ).rejects.toThrow(NotImplementedError)
    })
  })
})
