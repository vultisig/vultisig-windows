import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useFiatCurrency } from '@core/ui/state/fiatCurrency'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { Spinner } from '@lib/ui/loaders/Spinner'
import { formatAmount } from '@lib/utils/formatAmount'
import { useEffect } from 'react'

import { useCurrentSendCoin } from '../state/sendCoin'
import { useSendFees } from '../state/sendFees'
import { useSendChainSpecific } from './SendChainSpecificProvider'

export const SendFiatFeeValue = () => {
  const [coinKey] = useCurrentSendCoin()
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

  if (isPending) return <Spinner />
  if (!price || !humanReadableFeeValue) return null

  formattedAmount = formatAmount(humanReadableFeeValue * price, fiatCurrency)
  return <>{formattedAmount}</>
}
