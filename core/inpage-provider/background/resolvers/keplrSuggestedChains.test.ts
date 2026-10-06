import { ChainInfo } from '@keplr-wallet/types'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockCallPopupFromBackground = vi.hoisted(() => vi.fn())
const storageState = vi.hoisted(() => ({
  values: {} as Record<string, unknown>,
  currentVaultId: 'vault-1' as string | null,
}))

vi.mock('@core/extension/storage', () => ({
  storage: {
    getCurrentVaultId: async () => storageState.currentVaultId,
  },
}))

vi.mock('@lib/extension/storage/get', () => ({
  getStorageValue: async (key: string, initialValue: unknown) =>
    storageState.values[key] ?? initialValue,
}))

vi.mock('@lib/extension/storage/set', () => ({
  setStorageValue: async (key: string, value: unknown) => {
    storageState.values[key] = value
    return value
  },
}))

vi.mock('../../popup/resolvers/background', () => ({
  callPopupFromBackground: (...args: unknown[]) =>
    mockCallPopupFromBackground(...args),
}))

import { PopupError } from '../../popup/error'
import {
  getKeplrSuggestedChains,
  suggestKeplrChain,
} from './keplrSuggestedChains'

const makeChainInfo = (prefix: string): ChainInfo => ({
  chainId: 'test-chain-1',
  chainName: 'Test chain',
  rpc: `https://rpc.${prefix}.example`,
  rest: `https://rest.${prefix}.example`,
  bip44: { coinType: 118 },
  bech32Config: {
    bech32PrefixAccAddr: prefix,
    bech32PrefixAccPub: `${prefix}pub`,
    bech32PrefixValAddr: `${prefix}valoper`,
    bech32PrefixValPub: `${prefix}valoperpub`,
    bech32PrefixConsAddr: `${prefix}valcons`,
    bech32PrefixConsPub: `${prefix}valconspub`,
  },
  currencies: [{ coinDenom: 'TST', coinMinimalDenom: 'utst', coinDecimals: 6 }],
  feeCurrencies: [
    { coinDenom: 'TST', coinMinimalDenom: 'utst', coinDecimals: 6 },
  ],
  stakeCurrency: {
    coinDenom: 'TST',
    coinMinimalDenom: 'utst',
    coinDecimals: 6,
  },
})

const suggest = (input: { origin: string; chainInfo: ChainInfo }) =>
  suggestKeplrChain({
    input: { chainInfo: input.chainInfo },
    context: { requestOrigin: input.origin },
  })

const getChains = (origin: string) =>
  getKeplrSuggestedChains({
    input: {},
    context: { requestOrigin: origin },
  })

