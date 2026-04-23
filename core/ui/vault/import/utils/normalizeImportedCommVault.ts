import { create } from '@bufbuild/protobuf'
import { Chain } from '@vultisig/core-chain/Chain'
import { getChainKind } from '@vultisig/core-chain/ChainKind'
import {
  SignatureAlgorithm,
  signatureAlgorithms,
  signingAlgorithms,
} from '@vultisig/core-chain/signing/SignatureAlgorithm'
import {
  Vault,
  Vault_KeyShare,
  Vault_KeyShareSchema,
} from '@vultisig/core-mpc/types/vultisig/vault/v1/vault_pb'

const chainValues = new Set<string>(Object.values(Chain))
const isChain = (value: string): value is Chain => chainValues.has(value)

const dedupeByPublicKey = (
  keyShares: readonly Vault_KeyShare[]
): Vault_KeyShare[] => {
  const seen = new Set<string>()
  const result: Vault_KeyShare[] = []
  for (const keyShare of keyShares) {
    if (seen.has(keyShare.publicKey)) continue
    seen.add(keyShare.publicKey)
    result.push(keyShare)
  }
  return result
}

const synthesizeMasterKeyShares = (commVault: Vault): Vault_KeyShare[] => {
  const masterPublicKeys: Record<SignatureAlgorithm, string | undefined> = {
    ecdsa: commVault.publicKeyEcdsa,
    eddsa: commVault.publicKeyEddsa,
    mldsa: commVault.publicKeyMldsa44 || undefined,
  }

  return signingAlgorithms.flatMap(algorithm => {
    const masterKey = masterPublicKeys[algorithm]
    if (!masterKey) return []
    if (commVault.keyShares.some(ks => ks.publicKey === masterKey)) return []

    // Prefer a chain share that uses the same signing algorithm.
    const chainEntry = commVault.chainPublicKeys.find(
      chainPublicKey =>
        isChain(chainPublicKey.chain) &&
        signatureAlgorithms[getChainKind(chainPublicKey.chain)] === algorithm
    )
    const sourceKeyShare = chainEntry
      ? commVault.keyShares.find(ks => ks.publicKey === chainEntry.publicKey)
      : undefined

    // Fallback: iOS still populates publicKeyEcdsa / publicKeyEddsa from the
    // seed's root even when the user selected no chains of that algorithm,
    // so there is no chain share to clone from. fromCommVault still requires
    // a master-keyed entry, so emit an empty placeholder. For KeyImport
    // vaults the extension signs via chainKeyShares, never via the master
    // entry, so this placeholder is never exercised at sign time.
    return [
      create(Vault_KeyShareSchema, {
        publicKey: masterKey,
        keyshare: sourceKeyShare?.keyshare ?? '',
      }),
    ]
  })
}

/**
 * Adapts a parsed `CommVault` produced from an iOS (or other external) `.vult`
 * backup so that the extension's `fromCommVault` can consume it safely.
 *
 * iOS stores keyShares as a flat list keyed by per-chain derived public keys
 * and resolves them at sign time via `keyshares.first(where: pubkey == X)`.
 * The extension instead expects:
 *   1. a keyShare whose publicKey equals the master `publicKeyEcdsa` /
 *      `publicKeyEddsa` (used by `fromCommVault` to build the master-keyed
 *      `keyShares` record), and
 *   2. at most one keyShare per publicKey (its `chainKeyShares` assignment
 *      loop overwrites on collisions — last wins — which breaks when iOS
 *      emits multiple keyShares with the same publicKey for chains in the
 *      same BIP32 family).
 *
 * This helper therefore:
 *   - drops duplicate-publicKey keyShares, keeping the first occurrence to
 *     match iOS's `first(where:)` resolution;
 *   - synthesizes a master-keyed keyShare by cloning any chain share that
 *     uses the same signing algorithm, when the master entry is absent.
 */
export const normalizeImportedCommVault = (commVault: Vault): Vault => {
  const deduped = dedupeByPublicKey(commVault.keyShares)
  const base =
    deduped.length === commVault.keyShares.length
      ? commVault
      : { ...commVault, keyShares: deduped }

  const synthesized = synthesizeMasterKeyShares(base)
  if (synthesized.length === 0) return base

  return {
    ...base,
    keyShares: [...base.keyShares, ...synthesized],
  }
}
