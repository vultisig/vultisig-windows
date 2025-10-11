import { SwapFee } from '@core/chain/swap/SwapFee'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'

import { useSwapFiatFeesQuery } from '../../queries/useSwapFiatFeesQuery'

export const SwapFeeFiatValue = ({ value }: ValueProp<SwapFee[]>) => {
  const pricesQuery = useSwapFiatFeesQuery(value)

  return (
    <MatchQuery
      value={pricesQuery}
      pending={() => <Skeleton as="span" width="44px" height="12px" />}
      success={value => value}
    />
  )
}
