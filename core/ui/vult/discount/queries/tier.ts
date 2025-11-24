import { getVultDiscountTier } from '@core/chain/swap/affiliate'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'

import { useVultBalanceQuery } from '../../queries/balance'
import { useHasThorguardNftQuery } from './hasThorguardNft'

export const useVultDiscountTierQuery = () => {
  return useTransformQueriesData(
    {
      vultBalance: useVultBalanceQuery(),
      hasThorguardNft: useHasThorguardNftQuery(),
    },
    getVultDiscountTier
  )
}
