import { ValueProp } from '@lib/ui/props'
import { MatchEagerQuery } from '@lib/ui/query/components/MatchEagerQuery'

import { Skeleton } from '../../../../components/skeleton'
import { useSwapFiatFeesQuery } from '../../queries/useSwapFiatFeesQuery'
import { SwapFee } from '../../types/SwapFee'

export const SwapFeeFiatValue = ({ value }: ValueProp<SwapFee[]>) => {
  const pricesQuery = useSwapFiatFeesQuery(value)

  return (
    <MatchEagerQuery
      value={pricesQuery}
      pending={() => <Skeleton as="span" width="44px" height="12px" />}
      success={value => value}
    />
  )
}
