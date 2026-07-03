import { Chain } from '@vultisig/core-chain/Chain'
import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockAddPopupViewCall = vi.hoisted(() => vi.fn())
const mockInNewWindow = vi.hoisted(() => vi.fn())

vi.mock('../../view/state/calls', () => ({
  addPopupViewCall: (...args: unknown[]) => mockAddPopupViewCall(...args),
}))

vi.mock('./inNewWindow', () => ({
  inNewWindow: (...args: unknown[]) => mockInNewWindow(...args),
}))

import { callPopupFromBackground } from '.'

describe('callPopupFromBackground', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubGlobal('chrome', {
      runtime: {
        getURL: (path: string) => `chrome-extension://id/${path}`,
      },
    })
    mockAddPopupViewCall.mockResolvedValue('call-1')
  })

  it('coalesces concurrent grantVaultAccess popups with the same origin and input', async () => {
    const appSession = {
      vaultId: 'vault-1',
      host: 'example.com',
      url: 'https://example.com',
    }
    let resolvePopup: (value: unknown) => void = () => undefined
    mockInNewWindow.mockReturnValue(
      new Promise(resolve => {
        resolvePopup = resolve
      })
    )

    const first = callPopupFromBackground({
      call: {
        grantVaultAccess: {
          chain: Chain.Cosmos,
          chains: [Chain.Cosmos, Chain.Polygon],
        },
      },
      options: {},
      context: {
        requestOrigin: 'https://example.com',
      },
    })
    const second = callPopupFromBackground({
      call: {
        grantVaultAccess: {
          chain: Chain.Cosmos,
          chains: [Chain.Cosmos, Chain.Polygon],
        },
      },
      options: {},
      context: {
        requestOrigin: 'https://example.com',
      },
    })

    await vi.waitFor(() => {
      expect(mockInNewWindow).toHaveBeenCalledTimes(1)
    })

    resolvePopup({ appSession })

    await expect(first).resolves.toEqual({ appSession })
    await expect(second).resolves.toEqual({ appSession })
    expect(mockAddPopupViewCall).toHaveBeenCalledTimes(1)
  })

  it('keeps separate grantVaultAccess popups for different requested permissions', async () => {
    mockInNewWindow.mockResolvedValue({
      appSession: {
        vaultId: 'vault-1',
        host: 'example.com',
        url: 'https://example.com',
      },
    })

    await Promise.all([
      callPopupFromBackground({
        call: { grantVaultAccess: { chain: Chain.Cosmos } },
        options: {},
        context: { requestOrigin: 'https://one.example.com' },
      }),
      callPopupFromBackground({
        call: { grantVaultAccess: { chain: Chain.Polygon } },
        options: {},
        context: { requestOrigin: 'https://one.example.com' },
      }),
    ])

    expect(mockInNewWindow).toHaveBeenCalledTimes(2)
  })
})
