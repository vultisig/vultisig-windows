import { Chain } from '@vultisig/core-chain/Chain'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetStorageValue = vi.hoisted(() => vi.fn())
const mockSetStorageValue = vi.hoisted(() => vi.fn())

vi.mock('@lib/extension/storage/get', () => ({
  getStorageValue: (...args: unknown[]) => mockGetStorageValue(...args),
}))

vi.mock('@lib/extension/storage/set', () => ({
  setStorageValue: (...args: unknown[]) => mockSetStorageValue(...args),
}))

import { setExclusiveVaultAppSession } from './appSessions'

describe('appSessions storage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns the merged exclusive app session that was stored', async () => {
    mockGetStorageValue.mockResolvedValue({
      'vault-1': {
        'example.com': {
          host: 'example.com',
          url: 'https://example.com',
          authorizedChains: [Chain.Cosmos],
          isAccountAccessGranted: true,
        },
      },
    })

    const result = await setExclusiveVaultAppSession({
      vaultId: 'vault-1',
      host: 'example.com',
      url: 'https://example.com',
      authorizedChains: [Chain.Polygon],
      isAccountAccessGranted: false,
    })

    expect(result).toEqual({
      vaultId: 'vault-1',
      host: 'example.com',
      url: 'https://example.com',
      authorizedChains: [Chain.Cosmos, Chain.Polygon],
      isAccountAccessGranted: true,
    })
    expect(mockSetStorageValue).toHaveBeenCalledWith(
      expect.any(String),
      expect.objectContaining({
        'vault-1': {
          'example.com': {
            host: 'example.com',
            url: 'https://example.com',
            authorizedChains: [Chain.Cosmos, Chain.Polygon],
            isAccountAccessGranted: true,
          },
        },
      })
    )
  })
})
