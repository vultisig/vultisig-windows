import { BackgroundError } from '@core/inpage-provider/background/error'
import { Chain } from '@vultisig/core-chain/Chain'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@core/extension/storage', () => ({
  storage: { getCurrentVaultId: vi.fn() },
}))
vi.mock('@core/extension/storage/appSessions', () => ({
  getVaultAppSessions: vi.fn(),
  getVaultsAppSessions: vi.fn(),
}))
vi.mock('@core/extension/storage/vaults', () => ({
  getVault: vi.fn(),
}))
vi.mock('./getVaultChainAddress', () => ({
  getVaultChainAddress: vi.fn(),
}))
vi.mock('@vultisig/lib-utils/sleep', () => ({
  sleep: vi.fn(() => Promise.resolve()),
}))

import { storage } from '@core/extension/storage'
import {
  AppSession,
  getVaultAppSessions,
  getVaultsAppSessions,
} from '@core/extension/storage/appSessions'
import { getVault } from '@core/extension/storage/vaults'

import { authorizeContext } from './authorization'
import { getVaultChainAddress } from './getVaultChainAddress'

const mockGetCurrentVaultId = vi.mocked(storage.getCurrentVaultId)
const mockGetVaultAppSessions = vi.mocked(getVaultAppSessions)
const mockGetVaultsAppSessions = vi.mocked(getVaultsAppSessions)
const mockGetVault = vi.mocked(getVault)
const mockGetVaultChainAddress = vi.mocked(getVaultChainAddress)

const origin = 'https://dapp.example.com'
const session = { host: 'example.com', url: origin }

const connectedOnly =
  (connectedVaultId: string) =>
  async (vaultId: string): Promise<Record<string, AppSession>> =>
    vaultId === connectedVaultId ? { 'example.com': session } : {}

describe('authorizeContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCurrentVaultId.mockResolvedValue('vault-1')
  })

  it('binds the session to the trusted origin from storage', async () => {
    mockGetVaultAppSessions.mockResolvedValue({ 'example.com': session })

    const result = await authorizeContext({ requestOrigin: origin })

    // Session is derived from storage keyed by origin — vaultId comes from
    // storage, never from caller input.
    expect(result.appSession).toEqual({ ...session, vaultId: 'vault-1' })
    expect(mockGetVaultAppSessions).toHaveBeenCalledWith('vault-1')
  })

  it('rejects an origin with no stored session', async () => {
    mockGetVaultAppSessions.mockResolvedValue({})

    await expect(authorizeContext({ requestOrigin: origin })).rejects.toBe(
      BackgroundError.Unauthorized
    )
  })

  it('does not retry the lookup by default', async () => {
    mockGetVaultAppSessions.mockResolvedValue({})

    await expect(authorizeContext({ requestOrigin: origin })).rejects.toBe(
      BackgroundError.Unauthorized
    )
    expect(mockGetVaultAppSessions).toHaveBeenCalledTimes(1)
  })

  it('retries the lookup to absorb the post-grant write race', async () => {
    mockGetVaultAppSessions
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ 'example.com': session })

    const result = await authorizeContext(
      { requestOrigin: origin },
      { retryOnMissing: true }
    )

    expect(result.appSession).toEqual({ ...session, vaultId: 'vault-1' })
    expect(mockGetVaultAppSessions).toHaveBeenCalledTimes(2)
  })

  it('gives up after exhausting retries when the session never appears', async () => {
    mockGetVaultAppSessions.mockResolvedValue({})

    await expect(
      authorizeContext({ requestOrigin: origin }, { retryOnMissing: true })
    ).rejects.toBe(BackgroundError.Unauthorized)
    expect(mockGetVaultAppSessions).toHaveBeenCalledTimes(4)
  })

  describe('with an account hint', () => {
    const addressA = '0x14F6Ed6CBb27b607b0E2A48551A988F1a19c89B6'
    const addressB = '0xb0b0000000000000000000000000000000000001'
    const account = { address: addressA.toLowerCase(), chain: Chain.Ethereum }
    const derivedAddresses: Record<string, string> = {
      'vault-1': addressB,
      'vault-2': addressA,
    }

    beforeEach(() => {
      mockGetVault.mockImplementation(async vaultId => ({ vaultId }) as never)
      mockGetVaultChainAddress.mockImplementation(async ({ vault }) => {
        const { vaultId } = vault as Vault & { vaultId: string }
        return derivedAddresses[vaultId] ?? ''
      })
    })

    it('authorizes against the connected vault that derives the account, not the current one', async () => {
      mockGetVaultsAppSessions.mockResolvedValue({
        'vault-1': { 'example.com': session },
        'vault-2': { 'example.com': session },
      })

      const result = await authorizeContext({ requestOrigin: origin, account })

      expect(result.appSession).toEqual({ ...session, vaultId: 'vault-2' })
      expect(mockGetVaultChainAddress).toHaveBeenCalledWith(
        expect.objectContaining({ chain: Chain.Ethereum })
      )
    })

    it('matches by derived address, without needing the coin in the portfolio', async () => {
      // Ownership comes from vault key material only: nothing here reads
      // the saved coins, so an address on a chain the user never added
      // still resolves to its vault.
      mockGetVaultsAppSessions.mockResolvedValue({
        'vault-2': { 'example.com': session },
      })

      const result = await authorizeContext({ requestOrigin: origin, account })

      expect(result.appSession.vaultId).toBe('vault-2')
    })

    it('ignores a vault that derives the account but is not connected to the origin', async () => {
      mockGetVaultsAppSessions.mockResolvedValue({
        'vault-1': { 'example.com': session },
        'vault-2': {},
      })
      mockGetVaultAppSessions.mockImplementation(connectedOnly('vault-1'))

      const result = await authorizeContext({ requestOrigin: origin, account })

      expect(result.appSession.vaultId).toBe('vault-1')
    })

    it('falls back to the current vault when no connected vault derives the account', async () => {
      mockGetVaultsAppSessions.mockResolvedValue({
        'vault-1': { 'example.com': session },
      })
      mockGetVaultAppSessions.mockImplementation(connectedOnly('vault-1'))

      const result = await authorizeContext({
        requestOrigin: origin,
        account: { address: '0xdead', chain: Chain.Ethereum },
      })

      expect(result.appSession).toEqual({ ...session, vaultId: 'vault-1' })
    })

    it('rejects when neither the account nor the current vault is connected', async () => {
      mockGetVaultsAppSessions.mockResolvedValue({ 'vault-2': {} })
      mockGetVaultAppSessions.mockResolvedValue({})

      await expect(
        authorizeContext({ requestOrigin: origin, account })
      ).rejects.toBe(BackgroundError.Unauthorized)
    })
  })
})
