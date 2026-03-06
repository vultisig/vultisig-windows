import { convertDuration } from '@lib/utils/time/convertDuration'

const passwordCacheDurationMs = convertDuration(5, 'min', 'ms')

type CacheEntry = {
  password: string
  expiresAt: number
  timeoutId: ReturnType<typeof setTimeout>
}

const cache = new Map<string, CacheEntry>()

type CacheVaultPasswordInput = {
  vaultId: string
  password: string
}

export const cacheVaultPassword = ({
  vaultId,
  password,
}: CacheVaultPasswordInput) => {
  clearCachedVaultPassword({ vaultId })

  const timeoutId = setTimeout(() => {
    cache.delete(vaultId)
  }, passwordCacheDurationMs)

  cache.set(vaultId, {
    password,
    expiresAt: Date.now() + passwordCacheDurationMs,
    timeoutId,
  })
}

type GetCachedVaultPasswordInput = {
  vaultId: string
}

export const getCachedVaultPassword = ({
  vaultId,
}: GetCachedVaultPasswordInput): string | null => {
  const entry = cache.get(vaultId)
  if (!entry) return null

  if (Date.now() > entry.expiresAt) {
    clearCachedVaultPassword({ vaultId })
    return null
  }

  return entry.password
}

type ClearCachedVaultPasswordInput = {
  vaultId: string
}

const clearCachedVaultPassword = ({
  vaultId,
}: ClearCachedVaultPasswordInput) => {
  const entry = cache.get(vaultId)
  if (entry) {
    clearTimeout(entry.timeoutId)
    cache.delete(vaultId)
  }
}
