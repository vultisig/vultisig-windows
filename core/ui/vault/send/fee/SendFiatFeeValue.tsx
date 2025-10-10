import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getFeeAmount } from '@core/chain/fee-quote/getFeeAmount'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { VStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { useTransformQueriesData } from '@lib/ui/query/hooks/useTransformQueriesData'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'
import { useCallback } from 'react'

import { useFeeQuoteQuery } from '../../../chain/fee-quote/query'
import { useFormatFiatAmount } from '../../../chain/hooks/useFormatFiatAmount'
import { useCurrentSendCoin } from '../state/sendCoin'

export const SendFiatFeeValue = () => {
  const coin = useCurrentSendCoin()
  const { chain } = coin

  const feeQuoteQuery = useFeeQuoteQuery()
  const formatFiatAmount = useFormatFiatAmount()

  const { decimals, ticker } = chainFeeCoin[chain]

  const feePriceQuery = useCoinPriceQuery({ coin: chainFeeCoin[chain] })

  const query = useTransformQueriesData(
    { feeQuote: feeQuoteQuery, price: feePriceQuery },
    useCallback(
      ({ feeQuote, price }) => {
        const fee = getFeeAmount(chain, feeQuote)
        const humanReadableFeeValue = fromChainAmount(fee, decimals)
        return {
          display: formatAmount(humanReadableFeeValue, { ticker }),
          fiat: formatFiatAmount(humanReadableFeeValue * price),
        }
      },
      [chain, decimals, formatFiatAmount, ticker]
    )
  )

  return (
    <MatchQuery
      value={query}
      pending={() => (
        <VStack>
          <Skeleton width="88" height="12" />
          <Skeleton width="48" height="12" />
        </VStack>
      )}
      success={({ display, fiat }) => (
        <VStack alignItems="flex-end">
          <Text size={14}>{display}</Text>
          <Text size={14} color="shy">
            {fiat}
          </Text>
        </VStack>
      )}
    />
  )
}
