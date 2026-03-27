import { Chain } from '../Chain'
import { ChainKind, getChainKind } from '../ChainKind'

export const signingAlgorithms = ['ecdsa', 'eddsa', 'mldsa'] as const

export type SignatureAlgorithm = (typeof signingAlgorithms)[number]

/** Algorithms that use the DKLS/Schnorr MPC libraries (not MLDSA). */
export type TssSignatureAlgorithm = Exclude<SignatureAlgorithm, 'mldsa'>

/** Subset of signing algorithms used by TSS (DKLS/Schnorr). */
export const tssSigningAlgorithms = ['ecdsa', 'eddsa'] as const

const signatureAlgorithmByChainKind: Record<ChainKind, TssSignatureAlgorithm> =
  {
    evm: 'ecdsa',
    utxo: 'ecdsa',
    cosmos: 'ecdsa',
    sui: 'eddsa',
    solana: 'eddsa',
    polkadot: 'eddsa',
    bittensor: 'eddsa',
    ton: 'eddsa',
    ripple: 'ecdsa',
    tron: 'ecdsa',
    cardano: 'eddsa',
  }

const signatureAlgorithmOverrides: Partial<Record<Chain, SignatureAlgorithm>> =
  {
    [Chain.QBTC]: 'mldsa',
  }

/** @deprecated Use `getSignatureAlgorithm` instead for chain-level accuracy. */
export const signatureAlgorithms = signatureAlgorithmByChainKind

/** Returns the signing algorithm for a specific chain, with per-chain overrides. */
export const getSignatureAlgorithm = (chain: Chain): SignatureAlgorithm =>
  signatureAlgorithmOverrides[chain] ??
  signatureAlgorithmByChainKind[getChainKind(chain)]
