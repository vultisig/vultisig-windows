import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { VStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'

import { useFormatFiatAmount } from '../../../chain/hooks/useFormatFiatAmount'
import { useCurrentSendCoin } from '../state/sendCoin'
import { useSendChainSpecific } from './SendChainSpecificProvider'

export const SendFiatFeeValue = () => {
  const { chain } = useCurrentSendCoin()
  const chainSpecific = useSendChainSpecific()
  const fee = getFeeAmount(chainSpecific)

  const coin = chainFeeCoin[chain]
  const formatFiatAmount = useFormatFiatAmount()
  const feeCoinPriceQuery = useCoinPriceQuery({
    coin,
  })

  const { decimals, ticker } = coin

  const humanReadableFeeValue = fromChainAmount(fee, decimals)

  return (
    <MatchQuery
      value={feeCoinPriceQuery}
      pending={() => (
        <VStack>
          <Skeleton width="88" height="12" />
          <Skeleton width="48" height="12" />
        </VStack>
      )}
      success={price => (
        <VStack alignItems="flex-end">
          <Text size={14}>
            {formatAmount(humanReadableFeeValue, { ticker })}
          </Text>
          <Text size={14} color="shy">
            {formatFiatAmount(humanReadableFeeValue * price)}
          </Text>
        </VStack>
      )}
    />
  )
}
