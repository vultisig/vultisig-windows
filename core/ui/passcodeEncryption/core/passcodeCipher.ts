import {
  DEFAULT_VAULT_BACKUP_PBKDF2_ITERATIONS,
  VAULT_BACKUP_BLOB_MAGIC,
  VAULT_BACKUP_MAGIC_LEN,
  VAULT_BACKUP_PBKDF2_HEADER_LEN,
  VAULT_BACKUP_SALT_LEN,
} from '@vultisig/lib-utils/encryption/vaultBackup/vaultBackupConstants'

/**
 * At-rest passcode cipher for key shares and the passcode sample.
 *
 * Wire format matches the vault-backup blob (`MAGIC || salt || iv || sealed`,
 * PBKDF2-HMAC-SHA256 + AES-256-GCM) and is byte-compatible with
 * `decryptVaultBackupWithPassword`. A whole vault's shares share one salt and
 * one key derivation.
 *
 * Uses the async WebCrypto API rather than the synchronous Node polyfill: in the
 * browser bundle `pbkdf2Sync` is a pure-JS implementation that blocks the UI
 * thread for ~1s per derivation, which froze the app when (re-)encrypting every
 * vault on passcode set/change/disable. WebCrypto runs natively off-thread and
 * derivations across vaults parallelize.
 */
const ivLength = 12
const aesKeyLength = 256

const subtle = globalThis.crypto.subtle

const randomBytes = (length: number): Buffer =>
  Buffer.from(globalThis.crypto.getRandomValues(new Uint8Array(length)))

// WebCrypto wants a DOM `BufferSource`; `@types/node`'s generic `Buffer` /
// `Uint8Array<ArrayBufferLike>` aren't assignable (they may be SharedArrayBuffer
// backed), so copy into a plain `ArrayBuffer`-backed `Uint8Array`.
const toBytes = (value: Buffer): Uint8Array<ArrayBuffer> => {
  const bytes = new Uint8Array(value.length)
  bytes.set(value)
  return bytes
}

const hasPbkdf2Magic = (value: Buffer): boolean =>
  value.length >= VAULT_BACKUP_MAGIC_LEN &&
  value.subarray(0, VAULT_BACKUP_MAGIC_LEN).equals(VAULT_BACKUP_BLOB_MAGIC)

/** A blob is legacy when it lacks the PBKDF2 magic header (still SHA-256 KDF). */
export const isLegacyPasscodeBlob = (value: Buffer): boolean =>
  !hasPbkdf2Magic(value)

const derivePasscodeKey = async (
  passcode: string,
  salt: Buffer
): Promise<CryptoKey> => {
  const baseKey = await subtle.importKey(
    'raw',
    new TextEncoder().encode(passcode),
    'PBKDF2',
    false,
    ['deriveKey']
  )

  return subtle.deriveKey(
    {
      name: 'PBKDF2',
      salt: toBytes(salt),
      iterations: DEFAULT_VAULT_BACKUP_PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    baseKey,
    { name: 'AES-GCM', length: aesKeyLength },
    false,
    ['encrypt', 'decrypt']
  )
}

/** AES key for the legacy `SHA-256(passcode)` KDF, for decrypting old blobs. */
const importLegacyKey = async (passcode: string): Promise<CryptoKey> => {
  const digest = await subtle.digest(
    'SHA-256',
    new TextEncoder().encode(passcode)
  )
  return subtle.importKey('raw', digest, 'AES-GCM', false, ['decrypt'])
}

/**
 * Encrypt several plaintexts under one passcode, sharing a single random salt
 * and one PBKDF2 derivation (each value gets its own GCM nonce).
 */
export const encryptWithPasscode = async (
  passcode: string,
  values: Buffer[]
): Promise<Buffer[]> => {
  const salt = randomBytes(VAULT_BACKUP_SALT_LEN)
  const key = await derivePasscodeKey(passcode, salt)

  return Promise.all(
    values.map(async value => {
      const iv = randomBytes(ivLength)
      const sealed = Buffer.from(
        await subtle.encrypt(
          { name: 'AES-GCM', iv: toBytes(iv) },
          key,
          toBytes(value)
        )
      )
      return Buffer.concat([VAULT_BACKUP_BLOB_MAGIC, salt, iv, sealed])
    })
  )
}

/**
 * Decrypt several blobs, deriving the key once per distinct salt. Legacy blobs
 * (no magic) fall back to the `SHA-256(passcode)` KDF.
 */
export const decryptWithPasscode = async (
  passcode: string,
  values: Buffer[]
): Promise<Buffer[]> => {
  const keyBySalt = new Map<string, Promise<CryptoKey>>()
  const keyForSalt = (salt: Buffer): Promise<CryptoKey> => {
    const id = salt.toString('hex')
    const existing = keyBySalt.get(id)
    if (existing) return existing
    const key = derivePasscodeKey(passcode, salt)
    keyBySalt.set(id, key)
    return key
  }

  let legacyKey: Promise<CryptoKey> | undefined

  return Promise.all(
    values.map(async value => {
      if (!hasPbkdf2Magic(value)) {
        legacyKey ??= importLegacyKey(passcode)
        const iv = value.subarray(0, ivLength)
        const sealed = value.subarray(ivLength)
        return Buffer.from(
          await subtle.decrypt(
            { name: 'AES-GCM', iv: toBytes(iv) },
            await legacyKey,
            toBytes(sealed)
          )
        )
      }

      const salt = value.subarray(
        VAULT_BACKUP_MAGIC_LEN,
        VAULT_BACKUP_MAGIC_LEN + VAULT_BACKUP_SALT_LEN
      )
      const iv = value.subarray(
        VAULT_BACKUP_MAGIC_LEN + VAULT_BACKUP_SALT_LEN,
        VAULT_BACKUP_PBKDF2_HEADER_LEN
      )
      const sealed = value.subarray(VAULT_BACKUP_PBKDF2_HEADER_LEN)
      return Buffer.from(
        await subtle.decrypt(
          { name: 'AES-GCM', iv: toBytes(iv) },
          await keyForSalt(salt),
          toBytes(sealed)
        )
      )
    })
  )
}
