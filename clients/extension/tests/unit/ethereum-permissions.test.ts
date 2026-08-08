import { beforeEach, describe, expect, it, vi } from 'vitest'

const mockGetEthAccounts = vi.fn()
const mockRequestEthAccounts = vi.fn()

vi.mock(
  '@clients/extension/src/inpage/providers/ethereum/resolvers/eth_accounts',
  () => ({
    getEthAccounts: (...args: unknown[]) => mockGetEthAccounts(...args),
  })
)

vi.mock(
  '@clients/extension/src/inpage/providers/ethereum/resolvers/eth_requestAccounts',
  () => ({
    requestEthAccounts: (...args: unknown[]) => mockRequestEthAccounts(...args),
  })
)

import { getWalletPermissions } from '@clients/extension/src/inpage/providers/ethereum/resolvers/wallet_getPermissions'
import { requestWalletPermissions } from '@clients/extension/src/inpage/providers/ethereum/resolvers/wallet_requestPermissions'

describe('Ethereum wallet permissions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns no permissions when no Ethereum accounts are connected', async () => {
    mockGetEthAccounts.mockResolvedValue([])

    await expect(getWalletPermissions()).resolves.toEqual([])
  })

  it('returns the eth_accounts permission for connected accounts', async () => {
    mockGetEthAccounts.mockResolvedValue(['0xabc'])

    await expect(getWalletPermissions()).resolves.toEqual([
      {
        parentCapability: 'eth_accounts',
        caveats: [
          {
            type: 'restrictReturnedAccounts',
            value: ['0xabc'],
          },
        ],
      },
    ])
  })

  it('requests accounts and returns the granted eth_accounts permission', async () => {
    mockRequestEthAccounts.mockResolvedValue(['0xdef'])

    await expect(
      requestWalletPermissions([{ eth_accounts: {} }])
    ).resolves.toEqual([
      {
        parentCapability: 'eth_accounts',
        caveats: [
          {
            type: 'restrictReturnedAccounts',
            value: ['0xdef'],
          },
        ],
      },
    ])
    expect(mockRequestEthAccounts).toHaveBeenCalledWith(undefined)
  })

  it('does not prompt when no permissions were requested', async () => {
    await expect(requestWalletPermissions()).resolves.toEqual([])
    await expect(requestWalletPermissions([])).resolves.toEqual([])
    expect(mockRequestEthAccounts).not.toHaveBeenCalled()
  })

  it('does not prompt when eth_accounts was not requested', async () => {
    await expect(
      requestWalletPermissions([{ wallet_snap: {} }])
    ).resolves.toEqual([])
    expect(mockRequestEthAccounts).not.toHaveBeenCalled()
  })
})
