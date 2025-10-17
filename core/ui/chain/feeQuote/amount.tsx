import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { Chain } from '@core/chain/Chain'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { FeeQuote } from '@core/chain/feeQuote/core'
import { getFeeAmount } from '@core/chain/feeQuote/getFeeAmount'
import { VStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Query } from '@lib/ui/query/Query'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'

import { useCoinPriceQuery } from '../coin/price/queries/useCoinPriceQuery'
import { useFormatFiatAmount } from '../hooks/useFormatFiatAmount'

type FeeAmountProps = {
  feeQuoteQuery: Query<FeeQuote>
  chain: Chain
}

export const FeeAmount = ({ feeQuoteQuery, chain }: FeeAmountProps) => {
  const formatFiatAmount = useFormatFiatAmount()

  const { decimals, ticker } = chainFeeCoin[chain]

  const feeCoinPriceQuery = useCoinPriceQuery({ coin: chainFeeCoin[chain] })

  return (
    <MatchQuery
      value={feeQuoteQuery}
      pending={() => (
        <VStack>
          <Skeleton width="88" height="12" />
          <Skeleton width="48" height="12" />
        </VStack>
      )}
      success={feeQuote => {
        const fee = fromChainAmount(getFeeAmount(chain, feeQuote), decimals)

        return (
          <VStack alignItems="flex-end">
            <Text size={14}>{formatAmount(fee, { ticker })}</Text>
            <Text size={14} color="shy">
              <MatchQuery
                value={feeCoinPriceQuery}
                pending={() => <Spinner />}
                success={price => formatFiatAmount(fee * price)}
              />
            </Text>
          </VStack>
        )
      }}
    />
  )
}
