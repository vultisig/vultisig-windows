import { Chain } from '@vultisig/core-chain/Chain'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockRequestAccount = vi.hoisted(() => vi.fn())
const mockCallPopup = vi.hoisted(() => vi.fn())
const mockCallBackground = vi.hoisted(() => vi.fn())

vi.mock('@clients/extension/src/inpage/providers/core/requestAccount', () => ({
  requestAccount: (...args: unknown[]) => mockRequestAccount(...args),
}))

vi.mock('@core/inpage-provider/popup', () => ({
  callPopup: (...args: unknown[]) => mockCallPopup(...args),
}))

vi.mock('@core/inpage-provider/background', () => ({
  callBackground: (...args: unknown[]) => mockCallBackground(...args),
}))

vi.mock('@core/inpage-provider/background/events/inpage', () => ({
  addBackgroundEventListener: vi.fn(),
}))

import { XDEFIKeplrProvider } from '@clients/extension/src/inpage/providers/xdefiKeplr'
import { BackgroundError } from '@core/inpage-provider/background/error'

const createProvider = () =>
  Reflect.construct(XDEFIKeplrProvider, [
    '0.0.1',
    'extension',
    { sendMessage: vi.fn() },
    {},
  ])

describe('XDEFIKeplrProvider.getKeysSettled', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockCallBackground.mockResolvedValue({
      address: 'cosmos1account',
      publicKey: 'pubkey',
    })
  })

  it('reads keys silently when native chains are already authorized', async () => {
    const provider = createProvider()
    provider.getKey = vi.fn(async (chainId: string) => ({
      bech32Address: chainId,
    }))

    const result = await provider.getKeysSettled(['cosmoshub-4', 'osmosis-1'])

    expect(mockCallBackground).toHaveBeenCalledTimes(2)
    expect(mockCallPopup).not.toHaveBeenCalled()
    expect(mockRequestAccount).not.toHaveBeenCalled()
    expect(provider.getKey).toHaveBeenCalledTimes(2)
    expect(result).toEqual([
      { status: 'fulfilled', value: { bech32Address: 'cosmoshub-4' } },
      { status: 'fulfilled', value: { bech32Address: 'osmosis-1' } },
    ])
  })

  it('pre-authorizes all native chains with a single grant before reading unauthorized keys', async () => {
    const provider = createProvider()
    provider.getKey = vi.fn(async (chainId: string) => ({
      bech32Address: chainId,
    }))
    mockCallBackground.mockRejectedValue(BackgroundError.Unauthorized)
    mockCallPopup.mockResolvedValue({
      appSession: {
        vaultId: 'vault-1',
        host: 'example.com',
        url: 'https://example.com',
      },
    })

    const result = await provider.getKeysSettled(['cosmoshub-4', 'osmosis-1'])

    expect(mockCallPopup).toHaveBeenCalledTimes(1)
    expect(mockCallPopup).toHaveBeenCalledWith({
      grantVaultAccess: {
        chain: Chain.Cosmos,
        chains: [Chain.Cosmos, Chain.Osmosis],
      },
    })
    expect(mockRequestAccount).not.toHaveBeenCalled()
    expect(provider.getKey).toHaveBeenCalledTimes(2)
    expect(result).toEqual([
      { status: 'fulfilled', value: { bech32Address: 'cosmoshub-4' } },
      { status: 'fulfilled', value: { bech32Address: 'osmosis-1' } },
    ])
  })

  it('returns per-chain rejections without retrying keys when the shared grant fails', async () => {
    const provider = createProvider()
    provider.getKey = vi.fn()
    const rejection = new Error('User rejected')
    mockCallBackground.mockRejectedValue(BackgroundError.Unauthorized)
    mockCallPopup.mockRejectedValue(rejection)

    const result = await provider.getKeysSettled(['cosmoshub-4', 'osmosis-1'])

    expect(mockCallPopup).toHaveBeenCalledTimes(1)
    expect(mockRequestAccount).not.toHaveBeenCalled()
    expect(provider.getKey).not.toHaveBeenCalled()
    expect(result).toEqual([
      { status: 'rejected', reason: rejection },
      { status: 'rejected', reason: rejection },
    ])
  })
})
