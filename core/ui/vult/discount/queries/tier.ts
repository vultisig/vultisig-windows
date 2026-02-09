import { getVultDiscountTier } from '@core/chain/swap/affiliate'
import { useCombineQueries } from '@lib/ui/query/hooks/useCombineQueries'

import { useVultBalanceQuery } from '../../queries/balance'
import { useThorguardNftBalanceQuery } from '../../queries/thorguardNftBalance'

export const useVultDiscountTierQuery = () => {
  return useCombineQueries({
    queries: {
      vultBalance: useVultBalanceQuery(),
      thorguardNftBalance: useThorguardNftBalanceQuery(),
    },
    joinData: getVultDiscountTier,
    eager: false,
  })
}
