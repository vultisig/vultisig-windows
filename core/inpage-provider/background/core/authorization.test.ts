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
import { getVaultAppSessions } from '@core/extension/storage/appSessions'

import { authorizeContext } from './authorization'

const mockGetCurrentVaultId = vi.mocked(storage.getCurrentVaultId)
const mockGetVaultAppSessions = vi.mocked(getVaultAppSessions)

const origin = 'https://dapp.example.com'
const session = { host: 'example.com', url: origin }

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
})
