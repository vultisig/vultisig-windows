import { Chain } from '@vultisig/core-chain/Chain'
import { getChainKind } from '@vultisig/core-chain/ChainKind'
import {
  SignatureAlgorithm,
  signatureAlgorithms,
} from '@vultisig/core-chain/signing/SignatureAlgorithm'

/** Relay routing for one chain's KeyImport MPC session. */
export type KeyImportChainSession = {
  chain: Chain
  algorithm: SignatureAlgorithm
  setupMessageId: string
  protocolMessageId: string
}

/** One session per chain, routed by chain name like iOS, Android and Vultiserver. */
export const getKeyImportChainSessions = (
  chains: readonly Chain[]
): KeyImportChainSession[] =>
  chains.map(chain => ({
    chain,
    algorithm: signatureAlgorithms[getChainKind(chain)],
    setupMessageId: chain,
    protocolMessageId: `p-${chain}`,
  }))
