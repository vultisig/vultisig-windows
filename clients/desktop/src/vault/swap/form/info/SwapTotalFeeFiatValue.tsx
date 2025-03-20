import { ValueProp } from '@lib/ui/props'

import { Skeleton } from '../../../../components/skeleton'
import { MatchEagerQuery } from '../../../../lib/ui/query/components/MatchEagerQuery'
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
