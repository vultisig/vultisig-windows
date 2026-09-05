import { Chain } from '@vultisig/core-chain/Chain'
import { chainsWithTokenMetadataDiscovery } from '@vultisig/core-chain/coin/token/metadata/chains'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'

type CanAddCustomTokenInput = {
  chain: Chain
  searchQuery: string
}

/**
 * Whether the swap asset picker's empty state should offer the custom-token
 * flow. Requires a query, so the CTA can't stand in for an empty chain list,
 * and a chain the flow can actually resolve metadata for — offering it
 * elsewhere would dead-end the user a second time.
 */
export const canAddCustomToken = ({
  chain,
  searchQuery,
}: CanAddCustomTokenInput) =>
  Boolean(searchQuery.trim()) &&
  isOneOf(chain, chainsWithTokenMetadataDiscovery)
