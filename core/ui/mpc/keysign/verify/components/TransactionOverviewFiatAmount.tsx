import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useFormatFiatAmount } from '@core/ui/chain/hooks/useFormatFiatAmount'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { CoinKey } from '@vultisig/core-chain/coin/Coin'

type TransactionOverviewFiatAmountProps = {
  coin: CoinKey
  amount: number
}

/**
 * Renders the fiat equivalent of a token amount in the transaction overview
 * hero, mirroring the swap verify layout. Stays silent (renders nothing) when
 * the coin has no price so the amount line is never left with a dangling label.
 */
export const TransactionOverviewFiatAmount = ({
  coin,
  amount,
}: TransactionOverviewFiatAmountProps) => {
  const query = useCoinPriceQuery({ coin })
  const formatFiatAmount = useFormatFiatAmount()

  return (
    <MatchQuery
      value={query}
      error={() => null}
      pending={() => <Skeleton width="3em" height="1em" />}
      success={price =>
        price ? (
          <Text as="span" color="shy" size={13}>
            {formatFiatAmount(amount * price)}
          </Text>
        ) : null
      }
    />
  )
}
