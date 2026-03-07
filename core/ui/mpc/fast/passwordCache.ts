import { usePasscode } from '@core/ui/passcodeEncryption/state/passcode'
import { useCore } from '@core/ui/state/core'
import { FastVaultPasswordCacheEntry } from '@core/ui/storage/fastVaultPasswordCache'
import { decryptWithAesGcm } from '@lib/utils/encryption/aesGcm/decryptWithAesGcm'
import { encryptWithAesGcm } from '@lib/utils/encryption/aesGcm/encryptWithAesGcm'
import {
  encryptedEncoding,
  plainTextEncoding,
} from '@lib/utils/encryption/config'
import { convertDuration } from '@lib/utils/time/convertDuration'

const cacheDurationMs = convertDuration(5, 'min', 'ms')

type EncryptPasswordInput = {
  password: string
  passcode: string
}

const encryptPassword = ({ password, passcode }: EncryptPasswordInput) =>
  encryptWithAesGcm({
    key: Buffer.from(passcode, plainTextEncoding),
    value: Buffer.from(password, plainTextEncoding),
  }).toString(encryptedEncoding)

type DecryptPasswordInput = {
  encrypted: string
  passcode: string
}

const decryptPassword = ({ encrypted, passcode }: DecryptPasswordInput) =>
  decryptWithAesGcm({
    key: Buffer.from(passcode, plainTextEncoding),
    value: Buffer.from(encrypted, encryptedEncoding),
  }).toString(plainTextEncoding)

type CacheVaultPasswordInput = {
  vaultId: string
  password: string
}

type GetCachedVaultPasswordInput = {
  vaultId: string
}

export const useFastVaultPasswordCache = () => {
  const { getFastVaultPasswordCache, setFastVaultPasswordCache } = useCore()
  const [passcode] = usePasscode()

  const cacheVaultPassword = async ({
    vaultId,
    password,
  }: CacheVaultPasswordInput) => {
    const cache = (await getFastVaultPasswordCache()) ?? {}

    const storedPassword = passcode
      ? encryptPassword({ password, passcode })
      : password

    cache[vaultId] = {
      password: storedPassword,
      expiresAt: Date.now() + cacheDurationMs,
    }

    await setFastVaultPasswordCache(cache)
  }

  const getCachedVaultPassword = async ({
    vaultId,
  }: GetCachedVaultPasswordInput): Promise<string | null> => {
    const cache = await getFastVaultPasswordCache()
    if (!cache) return null

    const entry: FastVaultPasswordCacheEntry | undefined = cache[vaultId]
    if (!entry) return null

    const removeCacheEntry = async () => {
      delete cache[vaultId]
      await setFastVaultPasswordCache(
        Object.keys(cache).length > 0 ? cache : null
      )
    }

    if (Date.now() > entry.expiresAt) {
      await removeCacheEntry()
      return null
    }

    if (passcode) {
      try {
        return decryptPassword({ encrypted: entry.password, passcode })
      } catch {
        await removeCacheEntry()
        return null
      }
    }

    return entry.password
  }

  return { cacheVaultPassword, getCachedVaultPassword }
}
