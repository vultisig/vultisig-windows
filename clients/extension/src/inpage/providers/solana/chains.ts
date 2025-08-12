import type { IdentifierString } from '@wallet-standard/base'

/** Solana Mainnet (beta) cluster, e.g. https://api.mainnet-beta.solana.com */
const SolanaMainnetChain = 'solana:mainnet'

/** Array of all Solana clusters */
export const SolanaChains = [SolanaMainnetChain] as const

/** Type of all Solana clusters */
export type SolanaChain = (typeof SolanaChains)[number]

/**
 * Check if a chain corresponds with one of the Solana clusters.
 */
export function isSolanaChain(chain: IdentifierString): chain is SolanaChain {
  return SolanaChains.includes(chain as SolanaChain)
}
