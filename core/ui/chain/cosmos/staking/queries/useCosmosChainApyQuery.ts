import { useQuery } from '@tanstack/react-query'
import { IbcEnabledCosmosChain } from '@vultisig/core-chain/Chain'

import { getCosmosChainApyData } from './getCosmosChainApyData'

type UseCosmosChainApyQueryInput = {
  chain: IbcEnabledCosmosChain | undefined
  stakingDenom: string | undefined
}

/**
 * Chain-wide APY inputs (inflation / bonded_ratio / community_tax). Cached
 * 5 minutes — these change slowly (inflation drifts toward the bonded-ratio
 * target each epoch; community_tax only by governance). Disabled until
 * both `chain` and `stakingDenom` are known so the hook can be called
 * unconditionally regardless of caller state.
 */
export const useCosmosChainApyQuery = ({
  chain,
  stakingDenom,
}: UseCosmosChainApyQueryInput) =>
  useQuery({
    queryKey: ['cosmosChainApy', chain ?? '', stakingDenom ?? ''] as const,
    queryFn: () =>
      getCosmosChainApyData({
        chain: chain as IbcEnabledCosmosChain,
        stakingDenom: stakingDenom as string,
      }),
    enabled: chain !== undefined && stakingDenom !== undefined,
    staleTime: 5 * 60 * 1000,
  })
