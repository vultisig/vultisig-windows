import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { usdc } from '@core/chain/coin/knownTokens'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { formatAmount } from '@lib/utils/formatAmount'

import { useCircleAccountUsdcBalanceQuery } from '../queries/circleAccountUsdcBalance'

export const CircleAccountBalance = () => {
  const circleAccountUsdcBalanceQuery = useCircleAccountUsdcBalanceQuery()

  return (
    <MatchQuery
      value={circleAccountUsdcBalanceQuery}
      success={balance =>
        formatAmount(fromChainAmount(balance, usdc.decimals), {
          ticker: usdc.ticker,
        })
      }
    />
  )
}
