import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'

import { useCircleAccountUsdcFiatBalanceQuery } from '../queries/useCircleAccountUsdcFiatBalanceQuery'

export const CircleAccountFiatBalance = () => {
  const query = useCircleAccountUsdcFiatBalanceQuery()
  const formatFiatAmount = useFormatFiatAmount()

  return (
    <MatchQuery
      value={query}
      success={formatFiatAmount}
      inactive={() => formatFiatAmount(0)}
    />
  )
}
