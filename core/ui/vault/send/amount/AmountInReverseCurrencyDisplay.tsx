import { useCoinPriceQuery } from '@core/ui/chain/coin/price/queries/useCoinPriceQuery'
import { useFiatCurrency } from '@core/ui/storage/fiatCurrency'
import { useCurrentVaultCoin } from '@core/ui/vault/state/currentVaultCoins'
import { ValueProp } from '@lib/ui/props'
import { MatchQuery } from '@lib/ui/query/components/MatchQuery'
import { Text } from '@lib/ui/text'
import { formatAmount } from '@lib/utils/formatAmount'
import { useTranslation } from 'react-i18next'

import { useSendAmount } from '../state/amount'
import { useCurrentSendCoin } from '../state/sendCoin'
import { CurrencyInputMode } from './ManageAmountInputField'

export const AmountInReverseCurrencyDisplay = ({
  value,
}: ValueProp<CurrencyInputMode>) => {
  const { t } = useTranslation()
  const [sendAmount] = useSendAmount()
  const [{ coin: coinKey }] = useCurrentSendCoin()
  const coin = useCurrentVaultCoin(coinKey)
  const fiatCurrency = useFiatCurrency()

  const priceQuery = useCoinPriceQuery({
    coin,
  })

  const renderConverted = (price: number) => {
    if (!sendAmount) return null

    return value === 'base'
      ? formatAmount(price * sendAmount, fiatCurrency)
      : formatAmount(sendAmount, coin.ticker)
  }

  return (
    <Text color="shy" size={14}>
      {!sendAmount ? null : (
        <MatchQuery
          value={priceQuery}
          success={renderConverted}
          pending={() => t('loading')}
          error={() => t('failed_to_load')}
        />
      )}
    </Text>
  )
}
