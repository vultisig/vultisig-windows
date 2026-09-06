import { getSignatureAlgorithm } from '@vultisig/core-chain/signing/SignatureAlgorithm'
import { initializeMpcLib } from '@vultisig/core-mpc/lib/initialize'
import { toMpcLibKeyshare } from '@vultisig/core-mpc/lib/keyshare'
import { initializeMldsaLib } from '@vultisig/core-mpc/mldsa/initializeMldsa'
import {
  getVaultId,
  Vault,
  VaultAllKeyShares,
} from '@vultisig/core-mpc/vault/Vault'
import { Keyshare as MldsaKeyshare } from '@vultisig/lib-mldsa/vs_wasm'
import { shouldBePresent } from '@vultisig/lib-utils/assert/shouldBePresent'
import {
  encryptedEncoding,
  plainTextEncoding,
} from '@vultisig/lib-utils/encryption/config'
import { getRecordKeys } from '@vultisig/lib-utils/record/getRecordKeys'
import { recordFromKeys } from '@vultisig/lib-utils/record/recordFromKeys'

import {
  decryptWithPasscode,
  encryptWithPasscode,
  isLegacyPasscodeBlob,
  isPasscodeEncryptedBlob,
} from './passcodeCipher'

type EncryptInput = VaultAllKeyShares & { key: string }

type MapAllKeyShareValuesInput = {
  allKeyShares: VaultAllKeyShares
  transform: (values: string[]) => Promise<string[]>
}

/**
 * Flatten a vault's shares (key shares + chain key shares + MLDSA) into a single
 * ordered list, run them through one passcode cipher call (so the whole vault
 * costs a single PBKDF2 derivation), then scatter the results back into the
 * original shape.
 */
const mapAllKeyShareValues = async ({
  allKeyShares: { keyShares, chainKeyShares, keyShareMldsa },
  transform,
}: MapAllKeyShareValuesInput): Promise<VaultAllKeyShares> => {
  const keyShareAlgos = getRecordKeys(keyShares)
  const chainShares = chainKeyShares ?? {}
  const chainKeys = getRecordKeys(chainShares)

  const flat = [
    ...keyShareAlgos.map(algo => keyShares[algo]),
    ...chainKeys.map(chain => shouldBePresent(chainShares[chain])),
    ...(keyShareMldsa !== undefined ? [keyShareMldsa] : []),
  ]

  const out = await transform(flat)

  const keyShareCount = keyShareAlgos.length
  const chainCount = chainKeys.length

  return {
    keyShares: recordFromKeys(keyShareAlgos, (_algo, index) => out[index]),
    chainKeyShares: chainKeyShares
      ? recordFromKeys(chainKeys, (_chain, index) => out[keyShareCount + index])
      : undefined,
    keyShareMldsa:
      keyShareMldsa !== undefined ? out[keyShareCount + chainCount] : undefined,
  }
}

/**
 * Encrypt a vault's key shares at rest with the passcode cipher (PBKDF2 +
 * AES-256-GCM, one derivation per vault). See {@link encryptWithPasscode}.
 */
export const encryptVaultAllKeyShares = ({
  key,
  ...allKeyShares
}: EncryptInput): Promise<VaultAllKeyShares> =>
  mapAllKeyShareValues({
    allKeyShares,
    transform: async values =>
      (
        await encryptWithPasscode({
          passcode: key,
          values: values.map(value => Buffer.from(value, plainTextEncoding)),
        })
      ).map(blob => blob.toString(encryptedEncoding)),
  })

/**
 * Decrypt a vault's key shares. New-format shares share one PBKDF2 derivation;
 * legacy `SHA-256(passcode)` shares fall back transparently.
 */
export const decryptVaultAllKeyShares = ({
  key,
  ...allKeyShares
}: EncryptInput): Promise<VaultAllKeyShares> =>
  mapAllKeyShareValues({
    allKeyShares,
    transform: async values =>
      (
        await decryptWithPasscode({
          passcode: key,
          values: values.map(value => Buffer.from(value, encryptedEncoding)),
        })
      ).map(plaintext => plaintext.toString(plainTextEncoding)),
  })

const getAllKeyShareValues = ({
  keyShares,
  chainKeyShares,
  keyShareMldsa,
}: VaultAllKeyShares): string[] => [
  ...Object.values(keyShares),
  ...Object.values(chainKeyShares ?? {}),
  ...(keyShareMldsa !== undefined ? [keyShareMldsa] : []),
]

/**
 * Detects the self-identifying PBKDF2 ciphertext format used for passcode
 * encryption. This lets startup fail closed when the encryption proof has
 * disappeared while encrypted shares remain on disk.
 */
export const hasPasscodeEncryptedVaultKeyShare = (
  allKeyShares: VaultAllKeyShares
): boolean =>
  getAllKeyShareValues(allKeyShares).some(value =>
    isPasscodeEncryptedBlob(Buffer.from(value, encryptedEncoding))
  )

export class UnreadableVaultKeySharesError extends Error {
  name = 'UnreadableVaultKeySharesError'
  cause?: unknown

