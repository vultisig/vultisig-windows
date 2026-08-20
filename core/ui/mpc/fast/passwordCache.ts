import { convertDuration } from '@vultisig/lib-utils/time/convertDuration'

const cacheDurationMs = convertDuration(5, 'min', 'ms')
const storageKey = 'fastVaultPasswordCache'

/**
 * Alarm the extension background listens on to prune the cache when it expires
 * while no UI context is alive to run the in-context timer. Only ever scheduled
 * while something is cached, so an idle browser is never woken for nothing.
 */
export const fastVaultPasswordCacheAlarmName = 'fastVaultPasswordCacheExpiry'

type CacheEntry = {
  password: string
  expiresAt: number
}

type CacheData = Record<string, CacheEntry>

const hasSessionStorage =
  typeof chrome !== 'undefined' && !!chrome.storage?.session

const hasAlarms = typeof chrome !== 'undefined' && !!chrome.alarms

const memoryCache = new Map<string, CacheEntry>()

const getCache = async (): Promise<CacheData> => {
  if (!hasSessionStorage) {
    return Object.fromEntries(memoryCache)
  }

  const result = await chrome.storage.session.get(storageKey)
  return (result[storageKey] as CacheData) ?? {}
}

const setCache = async (data: CacheData): Promise<void> => {
  if (!hasSessionStorage) {
    memoryCache.clear()
    for (const [key, value] of Object.entries(data)) {
      memoryCache.set(key, value)
    }
    return
  }

  await chrome.storage.session.set({ [storageKey]: data })
}

const withoutExpiredEntries = (cache: CacheData): CacheData =>
  Object.fromEntries(
    Object.entries(cache).filter(([, entry]) => Date.now() <= entry.expiresAt)
  )

const earliestExpiryAt = (cache: CacheData): number | null => {
  const expiries = Object.values(cache).map(entry => entry.expiresAt)

  return expiries.length > 0 ? Math.min(...expiries) : null
}

// Every mutation is a read-modify-write across an await, so a lock landing
// mid-write would otherwise be undone by the pending writer. Clearing bumps this
// synchronously; a writer that sees a different value drops its write.
let clearGeneration = 0

let expiryTimeout: ReturnType<typeof setTimeout> | null = null

const scheduleExpiry = (cache: CacheData): void => {
  if (expiryTimeout !== null) {
    clearTimeout(expiryTimeout)
    expiryTimeout = null
  }

  const expiresAt = earliestExpiryAt(cache)

  if (hasAlarms) {
    if (expiresAt === null) {
      void chrome.alarms.clear(fastVaultPasswordCacheAlarmName)
    } else {
      chrome.alarms.create(fastVaultPasswordCacheAlarmName, { when: expiresAt })
    }
  }

  if (expiresAt === null) {
    return
  }

  expiryTimeout = setTimeout(
    () => {
      expiryTimeout = null
      void pruneExpiredVaultPasswords()
    },
    Math.max(0, expiresAt - Date.now())
  )
}

/**
 * Drops every entry whose TTL has elapsed and re-arms the timer for the next
 * one. Runs on a timer rather than only when the cache is next read, so an
 * unused password does not sit in session storage for the whole browser session.
 */
export const pruneExpiredVaultPasswords = async (): Promise<void> => {
  const generation = clearGeneration
  const cache = await getCache()
  const remaining = withoutExpiredEntries(cache)

  if (generation !== clearGeneration) {
    return
  }

  if (Object.keys(remaining).length !== Object.keys(cache).length) {
    await setCache(remaining)
  }

  scheduleExpiry(remaining)
}

/**
 * Wipes every cached password. Called when the app locks — the passcode gate is
 * meant to withhold all signing credentials, and this cache has its own store
 * that would otherwise outlive the lock.
 */
export const clearVaultPasswordCache = async (): Promise<void> => {
  clearGeneration += 1

  await setCache({})
  scheduleExpiry({})
}

type CacheVaultPasswordInput = {
  vaultId: string
  password: string
}

/**
 * Caches a fast-vault password for its TTL and arms the expiry timer. A lock
 * that lands while this is in flight wins: the write is dropped rather than
 * restoring the password behind the gate.
 */
export const cacheVaultPassword = async ({
  vaultId,
  password,
}: CacheVaultPasswordInput) => {
  const generation = clearGeneration
  const cache = withoutExpiredEntries(await getCache())

  cache[vaultId] = {
    password,
    expiresAt: Date.now() + cacheDurationMs,
  }

  if (generation !== clearGeneration) {
    return
  }

  await setCache(cache)
  scheduleExpiry(cache)
}

type GetCachedVaultPasswordInput = {
  vaultId: string
}

/**
 * Returns the cached password for a vault, or `null` when nothing valid is
 * cached. The expiry is re-checked here as well as on the timer, so a stale
 * entry can never be handed out even if the timer never got to run.
 */
export const getCachedVaultPassword = async ({
  vaultId,
}: GetCachedVaultPasswordInput): Promise<string | null> => {
  const cache = await getCache()
  const entry = cache[vaultId]
  if (!entry) return null

  if (Date.now() > entry.expiresAt) {
    delete cache[vaultId]
    await setCache(cache)
    scheduleExpiry(cache)
    return null
  }

  return entry.password
}
