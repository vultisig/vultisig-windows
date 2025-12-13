import { Chain } from '@core/chain/Chain'
import { featureFlags } from '@core/ui/featureFlags'

import { DefiChainPositions } from './types'
import { useMayaDefiPositionsQuery } from './useMayaDefiPositionsQuery'
import { useThorchainDefiPositionsQuery } from './useThorchainDefiPositionsQuery'

type DefiPositionsQueryResult = {
  data?: DefiChainPositions
  isPending: boolean
  error: unknown
  refetch: () => Promise<unknown>
}

export const useDefiChainPositionsQuery = (
  chain: Chain
): DefiPositionsQueryResult => {
  const thorchainQuery = useThorchainDefiPositionsQuery({
    enabled: chain === Chain.THORChain,
  })
  const mayaQuery = useMayaDefiPositionsQuery({
    enabled: featureFlags.mayaChainDefi && chain === Chain.MayaChain,
  })

  if (chain === Chain.THORChain) {
    return {
      data: thorchainQuery.data,
      isPending: thorchainQuery.isPending,
      error: thorchainQuery.error,
      refetch: thorchainQuery.refetch,
    }
  }

  if (chain === Chain.MayaChain) {
    return {
      data: mayaQuery.data,
      isPending: mayaQuery.isPending,
      error: mayaQuery.error,
      refetch: mayaQuery.refetch,
    }
  }

  return {
    data: undefined,
    isPending: false,
    error: undefined,
    refetch: async () => undefined,
  }
}
