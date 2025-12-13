import { useQueryDependentQuery } from '@lib/ui/query/hooks/useQueryDependentQuery'
import { Query } from '@lib/ui/query/Query'

import { getCircleAccountUsdcBalance } from '../core/getCircleAccountUsdcBalance'
import { useCircleAccountQuery } from './circleAccount'

const getCircleAccountUsdcBalanceQueryKey = (walletId: string) =>
  ['circle-account-usdc-balance', walletId] as const

export const useCircleAccountUsdcBalanceQuery = (): Query<bigint> => {
  const accountQuery = useCircleAccountQuery()

  return useQueryDependentQuery(
    { ...accountQuery, data: accountQuery.data?.id },
    walletId => ({
      queryKey: getCircleAccountUsdcBalanceQueryKey(walletId),
      queryFn: () => getCircleAccountUsdcBalance(walletId),
    })
  )
}
