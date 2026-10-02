import { Chain } from '@vultisig/core-chain/Chain'

const chainDisplayNameOverrides: Partial<Record<Chain, string>> = {
  // The Open Network kept its name when its native token rebranded TON -> GRAM.
  [Chain.Ton]: 'TON (GRAM)',
}

/**
 * The name shown for a chain in the UI. The `Chain` value itself is an
 * identifier (storage keys, logo paths, keysign payloads) and never changes.
 */
export const getChainDisplayName = (chain: Chain): string =>
  chainDisplayNameOverrides[chain] ?? chain
