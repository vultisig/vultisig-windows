import { Chain } from '@vultisig/core-chain/Chain'
import { getChainKind } from '@vultisig/core-chain/ChainKind'
import { signatureAlgorithms } from '@vultisig/core-chain/signing/SignatureAlgorithm'

import {
  KeyImportCurve,
  KeyImportProtocolSpec,
  SharedMpcParams,
} from '../../../worker/keygenWorkerProtocol'
import { getKeyImportDerivationGroups } from './getKeyImportDerivationGroups'

type BuildKeyImportProtocolSpecsInput = {
  shared: SharedMpcParams
  hexChainCode: string
  derivationGroups: ReturnType<typeof getKeyImportDerivationGroups>
  /** Initiator uploads a setup per protocol; joiners receive them from the relay. */
  uploadSetup: boolean
  rootEcdsaPrivateKeyHex: string
  rootEddsaPrivateKeyHex: string
  /** Derives a chain's private key (initiator) — joiners return `''`. */
  getChainPrivateKeyHex: (input: {
    representativeChain: Chain
    curve: KeyImportCurve
  }) => string
}

/**
 * Builds the root + per-derivation-group protocol specs for a batch key import.
 * Both the initiating (create) and joining devices use this so their message
 * IDs match exactly: one keygen per derivation group keyed `p-${representativeChain}`,
 * plus the roots `p-ecdsa` / `p-eddsa`. (Iterating raw chains instead would make a
 * joiner request `p-${chain}` setups the initiator never creates for chains that
 * share a derivation path — a silent hang.) IDs match the server's /batch/import
 * handler.
 *
 * `chainsById` maps each protocol id back to the chains that share its key, so
 * the caller can fan one keyshare out to every chain in the group.
 */
export const buildKeyImportProtocolSpecs = ({
  shared,
  hexChainCode,
  derivationGroups,
  uploadSetup,
  rootEcdsaPrivateKeyHex,
  rootEddsaPrivateKeyHex,
  getChainPrivateKeyHex,
}: BuildKeyImportProtocolSpecsInput): {
  specs: KeyImportProtocolSpec[]
  chainsById: Map<string, Chain[]>
} => {
  const chainsById = new Map<string, Chain[]>()

  const rootSpecs: KeyImportProtocolSpec[] = [
    {
      id: 'p-ecdsa',
      curve: 'ecdsa',
      uploadSetup,
      privateKeyHex: rootEcdsaPrivateKeyHex,
      hexChainCode,
      setupMessageId: undefined,
      protocolMessageId: 'p-ecdsa',
      shared,
    },
    {
      id: 'p-eddsa',
      curve: 'eddsa',
      uploadSetup,
      privateKeyHex: rootEddsaPrivateKeyHex,
      hexChainCode,
      setupMessageId: 'eddsa_key_import',
      protocolMessageId: 'p-eddsa',
      shared,
    },
  ]

  const chainSpecs = derivationGroups.map(
    ({ representativeChain, chains: groupChains }): KeyImportProtocolSpec => {
      // Per-chain key-import groups run on DKLS (ecdsa) or Schnorr (everything
      // else), matching the original `algorithm === 'ecdsa' ? DKLS : Schnorr`
      // branch. ML-DSA chains never reach here — ML-DSA is a separate root.
      const curve: KeyImportCurve =
        signatureAlgorithms[getChainKind(representativeChain)] === 'ecdsa'
          ? 'ecdsa'
          : 'eddsa'
      const id = `p-${representativeChain}`
      chainsById.set(id, groupChains)

      return {
        id,
        curve,
        uploadSetup,
        privateKeyHex: getChainPrivateKeyHex({ representativeChain, curve }),
        hexChainCode,
        setupMessageId: representativeChain,
        protocolMessageId: id,
        shared,
      }
    }
  )

  return { specs: [...rootSpecs, ...chainSpecs], chainsById }
}
