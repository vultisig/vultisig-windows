import { Chain } from '@vultisig/core-chain/Chain'

import { getChainDisplayName } from './getChainDisplayName'

type MatchesChainSearchInput = {
  chain: Chain
  query: string
}

/**
 * Case-insensitive chain search against both the display name and the chain
 * identifier, so "terra c" and "terrac" both find Terra Classic.
 */
export const matchesChainSearch = ({
  chain,
  query,
}: MatchesChainSearchInput) => {
  const normalizedQuery = query.toLowerCase()

  return [getChainDisplayName(chain), chain].some(name =>
    name.toLowerCase().includes(normalizedQuery)
  )
}
