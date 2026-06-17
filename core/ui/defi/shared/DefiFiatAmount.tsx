import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Query } from '@lib/ui/query/Query'

type DefiFiatAmountProps = {
  query: Query<number>
}

/** Renders a fiat balance from a Query, falling back to 0 while loading. */
export const DefiFiatAmount = ({ query }: DefiFiatAmountProps) => {
  const formatFiatAmount = useFormatFiatAmount()

  return (
    <MatchQuery
      value={query}
      success={formatFiatAmount}
      inactive={() => formatFiatAmount(0)}
    />
  )
}
