import { Chain } from '@vultisig/core-chain/Chain'
import { chainsWithTokenMetadataDiscovery } from '@vultisig/core-chain/coin/token/metadata/chains'
import { isOneOf } from '@vultisig/lib-utils/array/isOneOf'

type CanAddCustomTokenInput = {
  chain: Chain
  searchQuery: string
  /** The picker's extra chain restriction, if it has one; allows all when omitted. */
  chainFilter?: (chain: Chain) => boolean
}

/**
 * Whether the swap asset picker's empty state should offer the custom-token
 * flow. Requires a query, so the CTA can't stand in for an empty chain list; a
 * chain the flow can actually resolve metadata for; and a chain the picker's
 * own filter accepts, since a filter the pair's chain fails hides the added
 * token right back. Each condition exists to keep the CTA from dead-ending the
 * user a second time.
 */
export const canAddCustomToken = ({
  chain,
  searchQuery,
  chainFilter,
}: CanAddCustomTokenInput) =>
  Boolean(searchQuery.trim()) &&
  isOneOf(chain, chainsWithTokenMetadataDiscovery) &&
  (chainFilter?.(chain) ?? true)