describe('suggestKeplrChain', () => {
  beforeEach(() => {
    storageState.values = {}
    storageState.currentVaultId = 'vault-1'
    mockCallPopupFromBackground.mockReset()
    mockCallPopupFromBackground.mockResolvedValue(true)
  })

  it('stores the chain only after the background-opened popup is approved', async () => {
    const chainInfo = makeChainInfo('good')

    await suggest({ origin: 'https://good.example.com', chainInfo })

    expect(mockCallPopupFromBackground).toHaveBeenCalledOnce()
    expect(mockCallPopupFromBackground).toHaveBeenCalledWith({
      call: { suggestKeplrChain: { chainInfo } },
      options: {},
      context: { requestOrigin: 'https://good.example.com' },
    })
    expect(await getChains('https://good.example.com')).toEqual({
      'test-chain-1': chainInfo,
    })
  })

  it('does not store the chain when the user rejects the popup', async () => {
    mockCallPopupFromBackground.mockRejectedValue(PopupError.RejectedByUser)

    await expect(
      suggest({
        origin: 'https://good.example.com',
        chainInfo: makeChainInfo('good'),
      })
    ).rejects.toBe(PopupError.RejectedByUser)

    expect(await getChains('https://good.example.com')).toEqual({})
  })

  it('rejects malformed chain info without opening the popup', async () => {
    await expect(
      suggest({
        origin: 'https://evil.example.org',
        chainInfo: { ...makeChainInfo('evil'), rpc: '' },
      })
    ).rejects.toThrow('chainInfo.rpc must be a non-empty string')

    expect(mockCallPopupFromBackground).not.toHaveBeenCalled()
  })

  it('rejects an empty account-address prefix without opening the popup', async () => {
    const { bech32Config } = makeChainInfo('')

    await expect(
      suggest({
        origin: 'https://good.example.com',
        chainInfo: { ...makeChainInfo('good'), bech32Config },
      })
    ).rejects.toThrow('bech32PrefixAccAddr is required')

    expect(mockCallPopupFromBackground).not.toHaveBeenCalled()
  })

  it('fails without opening the popup when no vault is selected', async () => {
    storageState.currentVaultId = null

    await expect(
      suggest({
        origin: 'https://good.example.com',
        chainInfo: makeChainInfo('good'),
      })
    ).rejects.toThrow('currentVaultId')

    expect(mockCallPopupFromBackground).not.toHaveBeenCalled()
  })

  it('stores the chain under the vault selected when the user approves', async () => {
    let approve = (): void => {}
    mockCallPopupFromBackground.mockImplementation(
      () =>
        new Promise(resolve => {
          approve = () => resolve(true)
        })
    )

    const pending = suggest({
      origin: 'https://good.example.com',
      chainInfo: makeChainInfo('good'),
    })
    await vi.waitFor(() =>
      expect(mockCallPopupFromBackground).toHaveBeenCalledOnce()
    )
    storageState.currentVaultId = 'vault-2'
    approve()
    await pending

    expect(Object.keys(await getChains('https://good.example.com'))).toEqual([
      'test-chain-1',
    ])
    storageState.currentVaultId = 'vault-1'
    expect(await getChains('https://good.example.com')).toEqual({})
  })

  it('treats a chainId named after an Object.prototype member as new', async () => {
    const chainInfo = { ...makeChainInfo('good'), chainId: 'constructor' }

    await suggest({ origin: 'https://good.example.com', chainInfo })

    expect(mockCallPopupFromBackground).toHaveBeenCalledOnce()
    expect(
      Object.prototype.hasOwnProperty.call(
        await getChains('https://good.example.com'),
        'constructor'
      )
    ).toBe(true)
  })

  it('skips the popup for a chain the same site already registered', async () => {
    await suggest({
      origin: 'https://good.example.com',
      chainInfo: makeChainInfo('good'),
    })
    mockCallPopupFromBackground.mockClear()

    await suggest({
      origin: 'https://app.good.example.com',
      chainInfo: makeChainInfo('other'),
    })

    expect(mockCallPopupFromBackground).not.toHaveBeenCalled()
    expect(
      (await getChains('https://good.example.com'))['test-chain-1'].bech32Config
        ?.bech32PrefixAccAddr
    ).toBe('good')
  })

  it("keeps another site's registration from pre-empting this site's popup", async () => {
    await suggest({
      origin: 'https://evil.example.org',
      chainInfo: makeChainInfo('evil'),
    })
    mockCallPopupFromBackground.mockClear()

    await suggest({
      origin: 'https://good.example.com',
      chainInfo: makeChainInfo('good'),
    })

    expect(mockCallPopupFromBackground).toHaveBeenCalledOnce()
    expect(
      (await getChains('https://good.example.com'))['test-chain-1'].bech32Config
        ?.bech32PrefixAccAddr
    ).toBe('good')
    expect(
      (await getChains('https://evil.example.org'))['test-chain-1'].bech32Config
        ?.bech32PrefixAccAddr
    ).toBe('evil')
  })

  it("does not expose one site's chains to another site", async () => {
    await suggest({
      origin: 'https://evil.example.org',
      chainInfo: makeChainInfo('evil'),
    })

    expect(await getChains('https://other.example.net')).toEqual({})
  })
})
