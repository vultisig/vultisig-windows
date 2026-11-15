import { UTXO } from '@clients/extension/src/inpage/providers/utxo'
import { callPopup } from '@core/inpage-provider/popup'
import { UtxoChain } from '@vultisig/core-chain/Chain'
import { NotImplementedError } from '@vultisig/lib-utils/error/NotImplementedError'
import EventEmitter from 'events'
import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest'

// Mock dependencies
const mockRequestAccount = vi.fn()
const mockSharedHandlers: Record<string, Mock> = {
  getAccounts: vi.fn(),
}

vi.mock('@clients/extension/src/inpage/providers/core/requestAccount', () => ({
  requestAccount: (...args: unknown[]) => mockRequestAccount(...args),
}))

vi.mock('@clients/extension/src/inpage/providers/core/sharedHandlers', () => ({
  getSharedHandlers: () => mockSharedHandlers,
}))

vi.mock('@core/inpage-provider/popup', () => ({
  callPopup: vi.fn(async () => [{ data: { signingResultV2: null } }]),
}))

vi.mock('@clients/extension/src/utils/functions', () => ({
  rebuildPsbtWithPartialSigsFromWC: vi.fn(() => new Uint8Array([1, 2, 3])),
}))

describe('UTXO', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Reset the static instances map
    UTXO.instances = new Map()
    mockRequestAccount.mockResolvedValue({
      address: 'bc1qtest123',
      publicKey: '02abcdef1234567890',
    })
    mockSharedHandlers.getAccounts.mockResolvedValue(['bc1qtest123'])
    vi.mocked(callPopup).mockResolvedValue('28' + '11'.repeat(64))
  })

  describe('constructor', () => {
    it('sets chain correctly for Bitcoin', () => {
      const utxo = new UTXO(UtxoChain.Bitcoin)
      expect(utxo.chain).toBe(UtxoChain.Bitcoin)
    })

    it('sets chain correctly for BitcoinCash', () => {
      const utxo = new UTXO(UtxoChain.BitcoinCash)
      expect(utxo.chain).toBe(UtxoChain.BitcoinCash)
    })

    it('sets chain correctly for Dogecoin', () => {
      const utxo = new UTXO(UtxoChain.Dogecoin)
      expect(utxo.chain).toBe(UtxoChain.Dogecoin)
    })

    it('sets chain correctly for Litecoin', () => {
      const utxo = new UTXO(UtxoChain.Litecoin)
      expect(utxo.chain).toBe(UtxoChain.Litecoin)
    })

    it('sets chain correctly for Zcash', () => {
      const utxo = new UTXO(UtxoChain.Zcash)
      expect(utxo.chain).toBe(UtxoChain.Zcash)
    })

    it('extends EventEmitter', () => {
      const utxo = new UTXO(UtxoChain.Bitcoin)
      expect(utxo).toBeInstanceOf(EventEmitter)
    })

    it('can emit and listen to events', () => {
      const utxo = new UTXO(UtxoChain.Bitcoin)
      const listener = vi.fn()
      utxo.on('accountsChanged', listener)
      utxo.emit('accountsChanged', ['newaddress'])
      expect(listener).toHaveBeenCalledWith(['newaddress'])
    })
  })

  describe('requestAccounts', () => {
    it('returns [address] for vultisig providerId', async () => {
      const utxo = new UTXO(UtxoChain.Bitcoin, 'vultisig')
      const accounts = await utxo.requestAccounts()
      expect(mockRequestAccount).toHaveBeenCalledWith(UtxoChain.Bitcoin)
      expect(accounts).toEqual(['bc1qtest123'])
    })

    it('returns BitcoinAccount objects for phantom-override providerId', async () => {
      const utxo = new UTXO(UtxoChain.Bitcoin, 'phantom-override')
      const accounts = await utxo.requestAccounts()
      expect(accounts).toEqual([
        {
          address: 'bc1qtest123',
          publicKey: '02abcdef1234567890',
          addressType: 'p2wpkh',
          purpose: 'payment',
        },
        {
          address: 'bc1qtest123',
          publicKey: '02abcdef1234567890',
          addressType: 'p2wpkh',
          purpose: 'ordinals',
        },
      ])
    })

    it('defaults to vultisig providerId when not specified', async () => {
      const utxo = new UTXO(UtxoChain.Bitcoin)
      const accounts = await utxo.requestAccounts()
      expect(accounts).toEqual(['bc1qtest123'])
    })
  })

  describe('request', () => {
    it('delegates to shared handler for known method', async () => {
      const utxo = new UTXO(UtxoChain.Bitcoin)
      const result = await utxo.request({ method: 'getAccounts', params: [] })
      expect(mockSharedHandlers.getAccounts).toHaveBeenCalled()
      expect(result).toEqual(['bc1qtest123'])
    })

    it('throws NotImplementedError for unknown method', async () => {
      const utxo = new UTXO(UtxoChain.Bitcoin)
      await expect(
        utxo.request({ method: 'unknownMethod', params: [] })
      ).rejects.toThrow(NotImplementedError)
    })

    it('includes method name in NotImplementedError message', async () => {
      const utxo = new UTXO(UtxoChain.Bitcoin)
      try {
        await utxo.request({ method: 'someRandomMethod', params: [] })
      } catch (error) {
        expect(error).toBeInstanceOf(NotImplementedError)
        expect((error as NotImplementedError).message).toContain(
          'someRandomMethod'
        )
      }
    })

    it('calls callback with result on success', async () => {
      const utxo = new UTXO(UtxoChain.Bitcoin)
      const callback = vi.fn()
      await utxo.request({ method: 'getAccounts', params: [] }, callback)
      expect(callback).toHaveBeenCalledWith(null, ['bc1qtest123'])
    })

    it('calls callback with error on failure', async () => {
      const utxo = new UTXO(UtxoChain.Bitcoin)
      const callback = vi.fn()
      try {
        await utxo.request({ method: 'unknownMethod', params: [] }, callback)
      } catch {
        // Expected to throw
      }
      expect(callback).toHaveBeenCalledWith(expect.any(NotImplementedError))
    })
  })

  describe('Bitcoin message signing', () => {
    const expected = Buffer.from('28' + '11'.repeat(64), 'hex').toString(
      'base64'
    )

    it('authorizes the account and returns a base64 compact signature', async () => {
      const utxo = new UTXO(UtxoChain.Bitcoin)
      await expect(utxo.signMessage('hello 🌍')).resolves.toBe(expected)
      expect(mockRequestAccount).toHaveBeenCalledWith(UtxoChain.Bitcoin)
      expect(callPopup).toHaveBeenCalledWith(
        {
          signMessage: {
            sign_message: { chain: UtxoChain.Bitcoin, message: 'hello 🌍' },
          },
        },
        { account: 'bc1qtest123' }
      )
    })

    it.each(['signMessage', 'sign_message'])(
      'supports request(%s) and its callback',
      async method => {
        const utxo = new UTXO(UtxoChain.Bitcoin)
        const callback = vi.fn()
        await expect(
          utxo.request({ method, params: ['0xdeadbeef', 'bip137'] }, callback)
        ).resolves.toBe(expected)
        expect(callback).toHaveBeenCalledWith(null, expected)
        expect(callPopup).toHaveBeenCalledWith(
          {
            signMessage: {
              sign_message: { chain: UtxoChain.Bitcoin, message: '0xdeadbeef' },
            },
          },
          { account: 'bc1qtest123' }
        )
      }
    )

    it('accepts the empty message', async () => {
      await expect(new UTXO(UtxoChain.Bitcoin).signMessage('')).resolves.toBe(
        expected
      )
    })

    it.each([
      UtxoChain.Litecoin,
      UtxoChain.BitcoinCash,
      UtxoChain.Dogecoin,
      UtxoChain.Zcash,
    ])('rejects unsupported chain %s before approval', async chain => {
      await expect(new UTXO(chain).signMessage('hello')).rejects.toThrow(
        NotImplementedError
      )
      expect(callPopup).not.toHaveBeenCalled()
      expect(mockRequestAccount).not.toHaveBeenCalled()
    })

    it.each([undefined, null, 123, {}, []])(
      'rejects a non-string message %j',
      async message => {
        await expect(
          new UTXO(UtxoChain.Bitcoin).request({
            method: 'signMessage',
            params: [message],
          })
        ).rejects.toThrow(/string message/)
        expect(callPopup).not.toHaveBeenCalled()
        expect(mockRequestAccount).not.toHaveBeenCalled()
      }
    )

    it('rejects unsupported signature schemes', async () => {
      await expect(
        new UTXO(UtxoChain.Bitcoin).request({
          method: 'signMessage',
          params: ['hello', 'bip322-simple'],
        })
      ).rejects.toThrow(NotImplementedError)
      expect(callPopup).not.toHaveBeenCalled()
      expect(mockRequestAccount).not.toHaveBeenCalled()
    })

    it('propagates user rejection to the promise and callback', async () => {
      const rejection = new Error('User rejected signing')
      vi.mocked(callPopup).mockRejectedValueOnce(rejection)
      const callback = vi.fn()
      await expect(
        new UTXO(UtxoChain.Bitcoin).request(
          { method: 'signMessage', params: ['hello'] },
          callback
        )
      ).rejects.toBe(rejection)
      expect(callback).toHaveBeenCalledWith(rejection)
    })

    it('does not sign if account authorization fails', async () => {
      mockRequestAccount.mockRejectedValueOnce(new Error('Unauthorized'))
      await expect(
        new UTXO(UtxoChain.Bitcoin).signMessage('hello')
      ).rejects.toThrow('Unauthorized')
      expect(callPopup).not.toHaveBeenCalled()
    })

    it.each(['', 'zz'.repeat(65), '11'.repeat(64), '1f' + '11'.repeat(64)])(
      'rejects a malformed signing response',
      async signature => {
        vi.mocked(callPopup).mockResolvedValueOnce(signature)
        await expect(
          new UTXO(UtxoChain.Bitcoin).signMessage('hello')
        ).rejects.toThrow(/Invalid Bitcoin message signature/)
      }
    )
  })

  describe('getInstance', () => {
    it('returns same instance for same chain', () => {
      const instance1 = UTXO.getInstance(UtxoChain.Bitcoin, 'vultisig')
      const instance2 = UTXO.getInstance(UtxoChain.Bitcoin, 'vultisig')
      expect(instance1).toBe(instance2)
    })

    it('returns different instances for different chains', () => {
      const bitcoinInstance = UTXO.getInstance(UtxoChain.Bitcoin, 'vultisig')
      const litecoinInstance = UTXO.getInstance(UtxoChain.Litecoin, 'vultisig')
      expect(bitcoinInstance).not.toBe(litecoinInstance)
    })

    it('creates new instance if not exists', () => {
      const instance = UTXO.getInstance(UtxoChain.Dogecoin, 'vultisig')
      expect(instance).toBeInstanceOf(UTXO)
      expect(instance.chain).toBe(UtxoChain.Dogecoin)
    })

    it('initializes instances map if undefined', () => {
      // accessing private static for test
      ;(UTXO as any).instances = undefined
      const instance = UTXO.getInstance(UtxoChain.Bitcoin, 'vultisig')
      expect(instance).toBeInstanceOf(UTXO)
      expect(UTXO.instances).toBeDefined()
    })
  })
})
