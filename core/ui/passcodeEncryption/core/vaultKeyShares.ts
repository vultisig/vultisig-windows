import {
  getVaultId,
  Vault,
  VaultAllKeyShares,
} from '@vultisig/core-mpc/vault/Vault'
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

/**
 * Whether any of a vault's encrypted shares still use the legacy
 * `SHA-256(passcode)` KDF and should be re-encrypted with PBKDF2 on unlock.
 * Only meaningful while passcode encryption is enabled.
 */
export const vaultKeySharesNeedPasscodeUpgrade = ({
  keyShares,
  chainKeyShares,
  keyShareMldsa,
}: VaultAllKeyShares): boolean => {
  const values = [
    ...Object.values(keyShares),
    ...Object.values(chainKeyShares ?? {}),
    ...(keyShareMldsa ? [keyShareMldsa] : []),
  ].filter((value): value is string => Boolean(value))

  return values.some(isLegacyEncryptedPasscodeBlob)
}
