import { EIP1193Error } from '@clients/extension/src/background/handlers/errorHandler'
import { PopupError } from '@core/inpage-provider/popup/error'
import { beforeEach, describe, expect, it, vi } from 'vitest'

// Mock all external dependencies before importing the Ethereum provider
vi.mock('@core/inpage-provider/background', () => ({
  callBackground: vi.fn(),
}))

vi.mock('@core/inpage-provider/popup', () => ({
  callPopup: vi.fn(),
}))

vi.mock('@core/inpage-provider/background/events/inpage', () => ({
  addBackgroundEventListener: vi.fn(),
}))

vi.mock('@vultisig/lib-utils/validation/url', () => ({
  validateUrl: vi.fn(() => undefined), // returns undefined = valid URL
}))

// Mock the handlers module with simple vi.fn() — no external variable references
vi.mock('@clients/extension/src/inpage/providers/ethereum/handlers', () => ({
  ethereumHandlers: {
    eth_chainId: vi.fn(),
    eth_accounts: vi.fn(),
    eth_requestAccounts: vi.fn(),
    eth_sendTransaction: vi.fn(),
    eth_signTypedData_v4: vi.fn(),
    personal_sign: vi.fn(),
    wallet_watchAsset: vi.fn(),
  },
  processSignature: vi.fn((sig: string) => sig),
}))

// Now import the class under test and the mocked handlers
import { ethereumHandlers } from '@clients/extension/src/inpage/providers/ethereum/handlers'
import { Ethereum } from '@clients/extension/src/inpage/providers/ethereum/index'

const mockedHandlers = ethereumHandlers as unknown as {
  eth_chainId: ReturnType<typeof vi.fn>
  eth_accounts: ReturnType<typeof vi.fn>
  eth_requestAccounts: ReturnType<typeof vi.fn>
  eth_sendTransaction: ReturnType<typeof vi.fn>
  eth_signTypedData_v4: ReturnType<typeof vi.fn>
  personal_sign: ReturnType<typeof vi.fn>
  wallet_watchAsset: ReturnType<typeof vi.fn>
}

