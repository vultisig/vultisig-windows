import { Chain } from '@vultisig/core-chain/Chain'

import { fetchMayachainBondProviderRewards } from '../services/mayachainBondService'
import { fetchThorchainBondProviderRewards } from '../services/thorchainBondService'
import { BondChain } from './config'
import { BondProviderRewards } from './providerRewards'

type NodeAtHeightInput = {
  nodeAddress: string
  height: number
}

const bondProviderRewardsFetchers: Record<
  BondChain,
  (input: NodeAtHeightInput) => Promise<BondProviderRewards>
> = {
  [Chain.THORChain]: fetchThorchainBondProviderRewards,
  [Chain.MayaChain]: fetchMayachainBondProviderRewards,
}

type GetBondProviderRewardsQueryOptionsInput = NodeAtHeightInput & {
  chain: BondChain
}

/**
 * Query options for every bond provider's payout from the award a node held
 * at a past block. A past block never changes, so the result is cached by
 * node and height and never goes stale; the card's Last Reward and the
 * reward history share it.
 */
export const getBondProviderRewardsQueryOptions = ({
  chain,
  nodeAddress,
  height,
}: GetBondProviderRewardsQueryOptionsInput) => ({
  queryKey: ['defi', chain, 'bondProviderRewards', { nodeAddress, height }],
  queryFn: () => bondProviderRewardsFetchers[chain]({ nodeAddress, height }),
  staleTime: Infinity,
})
