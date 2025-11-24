import { getSwapAffiliateBps } from '@core/chain/swap/affiliate'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'

import { useVultBalanceQuery } from '../../../vult/queries/balance'

export const useSwapAffiliateBpsQuery = () => {
  return useTransformQueryData(useVultBalanceQuery(), getSwapAffiliateBps)
}
