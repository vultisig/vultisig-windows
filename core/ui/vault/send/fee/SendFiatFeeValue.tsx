import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { VStack } from '@lib/ui/layout/Stack'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'
import { useEffect } from 'react'

import { useCoreViewState } from '../../../navigation/hooks/useCoreViewState'
import { useSendFees } from '../state/sendFees'
import { useSendChainSpecific } from './SendChainSpecificProvider'

export const SendFiatFeeValue = () => {
  const [{ coin: coinKey }] = useCoreViewState<'send'>()
  const [, setFees] = useSendFees()
  const fiatCurrency = useFiatCurrency()
  const chainSpecific = useSendChainSpecific()
  const fee = getFeeAmount(chainSpecific)
  const coin = useCurrentVaultCoin(coinKey)

  const { isPending, data: price } = useCoinPriceQuery({
    coin,
  })

  const { decimals } = chainFeeCoin[coinKey.chain]
  const humanReadableFeeValue = fromChainAmount(fee, decimals)

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
    <VStack>
      <Text size={14}>
        {humanReadableFeeValue} {coinKey.id}
      </Text>
      <Text size={14} color="shy">
        {formattedAmount}
      </Text>
    </VStack>
  )
}
