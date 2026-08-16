import { convertDuration } from '@vultisig/lib-utils/time/convertDuration'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const storageKey = 'fastVaultPasswordCache'
const ttlMs = convertDuration(5, 'min', 'ms')

type CacheEntry = { password: string; expiresAt: number }
type StoredCache = Record<string, CacheEntry>

const sessionStore = new Map<string, unknown>()

const alarms = {
  create: vi.fn(),
  clear: vi.fn(async () => true),
}

const readStoredCache = (): StoredCache | undefined =>
  sessionStore.get(storageKey) as StoredCache | undefined

const loadPasswordCache = async () => {
  vi.resetModules()

  return import('./passwordCache')
}

beforeEach(() => {
  sessionStore.clear()
  alarms.create.mockClear()
  alarms.clear.mockClear()
  vi.useFakeTimers()
  vi.setSystemTime(new Date('2026-01-01T00:00:00Z'))
  ;(globalThis as any).chrome = {
    storage: {
      session: {
        get: async (key: string) => ({ [key]: sessionStore.get(key) }),
        set: async (items: Record<string, unknown>) => {
          for (const [key, value] of Object.entries(items)) {
            sessionStore.set(key, value)
          }
        },
      },
    },
    alarms,
  }
})

afterEach(() => {
  vi.useRealTimers()
  delete (globalThis as any).chrome
})

describe('fast vault password cache', () => {
  it('clears every cached password on demand', async () => {
    const { cacheVaultPassword, clearVaultPasswordCache } =
      await loadPasswordCache()

    await cacheVaultPassword({ vaultId: 'vault-a', password: 'secret-a' })
    await cacheVaultPassword({ vaultId: 'vault-b', password: 'secret-b' })

    await clearVaultPasswordCache()

    expect(readStoredCache()).toEqual({})
  })

  it('expires the cache on a timer with no further reads', async () => {
    const { cacheVaultPassword } = await loadPasswordCache()

    await cacheVaultPassword({ vaultId: 'vault-a', password: 'secret-a' })
    expect(readStoredCache()).toHaveProperty('vault-a')

    await vi.advanceTimersByTimeAsync(ttlMs + 1)

    expect(readStoredCache()).toEqual({})
  })

  it('keeps an entry that has not reached its TTL', async () => {
    const { cacheVaultPassword } = await loadPasswordCache()

    await cacheVaultPassword({ vaultId: 'vault-a', password: 'secret-a' })

    await vi.advanceTimersByTimeAsync(ttlMs - 1_000)

    expect(readStoredCache()).toHaveProperty('vault-a')
  })

  it('refuses a stale entry even when the timer never ran', async () => {
    const { getCachedVaultPassword } = await loadPasswordCache()

    sessionStore.set(storageKey, {
      'vault-a': { password: 'secret-a', expiresAt: Date.now() - 1 },
    })

    await expect(
      getCachedVaultPassword({ vaultId: 'vault-a' })
    ).resolves.toBeNull()
    expect(readStoredCache()).toEqual({})
  })

  it('returns a cached password before it expires', async () => {
    const { cacheVaultPassword, getCachedVaultPassword } =
      await loadPasswordCache()

    await cacheVaultPassword({ vaultId: 'vault-a', password: 'secret-a' })

    await expect(getCachedVaultPassword({ vaultId: 'vault-a' })).resolves.toBe(
      'secret-a'
    )
  })

  it('wakes the background only while something is cached', async () => {
    const {
      cacheVaultPassword,
      clearVaultPasswordCache,
      fastVaultPasswordCacheAlarmName,
    } = await loadPasswordCache()

    await cacheVaultPassword({ vaultId: 'vault-a', password: 'secret-a' })

    expect(alarms.create).toHaveBeenCalledWith(
      fastVaultPasswordCacheAlarmName,
      {
        when: Date.now() + ttlMs,
      }
    )

    await clearVaultPasswordCache()

    expect(alarms.clear).toHaveBeenCalledWith(fastVaultPasswordCacheAlarmName)
  })
})
