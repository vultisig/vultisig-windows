import { beforeEach, describe, expect, it, vi } from 'vitest'

import { Chain } from '@core/chain/Chain'

// Mock external dependencies
const mockCallBackground = vi.fn()
const mockCallPopup = vi.fn()
const mockRequestAccount = vi.fn()

vi.mock('@core/inpage-provider/background', () => ({
  callBackground: (...args: unknown[]) => mockCallBackground(...args),
}))

vi.mock('@core/inpage-provider/popup', () => ({
  callPopup: (...args: unknown[]) => mockCallPopup(...args),
}))

vi.mock('@clients/extension/src/inpage/providers/core/requestAccount', () => ({
  requestAccount: (...args: unknown[]) => mockRequestAccount(...args),
}))

// Mock shared handlers
vi.mock('@clients/extension/src/inpage/providers/core/sharedHandlers', () => ({
  getSharedHandlers: vi.fn(() => ({})),
}))

// Mock icon import
vi.mock('@clients/extension/src/inpage/providers/icon', () => ({
  default: 'data:image/png;base64,mockicon',
}))

// Mock Solana account
vi.mock('@clients/extension/src/inpage/providers/solana/account', () => ({
  VultisigSolanaWalletAccount: vi.fn().mockImplementation((opts: any) => ({
    address: opts.address,
    publicKey: opts.publicKey,
    label: opts.label,
    icon: opts.icon,
  })),
}))

// Mock Solana chains
vi.mock('@clients/extension/src/inpage/providers/solana/chains', () => ({
  SolanaChains: ['solana:mainnet', 'solana:devnet'],
  isSolanaChain: vi.fn((chain: string) => chain.startsWith('solana:')),
}))

// Mock sign-in message creation
vi.mock('@clients/extension/src/inpage/providers/solana/signIn', () => ({
  createSolanaSignInMessage: vi.fn(() => 'mock-sign-in-message'),
}))

// Mock utils
vi.mock('@clients/extension/src/inpage/utils/functions', () => ({
  bytesEqual: vi.fn((a: Uint8Array, b: Uint8Array) => {
    if (a.length !== b.length) return false
    return a.every((v, i) => v === b[i])
  }),
  isVersionedTransaction: vi.fn(() => false),
}))

// Mock chain signing output
vi.mock('@core/chain/tw/signingOutput', () => ({
  deserializeSigningOutput: vi.fn(),
}))

// Mock shouldBePresent
vi.mock('@lib/utils/assert/shouldBePresent', () => ({
  shouldBePresent: vi.fn((v: unknown) => {
    if (v === null || v === undefined) throw new Error('Expected value to be present')
    return v
  }),
}))

vi.mock('@lib/utils/attempt', async () => {
  const actual = await vi.importActual<typeof import('@lib/utils/attempt')>('@lib/utils/attempt')
  return actual
})

vi.mock('@lib/utils/error/NotImplementedError', () => ({
  NotImplementedError: class NotImplementedError extends Error {
    constructor(method: string) {
      super(`Not implemented: ${method}`)
    }
  },
}))

// Mock @solana/web3.js PublicKey
vi.mock('@solana/web3.js', () => {
  class MockPublicKey {
    private _key: string
    constructor(key: string) {
      this._key = key
    }
    toBytes() {
      return new Uint8Array(Buffer.from(this._key))
    }
    toString() {
      return this._key
    }
  }
  return {
    PublicKey: MockPublicKey,
    Transaction: class {},
    VersionedTransaction: class {},
    SendOptions: {},
  }
})

// Mock @core/inpage-provider/popup/view/resolvers/sendTx/core/solana/utils
vi.mock('@core/inpage-provider/popup/view/resolvers/sendTx/core/solana/utils', () => ({
  getTransactionAuthority: vi.fn(),
}))

// Mock @core/inpage-provider/popup/view/resolvers/sendTx/interfaces
vi.mock('@core/inpage-provider/popup/view/resolvers/sendTx/interfaces', () => ({}))

// Mock bs58
vi.mock('bs58', () => ({
  default: {
    decode: vi.fn((s: string) => Buffer.from(s)),
    encode: vi.fn((b: Uint8Array) => Buffer.from(b).toString()),
  },
}))

import { Solana } from '@clients/extension/src/inpage/providers/solana'

