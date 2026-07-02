import { beforeEach, describe, expect, it, vi } from 'vitest'

import { BackgroundError } from '@core/inpage-provider/background/error'
import { Chain } from '@vultisig/core-chain/Chain'

const mockCallBackground = vi.fn()
const mockCallPopup = vi.fn()

vi.mock('@core/inpage-provider/background', () => ({
  callBackground: (...args: unknown[]) => mockCallBackground(...args),
}))

vi.mock('@core/inpage-provider/popup', () => ({
  callPopup: (...args: unknown[]) => mockCallPopup(...args),
}))

import { switchChainHandler } from '@clients/extension/src/inpage/providers/ethereum/utils'

describe('switchChainHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('switches an already-authorized dApp with the app-scoped chain setter', async () => {
    mockCallBackground.mockResolvedValue(undefined)

    await expect(
      switchChainHandler([{ chainId: '0x89' }])
    ).resolves.toBeNull()

    expect(mockCallBackground).toHaveBeenCalledWith({
      setAppChain: { evm: Chain.Polygon },
    })
    expect(mockCallPopup).not.toHaveBeenCalled()
  })

  it('prompts and retries when the requested chain is not authorized yet', async () => {
    mockCallBackground
      .mockRejectedValueOnce(BackgroundError.Unauthorized)
      .mockResolvedValueOnce(undefined)
    mockCallPopup.mockResolvedValue({
      appSession: {
        vaultId: 'vault-1',
        host: 'example.com',
        url: 'https://example.com',
        authorizedChains: [Chain.Polygon],
      },
    })

    await expect(
      switchChainHandler([{ chainId: '0x89' }])
    ).resolves.toBeNull()

    expect(mockCallPopup).toHaveBeenCalledWith({
      grantVaultAccess: {
        chain: Chain.Polygon,
        shouldGrantAccountAccess: false,
      },
    })
    expect(mockCallBackground).toHaveBeenNthCalledWith(1, {
      setAppChain: { evm: Chain.Polygon },
    })
    expect(mockCallBackground).toHaveBeenNthCalledWith(2, {
      setAppChain: { evm: Chain.Polygon },
    })
    expect(mockCallBackground.mock.calls).not.toContainEqual([
      { setVaultChain: { evm: Chain.Polygon } },
    ])
  })

  it('surfaces popup dismissal as a user rejection', async () => {
    mockCallBackground.mockRejectedValueOnce(BackgroundError.Unauthorized)
    mockCallPopup.mockResolvedValue(undefined)

    await expect(switchChainHandler([{ chainId: '0x89' }])).rejects.toMatchObject(
      {
        code: 4001,
      }
    )
  })

  it('surfaces popup rejection as a user rejection', async () => {
    mockCallBackground.mockRejectedValueOnce(BackgroundError.Unauthorized)
    mockCallPopup.mockRejectedValue(new Error('User rejected the request'))

    await expect(switchChainHandler([{ chainId: '0x89' }])).rejects.toMatchObject(
      {
        code: 4001,
      }
    )
  })
})