  constructor(cause?: unknown) {
    super(
      'Vault key shares cannot be decrypted. Restore the Vault from a .vult backup.'
    )
    this.cause = cause
  }
}

export class LegacyVaultKeyShareValidatorUnavailableError extends Error {
  name = 'LegacyVaultKeyShareValidatorUnavailableError'

  constructor() {
    super('Legacy vault keyshare validation is unavailable')
  }
}

/**
 * Validates the plaintext legacy keyshare shape and its public-key identity.
 */
const assertLegacyKeyShareReadable = (
  value: string,
  expectedPublicKey: string
): void => {
  const parsed: unknown = JSON.parse(value)

  if (
    !parsed ||
    typeof parsed !== 'object' ||
    !('pub_key' in parsed) ||
    parsed.pub_key !== expectedPublicKey ||
    !('local_party_key' in parsed) ||
    typeof parsed.local_party_key !== 'string' ||
    !('keygen_committee_keys' in parsed) ||
    !Array.isArray(parsed.keygen_committee_keys)
  ) {
    throw new Error('Invalid legacy keyshare')
  }
}

const assertMpcKeyShareReadable = async (
  value: string,
  signatureAlgorithm: 'ecdsa' | 'eddsa',
  expectedPublicKey?: string
): Promise<void> => {
  if (!value) {
    throw new Error('Missing MPC keyshare')
  }

  await initializeMpcLib(signatureAlgorithm)
  const keyshare = toMpcLibKeyshare({ keyShare: value, signatureAlgorithm })

  try {
    const publicKey = Buffer.from(keyshare.publicKey()).toString('hex')
    if (
      !publicKey ||
      (expectedPublicKey &&
        publicKey.toLowerCase() !== expectedPublicKey.toLowerCase())
    ) {
      throw new Error('Invalid MPC keyshare')
    }
  } finally {
    keyshare.free?.()
  }
}

const assertMldsaKeyShareReadable = async (
  value: string,
  expectedPublicKey?: string
): Promise<void> => {
  await initializeMldsaLib()
  const keyshare = MldsaKeyshare.fromBytes(
    Buffer.from(value, encryptedEncoding)
  )

  try {
    const publicKey = Buffer.from(keyshare.publicKey()).toString('hex')
    if (
      !publicKey ||
      (expectedPublicKey &&
        publicKey.toLowerCase() !== expectedPublicKey.toLowerCase())
    ) {
      throw new Error('Invalid MLDSA keyshare')
    }
  } finally {
    keyshare.free()
  }
}

type LegacyVaultKeyShareValidator = (
  keyShares: Vault['keyShares']
) => Promise<void>

type AssertVaultKeySharesReadableInput = VaultAllKeyShares &
  Pick<
    Vault,
    'chainPublicKeys' | 'libType' | 'publicKeyMldsa' | 'publicKeys'
  > & {
    validateLegacyVaultKeyShares?: LegacyVaultKeyShareValidator
  }

/**
 * Proves that every non-empty plaintext share can be deserialized by the MPC
 * implementation that will consume it. This rejects ciphertext (including
 * legacy or truncated envelopes) and arbitrary/corrupted plaintext before a
 * vault is exposed to the UI or backup pipeline.
 */
export const assertVaultKeySharesReadable = async ({
  keyShares,
  chainKeyShares,
  keyShareMldsa,
  publicKeys,
  chainPublicKeys,
  publicKeyMldsa,
  libType,
  validateLegacyVaultKeyShares,
}: AssertVaultKeySharesReadableInput): Promise<void> => {
  try {
    if (libType === 'GG20') {
      if (!validateLegacyVaultKeyShares) {
        throw new LegacyVaultKeyShareValidatorUnavailableError()
      }

      assertLegacyKeyShareReadable(keyShares.ecdsa, publicKeys.ecdsa)
      assertLegacyKeyShareReadable(keyShares.eddsa, publicKeys.eddsa)
      await validateLegacyVaultKeyShares(keyShares)
    } else {
      if (
        !getAllKeyShareValues({
          keyShares,
          chainKeyShares,
          keyShareMldsa,
        }).some(Boolean)
      ) {
        throw new Error('Vault has no keyshares')
      }

      if (libType === 'DKLS' || keyShares.ecdsa) {
        await assertMpcKeyShareReadable(
          keyShares.ecdsa,
          'ecdsa',
          publicKeys.ecdsa
        )
      }

      if (libType === 'DKLS' || keyShares.eddsa) {
        await assertMpcKeyShareReadable(
          keyShares.eddsa,
          'eddsa',
          publicKeys.eddsa
        )
      }
    }

    await Promise.all(
      getRecordKeys(chainKeyShares ?? {}).map(chain => {
        const value = shouldBePresent(chainKeyShares?.[chain])
        const signatureAlgorithm = getSignatureAlgorithm(chain)

        return signatureAlgorithm === 'mldsa'
          ? assertMldsaKeyShareReadable(value, chainPublicKeys?.[chain])
          : assertMpcKeyShareReadable(
              value,
              signatureAlgorithm,
              chainPublicKeys?.[chain]
            )
      })
    )

    if (keyShareMldsa) {
      await assertMldsaKeyShareReadable(keyShareMldsa, publicKeyMldsa)
    }
  } catch (error) {
    if (error instanceof LegacyVaultKeyShareValidatorUnavailableError) {
      throw error
    }

    throw new UnreadableVaultKeySharesError(error)
  }
}