describe('Solana Provider', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // The constructor calls #connected() which calls callBackground
    // By default, make it fail (no existing account)
    mockCallBackground.mockRejectedValue(new Error('no account'))
  })

  describe('constructor', () => {
    it('sets isPhantom to true', () => {
      const sol = new Solana('VultiConnect')
      expect(sol.isPhantom).toBe(true)
    })

    it('sets isXDEFI to true', () => {
      const sol = new Solana('VultiConnect')
      expect(sol.isXDEFI).toBe(true)
    })

    it('sets the name', () => {
      const sol = new Solana('VultiConnect')
      expect(sol.name).toBe('VultiConnect')
    })

    it('sets version to 1.0.0', () => {
      const sol = new Solana('VultiConnect')
      expect(sol.version).toBe('1.0.0')
    })

    it('starts not connected when no existing account', () => {
      const sol = new Solana('VultiConnect')
      // isConnected may be false immediately (async #connected hasn't resolved)
      expect(sol.isConnected).toBe(false)
    })

    it('starts with null publicKey when no existing account', () => {
      const sol = new Solana('VultiConnect')
      expect(sol.publicKey).toBeNull()
    })

    it('has empty accounts when no existing account', () => {
      const sol = new Solana('VultiConnect')
      expect(sol.accounts).toEqual([])
    })
  })

  describe('connect()', () => {
    it('calls requestAccount with Chain.Solana and sets publicKey', async () => {
      mockRequestAccount.mockResolvedValue({ address: 'SoLaNaAddr123' })

      const sol = new Solana('VultiConnect')
      const result = await sol.connect()

      expect(mockRequestAccount).toHaveBeenCalledWith(Chain.Solana)
      expect(sol.isConnected).toBe(true)
      expect(sol.publicKey).toBeTruthy()
      expect(result).toHaveProperty('publicKey')
    })

    it('propagates errors from requestAccount', async () => {
      mockRequestAccount.mockRejectedValue(new Error('user rejected'))

      const sol = new Solana('VultiConnect')
      await expect(sol.connect()).rejects.toThrow('user rejected')
    })
  })

  describe('disconnect()', () => {
    it('clears publicKey and sets isConnected to false', async () => {
      mockRequestAccount.mockResolvedValue({ address: 'SoLaNaAddr123' })
      mockCallBackground.mockResolvedValue(undefined)

      const sol = new Solana('VultiConnect')
      await sol.connect()

      expect(sol.isConnected).toBe(true)
      expect(sol.publicKey).toBeTruthy()

      await sol.disconnect()

      expect(sol.publicKey).toBeNull()
      expect(sol.isConnected).toBe(false)
    })

    it('calls callBackground with signOut', async () => {
      mockRequestAccount.mockResolvedValue({ address: 'SolAddr' })
      mockCallBackground.mockResolvedValue(undefined)

      const sol = new Solana('VultiConnect')
      await sol.connect()
      vi.clearAllMocks()
      mockCallBackground.mockResolvedValue(undefined)

      await sol.disconnect()

      expect(mockCallBackground).toHaveBeenCalledWith({
        signOut: {},
      })
    })
  })

  describe('signMessage()', () => {
    it('throws when not connected (no account)', async () => {
      const sol = new Solana('VultiConnect')

      const message = new Uint8Array(Buffer.from('hello'))
      await expect(sol.signMessage(message)).rejects.toThrow('not connected')
    })

    it('calls callPopup with signMessage when connected', async () => {
      mockRequestAccount.mockResolvedValue({ address: 'SolAddr' })
      mockCallBackground
        .mockRejectedValueOnce(new Error('no account')) // constructor #connected
        .mockResolvedValue(undefined)

      const sol = new Solana('VultiConnect')
      await sol.connect()

      // Mock the account property directly since VultisigSolanaWalletAccount is mocked
      ;(sol as any).account = { address: 'SolAddr', publicKey: new Uint8Array(32) }

      const hexSig = 'aabbccdd'
      mockCallPopup.mockResolvedValue(hexSig)

      const message = new Uint8Array(Buffer.from('hello'))
      const result = await sol.signMessage(message)

      expect(result).toHaveProperty('signature')
      expect(result.signature).toBeInstanceOf(Uint8Array)
      expect(mockCallPopup).toHaveBeenCalledWith({
        signMessage: {
          sign_message: {
            message: 'hello',
            chain: Chain.Solana,
          },
        },
      })
    })
  })

  describe('event system', () => {
    it('on() registers a listener and returns unsubscribe function', () => {
      const sol = new Solana('VultiConnect')
      const listener = vi.fn()

      const unsub = sol.on('change', listener)
      expect(typeof unsub).toBe('function')
    })

    it('off() removes a listener', () => {
      const sol = new Solana('VultiConnect')
      const listener = vi.fn()

      sol.on('change', listener)
      sol.off('change', listener)
      // No direct way to test without triggering, but the listener array should be filtered
    })
  })

  describe('features', () => {
    it('exposes standard wallet features', () => {
      const sol = new Solana('VultiConnect')
      const features = sol.features

      expect(features).toHaveProperty('standard:connect')
      expect(features).toHaveProperty('standard:disconnect')
      expect(features).toHaveProperty('standard:events')
      expect(features).toHaveProperty('solana:signAndSendTransaction')
      expect(features).toHaveProperty('solana:signTransaction')
      expect(features).toHaveProperty('solana:signMessage')
      expect(features).toHaveProperty('solana:signIn')
    })

    it('each feature has version 1.0.0', () => {
      const sol = new Solana('VultiConnect')
      const features = sol.features

      for (const feature of Object.values(features)) {
        expect((feature as any).version).toBe('1.0.0')
      }
    })
  })

  describe('handleNotification()', () => {
    it('rejects with code -32603', async () => {
      const sol = new Solana('VultiConnect')
      await expect(sol.handleNotification()).rejects.toEqual({
        code: -32603,
        message: 'This function is not supported by Vultisig',
      })
    })
  })

  describe('chains', () => {
    it('exposes frozen Solana chains', () => {
      const sol = new Solana('VultiConnect')
      expect(sol.chains).toBeDefined()
      expect(Array.isArray(sol.chains)).toBe(true)
      expect(Object.isFrozen(sol.chains)).toBe(true)
    })
  })
})
