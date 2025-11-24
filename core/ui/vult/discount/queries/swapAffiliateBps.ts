import { getSwapAffiliateBpsFromTier } from '@core/chain/swap/affiliate'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'

import { useVultDiscountTierQuery } from './tier'

export const useSwapAffiliateBpsQuery = () => {
  const tierQuery = useVultDiscountTierQuery()

  return useTransformQueryData(tierQuery, getSwapAffiliateBpsFromTier)
}
