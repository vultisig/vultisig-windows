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
  Vault_KeyShareSchema,
} from '@vultisig/core-mpc/types/vultisig/vault/v1/vault_pb'

const chainValues = new Set<string>(Object.values(Chain))
const isChain = (value: string): value is Chain => chainValues.has(value)

/**
 * iOS `.vult` exports label keyShares with per-chain derived public keys
 * rather than the master `publicKeyEcdsa` / `publicKeyEddsa`. Extension's
 * `fromCommVault` expects a keyShare entry whose publicKey equals the master,
 * so direct import fails. This synthesizes the missing master-keyed entries
 * by cloning the keyShare of any chain that uses the same signing algorithm
 * (all ECDSA shares in an MPC vault are the same share, just re-labeled).
 */
export const ensureMasterKeyShares = (commVault: Vault): Vault => {
  const masterPublicKeys: Record<SignatureAlgorithm, string | undefined> = {
    ecdsa: commVault.publicKeyEcdsa,
    eddsa: commVault.publicKeyEddsa,
    mldsa: commVault.publicKeyMldsa44 || undefined,
  }

  const missing = signingAlgorithms.filter(algorithm => {
    const masterKey = masterPublicKeys[algorithm]
    if (!masterKey) return false
    return !commVault.keyShares.some(
      keyShare => keyShare.publicKey === masterKey
    )
  })

  if (missing.length === 0) return commVault

  const synthesized = missing.flatMap(algorithm => {
    const masterKey = masterPublicKeys[algorithm]
    if (!masterKey) return []

    const chainEntry = commVault.chainPublicKeys.find(
      chainPublicKey =>
        isChain(chainPublicKey.chain) &&
        signatureAlgorithms[getChainKind(chainPublicKey.chain)] === algorithm
    )
    if (!chainEntry) return []

    const sourceKeyShare = commVault.keyShares.find(
      keyShare => keyShare.publicKey === chainEntry.publicKey
    )
    if (!sourceKeyShare) return []

    return [
      create(Vault_KeyShareSchema, {
        publicKey: masterKey,
        keyshare: sourceKeyShare.keyshare,
      }),
    ]
  })

  return {
    ...commVault,
    keyShares: [...commVault.keyShares, ...synthesized],
  }
}
