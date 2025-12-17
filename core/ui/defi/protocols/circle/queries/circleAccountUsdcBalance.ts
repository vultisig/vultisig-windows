import { useQueryDependentQuery } from '@lib/ui/query/hooks/useQueryDependentQuery'
import { Query } from '@lib/ui/query/Query'

import { getCircleAccountUsdcBalance } from '../core/getCircleAccountUsdcBalance'
import { useCircleAccountQuery } from './circleAccount'

const getCircleAccountUsdcBalanceQueryKey = (mscaAddress: string) =>
  ['circle-account-usdc-balance', mscaAddress] as const

export const useCircleAccountUsdcBalanceQuery = (): Query<bigint> => {
  const accountQuery = useCircleAccountQuery()

  return useQueryDependentQuery(
    { ...accountQuery, data: accountQuery.data?.address },
    mscaAddress => ({
      queryKey: getCircleAccountUsdcBalanceQueryKey(mscaAddress),
      queryFn: () => getCircleAccountUsdcBalance(mscaAddress),
    })
  )
}
