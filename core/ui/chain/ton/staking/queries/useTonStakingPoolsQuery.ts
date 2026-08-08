import { useQuery } from '@tanstack/react-query'
import {
  getTonStakingPools,
  isStakeableTonPool,
} from '@vultisig/core-chain/chains/ton/staking'

/**
 * Fetches the stakeable TON nominator pools for the picker: verified nominator
 * implementations (`whales` / `tf`) with capacity, sorted by APY descending.
 * In practice only Whales pools are accessible (min ~50 TON); `tf` pools need
 * ~300k TON. Cached for 5 minutes — the pool list is slow-moving.
 */
export const useTonStakingPoolsQuery = () =>
  useQuery({
    queryKey: ['tonStakingPools'] as const,
    queryFn: async () => {
      const pools = await getTonStakingPools()
      return pools.filter(isStakeableTonPool).sort((a, b) => b.apy - a.apy)
    },
    staleTime: 5 * 60_000,
  })
