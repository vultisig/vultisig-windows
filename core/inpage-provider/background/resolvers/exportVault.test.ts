import { BackgroundError } from '@core/inpage-provider/background/error'
import { Chain } from '@vultisig/core-chain/Chain'
import { describe, expect, it, vi } from 'vitest'

const mockGetVaults = vi.fn()

vi.mock('@core/extension/storage', () => ({
  storage: {
    getVaults: () => mockGetVaults(),
  },
}))

import { exportVault } from './exportVault'

describe('exportVault', () => {
  it('rejects chain-only dApp sessions before reading vault data', async () => {
    await expect(
      exportVault({
        input: {},
        context: {
          requestOrigin: 'https://example.com',
          appSession: {
            vaultId: 'vault-1',
            host: 'example.com',
            url: 'https://example.com',
            authorizedChains: [Chain.Polygon],
            isAccountAccessGranted: false,
          },
        },
      })
    ).rejects.toBe(BackgroundError.Unauthorized)

    expect(mockGetVaults).not.toHaveBeenCalled()
  })
})
