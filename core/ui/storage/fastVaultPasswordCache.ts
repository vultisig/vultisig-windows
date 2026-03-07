export type FastVaultPasswordCacheEntry = {
  password: string
  expiresAt: number
}

export type FastVaultPasswordCacheValue = Record<
  string,
  FastVaultPasswordCacheEntry
> | null

export const initialFastVaultPasswordCacheValue: FastVaultPasswordCacheValue =
  null

export type FastVaultPasswordCacheStorage = {
  getFastVaultPasswordCache: () => Promise<FastVaultPasswordCacheValue>
  setFastVaultPasswordCache: (
    value: FastVaultPasswordCacheValue
  ) => Promise<void>
}
