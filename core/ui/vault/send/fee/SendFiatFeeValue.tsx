import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { VStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { useEffect } from 'react'

import { useCurrentSendCoin } from '../state/sendCoin'
import { useSendFees } from '../state/sendFees'
import { useSendChainSpecific } from './SendChainSpecificProvider'

export const SendFiatFeeValue = () => {
  const coin = useCurrentSendCoin()
  const [, setFees] = useSendFees()
  const fiatCurrency = useFiatCurrency()
  const chainSpecific = useSendChainSpecific()
  const fee = getFeeAmount(chainSpecific)

  const feeCoin = chainFeeCoin[coin.chain]
  const { isPending, data: price } = useCoinPriceQuery({
    coin: feeCoin,
  })

  const { decimals: feeCoinDecimals, ticker: feeCoinTicker } = feeCoin

  const humanReadableFeeValue = fromChainAmount(fee, feeCoinDecimals)

  let formattedAmount: string | null = null

  useEffect(() => {
    if (!formattedAmount) return

    setFees({
      type: 'send',
      networkFeesFormatted: formattedAmount,
    })
  }, [formattedAmount, setFees])

  if (isPending)
    return (
      <VStack>
        <Skeleton width="88" height="12" />
        <Skeleton width="48" height="12" />
      </VStack>
    )

  if (!price || !humanReadableFeeValue) return null

  formattedAmount = formatAmount(humanReadableFeeValue * price, fiatCurrency)
  return (
    <VStack alignItems="flex-end">
      <Text size={14}>
        {formatTokenAmount(humanReadableFeeValue, feeCoinTicker)}
      </Text>
      <Text size={14} color="shy">
        {formattedAmount}
      </Text>
    </VStack>
  )
}
