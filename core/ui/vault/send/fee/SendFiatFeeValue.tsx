import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { VStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'

import { useCurrentSendCoin } from '../state/sendCoin'
import { useSendChainSpecific } from './SendChainSpecificProvider'

export const SendFiatFeeValue = () => {
  const coin = useCurrentSendCoin()
  const fiatCurrency = useFiatCurrency()
  const chainSpecific = useSendChainSpecific()
  const fee = getFeeAmount(chainSpecific)

  const feeCoin = chainFeeCoin[coin.chain]
  const feeCoinPriceQuery = useCoinPriceQuery({
    coin: feeCoin,
  })

  const { decimals: feeCoinDecimals, ticker: feeCoinTicker } = feeCoin

  const humanReadableFeeValue = fromChainAmount(fee, feeCoinDecimals)

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
            {formatTokenAmount(humanReadableFeeValue, feeCoinTicker)}
          </Text>
          <Text size={14} color="shy">
            {formatAmount(humanReadableFeeValue * price, fiatCurrency)}
          </Text>
        </VStack>
      )}
    />
  )
}
