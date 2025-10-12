import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getFeeAmount } from '@core/chain/feeQuote/getFeeAmount'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { VStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'

import { useFormatFiatAmount } from '../../../chain/hooks/useFormatFiatAmount'
import { useSendFeeQuoteQuery } from '../queries/useSendFeeQuoteQuery'
import { useCurrentSendCoin } from '../state/sendCoin'

export const SendFeeValue = () => {
  const coin = useCurrentSendCoin()
  const { chain } = coin

  const feeQuoteQuery = useSendFeeQuoteQuery()
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