type ReadVaultAllKeySharesInput = VaultAllKeyShares & {
  hasPasscodeEncryption: boolean
  key: string | null
} & Pick<
    Vault,
    'chainPublicKeys' | 'libType' | 'publicKeyMldsa' | 'publicKeys'
  > & { validateLegacyVaultKeyShares?: LegacyVaultKeyShareValidator }

/**
 * Resolves shares for a consumer without ever falling back to stored
 * ciphertext. A proof requires a passcode and successful decryption; no proof
 * requires shares that are already plaintext.
 */
export const readVaultAllKeyShares = async ({
  hasPasscodeEncryption,
  key,
  libType,
  publicKeys,
  chainPublicKeys,
  publicKeyMldsa,
  validateLegacyVaultKeyShares,
  ...allKeyShares
}: ReadVaultAllKeySharesInput): Promise<VaultAllKeyShares> => {
  if (!hasPasscodeEncryption) {
    await assertVaultKeySharesReadable({
      ...allKeyShares,
      libType,
      publicKeys,
      chainPublicKeys,
      publicKeyMldsa,
      validateLegacyVaultKeyShares,
    })
    return allKeyShares
  }

  if (!key) {
    throw new UnreadableVaultKeySharesError()
  }

  try {
    const decrypted = await decryptVaultAllKeyShares({
      ...allKeyShares,
      key,
    })
    await assertVaultKeySharesReadable({
      ...decrypted,
      libType,
      publicKeys,
      chainPublicKeys,
      publicKeyMldsa,
      validateLegacyVaultKeyShares,
    })
    return decrypted
  } catch {
    // Disabling a passcode writes plaintext shares before it clears the
    // encryption proof. If the app stops between those two durable writes, a
    // later unlock still sees the stale proof. Accept the stored values only
    // when their MPC public-key identity proves they are already plaintext;
    // ciphertext and malformed values continue to fail this validation.
    await assertVaultKeySharesReadable({
      ...allKeyShares,
      libType,
      publicKeys,
      chainPublicKeys,
      publicKeyMldsa,
      validateLegacyVaultKeyShares,
    })
    return allKeyShares
  }
}

type MapVaultsKeySharesInput = {
  vaults: Vault[]
  transform: (vault: Vault) => Promise<VaultAllKeyShares>
}

/**
 * Re-key every vault's shares concurrently, returning a `vaultId -> shares` map
 * for `updateVaultsKeyShares`. Derivations run in parallel (WebCrypto), so bulk
 * passcode set/change/disable does not serialize one ~derivation per vault.
 */
export const mapVaultsKeyShares = async ({
  vaults,
  transform,
}: MapVaultsKeySharesInput): Promise<Record<string, VaultAllKeyShares>> =>
  Object.fromEntries(
    await Promise.all(
      vaults.map(
        async (vault): Promise<[string, VaultAllKeyShares]> => [
          getVaultId(vault),
          await transform(vault),
        ]
      )
    )
  )

/**
 * A stored passcode-encrypted blob is legacy when it lacks the PBKDF2 magic
 * header (i.e. it still uses the weak `SHA-256(passcode)` KDF). Applies to both
 * key shares and the passcode sample.
 */
export const isLegacyEncryptedPasscodeBlob = (value: string): boolean =>
  isLegacyPasscodeBlob(Buffer.from(value, encryptedEncoding))

const storedKeyShareValues = ({
  keyShares,
  chainKeyShares,
  keyShareMldsa,
}: VaultAllKeyShares): string[] =>
  [
    ...Object.values(keyShares),
    ...Object.values(chainKeyShares ?? {}),
    ...(keyShareMldsa ? [keyShareMldsa] : []),
  ].filter((value): value is string => Boolean(value))

/**
 * Whether any of a vault's encrypted shares still use the legacy
 * `SHA-256(passcode)` KDF and should be re-encrypted with PBKDF2 on unlock.
 * Only meaningful while passcode encryption is enabled.
 */
export const vaultKeySharesNeedPasscodeUpgrade = (
  allKeyShares: VaultAllKeyShares
): boolean =>
  storedKeyShareValues(allKeyShares).some(isLegacyEncryptedPasscodeBlob)

/**
 * Whether a vault's stored shares are recognizably sealed with the passcode
 * cipher. This is what makes sealed shares self-describing: the app can tell a
 * passcode is in play from the shares alone, without the separate proof that a
 * half-landed write may have left behind.
 */
export const vaultKeySharesArePasscodeEncrypted = (
  allKeyShares: VaultAllKeyShares
): boolean =>
  storedKeyShareValues(allKeyShares).some(value =>
    isPasscodeEncryptedBlob(Buffer.from(value, encryptedEncoding))
  )
