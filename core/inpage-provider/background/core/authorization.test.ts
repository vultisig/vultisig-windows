import { BackgroundError } from '@core/inpage-provider/background/error'
import { beforeEach, describe, expect, it, vi } from 'vitest'

vi.mock('@core/extension/storage', () => ({
  storage: { getCurrentVaultId: vi.fn() },
}))
vi.mock('@core/extension/storage/appSessions', () => ({
  getVaultAppSessions: vi.fn(),
}))
vi.mock('@core/extension/storage/coins', () => ({
  coinsStorage: { getCoins: vi.fn() },
}))
vi.mock('@vultisig/lib-utils/sleep', () => ({
  sleep: vi.fn(() => Promise.resolve()),
}))

import { storage } from '@core/extension/storage'
import {
  AppSession,
  getVaultAppSessions,
} from '@core/extension/storage/appSessions'
import { coinsStorage } from '@core/extension/storage/coins'

import { authorizeContext } from './authorization'

const mockGetCurrentVaultId = vi.mocked(storage.getCurrentVaultId)
const mockGetVaultAppSessions = vi.mocked(getVaultAppSessions)
const mockGetCoins = vi.mocked(coinsStorage.getCoins)

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

    beforeEach(() => {
      mockGetCoins.mockResolvedValue({
        'vault-1': [{ address: '0xb0b0000000000000000000000000000000000001' }],
        'vault-2': [{ address: addressA }],
      } as never)
    })

    it('authorizes against the vault that owns the account, not the current one', async () => {
      mockGetVaultAppSessions.mockImplementation(connectedOnly('vault-2'))

      const result = await authorizeContext({
        requestOrigin: origin,
        account: addressA.toLowerCase(),
      })

      expect(result.appSession).toEqual({ ...session, vaultId: 'vault-2' })
      expect(mockGetVaultAppSessions).toHaveBeenCalledWith('vault-2')
      expect(mockGetCurrentVaultId).not.toHaveBeenCalled()
    })

    it('rejects when the owning vault is not connected to the origin', async () => {
      mockGetVaultAppSessions.mockImplementation(connectedOnly('vault-1'))

      await expect(
        authorizeContext({ requestOrigin: origin, account: addressA })
      ).rejects.toBe(BackgroundError.Unauthorized)
    })

    it('rejects an account that belongs to no vault', async () => {
      mockGetVaultAppSessions.mockResolvedValue({ 'example.com': session })

      await expect(
        authorizeContext({
          requestOrigin: origin,
          account: '0xdead000000000000000000000000000000000000',
        })
      ).rejects.toBe(BackgroundError.Unauthorized)
    })
  })
})