describe('Ethereum Provider', () => {
  beforeEach(() => {
    // Reset singleton between tests
    Ethereum.instance = null
    ;(globalThis as any).window = {
      ...(globalThis as any).window,
      ctrlEthProviders: undefined,
      isCtrl: undefined,
      location: {
        href: 'https://example.com/',
        origin: 'https://example.com',
        pathname: '/',
      },
    }
    vi.clearAllMocks()
  })

  describe('constructor defaults', () => {
    it('sets chainId to 0x1', () => {
      const eth = new Ethereum()
      expect(eth.chainId).toBe('0x1')
    })

    it('sets connected to false', () => {
      const eth = new Ethereum()
      expect(eth.connected).toBe(false)
    })

    it('sets isMetaMask to true', () => {
      const eth = new Ethereum()
      expect(eth.isMetaMask).toBe(true)
    })

    it('sets isVultiConnect to true', () => {
      const eth = new Ethereum()
      expect(eth.isVultiConnect).toBe(true)
    })

    it('sets isXDEFI to true', () => {
      const eth = new Ethereum()
      expect(eth.isXDEFI).toBe(true)
    })

    it('sets isCtrl to true', () => {
      const eth = new Ethereum()
      expect(eth.isCtrl).toBe(true)
    })

    it('sets networkVersion to "1"', () => {
      const eth = new Ethereum()
      expect(eth.networkVersion).toBe('1')
    })

    it('sets selectedAddress to empty string', () => {
      const eth = new Ethereum()
      expect(eth.selectedAddress).toBe('')
    })

    it('aliases sendAsync to request', () => {
      const eth = new Ethereum()
      expect(eth.sendAsync).toBe(eth.request)
    })
  })

  describe('getInstance()', () => {
    it('returns an Ethereum instance', () => {
      const instance = Ethereum.getInstance()
      expect(instance).toBeInstanceOf(Ethereum)
    })

    it('returns the same instance when called twice (singleton)', () => {
      const first = Ethereum.getInstance()
      const second = Ethereum.getInstance()
      expect(first).toBe(second)
    })

    it('sets window.isCtrl to true', () => {
      Ethereum.getInstance()
      expect((globalThis as any).window.isCtrl).toBe(true)
    })

    it('registers in window.ctrlEthProviders', () => {
      const instance = Ethereum.getInstance()
      expect((globalThis as any).window.ctrlEthProviders['Ctrl Wallet']).toBe(
        instance
      )
    })
  })

  describe('isConnected()', () => {
    it('returns false initially', () => {
      const eth = new Ethereum()
      expect(eth.isConnected()).toBe(false)
    })

    it('returns true after setting connected', () => {
      const eth = new Ethereum()
      eth.connected = true
      expect(eth.isConnected()).toBe(true)
    })
  })

  describe('request()', () => {
    it('dispatches to handler for known method', async () => {
      const eth = new Ethereum()
      mockedHandlers.eth_chainId.mockResolvedValue('0x1')

      const result = await eth.request({ method: 'eth_chainId', params: [] })
      expect(result).toBe('0x1')
      expect(mockedHandlers.eth_chainId).toHaveBeenCalled()
    })

    it('throws EIP1193Error(UnsupportedMethod) for unknown method', async () => {
      const eth = new Ethereum()

      try {
        await eth.request({
          method: 'eth_nonexistentMethod' as any,
          params: [],
        })
        expect.fail('Should have thrown')
      } catch (error) {
        expect(error).toBeInstanceOf(EIP1193Error)
        expect((error as EIP1193Error).code).toBe(4200)
        expect((error as EIP1193Error).message).toBe('Unsupported method')
      }
    })

    it('passes params to the handler', async () => {
      const eth = new Ethereum()
      mockedHandlers.eth_accounts.mockResolvedValue(['0xabc'])

      const result = await eth.request({
        method: 'eth_accounts',
        params: ['arg1'],
      })
      expect(result).toEqual(['0xabc'])
      expect(mockedHandlers.eth_accounts).toHaveBeenCalledWith(['arg1'])
    })

    // The four popup-driven resolvers called out in #3928. All must
    // surface a spec-conforming 4001 when the user dismisses the popup.
    const popupMethods = [
      'eth_sendTransaction',
      'eth_signTypedData_v4',
      'personal_sign',
      'wallet_watchAsset',
    ] as const

    it.each(popupMethods)(
      'translates PopupError.RejectedByUser from %s to EIP1193Error(UserRejectedRequest) (code 4001)',
      async method => {
        const eth = new Ethereum()
        mockedHandlers[method].mockRejectedValue(PopupError.RejectedByUser)

        await expect(eth.request({ method, params: [] })).rejects.toMatchObject(
          {
            code: 4001,
            message: 'User rejected the request',
          }
        )
        await expect(
          eth.request({ method, params: [] })
        ).rejects.toBeInstanceOf(EIP1193Error)
      }
    )

    it('passes existing EIP1193Error through unchanged', async () => {
      const eth = new Ethereum()
      const original = new EIP1193Error('UnrecognizedChain')
      mockedHandlers.eth_chainId.mockRejectedValue(original)

      await expect(
        eth.request({ method: 'eth_chainId', params: [] })
      ).rejects.toBe(original)
    })

    it('preserves ProviderRpcError-shaped plain objects with code+message', async () => {
      const eth = new Ethereum()
      mockedHandlers.eth_accounts.mockRejectedValue({
        code: -32000,
        message: 'upstream node error',
      })

      await expect(
        eth.request({ method: 'eth_accounts', params: [] })
      ).rejects.toMatchObject({
        code: -32000,
        message: 'upstream node error',
      })
      await expect(
        eth.request({ method: 'eth_accounts', params: [] })
      ).rejects.toBeInstanceOf(EIP1193Error)
    })

    it('preserves the `data` field on ProviderRpcError-shaped objects (e.g. revert reasons)', async () => {
      const eth = new Ethereum()
      mockedHandlers.eth_sendTransaction.mockRejectedValue({
        code: 3,
        message: 'execution reverted',
        data: '0x08c379a0',
      })

      await expect(
        eth.request({ method: 'eth_sendTransaction', params: [] })
      ).rejects.toMatchObject({
        code: 3,
        message: 'execution reverted',
        data: '0x08c379a0',
      })
    })

    it('preserves the message from a plain Error in the fallback path', async () => {
      const eth = new Ethereum()
      mockedHandlers.wallet_watchAsset.mockRejectedValue(
        new Error('Asset type not supported')
      )

      await expect(
        eth.request({ method: 'wallet_watchAsset', params: [] })
      ).rejects.toMatchObject({
        code: -32603,
        message: 'Asset type not supported',
      })
    })

    it('uses a thrown string as the fallback message', async () => {
      const eth = new Ethereum()
      mockedHandlers.eth_accounts.mockRejectedValue('some unexpected string')

      await expect(
        eth.request({ method: 'eth_accounts', params: [] })
      ).rejects.toMatchObject({
        code: -32603,
        message: 'some unexpected string',
      })
    })

    it('falls back to the default InternalError message for unknown shapes', async () => {
      const eth = new Ethereum()
      mockedHandlers.eth_accounts.mockRejectedValue(null)

      await expect(
        eth.request({ method: 'eth_accounts', params: [] })
      ).rejects.toMatchObject({
        code: -32603,
        message: 'Internal error',
      })
    })
  })

  describe('enable()', () => {
    it('calls request with eth_requestAccounts', async () => {
      const eth = new Ethereum()
      mockedHandlers.eth_requestAccounts.mockResolvedValue(['0x123'])

      const result = await eth.enable()
      expect(result).toEqual(['0x123'])
      expect(mockedHandlers.eth_requestAccounts).toHaveBeenCalled()
    })
  })

  describe('event emission', () => {
    it('emits and receives chainChanged events', () => {
      const eth = new Ethereum()
      const listener = vi.fn()

      eth.on('chainChanged', listener)
      eth.emit('chainChanged', '0x5')

      expect(listener).toHaveBeenCalledWith('0x5')
    })

    it('emits and receives accountsChanged events', () => {
      const eth = new Ethereum()
      const listener = vi.fn()

      eth.on('accountsChanged', listener)
      eth.emit('accountsChanged', ['0xnewaccount'])

      expect(listener).toHaveBeenCalledWith(['0xnewaccount'])
    })

    it('supports multiple listeners', () => {
      const eth = new Ethereum()
      const listener1 = vi.fn()
      const listener2 = vi.fn()

      eth.on('chainChanged', listener1)
      eth.on('chainChanged', listener2)
      eth.emit('chainChanged', '0xa')

      expect(listener1).toHaveBeenCalledWith('0xa')
      expect(listener2).toHaveBeenCalledWith('0xa')
    })

    it('supports removeListener', () => {
      const eth = new Ethereum()
      const listener = vi.fn()

      eth.on('chainChanged', listener)
      eth.removeListener('chainChanged', listener)
      eth.emit('chainChanged', '0xb')

      expect(listener).not.toHaveBeenCalled()
    })
  })
})
