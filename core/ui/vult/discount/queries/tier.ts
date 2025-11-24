import { getVultDiscountTier } from '@core/chain/swap/affiliate'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'

import { useVultBalanceQuery } from '../../queries/balance'
import { useThorguardNftBalanceQuery } from '../../queries/thorguardNftBalance'

export const useVultDiscountTierQuery = () => {
  return useTransformQueriesData(
    {
      vultBalance: useVultBalanceQuery(),
      thorguardNftBalance: useThorguardNftBalanceQuery(),
    },
    getVultDiscountTier
  )
}
