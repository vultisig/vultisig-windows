import { getBalanceQueryOptions } from '@core/ui/chain/coin/queries/useBalancesQuery'
import { useQueryDependentQuery } from '@lib/ui/query/hooks/useQueryDependentQuery'
import { useTransformQueryData } from '@lib/ui/query/hooks/useTransformQueryData'
import { Query } from '@lib/ui/query/Query'
import { extractAccountCoinKey } from '@vultisig/core-chain/coin/AccountCoin'
import { usdc } from '@vultisig/core-chain/coin/knownTokens'

import { useCircleAccountQuery } from './circleAccount'

export const useCircleAccountUsdcBalanceQuery = (): Query<bigint> => {
  const accountQuery = useCircleAccountQuery()

  const balanceQuery = useQueryDependentQuery(
    { ...accountQuery, data: accountQuery.data?.address },
    address =>
      getBalanceQueryOptions(extractAccountCoinKey({ ...usdc, address }))
  )

  return useTransformQueryData(balanceQuery, data => Object.values(data)[0])
}
