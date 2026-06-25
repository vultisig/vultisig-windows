import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { getCachedSignature, setCachedSignature } from './signatureCache'

const baseKey = {
  origin: 'https://app.paradex.trade',
  vaultId: 'vault-1',
  chain: 'Ethereum',
  method: 'eth_signTypedData_v4',
  hexMessage: 'deadbeef',
}

// Minimal in-memory stand-in for `chrome.storage.session`.
const makeSessionMock = () => {
  const data = new Map<string, unknown>()
  return {
    get: vi.fn(async (key: string) =>
      data.has(key) ? { [key]: data.get(key) } : {}
    ),
    set: vi.fn(async (items: Record<string, unknown>) => {
      for (const [k, v] of Object.entries(items)) data.set(k, v)
    }),
    remove: vi.fn(async (key: string) => {
      data.delete(key)
    }),
  }
}

describe('signatureCache', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.stubGlobal('chrome', { storage: { session: makeSessionMock() } })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('returns undefined for an unknown message', async () => {
    expect(await getCachedSignature(baseKey)).toBeUndefined()
  })

  it('replays a stored signature for the exact same key', async () => {
    await setCachedSignature(baseKey, 'sig-abc')
    expect(await getCachedSignature(baseKey)).toBe('sig-abc')
  })

  it('isolates entries by dApp origin', async () => {
    await setCachedSignature(baseKey, 'sig-abc')
    expect(
      await getCachedSignature({
        ...baseKey,
        origin: 'https://app.uniswap.org',
      })
    ).toBeUndefined()
  })

  it('isolates entries by vault', async () => {
    await setCachedSignature(baseKey, 'sig-abc')
    expect(
      await getCachedSignature({ ...baseKey, vaultId: 'vault-2' })
    ).toBeUndefined()
  })

  it('isolates entries by message', async () => {
    await setCachedSignature(baseKey, 'sig-abc')
    expect(
      await getCachedSignature({ ...baseKey, hexMessage: 'cafebabe' })
    ).toBeUndefined()
  })

  it('isolates entries by method and chain', async () => {
    await setCachedSignature(baseKey, 'sig-abc')
    expect(
      await getCachedSignature({ ...baseKey, method: 'personal_sign' })
    ).toBeUndefined()
    expect(
      await getCachedSignature({ ...baseKey, chain: 'Polygon' })
    ).toBeUndefined()
  })

  it('expires entries after the 3-minute TTL', async () => {
    await setCachedSignature(baseKey, 'sig-abc')

    vi.advanceTimersByTime(3 * 60 * 1000 - 1)
    expect(await getCachedSignature(baseKey)).toBe('sig-abc')

    vi.advanceTimersByTime(2)
    expect(await getCachedSignature(baseKey)).toBeUndefined()
  })

  it('is a no-op when chrome.storage.session is unavailable', async () => {
    vi.stubGlobal('chrome', undefined)
    await expect(
      setCachedSignature(baseKey, 'sig-abc')
    ).resolves.toBeUndefined()
    expect(await getCachedSignature(baseKey)).toBeUndefined()
  })
})
