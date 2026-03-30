import { convertDuration } from '@vultisig/lib-utils/time/convertDuration'

const cacheDurationMs = convertDuration(5, 'min', 'ms')
const storageKey = 'fastVaultPasswordCache'

type CacheEntry = {
  password: string
  expiresAt: number
}

type CacheData = Record<string, CacheEntry>

const hasSessionStorage =
  typeof chrome !== 'undefined' && !!chrome.storage?.session

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

type CacheVaultPasswordInput = {
  vaultId: string
  password: string
}

export const cacheVaultPassword = async ({
  vaultId,
  password,
}: CacheVaultPasswordInput) => {
  const cache = await getCache()

  cache[vaultId] = {
    password,
    expiresAt: Date.now() + cacheDurationMs,
  }

  await setCache(cache)
}

type GetCachedVaultPasswordInput = {
  vaultId: string
}

export const getCachedVaultPassword = async ({
  vaultId,
}: GetCachedVaultPasswordInput): Promise<string | null> => {
  const cache = await getCache()
  const entry = cache[vaultId]
  if (!entry) return null

  if (Date.now() > entry.expiresAt) {
    delete cache[vaultId]
    await setCache(cache)
    return null
  }

  return entry.password
}
