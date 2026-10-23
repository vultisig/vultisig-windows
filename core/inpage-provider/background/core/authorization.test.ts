import { BackgroundError } from '@core/inpage-provider/background/error'
import { Chain } from '@vultisig/core-chain/Chain'
import { Vault } from '@vultisig/core-mpc/vault/Vault'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@core/extension/storage', () => ({
  storage: { getCurrentVaultId: vi.fn(), getVaults: vi.fn() },
}))
vi.mock('@core/extension/storage/appSessions', () => ({
  getVaultsAppSessions: vi.fn(),
}))
vi.mock('@core/extension/storage/vaults', () => ({
  findVault: vi.fn(),
}))
vi.mock('./getVaultChainAddress', () => ({
  getVaultChainAddress: vi.fn(),
}))
vi.mock('@vultisig/lib-utils/sleep', () => ({
  sleep: vi.fn(() => Promise.resolve()),
}))

import { storage } from '@core/extension/storage'
import { getVaultsAppSessions } from '@core/extension/storage/appSessions'
import { findVault } from '@core/extension/storage/vaults'

import { authorizeContext } from './authorization'
import { getVaultChainAddress } from './getVaultChainAddress'

const mockGetCurrentVaultId = vi.mocked(storage.getCurrentVaultId)
const mockGetVaults = vi.mocked(storage.getVaults)
const mockGetVaultsAppSessions = vi.mocked(getVaultsAppSessions)
const mockFindVault = vi.mocked(findVault)
const mockGetVaultChainAddress = vi.mocked(getVaultChainAddress)

const origin = 'https://dapp.example.com'
const session = { host: 'example.com', url: origin }

const storedVaults = (...vaultIds: string[]) =>
  vaultIds.map(vaultId => ({ publicKeys: { ecdsa: vaultId } }) as Vault)

describe('authorizeContext', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockGetCurrentVaultId.mockResolvedValue('vault-1')
    mockGetVaults.mockResolvedValue(storedVaults('vault-1', 'vault-2'))
  })

  it('binds the session to the trusted origin from storage', async () => {
    mockGetVaultsAppSessions.mockResolvedValue({
      'vault-1': { 'example.com': session },
    })

    const result = await authorizeContext({ requestOrigin: origin })

    // Session is derived from storage keyed by origin — vaultId comes from
    // storage, never from caller input.
    expect(result.appSession).toEqual({ ...session, vaultId: 'vault-1' })
  })

  it('authorizes a site connected to a vault other than the current one', async () => {
    mockGetVaultsAppSessions.mockResolvedValue({
      'vault-1': {},
      'vault-2': { 'example.com': session },
    })

    const result = await authorizeContext({ requestOrigin: origin })

    expect(result.appSession).toEqual({ ...session, vaultId: 'vault-2' })
  })

  it('rejects a site whose only session belongs to a deleted vault', async () => {
    mockGetVaultsAppSessions.mockResolvedValue({
      'deleted-vault': { 'example.com': session },
    })

    await expect(authorizeContext({ requestOrigin: origin })).rejects.toBe(
      BackgroundError.Unauthorized
    )
  })

  it('rejects an origin with no stored session', async () => {
    mockGetVaultsAppSessions.mockResolvedValue({})

    await expect(authorizeContext({ requestOrigin: origin })).rejects.toBe(
      BackgroundError.Unauthorized
    )
  })

  it('does not retry the lookup by default', async () => {
    mockGetVaultsAppSessions.mockResolvedValue({})

    await expect(authorizeContext({ requestOrigin: origin })).rejects.toBe(
      BackgroundError.Unauthorized
    )
    expect(mockGetVaultsAppSessions).toHaveBeenCalledTimes(1)
  })

  it('retries the lookup to absorb the post-grant write race', async () => {
    mockGetVaultsAppSessions
      .mockResolvedValueOnce({})
      .mockResolvedValueOnce({ 'vault-1': { 'example.com': session } })

    const result = await authorizeContext(
      { requestOrigin: origin },
      { retryOnMissing: true }
    )

    expect(result.appSession).toEqual({ ...session, vaultId: 'vault-1' })
    expect(mockGetVaultsAppSessions).toHaveBeenCalledTimes(2)
  })

  it('gives up after exhausting retries when the session never appears', async () => {
    mockGetVaultsAppSessions.mockResolvedValue({})

    await expect(
      authorizeContext({ requestOrigin: origin }, { retryOnMissing: true })
    ).rejects.toBe(BackgroundError.Unauthorized)
    expect(mockGetVaultsAppSessions).toHaveBeenCalledTimes(4)
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
      mockFindVault.mockImplementation(async vaultId =>
        vaultId === 'deleted-vault' ? undefined : ({ vaultId } as never)
      )
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

      const result = await authorizeContext({ requestOrigin: origin, account })

      expect(result.appSession.vaultId).toBe('vault-1')
    })

    it('falls back to the vault serving the site when no connected vault derives the account', async () => {
      mockGetVaultsAppSessions.mockResolvedValue({
        'vault-1': { 'example.com': session },
      })

      const result = await authorizeContext({
        requestOrigin: origin,
        account: { address: '0xdead', chain: Chain.Ethereum },
      })

      expect(result.appSession).toEqual({ ...session, vaultId: 'vault-1' })
    })

    it('skips a session left behind by a deleted vault', async () => {
      mockGetVaultsAppSessions.mockResolvedValue({
        'deleted-vault': { 'example.com': session },
        'vault-2': { 'example.com': session },
      })

      const result = await authorizeContext({ requestOrigin: origin, account })

      expect(result.appSession.vaultId).toBe('vault-2')
    })

    it('rejects when no vault is connected to the origin', async () => {
      mockGetVaultsAppSessions.mockResolvedValue({ 'vault-2': {} })

      await expect(
        authorizeContext({ requestOrigin: origin, account })
      ).rejects.toBe(BackgroundError.Unauthorized)
    })
  })
})
