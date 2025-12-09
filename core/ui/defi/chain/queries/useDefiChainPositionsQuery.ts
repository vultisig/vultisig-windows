import { Chain } from '@core/chain/Chain'

import { ThorchainDefiPositions } from './types'
import { useThorchainDefiPositionsQuery } from './useThorchainDefiPositionsQuery'

type DefiPositionsQueryResult = {
  data?: ThorchainDefiPositions
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

  if (chain === Chain.THORChain) {
    return {
      data: thorchainQuery.data,
      isPending: thorchainQuery.isPending,
      error: thorchainQuery.error,
      refetch: thorchainQuery.refetch,
    }
  }

  return {
    data: undefined,
    isPending: false,
    error: undefined,
    refetch: async () => undefined,
  }
}
