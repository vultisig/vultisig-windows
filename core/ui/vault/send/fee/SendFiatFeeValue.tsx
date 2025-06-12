import { fromChainAmount } from '@core/chain/amount/fromChainAmount'
import { chainFeeCoin } from '@core/chain/coin/chainFeeCoin'
import { getFeeAmount } from '@core/chain/tx/fee/getFeeAmount'
import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { useSendChainSpecific } from '@core/ui/vault/send/fee/SendChainSpecificProvider'
import { useCurrentSendCoin } from '@core/ui/vault/send/state/sendCoin'
import { useSendFees } from '@core/ui/vault/send/state/sendFees'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { VStack } from '@lib/ui/layout/Stack'
import { ListItem } from '@lib/ui/list/item'
import { Skeleton } from '@lib/ui/loaders/Skeleton'
import { formatAmount } from '@lib/utils/formatAmount'
import { formatTokenAmount } from '@lib/utils/formatTokenAmount'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

export const SendFiatFeeValue = () => {
  const { t } = useTranslation()
  const [{ coin: coinKey }] = useCurrentSendCoin()
  const [, setFees] = useSendFees()
  const fiatCurrency = useFiatCurrency()
  const chainSpecific = useSendChainSpecific()
  const fee = getFeeAmount(chainSpecific)
  const coin = useCurrentVaultCoin(coinKey)
  const { isPending, data: price } = useCoinPriceQuery({ coin })
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

  if (!price || !humanReadableFeeValue) return null

  formattedAmount = formatAmount(humanReadableFeeValue * price, fiatCurrency)

  return isPending ? (
    <VStack>
      <Skeleton width="88" height="12" />
      <Skeleton width="48" height="12" />
    </VStack>
  ) : (
    <ListItem
      description={formatTokenAmount(humanReadableFeeValue, coinKey.id)}
      extra={formattedAmount}
      title={t('est_network_fee')}
    />
  )
}
